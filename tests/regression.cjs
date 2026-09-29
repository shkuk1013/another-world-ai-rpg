// Deterministic game-state regression checks; run with node tests/regression.cjs.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(root+'/index.html','utf8');
class Element{
 constructor(){this.children=[];this.style={};this.dataset={};this.attrs={};this.textContent='';this._html='';this.value='';this.classes=new Set(['hidden']);this.classList={contains:k=>this.classes.has(k),add:k=>this.classes.add(k),remove:k=>this.classes.delete(k),toggle:(k,on)=>on?this.classes.add(k):this.classes.delete(k)};}
 set innerHTML(s){this._html=s;this.children=[];}get innerHTML(){return this._html;}
 appendChild(e){this.children.push(e);return e;}prepend(e){this.children.unshift(e);}remove(){}setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k]??null;}removeAttribute(k){delete this.attrs[k];}querySelector(){return new Element();}querySelectorAll(){return [];}addEventListener(){}
}
const elements={};for(const m of html.matchAll(/id="([^"]+)"/g))elements[m[1]]=new Element();
const storage=new Map(),timers=[];const context={console,Math:Object.create(Math),JSON,Number,String,Array,Object,Set,Map,Date,HTMLImageElement:Element,alert:()=>{},localStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)||null},setTimeout:fn=>{timers.push(fn)},clearTimeout:()=>{},requestAnimationFrame:fn=>fn(),...elements};
context.window=context;context.location={textContent:''};
context.document={getElementById:id=>elements[id]||(elements[id]=new Element()),createElement:()=>new Element(),querySelector:()=>new Element(),querySelectorAll:()=>[],addEventListener:()=>{},activeElement:null,body:new Element()};
vm.createContext(context);const exec=s=>vm.runInContext(s,context);
for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))exec(m[1]);
exec(fs.readFileSync(root+'/js/playability.js','utf8'));
exec(fs.readFileSync(root+'/js/resource-feedback.js','utf8'));
exec(fs.readFileSync(root+'/js/monster-art.js','utf8'));
exec(fs.readFileSync(root+'/js/bren-monsters.js','utf8'));
exec(fs.readFileSync(root+'/js/career-system.js','utf8'));
context.Math.random=()=>.9;
let tests=0;const test=(name,fn)=>{fn();tests++;console.log('PASS',name)};
const get=s=>exec(s);
test('boot renders without exceptions',()=>assert.equal(get('G.schemaVersion'),'0.5.7'));
test('registration and first quest available',()=>{exec("G.name='테스터';goVillage();move('모험가 길드');register();acceptQuest()");assert.equal(get('G.guildRank'),'F급');assert.equal(get('G.scoutQuest.status'),'accepted');assert(context.actions.children.some(b=>b.innerHTML.includes('서쪽 숲으로 출발')))});
test('safe scouting and exactly one guild reward',()=>{const before=get('G.gold');exec("move('서쪽 숲');scoutForest()");assert.equal(get('G.scoutQuest.status'),'scouted');assert.equal(get('G.gold'),before);exec("move('모험가 길드');reportScoutQuest();reportScoutQuest();acceptQuest()");assert.equal(get('G.gold'),before+30);assert.equal(get('G.scoutQuest.status'),'completed');assert.equal(get('G.guildPoints'),20)});
test('town keeps all choices including west forest',()=>{exec("move('브렌 마을')");assert(context.actions.children.length>5);assert(context.actions.children.some(b=>b.innerHTML.includes('서쪽 숲으로 간다')))});
test('dialogue varies and terminates without affection farming',()=>{exec("move('모험가 길드');talkMira()");const a=get('G.log.at(-1).text'),aff=get("G.relations['미라'].aff");exec('talkMira()');assert.notEqual(get('G.log.at(-1).text'),a);exec('talkMira();talkMira();talkMira()');assert.equal(get("G.relations['미라'].aff"),aff);assert.equal(get("dialogueExhausted('미라')"),true);exec('G.day++;talkMira()');assert.equal(get("dialogueExhausted('미라')"),false)});
test('weapon duplicate purchase blocked and old weapon kept',()=>{exec('G.gold=200;buy(WEAPONS.sword)');const gold=get('G.gold');exec('buy(WEAPONS.sword)');assert.equal(get('G.gold'),gold);exec('buy(WEAPONS.bow)');assert(get("G.equipmentInventory.some(x=>x.name===WEAPONS.sword.name)"))});
test('campfire escape route and companion story remain reachable',()=>{exec("G.location='숲속 야영지';G.flags.rienJoined=true;render()");assert(context.actions.children.some(b=>b.innerHTML.includes('모닥불')));assert(context.actions.children.some(b=>b.innerHTML.includes('브렌으로')))});
test('legacy migration preserves inventory and active scout objective',()=>{exec("var legacy=JSON.parse(JSON.stringify(G));delete legacy.scoutQuest;delete legacy.dialogueState;legacy.quest={type:'goblin'};legacy.hour=25;var upgraded=migrateState(legacy)");assert.equal(get('upgraded.scoutQuest.status'),'accepted');assert.equal(get('upgraded.hour'),1);assert.equal(get('upgraded.equipmentInventory.length'),get('G.equipmentInventory.length'))});
test('corrupted save rejected before replacing state',()=>assert.throws(()=>get("migrateState({location:'서쪽 숲'})")));
test('day rollover on travel',()=>{exec("G.hour=23;var dayBefore=G.day;move('서쪽 숲')");assert.equal(get('G.hour'),0);assert.equal(get('G.day'),get('dayBefore+1'))});
test('all current scene portrait and map paths exist',()=>{const paths=get("[...Object.values(V05_SCENES),...Object.values(V05_PORTRAITS),v05MapImage('world'),v05MapImage('bren'),v05MapImage('hunt'),ASSET.goblin,ASSET.rien]");for(const file of paths)assert(fs.existsSync(root+'/'+file),'Missing '+file)});
test('quest combat records scouting but does not pay before report',()=>{exec("G.scoutQuest={status:'accepted'};G.quest={type:'goblin'};G.flags.rienJoined=false;G.combat={type:'goblin'};var goldBefore=G.gold;victory('승리')");assert.equal(get('G.scoutQuest.status'),'scouted');assert(get('G.gold-goldBefore')<30)});
test('inn meal, sleep and free recovery change real resources',()=>{exec("G.combat=null;G.location='황금사슴 여관';G.gold=30;G.fatigue=80;G.hunger=80;G.hydration=20;v05InnMeal()");assert.equal(get('G.gold'),24);assert.equal(get('G.fatigue'),66);assert.equal(get('G.hunger'),20);exec('v05InnSleep()');assert.equal(get('G.gold'),12);assert.equal(get('G.fatigue'),0);assert.equal(get('G.hp'),get('G.maxHp'));exec("G.location='브렌 마을';G.gold=0;G.fatigue=90;G.hp=1;restAtWell()");assert.equal(get('G.gold'),0);assert.equal(get('G.hydration'),100);assert(get('G.hp')>1)});
test('shop marks owned weapon and prevents duplicate tools',()=>{exec("G.gold=100;G.tools.axe=false;buyTool('axe',14,'벌목도끼');var toolGold=G.gold;buyTool('axe',14,'벌목도끼');v05BlacksmithShop()");assert.equal(get('G.gold'),get('toolGold'));assert(context.moreActionsList.children.some(x=>x.innerHTML.includes('보유 중')||x.innerHTML.includes('장착 중')))});
test('equipment, level, proficiency, conditions affect combat',()=>{exec("G.combat={type:'goblin',def:0};G.level=1;G.fatigue=0;G.hunger=0;G.hydration=100");const low=get('attackDamage(5)');exec('G.level=8');assert(get('attackDamage(5)')>low);const strong=get('attackDamage(25)');exec('G.fatigue=100;G.hunger=100;G.hydration=0');assert(get('attackDamage(25)')<strong);exec('G.level=1;G.fatigue=0;G.hunger=0;G.hydration=100');assert(get('attackDamage(25)')>low)});
test('armor mitigates scaled enemy attack and defeat returns safely',()=>{exec("G.hp=100;G.combat={atk:15,guard:false};G.equipment.armor='옷';enemyDamage(10,'공격');var unarmored=100-G.hp;G.hp=100;G.equipment.armor={def:12};enemyDamage(10,'공격');var armored=100-G.hp");assert(get('armored<unarmored'));exec("G.hp=1;G.combat={atk:999,hp:50,maxHp:50,turn:1,intent:'강한 공격',type:'goblin'};enemyTurn()");assert.equal(get('G.combat'),null);assert.equal(get('G.location'),'브렌 마을');assert.equal(get('G.hp'),1)});
test('magic gains mastery and special skill has a cooldown',()=>{exec("G.combat={type:'goblin',hp:999,maxHp:999,atk:1,def:0,intent:'방어 자세',turn:1};G.hp=G.maxHp;G.mp=G.maxMp;G.companion=null;var fireBefore=G.fire;castSpell(0)");assert.equal(get('G.fire'),get('fireBefore+1'));exec("G.equipment.weapon={...WEAPONS.sword};specialSkill();var enemyAfter=G.combat.hp;specialSkill()");assert.equal(get('G.combat.hp'),get('enemyAfter'))});
test('saved combat reopens safely and legacy survival values migrate',()=>{exec('saveGame();G.combat=null;loadGame()');assert(get('!!G.combat'));assert(!context.combatModal.classList.contains('hidden'));exec('var oldNeeds={...G};delete oldNeeds.hunger;delete oldNeeds.hydration;var needs=migrateState(oldNeeds)');assert.equal(get('needs.hunger'),20);assert.equal(get('needs.hydration'),85)});

// v0.5.6 career-system regression checks
const resetCareer=()=>exec("G=migrateState(JSON.parse(JSON.stringify(INITIAL_STATE)));G.name='';G.aptitudeApplied=false;G.unlockedCareers=[];G.career=null");
test('all five starting aptitudes apply only their small bonus',()=>{
 const cases=[['none','G.sword',3],['sword','G.sword',5],['mana','G.manaControl',12],['outdoors','G.bow',3],['dexterity','G.dagger',4]];
 for(const [aptitude,field,expected] of cases){resetCareer();context.traitInput.value=aptitude;exec('startGame()');assert.equal(get('G.aptitude'),aptitude);assert.equal(get(field),expected);if(aptitude==='sword'){exec('startGame()');assert.equal(get(field),expected);}}
});
test('no aptitude leaves base proficiencies unchanged',()=>{resetCareer();context.traitInput.value='none';exec('startGame()');assert.equal(get('G.sword'),3);assert.equal(get('G.maxMp'),16);assert.equal(get('G.career'),null)});
test('aptitude does not block growth or another career route',()=>{
 resetCareer();context.traitInput.value='sword';exec("startGame();G.combat={type:'goblin',hp:999,maxHp:999,atk:0,def:0,intent:'방어 자세',turn:1};G.mp=G.maxMp;for(var i=0;i<5;i++)castSpell(0);checkCareerUnlocks(G,{notify:false})");
 assert(get("G.unlockedCareers.includes('apprentice_mage')"));
});
test('first careers unlock from existing proficiency values',()=>{
 resetCareer();exec("Object.assign(G,{sword:8,manaControl:12,fire:12,bow:7,dagger:7,gathering:6,alchemy:4});checkCareerUnlocks(G,{notify:false})");
 for(const key of ['apprentice_swordsman','apprentice_mage','hunter','scout','apprentice_alchemist'])assert(get(`G.unlockedCareers.includes('${key}')`),key);
});
test('career cannot be selected below requirements',()=>{resetCareer();assert.equal(get("selectCareer('swordsman')"),false);assert.equal(get('G.career'),null)});
test('unlocked career can be selected and removed voluntarily',()=>{resetCareer();exec("G.sword=8;checkCareerUnlocks(G,{notify:false})");assert.equal(get("selectCareer('apprentice_swordsman')"),true);assert.equal(get('G.career'),'apprentice_swordsman');assert.equal(get('selectCareer(null)'),true);assert.equal(get('G.career'),null)});
test('guild rank stays independent from career changes',()=>{resetCareer();exec("G.guildRank='D급';G.rank='D급';G.sword=8;checkCareerUnlocks(G,{notify:false});selectCareer('apprentice_swordsman')");assert.equal(get('G.guildRank'),'D급');assert.equal(get('G.rank'),'D급')});
test('legacy traits migrate without applying bonuses twice',()=>{
 resetCareer();exec("var legacyCareer={...G,name:'기존용사',trait:'검술경험',sword:10};delete legacyCareer.aptitude;delete legacyCareer.career;delete legacyCareer.unlockedCareers;delete legacyCareer.aptitudeApplied;var migratedCareer=migrateState(legacyCareer)");
 assert.equal(get('migratedCareer.aptitude'),'sword');assert.equal(get('migratedCareer.career'),null);assert.equal(get('migratedCareer.sword'),10);assert.equal(get('migratedCareer.aptitudeApplied'),true);
});
test('career fields survive save and load',()=>{
 resetCareer();exec("G.name='저장검사';G.sword=8;checkCareerUnlocks(G,{notify:false});selectCareer('apprentice_swordsman');saveGame();G.career=null;G.unlockedCareers=[];loadGame()");
 assert.equal(get('G.career'),'apprentice_swordsman');assert(get("G.unlockedCareers.includes('apprentice_swordsman')"));
});
test('advanced and hybrid careers use centralized data requirements',()=>{
 assert.equal(get("CAREERS.swordsman.requiresCareers[0]"),'apprentice_swordsman');
 assert.deepEqual(Array.from(get("CAREERS.spellblade.requiresCareers")),['apprentice_swordsman','apprentice_mage']);
 assert.equal(get("CAREERS.ranger.requirements.some(x=>x.skill==='bow')"),true);
});
test('career panel separates career guild rank and title',()=>{
 resetCareer();exec("G.guildRank='F급';G.activeTitle='고블린 사냥꾼';renderCareerSummary();openCareerMenu()");
 assert(context.careerSummary.innerHTML.includes('직업'));assert(context.careerSummary.innerHTML.includes('모험가 등급'));assert(context.careerCurrent.innerHTML.includes('서로 독립'));
});
test('career UI includes responsive phone and tablet layouts',()=>{
 const css=fs.readFileSync(root+'/css/career-system.css','utf8');
 assert(css.includes('@media(max-width:620px)'));assert(css.includes('@media(min-width:700px) and (max-width:1180px)'));
 assert(html.includes('id="careerSummary"'));assert(html.includes('id="careerModal"'));
});

// v0.5.7 Bren low-level monster regression checks
test('Bren adds four balanced F-rank monsters',()=>{
 assert.equal(get('Object.keys(BREN_MONSTERS).length'),4);
 assert(get("Object.values(BREN_MONSTERS).every(m=>m.rank==='F'&&m.hp[1]<=34&&m.atk[1]<=7)"));
});
test('every Bren encounter table has three valid monster candidates',()=>{
 assert(get('Object.values(BREN_ENCOUNTERS).every(table=>table.length===3&&table.every(([id,weight])=>MONSTERS[id]&&weight>0))'));
});
test('weighted Bren encounter selection is deterministic at boundaries',()=>{
 assert.equal(get("pickBrenEncounter('강변 부두',0)"),'river_frog');
 assert.equal(get("pickBrenEncounter('강변 부두',.99)"),'young_wolf');
 assert.equal(get("pickBrenEncounter('브렌 마을',.5)"),null);
});
test('diverse forest hunting appears only after the safe scout tutorial',()=>{
 resetCareer();exec("G.name='사냥꾼';G.rank='F급';G.guildRank='F급';G.location='서쪽 숲';G.scoutQuest={status:'accepted'};render()");
 assert(!context.actions.children.some(b=>b.innerHTML.includes('숲 가장자리 수색')));
 exec("G.scoutQuest={status:'completed'};render()");
 assert(context.actions.children.some(b=>b.innerHTML.includes('숲 가장자리 수색')));
});
test('new monster combat records codex kill and drops',()=>{
 resetCareer();exec("G.name='도감검사';G.rank='F급';G.guildRank='F급';startCombat('forest_slime');victory('승리')");
 assert.equal(get('G.monsterKills.forest_slime'),1);assert.equal(get('G.discoveredMonsters.forest_slime'),true);assert(get("G.materials['맑은 점액']>=1"));
});
test('new monsters reuse matching existing atlas entries',()=>{
 assert.equal(get('MONSTER_ART.forest_slime'),9);assert.equal(get('MONSTER_ART.river_frog'),12);assert.equal(get('MONSTER_ART.young_wolf'),5);assert.equal(get('MONSTER_ART.dust_bat'),3);
 resetCareer();exec("G.name='원화검사';startCombat('young_wolf')");assert.equal(context.enemyArt.dataset.monsterType,'young_wolf');
});
test('Bren drop materials use the generated item atlas and inline UI markup',()=>{
 assert.equal(get("ITEM_ART['맑은 점액'].atlas"),'bren');assert.equal(get("ITEM_ART['박쥐 가죽'].index"),2);
 assert(get("itemInlineMarkup('맑은 점액')").includes('bren-materials-v1.webp'));
 assert(get("itemInlineMarkup('없는 재료')").includes('item-fallback-icon'));
});
test('drop log, codex and crafting requirements render item icons',()=>{
 resetCareer();exec("G.name='아이콘검사';G.rank='F급';G.guildRank='F급';G.discoveredMonsters.forest_slime=true;G.monsterKills.forest_slime=5;G.combat={type:'forest_slime'};victory('승리');openCodex();renderRecipes();renderTierForgeV047()");
 assert(get("G.log.at(-1).text").includes('item-inline-icon'));assert(context.codexList.innerHTML.includes('item-inline-icon'));
 assert(context.forgeList.innerHTML.includes('item-inline-icon'));
});

test('goblin family battle art crops out baked combat HUD',()=>{
 resetCareer();exec("G.name='고블린원화검사';startCombat('goblin')");
 assert.equal(get("MONSTER_CROP.goblin.y"),394);
 assert.equal(get("MONSTER_CROP.goblin.h"),118);
 assert.equal(context.enemyArt.src,'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=');
 assert(context.enemyArt.classList.contains('monster-clean-crop'));
 assert(context.enemyArt.style.backgroundImage.includes('monsters.webp'));
});
console.log(`${tests} regression checks passed.`);
