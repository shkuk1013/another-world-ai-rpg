/* v0.5.3 local draft — mobile navigation and compact condition HUD */
(()=>{
  const side=document.querySelector(".side-panel");
  if(!side)return;

  const nav=document.createElement("nav");
  nav.className="mobile-bottom-nav";
  nav.setAttribute("aria-label","모바일 게임 메뉴");
  nav.innerHTML=`
    <button data-tab="quest"><span class="mobile-nav-icon">📜</span><span>퀘스트</span></button>
    <button data-tab="inventory"><span class="mobile-nav-icon">🎒</span><span>가방</span></button>
    <button data-action="map"><span class="mobile-nav-icon">🗺️</span><span>지도</span></button>
    <button data-tab="character"><span class="mobile-nav-icon">⚔️</span><span>캐릭터</span></button>
    <button data-action="menu"><span class="mobile-nav-icon">☰</span><span>메뉴</span></button>`;
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
      <button data-menu="social">🤝 동료 / 관계</button>
      <button data-menu="codex">👹 몬스터 도감</button>
      <button data-menu="collection">📚 수집 도감</button>
      <button data-menu="titles">🏅 칭호</button>
      <button data-menu="save">💾 저장</button>
      <button data-menu="load">↩ 불러오기</button>
    </div>
    <button class="mobile-menu-close">닫기</button>
  </section>`;
  document.body.appendChild(menu);

  function mobileMode(){return matchMedia("(max-width:1180px)").matches}
  function markActive(tab){
    nav.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  }
  function openSide(tab){
    if(!mobileMode())return;
    switchSideTab(tab);
    side.classList.add("mobile-sheet-open");
    close.style.display="grid";
    markActive(tab);
    requestAnimationFrame(()=>side.querySelector(".side-content")?.scrollTo?.(0,0));
  }
  function closeSide(){
    side.classList.remove("mobile-sheet-open");
    close.style.display="none";
    markActive(null);
  }
  function openMenu(){if(!mobileMode())return;closeSide();menu.classList.add("open")}
  function closeMenu(){menu.classList.remove("open")}

  nav.addEventListener("click",e=>{
    const b=e.target.closest("button");if(!b)return;
    if(b.dataset.tab)return openSide(b.dataset.tab);
    if(b.dataset.action==="map"){closeSide();openWorldMap("bren");}
    if(b.dataset.action==="menu")openMenu();
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