// Pizza art check: atlas items (in-world / raw / order icon) + the counter and a customer order bubble in game.
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.setContent(fs.readFileSync('/home/claude/cpt/dist/index.html','utf8').replace('<!doctype html>',''));await p.waitForTimeout(2500);
 const url=await p.evaluate(()=>{const A=__cp.ATLAS,ks=['pizza','pepperoni','seafood','veggie','special'];const c=document.createElement('canvas');c.width=5*230;c.height=3*230;const g=c.getContext('2d');g.fillStyle='#e9c79a';g.fillRect(0,0,c.width,c.height);
   ks.forEach((k,i)=>['it_','it_raw_','it_ic_'].forEach((pre,j)=>{const a=A[pre+k];g.drawImage(a.cv,i*230+15,j*230+15,200,200)}));return c.toDataURL()});
 fs.writeFileSync('/home/claude/cpt/test/qa_pizza_atlas.png',Buffer.from(url.split(',')[1],'base64'));
 const bot=fs.readFileSync('/home/claude/cpt/test/bot.js','utf8');const inner=bot.slice(bot.indexOf('await p.evaluate(()=>{')+22,bot.indexOf(' });\n let r;'));
 await p.evaluate(new Function(inner));
 for(let k=0;k<400;k++){const r=await p.evaluate(()=>__botTick(300));if(r.task>=43)break;}
 await p.addStyleTag({content:'#banner,#toast{display:none!important}'});
 await p.evaluate(()=>{const A=__cp;A.DEBUG.move=[0,0];A.player.x=6.2;A.player.y=5.6;A.player.carry=['seafood','special','veggie','pepperoni','pizza'];});
 await p.waitForTimeout(1500);
 await p.screenshot({path:'/home/claude/cpt/test/qa_pizza_counter.png',clip:{x:0,y:220,width:390,height:360}});
 console.log('ERR',errs);await b.close();})();
