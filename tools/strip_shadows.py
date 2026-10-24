# Removes the floor shadow painted under the feet in the source sheets (and the light fringe it leaves),
# then re-anchors each sprite at its real feet. Runs in place on the generated sprite modules.
import json, base64, io, sys, numpy as np
from PIL import Image
from collections import deque
FILES={'src/15_staff_sprites.js':'STAFF_SPRITES','src/16_more_sprites.js':'MORE_SPRITES'}
def strip(im):
    a=np.array(im.convert('RGBA')).astype(np.int32); h,w,_=a.shape
    al=a[...,3]; rgb=a[...,:3]; lum=rgb.mean(axis=2)
    mx=rgb.max(axis=2); mn=rgb.min(axis=2); sat=mx-mn
    y0=int(h*.70)
    # passable = light, fairly unsaturated pixels (shadow / halo), only in the bottom 30%
    pas=np.zeros((h,w),bool); bl=(rgb[...,2]>rgb[...,0]+12)&(lum>135)
    pas[y0:]=((lum[y0:]>118)&(sat[y0:]<95))|bl[y0:]|(al[y0:]<160)
    ext=np.zeros((h,w),bool); q=deque()
    for y in range(y0,h):
        for x in range(w):
            if al[y,x]<40 or y==h-1 or x in(0,w-1):
                if pas[y,x] and not ext[y,x]: ext[y,x]=True; q.append((y,x))
    while q:
        y,x=q.popleft()
        for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=y+dy,x+dx
            if y0<=ny<h and 0<=nx<w and pas[ny,nx] and not ext[ny,nx]: ext[ny,nx]=True; q.append((ny,nx))
    a[...,3]=np.where(ext,0,al)
    # soften the new bottom edge by one pixel
    out=Image.fromarray(a.astype(np.uint8),'RGBA')
    ys,xs=np.nonzero(a[...,3]>128)
    yb=ys.max(); sel=ys>yb-max(4,int(h*.08))
    return out, float(xs[sel].mean()), int(yb)+1, int(ext.sum())
def run(preview=False):
    for f,var in FILES.items():
        s=open(f).read(); i=s.index('{'); j=s.rindex('}')+1; d=json.loads(s[i:j]); n=0
        for name,poses in d.items():
            for pose,m in poses.items():
                im=Image.open(io.BytesIO(base64.b64decode(m['src'].split(',')[1])))
                out,ax,ay,cnt=strip(im)
                if preview: out.save(f'/tmp/claude-0/ss/{name}_{pose}.png'); continue
                b=io.BytesIO()
                q=out
                q.save(b,'PNG',optimize=True)
                m['src']='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode(); m['ax']=round(ax,1); m['ay']=ay; n+=cnt
        if not preview: open(f,'w').write(s[:i]+json.dumps(d,separators=(',',':'))+s[j:]); print(f,'removed px',n)
run('--preview' in sys.argv)
