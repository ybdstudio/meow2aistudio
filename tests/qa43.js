// v4.3 visual QA: VIP booth depth, new customer/VIP/cleaner/manager art in game, sleeping/wake.
const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.setContent(fs.readFileSync('/home/claude/cpt/dist/index.html','utf8').replace('<!doctype html>',''));await p.waitForTimeout(2500);
 const bot=fs.readFileSync('/home/claude/cpt/test/bot.js','utf8');const inner=bot.slice(bot.indexOf('await p.evaluate(()=>{')+22,bot.indexOf(' });\n let r;'));
 await p.evaluate(new Function(inner));
 for(let k=0;k<400;k++){const r=await p.evaluate(()=>__botTick(300));if(r.task>=38)break;}
 await p.addStyleTag({content:'#banner,#toast{display:none!important}'});
 const shot=async(name,x,y,setup)=>{ await p.evaluate(([x,y,setup])=>{const A=__cp;A.DEBUG.move=[0,0];A.player.x=x;A.player.y=y;if(setup)(new Function('A',setup))(A);},[x,y,setup||'']);
   await p.waitForTimeout(1200); await p.screenshot({path:'/home/claude/cpt/test/'+name+'.png',clip:{x:0,y:200,width:390,height:440}}); };
 // VIP booth: force a VIP into the left seat and a customer... both seats
 await p.evaluate(()=>{const A=__cp;for(const c of A.customers) if(c.vip) c.dead=true;});
 await shot('qa43_vip',12.6,18.6,`const vt=A.tables.find(t=>t.kind==='vip');vt.trash=0;for(const s of vt.seats){s.occ=null}
   const c=A.spawnCustomer(true);c.skin="${process.env.VSKIN||"vipfedora"}";for(const w of A.workers)if(w.role!=='cashier'){w.x=w.home[0];w.y=w.home[1];w.path=[];w.job=null;w.asleep=true;}const s=vt.seats[0];s.occ=c;c.seat=s;c.table=vt;c.x=s.x;c.y=s.y;c.path=[];c.state='vipWait';c.dir=315;c.walking=false;
   const d=A.spawnCustomer(false);const s2=vt.seats[1];s2.occ=d;d.seat=s2;d.table=vt;d.x=s2.x;d.y=s2.y;d.path=[];d.state='eat';d.timer=99;d.foodN=0;d.dir=135;d.walking=false;`);
 await shot('qa43_hall',9.6,11.6,'');
 await shot('qa43_queue',8.4,5.6,'');
 await shot('qa43_office',11.2,3.6,'');
 // cleaner sleeping then woken
 await p.evaluate(()=>{const A=__cp;const w=A.workers.find(w=>w.role==='cleaner');w.job=null;w.path=[];w.idleT=30;w.x=7.3;w.y=11.4;});
 await shot('qa43_sleep',9.8,13.8,'const w=A.workers.find(w=>w.role==="cleaner");w.idleT=30;');
 const woke=await p.evaluate(()=>{const A=__cp;const w=A.workers.find(w=>w.role==='cleaner');w.idleT=30;A.player.x=w.x+.6;A.player.y=w.y;A.update(.05);return w.idleT});
 console.log('woken idleT',woke);
 console.log('ERR',errs);await b.close();})();
