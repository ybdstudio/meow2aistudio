const {chromium}=require('/opt/npm-tools/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.setContent(fs.readFileSync('/home/claude/cpt/dist/index.html','utf8').replace('<!doctype html>',''));await p.waitForTimeout(2500);
 const bot=fs.readFileSync('/home/claude/cpt/test/bot.js','utf8');const inner=bot.slice(bot.indexOf('await p.evaluate(()=>{')+22,bot.indexOf(' });\n let r;'));
 await p.evaluate(new Function(inner));
 for(let k=0;k<400;k++){const r=await p.evaluate(()=>__botTick(300));if(r.task>=+(process.env.T||38))break;}
 const out=await p.evaluate(()=>{const A=__cp;A.DEBUG.move=[0,0];A.player.x=3.4;A.player.y=5.6;const log=[];
   for(let s=0;s<120;s++){ for(let i=0;i<20;i++)A.update(.05);
     const ws=A.workers.filter(w=>w.role!=='cashier').map(w=>`${w.role}@${w.x.toFixed(1)},${w.y.toFixed(1)} job:${w.job?1:0} path:${w.path.length} idle:${w.idleT.toFixed(0)} carry:${w.carry.join('')}`);
     if(s%6===0) log.push(s+'s trash:'+A.tables.map(t=>t.trash).join('')+' vip:'+A.customers.filter(c=>c.state==='vipWait').length+' | '+ws.join(' | '));}
   return {log,dumped:A.S.stats.dumped};});
 console.log(out.log.join('\n'));console.log('dumped',out.dumped,'ERR',errs);await b.close();})();
