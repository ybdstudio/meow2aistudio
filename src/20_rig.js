/* =====================================================================
   20_rig.js — CHUBBY cat rig (reference: "Chubby Style · Minimal Animation")

   ANGLE CONVENTION (engine-wide):
     0 front · 45 front-left · 90 left · 135 back-left
     180 back · 225 back-right · 270 right · 315 front-right

   Body parts live in the cat's own frame (r = cat's right, f = forward,
   y = up, units of H) and are projected + depth-sorted per angle, so every
   direction has exactly one head, one body, two arm-nubs, two leg-stubs and
   one tail. Walking animates ONLY the legs and the tail; idle is the same
   pose in every direction (plus blinking).
   ===================================================================== */
const DIRS=[0,45,90,135,180,225,270,315];
const DIR_NAME={0:'front',45:'front-left',90:'left',135:'back-left',180:'back',225:'back-right',270:'right',315:'front-right'};
function dirFromWorld(wx,wy){let k=Math.round(Math.atan2(wy,wx)/(Math.PI/4));k=((k%8)+8)%8;return [315,0,45,90,135,180,225,270][k]}

/* chubby proportions (units of H = feet → top of head) */
const RIG={bodyY:.27,bodyRX:.27,bodyRXside:.24,bodyRY:.205,headY:.655,headRX:.38,headRY:.3,legSep:.11,legH:.1,armR:.27,armY:.27,tilt:.14};
const SOFT_INK='#6a2c1f';

const CAT_SKINS={
  chef:    {name:'Chef Cat (player)',fur:'#f6a24e',white:'#fffaf2',ear:'#f6a24e',inner:'#f9b8b0',pattern:'bicolor',shirt:'#ffffff',apron:'#ec4a4a',apronLogo:'#ffffff',pants:'#5a3a2c',hat:'toque'},
  waiter:  {name:'Waiter Cat',fur:'#a9a4ab',white:'#fffaf6',ear:'#a9a4ab',inner:'#f9b8b0',pattern:'bicolor',shirt:'#ffffff',apron:'#ec4a4a',apronLogo:'#ffffff',pants:'#4a3a3a',hat:'cap',hatColor:'#ec4a4a'},
  cashier: {name:'Cashier Cat',fur:'#fffaf4',white:'#ffffff',ear:'#f4a456',inner:'#f9b8b0',pattern:'calico',p1:'#f4a456',p2:'#76696c',shirt:'#ffffff',apron:'#f5609a',apronLogo:'#ffffff',pants:'#4a3a3a',hat:'bow',hatColor:'#f5609a'},
  helper:  {name:'Kitchen Helper',fur:'#efd9b6',white:'#fffaf2',ear:'#efd9b6',inner:'#f9b8b0',pattern:'bicolor',shirt:'#ffffff',apron:'#ec4a4a',apronLogo:'#ffffff',pants:'#5a3a2c',hat:'toque'},
  manager: {name:'Manager Cat',fur:'#e9d3b2',white:'#fff7ea',ear:'#e9d3b2',inner:'#f9b8b0',pattern:'bicolor',shirt:'#8a5a3a',collar:'#ffffff',tie:'#ec4a4a',pants:'#2e2328',glasses:true},
  c_grey:  {name:'Customer (normal)',fur:'#b7b2b8',white:'#fffaf6',ear:'#b7b2b8',inner:'#f9b8b0',pattern:'tabby',stripe:'#8f8a92',shirt:'#5aa7e8',polo:true,pants:'#2e2328'},
  c_ginger:{name:'Customer (ginger)',fur:'#f6a24e',white:'#fff4e2',ear:'#f6a24e',inner:'#f9b8b0',pattern:'tabby',stripe:'#e38734',shirt:'#7cc65a',polo:true,pants:'#2e2328'},
  c_tux:   {name:'Customer (tuxedo)',fur:'#4a4450',white:'#ffffff',ear:'#4a4450',inner:'#f2a8b0',pattern:'bicolor',shirt:'#ffd34d',polo:true,pants:'#2e2328'},
  c_calico:{name:'Customer (calico)',fur:'#fffaf4',white:'#ffffff',ear:'#f4a456',inner:'#f9b8b0',pattern:'calico',p1:'#f4a456',p2:'#76696c',shirt:'#f48fb1',polo:true,pants:'#2e2328'},
  c_cream: {name:'Customer (cream)',fur:'#f0dcbc',white:'#fff8ec',ear:'#f0dcbc',inner:'#f9b8b0',pattern:'bicolor',shirt:'#b38ce0',polo:true,pants:'#2e2328'},
  c_elder: {name:'Customer (elder)',fur:'#f4efe8',white:'#ffffff',ear:'#d8cfc6',inner:'#f2b0ad',pattern:'calico',p1:'#cdbfb2',p2:'#9d9089',shirt:'#c9874d',polo:true,pants:'#6b5d52',glasses:true},
  kid:     {name:'Customer (kid)',fur:'#f7b064',white:'#fffaf2',ear:'#f7b064',inner:'#f9b8b0',pattern:'bicolor',shirt:'#f26a5c',polo:true,pants:'#4a6fa5',hat:'bow',hatColor:'#f5609a',scale:.8},
  tourist: {name:'Customer (tourist)',fur:'#f1dcc0',white:'#fffaf2',ear:'#f1dcc0',inner:'#f9b8b0',pattern:'bicolor',shirt:'#3fb6c6',polo:true,pants:'#c9a36a',hat:'bucket',hatColor:'#4aa3e8',camera:true,backpack:'#e2a466'},
  vip:     {name:'Customer (VIP)',fur:'#f6a24e',white:'#fff4e2',ear:'#f6a24e',inner:'#f9b8b0',pattern:'bicolor',shirt:'#2f2a33',collar:'#ffffff',tie:'#ec4a4a',pants:'#2a252e',hat:'fedora',hatColor:'#2a252e',shades:true},
};
const CUSTOMER_SKINS=['cat01','cat02','cat03','cat04'];   // approved art sets (16_more_sprites.js)
const VIP_SKINS=['vip01','vip02'];   // the two VIP looks with full sheets (fedora, pink elegant)

/* ---------- pose: only what each animation is allowed to move ---------- */
function rigPose(anim,t,seed){
  const P={legL:[0,0],legR:[0,0],tail:Math.sin(t*1.3+seed)*.03,arms:'side',tray:null,face:'normal',blink:((t+seed*3.7)%3.4)<.14,sit:false,lie:false,hop:0,hold:null};
  const legs=(spd)=>{const ph=t*spd;P.legL=[Math.sin(ph)*.045,Math.max(0,Math.sin(ph))*.04];P.legR=[-Math.sin(ph)*.045,Math.max(0,-Math.sin(ph))*.04];P.tail=Math.sin(ph*.5)*.12;};
  switch(anim){
    case 'walk': legs(10); break;                                   // legs + tail only
    case 'cwalk': legs(10); P.arms='tray'; P.tray=[0,.36,.31]; break; // tray stays level, arms fixed
    case 'carry': P.arms='tray'; P.tray=[0,.36,.31]; break;
    case 'serve': P.arms='tray'; P.tray=[0,.46,.36]; P.face='happy'; break;
    case 'cook': P.arms='front'; P.hold=Math.sin(t*10)*.025; P.face='happy'; break;
    case 'reach': P.arms='front'; break;
    case 'register': P.arms='front'; P.hold=Math.max(0,Math.sin(t*8))*.02; break;
    case 'happy': P.hop=Math.abs(Math.sin(t*7))*.05; P.arms='up'; P.face='happy'; break;
    case 'wait': P.face='content'; break;
    case 'tired': P.face='tired'; break;
    case 'mad': P.face='mad'; P.legR=[0,Math.max(0,Math.sin(t*10))*.025]; break;
    case 'sit': P.sit=true; break;
    case 'sitmad': P.sit=true; P.face='mad'; break;
    case 'eat': P.sit=true; P.arms='mouth'; P.face=Math.sin(t*6)>0?'chew':'content'; break;
    case 'sleep': P.lie=true; P.face='closed'; P.tail=Math.sin(t*1.1+seed)*.03; break;
    default: break;                                                  // idle: same pose every direction
  }
  return P;
}

/* soft vertical shading for round parts */
function mixHex(c,t,k){const a=parseInt(c.slice(1),16),b=parseInt(t.slice(1),16);const ch=s=>Math.round(((a>>s)&255)*(1-k)+((b>>s)&255)*k);return '#'+((1<<24)|(ch(16)<<16)|(ch(8)<<8)|ch(0)).toString(16).slice(1)}
function softFill(g,x,y,rx,ry,c){const gr=g.createRadialGradient(x-rx*.3,y-ry*.4,Math.min(rx,ry)*.05,x,y,Math.max(rx,ry)*1.05);gr.addColorStop(0,mixHex(c,'#ffffff',.22));gr.addColorStop(.65,c);gr.addColorStop(1,mixHex(c,'#5a3424',.12));return gr}
function blob(D,x,y,rx,ry,c,lw){const g=D.g;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=softFill(g,x,y,rx,ry,c);g.fill();if(lw){g.strokeStyle=SOFT_INK;g.lineWidth=lw;g.stroke()}}

function drawRigCat(g,x,y,H,skinKey,deg,anim,t,opts={}){
  const C=CAT_SKINS[skinKey]||CAT_SKINS.c_grey; H*=(C.scale||1)*(opts.scale||1);
  const th=deg*Math.PI/180, Rx=-Math.cos(th), Rz=-Math.sin(th), Fx=-Math.sin(th), Fz=Math.cos(th);
  const P=rigPose(anim,t,opts.seed||0), lw=Math.max(1,H*.032), D={g,OL:lw};
  const base=P.hop+(P.sit?.035:0)+(P.lie?-.06:0);
  const pj=(r,f,yy)=>{const z=r*Rz+f*Fz;return [x+(r*Rx+f*Fx)*H, y-(yy+base)*H+z*RIG.tilt*H, z]};
  const items=[],add=(z,fn)=>items.push([z,fn]);
  /* shadow (never moves) */
  g.save();g.fillStyle='rgba(90,52,36,.2)';g.beginPath();g.ellipse(x,y,H*.32,H*.1,0,0,7);g.fill();g.restore();
  /* ---- leg stubs (behind the body) ---- */
  if(!P.lie) for(const s of [-1,1]){ const off=s<0?P.legL:P.legR;
    const f0=P.sit?.2:off[0], yy=P.sit?.05:off[1];
    const p=pj(s*RIG.legSep,f0,.045+yy); add(p[2]-1,()=>{ const rx=H*.075, ry=H*.07;
      g.beginPath();g.ellipse(p[0],p[1],rx,ry,0,0,7);g.fillStyle=softFill(g,p[0],p[1],rx,ry,C.pants);g.fill();g.strokeStyle=SOFT_INK;g.lineWidth=lw;g.stroke();
      ell(D,p[0],p[1]+ry*.45,rx*.75,ry*.4,mixHex(C.pants,'#000000',.15),null); }); }
  /* ---- tail: small chubby curl from the lower back ---- */
  { const w=P.tail, pts=[pj(0,-.26,.17),pj(.13+w,-.36,.2),pj(.17+w*1.6,-.33,.34)];
    const z=pts[0][2]; add(z<0?-.5:.4,()=>{g.lineCap='round';g.beginPath();g.moveTo(pts[0][0],pts[0][1]);g.quadraticCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1]);
      g.strokeStyle=SOFT_INK;g.lineWidth=H*.095;g.stroke();g.strokeStyle=C.pattern==='calico'?C.p1:C.fur;g.lineWidth=H*.095-lw*2;g.stroke();
      if(C.pattern==='tabby'){const m=pts[1];ell(D,m[0],m[1],H*.02,H*.03,C.stripe,null)} }); }
  /* ---- arm nubs ---- */
  const armPos=s=>{ switch(P.arms){
      case 'tray': return [s*.2,P.tray[1]-.04,P.tray[2]-.02];
      case 'front': return [s*.17,.27,.25+(P.hold||0)*s];
      case 'up': return [s*.34,.06,.42];
      case 'mouth': return [s*.1,.27,.42+(s>0?Math.max(0,Math.sin(t*6))*.05:0)];
      default: return [s*RIG.armR,.04,RIG.armY]; } };
  for(const s of [-1,1]){ const a=pj(...armPos(s)); add(a[2]<-.02?-.3:(P.arms==='side'?.15:.9),()=>{
      blob(D,a[0],a[1],H*.08,H*.09,C.shirt,lw); g.save();g.beginPath();g.ellipse(a[0],a[1],H*.08-lw/2,H*.09-lw/2,0,0,7);g.clip();ell(D,a[0],a[1]+H*.07,H*.08,H*.045,C.fur,null);g.restore(); }); }
  /* ---- body (one rounded bean) + clothing ---- */
  add(0,()=>{
    const [cx,cy]=pj(0,0,P.lie?.18:RIG.bodyY), rx=H*Math.hypot(RIG.bodyRX*Rx,RIG.bodyRXside*Fx)*(P.lie?1.25:1), ry=H*RIG.bodyRY*(P.lie?.75:1);
    if(C.backpack&&Fz<.2){const b=pj(0,-.3,.3);g.fillStyle=C.backpack;rr(g,b[0]-H*.13,b[1]-H*.11,H*.26,H*.22,H*.06);g.fill();g.strokeStyle=SOFT_INK;g.lineWidth=lw;g.stroke()}
    g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.fillStyle=softFill(g,cx,cy,rx,ry,C.shirt);g.fill();
    g.save();g.clip();
    g.fillStyle=C.pants;g.fillRect(cx-rx,cy+ry*.45,rx*2,ry);                       // trousers peek at the bottom
    const front=Fz>-.08, fa=Math.max(0,Fz), fq=(r,yy)=>pj(r,.3,yy), bq=(r,yy)=>pj(r,-.3,yy);
    if(C.apron&&front){ const a=[fq(-.17,.39),fq(.17,.39),fq(.2,.16),fq(.14,.09),fq(-.14,.09),fq(-.2,.16)];
      g.beginPath();g.moveTo(a[0][0],a[0][1]);for(let i=1;i<a.length;i++)g.lineTo(a[i][0],a[i][1]);g.closePath();g.fillStyle=C.apron;g.fill();g.strokeStyle=SOFT_INK;g.lineWidth=lw*.8;g.stroke();
      if(fa>.25){const p=fq(0,.24);pawPrint(D,p[0],p[1],H*.075*fa+H*.01,C.apronLogo)} }
    if(C.apron&&!front){ line(D,[bq(-.3,.3),bq(.3,.3)],C.apron,lw*2.2); const k=bq(0,.3); ell(D,k[0]-H*.035,k[1],H*.035,H*.025,C.apron,SOFT_INK,lw*.7); ell(D,k[0]+H*.035,k[1],H*.035,H*.025,C.apron,SOFT_INK,lw*.7); }
    if(C.polo&&front&&fa>.15){ const a=fq(0,.4),b=fq(0,.27); line(D,[[a[0],a[1]],[b[0],b[1]]],mixHex(C.shirt,'#000000',.2),lw*.8); for(const yy of [.36,.3]){const p=fq(0,yy);ell(D,p[0]+H*.012,p[1],H*.011*Math.max(fa,.4),H*.011,'#ffffff',null)} }
    if(C.tie&&front){ poly(D,[fq(-.07,.42),fq(.07,.42),fq(0,.3)],C.collar||'#fff',null); poly(D,[fq(-.015,.41),fq(.015,.41),fq(.02,.27),fq(0,.24),fq(-.02,.27)],C.tie,null); }
    if(C.camera&&front){const p=fq(.03,.3);g.fillStyle='#3a3540';rr(g,p[0]-H*.06*Math.max(fa,.3),p[1]-H*.035,H*.12*Math.max(fa,.3),H*.07,H*.015);g.fill();ell(D,p[0],p[1],H*.022*Math.max(fa,.3),H*.022,'#9fd4f0',SOFT_INK,lw*.6)}
    g.restore();
    g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.strokeStyle=SOFT_INK;g.lineWidth=lw;g.stroke();
  });
  /* ---- tray (held level) ---- */
  if(P.tray){ const tp=pj(...P.tray); add(tp[2]>0?.7:-.4,()=>{ if(!opts.noTray){const rx=H*.2,ry=H*.08;cyl(D,tp[0],tp[1],rx,ry,H*.025,'#b9c0c8','#e3e7ec',SOFT_INK);} if(opts.held) opts.held(g,tp[0],tp[1]-H*.025,H); }); }
  /* ---- head ---- */
  add(.5,()=>drawChubbyHead(g,D,C,pj,P,H,lw,Fx,Fz));
  items.sort((a,b)=>a[0]-b[0]); for(const [,fn] of items) fn();
  return pj;
}
function drawChubbyHead(g,D,C,pj,P,H,lw,Fx,Fz){
  const hy=P.lie?.42:RIG.headY+(P.sit?-.01:0), [hx,hyS]=pj(0,0,hy), rx=H*RIG.headRX, ry=H*RIG.headRY;
  const ears=[-1,1].map(s=>({s,b:pj(s*.21,-.02,hy+.17),tp:pj(s*.27,-.04,hy+.34)}));
  const drawEar=e=>{const w=H*.095*Math.max(.45,Math.abs(Fz));
    const pts=[[e.b[0]-w,e.b[1]+H*.04],[e.tp[0],e.tp[1]],[e.b[0]+w,e.b[1]+H*.04]];
    g.beginPath();g.moveTo(pts[0][0],pts[0][1]);g.quadraticCurveTo(pts[1][0]-w*.15,pts[1][1]-H*.02,pts[1][0],pts[1][1]);g.quadraticCurveTo(pts[1][0]+w*.15,pts[1][1]-H*.02,pts[2][0],pts[2][1]);g.closePath();
    g.fillStyle=C.pattern==='calico'?(e.s<0?C.p2:C.p1):C.ear;g.fill();g.strokeStyle=SOFT_INK;g.lineWidth=lw;g.stroke();
    if(Fz>.1){g.beginPath();g.moveTo(e.b[0]-w*.5,e.b[1]+H*.03);g.lineTo(e.tp[0],e.tp[1]+H*.05);g.lineTo(e.b[0]+w*.5,e.b[1]+H*.03);g.closePath();g.fillStyle=C.inner;g.fill()} };
  const hatBack=[],hatFront=[];
  if(C.hat==='cap'){ const brim=pj(0,.3,hy+.13), bw=H*(.13+.1*Math.abs(Fx));
    (brim[2]>.06?hatFront:hatBack).push(()=>{g.beginPath();if(brim[2]>.15){g.ellipse(brim[0],brim[1],bw,H*.06,0,0,Math.PI);g.closePath()}else g.ellipse(brim[0],brim[1],bw,H*.035,0,0,7);g.fillStyle=mixHex(C.hatColor,'#000000',.12);g.fill();g.strokeStyle=SOFT_INK;g.lineWidth=lw;g.stroke()}); }
  if(C.hat==='bow'){ const b=pj(.16,.08,hy+.25); (b[2]>-.08?hatFront:hatBack).push(()=>bowAt(D,b[0],b[1],H*.09,C.hatColor,lw,Math.max(.45,Math.abs(Fz)))); }
  for(const e of ears) if(C.hat!=='cap'||true) drawEar(e);
  hatBack.forEach(f=>f());
  /* skull */
  g.beginPath();g.ellipse(hx,hyS,rx,ry,0,0,7);g.fillStyle=softFill(g,hx,hyS,rx,ry,C.fur);g.fill();
  g.save();g.clip();
  if(C.pattern==='calico'){const a=pj(-.2,-.05,hy+.15),b=pj(.2,-.02,hy+.12);ell(D,a[0],a[1],H*.17,H*.13,C.p2,null);ell(D,b[0],b[1],H*.16,H*.12,C.p1,null)}
  if(C.pattern==='tabby'){for(const k of [-1,0,1]){const a=pj(k*.07,.05,hy+.29),b=pj(k*.065,.12,hy+.19);line(D,[[a[0],a[1]],[b[0],b[1]]],C.stripe,lw*1.5)}
    if(Fz<.3) for(const k of [-1,0,1]){const a=pj(k*.08,-.3,hy+.14),b=pj(k*.08,-.33,hy+.02);line(D,[[a[0],a[1]],[b[0],b[1]]],C.stripe,lw*1.5)}}
  /* white lower face (muzzle + cheeks) */
  const mz=pj(0,.26,hy-.12); if(mz[2]>-.15) ell(D,mz[0],mz[1],H*.25*Math.max(.5,Math.abs(Fz)*.85+.15),H*.15,C.white,null);
  g.restore();
  g.save();g.globalAlpha=.35;g.beginPath();g.ellipse(hx-rx*.42,hyS-ry*.5,rx*.28,ry*.14,-.5,0,7);g.fillStyle='#fff';g.fill();g.restore();
  g.beginPath();g.ellipse(hx,hyS,rx,ry,0,0,7);g.strokeStyle=SOFT_INK;g.lineWidth=lw;g.stroke();
  /* face — small dark eyes spaced wide, big blush, tiny ω mouth */
  const feat=(r,f,yy)=>{const p=pj(r,f,hy+yy);const n=Math.hypot(r,f)||1;return [p[0],p[1],p[2]/n]};
  const eyes=[feat(-.15,.32,-.03),feat(.15,.32,-.03)];
  for(const e of eyes){ if(e[2]<=.12) continue; const w=Math.min(1,e[2]*1.1);
    if(C.shades) continue;
    const arc=(up)=>{g.beginPath();if(up)g.ellipse(e[0],e[1]+H*.012,H*.032*w,H*.026,0,Math.PI*1.1,Math.PI*1.9);else g.ellipse(e[0],e[1]-H*.006,H*.03*w,H*.02,0,Math.PI*.15,Math.PI*.85);g.strokeStyle=SOFT_INK;g.lineWidth=lw*1.2;g.lineCap='round';g.stroke()};
    if(P.face==='happy'||P.face==='content') arc(true);
    else if(P.face==='closed'||P.face==='chew'||P.blink) arc(false);
    else if(P.face==='tired'){ line(D,[[e[0]-H*.03*w,e[1]],[e[0]+H*.03*w,e[1]]],SOFT_INK,lw*1.3); }
    else { ell(D,e[0],e[1],H*.045*w,H*.056,'#2a1a1a',null); ell(D,e[0]+H*.014*w,e[1]-H*.018,H*.018*w,H*.02,'#fff',null); ell(D,e[0]-H*.012*w,e[1]+H*.02,H*.007*w,H*.007,'#fff',null); }
    if(P.face==='mad'){const s=e===eyes[0]?-1:1;line(D,[[e[0]-H*.04*w*s,e[1]-H*.065],[e[0]+H*.03*w*s,e[1]-H*.04]],SOFT_INK,lw*1.2)}
  }
  if(C.shades){ const vis=eyes.filter(e=>e[2]>.12); vis.forEach(e=>{const w=Math.min(1,e[2]*1.1);g.fillStyle='#1d1a22';rr(g,e[0]-H*.06*w,e[1]-H*.04,H*.12*w,H*.07,H*.03);g.fill();shine(D,e[0]-H*.045*w,e[1]-H*.03,H*.03*w,H*.012,.5)});
    if(vis.length===2) line(D,[[vis[0][0]+H*.05,vis[0][1]-H*.01],[vis[1][0]-H*.05,vis[1][1]-H*.01]],'#1d1a22',lw); }
  if(C.glasses) eyes.forEach(e=>{if(e[2]>.12){const w=Math.min(1,e[2]*1.1);ell(D,e[0],e[1],H*.055*w,H*.055,null,SOFT_INK,lw*.8)}});
  for(const s of [-1,1]){const c=feat(s*.22,.25,-.1);if(c[2]>.1)ell(D,c[0],c[1],H*.06*Math.min(1,c[2]*1.4),H*.035,'rgba(247,128,150,.55)',null)}
  const n=feat(0,.35,-.07); if(n[2]>.05){ const w=Math.max(.5,n[2]); ell(D,n[0],n[1],H*.016*w,H*.011,'#e9707a',null);
    const m=[n[0],n[1]+H*.026];
    if(P.face==='happy'){g.beginPath();g.moveTo(m[0]-H*.035*w,m[1]-H*.008);g.quadraticCurveTo(m[0],m[1]+H*.05,m[0]+H*.035*w,m[1]-H*.008);g.closePath();g.fillStyle='#e0626e';g.fill();g.strokeStyle=SOFT_INK;g.lineWidth=lw*.8;g.stroke()}
    else if(P.face==='mad'||P.face==='tired'){g.beginPath();g.moveTo(m[0]-H*.025*w,m[1]+H*.01);g.quadraticCurveTo(m[0],m[1]-H*.008,m[0]+H*.025*w,m[1]+H*.01);g.strokeStyle=SOFT_INK;g.lineWidth=lw*.9;g.stroke()}
    else if(P.face==='chew'){ell(D,m[0],m[1],H*.015*w,H*.013,'#e0626e',SOFT_INK,lw*.6)}
    else {g.beginPath();g.moveTo(m[0]-H*.028*w,m[1]-H*.006);g.quadraticCurveTo(m[0],m[1]+H*.045,m[0]+H*.028*w,m[1]-H*.006);g.closePath();g.fillStyle='#8a2a2a';g.fill();g.strokeStyle=SOFT_INK;g.lineWidth=lw*.8;g.stroke();ell(D,m[0],m[1]+H*.016,H*.014*w,H*.009,'#f07a8a',null)} }
  /* hats */
  if(C.hat==='toque'){ const b=pj(0,-.02,hy+.26);
    for(const [a,c,r] of [[-.12,-.12,.105],[.12,-.12,.105],[0,-.17,.125]]) blob(D,b[0]+a*H,b[1]+c*H,r*H,r*H*.85,'#ffffff',lw);
    ell(D,b[0],b[1]-H*.09,H*.17,H*.06,'#ffffff',null);
    g.fillStyle='#ffffff';rr(g,b[0]-H*.15,b[1]-H*.06,H*.3,H*.085,H*.03);g.fill();g.strokeStyle=SOFT_INK;g.lineWidth=lw;g.stroke(); }
  if(C.hat==='cap'){ const c=pj(0,0,hy+.12); g.beginPath();g.ellipse(c[0],c[1],H*.34,H*.2,0,Math.PI*1.02,Math.PI*1.98);g.closePath();g.fillStyle=softFill(g,c[0],c[1]-H*.1,H*.34,H*.2,C.hatColor);g.fill();g.strokeStyle=SOFT_INK;g.lineWidth=lw;g.stroke();
    const logo=pj(0,.3,hy+.21); if(logo[2]>.06) pawPrint(D,logo[0],logo[1],H*.05*Math.max(.5,Fz),'#ffffff'); ell(D,c[0],c[1]-H*.2,H*.03,H*.022,C.hatColor,SOFT_INK,lw*.8); }
  if(C.hat==='bucket'){ const b=pj(0,0,hy+.2); ell(D,b[0],b[1],H*.38,H*.09,C.hatColor,SOFT_INK,lw); g.beginPath();g.moveTo(b[0]-H*.24,b[1]);g.lineTo(b[0]-H*.19,b[1]-H*.16);g.quadraticCurveTo(b[0],b[1]-H*.23,b[0]+H*.19,b[1]-H*.16);g.lineTo(b[0]+H*.24,b[1]);g.closePath();g.fillStyle='#5cb4f0';g.fill();g.strokeStyle=SOFT_INK;g.lineWidth=lw;g.stroke(); }
  if(C.hat==='fedora'){ const b=pj(0,0,hy+.2); ell(D,b[0],b[1],H*.4,H*.085,C.hatColor,SOFT_INK,lw); g.beginPath();g.moveTo(b[0]-H*.22,b[1]);g.lineTo(b[0]-H*.18,b[1]-H*.18);g.quadraticCurveTo(b[0],b[1]-H*.13,b[0]+H*.18,b[1]-H*.18);g.lineTo(b[0]+H*.22,b[1]);g.closePath();g.fillStyle='#35303a';g.fill();g.strokeStyle=SOFT_INK;g.lineWidth=lw;g.stroke(); g.fillStyle='#ec4a4a';g.fillRect(b[0]-H*.21,b[1]-H*.065,H*.42,H*.045); }
  hatFront.forEach(f=>f());
}
function bowAt(D,x,y,s,c,lw,wk=1){const g=D.g;
  for(const sg of [-1,1]){g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+sg*s*1.1*wk,y-s*.9,x+sg*s*1.05*wk,y+s*.05);g.quadraticCurveTo(x+sg*s*1.0*wk,y+s*.7,x,y);g.fillStyle=c;g.fill();g.strokeStyle=SOFT_INK;g.lineWidth=lw;g.stroke()}
  ell(D,x,y,s*.3,s*.28,mixHex(c,'#000000',.15),SOFT_INK,lw)}
