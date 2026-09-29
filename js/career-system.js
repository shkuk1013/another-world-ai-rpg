/* v0.5.6: action-driven aptitude and career progression. */
const APTITUDES={
  none:{name:"특별한 소질 없음",start:"특별한 경험은 없다",desc:"추가 보너스 없이 완전히 자유롭게 성장합니다.",bonus:{}},
  sword:{name:"검술 소질",start:"검을 다뤄본 적이 있다",desc:"검 숙련 +2. 진로를 고정하지 않습니다.",bonus:{sword:2}},
  mana:{name:"마나 소질",start:"마나를 쉽게 느낀다",desc:"마나 제어 +1, 최대 MP +2. 마법사 직업은 실제 숙련으로 해금합니다.",bonus:{manaControl:1,maxMp:2}},
  outdoors:{name:"야외생활 소질",start:"야외 생활에 익숙하다",desc:"궁술 +1, 채집 +1. 사냥과 탐색의 초반 적응을 돕습니다.",bonus:{bow:1,gathering:1}},
  dexterity:{name:"손재주 소질",start:"손재주가 좋다",desc:"단검술 +2. 도구와 민첩한 행동의 초반 적응을 돕습니다.",bonus:{dagger:2}}
};

const CAREERS={
  apprentice_swordsman:{name:"견습 검사",tier:1,desc:"검을 반복해서 다루며 기본기를 익힌 전투자.",requirements:[{skill:"sword",min:8}]},
  apprentice_mage:{name:"견습 마법사",tier:1,desc:"마나를 제어하고 주문을 실제로 사용하기 시작한 술사.",requirements:[{skill:"manaControl",min:12},{skill:"elemental",min:12}]},
  hunter:{name:"사냥꾼",tier:1,desc:"활과 야외 경험을 함께 쌓은 생존형 전투자.",requirements:[{skill:"bow",min:7},{skill:"gathering",min:5}]},
  scout:{name:"정찰자",tier:1,desc:"단검과 현장 경험으로 위험을 먼저 읽는 탐색자.",requirements:[{skill:"dagger",min:7},{skill:"gathering",min:5}]},
  apprentice_alchemist:{name:"연금술 견습",tier:1,desc:"직접 재료를 모으고 기본 조제를 반복한 제작자.",requirements:[{skill:"gathering",min:6},{skill:"alchemy",min:4}]},
  swordsman:{name:"검사",tier:2,desc:"검술을 자신의 주력 전투 방식으로 완성한 검사.",requiresCareers:["apprentice_swordsman"],requirements:[{skill:"sword",min:18}]},
  mage:{name:"마법사",tier:2,desc:"마나 제어와 속성 마법을 안정적으로 다루는 마법사.",requiresCareers:["apprentice_mage"],requirements:[{skill:"manaControl",min:17},{skill:"elemental",min:24}]},
  ranger:{name:"레인저",tier:2,desc:"궁술과 야외 활동을 모두 숙달한 추적 전문가.",requiresCareers:["hunter"],requirements:[{skill:"bow",min:17},{skill:"gathering",min:12}]},
  skirmisher:{name:"척후병",tier:2,desc:"기동력과 현장 판단으로 앞길을 여는 정찰 전투자.",requiresCareers:["scout"],requirements:[{skill:"dagger",min:17},{skill:"gathering",min:10}]},
  alchemist:{name:"연금술사",tier:2,desc:"채집한 재료를 안정적인 결과물로 바꾸는 연금술사.",requiresCareers:["apprentice_alchemist"],requirements:[{skill:"gathering",min:12},{skill:"alchemy",min:12}]},
  spellblade:{name:"마검사",tier:2,desc:"검술과 마법을 함께 단련해 두 방식을 연결한 복합 직업.",requiresCareers:["apprentice_swordsman","apprentice_mage"],requirements:[{skill:"sword",min:15},{skill:"manaControl",min:15},{skill:"elemental",min:18}]}
};

const LEGACY_APTITUDES={"마력감응":"mana","검술경험":"sword","사냥경험":"outdoors","도적감각":"dexterity","무특성":"none","특별한 경험은 없다":"none","특별한 소질 없음":"none","검술 소질":"sword","마나 소질":"mana","야외생활 소질":"outdoors","손재주 소질":"dexterity"};
const CAREER_NAMES=Object.fromEntries(Object.entries(CAREERS).map(([key,value])=>[value.name,key]));
const SKILL_LABELS={sword:"검술",dagger:"단검술",bow:"궁술",manaControl:"마나 제어",elemental:"속성 마법 합계",gathering:"채집",alchemy:"연금술"};

function careerSkillValue(skill,state=G){
  if(skill==="elemental")return Number(state.fire||0)+Number(state.ice||0)+Number(state.lightning||0);
  return Number(state[skill]||0);
}
function careerRequirementState(key,state=G){
  const career=CAREERS[key];if(!career)return {eligible:false,missing:["알 수 없는 직업"]};
  const unlocked=new Set(state.unlockedCareers||[]),missing=[];
  for(const required of career.requiresCareers||[])if(!unlocked.has(required))missing.push(`${CAREERS[required].name} 해금`);
  for(const requirement of career.requirements||[]){
    const value=careerSkillValue(requirement.skill,state);
    if(value<requirement.min)missing.push(`${SKILL_LABELS[requirement.skill]} ${value}/${requirement.min}`);
  }
  return {eligible:missing.length===0,missing};
}
function normalizeCareerState(state,source=state){
  const legacyTrait=typeof source?.trait==="string"?source.trait:"";
  const aptitude=APTITUDES[source?.aptitude]?source.aptitude:(LEGACY_APTITUDES[legacyTrait]||"none");
  state.aptitude=aptitude;
  state.trait=APTITUDES[aptitude].name;
  state.career=CAREERS[source?.career]?source.career:(CAREER_NAMES[source?.career]||null);
  state.unlockedCareers=Array.isArray(source?.unlockedCareers)?source.unlockedCareers.filter(key=>CAREERS[key]):[];
  if(state.career&&!state.unlockedCareers.includes(state.career))state.unlockedCareers.push(state.career);
  state.aptitudeApplied=Boolean(source?.aptitudeApplied||legacyTrait||source?.name);
  state.schemaVersion="0.5.6";
  return state;
}
function applyAptitude(key){
  key=APTITUDES[key]?key:"none";G.aptitude=key;G.trait=APTITUDES[key].name;
  if(G.aptitudeApplied)return;
  for(const [stat,amount] of Object.entries(APTITUDES[key].bonus))G[stat]=Number(G[stat]||0)+amount;
  if(APTITUDES[key].bonus.maxMp){G.mp=G.maxMp;}
  G.aptitudeApplied=true;
}
function checkCareerUnlocks(state=G,{notify=true}={}){
  state.unlockedCareers=Array.isArray(state.unlockedCareers)?state.unlockedCareers:[];
  const unlocked=[];
  for(const key of Object.keys(CAREERS)){
    if(state.unlockedCareers.includes(key))continue;
    if(careerRequirementState(key,state).eligible){state.unlockedCareers.push(key);unlocked.push(key);}
  }
  if(notify&&unlocked.length&&Array.isArray(state.log)){
    const names=unlocked.map(key=>CAREERS[key].name).join(", ");
    state.log.push({tag:"system",text:`새로운 직업을 선택할 수 있다. <b>${names}</b><br><span class="small">캐릭터 → 직업 / 전문화에서 확인할 수 있습니다.</span>`,img:typeof art==="function"?art("system"):""});
    if(state.log.length>100)state.log.splice(0,state.log.length-100);
  }
  return unlocked;
}
function selectCareer(key){
  if(key===null){G.career=null;render();openCareerMenu();return true;}
  checkCareerUnlocks(G,{notify:false});
  if(!CAREERS[key]||!G.unlockedCareers.includes(key))return false;
  G.career=key;render();openCareerMenu();return true;
}
function currentCareerName(state=G){return CAREERS[state.career]?.name||"직업 없음";}
function renderCareerSummary(){
  const box=document.getElementById("careerSummary");if(!box)return;
  const ready=(G.unlockedCareers||[]).filter(key=>key!==G.career);
  box.innerHTML=`<div class="career-summary-row"><span>직업</span><b>${currentCareerName()}</b></div>
  <div class="career-summary-row"><span>모험가 등급</span><b>${G.guildRank||G.rank||"미등록"}</b></div>
  <div class="career-summary-row"><span>초기 소질</span><b>${APTITUDES[G.aptitude]?.name||APTITUDES.none.name}</b></div>
  ${ready.length?`<div class="career-ready">해금 가능 ${ready.length}개</div>`:""}
  <button type="button" onclick="openCareerMenu()">직업 / 전문화 확인</button>`;
}
function careerRequirementText(career){
  const parts=(career.requiresCareers||[]).map(key=>`${CAREERS[key].name} 해금`);
  parts.push(...(career.requirements||[]).map(r=>`${SKILL_LABELS[r.skill]} ${r.min}`));
  return parts.join(" · ")||"조건 없음";
}
function renderCareerMenu(){
  checkCareerUnlocks(G,{notify:false});
  const current=document.getElementById("careerCurrent"),list=document.getElementById("careerList");if(!current||!list)return;
  current.innerHTML=`<div class="career-current"><b>현재 직업: ${currentCareerName()}</b><br><span class="small">모험가 등급 ${G.guildRank||G.rank||"미등록"} · 칭호 ${G.activeTitle||"없음"}<br>직업·길드 등급·칭호는 서로 독립적으로 유지됩니다.</span>${G.career?`<br><button type="button" onclick="selectCareer(null)">직업을 내려놓고 자유 성장</button>`:""}</div>`;
  list.innerHTML=Object.entries(CAREERS).map(([key,career])=>{
    const unlocked=G.unlockedCareers.includes(key),active=G.career===key,status=careerRequirementState(key);
    const stateClass=active?"current":unlocked?"":"locked";
    const statusText=active?"현재 직업":unlocked?"해금 가능":`미달: ${status.missing.join(" · ")}`;
    return `<article class="career-card ${stateClass}"><span class="career-tier">${career.tier}차 직업</span><h3>${career.name}</h3><p class="small">${career.desc}</p><p class="small">조건: ${careerRequirementText(career)}</p><div class="${unlocked?"career-unlock":"career-missing"}">${statusText}</div><button type="button" ${unlocked&&!active?"":"disabled"} onclick="selectCareer('${key}')">${active?"선택 중":unlocked?"이 직업 선택":"조건 미달"}</button></article>`;
  }).join("");
}
function openCareerMenu(){renderCareerMenu();document.getElementById("careerModal")?.classList.remove("hidden");}
function closeCareerMenu(){document.getElementById("careerModal")?.classList.add("hidden");}

const previousMigrateState=migrateState;
migrateState=function(state){return normalizeCareerState(previousMigrateState(state),state);};
G=normalizeCareerState(G,G);
G.aptitudeApplied=false;

const previousStartGame=startGame;
startGame=function(){
  const selected=document.getElementById("traitInput")?.value||"none";
  previousStartGame();
  applyAptitude(selected);
  checkCareerUnlocks(G,{notify:false});
  render();
};

const previousCareerRender=render;
render=function(){
  checkCareerUnlocks(G);
  const result=previousCareerRender.apply(this,arguments);
  badges.innerHTML=`<span class="badge">${APTITUDES[G.aptitude]?.name||APTITUDES.none.name}</span><span class="badge">${currentCareerName()}</span>`;
  renderCareerSummary();
  return result;
};

document.getElementById("traitInput")?.addEventListener("change",event=>{
  const aptitude=APTITUDES[event.target.value]||APTITUDES.none;
  const hint=document.getElementById("aptitudeHint");if(hint)hint.textContent=aptitude.desc;
});
document.getElementById("careerModal")?.addEventListener("pointerdown",event=>{if(event.target.id==="careerModal")closeCareerMenu();});
render();
