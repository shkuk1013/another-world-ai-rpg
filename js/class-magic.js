/* v0.5.12 — one MP resource, universal magic + career-specific arts */
(()=>{
  const ABILITIES={
    frost_basic:{name:"서리창",group:"공용 기초마법",school:"basic",level:2,cost:4,gold:18,element:"냉기",power:6,status:"냉기",trainer:"magic",desc:"누구나 배울 수 있는 냉기 기초마법."},
    lightning_basic:{name:"전격",group:"공용 기초마법",school:"basic",level:4,cost:5,gold:22,element:"번개",power:7,status:"감전",trainer:"magic",desc:"누구나 배울 수 있는 번개 기초마법."},

    fireball:{name:"화염구",group:"마법사 상위마법",school:"mage",level:8,cost:6,gold:42,element:"화염",power:13,status:"강한 화상",trainer:"magic",careers:["mage"],desc:"마법사만 배우는 고화력 화염 주문."},
    ice_prison:{name:"빙결창",group:"마법사 상위마법",school:"mage",level:11,cost:7,gold:58,element:"냉기",power:15,status:"강한 냉기",trainer:"magic",careers:["mage"],desc:"적의 움직임까지 얼려버리는 상위 냉기 주문."},
    chain_lightning:{name:"연쇄 번개",group:"마법사 상위마법",school:"mage",level:14,cost:9,gold:76,element:"번개",power:18,status:"강한 감전",trainer:"magic",careers:["mage"],desc:"강한 감전과 피해를 주는 마법사 전용 주문."},
    inferno:{name:"홍련 폭발",group:"마법사 상위마법",school:"mage",level:18,cost:12,gold:110,element:"화염",power:25,status:"대화상",trainer:"magic",careers:["mage"],desc:"순수 마법사만 다룰 수 있는 최상위 화염술."},

    mana_slash:{name:"검기 베기",group:"검사 계열",school:"sword",level:4,cost:3,gold:22,power:5,trainer:"guild",careers:["apprentice_swordsman","swordsman","spellblade"],weapon:"sword",effect:"damage",desc:"MP를 검날에 실어 방어를 가르며 벤다."},
    mana_armor:{name:"마력 갑주",group:"검사 계열",school:"sword",level:7,cost:4,gold:34,power:0,trainer:"guild",careers:["apprentice_swordsman","swordsman","spellblade"],weapon:"sword",effect:"guard",desc:"마력을 갑주처럼 둘러 다음 공격을 크게 줄인다."},
    crescent_slash:{name:"월광참",group:"검사 계열",school:"sword",level:10,cost:6,gold:52,power:11,trainer:"guild",careers:["swordsman","spellblade"],weapon:"sword",effect:"pierce",desc:"반월 형태의 검기를 날려 방어 자세를 무너뜨린다."},
    flash_cut:{name:"일섬",group:"검사 계열",school:"sword",level:14,cost:9,gold:78,power:17,trainer:"guild",careers:["swordsman"],weapon:"sword",effect:"execute",desc:"적의 빈틈을 꿰뚫는 검사 전용 결정기."},

    shadow_stab:{name:"그림자 찌르기",group:"도적 계열",school:"rogue",level:4,cost:3,gold:22,power:5,trainer:"guild",careers:["scout","skirmisher"],weapon:"dagger",effect:"ambush",desc:"그림자처럼 파고들어 빈틈을 찌른다."},
    smoke_step:{name:"연막 보법",group:"도적 계열",school:"rogue",level:7,cost:4,gold:34,power:0,trainer:"guild",careers:["scout","skirmisher"],weapon:"dagger",effect:"evade",desc:"마력을 흩뜨려 다음 직접 공격을 한 번 회피한다."},
    poison_fang:{name:"독아",group:"도적 계열",school:"rogue",level:10,cost:6,gold:52,power:8,trainer:"guild",careers:["skirmisher"],weapon:"dagger",effect:"poison",desc:"마력독을 단검에 입혀 지속 피해를 남긴다."},
    assassinate:{name:"암영살",group:"도적 계열",school:"rogue",level:14,cost:9,gold:78,power:16,trainer:"guild",careers:["skirmisher"],weapon:"dagger",effect:"execute",desc:"약해진 적에게 치명적인 일격을 가하는 도적계 결정기."},

    wind_arrow:{name:"바람 화살",group:"사냥꾼 계열",school:"hunter",level:4,cost:3,gold:22,power:5,trainer:"guild",careers:["hunter","ranger"],weapon:"bow",effect:"pierce",desc:"바람 마력을 화살에 실어 방어를 관통한다."},
    binding_arrow:{name:"속박 화살",group:"사냥꾼 계열",school:"hunter",level:7,cost:4,gold:34,power:6,trainer:"guild",careers:["hunter","ranger"],weapon:"bow",effect:"chill",desc:"마력 끈을 퍼뜨려 적의 움직임을 둔화한다."},
    piercing_shot:{name:"관통 사격",group:"사냥꾼 계열",school:"hunter",level:10,cost:6,gold:52,power:12,trainer:"guild",careers:["ranger"],weapon:"bow",effect:"pierce",desc:"적의 방어를 무시하는 레인저의 정밀 사격."},
    storm_volley:{name:"폭풍 연사",group:"사냥꾼 계열",school:"hunter",level:14,cost:9,gold:78,power:17,trainer:"guild",careers:["ranger"],weapon:"bow",effect:"multi",desc:"바람 마력으로 여러 발을 한꺼번에 쏟아붓는다."},

    recovery_formula:{name:"회복 촉진",group:"연금술 계열",school:"alchemy",level:4,cost:3,gold:22,power:0,trainer:"magic",careers:["apprentice_alchemist","alchemist"],effect:"heal",desc:"마력 촉매로 자신의 회복력을 순간적으로 끌어올린다."},
    acid_formula:{name:"부식 연성",group:"연금술 계열",school:"alchemy",level:7,cost:4,gold:34,power:7,trainer:"magic",careers:["apprentice_alchemist","alchemist"],effect:"acid",desc:"마력으로 부식성 촉매를 만들어 적의 방어를 허문다."},
    ether_bomb:{name:"에테르 폭탄",group:"연금술 계열",school:"alchemy",level:10,cost:6,gold:52,power:13,trainer:"magic",careers:["alchemist"],effect:"alchemy_burst",desc:"농축한 마력 촉매를 폭발시키는 연금술사 전용 기술."},
    grand_formula:{name:"대연성 폭발",group:"연금술 계열",school:"alchemy",level:14,cost:9,gold:78,power:19,trainer:"magic",careers:["alchemist"],effect:"alchemy_burst",desc:"전투용 촉매를 한 번에 연성해 폭발시키는 상위 연금술."},

    elemental_blade:{name:"원소검",group:"마검사 계열",school:"spellblade",level:10,cost:6,gold:58,power:12,trainer:"guild",careers:["spellblade"],weapon:"sword",effect:"elemental_blade",desc:"가장 숙련된 속성을 검에 둘러 베는 마검사 전용 기술."},
    mana_breaker:{name:"마력 폭쇄",group:"마검사 계열",school:"spellblade",level:14,cost:9,gold:84,power:18,trainer:"guild",careers:["spellblade"],weapon:"sword",effect:"pierce",desc:"검술과 마력을 동시에 폭발시켜 방어를 무너뜨린다."}
  };
  window.CLASS_MAGIC_ABILITIES=ABILITIES;

  function abilityIdOf(spell){return spell?.abilityId||null}
  function learned(id){
    const a=ABILITIES[id];return !!a&&G.spells.some(s=>s.abilityId===id||s.name===a.name);
  }
  function careerOk(a){
    if(!a.careers?.length)return true;
    return a.careers.includes(G.career);
  }
  function weaponOk(a){
    return !a.weapon||G.equipment?.weapon?.type===a.weapon;
  }
  function learnReason(a){
    if(G.level<a.level)return `Lv.${a.level} 필요`;
    if(!careerOk(a)){
      const names=a.careers.map(k=>CAREERS[k]?.name||k).join(" / ");
      return `${names} 선택 필요`;
    }
    if(G.gold<a.gold)return `${a.gold}G 필요`;
    return "";
  }
  function learnAbility(id){
    const a=ABILITIES[id];if(!a||learned(id))return false;
    const reason=learnReason(a);if(reason){add("system",`<b>${a.name}</b> 습득 조건 미달 · ${reason}`);return false;}
    G.gold-=a.gold;
    if(id==="frost_basic")G.flags.iceLearned=true;
    if(id==="lightning_basic")G.flags.lightningLearned=true;
    G.spells.push({abilityId:id,name:a.name,element:a.element||"무속성",power:a.power,cost:a.cost,status:a.status||a.group,school:a.school,weapon:a.weapon||null});
    add(a.trainer==="magic"?"리엔":"미라",`<b>${a.name}</b>을 익혔다.<br><span class="small">MP ${a.cost} · ${a.desc}</span>`);
    renderAbilityTraining(a.trainer);
    return true;
  }
  window.learnAbility=learnAbility;

  function ensureTrainingModal(){
    let modal=document.getElementById("abilityTrainingModal");
    if(modal&&modal.dataset?.ready)return modal;
    modal=document.createElement("div");
    modal.id="abilityTrainingModal";modal.className="modal hidden";modal.dataset.ready="1";
    modal.innerHTML='<div class="ability-training-card"><div class="ability-training-head"><div><h2 id="abilityTrainingTitle">기술 배우기</h2><p class="small">모든 전투 기술은 기존 MP를 사용합니다. 별도 SP는 없습니다.</p></div><button type="button" onclick="closeAbilityTraining()">✕</button></div><div id="abilityTrainingSummary" class="ability-training-summary"></div><div id="abilityTrainingList" class="ability-training-list"></div><button onclick="closeAbilityTraining()">닫기</button></div>';
    document.body.appendChild(modal);return modal;
  }
  let currentTrainer="guild";
  function openAbilityTraining(trainer){
    currentTrainer=trainer;ensureTrainingModal();renderAbilityTraining(trainer);
    document.getElementById("abilityTrainingModal").classList.remove("hidden");
  }
  function closeAbilityTraining(){document.getElementById("abilityTrainingModal")?.classList.add("hidden")}
  function renderAbilityTraining(trainer=currentTrainer){
    const modal=ensureTrainingModal(),title=modal.querySelector("#abilityTrainingTitle"),summary=modal.querySelector("#abilityTrainingSummary"),list=modal.querySelector("#abilityTrainingList");
    if(title)title.textContent=trainer==="magic"?"✨ 마법 상점 · 주문/직업술":"🛡️ 모험가 길드 · 직업 전투술";
    if(summary)summary.innerHTML=`현재 Lv.<b>${G.level}</b> · 직업 <b>${CAREERS[G.career]?.name||"미선택"}</b> · MP <b>${G.mp}/${G.maxMp}</b> · 보유 <b>${G.gold}G</b>`;
    const pool=Object.entries(ABILITIES).filter(([,a])=>a.trainer===trainer);
    const groups=[...new Set(pool.map(([,a])=>a.group))];
    if(list)list.innerHTML=groups.map(group=>{
      const rows=pool.filter(([,a])=>a.group===group).map(([id,a])=>{
        const have=learned(id),reason=have?"습득 완료":learnReason(a);
        const disabled=have||!!reason;
        return `<article class="ability-learn-card ${have?"learned":disabled?"locked":""}">
          <div><span class="ability-school">${group}</span><h3>${a.name}</h3><p>${a.desc}</p>
          <span class="small">Lv.${a.level} · MP ${a.cost} · 수강료 ${a.gold}G${a.weapon?` · ${a.weapon==="sword"?"검":a.weapon==="dagger"?"단검":"활"} 필요`:""}</span></div>
          <button ${disabled?"disabled":""} onclick="learnAbility('${id}')">${have?"습득 완료":reason||"배우기"}</button>
        </article>`;
      }).join("");
      return `<section class="ability-group"><h3>${group}</h3>${rows}</section>`;
    }).join("");
  }
  window.openAbilityTraining=openAbilityTraining;window.closeAbilityTraining=closeAbilityTraining;window.renderAbilityTraining=renderAbilityTraining;

  function careerUseOk(a){
    if(!a?.careers?.length)return true;
    return a.careers.includes(G.career);
  }
  const baseOpenCombatMagic=openCombatMagic;
  openCombatMagic=function(){
    if(!G.combat)return;
    combatMagicList.innerHTML=G.spells.map((s,i)=>{
      const a=s.abilityId?ABILITIES[s.abilityId]:null;
      const classLocked=a&&!careerUseOk(a);
      const weaponLocked=a&&!weaponOk(a);
      const mpLocked=G.mp<s.cost;
      const disabled=classLocked||weaponLocked||mpLocked;
      const reason=classLocked?"현재 직업에서 사용 불가":weaponLocked?`${a.weapon==="sword"?"검":a.weapon==="dagger"?"단검":"활"} 장착 필요`:mpLocked?"MP 부족":"사용 가능";
      return `<button class="spell-pick ${a?"career-art":""}" ${disabled?"disabled":""} onclick="castSpell(${i})"><b>${s.name}</b> · ${a?.group||s.element}<br><span class="small">위력 ${s.power||0} · MP ${s.cost} · ${s.status||""} · ${reason}</span></button>`;
    }).join("")||'<p class="small">배운 마법이나 직업 기술이 없습니다.</p>';
    combatMagicModal.classList.remove("hidden");
  };

  const baseCastSpell=castSpell;
  function classSkillStat(a){
    if(a.school==="sword"||a.school==="spellblade")return Number(G.sword||0);
    if(a.school==="rogue")return Number(G.dagger||0);
    if(a.school==="hunter")return Number(G.bow||0);
    if(a.school==="alchemy")return Number(G.alchemy||0);
    return Number(G.manaControl||0);
  }
  function growClassSkill(a){
    const key=a.school==="sword"||a.school==="spellblade"?"sword":a.school==="rogue"?"dagger":a.school==="hunter"?"bow":a.school==="alchemy"?"alchemy":null;
    if(key)G[key]=Math.round((Number(G[key]||0)+.6)*10)/10;
  }
  castSpell=function(i){
    const s=G.spells[i],a=s?.abilityId?ABILITIES[s.abilityId]:null;
    if(!a)return baseCastSpell(i);
    const c=G.combat;if(!c||G.mp<s.cost||!careerUseOk(a)||!weaponOk(a))return;
    if(a.school==="mage")return baseCastSpell(i);
    closeCombatMagic();G.mp-=s.cost;growClassSkill(a);
    const stat=classSkillStat(a),w=G.equipment?.weapon||{},base=(a.power||0)+(w.atk||0)*.72+stat*.62;
    let d=0,text="";
    if(a.effect==="guard"){
      c.guard=true;G.fatigue=Math.max(0,G.fatigue-2);return playerDone(`<b>${a.name}</b> · 마력을 둘러 다음 공격에 대비한다.`);
    }
    if(a.effect==="evade"){
      c.evade=1;return playerDone(`<b>${a.name}</b> · 연막 속으로 몸을 숨겼다. 다음 직접 공격을 회피한다.`);
    }
    if(a.effect==="heal"){
      const heal=Math.max(5,Math.floor(8+stat*.7+G.level*.5));G.hp=Math.min(G.maxHp,G.hp+heal);
      return playerDone(`<b>${a.name}</b> · HP ${heal} 회복.`);
    }
    if(a.effect==="alchemy_burst"){
      d=attackDamage((a.power||0)+stat*.85,true);c.hp-=d;c.enemyGuard=false;text=`<b>${a.name}</b> · ${d} 피해`;
    }else if(a.effect==="acid"){
      d=attackDamage(base,true);c.hp-=d;c.enemyGuard=false;text=`<b>${a.name}</b> · ${d} 피해 · 적의 방어 해제`;
    }else if(a.effect==="poison"){
      d=attackDamage(base);c.hp-=d;c.poison=3;c.enemyGuard=false;text=`<b>${a.name}</b> · ${d} 피해 · 마력독 3턴`;
    }else if(a.effect==="chill"){
      d=attackDamage(base);c.hp-=d;c.chill=Math.max(c.chill||0,2);text=`<b>${a.name}</b> · ${d} 피해 · 속박`;
    }else if(a.effect==="elemental_blade"){
      const choices=[["화염",G.fire||0],["냉기",G.ice||0],["번개",G.lightning||0]].sort((x,y)=>y[1]-x[1]);
      const element=choices[0][0];d=attackDamage(base,true,element);c.hp-=d;c.enemyGuard=false;
      if(element==="화염")c.burn=2;if(element==="냉기")c.chill=2;if(element==="번개")c.shock=2;
      text=`<b>${a.name}</b> · ${element} 검기 ${d} 피해`;
    }else{
      let bonus=0;
      if(a.effect==="ambush"&&(c.turn<=2||!c.enemyGuard))bonus=Math.floor(base*.35);
      if(a.effect==="execute"&&c.hp<=c.maxHp*.5)bonus=Math.floor(base*.55);
      if(a.effect==="multi")bonus=Math.floor(base*.28);
      d=attackDamage(base+bonus);c.hp-=d;
      if(["pierce","execute","multi"].includes(a.effect))c.enemyGuard=false;
      text=`<b>${a.name}</b> · ${d} 피해${bonus?" · 조건 보너스":""}`;
    }
    if(c.hp<=0)return victory(`${a.name}으로 적을 물리쳤다.`);
    playerDone(text);
  };

  const baseEnemyDamage=enemyDamage;
  enemyDamage=function(base,label){
    if(G.combat?.evade){G.combat.evade=0;return `${label}! 연막 속 잔상만 베었다. <b>회피!</b>`;}
    return baseEnemyDamage(base,label);
  };
  const baseEnemyTurn=enemyTurn;
  enemyTurn=function(){
    const c=G.combat;if(c?.poison){
      const dot=Math.max(2,Math.floor(2+(G.dagger||0)*.08));c.hp-=dot;c.poison--;
      combatLog.innerHTML+=`<br><span class="status">☠ 마력독 ${dot} 피해</span>`;
      if(c.hp<=0)return victory("마력독으로 적이 쓰러졌다.");
    }
    return baseEnemyTurn();
  };
  const baseUpdateCombat=updateCombat;
  updateCombat=function(){
    const out=baseUpdateCombat();
    if(G.combat?.poison&&combatStatus)combatStatus.innerHTML+=`<span class="status">☠ 마력독 ${G.combat.poison}</span>`;
    return out;
  };

  // Replace the old lesson button with the unified curriculum, and add guild career training.
  const previousActions=v05MakeActions;
  v05MakeActions=function(){
    previousActions();
    const root=document.getElementById("actions");if(!root)return;
    const buttons=[...root.children];
    if(G.location==="마법 상점"){
      const old=buttons.find(b=>(b.textContent||"").includes("마법 배우기"));
      if(old){old.innerHTML='<span class="choice-icon">✨</span>마법 / 직업술 배우기<span class="choice-sub">공용 기초 · 마법사 상위 · 연금술</span>';old.onclick=()=>openAbilityTraining("magic");}
    }
    if(G.location==="모험가 길드"&&G.rank!=="미등록"&&!buttons.some(b=>(b.textContent||"").includes("직업 전투술 배우기"))){
      const b=document.createElement("button");b.className="choice-btn magic";
      b.innerHTML='<span class="choice-icon">⚔️</span>직업 전투술 배우기<span class="choice-sub">검사 · 도적 · 사냥꾼 · 마검사</span>';
      b.onclick=()=>openAbilityTraining("guild");root.appendChild(b);
    }
  };
  makeActions=v05MakeActions;

  // Existing saves that learned the old universal lessons remain compatible.
  if(G.flags?.iceLearned&&!learned("frost_basic")){
    const old=G.spells.find(s=>s.name==="서리창");if(old)old.abilityId="frost_basic";
  }
  if(G.flags?.lightningLearned&&!learned("lightning_basic")){
    const old=G.spells.find(s=>s.name==="전격");if(old)old.abilityId="lightning_basic";
  }
  if(typeof NPC_DIALOGUE_LIBRARY!=="undefined"){
    NPC_DIALOGUE_LIBRARY.post["미라"]?.push("“직업을 선택했다면 길드의 전투술 교본도 확인해보세요. 검사·도적·사냥꾼 계열 기술도 마법처럼 MP를 사용해요.”");
    NPC_DIALOGUE_LIBRARY.post["리엔"]?.push("“기초 속성마법은 누구나 배울 수 있지만, 화염구 같은 상위 주문은 마법사 직업을 선택해야 다룰 수 있어요.”");
    NPC_DIALOGUE_LIBRARY.post["브람"]?.push("“검사가 검기 쓴다고 검이 필요 없어지는 건 아니다. 직업 기술도 맞는 무기를 장착해야 제대로 나가.”");
  }
})();
