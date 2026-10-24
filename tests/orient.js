// Orientation audit: samples every customer/worker during a simulated session and checks facing rules.
const {chromium}=require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
 const html=require('fs').readFileSync('/home/claude/cpt/dist/index.html','utf8');await p.setContent(html.replace('<!doctype html>',''));await p.waitForTimeout(2500);
 const bot=require('fs').readFileSync('/home/claude/cpt/test/bot.js','utf8');const inner=bot.slice(bot.indexOf('await p.evaluate(()=>{')+22,bot.indexOf(' });\n let r;'));
 await p.evaluate(new Function(inner)); await p.evaluate(()=>{__botTick(9000);window.NK=12000;window.STEP=1});
 const res=await p.evaluate(()=>{const A=__cp;const out={samples:0,queueWrong:0,seatWrong:0,walkWrong:0,dirs:{}};const prev=new Map();
   const seatDir={L:315,R:135,T:45,B:225,Lv:315,Rv:135};
   for(let k=0;k<+(window.NK||2400);k++){ __botTick(window.STEP||15);
     for(const c of A.customers){ out.samples++; out.dirs[c.dir]=(out.dirs[c.dir]||0)+1;
       if((c.state==='queue'||c.state==='order')&&!c.walking&&c.dir!==135) out.queueWrong++;
       if((c.state==='eat'||c.state==='vipWait')&&c.seat&&c.dir!==seatDir[c.seat.side]) out.seatWrong++;
       const pv=prev.get(c.id); if(pv&&c.walking){const dx=c.x-pv[0],dy=c.y-pv[1]; if(Math.hypot(dx,dy)>.05){ let k2=Math.round(Math.atan2(dy,dx)/(Math.PI/4));k2=((k2%8)+8)%8;const want=[315,0,45,90,135,180,225,270][k2]; const diff=Math.abs(((c.dir-want+540)%360)-180); if(diff>45) out.walkWrong++; }}
       prev.set(c.id,[c.x,c.y]); } }
   out.minutes=Math.round(A.S.playTime/60);return out});
 console.log(JSON.stringify(res));await b.close();})();
