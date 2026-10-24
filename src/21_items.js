/* =====================================================================
   21_items.js — food, carried items, coins and emote sprites.
   Round things are drawn as true iso circles (ry = rx/2), never scaled
   non-uniformly, so pizzas keep the same shape everywhere.
   ===================================================================== */
/* ---------- pizzas: one recipe definition drives every state (raw / baked / icon) ---------- */
const PIZZA_TYPES={
  pizza:    {crust:'#f0b257',tops:[['basil',-.42,-.25,.4],['moz',.05,-.38,0],['basil',.38,.18,2.2],['moz',-.25,.38,0],['basil',.02,.08,4.1],['moz',.5,-.08,0]]},
  pepperoni:{crust:'#f0b257',tops:[['pep',-.45,-.25],['pep',.3,-.42],['pep',.02,.02],['pep',.5,.22],['pep',-.32,.42],['pep',.18,.5],['pep',-.05,-.6],['pep',.6,-.15]]},
  veggie:   {crust:'#f0b257',tops:[['ring',-.4,-.3],['mush',.3,-.35],['tom',.0,.05],['olive',.48,.25],['ring',-.25,.45],['mush',.25,.45],['olive',-.55,.1],['tom',.55,-.25],['olive',.0,-.55]]},
  seafood:  {crust:'#f0b257',tops:[['shrimp',-.4,-.2],['squid',.3,-.4],['shrimp',.25,.3],['squid',-.25,.45],['shrimp',.0,-.05],['herb',.55,0],['herb',-.55,.2],['herb',.05,.6]]},
  special:  {crust:'#f4c04e',tops:[['pep',-.45,-.25],['saus',.3,-.4],['ring',.0,.05],['olive',.5,.25],['mush',-.3,.42],['pep',.22,.48],['saus',-.1,-.6],['olive',-.6,.1],['pep',.6,-.2]]},
};
function topping(D,k,x,y,rx,ry,raw,rot=0){const g=D.g,lw=D.OL*.45;
  if(k==='pep'){ell(D,x,y,rx*.14,ry*.14,raw?'#d8493a':'#c8372b',INK,lw);ell(D,x-rx*.04,y-ry*.03,rx*.025,ry*.025,'#e9746a',null);ell(D,x+rx*.04,y+ry*.03,rx*.02,ry*.02,'#9e2a20',null)}
  else if(k==='basil'){g.save();g.translate(x,y);g.scale(1,.5);g.rotate(rot);g.beginPath();g.ellipse(0,0,rx*.13,rx*.07,0,0,7);g.fillStyle='#3f9a3a';g.fill();g.strokeStyle=INK;g.lineWidth=lw*1.4;g.stroke();g.beginPath();g.moveTo(-rx*.12,0);g.lineTo(rx*.12,0);g.strokeStyle='#7cc85a';g.lineWidth=lw;g.stroke();g.restore()}
  else if(k==='moz'){ell(D,x,y,rx*.12,ry*.12,raw?'#fffef8':'#fff6dc',raw?'#e8dcc4':null,lw)}
  else if(k==='ring'){g.beginPath();g.ellipse(x,y,rx*.12,ry*.12,0,0,7);g.strokeStyle='#2f8a2f';g.lineWidth=D.OL*.9;g.stroke();g.strokeStyle='#5cbf45';g.lineWidth=D.OL*.45;g.stroke()}
  else if(k==='mush'){g.beginPath();g.ellipse(x,y,rx*.11,ry*.09,0,Math.PI,0);g.lineTo(x+rx*.04,y+ry*.1);g.lineTo(x-rx*.04,y+ry*.1);g.closePath();g.fillStyle='#efe0c6';g.fill();g.strokeStyle='#8a6a4a';g.lineWidth=lw;g.stroke()}
  else if(k==='tom'){ell(D,x,y,rx*.13,ry*.13,'#e2463f',INK,lw);ell(D,x,y,rx*.07,ry*.07,'#f47a6a',null)}
  else if(k==='olive'){ell(D,x,y,rx*.075,ry*.075,'#2f2a33',null);ell(D,x,y,rx*.03,ry*.03,raw?'#fff3c4':'#f8d66a',null)}
  else if(k==='shrimp'){g.save();g.translate(x,y);g.scale(1,.55);g.beginPath();g.arc(0,0,rx*.11,Math.PI*.15,Math.PI*1.75);g.strokeStyle=INK;g.lineWidth=rx*.1;g.lineCap='round';g.stroke();g.strokeStyle=raw?'#f6b0a0':'#f2875e';g.lineWidth=rx*.07;g.stroke();
     g.strokeStyle='#fff3e8';g.lineWidth=rx*.012;for(let a=.4;a<1.7;a+=.35){g.beginPath();g.arc(0,0,rx*.11,Math.PI*a,Math.PI*(a+.05));g.stroke()}g.restore()}
  else if(k==='squid'){g.beginPath();g.ellipse(x,y,rx*.1,ry*.1,0,0,7);g.strokeStyle='#d9cfc4';g.lineWidth=D.OL*1.1;g.stroke();g.strokeStyle='#fffaf2';g.lineWidth=D.OL*.6;g.stroke()}
  else if(k==='herb'){for(const a of [-.6,0,.6]) ell(D,x+Math.cos(a)*rx*.04,y+Math.sin(a)*ry*.04,rx*.03,ry*.025,'#5aa63c',null)}
  else if(k==='saus'){ell(D,x,y,rx*.09,ry*.1,'#8a4a2a',INK,lw);ell(D,x-rx*.02,y-ry*.03,rx*.025,ry*.02,'#b7704a',null)}
}
/* iso pizza (ry = rx/2). state: 'baked' | 'raw' */
function pizzaPaint(D,type,state='baked'){
  const T=D.T, rx=.21*T, ry=rx/2, t=.04*T, def=PIZZA_TYPES[type], raw=state==='raw', g=D.g;
  cyl(D,0,0,rx,ry,t,raw?'#e6cfa3':'#c97a35',raw?'#f3dfb8':def.crust);
  if(!raw){ g.save();g.beginPath();g.ellipse(0,-t,rx,ry,0,0,7);g.clip();const gr=g.createLinearGradient(-rx,-t-ry,rx,-t+ry);gr.addColorStop(0,'rgba(255,240,190,.55)');gr.addColorStop(1,'rgba(160,80,20,.25)');g.fillStyle=gr;g.fillRect(-rx,-t-ry,rx*2,ry*2);g.restore(); }
  ell(D,0,-t,rx*.87,ry*.87,'#d9452f',null);
  if(raw){ for(let i=0;i<26;i++){const a=i*2.4,r=(i%7)/7*.75; const x=Math.cos(a)*rx*r,y=-t+Math.sin(a)*ry*r; line(D,[[x-rx*.04,y],[x+rx*.04,y+ry*.03]],'#fff1b0',D.OL*.9);} }
  else { ell(D,0,-t,rx*.79,ry*.79,'#f8d66a',null); for(const [a,b,r] of [[-.35,-.1,.18],[.3,.25,.16],[.1,-.45,.14],[-.15,.45,.12]]) ell(D,a*rx,-t+b*ry,rx*r,ry*r,'#fde68f',null);
    for(const [a,b] of [[.45,-.3],[-.55,.25],[.15,.55]]) ell(D,a*rx,-t+b*ry,rx*.05,ry*.05,'#e9a94a',null); }
  ell(D,0,-t,rx,ry,null);
  def.tops.forEach(([k,u,v,rot])=>topping(D,k,u*rx*.72,-t+v*ry*.72,rx,ry,raw,rot||0));
  if(!raw) shine(D,-rx*.7,-t-ry*.55,rx*.35,ry*.18,.45);
}
/* top-down icon used in order bubbles: same toppings, simplified, perfectly round */
function pizzaIcon(D,type){const T=D.T,r=.17*T,def=PIZZA_TYPES[type];ell(D,0,-r,r,r,def.crust);ell(D,0,-r,r*.84,r*.84,'#d9452f',null);ell(D,0,-r,r*.76,r*.76,'#f8d66a',null);
  def.tops.slice(0,6).forEach(([k,u,v,rot])=>topping(D,k,u*r*.62,-r+v*r*.62,r*1.15,r*1.15,false,rot||0));ell(D,0,-r,r,r,null)}
function pizzaBox(D){const T=D.T;const sub=mkD(D.g,(x,y,z=0)=>[(x-y)*T/2,(x+y)*T/4-z*T*.56],T);
  box(sub,-.2,-.2,0,.4,.4,.1,'#f6d7a8','#d9a868','#e6b97c');const [x,y]=sub.P(0,0,.1);
  D.g.save();D.g.translate(x,y);D.g.scale(1,.5);D.g.beginPath();D.g.arc(0,0,T*.09,0,7);D.g.fillStyle=COL.red;D.g.fill();D.g.fillStyle='#fff';D.g.font=`700 ${T*.07}px Fredoka, sans-serif`;D.g.textAlign='center';D.g.textBaseline='middle';D.g.fillText('MEOW',0,0);D.g.restore()}
const ITEM_PAINT={
  pizza:D=>pizzaPaint(D,'pizza'), pepperoni:D=>pizzaPaint(D,'pepperoni'), veggie:D=>pizzaPaint(D,'veggie'), seafood:D=>pizzaPaint(D,'seafood'), special:D=>pizzaPaint(D,'special'),
  raw_pizza:D=>pizzaPaint(D,'pizza','raw'), raw_pepperoni:D=>pizzaPaint(D,'pepperoni','raw'), raw_veggie:D=>pizzaPaint(D,'veggie','raw'), raw_seafood:D=>pizzaPaint(D,'seafood','raw'), raw_special:D=>pizzaPaint(D,'special','raw'),
  ic_pizza:D=>pizzaIcon(D,'pizza'), ic_pepperoni:D=>pizzaIcon(D,'pepperoni'), ic_veggie:D=>pizzaIcon(D,'veggie'), ic_seafood:D=>pizzaIcon(D,'seafood'), ic_special:D=>pizzaIcon(D,'special'),
  box:D=>pizzaBox(D),
  drink:D=>{const T=D.T,rx=.075*T,ry=rx/2,h=.2*T;
    cyl(D,0,0,rx,ry,h,COL.red,'#ffffff');
    D.g.fillStyle='#fff';D.g.fillRect(-rx+D.OL/2,-h*.62,rx*2-D.OL,h*.26);
    ell(D,0,-h*.5,rx*.42,rx*.36,'#fff',INK,D.OL*.6);poly(D,[[-rx*.38,-h*.55],[-rx*.3,-h*.72],[-rx*.12,-h*.62]],'#fff',INK,D.OL*.5);poly(D,[[rx*.38,-h*.55],[rx*.3,-h*.72],[rx*.12,-h*.62]],'#fff',INK,D.OL*.5);
    ell(D,-rx*.15,-h*.5,rx*.05,rx*.05,INK,null);ell(D,rx*.15,-h*.5,rx*.05,rx*.05,INK,null);
    line(D,[[rx*.2,-h],[rx*.5,-h-.11*T],[rx*.95,-h-.12*T]],INK,D.OL*2.2);line(D,[[rx*.2,-h],[rx*.5,-h-.11*T],[rx*.95,-h-.12*T]],'#fff',D.OL*1.1);
    shine(D,-rx*.75,-h*.95,rx*.25,h*.3,.4);},
  dessert:D=>{const T=D.T;ell(D,0,0,.15*T,.075*T,'#fff');const rx=.11*T,ry=rx/2,h=.1*T;
    cyl(D,0,-.008*T,rx,ry,h,'#f7c4d0','#fff4ec');
    D.g.fillStyle='#fff4ec';for(let i=-2;i<=2;i++){D.g.beginPath();D.g.ellipse(i*rx*.38,-.008*T-h+ry*.6,rx*.14,ry*.6,0,0,Math.PI);D.g.fill()}
    D.g.strokeStyle=INK;D.g.lineWidth=D.OL*.5;line(D,[[-rx*.9,-.008*T-h*.45],[rx*.9,-.008*T-h*.45]],'#e2738e',D.OL*.8);
    const sy=-.008*T-h-ry*.1; poly(D,[[0,sy+.025*T],[-.035*T,sy-.015*T],[-.02*T,sy-.04*T],[0,sy-.03*T],[.02*T,sy-.04*T],[.035*T,sy-.015*T]],COL.red,INK,D.OL*.7);
    ell(D,0,sy-.04*T,.02*T,.01*T,'#5aa63c',null);},
  ing:D=>{const T=D.T;const sub=mkD(D.g,(x,y,z=0)=>[(x-y)*T/2,(x+y)*T/4-z*T*.56],T);
    box(sub,-.16,-.16,0,.32,.32,.2,'#c9874d','#a7652f','#b8743c');
    line(sub,[sub.P(-.16,.16,.1),sub.P(.16,.16,.1)],'#8a4f2a',D.OL*.6);line(sub,[sub.P(.16,-.16,.1),sub.P(.16,.16,.1)],'#8a4f2a',D.OL*.6);
    const top=(x,y)=>sub.P(x,y,.2);
    let [a,b]=top(-.05,-.06);ell(D,a,b-.03*T,.055*T,.045*T,'#e2463f');ell(D,a,b-.07*T,.015*T,.01*T,'#5aa63c',null);
    [a,b]=top(.07,.04);ell(D,a,b-.03*T,.05*T,.042*T,'#f04d3f');
    [a,b]=top(-.06,.07);poly(D,[[a-.05*T,b],[a+.05*T,b-.01*T],[a+.01*T,b-.06*T]],'#f8d44c');
    [a,b]=top(.06,-.08);ell(D,a,b-.02*T,.04*T,.02*T,'#6fb24f');},
  trash:D=>{const T=D.T;ell(D,0,0,.15*T,.075*T,'#ffffff');ell(D,0,0,.1*T,.05*T,'#efe7e1',INK,D.OL*.5);
    ell(D,-.03*T,-.005*T,.045*T,.017*T,'rgba(214,90,60,.65)',null);for(const [a,b] of [[.03,.01],[.05,-.015],[-.06,.02]]) ell(D,a*T,b*T,.008*T,.006*T,'#d68a45',null);
    line(D,[[.06*T,.02*T],[.14*T,-.03*T]],'#a3abb5',D.OL*1.1);},
  coin:D=>{const T=D.T,rx=.085*T,ry=rx/2;cyl(D,0,0,rx,ry,.028*T,COL.coinDk,COL.coin);ell(D,0,-.028*T,rx*.62,ry*.62,null,'#e3a92c',D.OL*.7);shine(D,-rx*.6,-.04*T,rx*.35,ry*.3,.6);},
};
const ITEM_STEP={pizza:.15,pepperoni:.15,special:.17,veggie:.11,seafood:.15,box:.19,drink:.2,dessert:.17,ing:.16,trash:.06,coin:.028};
/* emotes: screen-space sprites anchored bottom-centre */
const EMOTE_PAINT={
  heart:D=>{const T=D.T,g=D.g,s=.12*T;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-s*1.4,-s*.7,-s*.9,-s*1.9,0,-s*1.25);g.bezierCurveTo(s*.9,-s*1.9,s*1.4,-s*.7,0,0);g.fillStyle='#f0475a';g.fill();g.strokeStyle=INK;g.lineWidth=D.OL;g.stroke();shine(D,-s*.7,-s*1.3,s*.35,s*.22,.6)},
  anger:D=>{const T=D.T,s=.1*T,g=D.g;g.strokeStyle='#e33b3b';g.lineWidth=D.OL*1.6;g.lineCap='round';
    for(const [a,b] of [[1,1],[-1,1],[1,-1],[-1,-1]]){g.beginPath();g.moveTo(a*s*.25,-s+b*s*.95);g.quadraticCurveTo(a*s*.25,-s+b*s*.25,a*s*.95,-s+b*s*.25);g.stroke()}},
  sweat:D=>{const T=D.T,g=D.g,s=.07*T;g.beginPath();g.moveTo(0,-s*2.2);g.quadraticCurveTo(s*1.1,-s*.7,0,0);g.quadraticCurveTo(-s*1.1,-s*.7,0,-s*2.2);g.fillStyle='#8fd0f2';g.fill();g.strokeStyle=INK;g.lineWidth=D.OL*.8;g.stroke()},
  zzz:D=>{const T=D.T;for(const [x,y,s] of [[-.06,-.02,.05],[.04,-.11,.07]]){const X=x*T,Y=y*T,S=s*T;line(D,[[X-S/2,Y-S],[X+S/2,Y-S],[X-S/2,Y],[X+S/2,Y]],'#6a7fd6',D.OL*1.2)}},
  sparkle:D=>{const T=D.T,s=.09*T;poly(D,[[0,-s*2],[s*.28,-s*1.28],[s,-s],[s*.28,-s*.72],[0,0],[-s*.28,-s*.72],[-s,-s],[-s*.28,-s*1.28]],COL.gold,INK,D.OL*.8)},
  bang:D=>{const T=D.T,r=.08*T;ell(D,0,-r,r,r,COL.red);D.g.fillStyle='#fff';D.g.fillRect(-r*.13,-r*1.65,r*.26,r*.8);ell(D,0,-r*.5,r*.14,r*.14,'#fff',null)},
  check:D=>{const T=D.T,r=.08*T;ell(D,0,-r,r,r,COL.green);line(D,[[-r*.45,-r],[-r*.1,-r*.65],[r*.5,-r*1.4]],'#fff',D.OL*1.4)},
};
