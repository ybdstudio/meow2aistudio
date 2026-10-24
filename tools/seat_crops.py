# From the sheet's "sitting at a little table" art, keep only the cat (+ the food it holds) so it can sit on the
# restaurant's own wooden chair at the checkered table: the sheet's red chair is removed and the art is cut at the
# little table's top. Adds <pose>_seat entries to src/16_more_sprites.js. Run after cut_sheets2.py + strip_shadows.py.
import json, base64, io, numpy as np, sys
from PIL import Image
from scipy import ndimage
F='src/16_more_sprites.js'
s=open(F).read(); i=s.index('{'); j=s.rindex('}')+1; d=json.loads(s[i:j])
JOBS=[(n,p) for n in ['cat01','cat02','cat03','cat04'] for p in ['sit_eat','sit_dessert','sit_drink']]
prev=[]
for n,p in JOBS:
    m=d[n][p]; im=Image.open(io.BytesIO(base64.b64decode(m['src'].split(',')[1]))).convert('RGBA'); a=np.array(im).astype(int)
    h,w=a.shape[:2]; r,g,b,al=a[...,0],a[...,1],a[...,2],a[...,3]
    # 1) red chair: crimson fill (+ its dark shading / legs), found as blobs in the left / lower-left part
    lum=(r+g+b)/3
    red=(al>30)&(r>110)&(g<.42*r)&(b>=.8*g)&(b<.75*r)
    region=np.zeros((h,w),bool); region[int(h*.3):,:int(w*.55)]=True
    lab,k=ndimage.label(red&region); seed=np.zeros((h,w),bool)
    for l in range(1,k+1):
        if (lab==l).sum()>25: seed|=lab==l
    chair=seed
    for _ in range(3):   # grow only through crimson / dark crimson shading
        grow=ndimage.binary_dilation(chair,iterations=1)&region&(al>30)&(((r>90)&(g<.45*r)&(b>=.75*g)&(b<.8*r))|((lum<120)&(g<.55*r)&(b>=.7*g)))
        chair=chair|grow
    darkish=(lum<100)
    kill=chair|(ndimage.binary_dilation(chair,iterations=3)&darkish)
    kill|=(np.arange(h)[:,None]>h*.8)&(np.arange(w)[None,:]<w*.35)&(lum<130)&region   # chair legs
    fur=~kill
    na=np.where(kill,0,al)
    # re-ink the cat's edge where the chair was removed
    edge=(na>0)&ndimage.binary_dilation(kill,iterations=1)&~kill
    for c,v in zip((0,1,2),(106,44,31)): a[...,c]=np.where(edge&fur,v,a[...,c])
    lab2,k2=ndimage.label(na>20)
    if k2>1:
        sz=ndimage.sum(np.ones_like(na),lab2,range(1,k2+1)); big=1+int(np.argmax(sz)); na=np.where(lab2==big,na,0)
    m0=na>20; op=ndimage.binary_opening(m0,iterations=2); na=np.where(ndimage.binary_dilation(op,iterations=2),na,0)
    a[...,3]=na
    r,g,b=a[...,0],a[...,1],a[...,2]
    # 2) cut at the little table's top: first row (from top, below the head) where wood brown spans the right part
    wood=(a[...,3]>40)&(r>100)&(r<200)&(g>55)&(g<130)&(b<90)&(r-g>35)&(g-b>15)
    cut=h
    for y in range(int(h*.45),h):
        if wood[y,int(w*.45):].sum()>w*.22: cut=y; break
    cut=min(h,cut+int(h*.03))
    a=a[:cut]; a[...,3]=np.where(np.arange(cut)[:,None]>cut-4,a[...,3]*.6,a[...,3]).astype(int)
    out=Image.fromarray(a.astype(np.uint8),'RGBA'); bb=out.getbbox(); out=out.crop((bb[0],bb[1],bb[2],bb[3]))
    # anchor: bottom of the cut, under the cat's body (left-centre, the cat sits left of the table)
    body=np.nonzero(np.array(out)[...,3]>128)
    ax=float(np.percentile(body[1],35)); ay=out.height
    b2=io.BytesIO(); out.save(b2,'PNG',optimize=True)
    d[n][p+'_seat']={'w':out.width,'h':out.height,'ax':round(ax,1),'ay':ay,'s':m['s'],'legY':out.height,'src':'data:image/png;base64,'+base64.b64encode(b2.getvalue()).decode()}
    prev.append(out)
open(F,'w').write(s[:i]+json.dumps(d,separators=(',',':'))+s[j:])
W=sum(p.width*2+8 for p in prev); o=Image.new('RGBA',(W,240),(120,190,120,255)); x=0
for p in prev: o.alpha_composite(p.resize((p.width*2,p.height*2)),(x,0)); x+=p.width*2+8
o=o.resize((o.width*2,o.height*2));o.save('/tmp/claude-0/seatcrop.png'); print('ok',len(prev))
