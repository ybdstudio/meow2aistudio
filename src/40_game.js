/* =====================================================================
   40_game.js — simulation: player, stations, customers, workers, tasks
   ===================================================================== */
let now=0;
const player={x:4.4,y:4.6,carry:[],dir:315,seed:.3,walking:false,t:0,reachT:0,happyT:0,cookT:0};
let stations=[],tables=[],bins=[],workers=[],customers=[],decorObjs=[];
let tray={}; FOODS.forEach(k=>tray[k]=0);
let flyers=[],particles=[],floaters=[];
let spawnT=1.2,vipT=8,saleT=0,interactT={},buyAcc=0,padIn={},nextId=1;
const buyProg={};
const DEBUG={move:null,noModal:false};

const TRAY_CAP=6;
const catOf=arr=>arr.length?ITEMS[arr[0]].cat:null;
const trayTotal=()=>FOODS.reduce((a,k)=>a+tray[k],0);
const isBoost=()=>now<S.boostUntil;
const dist=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
const spotById=id=>SPOTS.find(s=>s.id===id);
const fpCenter=fp=>[fp[0]+fp[2]/2,fp[1]+fp[3]/2];
const curTask=()=>TASKS[Math.min(S.task,TASKS.length-1)];
const decorCount=()=>SPOTS.filter(s=>s.kind==='decor'&&S.bought[s.id]).length;
function itemPrice(k){const b=ITEMS[k].price;return Math.round((b+S.rPrice*Math.ceil(b/5))*(1+CFG.decorBonus*decorCount()))}
function stInterval(st){const d=st.def;const base=d.item==='ing'?d.interval*Math.pow(.7,S.sup):d.interval*Math.pow(.78,S.spd);return base/(isBoost()?2:1)}
function stCap(st){return st.def.item==='ing'?st.def.cap+3*S.store:st.def.cap+st.def.capStep*S.cap}
const carryMax=()=>CFG.player.carryBase+Math.min(4,Math.floor((S.level-1)/2))+CFG.player.carryPerLevel*S.mCarry;
const playerSpeed=()=>(CFG.player.baseSpeed+CFG.player.speedPerLevel*S.mSpd)*(isBoost()?1.3:1);
const hasStationFor=item=>stations.some(s=>s.def.item===item);
const available=()=>FOODS.filter(hasStationFor);
const cashierPresent=()=>!!S.bought.cashier||dist(player.x,player.y,...PT.cashier)<.8;

function rectDist(px,py,x,y,w,d){const dx=Math.max(x-px,0,px-(x+w)),dy=Math.max(y-py,0,py-(y+d));return Math.hypot(dx,dy)}
/* ---------------- world objects from purchases ---------------- */
function rebuildWorld(keep=true){
  const oldSt=Object.fromEntries(stations.map(s=>[s.id,s])), oldT=Object.fromEntries(tables.map(t=>[t.id,t]));
  stations=[];tables=[];bins=[];decorObjs=[];
  for(const sp of SPOTS){ if(!S.bought[sp.id]) continue; const [x,y,w,d]=sp.fp;
    if(sp.kind==='station'){ const def=STATIONS[sp.st]; stations.push(keep&&oldSt[sp.id]||{id:sp.id,type:sp.st,def,x,y,w,d,pt:sp.pt,stock:sp.id==='oven1'?1:0,ing:0,timer:0}); }
    if(sp.kind==='table'||sp.kind==='table4p'||sp.kind==='vip'){
      if(keep&&oldT[sp.id]){tables.push(oldT[sp.id]);continue}
      const seats=[]; const z=0;
      /* seats follow the approved table-set art: back chair up-left (L), front chair down-right (R) of each table unit */
      const units=sp.kind==='table4p'?[[x+w/2,y+.75],[x+w/2,y+2.2]]:[[x+w/2,y+d/2]];
      /* both chairs sit on the far sides of the table (-x and -y), facing the camera, so the table hides the legs */
      units.forEach(([cx,cy],ui)=>{ seats.push({x:cx-1.1,y:cy,side:'L'}); if(ui===0) seats.push({x:cx,y:cy-1.1,side:'T'}); });
      seats.forEach(s=>s.occ=null);
      tables.push({id:sp.id,kind:sp.kind,x,y,w,d,z,seats,trash:0,food:[],pile:0}); }
    if(sp.kind==='bin') bins.push({id:sp.id,x,y,w,d,pt:[x+w/2,y+d+.55]});
    if(sp.kind==='decor') decorObjs.push({id:sp.id,sprite:sp.sprite,x,y,w,d});
    if(sp.kind==='hire'&&!workers.find(w=>w.role===sp.worker)) workers.push(makeWorker(sp.worker));
  }
  buildNav(solids(true));
}
function solids(forNav){const r=[];
  if(S.bought.register) r.push([COUNTER.x,COUNTER.y,COUNTER.w,COUNTER.d]);
  for(const s of stations) r.push([s.x,s.y,s.w,s.d]);
  for(const t of tables) r.push([t.x+.05,t.y+.05,t.w-.1,t.d-.1]);
  for(const b of bins) r.push([b.x,b.y,b.w,b.d]);
  for(const d of decorObjs) r.push([d.x,d.y,d.w,d.d]);
  if(S.bought.office) r.push([11.6,6.8,1.1,0.8]);
  return r;}
let solidCache=[];
function refreshSolids(){solidCache=solids()}

/* ---------------- movement ---------------- */
function moveBody(e,dx,dy,r){
  const blocked=(x,y)=>{if(!walkable(x,y,r))return true;for(const s of solidCache){if(x>s[0]-r&&x<s[0]+s[2]+r&&y>s[1]-r&&y<s[1]+s[3]+r)return true}return false};
  if(!blocked(e.x+dx,e.y)) e.x+=dx; if(!blocked(e.x,e.y+dy)) e.y+=dy;}
function faceDir(e,wdx,wdy){ if(Math.abs(wdx)+Math.abs(wdy)<1e-4) return; e.dir=dirFromWorld(wdx,wdy); }
function faceTo(e,x,y){faceDir(e,x-e.x,y-e.y)}
function followPath(e,dt,spd){
  if(!e.path||!e.path.length){e.walking=false;return true}
  const [tx,ty]=e.path[0], dx=tx-e.x, dy=ty-e.y, L=Math.hypot(dx,dy);
  if(L<.05){e.path.shift();return !e.path.length}
  const st=Math.min(L,spd*dt); e.x+=dx/L*st; e.y+=dy/L*st; e.walking=true; faceDir(e,dx,dy); return false;}
function goTo(e,x,y){e.path=findPath(e.x,e.y,x,y);e.dest=[x,y]}

/* ---------------- effects ---------------- */
function fly(kind,from,to,dur,done){flyers.push({kind,from,to,t:0,dur,done})}
function burst(wx,wy,z=.6,n=26){const cols=['#f8c84a','#7ed957','#e2463f','#fff','#5cb4f0','#f45d7a'];for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=(1.2+Math.random()*2.6);particles.push({wx,wy,wz:z,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:2+Math.random()*3,life:1,c:cols[i%cols.length],r:.04+Math.random()*.05})}}
function floater(wx,wy,txt,col='#fff'){floaters.push({wx,wy,z:1.6,txt,col,life:1})}
function faceTo2(){}
function emote(e,k,t=1.2){e.emote=k;e.emoteT=t}

/* ---------------- tasks ---------------- */
function statSnap(){return JSON.parse(JSON.stringify(S.stats))}
function taskProgress(t){
  if(!t) return [0,1];
  if(t.kind==='buy') return [S.bought[t.spot]?1:0,1];
  if(t.kind==='count') return [Math.max(0,(S.stats[t.stat]||0)-((S.taskBase||{})[t.stat]||0)),t.n];
  if(t.kind==='level') return [Math.min(S[t.key],t.n),t.n];
  if(t.kind==='custom'){ const ok={hasPizza:()=>player.carry.includes('pizza')||tray.pizza>0||S.stats.served>0, trayHas:()=>trayTotal()>0||S.stats.served>0,
      servedOne:()=>S.stats.served>0, collectedAny:()=>S.stats.collected>0, dumpedAny:()=>S.stats.dumped>0, anyKitchenUp:()=>S.spd+S.cap>0}[t.check]();
    return [ok?1:0,1]; }
  return [0,1];}
let taskDoneT=0;
function updateTasks(dt){
  if(taskDoneT>0){taskDoneT-=dt;if(taskDoneT<=0){S.task++;S.taskBase=statSnap();onTaskStart();save()}return}
  const t=curTask(); if(t.kind==='final') return;
  const [p,n]=taskProgress(t);
  if(p>=n){ taskDoneT=1.1; const r=t.reward||0; if(r){S.money+=r;for(let i=0;i<Math.min(8,Math.ceil(r/10));i++) setTimeout(()=>fly('coinHud',[player.x,player.y,1.4],null,.5),i*60);}
    UI.taskComplete(t,r); sfx('task'); burst(player.x,player.y,1.2,18); if(r) UI.offerTip(r);
    if(t.id==='t_grand'){S.grand=false;S.done=true;setTimeout(()=>{UI.milestone();UI.offerOpening()},1400)} }
}
function sideGoal(){return S.task>=taskIndex('t_serve5')&&curTask().kind!=='final'?SIDE_GOALS[S.side%SIDE_GOALS.length]:null}
function sideProgress(g){ if(!g) return [0,1]; if(g.kind==='streak') return [Math.min(S.stats.streak||0,g.n),g.n]; return [Math.max(0,(S.stats[g.stat]||0)-((S.sideBase||{})[g.stat]||0)),g.n]; }
function updateSide(){ const g=sideGoal(); if(!g) return; if(!S.sideBase) S.sideBase=statSnap(); const [p,n]=sideProgress(g);
  if(p>=n){ const r=g.reward; S.money+=r; fly('coinHud',[player.x,player.y,1.4],null,.5); UI.toast('Bonus goal done! +'+r); sfx('coin'); S.side++; S.sideBase=statSnap(); if(g.kind==='streak') S.stats.streak=0; } }
function onTaskStart(){const t=curTask();UI.setTask();UI.onTaskAdvance();if(t.id==='t_grand'){S.grand=true;UI.banner('GRAND OPENING!','The whole town is coming — serve 10 customers');}}

/* ---------------- purchases ---------------- */
function spotVisible(sp){if(S.bought[sp.id])return false;if(S.task<taskIndex(sp.unlock))return false;
  if(sp.zone&&!zoneOpen(ZONES.find(z=>z.id===sp.zone)))return false;if(sp.id==='renovate'&&curStage()>0)return false;return true}
function onBought(sp){
  S.bought[sp.id]=true; const [cx,cy]=fpCenter(sp.fp);
  if(sp.kind==='decor') S.stats.decor=(S.stats.decor||0)+1;
  const stageBefore=S.stage; S.stage=curStage();
  rebuildWorld(); refreshSolids();
  if(sp.kind==='zone'||sp.kind==='stage'||S.stage!==stageBefore) buildFloorCache(TW);
  burst(cx,cy,.6); sfx('buy'); UI.toast(sp.label+' unlocked!');
  if(S.stage!==stageBefore) UI.onStageUp();
  if(S.stage!==stageBefore) UI.banner(CFG.stageNames[S.stage]+'!', ['','Walls, menus and a real diner look','A new dining hall is open','The patio terrace is open'][S.stage]||'');
  if(sp.kind==='event'){ for(let i=0;i<6;i++) setTimeout(()=>burst(cx+(Math.random()-.5)*3,cy+(Math.random()-.5)*3,2.5,30),i*250); }
  // never leave the player stuck inside a new solid
  unstickPlayer(sp.pt);
  save();
}
function freeAt(x,y){const r=CFG.player.radius;return walkable(x,y,r)&&!solidCache.some(s=>x>s[0]-r&&x<s[0]+s[2]+r&&y>s[1]-r&&y<s[1]+s[3]+r)}
function unstickPlayer(pref){ if(freeAt(player.x,player.y)) return; if(pref&&freeAt(...pref)){player.x=pref[0];player.y=pref[1];return}
  for(let rad=.25;rad<4;rad+=.25) for(let a=0;a<16;a++){const x=player.x+Math.cos(a/16*Math.PI*2)*rad,y=player.y+Math.sin(a/16*Math.PI*2)*rad; if(freeAt(x,y)){player.x=x;player.y=y;return}} }
function updatePurchases(dt){
  let on=null;
  for(const sp of SPOTS){ if(!spotVisible(sp)) continue; const [x,y,w,d]=sp.fp; if(player.x>x-.25&&player.x<x+w+.25&&player.y>y-.25&&player.y<y+d+.25){on=sp;break} }
  for(const id in buyProg) if(!on||on.id!==id) buyProg[id]=Math.max(0,buyProg[id]-dt*.6);
  if(!on){buyAcc=0;return}
  on.paid=on.paid||0; const remain=on.cost-on.paid;
  if(S.money>0&&remain>0){ buyAcc+=Math.max(on.cost,10)*dt*1.4; const take=Math.min(Math.floor(buyAcc),remain,S.money);
    if(take>0){buyAcc-=take;S.money-=take;on.paid+=take;if(Math.random()<.5)fly('coin',[player.x,player.y,1.2],[...fpCenter(on.fp),.2],.3);sfx('tick')} }
  buyProg[on.id]=on.paid/on.cost;
  if(on.paid>=on.cost) onBought(on);
}

/* ---------------- player ---------------- */
/* a machine can be used from anywhere around its footprint, not only from the exact stand point */
function nearStation(st,x,y){ if(st.type==='pantry') return dist(x,y,...st.pt)<.85; // storage keeps its stand point
  const dx=Math.max(st.x-x,0,x-(st.x+st.w)), dy=Math.max(st.y-y,0,y-(st.y+st.d));
  // standing still anywhere around the machine works; while walking past only the stand point counts (no accidental grabs)
  return dist(x,y,...st.pt)<.85 || (!player.walking&&Math.hypot(dx,dy)<CFG.stationReach); }
function updatePlayer(dt,inp){
  player.walking=false;
  let wx=0,wy=0,m=0;
  if(inp.m>.08) AUTOP.manualT=2.5; else AUTOP.manualT=Math.max(0,AUTOP.manualT-dt);
  const am=(!DEBUG.move&&autoActive()&&AUTOP.manualT<=0)?autoMove(dt):null;
  if(am){ [wx,wy]=am; m=Math.hypot(wx,wy)>0?1:0; const L=Math.hypot(wx,wy)||1; wx/=L; wy/=L; }
  else if(DEBUG.move){ [wx,wy]=DEBUG.move; m=Math.hypot(wx,wy)>0?1:0; const L=Math.hypot(wx,wy)||1; wx/=L; wy/=L; }
  else if(inp.m>.08){ wx=inp.x+2*inp.y; wy=2*inp.y-inp.x; const L=Math.hypot(wx,wy)||1; wx/=L; wy/=L; m=inp.m; }
  if(m>0){ const sp=playerSpeed()*m*dt; moveBody(player,wx*sp,wy*sp,CFG.player.radius); player.walking=true; faceDir(player,wx,wy); UI.hideHint(); }
  player.t+=dt; player.reachT=Math.max(0,player.reachT-dt); player.happyT=Math.max(0,player.happyT-dt); player.cookT=Math.max(0,player.cookT-dt);
  const P_=player, cat=catOf(P_.carry), max=carryMax();
  const tick=(k,iv)=>{interactT[k]=(interactT[k]||0)-dt;if(interactT[k]<=0){interactT[k]=iv;return true}return false};
  // stations
  for(const st of stations){ if(!nearStation(st,P_.x,P_.y)) continue;
    if(cat==='ing'&&st.type==='pantry'&&st.stock<stCap(st)&&!stations.some(o=>o.def.needs&&o.ing<o.def.ingCap)){ if(tick('rt'+st.id,.12)){P_.carry.pop();st.stock++;P_.reachT=.2;sfx('drop')} continue; }
    if(cat==='ing'&&st.def.needs&&st.ing<st.def.ingCap){ if(tick('ld'+st.id,.15)){P_.carry.pop();st.ing+=st.def.perIng;S.stats.loaded++;if(!P_.walking){P_.cookT=.35;faceTo(P_,st.x+st.w/2,st.y+st.d/2)}fly('ing',[P_.x,P_.y,1],[...st.pt,.6],.2);sfx('drop')} continue; }
    const icat=ITEMS[st.def.item].cat;
    if(st.type==='pantry'){ const room=stations.reduce((a,o)=>a+(o.def.needs?Math.max(0,Math.ceil((o.def.ingCap-o.ing)/o.def.perIng)):0),0); if(P_.carry.length>=room) continue; }
    if(icat==='food'&&tray[st.def.item]+P_.carry.filter(k=>k===st.def.item).length>=TRAY_CAP&&!customers.some(c=>c.state==='vipWait')) continue;
    if(st.stock>0&&P_.carry.length<max&&(cat===null||cat===icat)&&!(cat==='ing'&&st.def.needs)){ if(tick('pk'+st.id,.13)){st.stock--;P_.carry.push(st.def.item);if(!P_.walking){P_.cookT=.3;faceTo(P_,st.x+st.w/2,st.y+st.d/2)}sfx('pick')} }
  }
  // tray
  const dropIdx=P_.carry.map((k,i)=>i).reverse().find(i=>tray[P_.carry[i]]<TRAY_CAP);
  if(S.bought.register&&cat==='food'&&dist(P_.x,P_.y,...PT.tray)<1.0&&dropIdx!==undefined){ if(tick('tray',.09)){const it=P_.carry.splice(dropIdx,1)[0];P_.reachT=.2;fly(it,[P_.x,P_.y,1],[5.5,it==='pizza'?3.5:4.5,.8],.2,()=>{tray[it]++});sfx('drop')} }
  // VIP delivery
  for(const t of tables){ if(t.kind!=='vip') continue; const c=customers.find(c=>c.table===t&&c.state==='vipWait');
    if(c&&cat==='food'&&dist(P_.x,P_.y,t.x+t.w/2,t.y+t.d/2)<1.7){ const i=P_.carry.findIndex(k=>(c.order[k]||0)>(c.got[k]||0)); if(i>=0&&tick('vip',.15)){const k=P_.carry.splice(i,1)[0];c.got[k]=(c.got[k]||0)+1;c.patience=Math.min(c.pMax,c.patience+CFG.patience.perItem);fly(k,[P_.x,P_.y,1],[t.x+t.w/2,t.y+t.d/2,.7],.25);P_.reachT=.2;sfx('drop')} }
    if(t.pile>0&&dist(P_.x,P_.y,t.x+t.w/2,t.y+t.d/2)<1.7){ if(tick('vipc',.05)){const take=Math.min(t.pile,10);t.pile-=take;S.money+=take;S.stats.collected+=take;fly('coinHud',[t.x+t.w/2,t.y+t.d/2,.6],null,.45);P_.happyT=.4;sfx('coin');UI.bump()} }
  }
  // coins at the register
  if(S.pile>0&&dist(P_.x,P_.y,...PT.pile)<1.0){ if(tick('pile',.05)){const take=Math.min(S.pile,5+Math.floor(S.pile/40));S.pile-=take;S.money+=take;S.stats.collected+=take;fly('coinHud',[PT.pile[0],PT.pile[1],.3],null,.45);P_.happyT=.4;sfx('coin');UI.bump()} }
  // dirty plates
  for(const t of tables){ if(t.trash>0&&(cat===null||cat==='trash')&&P_.carry.length<max&&rectDist(P_.x,P_.y,t.x,t.y,t.w,t.d)<.85){ if(tick('tr'+t.id,.14)){t.trash--;P_.carry.push('trash');sfx('pick')} } }
  // bins
  if(cat==='trash') for(const b of bins){ if(dist(P_.x,P_.y,b.x+b.w/2,b.y+b.d/2)<1.05){ if(tick('bin',.1)){P_.carry.pop();S.stats.dumped++;P_.reachT=.2;fly('trash',[P_.x,P_.y,1],[b.x+.4,b.y+.4,.7],.25);sfx('drop')} } }
  // upgrade pads
  for(const pd of PADS){ if(!pd.vis()){padIn[pd.id]=false;continue} const inside=dist(P_.x,P_.y,...pd.pt)<.6;
    if(inside&&!padIn[pd.id]&&!UI.modalOpen&&!DEBUG.noModal&&!autoActive()) UI.openUpgrade(pd.tab); padIn[pd.id]=inside; }
}
const PADS=[
  {id:'kitchen',pt:PT.padKitchen,tab:'kitchen',color:'#7ed957',vis:()=>S.task>=taskIndex('t_upgrade')&&!!S.bought.oven1},
  {id:'manager',pt:PT.padManager,tab:'manager',color:'#5cb4f0',vis:()=>!!S.bought.office},
  {id:'rest',pt:PT.padRest,tab:'rest',color:'#f8c84a',vis:()=>S.task>=taskIndex('t_serve5')},
];

/* ---------------- stations ---------------- */
function updateStations(dt){
  for(const st of stations){ const cap=stCap(st);
    if(st.stock<cap&&(!st.def.needs||st.ing>0)){ st.timer+=dt; if(st.timer>=stInterval(st)){st.timer=0;st.stock++;if(st.def.needs)st.ing--;const k='cooked_'+st.def.item;S.stats[k]=(S.stats[k]||0)+1;if(st.def.item!=='ing')S.stats.cookedAll=(S.stats.cookedAll||0)+1;} }
    else st.timer=0; }
}

/* ---------------- customers ---------------- */
function makeOrder(vip){
  const av=available(), o={};
  if(vip){ const best=['special','seafood','veggie','dessert','pepperoni','drink'].find(k=>av.includes(k))||'pizza'; o[best]=1;
    const n=CFG.vip.items[0]+Math.floor(Math.random()*(CFG.vip.items[1]-CFG.vip.items[0]+1));
    for(let i=1;i<n;i++){const k=av[Math.floor(Math.random()*av.length)];o[k]=(o[k]||0)+1} return o; }
  const early=S.task<taskIndex('t_serve5');
  const n=early?1:1+Math.floor(Math.random()*Math.min(3,1+Math.floor(S.level/2)));
  for(let i=0;i<n;i++){ let k='pizza'; if(av.length>1&&Math.random()<.5){const others=av.filter(a=>a!=='pizza');k=others[Math.floor(Math.random()*others.length)]} o[k]=(o[k]||0)+1; }
  return o;}
const orderLeft=c=>Object.keys(c.order).reduce((a,k)=>a+Math.max(0,c.order[k]-(c.got[k]||0)),0);
const orderValue=c=>Object.keys(c.order).reduce((a,k)=>a+c.order[k]*itemPrice(k),0);
function spawnCustomer(vip=false){
  const skin=vip?VIP_SKINS[Math.floor(Math.random()*VIP_SKINS.length)]:CUSTOMER_SKINS[Math.floor(Math.random()*CUSTOMER_SKINS.length)];
  const c={id:nextId++,skin,vip,kid:!vip&&Math.random()<.15,x:SPAWN_PT[0],y:SPAWN_PT[1]+(Math.random()-.5)*.6,state:vip?'vipIn':'enter',path:[],order:makeOrder(vip),got:{},
    pMax:vip?CFG.patience.vip:CFG.patience.normal,t:Math.random()*5,seed:Math.random()*6,dir:135,walking:true,carry:[],emote:null,emoteT:0,happyT:0};
  c.patience=c.pMax; customers.push(c); return c;}
const queue=()=>customers.filter(c=>c.state==='enter'||c.state==='queue'||c.state==='order');
const slotPos=i=>[PT.queue0[0]+i*PT.queueStep,PT.queue0[1]];
function freeSeat(){const opts=[];for(const t of tables){ if(t.kind==='vip'||t.trash>0) continue; for(const s of t.seats) if(!s.occ) opts.push([t,s]); }
  if(!opts.length) return null; return opts[Math.floor(Math.random()*opts.length)];}
function customerPay(c,atTable){
  let amt=orderValue(c); if(c.vip) amt=Math.round(amt*CFG.vip.tipMul);
  S.stats.served++; S.stats.streak=(S.stats.streak||0)+1; if(c.vip) S.stats.vip=(S.stats.vip||0)+1;
  gainXp(Object.values(c.order).reduce((a,b)=>a+b,0));
  if(atTable){ c.table.pile+=amt; } else fly('coin',[c.x,c.y,1],[PT.pile[0],PT.pile[1],.2],.35,()=>{S.pile+=amt});
  floater(c.x,c.y,'+'+amt,'#fff3b0'); c.happyT=.8; emote(c,'heart',1.2); sfx('cash');
  if(c.vip) UI.offerVip(amt);
  const cw=workers.find(w=>w.role==='cashier'); if(cw&&!atTable) cw.happyT=.6;
}
function leave(c,angry){ if(c.seat){c.seat.occ=null;c.seat=null} c.state='leave'; goTo(c,...EXIT_PT); if(angry){emote(c,'anger',2);S.stats.lost=(S.stats.lost||0)+1;S.stats.streak=0;c.angry=true} }
function updateCustomers(dt){
  const reg=!!S.bought.register;
  if(reg){ spawnT-=dt; if(spawnT<=0){ if(queue().length<CFG.queueMax) spawnCustomer();
      const early=S.task<taskIndex('t_serve5'); spawnT=early?CFG.spawn.tutorial:(CFG.spawn.base+Math.random()*CFG.spawn.rand)*(1-CFG.spawn.flowStep*S.rFlow)*(S.grand?CFG.spawn.grandMul:1);} }
  // VIPs
  const vt=tables.find(t=>t.kind==='vip');
  if(vt&&!customers.some(c=>c.vip&&c.state!=='leave')&&vt.trash===0){ vipT-=dt; if(vipT<=0){ const c=spawnCustomer(true); const s=vt.seats[0]; s.occ=c; c.seat=s; c.table=vt; goTo(c,s.x,s.y); vipT=CFG.vip.interval[0]+Math.random()*(CFG.vip.interval[1]-CFG.vip.interval[0]); UI.toast('A VIP customer is arriving!'); } }
  // queue positions
  const q=queue();
  q.forEach((c,i)=>{const [sx,sy]=slotPos(i); c.path=[[sx,sy]]; const arrived=followPath(c,dt,CFG.npcSpeed.customer); if(arrived){c.walking=false; if(c.state==='enter')c.state='queue'; c.dir=135;}
    if(c.state!=='enter'){ c.patience-=dt*(i===0?1:.55); if(c.patience<=0){leave(c,true)} } });
  const front=queue()[0];
  if(front&&front.state!=='enter'&&dist(front.x,front.y,...slotPos(0))<.12){ front.state='order';
    if(cashierPresent()){ saleT-=dt; if(saleT<=0){ const k=Object.keys(front.order).find(k=>(front.got[k]||0)<front.order[k]&&tray[k]>0);
        if(k){saleT=.22;tray[k]--;front.got[k]=(front.got[k]||0)+1;front.carry.push(k);front.patience=Math.min(front.pMax,front.patience+CFG.patience.perItem);sfx('drop')} } }
    if(orderLeft(front)===0){ customerPay(front,false); const fs=freeSeat();
      if(fs){const [t,s]=fs;s.occ=front;front.seat=s;front.table=t;front.state='toSeat';goTo(front,s.x,s.y)} else {front.state='leave';goTo(front,...EXIT_PT)} } }
  for(const c of customers){ c.t+=dt; c.emoteT=Math.max(0,c.emoteT-dt); c.happyT=Math.max(0,c.happyT-dt);
    if(c.state==='toSeat'||c.state==='vipIn'){ if(followPath(c,dt,CFG.npcSpeed.customer)){ c.x=c.seat.x;c.y=c.seat.y; seatFacing(c);
        if(c.state==='toSeat'){c.state='eat';c.timer=4.5+Math.random()*2;c.foodN=c.carry.length;c.table.food.push(...c.carry);c.carry=[]} else {c.state='vipWait';emote(c,'sparkle',1.5)} } }
    else if(c.state==='vipWait'){ c.patience-=dt; if(orderLeft(c)===0){c.state='eat';c.timer=6;const its=[];for(const k in c.order)for(let i=0;i<c.order[k];i++)its.push(k);c.foodN=its.length;c.table.food.push(...its)} else if(c.patience<=0){ leave(c,true); } }
    else if(c.state==='eat'){ c.timer-=dt; if(c.timer<=0){ const t=c.table; t.food.splice(0,c.foodN||1); t.trash+=c.vip?2:1; if(c.vip) customerPay(c,true); c.happyT=.6; leave(c,false);} }
    else if(c.state==='leave'){ if(followPath(c,dt,CFG.npcSpeed.customer)) c.dead=true; }
  }
  customers=customers.filter(c=>!c.dead);
}
function seatFacing(c){c.dir={L:315,R:135,T:45,B:225,Lv:315,Rv:135}[c.seat.side]}

/* ---------------- workers ---------------- */
function makeWorker(role){const home={cashier:PT.cashier,helper:PT.homeHelper,waiter:PT.homeWaiter,cleaner:PT.homeCleaner}[role];
  return{role,skin:{cashier:'cashier',helper:'waiter',waiter:'waiter',cleaner:'cleaner'}[role],x:home[0],y:home[1],home,carry:[],path:[],job:null,t:0,idleT:0,dir:role==='cashier'?315:0,seed:Math.random()*6,cookT:0,serveT:0,walking:false,happyT:0,actT:0,reachT:0}}
function updateWorkers(dt){
  for(const w of workers){ w.t+=dt; w.happyT=Math.max(0,w.happyT-dt); w.reachT=Math.max(0,w.reachT-dt); w.emoteT=Math.max(0,(w.emoteT||0)-dt); w.sweepT=Math.max(0,(w.sweepT||0)-dt);
    w.cookT=Math.max(0,w.cookT-dt); w.serveT=Math.max(0,w.serveT-dt);
    if(w.role==='cashier'){ w.x=PT.cashier[0];w.y=PT.cashier[1];w.dir=315; const busy=customers.some(c=>c.state==='order');
      if(busy||dist(player.x,player.y,w.x,w.y)<CFG.wakeRadius){ if(w.idleT>CFG.sleepAfter) emote(w,'bang',.8); w.idleT=0; } else w.idleT=(w.idleT||0)+dt; continue; }
    if(w.dozeAt===undefined) w.dozeAt=CFG.doze.after[0]+Math.random()*(CFG.doze.after[1]-CFG.doze.after[0]);
    // asleep (dozed off at work, or idle for a while): the owner walking past wakes them and they go straight back to work
    const sleeping=w.asleep||w.idleT>CFG.sleepAfter;
    if(sleeping){ w.sleepT=(w.sleepT||0)+dt;
      if(dist(player.x,player.y,w.x,w.y)<CFG.wakeRadius||(w.asleep&&w.sleepT>CFG.doze.maxSleep)){ wakeWorker(w); }
      else if(w.asleep){ w.walking=false; continue; } }
    if(!w.job){ w.job=({helper:helperJob,waiter:waiterJob,cleaner:cleanerJob}[w.role])(w); w.justWoke=0;
      if(w.job){goTo(w,...w.job.at);w.idleT=0;w.sleepT=0}
      else { w.idleT+=dt; if(dist(w.x,w.y,...w.home)>.3&&!w.path.length) goTo(w,...w.home); } }
    if(w.job) w.workT=(w.workT||0)+dt;
    if(w.path.length){ followPath(w,dt,CFG.npcSpeed.worker*(w.boostT>0?1.35:1)); w.boostT=Math.max(0,(w.boostT||0)-dt); continue; }
    w.walking=false; w.boostT=Math.max(0,(w.boostT||0)-dt);
    if(w.job){ if(w.job.face) faceTo(w,...w.job.face); w.actT-=dt; if(w.actT<=0){ w.actT=.2; const done=w.job.act(w); if(w.job&&w.job.pose&&!done) w[w.job.pose]=.35; if(done){w.job=null; maybeDoze(w);} } w.jobT=(w.jobT||0)+dt; if(w.jobT>(w.job&&w.job.maxT||8)){w.job=null;w.jobT=0} }
    else { w.jobT=0; }
  }
}
/* after a long stretch of work a worker may nod off between jobs (never while holding something) */
function maybeDoze(w){ if(w.carry.length||(w.workT||0)<w.dozeAt) return; w.asleep=true; w.sleepT=0; w.path=[]; w.walking=false; }
function wakeWorker(w){ const was=w.asleep||w.idleT>CFG.sleepAfter; w.asleep=false; w.idleT=0; w.sleepT=0; w.workT=0;
  w.dozeAt=CFG.doze.after[0]+Math.random()*(CFG.doze.after[1]-CFG.doze.after[0]);
  if(was){ w.happyT=.5; w.boostT=CFG.doze.wakeBoost; w.justWoke=1; emote(w,'sparkle',1); S.stats.woken=(S.stats.woken||0)+1; sfx('pick'); } }
const claimed=(t,w)=>workers.some(o=>o!==w&&o.job&&o.job.table===t);
const nearestBin=w=>bins.slice().sort((a,b2)=>dist(w.x,w.y,...a.pt)-dist(w.x,w.y,...b2.pt))[0];
function helperJob(w){
  const c=catOf(w.carry);
  const needy=stations.filter(s=>s.def.needs&&s.ing<=s.def.ingCap-s.def.perIng).sort((a,b)=>a.ing-b.ing);
  const pantry=stations.find(s=>s.type==='pantry');
  if(c==='ing'){ const st=needy[0]||stations.filter(s=>s.def.needs&&s.ing<s.def.ingCap).sort((a,b)=>a.ing-b.ing)[0]; if(st) return {at:st.pt,face:[st.x+st.w/2,st.y+st.d/2],pose:'cookT',act:w=>{ if(!w.carry.length||st.ing>=st.def.ingCap) return true; w.carry.pop();st.ing+=st.def.perIng;S.stats.loaded++;w.reachT=.2;return !w.carry.length}};
    if(pantry) return {at:pantry.pt,act:w=>{w.carry.pop();pantry.stock++;return !w.carry.length}}; w.carry=[]; return null; }
  if(c==='food') return {at:PT.tray,act:w=>{const i=w.carry.findIndex(k=>tray[k]<TRAY_CAP);if(i<0){w.carry=[];return true}const it=w.carry.splice(i,1)[0];tray[it]++;w.reachT=.2;return !w.carry.length}};
  if(needy.length&&pantry&&pantry.stock>0){ const want=Math.min(4,needy.reduce((a,s)=>a+Math.ceil((s.def.ingCap-s.ing)/s.def.perIng),0));
    return {at:pantry.pt,face:[pantry.x+pantry.w/2,pantry.y+pantry.d/2],pose:'cookT',act:w=>{ if(pantry.stock>0&&w.carry.length<want){pantry.stock--;w.carry.push('ing');w.reachT=.2;return false} return true }}; }
  if(trayTotal()<30){ const food=stations.filter(s=>s.def.item!=='ing'&&s.stock>=2&&tray[s.def.item]<12).sort((a,b)=>(b.stock-tray[b.def.item]*.5)-(a.stock-tray[a.def.item]*.5))[0];
    if(food) return {at:food.pt,face:[food.x+food.w/2,food.y+food.d/2],pose:'cookT',act:w=>{ if(food.stock>0&&w.carry.length<4){food.stock--;w.carry.push(food.def.item);return false} return true }}; }
  return null;}
function waiterJob(w){
  const c=catOf(w.carry);
  const vipC=customers.find(c=>c.state==='vipWait'&&orderLeft(c)>0);
  const need=k=>vipC?Math.max(0,(vipC.order[k]||0)-(vipC.got[k]||0)-w.carry.filter(x=>x===k).length):0;
  if(c==='food'){ if(vipC&&w.carry.some(k=>(vipC.order[k]||0)>(vipC.got[k]||0))){ const t=vipC.table; return {at:[t.x+t.w/2,t.y+t.d+.55],face:[vipC.x,vipC.y],pose:'serveT',act:w=>{const i=w.carry.findIndex(k=>(vipC.order[k]||0)>(vipC.got[k]||0));if(i<0||vipC.state!=='vipWait')return true;const k=w.carry.splice(i,1)[0];vipC.got[k]=(vipC.got[k]||0)+1;vipC.patience=Math.min(vipC.pMax,vipC.patience+CFG.patience.perItem);w.reachT=.2;return false}}; }
    return {at:PT.tray,face:[5.5,4],pose:'reachT',act:w=>{const it=w.carry.pop();if(it)tray[it]++;w.reachT=.2;return !w.carry.length}}; }
  if(c==='trash'){ const b=nearestBin(w); if(b) return {at:b.pt,act:w=>{w.carry.pop();S.stats.dumped++;w.reachT=.2;return !w.carry.length}}; w.carry=[]; }
  // 1) VIP order: from the counter, or straight from the machine when the counter has none
  if(vipC&&FOODS.some(k=>need(k)>0&&tray[k]>0)) return {at:PT.tray,face:[5.5,4],act:w=>{const k=FOODS.find(k=>need(k)>0&&tray[k]>0);if(k&&w.carry.length<4){tray[k]--;w.carry.push(k);return false}return true}};
  if(vipC){ const st=stations.find(s=>need(s.def.item)>0&&s.stock>0);
    if(st) return {at:st.pt,face:[st.x+st.w/2,st.y+st.d/2],pose:'reachT',act:w=>{ if(st.stock>0&&need(st.def.item)>0&&w.carry.length<4){st.stock--;w.carry.push(st.def.item);return false} return true }}; }
  // 2) dirty plates (shared with the cleaner: each table is taken by one worker at a time)
  if(bins.length){ const t=tables.filter(t=>t.trash>0&&!claimed(t,w)).sort((a,b)=>dist(w.x,w.y,a.x,a.y)-dist(w.x,w.y,b.x,b.y))[0];
    if(t) return {table:t,at:[t.x+t.w/2,t.y+t.d+.55],face:[t.x+t.w/2,t.y+t.d/2],pose:'reachT',act:w=>{ if(t.trash>0&&w.carry.length<4){t.trash--;w.carry.push('trash');return false} return true }}; }
  // 3) run finished dishes from the machines to the counter
  if(S.bought.register&&trayTotal()<30){ const food=stations.filter(s=>s.def.item!=='ing'&&s.stock>=2&&tray[s.def.item]<12&&!workers.some(o=>o!==w&&o.job&&o.job.station===s)).sort((a,b)=>(b.stock-tray[b.def.item]*.5)-(a.stock-tray[a.def.item]*.5))[0];
    if(food) return {station:food,at:food.pt,face:[food.x+food.w/2,food.y+food.d/2],pose:'reachT',act:w=>{ if(food.stock>0&&w.carry.length<4){food.stock--;w.carry.push(food.def.item);return false} return true }}; }
  // 4) top up any dish the counter is short of, even a single one
  if(S.bought.register){ const food=stations.filter(s=>s.def.item!=='ing'&&s.stock>=1&&tray[s.def.item]<TRAY_CAP-2&&!workers.some(o=>o!==w&&o.job&&o.job.station===s)).sort((a,b)=>tray[a.def.item]-tray[b.def.item])[0];
    if(food&&(w.justWoke>0||tray[food.def.item]<8)) return {station:food,at:food.pt,face:[food.x+food.w/2,food.y+food.d/2],pose:'reachT',act:w=>{ if(food.stock>0&&w.carry.length<4){food.stock--;w.carry.push(food.def.item);return false} return true }}; }
  // 5) nothing to carry: walk the floor checking on the tables, so the waiter is never left standing after you wake him
  if(tables.length&&(w.justWoke>0||(w.patrolCd=(w.patrolCd||0)-1)<=0)){ w.patrolCd=4; const t=tables[Math.floor(Math.random()*tables.length)];
    let n=0; return {table:null,at:[t.x+t.w/2,t.y+t.d+.55],face:[t.x+t.w/2,t.y+t.d/2],maxT:10,act:w=>++n>=5}; }
  return null;}

/* cleaner: clears dirty plates (VIP booth first) to the nearest bin; when every table is clean, sweeps the dining floor */
function cleanerJob(w){
  const c=catOf(w.carry);
  if(w.carry.length){ const b=nearestBin(w);
    if(b) return {at:b.pt,face:[b.x+b.w/2,b.y+b.d/2],pose:'reachT',act:w=>{w.carry.pop();S.stats.dumped++;w.reachT=.25;return !w.carry.length}};
    w.carry=[]; return null; }
  if(!bins.length) return null;
  const t=tables.filter(t=>t.trash>0&&!claimed(t,w)).sort((a,b)=>(b.kind==='vip')-(a.kind==='vip')||dist(w.x,w.y,a.x,a.y)-dist(w.x,w.y,b.x,b.y))[0];
  if(t) return {table:t,at:[t.x+t.w/2,t.y+t.d+.55],face:[t.x+t.w/2,t.y+t.d/2],pose:'sweepT',act:w=>{ if(t.trash>0&&w.carry.length<CFG.cleanerCarry){t.trash--;w.carry.push('trash');w.sweepT=.4;return false} return true }};
  // nothing dirty: sweep a random patch of the dining floor for a moment
  w.sweepCd=(w.sweepCd||0)-1; if(w.sweepCd>0) return null; w.sweepCd=3;
  for(let i=0;i<12;i++){ const z=ZONES.filter(z=>(z.kind==='hall'||z.kind==='hall2'||z.kind==='upper')&&zoneOpen(z)&&!z.elev); const zz=z[Math.floor(Math.random()*z.length)]; if(!zz) break;
    const x=zz.x+.8+Math.random()*(zz.w-1.6), y=zz.y+.8+Math.random()*(zz.d-1.6); if(!walkable(x,y,.3)||solids().some(([sx,sy,sw,sd])=>x>sx-.45&&x<sx+sw+.45&&y>sy-.45&&y<sy+sd+.45)) continue;
    let n=0; return {at:[x,y],pose:'sweepT',maxT:12,act:w=>{ w.sweepT=.4; return ++n>=10; }}; }
  return null;}

/* ---------------- xp / economy ---------------- */
const xpNeed=()=>CFG.xp.base+S.level*CFG.xp.perLevel;
function gainXp(n){S.xp+=n;while(S.xp>=xpNeed()){S.xp-=xpNeed();S.level++;UI.toast('Level '+S.level+'!');sfx('level')}}

/* ---------------- main update ---------------- */
function update(dt,inp){
  if(!(dt>0)) dt=0; now+=dt; S.playTime+=dt;
  updatePlayer(dt,inp);
  updatePurchases(dt);
  updateStations(dt);
  updateCustomers(dt);
  updateWorkers(dt);
  if(typeof updateManager==='function') updateManager(dt);
  updateTasks(dt);
  updateSide();
  for(const f of flyers){f.t+=dt;if(f.t>=f.dur&&!f.fin){f.fin=true;f.done&&f.done()}} flyers=flyers.filter(f=>!f.fin);
  for(const p of particles){p.vz-=9*dt;p.wx+=p.vx*dt*.5;p.wy+=p.vy*dt*.5;p.wz+=p.vz*dt;p.life-=dt*1.1} particles=particles.filter(p=>p.life>0);
  for(const f of floaters){f.z+=dt*.9;f.life-=dt*.9} floaters=floaters.filter(f=>f.life>0);
  if(S.grand&&Math.random()<dt*1.2) burst(12+Math.random()*6,10+Math.random()*8,3+Math.random(),24);
}
/* guidance target for the arrow */
function taskTarget(){
  const t=curTask(); const cat=catOf(player.carry);
  const stPt=id=>{const s=stations.find(s=>s.id===id);return s?s.pt:null};
  if(t.kind==='buy'){ const sp=spotById(t.spot); return spotVisible(sp)?fpCenter(sp.fp):null; }
  if(t.kind==='level'||t.target){ const k=t.target;
    if(k==='padKitchen') return PT.padKitchen; if(k==='padRest') return PT.padRest;
    if(k==='oven1') return stPt('oven1'); if(k==='tray') return PT.tray; if(k==='cashier') return S.bought.cashier?null:PT.cashier;
    if(k==='pile') return S.pile>0?PT.pile:null;
    if(k==='trash'){ if(cat==='trash') return bins[0]?fpCenter([bins[0].x,bins[0].y,bins[0].w,bins[0].d]):null; const tb=tables.find(t=>t.trash>0); return tb?[tb.x+tb.w/2,tb.y+tb.d/2]:null }
    if(k==='pantry'){ if(cat==='ing') return stPt('prep'); return stPt('pantry'); }
    if(k==='vip'){ const v=tables.find(t=>t.kind==='vip'); if(!v) return null; const c=customers.find(c=>c.vip&&c.state==='vipWait'); if(c&&cat==='food') return [v.x+v.w/2,v.y+v.d/2]; if(c) return PT.tray; return v.pile>0?[v.x+v.w/2,v.y+v.d/2]:null }
    if(k==='special'){ if(cat==='ing') return stPt('special'); const s=stations.find(s=>s.id==='special'); return s&&s.ing<2?stPt('pantry'):null }
  }
  if(cat==='trash'&&bins.length) return [bins[0].x+.4,bins[0].y+.4];
  if(cat==='food') return PT.tray;
  return null;}
