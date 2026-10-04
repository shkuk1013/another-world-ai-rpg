/* v0.5.13 — staged magic schools and combat status effects */
(()=>{
  const ABILITIES={
    starter_fire:{name:"작은 불꽃",group:"공용 기초마법",stage:"기초",school:"basic",level:1,cost:2,gold:0,element:"화염",power:3,status:"화상",trainer:null,statusEffect:"burn",statusAmount:1,desc:"누구나 사용할 수 있는 가장 기초적인 화염 마법."},
    frost_basic:{name:"서리창",group:"공용 기초마법",stage:"기초",school:"basic",level:2,cost:4,gold:18,element:"냉기",power:6,status:"냉기",trainer:"magic",statusEffect:"frost",statusAmount:1,desc:"누구나 배울 수 있는 냉기 기초마법. 냉기 중첩은 적의 공격력을 낮춘다."},
    lightning_basic:{name:"전격",group:"공용 기초마법",stage:"기초",school:"basic",level:4,cost:5,gold:22,element:"번개",power:7,status:"감전",trainer:"magic",statusEffect:"shock",statusAmount:1,desc:"누구나 배울 수 있는 번개 기초마법. 감전은 적의 행동을 끊을 수 있다."},

    fireball:{name:"화염구",group:"마법사 · 화염",stage:"초급",school:"mage",level:8,cost:6,gold:42,element:"화염",power:13,status:"화상 1~2중첩",trainer:"magic",careers:["mage"],statusEffect:"burn",statusAmount:1,desc:"폭발과 함께 화상을 남기는 화염계 입문 상위주문."},
    flame_spear:{name:"폭염창",group:"마법사 · 화염",stage:"중급",school:"mage",level:12,cost:8,gold:62,element:"화염",power:17,status:"화상 2중첩",trainer:"magic",careers:["mage"],requires:"fireball",statusEffect:"burn",statusAmount:2,desc:"고열을 한 점에 압축해 관통시키고 강한 화상을 남긴다."},
    fire_storm:{name:"화염폭풍",group:"마법사 · 화염",stage:"상급",school:"mage",level:16,cost:11,gold:88,element:"화염",power:22,status:"화상 2~3중첩",trainer:"magic",careers:["mage"],requires:"flame_spear",statusEffect:"burn",statusAmount:2,desc:"넓은 불길을 휘몰아쳐 높은 피해와 중첩 화상을 만든다."},
    inferno:{name:"홍련 폭발",group:"마법사 · 화염",stage:"최상급",school:"mage",level:20,cost:14,gold:125,element:"화염",power:30,status:"화상 3중첩",trainer:"magic",careers:["mage"],requires:"fire_storm",statusEffect:"burn",statusAmount:3,desc:"홍련의 마력을 폭발시켜 최대 단계 화상을 남기는 화염계 결정기."},

    ice_lance:{name:"빙결창",group:"마법사 · 냉기",stage:"초급",school:"mage",level:8,cost:6,gold:42,element:"냉기",power:12,status:"냉기 1~2중첩",trainer:"magic",careers:["mage"],statusEffect:"frost",statusAmount:1,desc:"응축한 얼음창으로 피해를 주고 냉기를 쌓는다."},
    frost_prison:{name:"서리감옥",group:"마법사 · 냉기",stage:"중급",school:"mage",level:12,cost:8,gold:62,element:"냉기",power:15,status:"냉기 2중첩",trainer:"magic",careers:["mage"],requires:"ice_lance",statusEffect:"frost",statusAmount:2,desc:"적의 움직임을 얼려 공격력을 크게 낮추고 빙결을 노린다."},
    blizzard:{name:"빙설폭풍",group:"마법사 · 냉기",stage:"상급",school:"mage",level:16,cost:11,gold:88,element:"냉기",power:20,status:"냉기 2~3중첩",trainer:"magic",careers:["mage"],requires:"frost_prison",statusEffect:"frost",statusAmount:2,desc:"폭설과 냉기로 적을 몰아붙여 빙결 직전까지 압박한다."},
    absolute_zero:{name:"절대영도",group:"마법사 · 냉기",stage:"최상급",school:"mage",level:20,cost:14,gold:125,element:"냉기",power:27,status:"즉시 빙결 가능",trainer:"magic",careers:["mage"],requires:"blizzard",statusEffect:"frost",statusAmount:3,desc:"냉기 3중첩을 한 번에 부여해 적을 빙결시키는 냉기계 결정기."},

    thunderbolt:{name:"낙뢰",group:"마법사 · 번개",stage:"초급",school:"mage",level:8,cost:6,gold:42,element:"번개",power:14,status:"감전 1~2중첩",trainer:"magic",careers:["mage"],statusEffect:"shock",statusAmount:1,desc:"빠른 낙뢰로 높은 순간 피해와 감전을 남긴다."},
    chain_lightning:{name:"연쇄 번개",group:"마법사 · 번개",stage:"중급",school:"mage",level:12,cost:8,gold:62,element:"번개",power:18,status:"감전 2중첩",trainer:"magic",careers:["mage"],requires:"thunderbolt",statusEffect:"shock",statusAmount:2,desc:"연속적인 전격으로 적의 행동을 끊을 확률을 높인다."},
    thunder_spear:{name:"뇌광창",group:"마법사 · 번개",stage:"상급",school:"mage",level:16,cost:11,gold:88,element:"번개",power:24,status:"감전 2~3중첩",trainer:"magic",careers:["mage"],requires:"chain_lightning",statusEffect:"shock",statusAmount:2,desc:"압축된 번개창으로 큰 피해를 주며 강한 감전을 축적한다."},
    heaven_thunder:{name:"천뢰",group:"마법사 · 번개",stage:"최상급",school:"mage",level:20,cost:14,gold:125,element:"번개",power:31,status:"감전 3중첩",trainer:"magic",careers:["mage"],requires:"thunder_spear",statusEffect:"shock",statusAmount:3,desc:"감전을 최대치까지 끌어올려 적의 행동을 확실하게 끊는 번개계 결정기."},

    mana_slash:{name:"검기 베기",group:"검사 계열",stage:"초급",school:"sword",level:4,cost:3,gold:22,power:5,trainer:"guild",careers:["apprentice_swordsman","swordsman","spellblade"],weapon:"sword",effect:"damage",statusEffect:"bleed",statusAmount:1,desc:"MP를 검날에 실어 베고 낮은 확률로 출혈을 남긴다."},
    mana_armor:{name:"마력 갑주",group:"검사 계열",stage:"초급",school:"sword",level:7,cost:4,gold:34,power:0,trainer:"guild",careers:["apprentice_swordsman","swordsman","spellblade"],weapon:"sword",effect:"guard",desc:"마력을 갑주처럼 둘러 다음 공격을 크게 줄인다."},
    crescent_slash:{name:"월광참",group:"검사 계열",stage:"중급",school:"sword",level:10,cost:6,gold:52,power:11,trainer:"guild",careers:["swordsman","spellblade"],weapon:"sword",effect:"pierce",statusEffect:"armor_break",statusAmount:2,desc:"반월 검기로 방어 자세를 무너뜨리고 방어력을 깎는다."},
    flash_cut:{name:"일섬",group:"검사 계열",stage:"상급",school:"sword",level:14,cost:9,gold:78,power:17,trainer:"guild",careers:["swordsman"],weapon:"sword",effect:"execute",statusEffect:"bleed",statusAmount:2,desc:"약해진 적에게 치명타를 노리고 강한 출혈을 남기는 검사 결정기."},

    shadow_stab:{name:"그림자 찌르기",group:"도적 계열",stage:"초급",school:"rogue",level:4,cost:3,gold:22,power:5,trainer:"guild",careers:["scout","skirmisher"],weapon:"dagger",effect:"ambush",statusEffect:"bleed",statusAmount:1,desc:"그림자처럼 파고들어 빈틈을 찌르고 출혈을 노린다."},
    smoke_step:{name:"연막 보법",group:"도적 계열",stage:"초급",school:"rogue",level:7,cost:4,gold:34,power:0,trainer:"guild",careers:["scout","skirmisher"],weapon:"dagger",effect:"evade",desc:"연막과 마력 잔상으로 다음 직접 공격을 한 번 회피한다."},
    poison_fang:{name:"독아",group:"도적 계열",stage:"중급",school:"rogue",level:10,cost:6,gold:52,power:8,trainer:"guild",careers:["skirmisher"],weapon:"dagger",effect:"poison",statusEffect:"poison",statusAmount:3,desc:"마력독을 단검에 입혀 3턴간 지속 피해를 남긴다."},
    assassinate:{name:"암영살",group:"도적 계열",stage:"상급",school:"rogue",level:14,cost:9,gold:78,power:16,trainer:"guild",careers:["skirmisher"],weapon:"dagger",effect:"execute",statusEffect:"bleed",statusAmount:2,desc:"체력이 낮은 적에게 큰 추가 피해와 출혈을 남기는 도적계 결정기."},

    wind_arrow:{name:"바람 화살",group:"사냥꾼 계열",stage:"초급",school:"hunter",level:4,cost:3,gold:22,power:5,trainer:"guild",careers:["hunter","ranger"],weapon:"bow",effect:"pierce",desc:"바람 마력으로 적의 방어를 관통한다."},
    binding_arrow:{name:"속박 화살",group:"사냥꾼 계열",stage:"초급",school:"hunter",level:7,cost:4,gold:34,power:6,trainer:"guild",careers:["hunter","ranger"],weapon:"bow",effect:"chill",statusEffect:"frost",statusAmount:1,desc:"마력 끈으로 적을 속박해 냉기와 같은 둔화 효과를 준다."},
    piercing_shot:{name:"관통 사격",group:"사냥꾼 계열",stage:"중급",school:"hunter",level:10,cost:6,gold:52,power:12,trainer:"guild",careers:["ranger"],weapon:"bow",effect:"pierce",statusEffect:"armor_break",statusAmount:1,desc:"정확히 약점을 꿰뚫어 적의 방어력을 낮춘다."},
    storm_volley:{name:"폭풍 연사",group:"사냥꾼 계열",stage:"상급",school:"hunter",level:14,cost:9,gold:78,power:17,trainer:"guild",careers:["ranger"],weapon:"bow",effect:"multi",statusEffect:"bleed",statusAmount:1,desc:"여러 발을 몰아쳐 추가 피해와 출혈을 노린다."},

    recovery_formula:{name:"회복 촉진",group:"연금술 계열",stage:"초급",school:"alchemy",level:4,cost:3,gold:22,power:0,trainer:"magic",careers:["apprentice_alchemist","alchemist"],effect:"heal",desc:"마력 촉매로 자신의 회복력을 순간적으로 끌어올린다."},
    acid_formula:{name:"부식 연성",group:"연금술 계열",stage:"초급",school:"alchemy",level:7,cost:4,gold:34,power:7,trainer:"magic",careers:["apprentice_alchemist","alchemist"],effect:"acid",statusEffect:"armor_break",statusAmount:2,desc:"부식성 촉매로 피해를 주고 적의 방어력을 낮춘다."},
    ether_bomb:{name:"에테르 폭탄",group:"연금술 계열",stage:"중급",school:"alchemy",level:10,cost:6,gold:52,power:13,trainer:"magic",careers:["alchemist"],effect:"alchemy_burst",desc:"농축한 마력 촉매를 폭발시키는 연금술사 전용 기술."},
    grand_formula:{name:"대연성 폭발",group:"연금술 계열",stage:"상급",school:"alchemy",level:14,cost:9,gold:78,power:19,trainer:"magic",careers:["alchemist"],effect:"alchemy_burst",statusEffect:"armor_break",statusAmount:2,desc:"폭발과 부식 반응을 동시에 일으키는 상위 연금술."},

    elemental_blade:{name:"원소검",group:"마검사 계열",stage:"중급",school:"spellblade",level:10,cost:6,gold:58,power:12,trainer:"guild",careers:["spellblade"],weapon:"sword",effect:"elemental_blade",desc:"가장 숙련된 속성을 검에 둘러 해당 속성 상태이상을 함께 건다."},
    mana_breaker:{name:"마력 폭쇄",group:"마검사 계열",stage:"상급",school:"spellblade",level:14,cost:9,gold:84,power:18,trainer:"guild",careers:["spellblade"],weapon:"sword",effect:"pierce",statusEffect:"armor_break",statusAmount:2,desc:"검술과 마력을 동시에 폭발시켜 방어력을 무너뜨린다."}
  };
  window.CLASS_MAGIC_ABILITIES=ABILITIES;

  const STATUS_INFO={
    burn:"🔥 화상",frost:"❄ 냉기",shock:"⚡ 감전",bleed:"🩸 출혈",poison:"☠ 독",armor_break:"🛡 방어파괴"
  };
  function learned(id){const a=ABILITIES[id];return !!a&&G.spells.some(s=>s.abilityId===id||s.name===a.name)}
  function careerOk(a){return !a.careers?.length||a.careers.includes(G.career)}
  function weaponOk(a){return !a.weapon||G.equipment?.weapon?.type===a.weapon}
  function prerequisiteOk(a){return !a.requires||learned(a.requires)}
  function learnReason(a){
    if(G.level<a.level)return `Lv.${a.level} 필요`;
    if(!prerequisiteOk(a))return `${ABILITIES[a.requires]?.name||"이전 단계"} 습득 필요`;
    if(!careerOk(a))return `${a.careers.map(k=>CAREERS[k]?.name||k).join(" / ")} 선택 필요`;
    if(G.gold<a.gold)return `${a.gold}G 필요`;
    return "";
  }
  function learnAbility(id){
    const a=ABILITIES[id];if(!a||learned(id)||!a.trainer)return false;
    const reason=learnReason(a);if(reason){add("system",`<b>${a.name}</b> 습득 조건 미달 · ${reason}`);return false;}
    G.gold-=a.gold;
    if(id==="frost_basic")G.flags.iceLearned=true;
    if(id==="lightning_basic")G.flags.lightningLearned=true;
    G.spells.push({abilityId:id,name:a.name,element:a.element||"무속성",power:a.power,cost:a.cost,status:a.status||a.group,school:a.school,weapon:a.weapon||null});
    add(a.trainer==="magic"?"리엔":"미라",`<b>${a.name}</b>을 익혔다.<br><span class="small">${a.stage} · MP ${a.cost} · ${a.desc}</span>`);
    renderAbilityTraining(a.trainer);return true;
  }
  window.learnAbility=learnAbility;

  function ensureTrainingModal(){
    let modal=document.getElementById("abilityTrainingModal");if(modal&&modal.dataset?.ready)return modal;
    modal=document.createElement("div");modal.id="abilityTrainingModal";modal.className="modal hidden";modal.dataset.ready="1";
    modal.innerHTML='<div class="ability-training-card"><div class="ability-training-head"><div><h2 id="abilityTrainingTitle">기술 배우기</h2><p class="small">모든 마법과 직업 기술은 기존 MP를 사용합니다. 속성별 상태이상과 단계별 선행 기술이 있습니다.</p></div><button type="button" onclick="closeAbilityTraining()">✕</button></div><div id="abilityTrainingSummary" class="ability-training-summary"></div><div id="abilityTrainingList" class="ability-training-list"></div><button onclick="closeAbilityTraining()">닫기</button></div>';
    document.body.appendChild(modal);return modal;
  }
  let currentTrainer="guild";
  function openAbilityTraining(trainer){currentTrainer=trainer;ensureTrainingModal();renderAbilityTraining(trainer);document.getElementById("abilityTrainingModal").classList.remove("hidden")}
  function closeAbilityTraining(){document.getElementById("abilityTrainingModal")?.classList.add("hidden")}
  function renderAbilityTraining(trainer=currentTrainer){
    const modal=ensureTrainingModal(),title=modal.querySelector("#abilityTrainingTitle"),summary=modal.querySelector("#abilityTrainingSummary"),list=modal.querySelector("#abilityTrainingList");
    if(title)title.textContent=trainer==="magic"?"✨ 마법 상점 · 마법/연금술":"🛡️ 모험가 길드 · 직업 전투술";
    if(summary)summary.innerHTML=`현재 Lv.<b>${G.level}</b> · 직업 <b>${CAREERS[G.career]?.name||"미선택"}</b> · MP <b>${G.mp}/${G.maxMp}</b> · 보유 <b>${G.gold}G</b><br><span class="small">화염=지속피해 · 냉기=공격력 저하/빙결 · 번개=행동 방해 · 출혈/독=지속피해 · 방어파괴=방어력 감소</span>`;
    const pool=Object.entries(ABILITIES).filter(([,a])=>a.trainer===trainer).sort((x,y)=>x[1].level-y[1].level);
    const groups=[...new Set(pool.map(([,a])=>a.group))];
    if(list)list.innerHTML=groups.map(group=>{
      const rows=pool.filter(([,a])=>a.group===group).map(([id,a])=>{
        const have=learned(id),reason=have?"습득 완료":learnReason(a),disabled=have||!!reason;
        const effect=a.statusEffect?` · ${STATUS_INFO[a.statusEffect]||a.statusEffect}`:"";
        const prereq=a.requires?` · 선행 ${ABILITIES[a.requires]?.name||""}`:"";
        return `<article class="ability-learn-card ${have?"learned":disabled?"locked":""}">
          <div><span class="ability-school">${a.stage}</span><h3>${a.name}</h3><p>${a.desc}</p>
          <span class="small">Lv.${a.level} · MP ${a.cost} · 수강료 ${a.gold}G${a.weapon?` · ${a.weapon==="sword"?"검":a.weapon==="dagger"?"단검":"활"} 필요`:""}${effect}${prereq}</span></div>
          <button ${disabled?"disabled":""} onclick="learnAbility('${id}')">${have?"습득 완료":reason||"배우기"}</button>
        </article>`;
      }).join("");
      return `<section class="ability-group"><h3>${group}</h3>${rows}</section>`;
    }).join("");
  }
  window.openAbilityTraining=openAbilityTraining;window.closeAbilityTraining=closeAbilityTraining;window.renderAbilityTraining=renderAbilityTraining;

  function classSkillStat(a){
    if(a.school==="sword"||a.school==="spellblade")return Number(G.sword||0);
    if(a.school==="rogue")return Number(G.dagger||0);
    if(a.school==="hunter")return Number(G.bow||0);
    if(a.school==="alchemy")return Number(G.alchemy||0);
    return Number(G.manaControl||0);
  }
  function growSkill(a){
    if(a.school==="basic"||a.school==="mage"){
      const key={화염:"fire",냉기:"ice",번개:"lightning"}[a.element];if(key)G[key]=Math.round((Number(G[key]||0)+1)*10)/10;
      G.manaControl=Math.round((Number(G.manaControl||0)+.2)*10)/10;return;
    }
    const key=a.school==="sword"||a.school==="spellblade"?"sword":a.school==="rogue"?"dagger":a.school==="hunter"?"bow":a.school==="alchemy"?"alchemy":null;
    if(key)G[key]=Math.round((Number(G[key]||0)+.6)*10)/10;
  }
  function statusAdjustedAmount(a,c){
    let n=Number(a.statusAmount||0);if(!n||!a.element)return n;
    const m=typeof MONSTERS!=="undefined"?MONSTERS[c.type]:null;
    if(m?.weak===a.element)n++;
    if(String(m?.resist||"").includes(a.element))n=Math.max(0,n-1);
    return n;
  }
  function applyStatus(a,c,overrideElement=null){
    const effect=a.statusEffect||(overrideElement==="화염"?"burn":overrideElement==="냉기"?"frost":overrideElement==="번개"?"shock":null);
    let amount=overrideElement?1:statusAdjustedAmount(a,c);if(!effect||amount<=0)return "";
    const resistanceCheck=typeof monsterStatusRoll==="function"?monsterStatusRoll(c.type,effect):{applied:true,resistance:0};
    if(!resistanceCheck.applied)return `⛔ ${STATUS_INFO[effect]||effect} 저항`;
    if(effect==="burn"){c.fireStacks=Math.min(3,(c.fireStacks||0)+amount);c.fireTurns=3;return `🔥 화상 ${c.fireStacks}중첩`;}
    if(effect==="frost"){c.frostStacks=Math.min(3,(c.frostStacks||0)+amount);c.frostTurns=3;if(c.frostStacks>=3){c.frozen=1;c.frostStacks=0;c.frostTurns=0;return "🧊 빙결!"}return `❄ 냉기 ${c.frostStacks}중첩`;}
    if(effect==="shock"){c.shockStacks=Math.min(3,(c.shockStacks||0)+amount);c.shockTurns=3;return `⚡ 감전 ${c.shockStacks}중첩`;}
    if(effect==="bleed"){c.bleedStacks=Math.min(3,(c.bleedStacks||0)+amount);c.bleedTurns=3;return `🩸 출혈 ${c.bleedStacks}중첩`;}
    if(effect==="poison"){c.poison=Math.max(c.poison||0,amount);return `☠ 독 ${c.poison}턴`;}
    if(effect==="armor_break"){c.armorBreakTurns=Math.max(c.armorBreakTurns||0,3);c.armorBreakValue=Math.max(c.armorBreakValue||0,amount+2);return `🛡 방어파괴 -${c.armorBreakValue}`;}
    return "";
  }

  const coreAttackDamage=attackDamage;
  attackDamage=function(power,magic=false,element=null){
    const c=G.combat;if(!c?.armorBreakTurns)return coreAttackDamage(power,magic,element);
    const old=Number(c.def||0);c.def=Math.max(0,old-Number(c.armorBreakValue||0));
    const out=coreAttackDamage(power,magic,element);c.def=old;return out;
  };

  function elementalDamage(a,c){
    const key={화염:"fire",냉기:"ice",번개:"lightning"}[a.element]||"fire";
    return attackDamage((a.power||0)+(G[key]||0)*.35+(G.manaControl||0)*.15+(G.equipment.weapon?.magic||0),true,a.element);
  }
  function physicalArtDamage(a,c){
    const stat=classSkillStat(a),w=G.equipment?.weapon||{};
    return attackDamage((a.power||0)+(w.atk||0)*.72+stat*.62);
  }

  const originalOpenCombatMagic=openCombatMagic;
  openCombatMagic=function(){
    if(!G.combat)return;
    combatMagicList.innerHTML=G.spells.map((s,i)=>{
      const a=s.abilityId?ABILITIES[s.abilityId]:null,careerLocked=a&&!careerOk(a),weaponLocked=a&&!weaponOk(a),mpLocked=G.mp<s.cost;
      const disabled=careerLocked||weaponLocked||mpLocked;
      const reason=careerLocked?"현재 직업에서 사용 불가":weaponLocked?`${a.weapon==="sword"?"검":a.weapon==="dagger"?"단검":"활"} 장착 필요`:mpLocked?"MP 부족":"사용 가능";
      const label=a?`${a.group} · ${a.stage}`:s.element;
      return `<button class="spell-pick ${a?"career-art":""}" ${disabled?"disabled":""} onclick="castSpell(${i})"><b>${s.name}</b> · ${label}<br><span class="small">위력 ${s.power||0} · MP ${s.cost} · ${s.status||""} · ${reason}</span></button>`;
    }).join("")||'<p class="small">배운 마법이나 직업 기술이 없습니다.</p>';
    combatMagicModal.classList.remove("hidden");
  };

  const legacyCastSpell=castSpell;
  castSpell=function(i){
    const s=G.spells[i];if(!s)return;
    let a=s.abilityId?ABILITIES[s.abilityId]:null;
    if(!a&&s.name==="작은 불꽃"){s.abilityId="starter_fire";a=ABILITIES.starter_fire}
    if(!a)return legacyCastSpell(i);
    const c=G.combat;if(!c||G.mp<s.cost||!careerOk(a)||!weaponOk(a))return;
    closeCombatMagic();G.mp-=s.cost;growSkill(a);
    let d=0,text="",statusText="";

    if(a.effect==="guard"){c.guard=true;G.fatigue=Math.max(0,G.fatigue-2);return playerDone(`<b>${a.name}</b> · 마력을 둘러 다음 공격에 대비한다.`)}
    if(a.effect==="evade"){c.evade=1;return playerDone(`<b>${a.name}</b> · 연막 속으로 몸을 숨겼다. 다음 직접 공격을 회피한다.`)}
    if(a.effect==="heal"){const heal=Math.max(5,Math.floor(8+classSkillStat(a)*.7+G.level*.5));G.hp=Math.min(G.maxHp,G.hp+heal);return playerDone(`<b>${a.name}</b> · HP ${heal} 회복.`)}

    if(a.school==="basic"||a.school==="mage"){
      d=elementalDamage(a,c);c.hp-=d;c.enemyGuard=false;statusText=applyStatus(a,c);
      text=`<b>${a.name}</b> · ${d} 피해${statusText?` · ${statusText}`:""}`;
    }else if(a.effect==="alchemy_burst"){
      d=attackDamage((a.power||0)+classSkillStat(a)*.85,true);c.hp-=d;c.enemyGuard=false;statusText=applyStatus(a,c);text=`<b>${a.name}</b> · ${d} 피해${statusText?` · ${statusText}`:""}`;
    }else if(a.effect==="acid"){
      d=attackDamage((a.power||0)+classSkillStat(a)*.75,true);c.hp-=d;c.enemyGuard=false;statusText=applyStatus(a,c);text=`<b>${a.name}</b> · ${d} 피해 · ${statusText}`;
    }else if(a.effect==="poison"){
      d=physicalArtDamage(a,c);c.hp-=d;c.enemyGuard=false;statusText=applyStatus(a,c);text=`<b>${a.name}</b> · ${d} 피해 · ${statusText}`;
    }else if(a.effect==="elemental_blade"){
      const choice=[["화염",G.fire||0],["냉기",G.ice||0],["번개",G.lightning||0]].sort((x,y)=>y[1]-x[1])[0][0];
      d=attackDamage((a.power||0)+(G.equipment.weapon?.atk||0)*.65+classSkillStat(a)*.55,true,choice);c.hp-=d;c.enemyGuard=false;
      statusText=applyStatus(a,c,choice);text=`<b>${a.name}</b> · ${choice} 검기 ${d} 피해 · ${statusText}`;
    }else{
      const stat=classSkillStat(a),w=G.equipment?.weapon||{},base=(a.power||0)+(w.atk||0)*.72+stat*.62;
      let bonus=0;if(a.effect==="ambush"&&(c.turn<=2||!c.enemyGuard))bonus=Math.floor(base*.35);if(a.effect==="execute"&&c.hp<=c.maxHp*.5)bonus=Math.floor(base*.55);if(a.effect==="multi")bonus=Math.floor(base*.28);
      d=attackDamage(base+bonus);c.hp-=d;if(["pierce","execute","multi"].includes(a.effect))c.enemyGuard=false;
      statusText=applyStatus(a,c);text=`<b>${a.name}</b> · ${d} 피해${bonus?" · 조건 보너스":""}${statusText?` · ${statusText}`:""}`;
    }
    if(c.hp<=0)return victory(`${a.name}으로 적을 물리쳤다.`);
    playerDone(text);
  };

  const baseEnemyDamage=enemyDamage;
  enemyDamage=function(base,label){
    const c=G.combat;if(c?.evade){c.evade=0;return `${label}! 연막 속 잔상만 베었다. <b>회피!</b>`;}
    let adjusted=base;if(c?.frostStacks)adjusted=Math.max(1,base*(1-Math.min(.24,c.frostStacks*.08)));
    return baseEnemyDamage(adjusted,label);
  };

  const baseEnemyTurn=enemyTurn;
  enemyTurn=function(){
    const c=G.combat;if(!c)return;
    let dots=[];
    if(c.fireStacks&&c.fireTurns){const dot=2+c.fireStacks*2;c.hp-=dot;c.fireTurns--;dots.push(`🔥 화상 ${dot}`);if(!c.fireTurns)c.fireStacks=0}
    if(c.bleedStacks&&c.bleedTurns){const dot=1+c.bleedStacks*2;c.hp-=dot;c.bleedTurns--;dots.push(`🩸 출혈 ${dot}`);if(!c.bleedTurns)c.bleedStacks=0}
    if(c.poison){const dot=Math.max(2,Math.floor(2+(G.dagger||G.alchemy||0)*.08));c.hp-=dot;c.poison--;dots.push(`☠ 독 ${dot}`)}
    if(dots.length)combatLog.innerHTML+=`<br><span class="status">${dots.join(" · ")}</span>`;
    if(c.hp<=0)return victory("지속 피해로 적이 쓰러졌다.");

    if(c.frozen){c.frozen=0;c.turn++;intentRoll();combatLog.innerHTML+='<br><b>🧊 빙결!</b> 적이 한 턴 움직이지 못했다.';updateCombat();return}
    if(c.shockStacks&&c.shockTurns){
      const stacks=c.shockStacks,chance=stacks>=3?1:stacks===2?.45:.25;c.shockTurns--;
      if(Math.random()<chance){c.shockStacks=stacks>=3?0:Math.max(0,stacks-1);c.turn++;intentRoll();combatLog.innerHTML+='<br><b>⚡ 감전!</b> 적의 행동이 끊겼다.';updateCombat();return}
      if(!c.shockTurns)c.shockStacks=0;
    }
    if(c.frostTurns){c.frostTurns--;if(!c.frostTurns)c.frostStacks=0}
    if(c.armorBreakTurns){c.armorBreakTurns--;if(!c.armorBreakTurns)c.armorBreakValue=0}
    return baseEnemyTurn();
  };

  const baseUpdateCombat=updateCombat;
  updateCombat=function(){
    const out=baseUpdateCombat(),c=G.combat;if(!c||!combatStatus)return out;
    const extra=[];
    if(c.fireStacks)extra.push(`🔥 화상 ${c.fireStacks}중첩`);
    if(c.frostStacks)extra.push(`❄ 냉기 ${c.frostStacks}중첩 · 공격↓`);
    if(c.shockStacks)extra.push(`⚡ 감전 ${c.shockStacks}중첩`);
    if(c.bleedStacks)extra.push(`🩸 출혈 ${c.bleedStacks}중첩`);
    if(c.poison)extra.push(`☠ 독 ${c.poison}턴`);
    if(c.armorBreakTurns)extra.push(`🛡 방어파괴 -${c.armorBreakValue}`);
    if(c.frozen)extra.push("🧊 빙결");
    if(extra.length)combatStatus.innerHTML+=extra.map(x=>`<span class="status">${x}</span>`).join("");
    return out;
  };

  const previousActions=v05MakeActions;
  v05MakeActions=function(){
    previousActions();
    const root=document.getElementById("actions");if(!root)return;const buttons=[...root.children];
    if(G.location==="마법 상점"){
      const old=buttons.find(b=>(b.textContent||"").includes("마법 배우기")||(b.textContent||"").includes("마법 / 직업술 배우기"));
      if(old){old.innerHTML='<span class="choice-icon">✨</span>마법 / 직업술 배우기<span class="choice-sub">공용 기초 · 속성별 마법사 계보 · 연금술</span>';old.onclick=()=>openAbilityTraining("magic")}
    }
    if(G.location==="모험가 길드"&&G.rank!=="미등록"&&!buttons.some(b=>(b.textContent||"").includes("직업 전투술 배우기"))){
      const b=document.createElement("button");b.className="choice-btn magic";b.innerHTML='<span class="choice-icon">⚔️</span>직업 전투술 배우기<span class="choice-sub">검사 · 도적 · 사냥꾼 · 마검사</span>';b.onclick=()=>openAbilityTraining("guild");root.appendChild(b);
    }
  };
  makeActions=v05MakeActions;

  // Existing saves migrate into the staged tree without losing learned spells.
  const legacyNameMap={"작은 불꽃":"starter_fire","서리창":"frost_basic","전격":"lightning_basic","화염구":"fireball","빙결창":"ice_lance","연쇄 번개":"chain_lightning","홍련 폭발":"inferno"};
  const legacyIdMap={ice_prison:"ice_lance"};
  for(const spell of G.spells||[]){
    if(legacyIdMap[spell.abilityId])spell.abilityId=legacyIdMap[spell.abilityId];
    if(!spell.abilityId&&legacyNameMap[spell.name])spell.abilityId=legacyNameMap[spell.name];
  }
  if(G.flags?.iceLearned&&!learned("frost_basic")){const old=G.spells.find(s=>s.name==="서리창");if(old)old.abilityId="frost_basic"}
  if(G.flags?.lightningLearned&&!learned("lightning_basic")){const old=G.spells.find(s=>s.name==="전격");if(old)old.abilityId="lightning_basic"}

  if(typeof NPC_DIALOGUE_LIBRARY!=="undefined"){
    NPC_DIALOGUE_LIBRARY.post["리엔"]?.push("“속성은 단순히 색만 다른 공격이 아니에요. 화염은 태우고, 냉기는 움직임을 둔하게 만들고, 번개는 행동 자체를 끊어요.”");
    NPC_DIALOGUE_LIBRARY.post["리엔"]?.push("“상위 마법은 앞 단계 주문을 익혀야 배울 수 있어요. 한 속성을 끝까지 파도 좋고, 여러 속성을 나눠 익혀도 괜찮아요.”");
    NPC_DIALOGUE_LIBRARY.post["미라"]?.push("“출혈·독·방어파괴도 무시하지 마세요. 강한 적일수록 한 번의 큰 공격보다 상태이상을 쌓는 편이 유리할 때가 있어요.”");
  }
})();
