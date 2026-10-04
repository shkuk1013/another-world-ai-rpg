/* v0.5.14 — monster elemental affinity and status resistance */
(()=>{
  const DATA={
    forest_slime:{weakElements:["화염"],statusResist:{bleed:1,poison:.45}},
    river_frog:{weakElements:["번개"],statusResist:{poison:.2}},
    young_wolf:{weakElements:["화염"],statusResist:{bleed:.05}},
    dust_bat:{weakElements:["번개"],statusResist:{bleed:.05,frost:.1}},
    goblin:{weakElements:["화염"],statusResist:{bleed:.05,poison:.05}},
    mana_goblin:{weakElements:["번개"],elementResist:{"화염":.15},statusResist:{burn:.25,poison:.1}},
    goblin_chief:{weakElements:["냉기"],statusResist:{bleed:.35,poison:.2,shock:.15,armor_break:.15}},
    frost_wolf:{weakElements:["화염"],elementResist:{"냉기":.55},statusResist:{frost:.75,bleed:.15,shock:.1}},
    mine_troll:{weakElements:["번개"],statusResist:{bleed:.35,poison:.25,frost:.15,armor_break:.25}},
    marsh_slime:{weakElements:["냉기"],statusResist:{poison:1,bleed:1,burn:.1,shock:.15}},
    swamp_frog:{weakElements:["번개"],statusResist:{poison:.55,bleed:.1}},
    cave_bat:{weakElements:["화염"],statusResist:{bleed:.1,frost:.1}},
    bronze_ogre:{weakElements:["냉기"],statusResist:{bleed:.3,poison:.25,shock:.2,armor_break:.4}},
    wind_wyvern:{weakElements:["번개"],statusResist:{bleed:.25,poison:.2,frost:.2}},
    spirit_beast:{weakElements:["화염"],magicResist:.15,statusResist:{frost:.3,shock:.35,bleed:.5,poison:.6,armor_break:.25}},
    ancient_golem:{weakElements:["번개"],statusResist:{bleed:1,poison:1,burn:.6,frost:.7,armor_break:.55}},
    swamp_knight:{statusResist:{poison:1,bleed:.65,burn:.3,frost:.45,shock:.35,armor_break:.5}},
    fire_drake:{weakElements:["냉기"],immuneElements:["화염"],statusResist:{burn:1,shock:.45,bleed:.5,poison:.65,armor_break:.55}},
    ancient_dragon:{weakElements:["냉기"],immuneElements:["화염"],statusResist:{burn:1,frost:.55,shock:.65,bleed:.75,poison:.85,armor_break:.7}}
  };
  window.MONSTER_AFFINITY_DATA=DATA;
  const EFFECT_ELEMENT={burn:"화염",frost:"냉기",shock:"번개"};
  const STATUS_LABEL={burn:"화상",frost:"냉기/빙결",shock:"감전",bleed:"출혈",poison:"독",armor_break:"방어파괴"};

  for(const [id,data] of Object.entries(DATA)){
    if(MONSTERS[id])MONSTERS[id].affinity=data;
  }

  window.monsterAffinityMultiplier=function(type,element){
    if(!element)return 1;
    const m=MONSTERS[type]||{},a=m.affinity||DATA[type]||{};
    if(a.immuneElements?.includes(element))return 0;
    if(a.weakElements?.includes(element))return 1.25;
    const resist=Math.max(0,Math.min(1,Number(a.elementResist?.[element]||0)));
    if(resist)return 1-resist;
    if(a.magicResist)return Math.max(0,1-Number(a.magicResist||0));
    return 1;
  };

  window.monsterStatusResistance=function(type,effect){
    const m=MONSTERS[type]||{},a=m.affinity||DATA[type]||{};
    let resist=Math.max(0,Math.min(1,Number(a.statusResist?.[effect]||0)));
    const element=EFFECT_ELEMENT[effect];
    if(element&&a.immuneElements?.includes(element))return 1;
    if(element&&a.weakElements?.includes(element)&&resist<1)resist=Math.max(0,resist-.15);
    return resist;
  };

  window.monsterStatusRoll=function(type,effect){
    const resistance=monsterStatusResistance(type,effect);
    return {applied:resistance<1&&Math.random()>=resistance,resistance};
  };

  function percent(n){return Math.round(Number(n||0)*100)}
  window.monsterAffinityCodexHtml=function(type){
    const m=MONSTERS[type]||{},a=m.affinity||DATA[type]||{};
    const parts=[];
    if(a.weakElements?.length)parts.push('<span class="affinity-chip weak">약점 '+a.weakElements.join(" · ")+'</span>');
    if(a.immuneElements?.length)parts.push('<span class="affinity-chip immune">면역 '+a.immuneElements.join(" · ")+'</span>');
    for(const [el,val] of Object.entries(a.elementResist||{}))parts.push('<span class="affinity-chip resist">'+el+' 피해 -'+percent(val)+'%</span>');
    if(a.magicResist)parts.push('<span class="affinity-chip resist">마법 피해 -'+percent(a.magicResist)+'%</span>');
    const status=Object.entries(a.statusResist||{}).filter(([,v])=>Number(v)>0).map(([k,v])=>STATUS_LABEL[k]+' '+(Number(v)>=1?'면역':percent(v)+'% 저항'));
    return '<div class="monster-affinity-line">'+(parts.length?parts.join(" "):'<span class="affinity-chip neutral">속성 저항 없음</span>')+'</div>'+
      '<div class="monster-status-line"><b>상태이상 저항</b> · '+(status.length?status.join(" · "):'낮음')+'</div>';
  };
})();