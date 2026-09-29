/* v0.5.7: varied F-rank encounters around Bren. Reuses the current monster atlas. */
const BREN_MONSTERS={
  forest_slime:{
    name:"이끼 슬라임",rank:"F",hp:[18,25],atk:[3,5],def:0,weak:"화염",resist:"없음",region:"서쪽 숲 · 강변 부두",
    drops:[{name:"맑은 점액",chance:1,qty:[1,2],rarity:"common"},{name:"푸른 약초",chance:.18,qty:[1,1],rarity:"rare"}]
  },
  river_frog:{
    name:"강변 큰개구리",rank:"F",hp:[22,30],atk:[4,6],def:0,weak:"번개",resist:"없음",region:"강변 부두 · 남쪽 농장",
    drops:[{name:"짐승 고기",chance:.8,qty:[1,1],rarity:"common"},{name:"개구리 가죽",chance:.45,qty:[1,1],rarity:"common"},{name:"독낭",chance:.06,qty:[1,1],rarity:"rare"}]
  },
  young_wolf:{
    name:"어린 회색늑대",rank:"F",hp:[26,34],atk:[5,7],def:1,weak:"화염",resist:"없음",region:"서쪽 숲 · 옛 왕도길",
    drops:[{name:"짐승 고기",chance:1,qty:[1,2],rarity:"common"},{name:"가죽",chance:.55,qty:[1,1],rarity:"common"},{name:"송곳니",chance:.28,qty:[1,1],rarity:"rare"}]
  },
  dust_bat:{
    name:"먼지날개 박쥐",rank:"F",hp:[20,27],atk:[4,7],def:0,weak:"번개",resist:"없음",region:"북쪽 채석장 · 버려진 감시탑",
    drops:[{name:"박쥐 가죽",chance:.85,qty:[1,1],rarity:"common"},{name:"송곳니",chance:.35,qty:[1,1],rarity:"common"},{name:"마력 찌꺼기",chance:.05,qty:[1,1],rarity:"rare"}]
  }
};

const BREN_ENCOUNTERS={
  "서쪽 숲":[["forest_slime",30],["young_wolf",25],["goblin",45]],
  "강변 부두":[["river_frog",55],["forest_slime",30],["young_wolf",15]],
  "남쪽 농장":[["river_frog",45],["forest_slime",35],["young_wolf",20]],
  "동쪽 벌목지":[["young_wolf",35],["forest_slime",25],["goblin",40]],
  "북쪽 채석장":[["dust_bat",60],["goblin",30],["cave_bat",10]],
  "옛 왕도길":[["young_wolf",40],["goblin",45],["dust_bat",15]],
  "버려진 감시탑":[["dust_bat",50],["young_wolf",25],["goblin",25]]
};

Object.assign(MONSTERS,BREN_MONSTERS);
window.MONSTER_ART=window.MONSTER_ART||{};
Object.assign(window.MONSTER_ART,{forest_slime:9,river_frog:12,young_wolf:5,dust_bat:3});
if(window.ITEM_ART)Object.assign(window.ITEM_ART,{
  "맑은 점액":{atlas:"bren",index:0},"개구리 가죽":{atlas:"bren",index:1},
  "박쥐 가죽":{atlas:"bren",index:2},"푸른 약초":{atlas:"bren",index:3}
});
if(typeof MARKET_PRICES!=="undefined")Object.assign(MARKET_PRICES,{"맑은 점액":3,"개구리 가죽":4,"박쥐 가죽":4});

function pickBrenEncounter(place,roll=Math.random()){
  const table=BREN_ENCOUNTERS[place];if(!table?.length)return null;
  const total=table.reduce((sum,row)=>sum+row[1],0);let cursor=Math.max(0,Math.min(.999999,roll))*total;
  for(const [id,weight] of table){cursor-=weight;if(cursor<0)return id;}
  return table.at(-1)[0];
}
function startBrenEncounter(place=G.location){
  if(G.combat)return false;
  const type=pickBrenEncounter(place);if(!type)return false;
  startCombat(type);return true;
}
function brenEncounterLabel(place){
  return {"서쪽 숲":"숲 가장자리 수색","강변 부두":"물가의 소란 조사","남쪽 농장":"농작물 피해 조사","동쪽 벌목지":"수풀의 인기척 조사","북쪽 채석장":"바위틈 둥지 조사","옛 왕도길":"길목의 흔적 추적","버려진 감시탑":"탑 안쪽 수색"}[place]||"주변 몬스터 수색";
}
function appendBrenEncounterAction(){
  const table=BREN_ENCOUNTERS[G.location];if(!table||G.combat||G.rank==="미등록")return;
  if(G.location==="서쪽 숲"&&G.scoutQuest?.status!=="completed")return;
  const button=document.createElement("button"),label=brenEncounterLabel(G.location);
  button.className="choice-btn warn bren-encounter";
  button.innerHTML=`<span class="choice-icon">🐾</span>${label}<span class="choice-sub">F급 몬스터 출현 · 전투 가능</span>`;
  button.onclick=()=>startBrenEncounter(G.location);actions.appendChild(button);
}

const previousBrenRender=render;
render=function(){const result=previousBrenRender.apply(this,arguments);appendBrenEncounterAction();return result;};

const previousMonsterHint=regionMonsterHint;
regionMonsterHint=function(name){
  if(!BREN_ENCOUNTERS[name])return previousMonsterHint(name);
  const names=[...new Set(BREN_ENCOUNTERS[name].map(([id])=>MONSTERS[id]?.name).filter(Boolean))];
  return `<div class="meta">출현: ${names.join(" · ")}</div>`;
};

ensureProgress();
render();
