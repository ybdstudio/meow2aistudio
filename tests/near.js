// Station proximity + single-ingredient loading checks (real game logic).
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.setContent(fs.readFileSync('/home/claude/cpt/dist/index.html','utf8').replace('<!doctype html>',''));await p.waitForTimeout(2500);
 const bot=fs.readFileSync('/home/claude/cpt/test/bot.js','utf8');const inner=bot.slice(bot.indexOf('await p.evaluate(()=>{')+22,bot.indexOf(' });\n let r;'));
 await p.evaluate(new Function(inner));
 for(let k=0;k<400;k++){const r=await p.evaluate(()=>__botTick(300));if(r.task>=19)break;}
 const res=await p.evaluate(()=>{const A=__cp,pl=A.player,out={};A.DEBUG.move=[0,0];
  const oven=A.stations.find(s=>s.id==='oven1'); oven.stock=3; pl.carry=[];
  // stand still at the far end of the oven's front edge (outside the old 0.85 stand-point circle)
  pl.x=1.4; pl.y=oven.y+oven.d+.32; out.ovenDistToPt=Math.hypot(pl.x-oven.pt[0],pl.y-oven.pt[1]).toFixed(2);
  for(let i=0;i<20;i++)A.update(.05); out.pickedStandingNear=pl.carry.length;
  // walking past the same spot does not grab
  pl.carry=[];oven.stock=3;A.DEBUG.move=[0,1];pl.x=1.0;pl.y=oven.y+oven.d+.32;A.DEBUG.move=[1,-1];for(let i=0;i<6;i++)A.update(.05);out.pickedWalkingPast=pl.carry.length;A.DEBUG.move=[0,0];
  // single ingredient into a machine that has 5/6
  const prep=A.stations.find(s=>s.id==='prep'); prep.ing=5; pl.carry=['ing']; pl.x=prep.pt[0]; pl.y=prep.pt[1];
  for(let i=0;i<10;i++)A.update(.05); out.prepAfter=prep.ing; out.carryAfter=pl.carry.length;
  return out;});
 console.log(JSON.stringify(res)); console.log('ERR',errs); await b.close();})();
