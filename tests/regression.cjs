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
exec(fs.readFileSync(root+'/js/guild-quests.js','utf8'));
exec(fs.readFileSync(root+'/js/equipment-ui.js','utf8'));
exec(fs.readFileSync(root+'/js/ui-polish.js','utf8'));
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
test('shop marks owned weapon and prevents duplicate tools',()=>{exec("G.gold=100;G.tools.axe=false;buyTool('axe',14,'벌목도끼');var toolGold=G.gold;buyTool('axe',14,'벌목도끼');openBlacksmithShop('weapon')");assert.equal(get('G.gold'),get('toolGold'));assert(context.blacksmithShopList.innerHTML.includes('보유 중')||context.blacksmithShopList.innerHTML.includes('장착 중')||context.blacksmithShopList.innerHTML.includes('구매'))});
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

test('F-rank board exposes a large request pool and five daily postings',()=>{
 resetCareer();exec("G.name='의뢰검사';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'completed'};G.day=3;G.guildBoard={day:0,ids:[]};ensureGuildQuestState()");
 assert(Object.keys(get('F_RANK_QUESTS')).length>=15);
 assert.equal(get('G.guildBoard.ids.length'),5);
 assert(get("new Set(G.guildBoard.ids.map(id=>F_RANK_QUESTS[id].type)).size")>=2);
});
test('F-rank board stays locked until the first safe scout is completed',()=>{
 resetCareer();exec("G.name='잠금검사';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'accepted'};G.guildBoard={day:G.day,ids:['herb_red']};ensureGuildQuestState()");
 assert.equal(get("acceptGuildQuest('herb_red')"),false);
 exec("G.scoutQuest.status='completed'");
 assert.equal(get("acceptGuildQuest('herb_red')"),true);
});
test('at most three F-rank requests can be active at once',()=>{
 resetCareer();exec("G.name='세건검사';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'completed'};G.guildBoard={day:G.day,ids:['herb_red','herb_blue','clear_slime','frog_hide','coal_supply']};ensureGuildQuestState()");
 assert.equal(get("acceptGuildQuest('herb_red')"),true);assert.equal(get("acceptGuildQuest('herb_blue')"),true);assert.equal(get("acceptGuildQuest('clear_slime')"),true);
 assert.equal(get("acceptGuildQuest('frog_hide')"),false);assert.equal(get('G.guildRequests.length'),3);
});
test('collection request consumes materials and pays exactly once at guild',()=>{
 resetCareer();exec("G.name='납품검사';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'completed'};G.location='모험가 길드';G.guildBoard={day:G.day,ids:['herb_red']};G.materials['붉은 약초']=3;ensureGuildQuestState();acceptGuildQuest('herb_red');var beforeGold=G.gold;var beforeGp=G.guildPoints||0");
 assert.equal(get("turnInGuildQuest('herb_red')"),true);
 assert.equal(get("G.materials['붉은 약초']"),0);assert.equal(get('G.gold'),get('beforeGold+14'));assert.equal(get('G.guildPoints'),get('beforeGp+3'));
 assert.equal(get("turnInGuildQuest('herb_red')"),false);
});
test('hunt request counts only kills made after accepting it',()=>{
 resetCareer();exec("G.name='사냥검사';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'completed'};G.location='모험가 길드';G.monsterKills.forest_slime=5;G.guildBoard={day:G.day,ids:['hunt_slime']};ensureGuildQuestState();acceptGuildQuest('hunt_slime')");
 assert.equal(get("guildQuestProgress(G.guildRequests[0])"),0);
 exec("G.monsterKills.forest_slime+=2");
 assert.equal(get("guildQuestProgress(G.guildRequests[0])"),2);assert.equal(get("guildQuestComplete(G.guildRequests[0])"),true);
});
test('daily board refresh keeps accepted requests and rotates postings',()=>{
 resetCareer();exec("G.name='갱신검사';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'completed'};G.day=4;G.guildBoard={day:0,ids:[]};ensureGuildQuestState();var day4=G.guildBoard.ids.join(',');acceptGuildQuest(G.guildBoard.ids[0]);var active=G.guildRequests[0].id;G.day=5;ensureGuildQuestState();var day5=G.guildBoard.ids.join(',')");
 assert.equal(get('G.guildRequests[0].id'),get('active'));assert.notEqual(get('day4'),get('day5'));assert.equal(get('G.guildBoard.ids.length'),5);
});

test('completed request cannot be farmed again on the same day',()=>{
 resetCareer();exec("G.name='반복방지';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'completed'};G.location='모험가 길드';G.guildBoard={day:G.day,ids:['herb_red']};G.materials['붉은 약초']=6;ensureGuildQuestState();acceptGuildQuest('herb_red');turnInGuildQuest('herb_red')");
 assert.equal(get("acceptGuildQuest('herb_red')"),false);
 assert.equal(get("G.materials['붉은 약초']"),3);
});

test('F-rank requests point players to valid destination regions',()=>{
 assert(get("Object.values(F_RANK_QUESTS).every(q=>q.place&&LOCATIONS[q.place])"));
 assert(get("Object.values(F_RANK_QUESTS).filter(q=>q.type==='collect').every(q=>q.method)"));
});
test('F-rank hunt targets actually spawn in their recommended regions',()=>{
 assert(get("Object.values(F_RANK_QUESTS).filter(q=>q.type==='hunt').every(q=>BREN_ENCOUNTERS[q.place]?.some(([id])=>id===q.target))"));
});
test('guild request cards show destination method and map guidance',()=>{
 resetCareer();exec("G.name='길찾기검사';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'completed'};G.guildBoard={day:G.day,ids:['bat_hide','hunt_bat']};ensureGuildQuestState();renderGuildQuestBoard()");
 const board=get("document.getElementById('guildQuestAvailable').innerHTML");
 assert(board.includes('권장 획득 지역'));assert(board.includes('북쪽 채석장'));assert(board.includes('먼지날개 박쥐 처치'));assert(board.includes('지도 ›'));assert(board.includes('상세 보기'));
});
test('accepted guild request can navigate directly to its destination',()=>{
 resetCareer();exec("G.name='이동검사';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'completed'};G.location='모험가 길드';G.guildBoard={day:G.day,ids:['hunt_bat']};ensureGuildQuestState();acceptGuildQuest('hunt_bat');var oldTravelTo=travelTo;var questNavPlace='';travelTo=(p)=>{questNavPlace=p};goToGuildQuestPlace('hunt_bat');travelTo=oldTravelTo");
 assert.equal(get('questNavPlace'),'북쪽 채석장');
});

test('guild board uses active and available tabs with compact cards',()=>{
 resetCareer();exec("G.name='UI검사';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'completed'};G.guildBoard={day:G.day,ids:['herb_red','hunt_bat']};ensureGuildQuestState();renderGuildQuestBoard();setGuildQuestTab('available')");
 assert(get("document.getElementById('guildQuestPanelAvailable').classList.contains('active')"));
 assert(!get("document.getElementById('guildQuestPanelActive').classList.contains('active')"));
 const board=get("document.getElementById('guildQuestAvailable').innerHTML");
 assert(board.includes('guild-quest-place-link'));assert(board.includes('상세 보기'));assert(board.includes('의뢰 수락'));
});
test('completed active request gets a clear completion state and one report action',()=>{
 resetCareer();exec("G.name='완료UI';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'completed'};G.location='모험가 길드';G.guildBoard={day:G.day,ids:['herb_red']};G.materials['붉은 약초']=5;ensureGuildQuestState();acceptGuildQuest('herb_red');renderGuildQuestBoard()");
 const activeHtml=get("document.getElementById('guildQuestActive').innerHTML");
 assert(activeHtml.includes('완료 가능'));assert(activeHtml.includes('완료 보고'));assert(!activeHtml.includes('해당 지역으로 이동'));
});
test('visit request progress updates when using map-style travelTo navigation',()=>{
 resetCareer();exec("G.name='방문검사';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'completed'};G.location='모험가 길드';G.guildBoard={day:G.day,ids:['visit_farm']};ensureGuildQuestState();acceptGuildQuest('visit_farm');travelTo('남쪽 농장')");
 assert.equal(get("guildQuestProgress(G.guildRequests[0])"),1);
 assert.equal(get("guildQuestComplete(G.guildRequests[0])"),true);
});
test('guild quest CSS includes mobile compact board and local quest banner',()=>{
 const css=fs.readFileSync(root+'/css/guild-quests.css','utf8');
 assert(css.includes('.guild-board-tabs'));assert(css.includes('.guild-local-quest-banner'));assert(css.includes('@media(max-width:700px)'));
});

test('F-rank request quantities are tuned for short early loops',()=>{
 assert.equal(get("F_RANK_QUESTS.herb_red.qty"),3);
 assert.equal(get("F_RANK_QUESTS.herb_blue.qty"),2);
 assert.equal(get("F_RANK_QUESTS.coal_supply.qty"),2);
 assert.equal(get("F_RANK_QUESTS.clay_supply.qty"),1);
 assert.equal(get("F_RANK_QUESTS.hunt_slime.qty"),2);
 assert.equal(get("F_RANK_QUESTS.hunt_bat.qty"),2);
});
test('tracked guild hunt targets the active quest monster at 75 percent roll',()=>{
 resetCareer();exec("G.name='추적검사';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'completed'};G.location='북쪽 채석장';G.guildBoard={day:G.day,ids:['hunt_bat']};ensureGuildQuestState();acceptGuildQuest('hunt_bat');var savedStartCombat=startCombat;var trackedType='';startCombat=(t)=>{trackedType=t};Math.random=()=>.1;startTrackedGuildHunt();startCombat=savedStartCombat;Math.random=()=>.9");
 assert.equal(get('trackedType'),'dust_bat');
});
test('F-rank field kills give low guild contribution compared with quests',()=>{
 resetCareer();exec("G.name='공헌검사';G.rank='F급';G.guildRank='F급';G.scoutQuest={status:'completed'};var gpBefore=G.guildPoints||0;startCombat('forest_slime');victory('승리');var gpGain=(G.guildPoints||0)-gpBefore");
 assert.equal(get('gpGain'),1);
});
test('E-rank promotion requires five F-rank requests and 60 contribution',()=>{
 resetCareer();exec("G.name='승급검사';G.rank='F급';G.guildRank='F급';G.level=3;G.rep=3;G.guildPoints=60;G.guildQuestStats={completed:4};promoteGuild()");
 assert.equal(get('G.guildRank'),'F급');
 exec("G.guildQuestStats.completed=5;promoteGuild()");
 assert.equal(get('G.guildRank'),'E급');
 assert.equal(get("GUILD_RANKS.find(x=>x.rank==='E급').needPoints"),60);
 assert.equal(get("GUILD_RANKS.find(x=>x.rank==='E급').needQuests"),5);
});
test('quarry mining odds keep coal and clay in meaningful F-rank ranges',()=>{
 const src=fs.readFileSync(root+'/js/resource-feedback.js','utf8');
 assert(src.includes('r<.4?"철광석":r<.68?"구리광석":r<.88?"석탄":"점토"'));
});

test('HUD visibility CSS keeps HP red and stat bars readable',()=>{
 const css=fs.readFileSync(root+'/css/hud-visibility.css','utf8');
 assert(css.includes('nth-child(1) .mini-bar i'));
 assert(css.includes('#ef3d4c'));
 assert(css.includes('height:11px'));
 assert(css.includes('font-size:12px'));
 assert(css.includes('@media(max-width:620px)'));
 assert(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'));
});
test('HUD visibility stylesheet loads after the guild UI styles',()=>{
 const html=fs.readFileSync(root+'/index.html','utf8');
 const guild=html.indexOf('css/guild-quests.css');
 const hud=html.indexOf('css/hud-visibility.css?v=0.5.8-hud1');
 assert(guild>=0&&hud>guild);
});

test('fantasy icon atlas is wired to all eight generated UI roles',()=>{
 const css=fs.readFileSync(root+'/css/fantasy-ui-icons.css','utf8');
 assert(fs.existsSync(root+'/assets/ui/ui-nav-icons.webp'));
 for(const name of ['quest','bag','map','character','guild','forge','inn','magic'])assert(css.includes('.icon-'+name));
});
test('mobile navigation uses generated fantasy icons instead of emoji-only buttons',()=>{
 const js=fs.readFileSync(root+'/js/mobile-ui.js','utf8');
 assert(js.includes('mobile-nav-icon fantasy-ui-icon icon-quest'));
 assert(js.includes('mobile-nav-icon fantasy-ui-icon icon-bag'));
 assert(js.includes('mobile-nav-icon fantasy-ui-icon icon-map'));
 assert(js.includes('mobile-nav-icon fantasy-ui-icon icon-character'));
 assert(js.includes('mobile-nav-icon fantasy-ui-icon icon-magic'));
 assert(js.includes('decorateFantasyActions'));
 assert(js.includes('icon-forge'));
 assert(js.includes('icon-inn'));
 assert(js.includes('icon-guild'));
});
test('fantasy icon stylesheet and refreshed mobile UI load after core styles',()=>{
 const html=fs.readFileSync(root+'/index.html','utf8');
 const hud=html.indexOf('css/hud-visibility.css');
 const icons=html.indexOf('css/fantasy-ui-icons.css?v=0.5.8-icons1');
 assert(hud>=0&&icons>hud);
 assert(html.includes('js/mobile-ui.js?v=0.5.9-toggle1'));
});

test('blacksmith sells four starter armors without replacing crafted tiers',()=>{
 assert.equal(get('blacksmithArmorShop.length'),4);
 assert.deepEqual(Array.from(get('blacksmithArmorShop.map(x=>x.def)')),[1,2,3,4]);
 assert(get("GEAR_TIERS_V047.armor.some(x=>x.name==='철제 흉갑'&&x.def===8)"));
});
test('buying armor stores it before equipping and blocks duplicates',()=>{
 resetCareer();exec("G.gold=100;G.location='대장간';ensureEquipmentState?.();var oldArmor=G.equipment.armor.name;buyBlacksmithGear('armor',1);var afterBuyArmor=G.equipment.armor.name;var goldAfter=G.gold;buyBlacksmithGear('armor',1)");
 assert.equal(get('afterBuyArmor'),get('oldArmor'));
 assert(get("G.equipmentInventory.some(x=>x.name==='가죽 조끼')"));
 assert.equal(get('G.gold'),get('goldAfter'));
});
test('equipment manager changes armor and marks the inventory item equipped',()=>{
 resetCareer();exec("G.gold=100;buyBlacksmithGear('armor',1);var item=G.equipmentInventory.find(x=>x.name==='가죽 조끼');equipInventoryItem(item.uid);renderEquipmentManager()");
 assert.equal(get('G.equipment.armor.name'),'가죽 조끼');
 assert.equal(get('G.equipment.armor.def'),2);
 assert(context.equipmentManagerList.innerHTML.includes('장착 중'));
});
test('equipping new gear preserves the previously equipped item in inventory',()=>{
 resetCareer();exec("G.gold=200;buyBlacksmithGear('armor',0);buyBlacksmithGear('armor',1);var first=G.equipmentInventory.find(x=>x.name==='두꺼운 여행복');var second=G.equipmentInventory.find(x=>x.name==='가죽 조끼');equipInventoryItem(first.uid);equipInventoryItem(second.uid)");
 assert(get("G.equipmentInventory.some(x=>x.name==='두꺼운 여행복')"));
 assert.equal(get('G.equipment.armor.name'),'가죽 조끼');
});
test('equipment UI exposes equip buttons and equipped status in inventory',()=>{
 resetCareer();exec("G.gold=100;buyBlacksmithGear('armor',1);render()");
 assert(context.equipmentInvBox.innerHTML.includes('장착'));
 exec("var it=G.equipmentInventory.find(x=>x.name==='가죽 조끼');equipInventoryItem(it.uid);render()");
 assert(context.equipmentInvBox.innerHTML.includes('✅ 장착 중'));
 assert(context.equip.innerHTML.includes('방어 2'));
});

test('UI polish resolves the mobile HUD to five equal stat cells',()=>{
 const css=fs.readFileSync(root+'/css/ui-polish.css','utf8');
 assert(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))!important'));
 assert(css.includes('.hud-bars .mini-bar{'));
 assert(css.includes('height:8px!important'));
});
test('combat UI uses distinct HP MP and enemy HP visual channels',()=>{
 const html=fs.readFileSync(root+'/index.html','utf8');
 const css=fs.readFileSync(root+'/css/ui-polish.css','utf8');
 assert(html.includes('combat-hp-bar'));
 assert(html.includes('combat-mp-bar'));
 assert(html.includes('combat-enemy-bar'));
 assert(html.includes('<b>공격</b>'));
 assert(html.includes('<b>마법</b>'));
 assert(css.includes('.combat-hp-bar i'));
 assert(css.includes('.combat-mp-bar i'));
 assert(css.includes('.combat-enemy-bar i'));
 assert(css.includes('position:fixed'));
});
test('inventory is split into equipment consumables materials and tools tabs',()=>{
 const html=fs.readFileSync(root+'/index.html','utf8');
 for(const tab of ['equipment','consumables','materials','tools'])assert(html.includes('data-inventory-tab="'+tab+'"'));
 assert.equal(get('getInventoryTab()'),'equipment');
 exec("switchInventoryTab('materials')");
 assert.equal(get('getInventoryTab()'),'materials');
});
test('character stats are grouped into readable RPG cards',()=>{
 const html=fs.readFileSync(root+'/index.html','utf8');
 assert(html.includes('character-card-head"><span>⚔️</span><b>전투 숙련'));
 assert(html.includes('character-card-head"><span>✨</span><b>마법 숙련'));
 assert(html.includes('character-card-head"><span>🌿</span><b>생활 숙련'));
 assert(html.includes('character-stat-grid'));
});
test('bottom menu uses a dedicated rune glyph instead of the magic icon',()=>{
 const css=fs.readFileSync(root+'/css/ui-polish.css','utf8');
 const js=fs.readFileSync(root+'/js/ui-polish.js','utf8');
 assert(css.includes('.icon-menu-rune'));
 assert(js.includes('classList.remove("icon-magic")'));
 assert(js.includes('classList.add("icon-menu-rune")'));
});
test('UI polish assets load after equipment UI',()=>{
 const html=fs.readFileSync(root+'/index.html','utf8');
 assert(html.indexOf('css/ui-polish.css?v=0.5.9-toggle1')>html.indexOf('css/equipment-ui.css?v=0.5.8-equip1'));
 assert(html.indexOf('js/ui-polish.js?v=0.5.9-ui1')>html.indexOf('js/equipment-ui.js?v=0.5.8-equip1'));
});

test('mobile bottom side tabs close when the active button is tapped again',()=>{
 const js=fs.readFileSync(root+'/js/mobile-ui.js','utf8');
 assert(js.includes('const sameOpen=side.classList.contains("mobile-sheet-open")&&b.classList.contains("active")'));
 assert(js.includes('if(sameOpen)return closeSide()'));
});
test('map and menu bottom buttons also support repeated-tap close',()=>{
 const js=fs.readFileSync(root+'/js/mobile-ui.js','utf8');
 const css=fs.readFileSync(root+'/css/ui-polish.css','utf8');
 assert(js.includes('if(mapOpen)return closeWorldMap()'));
 assert(js.includes('if(menu.classList.contains("open"))return closeMenu()'));
 assert(js.includes('markActive(null,"map")'));
 assert(js.includes('markActive(null,"menu")'));
 assert(css.includes('#worldMapModal'));
 assert(css.includes('.mobile-menu-overlay'));
 assert(css.includes('bottom:calc(var(--mobile-nav-h) + env(safe-area-inset-bottom,0px))!important'));
});
console.log(`${tests} regression checks passed.`);
