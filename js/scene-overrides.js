/* v0.5.5 mobile-test — atlas-backed high-resolution visual overrides */
(()=>{
  const SCENE_ATLAS="assets/atlases/scenes.webp",SCENE_COLS=4,SCENE_ROWS=4;
  const PORTRAIT_ATLAS="assets/atlases/portraits.webp",PORTRAIT_COLS=2,PORTRAIT_ROWS=2;
  const SCENE_INDEX={
    "브렌 마을":0,
    "낯선 숲길":1,
    "서쪽 숲":2,
    "모험가 길드":3,
    "황금사슴 여관":4,
    "대장간":5,
    "대장간 작업대":5,
    "마법 상점":6,
    "브렌 시장":7,
    "생활 도구 상점":7,
    "동쪽 벌목지":8,
    "북쪽 채석장":9,
    "프로스트벨":10,
    "북부 숲길":10,
    "서리 언덕":10,
    "은빛 호수":10,
    "카르문 광산도시":11,
    "왕도 관문":11,
    "엘로디아 숲마을":12,
    "달그림자 숲":12,
    "고대 정령터":12
  };
  const SCENE_FALLBACK={
    "강변 부두":"assets/scenes/river-farm.webp",
    "남쪽 농장":"assets/scenes/river-farm.webp",
    "안개 습지":"assets/scenes/swamp.webp",
    "검은 늪":"assets/scenes/swamp.webp",
    "숲속 야영지":"assets/scenes/camp.webp",
    "고블린 야영지":"assets/scenes/camp.webp",
    "옛 왕도길":"assets/scenes/wilderness.webp",
    "버려진 감시탑":"assets/scenes/wilderness.webp",
    "바람절벽":"assets/scenes/wilderness.webp",
    "폐광 입구":"assets/scenes/quarry.webp",
    "고대 수로":"assets/scenes/quarry.webp",
    "청동 협곡":"assets/scenes/quarry.webp",
    "붉은 화산로":"assets/scenes/volcano.webp",
    "용의 계곡":"assets/scenes/volcano.webp"
  };
  const PORTRAIT_INDEX={
    "미라":0,
    "에밀리아":1,
    "브람":2,
    "리엔":3
  };
  const TRANSPARENT="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

  function atlasPos(index,cols,rows){
    const c=index%cols,r=Math.floor(index/cols);
    return `${cols>1?c/(cols-1)*100:0}% ${rows>1?r/(rows-1)*100:0}%`;
  }
  function applyScene(place){
    if(SCENE_INDEX[place]!==undefined){
      sceneImg.src=TRANSPARENT;
      sceneImg.classList.add("atlas-scene");
      sceneImg.style.backgroundImage=`url("${SCENE_ATLAS}")`;
      sceneImg.style.backgroundSize=`${SCENE_COLS*100}% ${SCENE_ROWS*100}%`;
      sceneImg.style.backgroundPosition=atlasPos(SCENE_INDEX[place],SCENE_COLS,SCENE_ROWS);
      return true;
    }
    const path=SCENE_FALLBACK[place];
    if(path){
      sceneImg.classList.remove("atlas-scene");
      sceneImg.style.backgroundImage="";
      sceneImg.src=path;
      return true;
    }
    return false;
  }
  function applyPortrait(npc){
    if(PORTRAIT_INDEX[npc]===undefined)return false;
    stageNpc.src=TRANSPARENT;
    stageNpc.classList.remove("system");
    stageNpc.classList.add("atlas-portrait");
    stageNpc.style.backgroundImage=`url("${PORTRAIT_ATLAS}")`;
    stageNpc.style.backgroundSize=`${PORTRAIT_COLS*100}% ${PORTRAIT_ROWS*100}%`;
    stageNpc.style.backgroundPosition=atlasPos(PORTRAIT_INDEX[npc],PORTRAIT_COLS,PORTRAIT_ROWS);
    return true;
  }
  const baseSetSceneAsset=window.setSceneAsset;
  window.setSceneAsset=function(place){
    if(!applyScene(place))baseSetSceneAsset?.(place);
    const focus=typeof v05CurrentFocus==="function"?v05CurrentFocus():null;
    const npc=focus?.speaker&&focus.speaker!=="SYSTEM"?focus.speaker:(V05_FACILITY?.[place]?.npc||null);
    if(npc&&PORTRAIT_INDEX[npc]!==undefined)applyPortrait(npc);
    else if(stageNpc){
      stageNpc.classList.remove("atlas-portrait");
      stageNpc.style.backgroundImage="";
    }
  };
  for(const [place] of Object.entries(SCENE_INDEX))V05_SCENES[place]=`atlas:${SCENE_INDEX[place]}`;
  for(const [place,path] of Object.entries(SCENE_FALLBACK))V05_SCENES[place]=path;
  for(const [npc] of Object.entries(PORTRAIT_INDEX))V05_PORTRAITS[npc]=`atlas:${PORTRAIT_INDEX[npc]}`;
  window.V053_SCENE_HQ=Object.fromEntries(Object.keys(SCENE_INDEX).map(k=>[k,SCENE_ATLAS]));
  window.V053_PORTRAIT_HQ=Object.fromEntries(Object.keys(PORTRAIT_INDEX).map(k=>[k,PORTRAIT_ATLAS]));
  window.v05MapImage=function(tab){
    if(tab==="bren")return "assets/maps/release/bren-region-map.webp";
    if(tab==="hunt")return "assets/maps/release/hunting-flow-map.webp";
    return "assets/maps/release/alterra-continent-map.webp";
  };
  setSceneAsset(G.location);
  render();
})();