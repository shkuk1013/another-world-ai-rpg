/* v0.5.5 mobile-test — monster battle atlas + codex thumbnails */
(()=>{
  const MONSTER_ATLAS="assets/atlases/monsters.webp",MONSTER_COLS=5,MONSTER_ROWS=3;
  const MONSTER_ART={"goblin":7,"mana_goblin":8,"goblin_chief":6,"marsh_slime":9,"swamp_frog":12,"cave_bat":3,"frost_wolf":5,"mine_troll":10,"bronze_ogre":2,"wind_wyvern":14,"spirit_beast":11,"ancient_golem":1,"swamp_knight":13,"fire_drake":4,"ancient_dragon":0};
  const MONSTER_DIRECT={
    goblin:"assets/enemies/clean/goblin.svg",
    mana_goblin:"assets/enemies/clean/mana-goblin.svg",
    goblin_chief:"assets/enemies/clean/goblin-chief.svg"
  };
  window.MONSTER_ART=MONSTER_ART;
  window.MONSTER_DIRECT=MONSTER_DIRECT;
  const TRANSPARENT="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
  function styleFor(index){
    const c=index%MONSTER_COLS,r=Math.floor(index/MONSTER_COLS);
    const x=c/(MONSTER_COLS-1)*100,y=r/(MONSTER_ROWS-1)*100;
    return `background-image:url("${MONSTER_ATLAS}");background-size:${MONSTER_COLS*100}% ${MONSTER_ROWS*100}%;background-position:${x}% ${y}%`;
  }
  function clearMonsterAtlasStyle(){
    enemyArt.classList.remove("monster-atlas-art");
    enemyArt.style.backgroundImage="";
    enemyArt.style.backgroundSize="";
    enemyArt.style.backgroundPosition="";
    enemyArt.style.backgroundRepeat="";
  }
  function setMonsterArt(type){
    const direct=MONSTER_DIRECT[type];
    enemyArt.alt=MONSTERS?.[type]?.name||"몬스터";
    enemyArt.dataset.monsterType=type;
    if(direct){
      clearMonsterAtlasStyle();
      enemyArt.src=direct;
      return;
    }
    const idx=MONSTER_ART[type];if(idx===undefined)return;
    enemyArt.src=TRANSPARENT;enemyArt.classList.add("monster-atlas-art");
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
      const id=ids[i],direct=MONSTER_DIRECT[id],idx=MONSTER_ART[id];
      if((!direct&&idx===undefined)||!G.discoveredMonsters?.[id]||entry.querySelector(".codex-monster-art"))return;
      const art=direct?document.createElement("img"):document.createElement("span");
      art.className=direct?"codex-monster-art":"codex-monster-art monster-atlas-thumb";
      if(direct){art.src=direct;art.alt=MONSTERS[id]?.name||"몬스터";}
      else{art.style.cssText=styleFor(idx);art.setAttribute("role","img");art.setAttribute("aria-label",MONSTERS[id]?.name||"몬스터");}
      entry.prepend(art);
    });
  }
  if(typeof window.openCodex==="function"){
    const base=window.openCodex;window.openCodex=function(){const out=base.apply(this,arguments);decorateCodex();return out;};
  }
})();