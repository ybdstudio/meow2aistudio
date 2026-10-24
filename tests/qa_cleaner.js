const {chromium}=require('/opt/npm-tools/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.setContent(fs.readFileSync('/home/claude/cpt/dist/index.html','utf8').replace('<!doctype html>',''));await p.waitForTimeout(2500);
 const bot=fs.readFileSync('/home/claude/cpt/test/bot.js','utf8');const inner=bot.slice(bot.indexOf('await p.evaluate(()=>{')+22,bot.indexOf(' });\n let r;'));
 await p.evaluate(new Function(inner));
 for(let k=0;k<400;k++){const r=await p.evaluate(()=>__botTick(300));if(r.task>=38)break;}
 await p.addStyleTag({content:'#banner,#toast{display:none!important}'});
 // sleeping: no dirty plates, idle for a while, owner far away
 await p.evaluate(()=>{const A=__cp;A.DEBUG.move=[0,0];A.S.bought.register=false;for(const c of A.customers)c.dead=true;A.update(.01);A.player.x=9.6;A.player.y=13.4;for(const t of A.tables)t.trash=0;const w=A.workers.find(w=>w.role==='cleaner');w.job=null;w.path=[];w.carry=[];w.x=w.home[0];w.y=w.home[1];w.idleT=30;});
 await p.waitForTimeout(900);await p.screenshot({path:'/home/claude/cpt/test/qa_clean_sleep.png',clip:{x:0,y:200,width:390,height:440}});
 // walk past -> wakes
 const r=await p.evaluate(()=>{const A=__cp;const w=A.workers.find(w=>w.role==='cleaner');A.player.x=w.x+.8;A.player.y=w.y+.3;A.update(.02);return {idleT:w.idleT,emote:w.emote}});console.log('wake',JSON.stringify(r));
 // sweeping at a dirty table
 await p.evaluate(()=>{const A=__cp;const t=A.tables.find(t=>t.kind==='table');t.trash=3;A.player.x=t.x+t.w/2+1.4;A.player.y=t.y+t.d+1.0;});
 for(let i=0;i<40;i++){const s=await p.evaluate(()=>__cp.workers.find(w=>w.role==='cleaner').sweepT);if(s>0)break;await p.waitForTimeout(150);}
 await p.screenshot({path:'/home/claude/cpt/test/qa_clean_sweep.png',clip:{x:0,y:200,width:390,height:440}});
 console.log('ERR',errs);await b.close();})();
