/* v0.5.3 local draft — finite gathering nodes + visual loot feedback */
(()=>{
  const ITEM_ATLAS='assets/atlases/items.webp',ITEM_COLS=8,ITEM_ROWS=5;
  const ITEM_ATLASES={default:{src:ITEM_ATLAS,cols:ITEM_COLS,rows:ITEM_ROWS},bren:{src:'assets/atlases/bren-materials-v1.webp',cols:2,rows:2}};
  window.ITEM_ART={"달빛꽃":26,"붉은 약초":30,"푸른 약초":5,"해독초":3,"철광석":19,"구리광석":7,"은광석":31,"수정 조각":8,"마정석":22,"참나무":27,"단풍나무":23,"마력목":20,"고블린 송곳니":17,"송곳니":17,"서리 송곳니":14,"고블린 발톱":16,"고블린 가죽":18,"질긴 가죽":18,"가죽":18,"트롤 가죽":34,"짐승 고기":4,"마력 찌꺼기":21,"독낭":29,"습지 점액":33,"빙결 가죽":15,"광산 핵석":24,"청동 광편":6,"오우거 힘줄":28,"와이번 비늘":37,"바람결정":36,"정령 잎":32,"고대 수액":2,"고대 핵":1,"언데드 뼛조각":35,"저주받은 천":9,"화염석":13,"미스릴 조각":25,"용염 비늘":11,"드래곤 파편":12,"아다만티움 조각":0,"용의 심장 파편":10,"족장 금속 조각":19};
  const ITEM_ART=window.ITEM_ART;
  function atlasStyle(entry){
    const spec=typeof entry==='number'?{index:entry}:entry,atlas=ITEM_ATLASES[spec.atlas||'default'],index=spec.index,cols=atlas.cols,rows=atlas.rows;
    const c=index%cols,r=Math.floor(index/cols);
    const x=cols>1?c/(cols-1)*100:0,y=rows>1?r/(rows-1)*100:0;
    return `background-image:url("${atlas.src}");background-size:${cols*100}% ${rows*100}%;background-position:${x}% ${y}%`;
  }
  function itemArtMarkup(name,cls="loot-icon"){
    const entry=ITEM_ART[name],special=entry&&typeof entry==='object'&&entry.atlas!=='default'?` item-atlas-${entry.atlas}`:'';
    return entry===undefined?`<span class="${cls} item-fallback-icon" aria-hidden="true">✦</span>`:`<span class="${cls} item-atlas-icon${special}" aria-hidden="true" style='${atlasStyle(entry)}'></span>`;
  }
  window.itemInlineMarkup=(name,cls='item-inline-icon')=>itemArtMarkup(name,cls);
  const RARITY_KO={common:"일반",rare:"희귀",epic:"영웅",legend:"전설"};
  const lootQueue=[];
  let lootBusy=false;

  function ensureLootLayer(){
    let layer=document.getElementById("lootToastLayer");
    if(layer)return layer;
    layer=document.createElement("div");
    layer.id="lootToastLayer";
    layer.className="loot-toast-layer";
    layer.setAttribute("aria-live","polite");
    layer.setAttribute("aria-atomic","true");
    document.body.appendChild(layer);
    return layer;
  }

  function rarityFor(name){
    if(/달빛꽃|은광석|수정 조각|마정석|마력목|고대|미스릴|용염|바람결정|족장/.test(name))return "rare";
    return "common";
  }

  function nextLootToast(){
    if(lootBusy||!lootQueue.length)return;
    lootBusy=true;
    const {name,qty,rarity,note}=lootQueue.shift();
    const layer=ensureLootLayer(),card=document.createElement("div");
    card.className=`loot-toast-card rarity-${rarity}`;
    card.innerHTML=`<div class="loot-glow"></div>
      <div class="loot-icon-wrap">${itemArtMarkup(name)}</div>
      <div class="loot-copy"><span>${note||"획득"}</span><b>${name}</b><strong>×${qty}</strong><small>${RARITY_KO[rarity]||"재료"}</small></div>`;
    layer.appendChild(card);
    requestAnimationFrame(()=>card.classList.add("show"));
    setTimeout(()=>card.classList.add("leave"),1200);
    setTimeout(()=>{card.remove();lootBusy=false;nextLootToast();},1650);
  }

  window.showLootToast=function(name,qty=1,rarity=rarityFor(name),note="획득"){
    if(!name||qty<=0)return;
    lootQueue.push({name,qty,rarity,note});
    nextLootToast();
  };

  /* Every successful material gain receives a short visual reward card. */
  const baseAddMaterial=window.addMaterial;
  window.addMaterial=function(name,n=1){
    const before=Number(G.materials?.[name]||0);
    const result=baseAddMaterial(name,n);
    const gained=Math.max(0,Number(result||0)-before);
    if(gained)showLootToast(name,gained,rarityFor(name),"재료 획득");
    return result;
  };

  if(typeof window.addConsumable==="function"){
    const baseAddConsumable=window.addConsumable;
    window.addConsumable=function(name,n=1){
      const before=Number(G.consumables?.[name]||0);
      const result=baseAddConsumable(name,n);
      const gained=Math.max(0,Number(result||0)-before);
      if(gained)showLootToast(name,gained,"common","아이템 획득");
      return result;
    };
  }

  /* Material nodes are intentionally finite per in-game day.
     Farming remains possible, but not by zero-cost button spam. */
  const NODE_LIMITS={
    gather:3,"rare-gather":1,
    mining:4,"rare-mining":1,
    logging:3,"rare-logging":1,
    explore:2,"small-hunt":2
  };
  function ensureResourceState(){
    G.resourceNodes=G.resourceNodes||{};
    if(G.resourceNodeDay!==G.day){
      G.resourceNodeDay=G.day;
      G.resourceNodes={};
    }
  }
  function nodeKey(kind,place=G.location){return `${place}::${kind}`;}
  function nodeRemaining(kind,place=G.location){
    ensureResourceState();
    const key=nodeKey(kind,place),limit=NODE_LIMITS[kind]??2;
    if(!Number.isFinite(G.resourceNodes[key]))G.resourceNodes[key]=limit;
    return Math.max(0,G.resourceNodes[key]);
  }
  function consumeNode(kind,place=G.location){
    const left=nodeRemaining(kind,place);
    if(left<=0){
      add("system",`<b>${place}</b>에서는 오늘 더 찾아낼 만한 자원이 보이지 않는다.<br><span class="small">하루가 지나면 주변 환경과 흔적이 다시 달라진다.</span>`);
      return false;
    }
    G.resourceNodes[nodeKey(kind,place)]=left-1;
    return true;
  }
  function spendAction(hours,fatigue){
    if(typeof advanceTime==="function")advanceTime(hours);
    else {G.hour=(G.hour+hours)%24;}
    G.fatigue=Math.min(100,G.fatigue+fatigue);
    if(typeof updateSurvival==="function")updateSurvival();
  }
  function remainingText(kind,place=G.location){
    return `오늘 남은 기회 ${nodeRemaining(kind,place)}/${NODE_LIMITS[kind]??2}`;
  }
  function discoveryMiss(text,kind){
    add("system",`${text}<br><span class="small">${remainingText(kind)}</span>`);
  }

  window.doGathering=function(){
    if(G.combat||!consumeNode("gather"))return;
    spendAction(1,4);
    G.gathering++;
    if(Math.random()<Math.max(.05,.15-G.gathering/300)){
      return discoveryMiss("풀숲을 꼼꼼히 살폈지만 쓸 만한 약초는 이미 누군가 채집해 간 뒤였다.","gather");
    }
    const bonus=G.tools.gatherKnife?1:0;
    const table=["붉은 약초","붉은 약초","푸른 약초","해독초"];
    const found=table[Math.floor(Math.random()*table.length)];
    const qty=1+bonus+(Math.random()<Math.min(.35,G.gathering/55)?1:0);
    addMaterial(found,qty);
    add("system",`잎의 모양과 향을 확인해 <b>${found} ${qty}개</b>를 채집했다.${G.tools.gatherKnife?" 채집칼 덕분에 뿌리를 상하지 않고 꺼냈다.":""}<br><span class="small">${remainingText("gather")}</span>`);
    setTimeout(()=>maybeEvent("forest"),60);
  };

  window.rareGathering=function(){
    if(G.combat||!consumeNode("rare-gather"))return;
    spendAction(2,7);
    const chance=Math.min(.65,.08+G.gathering/100+(G.tools.gatherKnife?.08:0));
    if(Math.random()<chance){
      addMaterial("달빛꽃",1);G.gathering+=2;
      add("system",`그늘진 돌 틈에서 희미한 푸른빛이 번졌다. <b>달빛꽃</b>을 발견했다.<br><span class="small">${remainingText("rare-gather")}</span>`);
    }else{
      G.gathering++;
      discoveryMiss("오래 흔적을 좇았지만 오늘은 희귀 약초 군락을 찾지 못했다. 지형을 익힌 경험은 남았다.","rare-gather");
    }
    setTimeout(()=>maybeEvent("forest"),60);
  };

  window.doLogging=function(){
    if(G.combat)return;
    if(!G.tools.axe)return add("system","제대로 벌목하려면 <b>벌목도끼</b>가 필요하다.");
    if(!consumeNode("logging"))return;
    spendAction(1,6);G.logging++;
    if(Math.random()<.1)return discoveryMiss("베어도 되는 나무를 고르다 보니 속이 썩은 고목뿐이었다. 오늘은 목재를 챙기지 못했다.","logging");
    const found=Math.random()<.25?"단풍나무":"참나무";
    const qty=1+(Math.random()<Math.min(.35,G.logging/45)?1:0);
    addMaterial(found,qty);
    let extra="";
    if(Math.random()<.32){addMaterial("숯가루",1);extra=" 부서진 탄화목에서 숯가루도 챙겼다.";}
    add("system",`결과 단단한 부분만 골라 <b>${found} ${qty}개</b>를 얻었다.${extra}<br><span class="small">${remainingText("logging")}</span>`);
    setTimeout(()=>maybeEvent("logging"),60);
  };

  window.rareLogging=function(){
    if(G.combat)return;
    if(!G.tools.axe)return add("system","벌목도끼가 필요하다.");
    if(!consumeNode("rare-logging"))return;
    spendAction(2,9);
    const chance=Math.min(.6,.06+G.logging/90);
    if(Math.random()<chance){
      addMaterial("마력목",1);G.logging+=2;
      add("system",`도끼날이 닿은 결 사이로 옅은 마나가 번진다. <b>마력목</b>을 얻었다.<br><span class="small">${remainingText("rare-logging")}</span>`);
    }else{G.logging++;discoveryMiss("오래된 나무의 결을 살폈지만 마력이 응축된 목재는 보이지 않았다.","rare-logging");}
    setTimeout(()=>maybeEvent("logging"),60);
  };

  window.doMining=function(){
    if(G.combat)return;
    if(!G.tools.pickaxe)return add("system","광맥을 캐려면 <b>곡괭이</b>가 필요하다.");
    if(!consumeNode("mining"))return;
    spendAction(1,7);G.mining++;
    if(Math.random()<.12)return discoveryMiss("몇 번 내려쳤지만 겉돌만 떨어져 나왔다. 쓸 만한 광맥은 아니었다.","mining");
    const r=Math.random(),found=r<.4?"철광석":r<.68?"구리광석":r<.88?"석탄":"점토";
    const qty=1+(Math.random()<Math.min(.35,G.mining/50)?1:0);
    addMaterial(found,qty);
    add("system",`암벽의 색이 다른 층을 따라 쪼개 <b>${found} ${qty}개</b>를 캐냈다.<br><span class="small">${remainingText("mining")}</span>`);
    setTimeout(()=>maybeEvent("quarry"),60);
  };

  window.rareMining=function(){
    if(G.combat)return;
    if(!G.tools.pickaxe)return add("system","곡괭이가 필요하다.");
    if(!consumeNode("rare-mining"))return;
    spendAction(2,10);
    const chance=Math.min(.6,.06+G.mining/90);
    if(Math.random()<chance){
      const roll=Math.random(),found=roll<.55?"은광석":roll<.84?"수정 조각":"마정석";
      addMaterial(found,1);G.mining+=2;
      add("system",`평범한 암석 아래에서 빛이 비쳤다. <b>${found}</b>을 발견했다.<br><span class="small">${remainingText("rare-mining")}</span>`);
    }else{G.mining++;discoveryMiss("깊은 층까지 확인했지만 오늘은 희귀 광맥을 찾지 못했다.","rare-mining");}
    setTimeout(()=>maybeEvent("quarry"),60);
  };

  window.huntSmallGame=function(){
    if(G.combat||!consumeNode("small-hunt"))return;
    spendAction(2,5);
    const success=Math.min(.8,.42+G.bow/100);
    if(Math.random()<success){
      addMaterial("짐승 고기",1);
      if(Math.random()<.7)addMaterial("가죽",1);
      if(Math.random()<.25)addMaterial("송곳니",1);
      G.bow++;
      add("system",`발자국을 따라가 작은 짐승을 사냥했다. 먹을 수 있는 고기와 부산물을 챙겼다.<br><span class="small">${remainingText("small-hunt")}</span>`);
    }else discoveryMiss("사냥감이 먼저 인기척을 알아채고 덤불 너머로 사라졌다.","small-hunt");
    setTimeout(()=>maybeEvent("forest"),60);
  };

  window.genericGather=function(name){
    if(G.combat)return;
    const miningArea=["청동 협곡","고대 수로","붉은 화산로"].includes(name)||/광산|채석|협곡|수로/.test(name);
    const kind=miningArea?"mining":"gather";
    if(miningArea&&!G.tools.pickaxe)return add("system","이곳을 제대로 조사하려면 <b>곡괭이</b>가 필요하다.");
    if(!consumeNode(kind,name))return;
    spendAction(1,miningArea?7:4);
    const special={
      "안개 습지":[["해독초",.55],["습지 점액",.45]],
      "은빛 호수":[["달빛꽃",.4],["수정 조각",.6]],
      "청동 협곡":[["청동 광편",.7],["철광석",.3]],
      "바람절벽":[["달빛꽃",.25],["푸른 약초",.75]],
      "달그림자 숲":[["고대 수액",.35],["정령 잎",.65]],
      "고대 수로":[["마정석",.3],["수정 조각",.7]],
      "검은 늪":[["저주받은 천",.5],["해독초",.5]],
      "붉은 화산로":[["미스릴 조각",.28],["화염석",.72]]
    };
    if(Math.random()<.12)return discoveryMiss(`${name}을 살폈지만 눈에 띄는 자원은 찾지 못했다.`,kind);
    let pick;
    if(special[name]){
      const [a,b]=special[name];pick=Math.random()<a[1]?a[0]:b[0];
    }else if(miningArea){
      pick=Math.random()<.62?"철광석":"구리광석";
    }else{
      pick=Math.random()<.55?"붉은 약초":"푸른 약초";
    }
    addMaterial(pick,1);
    if(miningArea)G.mining+=2;else G.gathering+=2;
    add("system",`${name}의 지형을 살펴 <b>${pick}</b>을 찾아냈다.<br><span class="small">${remainingText(kind,name)}</span>`);
  };

  /* Exploration no longer prints free gold on every press.
     Finds become inventory objects which must be sold or used. */
  Object.assign(MARKET_PRICES,{
    "낡은 동전":4,"잡동사니":3,
    "고블린 송곳니":5,"고블린 발톱":4,"고블린 가죽":6,"질긴 가죽":7
  });
  window.genericExplore=function(name){
    if(G.combat||!consumeNode("explore",name))return;
    spendAction(1,2);
    const p=LOCATIONS[name]||{},roll=Math.random();
    if(name==="옛 왕도길"){
      if(roll<.38){const q=1+Math.floor(Math.random()*3);addMaterial("낡은 동전",q);add("system",`무너진 검문소 틈에서 <b>낡은 동전 ${q}개</b>를 발견했다.`);}
      else if(roll<.72){addMaterial("가죽",1);add("system","버려진 짐 꾸러미에서 아직 쓸 만한 가죽을 챙겼다.");}
      else add("system","길가의 발자국과 수레바퀴 흔적만 확인했다. 당장 가져갈 물건은 없었다.");
    }else if(name==="버려진 감시탑"){
      if(roll<.4){addMaterial("수정 조각",1);add("system","탑 꼭대기 낡은 상자에서 수정 조각을 발견했다.");}
      else {G.rep++;add("system","몬스터 이동 방향을 기록했다. 길드에서 참고할 만한 정보다.");}
    }else if(name==="안개 습지"){
      if(roll<.45){addMaterial("해독초",2);add("system","습지 가장자리에서 해독초 두 포기를 찾아냈다.");}
      else add("system","안개 속에서 오래 헤맸지만 오늘은 쓸 만한 것을 발견하지 못했다.");
    }else if(name==="북부 숲길"||name==="서리 언덕"){
      if(roll<.45){addMaterial("서리 송곳니",1);add("system","눈 위에 남은 털과 부러진 송곳니를 발견했다.");}
      else add("system","북부 짐승의 오래된 발자국만 확인했다.");
    }else if(name==="달그림자 숲"){
      if(roll<.35){addMaterial("정령 잎",2);add("system","희미한 빛을 내는 정령 잎을 발견했다.");}
      else add("system","노랫소리 같은 바람을 따라갔지만 흔적은 사라졌다.");
    }else if(name==="붉은 화산로"){
      if(roll<.3){addMaterial("미스릴 조각",1);add("system","식은 용암 틈에서 금속성 광택을 띠는 미스릴 조각을 발견했다.");}
      else add("system","열기 때문에 더 깊이 조사하지 못하고 돌아섰다.");
    }else if(name==="용의 계곡"){
      if(!G.bossUnlocks?.ancient_dragon&&G.level>=12&&G.rep>=18&&roll<.45){
        unlockBossRoute("ancient_dragon","계곡 깊은 곳의 거대한 발자국");
        add("system","바위를 통째로 눌러 부순 듯한 발자국을 발견했다. 고대 적룡의 흔적이다.");
      }else add("system","하늘을 가리는 거대한 그림자가 멀리 지나갔다.");
    }else{
      if(roll<.28)add("system",`${p.desc||"주변을 둘러봤다"} 특별한 발견 없이 흔적만 확인했다.`);
      else{
        const found=Math.random()<.45?"낡은 동전":"잡동사니",qty=found==="낡은 동전"?1+Math.floor(Math.random()*2):1;
        addMaterial(found,qty);
        add("system",`${p.desc||"주변을 둘러봤다"} 버려진 흔적 사이에서 <b>${found}${qty>1?` ${qty}개`:""}</b>를 발견했다.`);
      }
    }
    add("system",`<span class="small">${remainingText("explore",name)}</span>`);
  };

  /* Make goblin trophies feel like actual monster materials. */
  for(const id of ["goblin","mana_goblin"]){
    const m=MONSTERS?.[id];if(!m)continue;
    const hide=m.drops.find(d=>d.name==="질긴 가죽");
    if(hide)hide.name="고블린 가죽";
    if(!m.drops.some(d=>d.name==="고블린 발톱"))m.drops.splice(1,0,{name:"고블린 발톱",chance:.35,qty:[1,1],rarity:"common"});
  }

  if(typeof window.rollDrops==="function"){
    const baseRollDrops=window.rollDrops;
    window.rollDrops=function(type){
      const out=baseRollDrops(type);
      for(const d of out){
        if(/단검|장검|대검|톱니검|활|장궁|지팡이|중갑|로브|갑옷/.test(d.name)){
          showLootToast(d.name,d.qty,d.rarity||"rare","장비 획득");
        }
      }
      return out;
    };
  }

  function buttonKind(text){
    if(/희귀.*약초|희귀 약초/.test(text))return "rare-gather";
    if(/희귀.*광맥|희귀 광석/.test(text))return "rare-mining";
    if(/희귀.*목재|마력목/.test(text))return "rare-logging";
    if(/작은 짐승|소형 사냥/.test(text))return "small-hunt";
    if(/채광|광맥/.test(text))return "mining";
    if(/벌목/.test(text))return "logging";
    if(/재료 채집/.test(text)){
      return /광산|채석|협곡|수로/.test(G.location) ? "mining" : "gather";
    }
    if(/채집|수집/.test(text))return "gather";
    if(/주변.*탐색|탐색한다|둘러본다/.test(text))return "explore";
    return null;
  }
  function miniAtlasIcon(name){
    const entry=ITEM_ART[name];if(entry===undefined)return null;
    const el=document.createElement("span");el.className="material-mini-icon item-atlas-icon";
    if(typeof entry==='object'&&entry.atlas!=='default')el.classList.add(`item-atlas-${entry.atlas}`);
    el.setAttribute("aria-hidden","true");el.style.cssText=atlasStyle(entry);
    return el;
  }
  function decorateMaterialList(){
    const box=document.getElementById("materialsBox");if(!box)return;
    for(const row of box.querySelectorAll(".material")){
      const label=row.querySelector("span");if(!label||label.querySelector(".material-mini-icon"))continue;
      const name=(label.textContent||"").trim(),icon=miniAtlasIcon(name);if(icon)label.prepend(icon);
    }
  }
  function decorateMarket(){
    const box=document.getElementById("marketList");if(!box)return;
    for(const row of box.querySelectorAll(".market-row")){
      const label=row.querySelector("span");if(!label||label.querySelector(".material-mini-icon"))continue;
      const raw=(label.textContent||"").trim(),name=raw.split(" × ")[0],icon=miniAtlasIcon(name);if(icon)label.prepend(icon);
    }
  }

  function applyResourceButtonState(){
    const root=document.getElementById("actions");if(!root)return;
    for(const b of root.querySelectorAll("button")){
      const kind=buttonKind(b.textContent||"");if(!kind)continue;
      const left=nodeRemaining(kind,G.location);
      b.dataset.resourceLeft=left;
      if(left<=0){
        b.disabled=true;
        let sub=b.querySelector(".choice-sub");
        if(!sub){sub=document.createElement("span");sub.className="choice-sub";b.appendChild(sub);}
        sub.textContent="오늘 이 지역에서 얻을 수 있는 자원을 모두 확인했다";
      }
    }
  }

  if(typeof window.render==="function"){
    const baseRender=window.render;
    window.render=function(){
      const out=baseRender.apply(this,arguments);
      applyResourceButtonState();
      decorateMaterialList();
      return out;
    };
  }

  if(typeof window.openMarket==="function"){
    const baseOpenMarket=window.openMarket;
    window.openMarket=function(){const out=baseOpenMarket.apply(this,arguments);decorateMarket();return out;};
  }
  if(typeof window.openPotionMarket==="function"){
    const baseOpenPotionMarket=window.openPotionMarket;
    window.openPotionMarket=function(){const out=baseOpenPotionMarket.apply(this,arguments);decorateMarket();return out;};
  }

  window.resourceNodeRemaining=nodeRemaining;
  window.consumeResourceNode=consumeNode;
  ensureResourceState();
  applyResourceButtonState();
})();
