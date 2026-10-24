# Cuts customer / VIP / cleaner / manager sprites from the approved sheets (v4.3).
# Uses the connected-component labels produced by detect.py (clean masks), groups by row/col.
import numpy as np, json, io, base64, sys
from PIL import Image, ImageFilter
from scipy import ndimage
UP='/root/.claude/uploads/2c08f780-bb3b-545e-b55a-0d1a9758360e/'
SL='/home/claude/slice2/'
DIRS=[0,45,90,135,180,225,270,315]
def rows(name):
    c=json.load(open(SL+name+'_comps.json'))
    cs=sorted([((a[1]+a[3])//2,(a[0]+a[2])//2,k) for k,a in enumerate(c)])
    rs=[]
    for cy,cx,k in cs:
        if rs and abs(rs[-1][0]-cy)<25: rs[-1][1].append((cx,k))
        else: rs.append([cy,[(cx,k)]])
    return c,[[k for cx,k in sorted(r)] for cy,r in rs]
def cut(name,c,lab,A,k,ymax=None):
    x0,y0,x1,y1,area,lid=c[k]
    if ymax: y1=min(y1,ymax)
    m=(lab[y0:y1,x0:x1]==lid)
    al=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.55))
    im=Image.fromarray(A[y0:y1,x0:x1]).convert('RGBA'); im.putalpha(al)
    h,w=m.shape
    # feet: bottom 8% of rows
    ys,xs=np.nonzero(m); yb=ys.max(); sel=ys>yb-max(4,int(h*.08))
    ax=float(xs[sel].mean()) if sel.any() else w/2
    return im,{'w':w,'h':h,'ax':round(ax,1),'ay':int(yb)+1}
out={}
def put(set_,pose,im,meta,s):
    b=io.BytesIO(); im.save(b,'PNG',optimize=True)
    meta=dict(meta); meta['s']=round(s,4); meta['legY']=int(meta['h']*.84)
    meta['src']='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
    out.setdefault(set_,{})[pose]=meta
REFH=150.0
def sheet(name):
    A=np.array(Image.open(UP+name+'-image.png').convert('RGB')); lab=np.load(SL+name+'_lab.npy'); c,R=rows(name); return A,lab,c,R
def full8(set_,A,lab,c,idle,walkA,walkB,extra={}):
    """idle: 8 comps; walkA/walkB rows of 16 comps (pairs per dir)"""
    base=None; ih={}
    for d,k in zip(DIRS,idle):
        im,m=cut(set_,c,lab,A,k); ih[d]=m['h']
        if base is None: base=REFH/m['h']
        put(set_,f'idle_{d}',im,m,base)
    for i,d in enumerate(DIRS):
        ks=[walkA[2*i],walkA[2*i+1],walkB[2*i],walkB[2*i+1]]
        cuts=[cut(set_,c,lab,A,k) for k in ks]
        med=float(np.median([m['h'] for _,m in cuts]))
        s=base*ih[d]/med*0.985
        for f,(im,m) in enumerate(cuts): put(set_,f'walk{f+1}_{d}',im,m,s)
    for pose,k in extra.items():
        im,m=cut(set_,c,lab,A,k); put(set_,pose,im,m,base*ih[0]/m['h']*extra_scale.get((set_,pose),1) if False else base)
extra_scale={}
# tourist customer
A,lab,c,R=sheet('3ebd33b9'); full8('tourist',A,lab,c,R[0],R[1],R[2])
# tourist: sitting (front-right, with the sheet's own chair + table) and the 4-frame eating loop
base=out['tourist']['idle_0']['s']
for pose,k in [('sit_315',R[3][7]),('eat_1',R[4][0]),('eat_2',R[4][1]),('eat_3',R[4][2]),('eat_4',R[4][3])]:
    im,m=cut('tourist',c,lab,A,k); put('tourist',pose,im,m,base)
cx=lambda c,k:(c[k][0]+c[k][2])/2
def walkset(set_,A,lab,c,idle_by_dir,walk_by_dir):
    """idle_by_dir: {dir:comp}; walk_by_dir: {dir:[comps]} (any number of frames)"""
    base=None; ih={}
    for d in DIRS:
        im,m=cut(set_,c,lab,A,idle_by_dir[d]); ih[d]=m['h']
        if base is None: base=REFH/m['h']
        put(set_,f'idle_{d}',im,m,base)
    for d,ks in walk_by_dir.items():
        cuts=[cut(set_,c,lab,A,k) for k in ks]; med=float(np.median([m['h'] for _,m in cuts])); sc=base*ih[d]/med*0.985
        for f,(im,m) in enumerate(cuts): put(set_,f'walk{f+1}_{d}',im,m,sc)
    return base
# VIP fedora (v4.3.3 sheet). The sheet names views from the cat's side: "right" faces screen-left.
A,lab,c,R=sheet('11ab0483')
idle=dict(zip([0,45,90,135,180,225,270,315],R[0]))
half=lambda row,left: [k for k in row if (cx(c,k)<760)==left]
walk={0:half(R[1],True),45:half(R[1],False),90:half(R[2],True),135:half(R[2],False),180:half(R[3],True),225:half(R[3],False),270:half(R[4],True),315:half(R[4],False)}
base=walkset('vipfedora',A,lab,c,idle,walk)
sit=dict(zip([0,45,90,135,180,225,270,315],R[5][:8]))
for d,k in sit.items(): im,m=cut('vipfedora',c,lab,A,k); put('vipfedora',f'sit_{d}',im,m,base)
for f,k in enumerate(R[6][:4]): im,m=cut('vipfedora',c,lab,A,k,ymax=994); put('vipfedora',f'drink_{f+1}',im,m,base)
for pose,k in zip(['sit_cool','sit_menu','sit_phone','sit_happy','sit_surprised','sit_angry','sit_tired'],R[6][4:11]):
    im,m=cut('vipfedora',c,lab,A,k); put('vipfedora',pose,im,m,base)
# VIP 01 = Pink Elegant (v4.3.3 sheet). Front/back walk frames touch each other in the sheet -> legs-only steps there.
A,lab,c,R=sheet('1de2c9c0')
row0=[k for k in R[0] if not (1180<cx(c,k)<1350)]          # drop the unlabelled extra pose
idle=dict(zip([0,45,90,135,180,225,270,315],row0))
q=lambda row,a,b:[k for k in row if a<=cx(c,k)<b]
walk={45:q(R[1],380,760),90:q(R[1],760,1140),135:q(R[1],1140,1600),225:q(R[2],380,760),270:q(R[2],760,1140),315:q(R[2],1140,1600)}
base=walkset('vip01',A,lab,c,idle,walk)
for d,k in zip([0,45,90,135,180,225,270,315],R[3]): im,m=cut('vip01',c,lab,A,k); put('vip01',f'sit_{d}',im,m,base)
for f,k in enumerate(R[4][0:4]): im,m=cut('vip01',c,lab,A,k); put('vip01',f'drink_{f+1}',im,m,base)
for f,k in enumerate(R[4][4:8]): im,m=cut('vip01',c,lab,A,k); put('vip01',f'dessert_{f+1}',im,m,base)
for pose,k in zip(['sit_happy','sit_surprised','sit_angry','sit_tired'],R[4][8:12]): im,m=cut('vip01',c,lab,A,k); put('vip01',pose,im,m,base)
# regular 01-04, VIP01, VIP02: idle 8 only (procedural legs)
A,lab,c,R=sheet('d1354058')
for set_,row in zip(['cat01','cat02','cat03','cat04'],R[:4]):
    base=None
    for d,k in zip(DIRS,row[:8]):
        im,m=cut(set_,c,lab,A,k)
        if base is None: base=REFH/m['h']*(0.97 if set_.startswith('cat') else 1)
        put(set_,f'idle_{d}',im,m,base)
    for pose,k in zip(['sit_eat','sit_dessert','sit_drink'],row[12:15]):
        im,m=cut(set_,c,lab,A,k); put(set_,pose,im,m,base)
# cleaner + manager
A,lab,c,R=sheet('9411e93a')
idle=R[0][:8]; full8('cleaner',A,lab,c,idle,R[1],R[2])
base=out['cleaner']['idle_0']['s']; h0=out['cleaner']['idle_0']['h']
for pose,k in [('sweep_1',R[0][8]),('sweep_2',R[0][9]),('collect',R[0][10]),('sleep',R[3][5]),('carry_trash',R[3][8]),('happy',R[3][0])]:
    im,m=cut('cleaner',c,lab,A,k); put('cleaner',pose,im,m,base)
base=None
for d,k in zip(DIRS,R[4][:8]):
    im,m=cut('manager',c,lab,A,k)
    if base is None: base=REFH/m['h']
    put('manager',f'idle_{d}',im,m,base)
for pose,k in [('check_tablet',R[4][8]),('give_instruction',R[4][9]),('talk_happy',R[4][10])]:
    im,m=cut('manager',c,lab,A,k); put('manager',pose,im,m,base)
js='/* 16_more_sprites.js — customer / VIP / cleaner / manager art cut directly from the approved sheets. AUTO-GENERATED by tools/cut_sheets2.py */\nconst MORE_SPRITES='+json.dumps(out,separators=(',',':'))+';\n'
open('/home/claude/cpt/src/16_more_sprites.js','w').write(js)
print({k:len(v) for k,v in out.items()}, len(js)//1024,'KB')
# contact sheet
for set_ in out:
    ims=[]
    for p,m in out[set_].items():
        im=Image.open(io.BytesIO(base64.b64decode(m['src'].split(',')[1]))).convert('RGBA'); s=m['s']
        im=im.resize((max(1,int(m['w']*s)),max(1,int(m['h']*s))))
        ims.append((p,im,m['ax']*s,m['ay']*s,m['legY']*s))
    W=sum(i.width+10 for _,i,*_ in ims[:20]); 
    cols=20; rws=(len(ims)+cols-1)//cols
    cs=Image.new('RGBA',(cols*130,rws*190),(200,230,200,255))
    for j,(p,im,ax,ay,ly) in enumerate(ims):
        gx=(j%cols)*130+65; gy=(j//cols)*190+175
        cs.alpha_composite(im,(int(gx-ax),int(gy-ay)))
        cs.paste((255,0,0,255),(gx-3,gy,gx+3,gy+2))
    cs.save(f'/home/claude/slice2/cs_{set_}.png')
