/* =====================================================================
   45_autoplay.js — Auto play: the owner cat runs the restaurant by itself (same logic as the QA bot in tests/bot.js).
   Toggle with the AUTO button (S.auto). Any joystick input takes over for a moment, then auto play resumes.
   ===================================================================== */
const AUTOP={path:[],key:'',repath:0,cur:null,hold:0,stuck:0,manualT:0};
function autoActive(){ return !!(CFG.autoPlay&&S&&S.auto); }
function autoMove(dt){
  const A=window.__cp; if(!A) return null; const pl=player;
  const dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
  const need=(c)=>Object.keys(c.order).filter(k=>(c.order[k]-(c.got[k]||0))>0);
  const st=()=>S;
  function decide(){
    const S=st(),t=A.curTask(),cat=A.catOf(pl.carry),hired=k=>!!S.bought[k];
    // upgrades required by a task
    if(t.kind==='level'){const row=Object.values(A.UPG).flatMap(u=>u.rows).find(r=>r.key===t.key);const c=row.cost[S[t.key]];
      const pad=t.key.startsWith('r')?A.PT.padRest:t.key.startsWith('m')?A.PT.padManager:A.PT.padKitchen;
      if(c!==undefined&&S.money>=c){ if(dist(pl.x,pl.y,...pad)<.7){A.buyUpgrade(t.key);return null} return pad; } }
    if(t.kind==='custom'&&t.check==='anyKitchenUp'){ if(dist(pl.x,pl.y,...A.PT.padKitchen)<.7){A.buyUpgrade('spd');return null} return A.PT.padKitchen }
    if(t.kind==='buy'){const sp=A.SPOTS.find(s=>s.id===t.spot);if(A.spotVisible(sp)&&S.money>=sp.cost-(sp.paid||0)) return [sp.fp[0]+sp.fp[2]/2,sp.fp[1]+sp.fp[3]/2];}
    if(t.stat==='decor'){const sp=A.SPOTS.find(s=>s.kind==='decor'&&A.spotVisible(s)&&S.money>=s.cost-(s.paid||0));if(sp)return [sp.fp[0]+sp.fp[2]/2,sp.fp[1]+sp.fp[3]/2];}
    if(cat==='ing'){const s=A.stations.filter(s=>s.def.needs&&s.ing<s.def.ingCap).sort((a,b)=>a.ing-b.ing)[0];if(s)return s.pt;const pan=A.stations.find(s=>s.type==='pantry');if(pan)return pan.pt;}
    if(cat==='food'){const v=A.customers.find(c=>c.state==='vipWait');const vt=A.tables.find(t=>t.kind==='vip');if(v&&vt&&pl.carry.some(k=>need(v).includes(k)))return [vt.x+vt.w/2,vt.y+vt.d+.6];
      if(pl.carry.some(k=>A.tray[k]<A.TRAY_CAP)&&(pl.carry.length>=A.carryMax()||!A.stations.some(s=>s.def.item!=='ing'&&s.stock>0&&dist(pl.x,pl.y,...s.pt)<3))) return A.PT.tray;}
    if(cat==='trash'){const bb=A.bins().slice().sort((a,b)=>dist(pl.x,pl.y,a.x,a.y)-dist(pl.x,pl.y,b.x,b.y))[0];if(bb)return bb.pt;}
    const q=A.customers.filter(c=>c.state==='order');
    if(!hired('cashier')&&q.length&&need(q[0]).some(k=>A.tray[k]>0)) return A.PT.cashier;
    if(!hired('cashier')&&(t.check==='servedOne')) return A.PT.cashier;
    const vt=A.tables.find(t=>t.kind==='vip'); if(vt&&vt.pile>0) return [vt.x+vt.w/2,vt.y+vt.d+.6];
    if(S.pile>=25||(S.pile>0&&(t.kind==='buy'||t.check==='collectedAny'||t.stat==='collected'))) return A.PT.pile;
    if(!hired('waiter')&&!pl.carry.length&&A.bins().length){const tb=A.tables.find(t=>t.trash>0);if(tb)return [tb.x+tb.w/2,tb.y+tb.d+.6];}
    if(!pl.carry.length||cat==='ing'){const needy=A.stations.filter(s=>s.def.needs&&s.ing<s.def.ingCap);const pan=A.stations.find(s=>s.type==='pantry');
      if(needy.length&&pan&&pan.stock>0&&pl.carry.length<needy.reduce((a,s)=>a+Math.floor((s.def.ingCap-s.ing)/s.def.perIng),0)&&(!hired('helper')||t.target==='pantry'||t.id==='t_cookspecial')) return pan.pt;}
    if(cat===null||cat==='food'){const want={};A.customers.forEach(c=>{if(c.state==='order'||c.state==='queue'||c.state==='vipWait')for(const k of need(c))want[k]=(want[k]||0)+1});const opts=A.stations.filter(s=>s.def.item!=='ing'&&s.stock>0&&(A.tray[s.def.item]+pl.carry.filter(x=>x===s.def.item).length<A.TRAY_CAP||(want[s.def.item]||0)>A.tray[s.def.item])).sort((a,b)=>(b.stock-(A.tray[b.def.item]||0)*.3)-(a.stock-(A.tray[a.def.item]||0)*.3));
      if(opts[0]&&pl.carry.length<A.carryMax()) return opts[0].pt; if(pl.carry.some(k=>A.tray[k]<A.TRAY_CAP)) return A.PT.tray;}
    if(!hired('cashier')) return A.PT.cashier;
    return A.PT.pile;
  }

  const X=AUTOP; X.repath-=dt; X.hold-=dt; let tg;
  if(X.cur&&X.hold>0&&dist(pl.x,pl.y,...X.cur)>.5) tg=X.cur; else { tg=decide(); X.cur=tg; X.hold=2.5; }
  if(!tg) return [0,0];
  const key=tg.join(','); if(key!==X.key||X.repath<=0||!X.path.length){X.path=findPath(pl.x,pl.y,tg[0],tg[1]);X.key=key;X.repath=.6}
  while(X.path.length&&dist(pl.x,pl.y,...X.path[0])<.15) X.path.shift();
  const nx=X.path.length?X.path[0]:tg; const dx=nx[0]-pl.x,dy=nx[1]-pl.y;
  return Math.hypot(dx,dy)<.08?[0,0]:[dx,dy];
}
