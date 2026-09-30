/* v0.5.8 — F-rank guild request board */
(()=>{
  const MAX_ACTIVE=3,BOARD_SIZE=5;
  const F_QUESTS={
    herb_red:{title:"붉은 약초 납품",type:"collect",target:"붉은 약초",qty:5,difficulty:"쉬움",place:"서쪽 숲",method:"야외 약초 채집",desc:"초보 치료약에 쓸 붉은 약초를 길드에 납품한다.",reward:{gold:14,gp:3}},
    herb_blue:{title:"푸른 약초 납품",type:"collect",target:"푸른 약초",qty:4,difficulty:"쉬움",place:"서쪽 숲",method:"야외 약초 채집",desc:"마나 회복약 재료로 쓰이는 푸른 약초를 모은다.",reward:{gold:15,gp:3,relation:{npc:"리엔",aff:1}}},
    antidote_herb:{title:"해독초 비축",type:"collect",target:"해독초",qty:2,difficulty:"쉬움",place:"안개 습지",minLevel:2,minRep:2,method:"습지 채집·탐색",desc:"습지 의뢰에 대비해 해독초를 비축한다.",reward:{gold:19,gp:4,item:{name:"해독제",qty:1}}},
    clear_slime:{title:"맑은 점액 납품",type:"collect",target:"맑은 점액",qty:3,difficulty:"보통",place:"강변 부두",method:"이끼 슬라임 처치",desc:"연금술 길드에서 슬라임 점액을 구하고 있다.",reward:{gold:18,gp:4}},
    frog_hide:{title:"개구리 가죽 납품",type:"collect",target:"개구리 가죽",qty:2,difficulty:"보통",place:"강변 부두",method:"강변 큰개구리 처치",desc:"방수 가공 시험용 개구리 가죽을 납품한다.",reward:{gold:20,gp:4}},
    bat_hide:{title:"박쥐 가죽 납품",type:"collect",target:"박쥐 가죽",qty:3,difficulty:"보통",place:"북쪽 채석장",method:"먼지날개 박쥐 처치",desc:"가벼운 가죽 장비 시험용 박쥐 가죽을 모은다.",reward:{gold:22,gp:4}},
    coal_supply:{title:"대장간 석탄 조달",type:"collect",target:"석탄",qty:4,difficulty:"쉬움",place:"북쪽 채석장",method:"채광",desc:"브람의 대장간에 급하게 필요한 석탄을 조달한다.",reward:{gold:20,gp:4,relation:{npc:"브람",aff:1}}},
    clay_supply:{title:"성벽 보수용 점토",type:"collect",target:"점토",qty:3,difficulty:"쉬움",place:"북쪽 채석장",method:"채광",desc:"마을 외벽 보수에 쓸 점토를 납품한다.",reward:{gold:16,gp:3}},
    hunt_slime:{title:"이끼 슬라임 정리",type:"hunt",target:"forest_slime",qty:3,difficulty:"보통",place:"서쪽 숲",desc:"길가까지 내려온 이끼 슬라임을 세 마리 처치한다.",reward:{gold:23,gp:4}},
    hunt_frog:{title:"농장 큰개구리 퇴치",type:"hunt",target:"river_frog",qty:2,difficulty:"보통",place:"남쪽 농장",desc:"농작물을 망치는 강변 큰개구리를 두 마리 처치한다.",reward:{gold:24,gp:4,rep:1}},
    hunt_wolf:{title:"어린 회색늑대 견제",type:"hunt",target:"young_wolf",qty:2,difficulty:"위험",place:"옛 왕도길",desc:"행상인을 따라붙는 어린 회색늑대 두 마리를 처치한다.",reward:{gold:27,gp:5}},
    hunt_bat:{title:"채석장 박쥐 퇴치",type:"hunt",target:"dust_bat",qty:3,difficulty:"보통",place:"북쪽 채석장",desc:"작업을 방해하는 먼지날개 박쥐 세 마리를 처치한다.",reward:{gold:28,gp:5}},
    hunt_goblin:{title:"고블린 정찰병 퇴치",type:"hunt",target:"goblin",qty:2,difficulty:"위험",place:"서쪽 숲",desc:"서쪽 숲 길목을 맴도는 고블린 정찰병 두 마리를 처치한다.",reward:{gold:32,gp:5,rep:1}},
    visit_farm:{title:"남쪽 농장 피해 조사",type:"visit",target:"남쪽 농장",qty:1,difficulty:"쉬움",place:"남쪽 농장",desc:"남쪽 농장을 직접 방문해 울타리와 작물 피해를 확인한다.",reward:{gold:13,gp:3}},
    visit_dock:{title:"강변 부두 순찰",type:"visit",target:"강변 부두",qty:1,difficulty:"쉬움",place:"강변 부두",desc:"부두 주변을 한 차례 순찰하고 길드에 상황을 보고한다.",reward:{gold:13,gp:3}},
    visit_logging:{title:"벌목지 안전 확인",type:"visit",target:"동쪽 벌목지",qty:1,difficulty:"쉬움",place:"동쪽 벌목지",desc:"동쪽 벌목지까지 이동해 작업로가 안전한지 확인한다.",reward:{gold:15,gp:3}},
    visit_quarry:{title:"채석장 작업로 확인",type:"visit",target:"북쪽 채석장",qty:1,difficulty:"쉬움",place:"북쪽 채석장",desc:"북쪽 채석장의 작업로와 몬스터 흔적을 확인한다.",reward:{gold:15,gp:3}},
    visit_road:{title:"옛 왕도길 행상로 확인",type:"visit",target:"옛 왕도길",qty:1,difficulty:"보통",place:"옛 왕도길",desc:"옛 왕도길을 직접 확인해 행상인이 지나갈 수 있는지 보고한다.",reward:{gold:18,gp:4}}
  };
  window.F_RANK_QUESTS=F_QUESTS;

  function ensureState(){
    G.guildRequests=Array.isArray(G.guildRequests)?G.guildRequests:[];
    G.guildQuestHistory=Array.isArray(G.guildQuestHistory)?G.guildQuestHistory:[];
    G.guildQuestCounters=G.guildQuestCounters||{visits:{}};
    G.guildQuestCounters.visits=G.guildQuestCounters.visits||{};
    G.guildQuestStats=Object.assign({completed:0},G.guildQuestStats||{});
    if(!G.guildBoard||!Array.isArray(G.guildBoard.ids))G.guildBoard={day:0,ids:[]};
    refreshBoardIfNeeded();
  }
  function hash(text){
    let h=2166136261;
    for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}
    return h>>>0;
  }
  function sortedBySeed(list,seed){
    return [...list].sort((a,b)=>hash(seed+"|"+a.id)-hash(seed+"|"+b.id));
  }
  function questAccessible(q){
    if((q.minLevel||1)>G.level)return false;
    if((q.minRep||0)>G.rep)return false;
    if(q.place&&typeof placeUnlocked==="function"&&!placeUnlocked(q.place))return false;
    return true;
  }
  function makeBoard(day){
    const active=new Set(G.guildRequests.map(r=>r.id));
    const recent=new Set(G.guildQuestHistory.filter(h=>h.day>=day-1).map(h=>h.id));
    let pool=Object.entries(F_QUESTS).map(([id,q])=>({id,...q})).filter(q=>questAccessible(q)&&!active.has(q.id)&&!recent.has(q.id));
    if(pool.length<BOARD_SIZE)pool=Object.entries(F_QUESTS).map(([id,q])=>({id,...q})).filter(q=>questAccessible(q)&&!active.has(q.id));
    const seed=(G.name||"이방인")+"|"+day;
    const picks=[];
    for(const type of ["collect","hunt","visit"]){
      const row=sortedBySeed(pool.filter(q=>q.type===type),seed+"|"+type)[0];
      if(row&&!picks.some(x=>x.id===row.id))picks.push(row);
    }
    for(const q of sortedBySeed(pool,seed+"|fill")){
      if(picks.length>=BOARD_SIZE)break;
      if(!picks.some(x=>x.id===q.id))picks.push(q);
    }
    return picks.slice(0,BOARD_SIZE).map(q=>q.id);
  }
  function refreshBoardIfNeeded(){
    if(!G.guildBoard||G.guildBoard.day!==G.day){
      G.guildBoard={day:G.day,ids:makeBoard(G.day)};
    }else{
      G.guildBoard.ids=G.guildBoard.ids.filter(id=>F_QUESTS[id]);
    }
  }
  function boardUnlocked(){return G.rank!=="미등록"&&G.scoutQuest?.status==="completed";}
  function typeLabel(type){return {collect:"납품",hunt:"퇴치",visit:"조사"}[type]||"의뢰";}
  function rewardText(q){
    const r=q.reward||{};let out=[`${r.gold||0}G`,`공헌 +${r.gp||0}`];
    if(r.rep)out.push(`평판 +${r.rep}`);
    if(r.item)out.push(`${r.item.name} ×${r.item.qty}`);
    if(r.relation)out.push(`${r.relation.npc} 친밀도 +${r.relation.aff}`);
    return out.join(" · ");
  }
  function progressOf(req){
    const q=F_QUESTS[req.id];if(!q)return 0;
    if(q.type==="collect")return Math.min(q.qty,G.materials?.[q.target]||0);
    if(q.type==="hunt")return Math.min(q.qty,Math.max(0,(G.monsterKills?.[q.target]||0)-(req.baseKills||0)));
    if(q.type==="visit")return Math.min(q.qty,Math.max(0,(G.guildQuestCounters.visits?.[q.target]||0)-(req.baseVisits||0)));
    return 0;
  }
  function questComplete(req){const q=F_QUESTS[req.id];return !!q&&progressOf(req)>=q.qty;}
  function acceptQuest(id){
    ensureState();if(!boardUnlocked())return false;
    if(!G.guildBoard.ids.includes(id)||!F_QUESTS[id])return false;
    if(G.guildQuestHistory.some(h=>h.id===id&&h.day===G.day))return false;
    if(G.guildRequests.some(r=>r.id===id))return false;
    if(G.guildRequests.length>=MAX_ACTIVE){add("미라","“동시에 맡을 수 있는 F급 의뢰는 세 건까지예요. 먼저 하나를 마치고 와주세요.”");return false;}
    const q=F_QUESTS[id];
    G.guildRequests.push({
      id,acceptedDay:G.day,
      baseKills:q.type==="hunt"?(G.monsterKills?.[q.target]||0):0,
      baseVisits:q.type==="visit"?(G.guildQuestCounters.visits?.[q.target]||0):0
    });
    add("미라",`“<b>${q.title}</b> 의뢰를 접수했어요. 무리하지 말고, 끝나면 길드에서 보고해주세요.”`);
    renderGuildQuestBoard();return true;
  }
  function abandonQuest(id){
    const i=G.guildRequests.findIndex(r=>r.id===id);if(i<0)return false;
    const q=F_QUESTS[id];G.guildRequests.splice(i,1);
    add("미라",`“${q?.title||"의뢰"}는 취소 처리할게요. 다음에는 할 수 있는 만큼만 받아가요.”`);
    renderGuildQuestBoard();return true;
  }
  function giveReward(q){
    const r=q.reward||{};
    G.gold+=(r.gold||0);if(typeof addGuildPoints==="function")addGuildPoints(r.gp||0);
    G.rep+=(r.rep||0);
    if(r.item){
      if(G.consumables&&Object.prototype.hasOwnProperty.call(G.consumables,r.item.name))G.consumables[r.item.name]=(G.consumables[r.item.name]||0)+r.item.qty;
      else {G.materials??={};G.materials[r.item.name]=(G.materials[r.item.name]||0)+r.item.qty;}
    }
    if(r.relation){
      G.relations??={};G.relations[r.relation.npc]??={aff:1,note:"브렌에서 알게 된 인연."};
      G.relations[r.relation.npc].aff=(G.relations[r.relation.npc].aff||0)+r.relation.aff;
    }
  }
  function turnInQuest(id){
    ensureState();if(G.location!=="모험가 길드")return false;
    const i=G.guildRequests.findIndex(r=>r.id===id);if(i<0)return false;
    const req=G.guildRequests[i],q=F_QUESTS[id];if(!q||!questComplete(req))return false;
    if(q.type==="collect"){
      if((G.materials?.[q.target]||0)<q.qty)return false;
      G.materials[q.target]-=q.qty;
    }
    giveReward(q);G.guildRequests.splice(i,1);
    G.guildQuestHistory.push({id,day:G.day});if(G.guildQuestHistory.length>40)G.guildQuestHistory.splice(0,G.guildQuestHistory.length-40);
    G.guildQuestStats.completed=(G.guildQuestStats.completed||0)+1;
    add("미라",`“<b>${q.title}</b> 확인했어요. 수고했어요.”<br><b>${rewardText(q)}</b>`);
    renderGuildQuestBoard();return true;
  }

  function placeLabel(q){
    return q.type==="hunt"?"주 출현 지역":q.type==="collect"?"권장 획득 지역":"조사 지역";
  }
  function goToQuestPlace(id){
    const q=F_QUESTS[id];if(!q?.place||G.combat)return false;
    closeBoard();
    if(G.location===q.place){add("system",`이미 <b>${q.place}</b>에 도착해 있다.`);return true;}
    if(typeof travelTo==="function"){travelTo(q.place);return true;}
    if(typeof move==="function"){move(q.place);return true;}
    return false;
  }
  function highlightQuestMapTarget(place){
    const list=document.getElementById("mapPlaceList");if(!list)return;
    const cards=[...list.querySelectorAll(".map-place")];
    let target=null;
    for(const card of cards){
      card.classList.remove("guild-quest-map-target");
      if(card.querySelector("b")?.textContent===place)target=card;
    }
    if(target){
      target.classList.add("guild-quest-map-target");
      target.scrollIntoView?.({block:"nearest",behavior:"smooth"});
    }
  }
  function openQuestMap(id){
    const q=F_QUESTS[id];if(!q?.place||typeof openWorldMap!=="function")return false;
    window.guildQuestMapTarget=q.place;closeBoard();openWorldMap("bren");
    setTimeout(()=>highlightQuestMapTarget(q.place),0);return true;
  }
  function questCard(id,active=false){
    const q=F_QUESTS[id];if(!q)return "";
    const req=G.guildRequests.find(r=>r.id===id),progress=req?progressOf(req):0,done=req&&questComplete(req);
    const diffClass=q.difficulty==="위험"?"risk":q.difficulty==="보통"?"normal":"easy";
    let button="";
    if(active){
      button=done&&G.location==="모험가 길드"
        ?`<button class="good" onclick="turnInGuildQuest('${id}')">완료 보고</button>`
        :`<button disabled>${done?"길드에서 보고 가능":`진행 ${progress}/${q.qty}`}</button>`;
      button+=` <button class="guild-quest-abandon" onclick="abandonGuildQuest('${id}')">포기</button>`;
    }else{
      const accepted=!!req,full=G.guildRequests.length>=MAX_ACTIVE;
      button=`<button class="primary" ${accepted||full?"disabled":""} onclick="acceptGuildQuest('${id}')">${accepted?"수락 중":full?"동시 3건 한도":"수락"}</button>`;
    }
    const objective=q.type==="hunt"?(MONSTERS[q.target]?.name||q.target):q.target;
    const atPlace=G.location===q.place;
    const travelButton=active
      ?`<button class="guild-quest-travel" ${atPlace?"disabled":""} onclick="goToGuildQuestPlace('${id}')">${atPlace?"현재 위치":"📍 해당 지역으로 이동"}</button>`
      :"";
    const mapButton=`<button class="guild-quest-map" onclick="openGuildQuestMap('${id}')">🗺️ 지도에서 보기</button>`;
    return `<div class="guild-quest-card ${diffClass} ${done?"complete":""}">
      <div class="guild-quest-head"><b>${q.title}</b><span>${q.difficulty} · ${typeLabel(q.type)}</span></div>
      <div class="small">${q.desc}</div>
      <div class="guild-quest-place">📍 <b>${placeLabel(q)}</b> · ${q.place}</div>
      ${q.method?`<div class="guild-quest-method">획득 방법 · ${q.method}</div>`:""}
      <div class="guild-quest-objective">목표 · ${objective} ${q.qty}${q.type==="hunt"?"마리":q.type==="visit"?"회":"개"}${active?` · <b>${progress}/${q.qty}</b>`:""}</div>
      <div class="guild-quest-reward">보상 · ${rewardText(q)}</div>
      <div class="guild-quest-nav">${mapButton}${travelButton}</div>
      <div class="guild-quest-buttons">${button}</div>
    </div>`;
  }

  function ensureModal(){
    if(document.getElementById("guildQuestModal"))return;
    const modal=document.createElement("div");modal.id="guildQuestModal";modal.className="modal hidden";
    modal.innerHTML=`<div class="guild-quest-modal">
      <div class="guild-quest-title"><div><h2>📜 브렌 길드 · F급 의뢰 게시판</h2><p class="small">첫 정찰을 마친 F급 모험가에게 공개됩니다. 게시 의뢰는 매일 일부 교체되며 동시에 3건까지 받을 수 있습니다.</p></div><button type="button" aria-label="의뢰 게시판 닫기" onclick="closeGuildQuestBoard()">✕</button></div>
      <div id="guildQuestBoardInfo"></div>
      <h3>수락 중인 의뢰</h3><div id="guildQuestActive"></div>
      <h3>오늘의 게시 의뢰</h3><div id="guildQuestAvailable"></div>
    </div>`;
    modal.addEventListener("click",e=>{if(e.target===modal)closeGuildQuestBoard();});
    document.body.appendChild(modal);
  }
  function renderGuildQuestBoard(){
    ensureState();ensureModal();
    const modal=document.getElementById("guildQuestModal");
    const info=document.getElementById("guildQuestBoardInfo"),active=document.getElementById("guildQuestActive"),available=document.getElementById("guildQuestAvailable");
    if(!boardUnlocked()){
      info.innerHTML='<div class="guild-board-lock">🔒 첫 번째 「서쪽 숲 정찰」을 완료하면 F급 게시판이 열린다.</div>';
      active.innerHTML="";available.innerHTML="";return;
    }
    info.innerHTML=`<div class="guild-board-meta">제 ${G.day}일 게시판 · 오늘 ${G.guildBoard.ids.length}건 · 수락 ${G.guildRequests.length}/${MAX_ACTIVE} · 누적 완료 ${G.guildQuestStats.completed||0}건</div>`;
    active.innerHTML=G.guildRequests.length?G.guildRequests.map(r=>questCard(r.id,true)).join(""):'<div class="small guild-empty">현재 수락한 F급 의뢰가 없다.</div>';
    const completedToday=new Set(G.guildQuestHistory.filter(h=>h.day===G.day).map(h=>h.id));
    const ids=G.guildBoard.ids.filter(id=>!G.guildRequests.some(r=>r.id===id)&&!completedToday.has(id));
    available.innerHTML=ids.length?ids.map(id=>questCard(id,false)).join(""):'<div class="small guild-empty">오늘 남은 게시 의뢰가 없다. 내일 다시 확인해보자.</div>';
    if(!modal.classList.contains("hidden"))modal.scrollTop=0;
  }
  function openBoard(){ensureModal();renderGuildQuestBoard();document.getElementById("guildQuestModal").classList.remove("hidden");}
  function closeBoard(){document.getElementById("guildQuestModal")?.classList.add("hidden");}

  function appendGuildBoardAction(){
    if(!boardUnlocked()||G.location!=="모험가 길드")return;
    const root=document.getElementById("actions");if(!root||root.querySelector(".guild-board-action"))return;
    const b=document.createElement("button");b.className="choice-btn primary guild-board-action";
    b.innerHTML='<span class="choice-icon">📜</span>F급 의뢰 게시판<span class="choice-sub">오늘의 의뢰 5건 · 최대 3건 수락</span>';
    b.onclick=openBoard;root.appendChild(b);
  }
  function appendQuestSummary(){
    if(!boardUnlocked())return;
    const box=document.getElementById("questBox");if(!box||box.querySelector(".guild-request-summary"))return;
    const wrap=document.createElement("div");wrap.className="guild-request-summary";
    if(!G.guildRequests.length){
      wrap.innerHTML='<b>📜 F급 의뢰</b><br><span class="small">길드 게시판에서 오늘의 의뢰를 받을 수 있다.</span>';
    }else{
      wrap.innerHTML='<b>📜 수락한 F급 의뢰</b>'+G.guildRequests.map(r=>{
        const q=F_QUESTS[r.id],p=progressOf(r);return `<div class="guild-request-line"><span>${q.title}</span><b>${p}/${q.qty}</b></div>`;
      }).join("");
    }
    box.appendChild(wrap);
  }

  const baseRender=window.render;
  window.render=function(){
    ensureState();const out=baseRender.apply(this,arguments);appendGuildBoardAction();appendQuestSummary();return out;
  };
  const baseMove=window.move;
  window.move=function(place){
    ensureState();const before=G.location,out=baseMove.apply(this,arguments);
    if(G.location!==before&&G.location===place)G.guildQuestCounters.visits[place]=(G.guildQuestCounters.visits[place]||0)+1;
    return out;
  };
  if(typeof window.renderMapTab==="function"){
    const baseRenderMapTab=window.renderMapTab;
    window.renderMapTab=function(tab){
      const out=baseRenderMapTab.apply(this,arguments);
      if(tab==="bren"&&window.guildQuestMapTarget)setTimeout(()=>highlightQuestMapTarget(window.guildQuestMapTarget),0);
      return out;
    };
  }
  if(typeof window.openGuild==="function"){
    const baseOpenGuild=window.openGuild;
    window.openGuild=function(){
      const out=baseOpenGuild.apply(this,arguments);
      if(boardUnlocked()&&!document.getElementById("guildBoardInsideGuild")){
        const b=document.createElement("button");b.id="guildBoardInsideGuild";b.className="primary";b.textContent="📜 F급 의뢰 게시판";
        b.onclick=()=>{closeGuild?.();openBoard();};document.getElementById("guildInfo")?.appendChild(b);
      }
      return out;
    };
  }

  window.ensureGuildQuestState=ensureState;
  window.openGuildQuestBoard=openBoard;
  window.closeGuildQuestBoard=closeBoard;
  window.renderGuildQuestBoard=renderGuildQuestBoard;
  window.acceptGuildQuest=acceptQuest;
  window.abandonGuildQuest=abandonQuest;
  window.turnInGuildQuest=turnInQuest;
  window.goToGuildQuestPlace=goToQuestPlace;
  window.openGuildQuestMap=openQuestMap;
  window.guildQuestProgress=progressOf;
  window.guildQuestComplete=questComplete;
  ensureState();render();
})();