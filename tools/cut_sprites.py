import numpy as np, json, sys
from PIL import Image, ImageFilter
from collections import deque
SRC='/root/.claude/uploads/2c08f780-bb3b-545e-b55a-0d1a9758360e/efcc3c03-image.png'
im=Image.open(SRC).convert('RGB'); A=np.array(im).astype(np.int32)
COLX=[0,202,390,578,769,961,1152,1341,1536]
ROWY=[(0,226),(262,476),(510,720),(757,966)]
CHARS=['chef','waiter','cashier','waitress']
POSES=['idle_front','idle_left','idle_back','idle_right','walk1_right','walk2_right','walk3_right','walk4_right']
T=float(sys.argv[1]) if len(sys.argv)>1 else 16
def segment(a):
    h,w,_=a.shape; bg=np.zeros((h,w),bool); q=deque()
    lum=a.mean(axis=2)
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
                d=np.abs(a[ny,nx]-c).sum()
                if d<T: bg[ny,nx]=True; q.append((ny,nx))
    return bg
out={}
for ri,ch in enumerate(CHARS):
    y0,y1=ROWY[ri]
    for ci,pose in enumerate(POSES):
        x0,x1=COLX[ci],COLX[ci+1]
        a=A[y0:y1,x0:x1]
        bg=segment(a)
        fg=~bg
        # keep largest connected component of foreground
        from scipy import ndimage
        lab,n=ndimage.label(fg)
        if n>1:
            sizes=ndimage.sum(fg,lab,range(1,n+1)); keep=1+int(np.argmax(sizes)); fg=lab==keep
        fg=ndimage.binary_fill_holes(fg)
        alpha=(fg*255).astype(np.uint8)
        al=Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(.6))
        rgba=Image.fromarray(a.astype(np.uint8)).convert('RGBA'); rgba.putalpha(al)
        bb=rgba.getbbox(); rgba=rgba.crop(bb)
        rgba.save(f'cut/{ch}_{pose}.png'); out[f'{ch}_{pose}']=list(bb)
json.dump(out,open('cut/boxes.json','w'))
print('done')
