/* v0.5.17 — combat hit feedback / haptics */
(()=>{
  const STORAGE_KEY="anotherWorldCombatHaptics";
  let haptics=localStorage.getItem(STORAGE_KEY)!=="off";
  let lockTimer=0;

  function visualHost(){
    const img=document.getElementById("enemyArt");
    if(!img)return null;
    let host=img.closest(".enemy-visual-wrap");
    return host||img.parentElement;
  }
  function setActionLock(ms=340){
    const buttons=[...document.querySelectorAll("#combatModal .combat-actions button")];
    buttons.forEach(b=>b.disabled=true);
    clearTimeout(lockTimer);
    lockTimer=setTimeout(()=>buttons.forEach(b=>b.disabled=false),ms);
  }
  function vibrate(pattern){
    if(!haptics||!navigator.vibrate)return;
    try{navigator.vibrate(pattern)}catch(_){}
  }
  function restartClass(el,cls){
    if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);
  }
  function popup(text,kind="damage",critical=false){
    const host=visualHost();if(!host)return;
    const el=document.createElement("div");
    el.className=`combat-float ${kind} ${critical?"critical":""}`;
    el.textContent=text;host.appendChild(el);
    setTimeout(()=>el.remove(),850);
  }
  function slash(kind="physical"){
    const host=visualHost();if(!host)return;
    const fx=document.createElement("div");
    fx.className=`combat-strike-fx ${kind}`;
    if(kind==="fire")fx.textContent="🔥";
    if(kind==="ice")fx.textContent="❄";
    if(kind==="lightning")fx.textContent="⚡";
    if(kind==="poison")fx.textContent="☠";
    host.appendChild(fx);setTimeout(()=>fx.remove(),520);
  }
  function hitEnemy(damage,{kind="physical",critical=false,label=""}={}){
    const art=document.getElementById("enemyArt"),host=visualHost();
    if(!art||damage<=0)return;
    restartClass(art,critical?"combat-hit-heavy":"combat-hit");
    restartClass(host,"combat-impact-flash");
    slash(kind);
    popup(critical?`CRITICAL -${damage}`:`-${damage}`,"damage",critical);
    if(label)popup(label,"effect",false);
    vibrate(critical?[35,25,55]:22);
  }
  function hitPlayer(damage,label=""){
    if(damage<=0)return;
    const card=document.querySelector("#combatModal .player-panel");
    restartClass(card,"player-hit");
    popup(`HP -${damage}`,"player-damage");
    if(label)popup(label,"effect");
    vibrate(30);
  }
  function effectKindFromSpell(spell){
    const a=spell?.abilityId&&window.CLASS_MAGIC_ABILITIES?.[spell.abilityId];
    const element=a?.element||spell?.element;
    if(element==="화염")return"fire";
    if(element==="냉기")return"ice";
    if(element==="번개")return"lightning";
    if(a?.statusEffect==="poison")return"poison";
    return"physical";
  }
  function statusLabel(){
    const c=G.combat;if(!c)return"";
    if(c.frozen)return"🧊 빙결";
    if(c.fireStacks)return`🔥 화상 ${c.fireStacks}`;
    if(c.shockStacks)return`⚡ 감전 ${c.shockStacks}`;
    if(c.frostStacks)return`❄ 냉기 ${c.frostStacks}`;
    if(c.bleedStacks)return`🩸 출혈 ${c.bleedStacks}`;
    if(c.poison)return`☠ 독 ${c.poison}`;
    if(c.armorBreakTurns)return"🛡 방어파괴";
    return"";
  }
  function wrapEnemyAction(name,kindResolver){
    const old=window[name];if(typeof old!=="function")return;
    window[name]=function(...args){
      if(!G.combat)return old.apply(this,args);
      const before=Number(G.combat.hp||0),max=Number(G.combat.maxHp||before);
      setActionLock();
      const result=old.apply(this,args);
      const after=G.combat?Number(G.combat.hp||0):0;
      const damage=Math.max(0,before-after);
      const kind=typeof kindResolver==="function"?kindResolver(...args):"physical";
      const critical=damage>0&&damage>=Math.max(12,Math.floor(max*.28));
      hitEnemy(damage,{kind,critical,label:statusLabel()});
      return result;
    };
  }

  wrapEnemyAction("weaponAttack",()=> "physical");
  wrapEnemyAction("specialSkill",()=> "physical");
  wrapEnemyAction("castSpell",(i)=>effectKindFromSpell(G.spells?.[i]));

  const oldEnemyDamage=window.enemyDamage;
  if(typeof oldEnemyDamage==="function"){
    window.enemyDamage=function(...args){
      const before=Number(G.hp||0);
      const result=oldEnemyDamage.apply(this,args);
      const damage=Math.max(0,before-Number(G.hp||0));
      hitPlayer(damage);
      return result;
    };
  }

  const oldUpdateCombat=window.updateCombat;
  if(typeof oldUpdateCombat==="function"){
    window.updateCombat=function(...args){
      const result=oldUpdateCombat.apply(this,args);
      const bar=document.getElementById("enemyBar");
      const pbar=document.getElementById("combatPlayerHpBar");
      if(bar)bar.classList.add("combat-smooth-bar");
      if(pbar)pbar.classList.add("combat-smooth-bar");
      return result;
    };
  }

  window.toggleCombatHaptics=function(){
    haptics=!haptics;
    localStorage.setItem(STORAGE_KEY,haptics?"on":"off");
    renderHapticToggle();
    if(haptics)vibrate(20);
  };
  function renderHapticToggle(){
    const b=document.getElementById("combatHapticToggle");if(!b)return;
    b.textContent=haptics?"📳 진동 ON":"📴 진동 OFF";
    b.classList.toggle("off",!haptics);
    b.setAttribute("aria-pressed",String(haptics));
  }
  window.combatFeedbackTest=function(){
    hitEnemy(9,{kind:"physical",label:"타격 테스트"});
  };
  renderHapticToggle();
})();