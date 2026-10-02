/* v0.5.3 local draft — mobile navigation and compact condition HUD */
(()=>{
  const side=document.querySelector(".side-panel");
  if(!side)return;

  const nav=document.createElement("nav");
  nav.className="mobile-bottom-nav";
  nav.setAttribute("aria-label","모바일 게임 메뉴");
  nav.innerHTML=`
    <button data-tab="quest"><img class="mobile-nav-icon fantasy-ui-icon" src="assets/ui/icons/quest-v1.svg" alt=""><span>퀘스트</span></button>
    <button data-tab="inventory"><img class="mobile-nav-icon fantasy-ui-icon" src="assets/ui/icons/bag-v1.svg" alt=""><span>가방</span></button>
    <button data-action="map"><img class="mobile-nav-icon fantasy-ui-icon" src="assets/ui/icons/map-v1.svg" alt=""><span>지도</span></button>
    <button data-tab="character"><img class="mobile-nav-icon fantasy-ui-icon" src="assets/ui/icons/character-v1.svg" alt=""><span>캐릭터</span></button>
    <button data-action="menu"><img class="mobile-nav-icon fantasy-ui-icon" src="assets/ui/icons/menu-v1.svg" alt=""><span>메뉴</span></button>`;
  document.body.appendChild(nav);

  const close=document.createElement("button");
  close.className="mobile-sheet-close";
  close.type="button";close.textContent="✕";close.setAttribute("aria-label","정보창 닫기");
  document.body.appendChild(close);
  close.style.display="none";

  const menu=document.createElement("div");
  menu.className="mobile-menu-overlay";
  menu.innerHTML=`<section class="mobile-menu-card" role="dialog" aria-modal="true" aria-label="게임 메뉴">
    <div class="mobile-menu-head"><h3>게임 메뉴</h3><button type="button" class="mobile-menu-home" aria-label="게임 화면으로 돌아가기">⌂</button><button type="button" class="mobile-menu-x" aria-label="메뉴 닫기">✕</button></div>
    <div class="mobile-menu-grid">
      <button class="fantasy-decorated" data-menu="social"><img class="fantasy-ui-icon menu-fantasy-icon" src="assets/ui/icons/guild-v1.svg" alt=""><span>동료 / 관계</span></button>
      <button class="fantasy-decorated" data-menu="codex"><img class="fantasy-ui-icon menu-fantasy-icon" src="assets/ui/icons/magic-v1.svg" alt=""><span>몬스터 도감</span></button>
      <button class="fantasy-decorated" data-menu="collection"><img class="fantasy-ui-icon menu-fantasy-icon" src="assets/ui/icons/quest-v1.svg" alt=""><span>수집 도감</span></button>
      <button class="fantasy-decorated" data-menu="titles"><img class="fantasy-ui-icon menu-fantasy-icon" src="assets/ui/icons/character-v1.svg" alt=""><span>칭호</span></button>
      <button data-menu="save">💾 저장</button>
      <button data-menu="load">↩ 불러오기</button>
    </div>
    <button class="mobile-menu-close">닫기</button>
  </section>`;
  document.body.appendChild(menu);

  const FANTASY_ICON_SRC={"icon-quest":"assets/ui/icons/quest-v1.svg","icon-bag":"assets/ui/icons/bag-v1.svg","icon-map":"assets/ui/icons/map-v1.svg","icon-character":"assets/ui/icons/character-v1.svg","icon-guild":"assets/ui/icons/guild-v1.svg","icon-forge":"assets/ui/icons/forge-v1.svg","icon-inn":"assets/ui/icons/inn-v1.svg","icon-magic":"assets/ui/icons/magic-v1.svg","icon-menu-rune":"assets/ui/icons/menu-v1.svg"};
  function makeFantasyIcon(iconClass,sizeClass){
    const icon=document.createElement("img");
    icon.className=`fantasy-ui-icon ${sizeClass||""}`;
    icon.src=FANTASY_ICON_SRC[iconClass]||FANTASY_ICON_SRC["icon-bag"];
    icon.alt="";
    icon.setAttribute("aria-hidden","true");
    return icon;
  }
  function decorateButton(button,iconClass,sizeClass){
    if(!button||button.classList.contains("fantasy-decorated"))return;
    button.classList.add("fantasy-decorated");
    button.prepend(makeFantasyIcon(iconClass,sizeClass));
  }
  function decorateStaticFantasyUI(){
    const tabIcons={
      tabQuest:"icon-quest",
      tabInventory:"icon-bag",
      tabCharacter:"icon-character",
      tabSocial:"icon-guild"
    };
    for(const [id,icon] of Object.entries(tabIcons)){
      decorateButton(document.getElementById(id),icon,"tab-fantasy-icon");
    }
    document.querySelectorAll(".side-actions button").forEach(button=>{
      const text=(button.textContent||"").trim();
      const icon=/길드/.test(text)?"icon-guild":
        /칭호/.test(text)?"icon-character":
        /제작|연금/.test(text)?"icon-forge":
        /지도/.test(text)?"icon-map":null;
      if(icon)decorateButton(button,icon,"action-fantasy-icon");
    });
  }
  function fantasyChoiceClass(text){
    if(/대장간|장비 제작|강화|제련|무기 \/ 방어구 구매|방어구 구매|무기 구매/.test(text))return "icon-forge";
    if(/여관|숙박|식사|휴식|잠/.test(text))return "icon-inn";
    if(/모험가 길드|길드 등급|길드 등록/.test(text))return "icon-guild";
    if(/마법|리엔|주문|연금|마나/.test(text))return "icon-magic";
    if(/지도|주변 지역 이동|이동/.test(text))return "icon-map";
    if(/의뢰|정찰|보고|흔적 추적/.test(text))return "icon-quest";
    if(/인벤|가방/.test(text))return "icon-bag";
    if(/장비 관리|캐릭터|칭호|숙련/.test(text))return "icon-character";
    return null;
  }
  function decorateFantasyActions(){
    document.querySelectorAll("#actions .choice-btn").forEach(button=>{
      const iconClass=fantasyChoiceClass(button.textContent||"");
      if(!iconClass)return;
      const icon=button.querySelector(".choice-icon");
      if(!icon)return;
      icon.textContent="";
      icon.className="choice-icon fantasy-choice-icon";
      const img=document.createElement("img");
      img.className="fantasy-action-icon";
      img.src=FANTASY_ICON_SRC[iconClass]||FANTASY_ICON_SRC["icon-bag"];
      img.alt="";
      icon.appendChild(img);
    });
  }

  function mobileMode(){return matchMedia("(max-width:1180px)").matches}
  function markActive(tab=null,action=null){
    nav.querySelectorAll("button").forEach(b=>{
      const on=(tab&&b.dataset.tab===tab)||(action&&b.dataset.action===action);
      b.classList.toggle("active",!!on);
    });
  }
  function closeMapIfOpen(){
    const map=document.getElementById("worldMapModal");
    if(map&&!map.classList.contains("hidden")&&typeof window.closeWorldMap==="function")window.closeWorldMap();
  }
  function openSide(tab){
    if(!mobileMode())return;
    closeMapIfOpen();
    closeMenu();
    switchSideTab(tab);
    side.classList.add("mobile-sheet-open");
    close.style.display="grid";
    markActive(tab,null);
    requestAnimationFrame(()=>side.querySelector(".side-content")?.scrollTo?.(0,0));
  }
  function closeSide(){
    side.classList.remove("mobile-sheet-open");
    close.style.display="none";
    const active=nav.querySelector("button.active");
    if(active?.dataset.tab)markActive(null,null);
  }
  function openMenu(){
    if(!mobileMode())return;
    closeMapIfOpen();
    closeSide();
    menu.classList.add("open");
    markActive(null,"menu");
  }
  function closeMenu(){
    menu.classList.remove("open");
    const active=nav.querySelector('button.active[data-action="menu"]');
    if(active)markActive(null,null);
  }

  const baseOpenWorldMap=window.openWorldMap;
  const baseCloseWorldMap=window.closeWorldMap;
  if(typeof baseOpenWorldMap==="function"){
    window.openWorldMap=function(){
      const out=baseOpenWorldMap.apply(this,arguments);
      if(mobileMode())markActive(null,"map");
      return out;
    };
  }
  if(typeof baseCloseWorldMap==="function"){
    window.closeWorldMap=function(){
      const out=baseCloseWorldMap.apply(this,arguments);
      const active=nav.querySelector('button.active[data-action="map"]');
      if(active)markActive(null,null);
      return out;
    };
  }

  nav.addEventListener("click",e=>{
    const b=e.target.closest("button");if(!b)return;

    if(b.dataset.tab){
      const sameOpen=side.classList.contains("mobile-sheet-open")&&b.classList.contains("active");
      if(sameOpen)return closeSide();
      return openSide(b.dataset.tab);
    }

    if(b.dataset.action==="map"){
      const map=document.getElementById("worldMapModal");
      const mapOpen=map&&!map.classList.contains("hidden");
      if(mapOpen)return closeWorldMap();
      closeSide();closeMenu();return openWorldMap("bren");
    }

    if(b.dataset.action==="menu"){
      if(menu.classList.contains("open"))return closeMenu();
      return openMenu();
    }
  });
  close.onclick=closeSide;
  menu.addEventListener("click",e=>{
    if(e.target===menu||e.target.closest(".mobile-menu-close")||e.target.closest(".mobile-menu-x"))return closeMenu();
    if(e.target.closest(".mobile-menu-home")){closeMenu();returnToGameHome();return;}
    const b=e.target.closest("[data-menu]");if(!b)return;
    const a=b.dataset.menu;
    closeMenu();
    if(a==="social")openSide("social");
    else if(a==="codex")openCodex();
    else if(a==="collection")openCollectionCodex();
    else if(a==="titles")openTitles();
    else if(a==="save")saveGame();
    else if(a==="load")loadGame();
  });

  function refreshConditionHud(){
    const conditions=[
      ["hungerT",Number(G.hunger)>=80],
      ["waterT",Number(G.hydration)<=20],
      ["fatT",Number(G.fatigue)>=80]
    ];
    for(const [id,on] of conditions){
      document.getElementById(id)?.closest(".mini-stat")?.classList.toggle("mobile-condition-alert",!!on);
    }
  }
  if(typeof window.render==="function"){
    const baseRender=window.render;
    window.render=function(){
      const out=baseRender.apply(this,arguments);
      refreshConditionHud();
      decorateStaticFantasyUI();
      decorateFantasyActions();
      return out;
    };
  }
  addEventListener("resize",()=>{if(!mobileMode()){closeSide();closeMenu();}});
  document.addEventListener("pointerdown",e=>{
    if(!mobileMode()||!side.classList.contains("mobile-sheet-open"))return;
    if(side.contains(e.target)||nav.contains(e.target)||close.contains(e.target))return;
    closeSide();
  });
  addEventListener("keydown",e=>{if(e.key==="Escape"){closeSide();closeMenu();}});
  decorateStaticFantasyUI();
  decorateFantasyActions();
  refreshConditionHud();
})();

/* v0.5.3 UX refinement — top-right close/home controls + backdrop close */
(()=>{
  const SAFE_MODAL_CLOSERS={
    craftModal:"closeCrafting",
    marketModal:"closeMarket",
    recipeShopModal:"closeRecipeShop",
    forgeModal:"closeForge",
    enhanceModal:"closeEnhance",
    guildModal:"closeGuild",
    collectionModal:"closeCollectionCodex",
    travelModal:"closeTravel",
    moreActionsModal:"closeMoreActions",
    worldMapModal:"closeWorldMap",
    codexModal:"closeCodex",
    titleModal:"closeTitles"
  };

  function callCloser(modal){
    const fnName=SAFE_MODAL_CLOSERS[modal?.id];
    const fn=fnName&&window[fnName];
    if(typeof fn==="function")fn();
    else modal?.classList.add("hidden");
  }
  function closeUtilityLayers(){
    document.querySelectorAll(".modal:not(.hidden)").forEach(modal=>{
      if(SAFE_MODAL_CLOSERS[modal.id])callCloser(modal);
    });
    document.querySelector(".side-panel")?.classList.remove("mobile-sheet-open");
    document.querySelector(".mobile-menu-overlay")?.classList.remove("open");
    const sideClose=document.querySelector(".mobile-sheet-close");
    if(sideClose)sideClose.style.display="none";
  }
  window.returnToGameHome=function(){
    closeUtilityLayers();
    window.scrollTo?.({top:0,behavior:"smooth"});
  };

  function addModalControls(){
    for(const id of Object.keys(SAFE_MODAL_CLOSERS)){
      const modal=document.getElementById(id);
      const card=modal?.firstElementChild;
      if(!modal||!card||card.querySelector(".modal-corner-controls"))continue;
      card.classList.add("modal-card-with-corner-controls");
      const controls=document.createElement("div");
      controls.className="modal-corner-controls";
      controls.innerHTML=`
        <button type="button" class="modal-home-btn" aria-label="게임 화면으로 돌아가기" title="게임 화면">⌂</button>
        <button type="button" class="modal-x-btn" aria-label="창 닫기" title="닫기">✕</button>`;
      controls.querySelector(".modal-home-btn").onclick=returnToGameHome;
      controls.querySelector(".modal-x-btn").onclick=()=>callCloser(modal);
      card.prepend(controls);

      // Tapping the dimmed backdrop closes utility windows.
      modal.addEventListener("pointerdown",e=>{
        if(e.target===modal)callCloser(modal);
      });
    }
  }

  function addSideHome(){
    const side=document.querySelector(".side-panel");
    if(!side||document.querySelector(".mobile-sheet-home"))return;
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="mobile-sheet-home";
    btn.textContent="⌂";
    btn.setAttribute("aria-label","게임 화면으로 돌아가기");
    btn.title="게임 화면";
    btn.onclick=returnToGameHome;
    document.body.appendChild(btn);

    const originalClose=document.querySelector(".mobile-sheet-close");
    const sync=()=>{
      const open=side.classList.contains("mobile-sheet-open")&&matchMedia("(max-width:1180px)").matches;
      btn.style.display=open?"grid":"none";
    };
    new MutationObserver(sync).observe(side,{attributes:true,attributeFilter:["class"]});
    addEventListener("resize",sync);sync();

  }

  function hideLegacyBottomCloseButtons(){
    if(!matchMedia("(max-width:1180px)").matches)return;
    for(const id of Object.keys(SAFE_MODAL_CLOSERS)){
      const modal=document.getElementById(id),card=modal?.firstElementChild;
      if(!card)continue;
      [...card.children].forEach(el=>{
        if(el.tagName==="BUTTON" && /닫기|취소/.test((el.textContent||"").trim())){
          el.classList.add("legacy-bottom-close");
        }
      });
    }
  }

  addModalControls();
  addSideHome();
  hideLegacyBottomCloseButtons();
  addEventListener("resize",hideLegacyBottomCloseButtons);
})();



/* v0.5.4 — choice anti-spam guard */
(()=>{
  const NARRATIVE_SELECTOR=[
    "#actions .choice-btn",
    "#eventChoices button",
    "#campChoices button",
    "#moreActionsList button"
  ].join(",");
  const TRANSACTION_WORDS=/구매|판매|제작|강화|배우기|숙박|식사|수락|보상/;
  let lockedUntil=0;

  function now(){return performance?.now?.() ?? Date.now();}
  function choiceRoot(button){
    return button.closest("#actions,#eventChoices,#campChoices,#moreActionsList");
  }
  function release(root,button){
    root?.classList.remove("choice-locking");
    if(button){
      button.classList.remove("choice-pending");
      button.removeAttribute("aria-busy");
    }
  }
  function reject(button){
    button?.classList.remove("choice-rejected");
    void button?.offsetWidth;
    button?.classList.add("choice-rejected");
  }
  function lockChoice(button,ms){
    const root=choiceRoot(button);
    lockedUntil=now()+ms;
    button.classList.add("choice-pending");
    button.setAttribute("aria-busy","true");
    // Delay pointer locking until the current click has reached its original handler.
    queueMicrotask(()=>root?.classList.add("choice-locking"));
    setTimeout(()=>release(root,button),ms);
  }

  document.addEventListener("click",e=>{
    const button=e.target.closest("button");
    if(!button||button.disabled)return;

    const isNarrative=button.matches(NARRATIVE_SELECTOR);
    const isTransaction=!isNarrative && TRANSACTION_WORDS.test((button.textContent||"").trim());
    if(!isNarrative&&!isTransaction)return;

    const t=now();
    if(t<lockedUntil){
      e.preventDefault();
      e.stopImmediatePropagation();
      reject(button);
      return;
    }

    // Narrative choices need enough time for the response/render to be perceived.
    // Transactions use a shorter guard to prevent accidental double charges.
    const ms=isNarrative ? (button.classList.contains("bad")||button.classList.contains("warn")?850:650) : 420;
    lockedUntil=t+ms;

    if(isNarrative)lockChoice(button,ms);
    else{
      button.classList.add("choice-pending");
      button.setAttribute("aria-busy","true");
      setTimeout(()=>{
        button.classList.remove("choice-pending");
        button.removeAttribute("aria-busy");
      },ms);
    }
  },true);

  window.choiceInputLocked=()=>now()<lockedUntil;
})();

/* v0.5.4 — relationship rewards are meaningful once per NPC per in-game day */
(()=>{
  function ensureSocialDay(){
    G.dailySocial=G.dailySocial||{day:G.day,npcs:{}};
    if(G.dailySocial.day!==G.day)G.dailySocial={day:G.day,npcs:{}};
  }
  window.canGainDailyAffinity=function(name){
    ensureSocialDay();
    if(G.dailySocial.npcs[name])return false;
    G.dailySocial.npcs[name]=true;
    return true;
  };

  function wrapAffinityTalk(fnName,npc){
    const original=window[fnName];
    if(typeof original!=="function")return;
    window[fnName]=function(){
      const before=Number(G.relations?.[npc]?.aff||0);
      const first=canGainDailyAffinity(npc);
      const result=original.apply(this,arguments);
      if(!first && G.relations?.[npc] && Number(G.relations[npc].aff)>before){
        G.relations[npc].aff=before;
      }
      return result;
    };
  }
  wrapAffinityTalk("talkMira","미라");
  wrapAffinityTalk("talkRien","리엔");
  wrapAffinityTalk("v05InnTalk","에밀리아");
})();