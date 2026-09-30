/* v0.5.8 — blacksmith armor shop + equipment management */
(()=>{
  const ARMOR_SHOP=[
    {id:"thick_travel_wear",name:"두꺼운 여행복",type:"armor",def:1,price:10,tier:0,rarity:"normal",desc:"천을 여러 겹 덧댄 초보 여행자용 방어구."},
    {id:"leather_vest",name:"가죽 조끼",type:"armor",def:2,price:20,tier:0,rarity:"normal",desc:"움직임을 방해하지 않는 가벼운 가죽 방어구."},
    {id:"hunter_leather",name:"사냥꾼 가죽갑옷",type:"armor",def:3,price:32,tier:0,rarity:"normal",desc:"급소를 보강한 실전용 가죽갑옷."},
    {id:"reinforced_leather",name:"보강 가죽갑옷",type:"armor",def:4,price:48,tier:0,rarity:"normal",desc:"금속판을 덧댄 브렌 대장간의 상급 기성품."}
  ];
  const WEAPON_SHOP=Object.values(WEAPONS).map((w,i)=>({
    id:"weapon_"+i,name:w.name,type:w.type,atk:w.atk||0,magic:w.magic||0,def:0,price:w.price,tier:0,rarity:"normal"
  }));
  let shopTab="weapon";

  function makeUid(){
    G.equipmentUidSeed=Number.isFinite(G.equipmentUidSeed)?G.equipmentUidSeed:0;
    G.equipmentUidSeed++;
    return "eq_"+G.equipmentUidSeed;
  }
  function normalizedItem(it){
    if(!it)return null;
    const copy={...it};
    copy.uid=copy.uid||makeUid();
    copy.type=copy.type||"armor";
    copy.atk=Number(copy.atk)||0;copy.def=Number(copy.def)||0;copy.magic=Number(copy.magic)||0;
    copy.enhance=Number(copy.enhance)||0;
    return copy;
  }
  function equippedName(slot){return G.equipment?.[slot]?.name||""}
  function ensureEquipmentState(){
    G.equipment=G.equipment||{weapon:null,armor:null};
    G.equipmentInventory=Array.isArray(G.equipmentInventory)?G.equipmentInventory:[];
    G.equipmentInventory=G.equipmentInventory.map(normalizedItem);

    if(typeof G.equipment.armor==="string"){
      const name=G.equipment.armor||"낡은 여행복";
      G.equipment.armor={name,type:"armor",def:0,tier:0,rarity:"starter"};
    }else if(!G.equipment.armor){
      G.equipment.armor={name:"낡은 여행복",type:"armor",def:0,tier:0,rarity:"starter"};
    }else{
      G.equipment.armor={type:"armor",def:0,...G.equipment.armor};
    }

    const equipped=[G.equipment.weapon,G.equipment.armor].filter(Boolean);
    for(const eq of equipped){
      const same=G.equipmentInventory.find(it=>{
        if(eq.inventoryUid&&it.uid===eq.inventoryUid)return true;
        return it.name===eq.name&&it.type===(eq.type||"armor")&&(it.enhance||0)===(eq.enhance||0);
      });
      if(same){
        eq.inventoryUid=same.uid;
      }else{
        const item=normalizedItem({...eq,type:eq.type||"armor"});
        G.equipmentInventory.push(item);
        eq.inventoryUid=item.uid;
      }
    }
  }
  function isEquipped(it){
    if(!it)return false;
    const slot=it.type==="armor"?"armor":"weapon",eq=G.equipment?.[slot];
    if(!eq)return false;
    return (eq.inventoryUid&&eq.inventoryUid===it.uid) ||
      (!eq.inventoryUid&&eq.name===it.name&&(eq.enhance||0)===(it.enhance||0));
  }
  function statText(it){
    const parts=[];
    if(it.atk)parts.push("공격 "+it.atk);
    if(it.def||it.type==="armor")parts.push("방어 "+(it.def||0));
    if(it.magic)parts.push("마법 "+it.magic);
    return parts.join(" · ")||"능력치 없음";
  }
  function currentFor(item){
    return item.type==="armor"?G.equipment.armor:G.equipment.weapon;
  }
  function compareText(item){
    const cur=currentFor(item);
    const key=item.type==="armor"?"def":item.magic?"magic":"atk";
    const now=Number(cur?.[key]||0),next=Number(item[key]||0),d=next-now;
    if(!cur)return "현재 장비 없음";
    if(d>0)return `${key==="def"?"방어":key==="magic"?"마법":"공격"} +${d}`;
    if(d<0)return `${key==="def"?"방어":key==="magic"?"마법":"공격"} ${d}`;
    return "현재 장비와 동일";
  }
  function ownsShopItem(item){
    ensureEquipmentState();
    if(equippedName(item.type==="armor"?"armor":"weapon")===item.name)return "equipped";
    return G.equipmentInventory.some(it=>it.name===item.name&&it.type===item.type)?"owned":"";
  }
  function addShopItem(item){
    ensureEquipmentState();
    const state=ownsShopItem(item);
    if(state)return false;
    if(G.gold<item.price){add("브람","“골드가 조금 모자라는군. 장비는 외상으로 내주기 어렵지.”");return false;}
    G.gold-=item.price;
    G.equipmentInventory.push(normalizedItem({...item,source:"브렌 대장간"}));
    add("브람",`“<b>${item.name}</b>이다. 직접 입어보고 맞는지 확인해봐.”<br><span class="small">가방의 장비 관리에서 장착할 수 있다.</span>`);
    renderBlacksmithShop();render();return true;
  }
  function equipByUid(uid){
    ensureEquipmentState();
    const it=G.equipmentInventory.find(x=>x.uid===uid);if(!it)return false;
    const slot=it.type==="armor"?"armor":"weapon";
    if(isEquipped(it))return false;
    G.equipment[slot]={
      name:it.name,type:it.type,atk:it.atk||0,def:it.def||0,magic:it.magic||0,
      enhance:it.enhance||0,tier:it.tier||0,rarity:it.rarity||"normal",inventoryUid:it.uid
    };
    add("system",`✅ <b>${it.name}</b>을 장착했다.`);
    render();renderEquipmentManager();return true;
  }

  function ensureModals(){
    if(!document.getElementById("blacksmithShopModal")){
      const m=document.createElement("div");m.id="blacksmithShopModal";m.className="modal hidden";
      m.innerHTML=`<div class="equipment-modal">
        <div class="equipment-modal-head"><div><h2>⚒️ 브람의 장비점</h2><p class="small">초급 장비는 구매할 수 있고, 더 강한 장비는 직접 제작해야 한다.</p></div><button onclick="closeBlacksmithShop()" aria-label="닫기">✕</button></div>
        <div class="equipment-tabs"><button id="shopWeaponTab" onclick="setBlacksmithShopTab('weapon')">⚔️ 무기</button><button id="shopArmorTab" onclick="setBlacksmithShopTab('armor')">🛡️ 방어구</button></div>
        <div id="blacksmithShopList" class="equipment-grid"></div>
      </div>`;
      m.addEventListener("click",e=>{if(e.target===m)closeBlacksmithShop();});
      document.body.appendChild(m);
    }
    if(!document.getElementById("equipmentManagerModal")){
      const m=document.createElement("div");m.id="equipmentManagerModal";m.className="modal hidden";
      m.innerHTML=`<div class="equipment-modal">
        <div class="equipment-modal-head"><div><h2>🎒 장비 관리</h2><p class="small">보유한 무기와 방어구를 언제든 교체할 수 있다.</p></div><button onclick="closeEquipmentManager()" aria-label="닫기">✕</button></div>
        <div id="equippedSummary" class="equipped-summary"></div>
        <div id="equipmentManagerList" class="equipment-grid"></div>
      </div>`;
      m.addEventListener("click",e=>{if(e.target===m)closeEquipmentManager();});
      document.body.appendChild(m);
    }
  }
  function renderBlacksmithShop(){
    ensureEquipmentState();ensureModals();
    document.getElementById("shopWeaponTab")?.classList.toggle("active",shopTab==="weapon");
    document.getElementById("shopArmorTab")?.classList.toggle("active",shopTab==="armor");
    const list=shopTab==="armor"?ARMOR_SHOP:WEAPON_SHOP;
    document.getElementById("blacksmithShopList").innerHTML=list.map((it,i)=>{
      const state=ownsShopItem(it),can=G.gold>=it.price&&!state;
      return `<div class="equipment-card ${state?"owned":""}">
        <div class="equipment-card-title"><b>${it.name}</b>${state?'<span class="equip-badge">'+(state==="equipped"?"✅ 장착 중":"보유 중")+'</span>':""}</div>
        <div class="equipment-card-stat">${statText(it)}</div>
        <div class="equipment-card-compare">${compareText(it)}</div>
        ${it.desc?`<div class="small equipment-desc">${it.desc}</div>`:""}
        <div class="equipment-card-bottom"><strong>${it.price}G</strong><button ${can?"":"disabled"} onclick="buyBlacksmithGear('${shopTab}',${i})">${state==="equipped"?"장착 중":state==="owned"?"보유 중":G.gold<it.price?"골드 부족":"구매"}</button></div>
      </div>`;
    }).join("");
  }
  function openBlacksmithShop(tab="weapon"){shopTab=tab;ensureModals();renderBlacksmithShop();document.getElementById("blacksmithShopModal").classList.remove("hidden");}
  function closeBlacksmithShop(){document.getElementById("blacksmithShopModal")?.classList.add("hidden");}
  function setBlacksmithShopTab(tab){shopTab=tab==="armor"?"armor":"weapon";renderBlacksmithShop();}
  function buyBlacksmithGear(tab,index){
    const list=tab==="armor"?ARMOR_SHOP:WEAPON_SHOP,item=list[index];if(item)addShopItem(item);
  }

  function itemCard(it){
    const on=isEquipped(it);
    return `<div class="equipment-card ${on?"equipped":""}">
      <div class="equipment-card-title"><b>${it.name}</b>${it.enhance?` <span>+${it.enhance}</span>`:""}${on?'<span class="equip-badge">✅ 장착 중</span>':""}</div>
      <div class="equipment-card-stat">${statText(it)}</div>
      <div class="equipment-card-compare">${on?"현재 사용 중":compareText(it)}</div>
      <button class="equipment-equip-btn ${on?"equipped":""}" ${on?"disabled":""} onclick="equipInventoryItem('${it.uid}')">${on?"✅ 장착 중":"장착"}</button>
    </div>`;
  }
  function renderEquipmentManager(){
    ensureEquipmentState();ensureModals();
    const w=G.equipment.weapon,a=G.equipment.armor;
    document.getElementById("equippedSummary").innerHTML=`
      <div><span>⚔️ 현재 무기</span><b>${w?.name||"없음"}</b><small>${w?statText(w):"장착하지 않음"}</small></div>
      <div><span>🛡️ 현재 방어구</span><b>${a?.name||"없음"}</b><small>${a?statText(a):"장착하지 않음"}</small></div>`;
    document.getElementById("equipmentManagerList").innerHTML=G.equipmentInventory.length
      ?G.equipmentInventory.map(itemCard).join("")
      :'<div class="small">보유한 장비가 없다.</div>';
  }
  function openEquipmentManager(){ensureModals();renderEquipmentManager();document.getElementById("equipmentManagerModal").classList.remove("hidden");}
  function closeEquipmentManager(){document.getElementById("equipmentManagerModal")?.classList.add("hidden");}

  function renderInventoryCards(){
    ensureEquipmentState();
    const box=document.getElementById("equipmentInvBox");
    if(box){
      box.innerHTML=G.equipmentInventory.length?G.equipmentInventory.map(it=>{
        const on=isEquipped(it);
        return `<div class="inv-item equipment-inv-row"><div><b>${it.name}</b> ${it.enhance?`+${it.enhance}`:""} ${on?'<span class="equip-badge">✅ 장착 중</span>':""}<br><span class="small">${statText(it)}</span></div><button ${on?"disabled":""} onclick="equipInventoryItem('${it.uid}')">${on?"장착 중":"장착"}</button></div>`;
      }).join(""):"보유 장비가 없다.";
    }
    const equipBox=document.getElementById("equip");
    if(equipBox){
      const w=G.equipment.weapon,a=G.equipment.armor;
      equipBox.innerHTML=`<div class="slot equipped-slot"><span>⚔️ 주무기</span><b>${w?.name||"없음"}</b><small>${w?statText(w):""}</small></div>
        <div class="slot equipped-slot"><span>🛡️ 방어구</span><b>${a?.name||"없음"}</b><small>${a?statText(a):""}</small></div>
        <button class="equipment-manage-inline" onclick="openEquipmentManager()">🎒 장비 관리</button>`;
    }
    const pane=document.getElementById("paneInventory");
    if(pane&&!pane.querySelector(".equipment-manage-top")){
      const btn=document.createElement("button");btn.className="equipment-manage-top";btn.textContent="🛡️ 장비 관리 열기";btn.onclick=openEquipmentManager;
      const title=[...pane.querySelectorAll(".side-title")].find(x=>(x.textContent||"").includes("제작 장비"));
      title?.before(btn);
    }
  }
  function decorateBlacksmithActions(){
    if(G.location!=="대장간")return;
    const root=document.getElementById("actions");if(!root)return;
    const buttons=[...root.querySelectorAll(".choice-btn")];
    const shop=buttons.find(b=>(b.textContent||"").includes("무기 둘러보기"));
    if(shop){
      shop.childNodes.forEach(n=>{if(n.nodeType===3&&n.textContent.includes("무기 둘러보기"))n.textContent=n.textContent.replace("무기 둘러보기","무기 / 방어구 구매")});
      const sub=shop.querySelector(".choice-sub");if(sub)sub.textContent="초급 무기 · 방어구";
      shop.onclick=()=>openBlacksmithShop("weapon");
    }
    if(!root.querySelector(".equipment-manage-action")){
      const b=document.createElement("button");b.className="choice-btn equipment-manage-action";
      b.innerHTML='<span class="choice-icon fantasy-choice-icon icon-character"></span>장비 관리<span class="choice-sub">보유 장비 확인 / 장착 변경</span>';
      b.onclick=openEquipmentManager;
      const back=buttons.find(x=>(x.textContent||"").includes("마을로 돌아간다"));
      back?root.insertBefore(b,back):root.appendChild(b);
    }
  }

  // Armor now matters in combat. 45% of DEF is converted to flat mitigation,
  // capped at 60% of the attack's base power so armor never trivializes content.
  function armorDefense(){ensureEquipmentState();return Number(G.equipment.armor?.def||0);}
  const baseEnemyDamage=window.enemyDamage;
  window.enemyDamage=function(base,name){
    let targetComp=G.companion&&G.companion.tactic==="보호"&&Math.random()<.35;
    if(targetComp){
      let d=Math.max(1,base+Math.floor(Math.random()*4)-2);
      G.companion.hp=Math.max(0,G.companion.hp-d);
      if(G.companion.hp<=0&&G.relations?.["리엔"])G.relations["리엔"].aff-=1;
      return `${name}! 리엔 HP <b>-${d}</b>`;
    }
    const raw=base+Math.floor(Math.random()*4)-(G.combat?.guard?5:0);
    const mitigation=Math.min(Math.floor(base*.6),Math.floor(armorDefense()*.45));
    const d=Math.max(1,raw-mitigation);G.hp-=d;
    if(G.hp<=0){
      G.hp=1;
      document.getElementById("combatModal")?.classList.add("hidden");
      document.getElementById("combatMagicModal")?.classList.add("hidden");
      document.getElementById("combatItemModal")?.classList.add("hidden");
      G.combat=null;G.location="브렌 마을";
      add("미라","정신을 차렸을 때 길드 휴게실이었다.<br>“살아서 돌아오라고 했죠?”");
      return `${name}에 맞아 쓰러졌다.`;
    }
    return `${name}! 내 HP <b>-${d}</b>${mitigation?` <span class="small">🛡️ 방어구로 ${mitigation} 감소</span>`:""}`;
  };

  // Keep compatibility with existing crafting/drop equip buttons.
  window.equipCrafted=function(index){
    ensureEquipmentState();
    const it=G.equipmentInventory[index];if(!it)return;
    return equipByUid(it.uid);
  };

  const baseRender=window.render;
  window.render=function(){
    ensureEquipmentState();
    const out=baseRender.apply(this,arguments);
    renderInventoryCards();
    decorateBlacksmithActions();
    return out;
  };

  // Existing blacksmith action now opens the unified store.
  window.v05BlacksmithShop=function(){openBlacksmithShop("weapon");};

  window.openBlacksmithShop=openBlacksmithShop;
  window.closeBlacksmithShop=closeBlacksmithShop;
  window.setBlacksmithShopTab=setBlacksmithShopTab;
  window.buyBlacksmithGear=buyBlacksmithGear;
  window.openEquipmentManager=openEquipmentManager;
  window.closeEquipmentManager=closeEquipmentManager;
  window.equipInventoryItem=equipByUid;
  window.renderEquipmentManager=renderEquipmentManager;
  window.blacksmithArmorShop=ARMOR_SHOP;
  window.armorDefense=armorDefense;

  ensureEquipmentState();ensureModals();render();
})();