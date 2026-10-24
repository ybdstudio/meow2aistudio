const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/fonts.googleapis.com/**',r=>r.abort());
 await p.setContent(fs.readFileSync(__dirname+'/../dist/index.html','utf8').replace('<!doctype html>',''));
 await p.waitForFunction(()=>window.__cpStarted,null,{timeout:30000});
 await p.evaluate(()=>{const A=__cp,S=A.S;['register','oven1','table1','bin','table2','drink','renovate','pantry','prep','office'].forEach(i=>S.bought[i]=true);
    S.task=A.TASKS.findIndex(t=>t.id==='t_hire1');S.money=120;S.mx.homeAsked=1;A.player.x=3.4;A.player.y=5.6;});
 await p.waitForTimeout(1200); await p.screenshot({path:'/home/claude/cmp_web.png'}); console.log(errs); await b.close();
})();
