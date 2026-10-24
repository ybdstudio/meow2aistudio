// Serves dist/native behind the fake TTMinis harness (used by bot.js with NATIVE_URL)
const fs=require('fs'),path=require('path'),http=require('http');
const ROOT=path.join(__dirname,'..','dist','native');
const HARNESS=`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#000}canvas{display:block;width:390px;height:844px;touch-action:none}</style>
<canvas id="screen"></canvas><script>
window.__log=[];window.__store={};let first=true;const cv=document.getElementById('screen');const L={s:[],m:[],e:[],c:[]};
window.TTMinis={game:{
 canIUse:()=>true,
 createCanvas(){ if(first){first=false;return cv} return document.createElement('canvas') },
 createImage(){ return new Image() },
 getWindowInfo:()=>({windowWidth:390,windowHeight:844,screenWidth:390,screenHeight:844,pixelRatio:2,safeArea:{top:47,bottom:810}}),
 getMenuButtonBoundingClientRect:()=>({left:296,top:51,right:383,bottom:83,width:87,height:32}),
 onTouchStart:f=>L.s.push(f),onTouchMove:f=>L.m.push(f),onTouchEnd:f=>L.e.push(f),onTouchCancel:f=>L.c.push(f),
 loadSubpackage(o){ __log.push('loadSubpackage '+o.name); const t={onProgressUpdate(f){setTimeout(()=>f({progress:40}),200);setTimeout(()=>f({progress:90}),500)}}; setTimeout(()=>o.success({}),700); return t },
 getStorageSync:k=>__store[k]??'', setStorageSync:(k,v)=>{__store[k]=v}, removeStorageSync:k=>{delete __store[k]},
 onShow:f=>{window.__onShow=f}, onHide:f=>{window.__onHide=f}, onError:f=>{window.__onErr=f}, onWindowResize:f=>{},
 getLaunchOptionsSync:()=>({scene:'0',query:{}}), vibrateShort:()=>{},
 addShortcut:o=>{__log.push('addShortcut');setTimeout(()=>o.success({}),50)}, getShortcutMissionReward:o=>setTimeout(()=>o.success({canReceiveReward:true}),20),
 startEntranceMission:o=>{__log.push('startEntranceMission');window.__rv=true;setTimeout(()=>o.success({}),20)}, getEntranceMissionReward:o=>setTimeout(()=>o.success({canReceiveReward:!!window.__rv}),20),
 shareAppMessage:o=>{__log.push('shareAppMessage');setTimeout(()=>o.success({}),50)},
}};
const fire=(k,e)=>{const t={identifier:e.pointerId,screenX:e.offsetX,screenY:e.offsetY};L[k].forEach(f=>f({touches:k==='e'?[]:[t],changedTouches:[t]}))};
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);fire('s',e)});cv.addEventListener('pointermove',e=>{if(e.buttons)fire('m',e)});cv.addEventListener('pointerup',e=>fire('e',e));
</script><script src="game.js"></script>`;
const srv=http.createServer((q,r)=>{ if(q.url==='/'||q.url.startsWith('/__h')){r.writeHead(200,{'content-type':'text/html'});return r.end(HARNESS)}
  const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0])); if(!f.startsWith(ROOT)||!fs.existsSync(f)){r.writeHead(404);return r.end()}
  r.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':'image/jpeg'}); fs.createReadStream(f).pipe(r); });
srv.listen(Number(process.env.PORT||8765),()=>console.log('serving native on',srv.address().port));
