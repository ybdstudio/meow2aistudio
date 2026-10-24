// Rasterise the SVG UI icons + map stage art to PNG for the TikTok native build (canvas cannot draw SVG strings there).
// usage: node tools/native_icons.js <outdir>
const fs=require('fs'), path=require('path'), vm=require('vm');
const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const SRC=path.join(__dirname,'..','src'), OUT=process.argv[2];
const grab=(file,start,endRe)=>{const s=fs.readFileSync(path.join(SRC,file),'utf8');const a=s.indexOf(start);const rest=s.slice(a);const m=rest.match(endRe);return rest.slice(0,m.index+m[0].length)};
const ctx={}; vm.createContext(ctx);
vm.runInContext(grab('23_assets.js','const UI_ICON=',/\n\};/).replace('const UI_ICON=','this.UI_ICON=')+';',ctx);
vm.runInContext(grab('60_ui.js','const STAGE_ART=',/\n\];/).replace('const STAGE_ART=','this.STAGE_ART=')+';',ctx);
const MX={share:'<svg viewBox="0 0 24 24"><g fill="#4a90e2" stroke="#1d3f7a" stroke-width="1.6"><circle cx="18" cy="5.5" r="3.4"/><circle cx="6" cy="12" r="3.4"/><circle cx="18" cy="18.5" r="3.4"/></g><path d="M8.8 10.4l6.4-3.4M8.8 13.6l6.4 3.4" stroke="#1d3f7a" stroke-width="2.4" stroke-linecap="round"/></svg>'};
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const b=await chromium.launch(); const p=await b.newPage({deviceScaleFactor:1});
  const shot=async(svg,w,h,file)=>{ await p.setViewportSize({width:w,height:h});
    await p.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${w}px;height:${h}px}</style>${svg}`);
    await p.screenshot({path:path.join(OUT,file),omitBackground:true,clip:{x:0,y:0,width:w,height:h}}); };
  const sizes={ad:[60,42],pin:[66,84]};
  for(const [k,svg] of Object.entries(ctx.UI_ICON)){ const [w,h]=sizes[k]||[96,96]; await shot(svg,w,h,'ic_'+k+'.png'); }
  for(const [k,svg] of Object.entries(MX)) await shot(svg,96,96,'ic_'+k+'.png');
  for(let i=0;i<ctx.STAGE_ART.length;i++) await shot(ctx.STAGE_ART[i],240,160,'stage_'+i+'.png');
  await b.close(); console.log('icons ->',OUT);
})();
