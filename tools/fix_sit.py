# Clean seated sprites of white cats: fill the hollow tail and keep only what lies inside the dark ink outline
# (drops the checker floor strip and halos). Existing pixels keep their colour.
import numpy as np
from PIL import Image
from scipy import ndimage
def clean_sit(im):
    a=np.array(im.convert('RGBA')).astype(int); h,w=a.shape[:2]
    op=a[...,3]>60
    filled=ndimage.binary_fill_holes(ndimage.binary_closing(op,np.ones((5,5)),iterations=2))
    hole=filled&~op
    a[...,:3]=np.where(hole[...,None],np.array([250,247,244]),a[...,:3]); a[...,3]=np.where(hole,255,a[...,3])
    rgb=a[...,:3]; mx=rgb.max(2); mn=rgb.min(2)
    ink=(((mx<150)&(mx-mn>25))|(mx<80))&(a[...,3]>100)
    sil=ndimage.binary_fill_holes(ndimage.binary_closing(ink,np.ones((3,3)),iterations=3))
    sil=ndimage.binary_dilation(sil,iterations=1)
    sil|=(np.arange(h)[:,None]<h*.7)
    if sil.sum()>0.6*(a[...,3]>100).sum(): a[...,3]=np.where(sil,a[...,3],0)
    ys,xs=np.nonzero(a[...,3]>24); a=a[ys.min():ys.max()+1,xs.min():xs.max()+1]
    return Image.fromarray(a.astype(np.uint8))
