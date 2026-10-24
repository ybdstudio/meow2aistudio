const {chromium}=require('/opt/npm-tools/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_TUNNEL|net::/.test(m.text()))errs.push(m.text())});
 await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.__cpStarted,null,{timeout:20000});
 const res={};
 // 1) touch joystick moves the player
 const before=await p.evaluate(()=>[__cp.player.x,__cp.player.y]);
 await p.touchscreen.tap(200,400);
 const cdp=await ctx.newCDPSession(p);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:420}]});
 for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200+i*6,y:420+i*3}]});await p.waitForTimeout(50);}
 await p.waitForTimeout(600);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const after=await p.evaluate(()=>[__cp.player.x,__cp.player.y]);
 res.touchMove={before,after,moved:Math.hypot(after[0]-before[0],after[1]-before[1]).toFixed(2)};
 // 2) collision: push into the hedge/edge and into a solid
 res.edge=await p.evaluate(()=>{const pl=__cp.player;pl.x=1;pl.y=1;__cp.DEBUG.move=[-1,-1];for(let i=0;i<90;i++)__cp.update(1/30);__cp.DEBUG.move=null;return [pl.x.toFixed(2),pl.y.toFixed(2)]});
 // 3) purchase deducts exact coins
 res.buy=await p.evaluate(()=>{const S=__cp.S;const m0=S.money;const sp=__cp.SPOTS.find(s=>s.id==='register');const pl=__cp.player;pl.x=5.5;pl.y=5;for(let i=0;i<120;i++)__cp.update(1/30);return {m0,m1:S.money,cost:sp.cost,bought:!!S.bought.register}});
 res.upgrade=await p.evaluate(()=>{const S=__cp.S;S.money+=100;const m0=S.money;const ok=__cp.buyUpgrade('mSpd');return {ok,spent:m0-S.money,expect:__cp.UPG.manager.rows[0].cost[0],lvl:S.mSpd}});
 res.speedLv1=await p.evaluate(()=>{const S=__cp.S;S.mSpd=1;const pl=__cp.player;pl.x=8;pl.y=6;__cp.DEBUG.move=[1,0];const x0=pl.x;for(let i=0;i<30;i++)__cp.update(1/30);__cp.DEBUG.move=null;return {tilesPerSec:(pl.x-x0).toFixed(3),expected:(3.3*0.8+0.32).toFixed(3)}});
 res.speed=await p.evaluate(()=>{const S=__cp.S;S.mSpd=0;const pl=__cp.player;pl.x=8;pl.y=6;__cp.DEBUG.move=[1,0];const x0=pl.x;for(let i=0;i<30;i++)__cp.update(1/30);__cp.DEBUG.move=null;return {tilesPerSec:(pl.x-x0).toFixed(3),expected:(3.3*0.8).toFixed(3)}});
 // 4) save + reload
 const snap=await p.evaluate(()=>{window.dispatchEvent(new Event('blur'));document.dispatchEvent(new Event('visibilitychange'));return {task:__cp.S.task,money:__cp.S.money,reg:!!__cp.S.bought.register}});
 await p.evaluate(()=>{ /* force a save */ const e=new Event('visibilitychange');Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(e)});
 await p.reload();await p.waitForFunction(()=>window.__cpStarted,null,{timeout:20000});
 res.reload={before:snap,after:await p.evaluate(()=>({task:__cp.S.task,money:__cp.S.money,reg:!!__cp.S.bought.register}))};
 await p.waitForTimeout(800);await p.screenshot({path:'/home/claude/cpt/test/iphone.png'});
 res.blank=await p.evaluate(()=>{const c=document.getElementById('game');const g=c.getContext('2d');const d=g.getImageData(c.width/2,c.height/2,1,1).data;return Array.from(d)});
 console.log(JSON.stringify(res,null,1));console.log('ERR',errs);await b.close();})();
