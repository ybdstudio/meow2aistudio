// Close-up of every customer look standing and walking, at phone DPR, to inspect faces.
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.setContent(fs.readFileSync('/home/claude/cpt/dist/index.html','utf8').replace('<!doctype html>',''));await p.waitForTimeout(2500);
 await p.addStyleTag({content:'#banner,#toast,#hud,#taskbar,#bottom{display:none!important}'});
 const sets=process.env.SETS?process.env.SETS.split(','):['tourist','cat01','cat02','cat03','cat04','vipfedora','vip01','vip02'];
 const dirs=[0,45,90,135,180,225,270,315];
 const url=await p.evaluate(([sets,dirs])=>{const A=__cp;const c=document.createElement('canvas');const S=150;c.width=dirs.length*S;c.height=sets.length*2*S;const g=c.getContext('2d');g.fillStyle='#e8b98a';g.fillRect(0,0,c.width,c.height);
   return {sets,dirs,ok:true};},[sets,dirs]);
 // render in-game: place customers in a grid in front of the camera
 await p.evaluate(([sets,dirs])=>{const A=__cp;A.DEBUG.move=[0,0];A.player.x=40;A.player.y=40;
   window.__probe=[];for(let i=0;i<sets.length;i++)for(let j=0;j<dirs.length;j++){const c=A.spawnCustomer(false);c.skin=sets[i];c.dir=dirs[j];c.state='probe';c.walking=j%2==1&&false;c.x=40-2+j*0.0+(j-3.5)*.9-(i-3.5)*.0;c.y=40+(i-3.5)*1.0-(j-3.5)*0.0;c.patience=c.pMax=1e9;window.__probe.push(c);} },[sets,dirs]);
 await p.waitForTimeout(600);
 await p.screenshot({path:'/home/claude/cpt/test/qa_faces.png'});
 console.log('ERR',errs);await b.close();})();
