import numpy as np, sys, json
from PIL import Image, ImageDraw
from collections import deque
from scipy import ndimage
def fg_mask(a,T=22):
    h,w,_=a.shape; bg=np.zeros((h,w),bool); q=deque()
    for x in range(w):
        for y in (0,h-1): bg[y,x]=True; q.append((y,x))
    for y in range(h):
        for x in (0,w-1):
            if not bg[y,x]: bg[y,x]=True; q.append((y,x))
    while q:
        y,x=q.popleft(); c=a[y,x]
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=y+dy,x+dx
            if 0<=ny<h and 0<=nx<w and not bg[ny,nx]:
                if np.abs(a[ny,nx]-c).sum()<T: bg[ny,nx]=True; q.append((ny,nx))
    return ~bg
for name in sys.argv[1:]:
    im=Image.open(f'/root/.claude/uploads/2c08f780-bb3b-545e-b55a-0d1a9758360e/{name}-image.png').convert('RGB'); a=np.array(im).astype(np.int32)
    fg=fg_mask(a); fg=ndimage.binary_fill_holes(fg)
    lab,n=ndimage.label(fg); objs=ndimage.find_objects(lab); comps=[]
    for i,sl in enumerate(objs):
        ys,xs=sl; h=ys.stop-ys.start; w=xs.stop-xs.start; area=(lab[sl]==i+1).sum()
        if h>40 and w>30 and area>1200 and not (w>2.2*h): comps.append([xs.start,ys.start,xs.stop,ys.stop,int(area),i+1])
    np.save(f'{name}_lab.npy',lab)
    json.dump(comps,open(f'{name}_comps.json','w'))
    dr=ImageDraw.Draw(im)
    for k,(x0,y0,x1,y1,ar,_) in enumerate(comps): dr.rectangle([x0,y0,x1,y1],outline=(255,0,0)); dr.text((x0+2,y0+2),str(k),fill=(0,0,255))
    im.save(f'{name}_boxes.png'); print(name,len(comps))
