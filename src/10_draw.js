/* =====================================================================
   10_draw.js — drawing primitives. A "D" is a drawing context:
   {g: CanvasRenderingContext2D, P: (x,y,z)=>[sx,sy], T: tile width px, OL: outline width}
   ===================================================================== */
const INK='#5a3424';
const COL={
  cream:'#fff4e3', wood:'#d98f52', woodLt:'#eab27a', woodDk:'#b06a36', woodDk2:'#8a4f2a',
  red:'#e2463f', redDk:'#b8322e', redLt:'#f26a5c', white:'#ffffff', offwhite:'#fbf3e8',
  green:'#6fb24f', greenDk:'#4f8f3a', leaf:'#86c35a', leafLt:'#a6d872',
  terra:'#eaa27c', terraLt:'#f3bc98', terraLn:'#d98c66',
  fwood:'#e4a86c', fwoodLt:'#ebb47c', fwoodLn:'#c98a50',
  cobble:'#dcd3c4', cobbleLn:'#bdb09d', grass:'#a3d06e', grassDk:'#8cbd5b', path:'#e8dcc6',
  plaster:'#f8e6c2', plasterDk:'#edd3a6', beam:'#9b5a30',
  brick:'#dd7d4f', brickLn:'#b75d37', steel:'#d3d8de', steelDk:'#a3abb5', steelLt:'#eef1f4',
  gold:'#f4c04e', goldDk:'#d49a2a', glass:'#cfeaf3', shadow:'rgba(90,52,36,.2)',
  bill:'#62b552', billDk:'#3f8f35', billLt:'#9be07f', coin:'#f8c84a', coinDk:'#d99a22',
};
function mkD(g,P,T){return{g,P,T,OL:Math.max(1.2,T*0.032)}}
function poly(D,pts,fill,stroke=INK,lw){const g=D.g;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineJoin='round';g.lineCap='round';g.strokeStyle=stroke;g.lineWidth=lw||D.OL;g.stroke()}}
function ell(D,x,y,rx,ry,fill,stroke=INK,lw){const g=D.g;g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||D.OL;g.stroke()}}
function line(D,pts,color=INK,lw){const g=D.g;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.strokeStyle=color;g.lineWidth=lw||D.OL;g.lineCap='round';g.lineJoin='round';g.stroke()}
function rr(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
/* iso box: x,y footprint origin, w along +x, d along +y, z base, h height. faces: top, left(+y face), right(+x face) */
function box(D,x,y,z,w,d,h,top,left,right,stroke=INK){const P=D.P;
  if(left) poly(D,[P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)],left,stroke);
  if(right) poly(D,[P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)],right,stroke);
  if(top) poly(D,[P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)],top,stroke);}
/* a world-space circle (radius r tiles) projects to an ellipse rx = r*T*0.7071, ry = rx/2 — never squash by hand */
function disc(D,cx,cy,z,r){const [x,y]=D.P(cx,cy,z);return [x,y,r*D.T*0.7071,r*D.T*0.35355]}
/* vertical cylinder in screen space: bottom-centre (x,y), radii rx/ry, height h px */
function cyl(D,x,y,rx,ry,h,side,top,stroke=INK){const g=D.g;
  g.beginPath();g.moveTo(x-rx,y-h);g.lineTo(x-rx,y);g.ellipse(x,y,rx,ry,0,Math.PI,0,true);g.lineTo(x+rx,y-h);g.closePath();
  g.fillStyle=side;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=D.OL;g.lineJoin='round';g.stroke()}
  if(top) ell(D,x,y-h,rx,ry,top,stroke);}
/* soft highlight helper */
function shine(D,x,y,w,h,a=.35){const g=D.g;g.save();g.globalAlpha=a;g.fillStyle='#fff';rr(g,x,y,w,h,Math.min(w,h)/2);g.fill();g.restore()}
/* plant leaves cluster in screen space */
function leaves(D,cx,cy,r,c1=COL.leaf,c2=COL.greenDk,n=7){
  for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*0.42;const L=r*(0.75+0.25*Math.cos(i*1.7));
    const tx=cx+Math.cos(a)*L,ty=cy+Math.sin(a)*L*0.95;const g=D.g;
    g.beginPath();g.moveTo(cx,cy);g.quadraticCurveTo(cx+Math.cos(a-.35)*L*.7,cy+Math.sin(a-.35)*L*.7,tx,ty);g.quadraticCurveTo(cx+Math.cos(a+.35)*L*.7,cy+Math.sin(a+.35)*L*.7,cx,cy);
    g.fillStyle=i%2?c1:COL.leafLt;g.fill();g.strokeStyle=INK;g.lineWidth=D.OL*.8;g.stroke();
    line(D,[[cx,cy],[cx+(tx-cx)*.7,cy+(ty-cy)*.7]],c2,D.OL*.5);}
}
function pawPrint(D,x,y,r,c){const g=D.g;ell(D,x,y+r*.25,r*.45,r*.36,c,null);
  for(const [a,b] of [[-.42,-.28],[-.14,-.5],[.14,-.5],[.42,-.28]]) ell(D,x+a*r,y+b*r,r*.15,r*.17,c,null)}
