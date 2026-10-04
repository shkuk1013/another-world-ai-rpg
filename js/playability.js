/* v0.5.2: explicit quest state, finite conversations and resilient local assets. */
const SAVE_KEY='anotherWorldV052';
const LEGACY_SAVE_KEY='anotherWorldV04Draft';
const INITIAL_STATE=JSON.parse(JSON.stringify(G));
const NEW_SCENES={
 '낯선 숲길':'west-forest','서쪽 숲':'west-forest','숲속 야영지':'camp',
 '브렌 시장':'market','생활 도구 상점':'market','동쪽 벌목지':'logging-camp',
 '북쪽 채석장':'quarry','폐광 입구':'quarry','청동 협곡':'quarry','고대 수로':'quarry',
 '프로스트벨':'frostbell','북부 숲길':'frostbell','서리 언덕':'frostbell','은빛 호수':'frostbell',
 '카르문 광산도시':'karmun','엘로디아 숲마을':'elodia','달그림자 숲':'elodia','고대 정령터':'elodia',
 '강변 부두':'river-farm','남쪽 농장':'river-farm','옛 왕도길':'wilderness','안개 습지':'swamp',
 '버려진 감시탑':'wilderness','고블린 야영지':'west-forest','바람절벽':'wilderness',
 '왕도 관문':'karmun','검은 늪':'swamp','붉은 화산로':'volcano','용의 계곡':'volcano'
};
Object.entries(NEW_SCENES).forEach(([place,file])=>V05_SCENES[place]=`assets/scenes/${file}.webp`);
ASSET.goblin='assets/enemies/goblin-scout.svg';
ASSET.rien='assets/portraits/rien.webp';ASSET.mira='assets/portraits/mira.webp';
function setSceneAsset(place){
 const src=V05_SCENES[place]||'assets/scenes/wilderness.webp';
 if(sceneImg.getAttribute('src')!==src){sceneImg.src=src;sceneImg.alt=place+' 풍경';}
}
// A failed image gets a readable local fallback once; never an onerror retry loop.
document.addEventListener('error',e=>{
 const el=e.target;if(!(el instanceof HTMLImageElement))return;
 if(el.dataset.fallback===el.getAttribute('src'))return;
 const fallback=el===stageNpc?'assets/portraits/system.svg':'assets/scenes/bren-village.webp';
 if(el.getAttribute('src')===fallback){el.style.visibility='hidden';return;}
 el.dataset.fallback=fallback;el.src=fallback;
},true);
function migrateState(state){
 if(!state||typeof state!=='object'||Array.isArray(state)||typeof state.location!=='string'||!Number.isFinite(state.level))throw Error('저장 형식이 올바르지 않습니다.');
 const base=JSON.parse(JSON.stringify(INITIAL_STATE));
 const result={...base,...state};
 for(const key of ['flags','tools','materials','consumables','equipment','relations','monsterKills','bossUnlocks','bossRoutes']) result[key]={...base[key],...(state[key]||{})};
 for(const key of ['log','spells','equipmentInventory','discoveredRecipes'])if(!Array.isArray(result[key]))result[key]=base[key];
 result.dialogueState=result.dialogueState||{};
 result.hunger=Math.max(0,Math.min(100,Number.isFinite(state.hunger)?state.hunger:20));
 result.hydration=Math.max(0,Math.min(100,Number.isFinite(state.hydration)?state.hydration:85));
 result.survivalClock=Number.isFinite(state.survivalClock)?state.survivalClock:(state.day||1)*24+(state.hour||0);
 if(!result.scoutQuest){
  if(result.quest?.type==='goblin')result.scoutQuest={status:'accepted'};
  else if(result.quest?.title==='정찰 완료')result.scoutQuest={status:'completed'};
  else result.scoutQuest={status:'available'};
 }
 if(result.rank!=='미등록'&&result.guildRank==='미등록')result.guildRank=result.rank;
 result.day=Math.max(1,Number(result.day)||1);result.hour=Math.max(0,Number(result.hour)||8);
 result.day+=Math.floor(result.hour/24);result.hour%=24;
 result.schemaVersion='0.5.2';return result;
}
G=migrateState(G);
function advanceTime(hours){G.hour+=hours;G.day+=Math.floor(G.hour/24);G.hour%=24;}
function autoSave(){
 if(!G.name||!startModal.classList.contains('hidden')||G.combat||!eventModal.classList.contains('hidden'))return;
 try{localStorage.setItem(SAVE_KEY,JSON.stringify(G));saveIndicator.textContent='자동 저장됨';}
 catch(e){saveIndicator.textContent='저장 공간 확인 필요';}
}
const saveIndicator=document.createElement('span');saveIndicator.id='saveIndicator';saveIndicator.setAttribute('role','status');
document.querySelector('.brand').appendChild(saveIndicator);
const questTrail=document.createElement('div');questTrail.id='questTrail';document.querySelector('.actions-wrap').prepend(questTrail);
function renderQuestTrail(){
 const q=G.scoutQuest.status;
 const steps=q==='available'?(G.rank==='미등록'?'길드 방문 → 모험가 등록':'길드에서 첫 의뢰 수락'):q==='accepted'?'① 수락 완료 → ② 서쪽 숲에서 안전 정찰 → ③ 길드 보고':q==='scouted'?'① 수락 ✓　② 정찰 ✓　③ 길드에서 30G 받기':'첫 의뢰 완료 ✓ · '+(G.quest?.title||'자유 모험');
 questTrail.textContent=steps;
 if(q==='accepted'||q==='scouted'){
  questBox.innerHTML=`<b>서쪽 숲 정찰</b><p>${q==='accepted'?'서쪽 숲에서 안전한 거리로 흔적을 관찰하세요. 전투는 필수가 아닙니다.':'정찰 기록을 확보했습니다. 길드의 미라에게 보고하세요.'}</p><span class="small">보상 30G · 길드 공헌 20</span>`;
  const button=document.createElement('button');button.className='primary';
  button.textContent=q==='scouted'?(G.location==='모험가 길드'?'보고하고 보상 받기':'길드로 이동'):(G.location==='서쪽 숲'?'안전 정찰 시작':'서쪽 숲으로 이동');
  button.onclick=()=>{if(q==='scouted'){G.location==='모험가 길드'?reportScoutQuest():move('모험가 길드');}else{G.location==='서쪽 숲'?scoutForest():move('서쪽 숲');}};
  questBox.appendChild(button);
 }
}
const coreRender=render;
render=function(){
 updateSurvival();coreRender();renderQuestTrail();renderSurvival();
 document.querySelectorAll('#actions button').forEach(b=>{
  for(const npc of Object.keys(TALK_LINES))if(b.textContent.includes(npc+'와 대화')){
   if(dialogueExhausted(npc)){b.disabled=true;b.querySelector('.choice-sub').textContent='오늘은 더 할 이야기가 없다';}
  }
 });
 if(G.companionRoster?.length){const b=document.createElement('button');b.textContent='동료 편성';b.onclick=()=>openCompanionPickerV048(G.companionRoster);companionBox.appendChild(b);}
 autoSave();
};
const originalRegister=register;
register=function(){if(G.rank!=='미등록')return;G.guildRank='F급';originalRegister();};
acceptQuest=function(){
 if(G.rank==='미등록')return add('미라','“먼저 길드 등록부터 마쳐주세요.”');
 if(G.scoutQuest.status==='completed')return add('미라','“첫 정찰 의뢰는 이미 마쳤어요. 소문이나 길드 등급을 확인해보세요.”');
 if(G.scoutQuest.status!=='available')return add('미라',G.scoutQuest.status==='scouted'?'“기록을 가져왔군요. 정찰 보고를 해주세요.”':'“서쪽 숲의 입구만 살펴보세요. 싸울 필요는 없어요.”');
 G.scoutQuest={status:'accepted'};
 G.quest={type:'goblin',title:'[F급] 서쪽 숲 정찰',desc:'서쪽 숲에서 안전 정찰 후 길드 보고. 보상 30G.'};
 add('미라','“서문을 나가면 숲길이에요. 발자국과 야영 흔적만 확인하고 돌아오세요. 지금 아래의 <b>서쪽 숲으로 출발</b>을 누르면 돼요.”');
};
function scoutForest(){
 if(G.combat||G.location!=='서쪽 숲'||G.scoutQuest.status!=='accepted')return;
 G.scoutQuest.status='scouted';G.fatigue=Math.min(100,G.fatigue+2);advanceTime(1);
 G.discoveredMonsters.goblin=true;
 add('system','덤불 뒤에서 부러진 가지와 작은 발자국을 기록했다. 고블린 둘이 북쪽으로 향한다. 들키지 않고 물러났다.<br><b>정찰 목표 달성!</b> 길드에 돌아가 미라에게 보고하자.');
}
function reportScoutQuest(){
 if(G.combat||G.location!=='모험가 길드'||G.scoutQuest.status!=='scouted')return;
 G.scoutQuest.status='completed';G.gold+=30;G.rep++;addGuildPoints(20);
 if(G.quest?.type==='goblin')G.quest={title:'첫 의뢰 완료',desc:'서쪽 숲 정찰을 보고했다. 다음에는 장비와 생활 도구를 준비해보자.'};
 add('미라','“발자국의 방향까지 적었네요. 싸우지 않아도 충분히 훌륭한 정찰이에요.”<br><b>30G · 길드 공헌 20 획득</b>. 미라가 의뢰서에 완료 도장을 찍는다.');
}
const TALK_LINES={
 '세나':['“북쪽에서는 날씨부터 살펴. 발자국은 눈이 오면 금세 사라지거든.”','“늑대가 조용하다고 안전한 건 아니야. 바람 방향을 잊지 마.”','“장비를 챙겼으면 마을 밖을 천천히 살펴봐.”'],
 '도란':['“광산에서는 광석보다 버팀목부터 봐야 해. 목숨이 제일 비싸거든.”','“좋은 곡괭이도 지친 손으로 잡으면 소용없지. 쉬어가.”','“희귀 광석을 찾았으면 브람의 제작 목록도 확인해봐.”'],
 '리리아':['“숲의 소리를 잠시 들어보세요. 서두르면 놓치는 게 많답니다.”','“빛나는 꽃을 전부 꺾지는 말아요. 다음 여행자에게도 길이 되어주니까요.”','“정령터는 준비 없이 가기에는 위험해요. 동료와 장비를 먼저 살펴보세요.”'],
 '카르딘':['“먼 길을 왔군. 성문 너머에도 네가 할 일은 많을 거야.”','“길드의 평판은 문을 열어주기도 하지.”','“다음 이야기는 네 여행이 끝난 뒤 듣도록 하지.”'],
 '상인':['“필요한 물건부터 사는 게 오래 여행하는 비결이죠.”','“쓰지 않는 재료는 시장에서 팔 수 있어요.”','“구경은 마음껏 하세요. 오늘 소식은 이 정도네요.”'],
 '미라':['“이곳은 브렌이에요. 급하게 강해지려는 신참보다, 꾸준히 돌아오는 신참을 더 오래 기억하죠.”','“서쪽 숲에서는 칼자국보다 발자국을 먼저 보세요. 위험을 알아차리는 것도 실력이에요.”','“방값을 아끼겠다고 숲에서 무작정 자지는 마세요. 여관의 에밀리아에게 먼저 물어봐요.”'],
 '리엔':['“마법은 큰 소리로 외친다고 강해지지 않아요. 우선 손끝의 마나부터 느껴봐요.”','“불꽃만으로 모든 걸 해결할 수는 없어요. 상대의 약점을 보는 습관을 들여요.”','“서쪽 숲의 마력 샘이 이상해요. 준비가 되면 제 부탁도 들어줄래요?”'],
 '에밀리아':['“강한 모험가도 빈속에는 투덜거리더라고요. 식사부터 챙겨요.”','“밤마다 무용담을 늘어놓는 손님이 있어요. 정작 계산할 때는 제일 조용하지만요.”','“다녀와서 문을 두드려요. 무사히 돌아오는 소리는 언제 들어도 좋거든요.”'],
 '브람':['“무기를 사기 전에 손에 맞는지 봐. 무겁기만 한 검은 네 발목부터 잡는다.”','“좋은 재료엔 네 여행이 묻어 있지. 광석을 모았으면 작업대를 살펴봐.”','“이미 가진 무기는 또 살 필요 없어. 다음에는 제작이나 강화로 손봐라.”']
};
function dialogueKey(npc){return [G.day,G.scoutQuest.status,!!G.flags.rienJoined,!!G.flags.campfire].join(':');}
function dialogueExhausted(npc){const s=G.dialogueState[npc];return s?.key===dialogueKey(npc)&&s.index>=TALK_LINES[npc].length;}
function npcTalk(npc){
 const key=dialogueKey(npc);let state=G.dialogueState[npc];
 if(!state||state.key!==key)state=G.dialogueState[npc]={key,index:0};
 if(!TALK_LINES[npc])return add(npc,'지금은 전할 새로운 이야기가 없다.');
 if(state.index>=TALK_LINES[npc].length)return add(npc,'“오늘은 이만 이야기해요. 새로운 일이 생기면 다시 들러요.”');
 if(npc==='리엔')G.flags.rienMet=true;
 G.relations[npc]??={aff:1,note:V05_FACILITY[G.location]?.role||'브렌의 주민'};
 const lines=[...TALK_LINES[npc]];
 if(npc==='미라'&&G.scoutQuest.status==='completed')lines[0]='“첫 정찰을 무사히 마쳤네요. 다음에는 도구 하나 장만해서 약초를 모아봐도 좋겠어요.”';
 if(npc==='리엔'&&G.flags.campfire)lines[0]='“그날 모닥불에서 나눈 이야기, 기억해요. 함께 다니는 게 생각보다 나쁘지 않네요.”';
 // At most one relationship gain per NPC per game day, even when quest state changes.
 if(state.index===0&&G.relations[npc].lastTalkDay!==G.day){G.relations[npc].aff++;G.relations[npc].lastTalkDay=G.day;}
 const line=lines[state.index++];add(npc,line+(state.index===lines.length?'<br><span class="small">오늘 나눌 이야기는 여기까지다. 하루가 지나거나 의뢰가 진행되면 다시 대화할 수 있다.</span>':''));
}
const TALK_HANDLERS={'미라':()=>npcTalk('미라'),'리엔':()=>npcTalk('리엔'),'에밀리아':()=>npcTalk('에밀리아'),'브람':()=>npcTalk('브람')};
talkMira=TALK_HANDLERS['미라'];talkRien=TALK_HANDLERS['리엔'];v05InnTalk=TALK_HANDLERS['에밀리아'];talkBram=TALK_HANDLERS['브람'];
const originalMove=move;
move=function(place){
 if(G.combat||place===G.location)return;
 if(LOCATIONS[place]&&!placeUnlocked(place))return originalMove(place);
 if(!LOCATIONS[place]&&place!=='숲속 야영지')return;
 const outdoor=!['시설','마을','도시'].includes(LOCATIONS[place]?.type);
 if(outdoor){advanceTime(1);G.fatigue=Math.min(100,G.fatigue+2);}
 originalMove(place);
};
// Both map and action buttons follow the same movement rules.
travelTo=function(place){
 if(G.combat||!placeUnlocked(place))return;closeWorldMap();
 if(TRAVEL_ROUTES.some(r=>r.from===G.location&&r.to===place)){openTravel();return;}
 move(place);
};
const originalMaybeEvent=maybeEvent;
maybeEvent=function(area,force=false){
 if(G.combat||!startModal.classList.contains('hidden'))return;
 if(area==='forest'&&G.location!=='서쪽 숲')return;
 if(area==='quarry'&&!['북쪽 채석장','폐광 입구'].includes(G.location))return;
 if(area==='logging'&&G.location!=='동쪽 벌목지')return;
 // First quest stays a safe tutorial. Random events return after reporting.
 if(!force&&G.scoutQuest.status!=='completed'&&area==='forest')return;
 return originalMaybeEvent(area,force);
};
v05CurrentFocus=function(){const last=G.log.at(-1);return last?{tag:last.tag,text:last.text,role:last.tag==='system'?'모험 기록':V05_FACILITY[G.location]?.npc===last.tag?V05_FACILITY[G.location].role:'대화'}:{tag:'system',text:'눈앞에 낯선 세계가 펼쳐진다.',role:'모험의 시작'};};
const originalGreeting=v05FacilityGreeting;
v05FacilityGreeting=function(place){
 G.facilityVisits??={};const count=G.facilityVisits[place]||0;G.facilityVisits[place]=count+1;
 const fac=V05_FACILITY[place];if(!fac)return;
 if(!count)return originalGreeting(place);
 const greetings=['“다시 오셨네요. 무엇을 도와드릴까요?”','“어서 와요. 오늘 여정은 어땠나요?”','“필요한 일이 있으면 편하게 말해요.”'];
 G.log.push({tag:fac.npc,text:greetings[(count-1)%greetings.length]});
};
buy=function(w){
 if(G.equipment.weapon?.name===w.name||G.equipmentInventory.some(it=>it.name===w.name))return add('브람','“이미 가진 무기야. 가방에서 장착해봐.”');
 if(G.gold<w.price)return add('브람','“골드가 부족하군. 재료를 모아 팔아보는 건 어때?”');
 const old=G.equipment.weapon;if(old&&!G.equipmentInventory.some(it=>it.name===old.name))G.equipmentInventory.push({...old});
 G.gold-=w.price;G.equipmentInventory.push({...w});G.equipment.weapon={...w};add('브람',`<b>${w.name}</b>을 구입하고 장착했다. 기존 무기는 가방에 보관했다.`);
};
saveGame=function(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(G));saveIndicator.textContent='수동 저장 완료';}catch(e){alert('저장하지 못했습니다. 브라우저 저장 공간을 확인해주세요.');}};
loadGame=function(){
 const raw=localStorage.getItem(SAVE_KEY)||localStorage.getItem(LEGACY_SAVE_KEY);if(!raw)return alert('저장 데이터가 없습니다.');
 try{const next=migrateState(JSON.parse(raw));G=next;document.querySelectorAll('.modal').forEach(el=>el.classList.add('hidden'));render();if(G.combat){combatModal.classList.remove('hidden');updateCombat();}}
 catch(e){alert('저장 데이터를 읽지 못했습니다. 기존 저장은 변경하지 않았습니다.');}
};
const originalStart=startGame;
startGame=function(){const nameEl=document.getElementById('nameInput');if(nameEl)nameEl.value=(nameEl.value||'이방인').replace(/[<>"'&]/g,'').slice(0,20);originalStart();};
document.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.metaKey||e.altKey||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
 if(e.key.toLowerCase()==='m'&&startModal.classList.contains('hidden')&&!G.combat){e.preventDefault();worldMapModal.classList.contains('hidden')?openWorldMap('bren'):closeWorldMap();}
 if(e.key==='Escape')document.querySelectorAll('.modal:not(.hidden)').forEach(el=>{if(!['startModal','combatModal','eventModal','campfireModal'].includes(el.id))el.classList.add('hidden');});
});

// Time-based needs are derived once from the game clock, including legacy actions.
function updateSurvival(){
 if(G.hour>=24){G.day+=Math.floor(G.hour/24);G.hour%=24;}
 const now=G.day*24+G.hour,elapsed=Math.max(0,now-(G.survivalClock??now));
 if(elapsed){G.hunger=Math.min(100,G.hunger+elapsed*3);G.hydration=Math.max(0,G.hydration-elapsed*4);}
 G.survivalClock=now;
}
function renderSurvival(){
 const byId=id=>document.getElementById(id);
 byId('hudXp').textContent=`${G.xp}/${G.level*100}`;
 byId('hungerT').textContent=`${Math.round(G.hunger)}/100`;byId('waterT').textContent=`${Math.round(G.hydration)}/100`;
 byId('hungerB').style.width=G.hunger+'%';byId('waterB').style.width=G.hydration+'%';
 const warning=G.hunger>=80||G.hydration<=20||G.fatigue>=80;
 byId('hungerT').className=G.hunger>=80?'condition-warning':'';byId('waterT').className=G.hydration<=20?'condition-warning':'';
 const note=document.createElement('div');note.className='survival-note';note.textContent=warning?'컨디션 저하: 식사·물·휴식이 필요합니다. 전투 위력이 감소합니다.':'허기는 낮게, 수분은 높게 유지하세요. 이동과 작업에 따라 변합니다.';
 document.getElementById('equip').appendChild(note);
 const water=document.createElement('button');water.textContent=`물 마시기 · ${G.materials['맑은 물']||0}개`;water.disabled=!(G.materials['맑은 물']>0)||G.hydration>=100;water.onclick=drinkWater;document.getElementById('toolsBox').appendChild(water);
 stageNpc.alt=stageNpc.classList.contains('system')?'':stageSpeaker.textContent+' 초상화';
}
function drinkWater(){if(G.combat)return;if(!(G.materials['맑은 물']>0))return add('system','가방에 마실 물이 없다. 마을 우물이나 도구 상점을 이용하자.');if(G.hydration>=100)return;removeMaterial('맑은 물',1);G.hydration=Math.min(100,G.hydration+45);add('system','맑은 물을 마셨다. <b>수분 +45</b>.');}
function restAtWell(){if(G.combat||G.location!=='브렌 마을')return;advanceTime(1);updateSurvival();G.hydration=100;G.fatigue=Math.max(0,G.fatigue-18);G.hp=Math.min(G.maxHp,G.hp+5);G.mp=Math.min(G.maxMp,G.mp+3);add('system','우물물을 마시고 벤치에서 숨을 돌렸다. <b>피로 -18 · HP +5 · MP +3 · 수분 회복</b>. 한 시간이 지났다.');}
v05InnMeal=function(){
 if(G.gold<6)return add('에밀리아','“식사는 6골드예요. 돈이 모자라면 일손을 조금 도와주시겠어요?”');
 G.gold-=6;G.hunger=Math.max(0,G.hunger-60);G.hydration=Math.min(100,G.hydration+30);G.fatigue=Math.max(0,G.fatigue-14);G.hp=Math.min(G.maxHp,G.hp+8);
 G.mealCount=(G.mealCount||0)+1;const lines=['“뜨거우니 천천히 드세요.”','“오늘은 빵도 잘 구워졌어요.”','“든든히 먹어야 멀리 갈 수 있죠.”'];
 add('에밀리아',lines[(G.mealCount-1)%lines.length]+'<br><b>허기 -60 · 수분 +30 · 피로 -14 · HP +8</b>');
};
v05InnSleep=function(){
 if(G.gold<12)return add('에밀리아','“방은 12골드예요. 당장 부족하면 우물가에서 잠깐 쉬거나 일을 도와주세요.”');
 G.gold-=12;G.day++;G.hour=8;G.survivalClock=G.day*24+8;G.hp=G.maxHp;G.mp=G.maxMp;G.fatigue=0;G.hunger=15;G.hydration=90;
 if(G.companion){G.companion.hp=G.companion.maxHp;G.companion.mp=G.companion.maxMp;}
 add('에밀리아','“푹 주무셨죠? 간단한 아침과 물도 준비했어요.”<br><b>HP·MP 완전 회복 · 피로 0 · 아침 식사</b>');
};
function innWork(){
 if(G.location!=='황금사슴 여관'||G.combat)return;
 if(G.innWorkDay!==G.day){G.innWorkDay=G.day;G.innWorkCount=0;}
 if(G.innWorkCount>=2)return add('에밀리아','“오늘 일은 다 끝났어요. 더 도와주지 않으셔도 돼요.”');
 G.innWorkCount++;G.gold+=6;advanceTime(1);G.fatigue=Math.min(100,G.fatigue+8);add('에밀리아','식기를 정리하고 장작을 옮겼다.<br>“고마워요. 약속한 품삯이에요.” <b>6G 획득 · 피로 +8</b>');
}
const previousToolBuy=buyTool;
buyTool=function(key,cost,label){if(G.tools[key])return add('상인',`“${label}은 이미 갖고 계세요. 또 살 필요는 없어요.”`);previousToolBuy(key,cost,label);};
function ownsWeapon(w){return G.equipment.weapon?.name===w.name||G.equipmentInventory.some(it=>it.name===w.name);}
v05BlacksmithShop=function(){
 moreActionsList.innerHTML='';
 const heading=document.createElement('p');heading.className='small';heading.textContent=`보유 ${G.gold}G · 장착 중: ${G.equipment.weapon?.name||'맨손'} · 소유한 장비는 재구매할 수 없습니다.`;moreActionsList.appendChild(heading);
 for(const [key,w] of Object.entries(WEAPONS)){
  const owned=ownsWeapon(w),equipped=G.equipment.weapon?.name===w.name,card=document.createElement('div');card.className='shop-card'+(owned?' owned':'');
  card.innerHTML=`<b>${w.name}</b> <span class="badge">${equipped?'장착 중':owned?'보유 중':'판매 중'}</span><br><span class="small">공격 ${w.atk} · 마법 ${w.magic||0} · ${w.price}G</span><br>`;
  const button=document.createElement('button');button.textContent=owned?'이미 소유한 장비':G.gold<w.price?'골드 부족':`${w.price}G · 구매하고 장착`;button.disabled=owned||G.gold<w.price;
  button.onclick=()=>{buy(WEAPONS[key]);v05BlacksmithShop();};card.appendChild(button);moreActionsList.appendChild(card);
 }
 moreActionsModal.classList.remove('hidden');
};
// Productive actions consume game time; invalid attempts consume no time.
for(const [name,required] of [['doGathering',null],['rareGathering',null],['doLogging','axe'],['rareLogging','axe'],['doMining','pickaxe'],['rareMining','pickaxe'],['huntSmallGame',null]]){
 const original=window[name];window[name]=function(...args){if(G.combat)return;if(!required||G.tools[required])advanceTime(1);return original(...args);};
}
function conditionMultiplier(){return Math.max(.65,1-(G.fatigue>=80?.12:0)-(G.hunger>=80?.12:0)-(G.hydration<=20?.12:0));}
function attackDamage(power,magic=false,element=''){
 const c=G.combat;if(!c)return 0;const monster=MONSTERS[c.type]||{};
 let affinity=element?(typeof monsterAffinityMultiplier==="function"?monsterAffinityMultiplier(c.type,element):(monster.weak===element?1.25:String(monster.resist).includes(element)?.8:1)):1;
 if(affinity===0)return 0;
 let amount=(power+(G.level-1)*.8+Math.random()*4)*conditionMultiplier()*affinity;
 amount-=Math.max(0,c.def||0)*(magic?.35:.7);if(c.enemyGuard)amount*=magic?.7:.5;
 return Math.max(1,Math.floor(amount));
}
weaponAttack=function(){
 const c=G.combat;if(!c)return;const w=G.equipment.weapon;const d=attackDamage((w?.atk||2)+skillForWeapon()*.55);
 c.hp-=d;c.enemyGuard=false;if(w&&Number.isFinite(G[w.type]))G[w.type]++;G.fatigue=Math.min(100,G.fatigue+1);
 if(c.hp<=0)return victory(`${w?.name||'맨손'}으로 적을 물리쳤다.`);playerDone(`${w?.name||'맨손'}으로 <b>${d}</b> 피해.`);
};
castSpell=function(i){
 const c=G.combat,s=G.spells[i];if(!c||!s||G.mp<s.cost)return;closeCombatMagic();G.mp-=s.cost;
 const key={화염:'fire',냉기:'ice',번개:'lightning'}[s.element]||'fire';
 let d=attackDamage(s.power+(G[key]||0)*.35+G.manaControl*.12+(G.equipment.weapon?.magic||0),true,s.element);
 if(s.element==='화염'){c.burn=2;if(c.chill){d+=6;c.chill=0;}}
 if(s.element==='냉기'){c.chill=2;if(c.burn){d+=4;c.burn=0;}}
 if(s.element==='번개'){c.shock=2;if(c.chill)d+=5;}
 G[key]=(G[key]||0)+1;G.manaControl=Math.round((G.manaControl+.2)*10)/10;c.hp-=d;c.enemyGuard=false;
 if(c.hp<=0)return victory(`${s.name}이 적을 쓰러뜨렸다.`);playerDone(`<b>${s.name}</b>! ${d} 피해. ${s.element} 숙련 +1`);
};
specialSkill=function(){
 const c=G.combat,w=G.equipment.weapon;if(!c)return;if(!w){combatLog.innerHTML='무기를 장착해야 특기를 사용할 수 있다.';return;}
 if(c.skillReadyTurn&&c.turn<c.skillReadyTurn){combatLog.innerHTML=`특기는 ${c.skillReadyTurn-c.turn}턴 뒤 다시 사용할 수 있다.`;return;}
 c.skillReadyTurn=c.turn+2;G.fatigue=Math.min(100,G.fatigue+3);
 if(w.type==='staff'){G.mp=Math.min(G.maxMp,G.mp+4);return playerDone('<b>마나 순환</b> · MP 4 회복');}
 const label={sword:'반격 베기',dagger:'연속 찌르기',bow:'조준 사격'}[w.type]||'강타';
 const d=attackDamage((w.atk||2)*1.3+skillForWeapon()*.65);G[w.type]=(G[w.type]||0)+1;c.hp-=d;c.enemyGuard=false;
 if(c.hp<=0)return victory(`${label}로 적을 물리쳤다.`);playerDone(`<b>${label}</b> · ${d} 피해`);
};
enemyDamage=function(base,label){
 const c=G.combat;if(!c)return '';const raw=(c.atk||5)*(base>=10?1.25:.9)+Math.floor(Math.random()*3);
 if(G.companion&&G.companion.hp>0&&G.companion.tactic==='보호'&&Math.random()<.35){const d=Math.max(1,Math.floor(raw-2));G.companion.hp=Math.max(0,G.companion.hp-d);return `${label}! ${G.companion.name} HP -${d}`;}
 const armor=typeof G.equipment.armor==='object'?(G.equipment.armor.def||0):0;
 const d=Math.max(1,Math.floor(raw-armor*.65-(c.guard?5:0)));G.hp=Math.max(0,G.hp-d);
 if(!G.hp){G.hp=1;G.combat=null;G.location='브렌 마을';['combatModal','combatMagicModal','combatItemModal'].forEach(id=>document.getElementById(id).classList.add('hidden'));add('system','순찰대가 쓰러진 당신을 브렌으로 데려왔다. 장비는 무사하다. <b>우물가에서 쉬거나 여관에서 회복</b>하자.');}
 return `${label}! HP -${d}`;
};
enemyTurn=function(){
 let c=G.combat;if(!c)return;
 if(c.burn){c.hp-=3;c.burn--;}if(c.hp<=0)return victory('화상으로 적이 쓰러졌다.');
 if(c.shock&&Math.random()<.35){c.shock--;c.turn++;combatLog.innerHTML+='<br>감전으로 적의 행동이 끊겼다.';intentRoll();updateCombat();return;}
 let text='';if(c.intent==='강한 공격')text=enemyDamage(10,'내려찍기');else if(c.intent==='빠른 찌르기')text=enemyDamage(7,'빠른 공격');else if(c.intent==='모래 뿌리기'){G.fatigue=Math.min(100,G.fatigue+4);text='적의 견제에 피로가 늘었다.';}else{c.enemyGuard=true;text='적이 방어 자세를 취했다.';}
 if(!G.combat)return;c.guard=false;c.turn++;if(c.chill)c.chill--;if(c.shock)c.shock--;intentRoll();combatLog.innerHTML+='<br><br>'+text;updateCombat();
};
const priorCombatUpdate=updateCombat;
updateCombat=function(){priorCombatUpdate();if(G.companion&&G.combat)combatCompanionName.textContent=`${G.companion.name} · ${G.companion.tactic}`;};
const priorCombatStart=startCombat;
startCombat=function(type){if(G.combat)return;advanceTime(1);updateSurvival();priorCombatStart(type);};
const priorFlee=flee;
flee=function(){if(!G.combat)return;priorFlee();if(!G.combat){closeCombatMagic();closeCombatItems();}};
render();
