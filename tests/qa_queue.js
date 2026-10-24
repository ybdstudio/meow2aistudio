// Queue facing for every customer look + manager greeting the owner.
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.setContent(fs.readFileSync('/home/claude/cpt/dist/index.html','utf8').replace('<!doctype html>',''));await p.waitForTimeout(2500);
 const bot=fs.readFileSync('/home/claude/cpt/test/bot.js','utf8');const inner=bot.slice(bot.indexOf('await p.evaluate(()=>{')+22,bot.indexOf(' });\n let r;'));
 await p.evaluate(new Function(inner));
 for(let k=0;k<400;k++){const r=await p.evaluate(()=>__botTick(300));if(r.task>=24)break;}
 await p.addStyleTag({content:'#banner,#toast{display:none!important}'});
 // freeze a queue made of each look
 await p.evaluate(()=>{const A=__cp;A.DEBUG.move=[0,0];A.player.x=8.6;A.player.y=6.4;
   const skins=['tourist','cat01','cat02','cat03','cat04'];const q=A.customers.filter(c=>c.state==='queue'||c.state==='order'||c.state==='enter');
   q.forEach((c,i)=>{c.skin=skins[i%skins.length];c.pMax=c.patience=9999});});
 await p.waitForTimeout(2500);
 await p.screenshot({path:'/home/claude/cpt/test/qa_queue.png',clip:{x:0,y:220,width:390,height:360}});
 await p.evaluate(()=>{const A=__cp;A.player.x=A.PT.padManager[0];A.player.y=A.PT.padManager[1]+.1;});await p.waitForTimeout(800);
 await p.screenshot({path:'/home/claude/cpt/test/qa_mgr_pad.png',clip:{x:0,y:220,width:390,height:360}});
 await p.evaluate(()=>{const A=__cp;A.player.x=11.6;A.player.y=4.6;});await p.waitForTimeout(800);
 await p.screenshot({path:'/home/claude/cpt/test/qa_mgr_near.png',clip:{x:0,y:220,width:390,height:360}});
 console.log('ERR',errs);await b.close();})();
