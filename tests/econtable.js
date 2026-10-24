const fs=require('fs'),vm=require('vm');const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/00_config.js','utf8')+';this.X={TASKS,SPOTS,UPG,CFG}',ctx);const {TASKS,SPOTS,UPG}=ctx.X;
const runs=[1,2,3].map(i=>JSON.parse(fs.readFileSync(`/tmp/claude-0/botlog${i}.json`)));
const IMPACT={register:'Opens sales',station:'New/extra production',table:'+2 seats',table4p:'+4 seats',bin:'Clears dirty tables',stage:'Cozy Pizzeria visuals, walls',office:'Unlocks chef speed/carry upgrades',hire:'Automation',zone:'New restaurant area',decor:'+5% on every sale',vip:'VIP orders (×1.6)',event:'Starts the grand opening'};
const fmt=s=>Math.floor(s/60)+':'+String(Math.round(s%60)).padStart(2,'0');
let out='| # | Objective | Unlock condition | Cost | Avg. start | Time to complete | Income when started (coins/min) | Impact | Reward | Next objective |\n|---|---|---|---|---|---|---|---|---|---|\n';
let gaps=[];
TASKS.forEach((t,i)=>{ if(t.kind==='final') return;
  const st=runs.map(L=>{const a=L.find(x=>x[0]===i),b=L.find(x=>x[0]===i+1);if(!a||!b)return null;
    const prev=L.filter(x=>x[2]<=a[2]&&x[2]>=a[2]-120);const p0=prev[0]||a;const inc=a[2]-p0[2]>0?(a[4]-p0[4])/(a[2]-p0[2])*60:0;return {start:a[2],dur:b[2]-a[2],inc}}).filter(Boolean);
  const avg=k=>st.reduce((s,x)=>s+x[k],0)/st.length;
  let cost='—',impact='',cond=i?('Complete: '+TASKS[i-1].text):'Start';
  if(t.kind==='buy'){const sp=SPOTS.find(s=>s.id===t.spot);cost=sp.cost;impact=IMPACT[sp.kind]||sp.kind;}
  if(t.kind==='level'){for(const u of Object.values(UPG)){const r=u.rows.find(r=>r.key===t.key);if(r){cost=r.cost.slice(0,t.n).join('+');impact=r.desc}}}
  if(t.kind==='count') impact='Practice / '+t.stat;
  if(t.kind==='custom') impact='Tutorial step';
  gaps.push(avg('dur'));
  out+=`| ${i+1} | ${t.text} | ${cond} | ${cost} | ${fmt(avg('start'))} | ${fmt(avg('dur'))} | ${Math.round(avg('inc'))} | ${impact} | ${t.reward||'—'} | ${TASKS[i+1].text} |\n`;
});
const total=runs.map(L=>L[L.length-1][2]);
out+=`\nBot finish times: ${total.map(fmt).join(', ')}. Longest single objective: ${fmt(Math.max(...gaps))}.\n`;
fs.writeFileSync('/tmp/claude-0/econ.md',out);console.log(out.split('\n').slice(-2).join('\n'));
