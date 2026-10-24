// Seated customers on every seat type (L/T/R/B chairs and the VIP booth) + cleaner sprite poses.
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.setContent(fs.readFileSync('/home/claude/cpt/dist/index.html','utf8').replace('<!doctype html>',''));await p.waitForTimeout(2500);
 const bot=fs.readFileSync('/home/claude/cpt/test/bot.js','utf8');const inner=bot.slice(bot.indexOf('await p.evaluate(()=>{')+22,bot.indexOf(' });\n let r;'));
 await p.evaluate(new Function(inner));
 for(let k=0;k<400;k++){const r=await p.evaluate(()=>__botTick(300));if(r.task>=38)break;}
 await p.addStyleTag({content:'#banner,#toast,#hud,#taskbar{display:none!important}'});
 await p.evaluate(()=>{const A=__cp;A.S.bought.register=false;for(const c of A.customers)A.leave(c,false);for(const c of A.customers)c.dead=true;});
 await p.evaluate(()=>{const A=__cp;A.update(.01);let i=0;for(const t of A.tables){t.trash=0;for(const s of t.seats){if(s.occ)continue;const c=A.spawnCustomer(t.kind==='vip'&&s.side==='Lv');s.occ=c;c.seat=s;c.table=t;c.x=s.x;c.y=s.y;c.path=[];c.walking=false;
   c.state=c.vip?'vipWait':'eat';c.timer=999;c.foodN=0;c.dir={L:315,R:135,T:45,B:225,Lv:315,Rv:135}[s.side];c.patience=c.pMax;}}});
 const shot=async(n,x,y)=>{await p.evaluate(([x,y])=>{const A=__cp;A.DEBUG.move=[0,0];A.player.x=x;A.player.y=y;},[x,y]);await p.waitForTimeout(1000);await p.screenshot({path:'/home/claude/cpt/test/'+n+'.png',clip:{x:0,y:200,width:390,height:440}});};
 await shot('qa_seat1',10.6,9.6); await shot('qa_seat2',10.6,15.6);
 console.log('ERR',errs);await b.close();})();
