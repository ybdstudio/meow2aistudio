// In-game capture of the chef walking in 8 directions (real renderer), 4 frames each.
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const {execSync}=require('child_process');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.__cpStarted);await p.addStyleTag({content:'.hud,#modalRoot{display:none!important}'});
 const dirs=[[1,1,'0 front'],[0,1,'45'],[-1,1,'90 left'],[-1,0,'135'],[-1,-1,'180 back'],[0,-1,'225'],[1,-1,'270 right'],[1,0,'315']];
 let i=0;for(const [dx,dy,name] of dirs){ for(let f=0;f<4;f++){
   await p.evaluate(([dx,dy])=>{const pl=__cp.player;pl.x=7.5;pl.y=6;__cp.S.bought.register=false;__cp.DEBUG.move=[dx,dy];},[dx,dy]);
   await p.waitForTimeout(300+f*40);
   await p.evaluate(()=>{const pl=__cp.player;pl.x=7.5;pl.y=6;});await p.waitForTimeout(60);
   await p.screenshot({path:`/tmp/claude-0/w_${i}_${f}.png`,clip:{x:135,y:300,width:120,height:150}}); }
   i++; }
 await b.close();
 const {PythonShell}={};})();
