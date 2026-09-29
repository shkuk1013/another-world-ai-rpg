const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.json':'application/json'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end('not found');}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true});
  let checks=0;
  try{
    for(const viewport of [{width:390,height:844,label:'phone'},{width:900,height:1180,label:'tablet'}]){
      const page=await browser.newPage({viewport});const errors=[];
      page.on('pageerror',error=>errors.push(String(error)));
      page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
      await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'networkidle'});
      const options=await page.locator('#traitInput option').allTextContents();
      assert.deepEqual(options,['특별한 경험은 없다','검을 다뤄본 적이 있다','마나를 쉽게 느낀다','야외 생활에 익숙하다','손재주가 좋다']);checks++;
      await page.selectOption('#traitInput','sword');await page.click('#startGameBtn');
      assert.equal(await page.evaluate(()=>G.aptitude),'sword');checks++;
      await page.evaluate(()=>{G.sword=8;checkCareerUnlocks(G,{notify:false});render();});
      await page.evaluate(()=>openCareerMenu());
      await page.locator('#careerModal:not(.hidden)').waitFor();
      const fits=await page.evaluate(()=>{
        const modal=document.querySelector('#careerModal>div'),list=document.querySelector('#careerList');
        return modal.getBoundingClientRect().right<=innerWidth+1&&modal.getBoundingClientRect().left>=-1&&list.scrollWidth<=list.clientWidth+1;
      });
      assert(fits,`${viewport.label} career modal overflow`);checks++;
      assert((await page.locator('.career-card').count())>=11);checks++;
      await page.evaluate(()=>{selectCareer('apprentice_swordsman');saveGame();G.career=null;loadGame();});
      assert.equal(await page.evaluate(()=>G.career),'apprentice_swordsman');checks++;
      assert.deepEqual(errors,[],`${viewport.label} console errors: ${errors.join(' | ')}`);checks++;
      await page.close();
    }
    console.log(`${checks} browser career checks passed (phone + tablet).`);
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
