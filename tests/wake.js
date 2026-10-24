// Dozing workers: they stop while asleep, the owner walking past wakes them and they resume work at once.
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.setContent(fs.readFileSync('/home/claude/cpt/dist/index.html','utf8').replace('<!doctype html>',''));await p.waitForTimeout(2500);
 const bot=fs.readFileSync('/home/claude/cpt/test/bot.js','utf8');const inner=bot.slice(bot.indexOf('await p.evaluate(()=>{')+22,bot.indexOf(' });\n let r;'));
 await p.evaluate(new Function(inner));
 for(let k=0;k<400;k++){const r=await p.evaluate(()=>__botTick(300));if(r.task>=38)break;}
 const res=await p.evaluate(()=>{const A=__cp,out={};A.DEBUG.move=[0,0];A.player.x=3.4;A.player.y=5.6;
  for(const role of ['waiter','cleaner']){ const w=A.workers.find(w=>w.role===role); w.job=null;w.path=[];w.carry=[];w.asleep=true;w.sleepT=0;
    const t=A.tables.find(t=>t.kind==='table'); t.trash=2;
    const x0=w.x,y0=w.y; for(let i=0;i<60;i++)A.update(.05); out[role+'_movedWhileAsleep']=+Math.hypot(w.x-x0,w.y-y0).toFixed(2);
    A.player.x=w.x+.7;A.player.y=w.y+.2; A.update(.05); out[role+'_awake']=!w.asleep;
    A.player.x=3.4;A.player.y=5.6; for(let i=0;i<20;i++)A.update(.05); out[role+'_hasJobAfter1s']=!!w.job; out[role+'_moved']=+Math.hypot(w.x-x0,w.y-y0).toFixed(2); }
  // idle-sleep with nothing to do: no plates, no VIP, counter full
  const w=A.workers.find(w=>w.role==='waiter'); for(const t of A.tables)t.trash=0; for(const c of A.customers)if(c.vip)c.dead=true; for(const k in A.tray)A.tray[k]=20;
  w.job=null;w.path=[];w.carry=[];w.asleep=false;w.idleT=30; A.player.x=3.4;A.player.y=5.6; for(const t of A.tables)t.trash=0;
  const x0=w.x,y0=w.y; A.player.x=w.x+.6;A.player.y=w.y+.2; A.update(.05); out.idleWake_job=!!w.job; out.idleWake_walking=w.walking||w.path.length>0;
  A.player.x=3.4;A.player.y=5.6; for(let i=0;i<10;i++)A.update(.05); out.idleWake_moved05s=+Math.hypot(w.x-x0,w.y-y0).toFixed(2);
  return out;});
 console.log(JSON.stringify(res));console.log('ERR',errs);await b.close();})();
