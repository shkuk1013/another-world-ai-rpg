/* v0.5.9 — UI behavior polish */
(()=>{
  let inventoryTab="equipment";

  function switchInventoryTab(tab){
    const pane=document.getElementById("paneInventory");if(!pane)return;
    const allowed=["equipment","consumables","materials","tools"];
    inventoryTab=allowed.includes(tab)?tab:"equipment";
    pane.querySelectorAll("[data-inventory-tab]").forEach(btn=>{
      const on=btn.dataset.inventoryTab===inventoryTab;
      btn.classList.toggle("active",on);
      btn.setAttribute("aria-selected",on?"true":"false");
    });
    pane.querySelectorAll("[data-inventory-panel]").forEach(panel=>{
      panel.classList.toggle("active",panel.dataset.inventoryPanel===inventoryTab);
    });
    pane.querySelector(".side-content")?.scrollTo?.(0,0);
  }

  function applyMenuRune(){
    const menuButton=document.querySelector('.mobile-bottom-nav button[data-action="menu"]');
    const icon=menuButton?.querySelector(".mobile-nav-icon");
    if(!icon)return;
    icon.classList.remove("icon-magic");
    icon.classList.add("icon-menu-rune");
  }

  function refreshCombatIntentStyle(){
    const intent=document.getElementById("enemyIntent");if(!intent)return;
    const text=intent.textContent||"";
    intent.classList.toggle("intent-danger",/강한 공격|찌르기|공격|돌진|베기|내려찍기/.test(text));
    intent.classList.toggle("intent-guard",/방어|막기|자세/.test(text));
    intent.classList.toggle("intent-trick",/모래|독|마법|주문|기습|견제/.test(text));
  }

  function refreshCombatArmor(){
    const panel=document.querySelector("#combatModal .combat-status-card");
    if(!panel)return;
    let chip=panel.querySelector(".combat-armor-chip");
    if(!chip){
      chip=document.createElement("div");
      chip.className="combat-armor-chip";
      panel.appendChild(chip);
    }
    const armor=G.equipment?.armor;
    chip.textContent=`🛡️ ${armor?.name||"방어구 없음"} · DEF ${Number(armor?.def||0)}`;
  }

  const originalSwitch=window.switchSideTab;
  if(typeof originalSwitch==="function"){
    window.switchSideTab=function(tab){
      const out=originalSwitch.apply(this,arguments);
      if(tab==="inventory")requestAnimationFrame(()=>switchInventoryTab(inventoryTab));
      return out;
    };
  }

  const originalCombatUpdate=window.updateCombat;
  if(typeof originalCombatUpdate==="function"){
    window.updateCombat=function(){
      const out=originalCombatUpdate.apply(this,arguments);
      refreshCombatIntentStyle();
      refreshCombatArmor();
      return out;
    };
  }

  const originalRender=window.render;
  if(typeof originalRender==="function"){
    window.render=function(){
      const out=originalRender.apply(this,arguments);
      switchInventoryTab(inventoryTab);
      applyMenuRune();
      return out;
    };
  }

  window.switchInventoryTab=switchInventoryTab;
  window.getInventoryTab=()=>inventoryTab;

  switchInventoryTab(inventoryTab);
  applyMenuRune();
  refreshCombatIntentStyle();
  refreshCombatArmor();
})();