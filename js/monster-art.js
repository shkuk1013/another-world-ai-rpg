/* v0.5.5 mobile-test — monster battle atlas + codex thumbnails */
(()=>{
  const MONSTER_ATLAS="assets/atlases/monsters.webp",MONSTER_COLS=5,MONSTER_ROWS=3;
  const MONSTER_ART={"goblin":7,"mana_goblin":8,"goblin_chief":6,"marsh_slime":9,"swamp_frog":12,"cave_bat":3,"frost_wolf":5,"mine_troll":10,"bronze_ogre":2,"wind_wyvern":14,"spirit_beast":11,"ancient_golem":1,"swamp_knight":13,"fire_drake":4,"ancient_dragon":0};
  const MONSTER_CROP={
    goblin:{x:1040,y:394,w:320,h:118},
    mana_goblin:{x:1520,y:394,w:320,h:118},
    goblin_chief:{x:560,y:394,w:320,h:118}
  };
  const MONSTER_ATLAS_W=2400,MONSTER_ATLAS_H=936;
  window.MONSTER_ART=MONSTER_ART;
  window.MONSTER_CROP=MONSTER_CROP;
  const TRANSPARENT="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
  function styleFor(index){
    const c=index%MONSTER_COLS,r=Math.floor(index/MONSTER_COLS);
    const x=c/(MONSTER_COLS-1)*100,y=r/(MONSTER_ROWS-1)*100;
    return `background-image:url("${MONSTER_ATLAS}");background-size:${MONSTER_COLS*100}% ${MONSTER_ROWS*100}%;background-position:${x}% ${y}%`;
  }
  function clearMonsterAtlasStyle(){
    enemyArt.classList.remove("monster-atlas-art","monster-clean-crop");
    enemyArt.style.backgroundImage="";
    enemyArt.style.backgroundSize="";
    enemyArt.style.backgroundPosition="";
    enemyArt.style.backgroundRepeat="";
  }
  function cropStyle(crop){
    const sx=MONSTER_ATLAS_W/crop.w*100,sy=MONSTER_ATLAS_H/crop.h*100;
    const px=crop.x/(MONSTER_ATLAS_W-crop.w)*100,py=crop.y/(MONSTER_ATLAS_H-crop.h)*100;
    return `background-image:url("${MONSTER_ATLAS}");background-size:${sx}% ${sy}%;background-position:${px}% ${py}%;background-repeat:no-repeat`;
  }
  function setMonsterArt(type){
    const crop=MONSTER_CROP[type];
    enemyArt.alt=MONSTERS?.[type]?.name||"몬스터";
    enemyArt.dataset.monsterType=type;
    clearMonsterAtlasStyle();
    enemyArt.src=TRANSPARENT;
    if(crop){
      enemyArt.classList.add("monster-clean-crop");
      enemyArt.style.cssText+=`;${cropStyle(crop)}`;
      return;
    }
    const idx=MONSTER_ART[type];if(idx===undefined)return;
    enemyArt.classList.add("monster-atlas-art");
    enemyArt.style.cssText+=`;${styleFor(idx)}`;
  }
  if(typeof window.startCombat==="function"){
    const base=window.startCombat;window.startCombat=function(type){
      const out=base.apply(this,arguments);if(G.combat)setMonsterArt(type);return out;
    };
  }
  if(typeof window.updateCombat==="function"){
    const base=window.updateCombat;window.updateCombat=function(){
      const out=base.apply(this,arguments);
      if(G.combat?.type&&enemyArt?.dataset.monsterType!==G.combat.type)setMonsterArt(G.combat.type);
      return out;
    };
  }
  function decorateCodex(){
    const entries=[...document.querySelectorAll("#codexList .codex-entry")],ids=Object.keys(MONSTERS||{});
    entries.forEach((entry,i)=>{
      const id=ids[i],crop=MONSTER_CROP[id],idx=MONSTER_ART[id];
      if((!crop&&idx===undefined)||!G.discoveredMonsters?.[id]||entry.querySelector(".codex-monster-art"))return;
      const art=document.createElement("span");
      art.className=crop?"codex-monster-art monster-clean-thumb":"codex-monster-art monster-atlas-thumb";
      art.style.cssText=crop?cropStyle(crop):styleFor(idx);
      art.setAttribute("role","img");art.setAttribute("aria-label",MONSTERS[id]?.name||"몬스터");
      entry.prepend(art);
    });
  }
  if(typeof window.openCodex==="function"){
    const base=window.openCodex;window.openCodex=function(){const out=base.apply(this,arguments);decorateCodex();return out;};
  }
})();