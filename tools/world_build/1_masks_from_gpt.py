import json,heapq,sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
Image.MAX_IMAGE_PIXELS=None
SRC='/tmp/gs/worldmap/'
S=json.load(open('/tmp/wm/final.json'))
T=48  # original px per tile
COLS=9216//T; ROWS=2016//T   # 192 x 42
# --- load & stitch
def L(n,c='L'): return Image.open(SRC+n).convert(c)
masks=[np.asarray(L(f'{n}-walk-mask.png'))>127 for n in ('west','center','east')]
for a in masks:
    a[:,:3]=a[:,3:4];a[:,-3:]=a[:,-4:-3]
M=np.hstack(masks)[:2016]
# --- clean: close small gaps, drop speckle
M=ndi.binary_closing(M,structure=np.ones((9,9)),iterations=1)
M=ndi.binary_opening(M,structure=np.ones((7,7)),iterations=1)
lab,n=ndi.label(M);sz=ndi.sum(M,lab,range(1,n+1))
keep=np.isin(lab,[i+1 for i,s in enumerate(sz) if s>6000])
M=keep
# fill small black holes (<4000px)
inv=~M;lab,n=ndi.label(inv);sz=ndi.sum(inv,lab,range(1,n+1))
for i,s in enumerate(sz):
    if s<4000:M[lab==i+1]=True
# --- zone map stitch
ZC={(0x2e,0x8b,0x3a):'g',(0x14,0x5a,0x28):'f',(0xd8,0xc0,0x60):'d',(0xe8,0xd8,0x90):'c',(0x7a,0xa8,0xc8):'l',(0xb0,0x8a,0x5a):'h',(0x90,0xa8,0xb8):'s',(0xc8,0x50,0x30):'v',(0x6a,0x5a,0x7a):'w',(0xb8,0xa0,0x60):'a',(255,255,255):'.'}
keys=np.array(list(ZC.keys()));vals=list(ZC.values())
def zlayer(n):
    a=np.asarray(L(f'{n}-zone-map.png','RGB')).astype(int)
    d=((a[:,:,None,:]-keys[None,None,:,:])**2).sum(3)
    return np.array(vals)[d.argmin(2)]
Z=np.hstack([zlayer(n) for n in ('west','center','east')])[:2016]
np.save('/tmp/ow/M_clean.npy',M);np.save('/tmp/ow/Z.npy',Z)
# --- tiles
tw=M[:ROWS*T,:COLS*T].reshape(ROWS,T,COLS,T).mean((1,3))>=0.5
print('tiles',tw.shape,'walk%',round(tw.mean()*100,1))
# sites in tile coords
sites=[]
for ki,k in enumerate('WCE'):
    for id_,t,en,ko,x,y in S[k]:
        sites.append((id_,t,en,ko,(x+3072*ki)//T,y//T))
# connectivity at tile level
lab,n=ndi.label(tw);sz=ndi.sum(tw,lab,range(1,n+1));main=1+int(np.argmax(sz))
def snap(tx,ty,r=5):
    best=None
    for dy in range(-r,r+1):
        for dx in range(-r,r+1):
            x,y=tx+dx,ty+dy
            if 0<=x<COLS and 0<=y<ROWS and lab[y,x]==main:
                d=dx*dx+dy*dy
                if best is None or d<best[0]:best=(d,x,y)
    return best
bad=[]
for s in sites:
    if snap(s[4],s[5]) is None:bad.append(s)
print('unreachable at tile level:',[(s[0],s[4],s[5]) for s in bad])
np.save('/tmp/ow/tw.npy',tw)
json.dump([list(map(lambda v:v if not isinstance(v,(np.integer,)) else int(v),s)) for s in sites],open('/tmp/ow/sites_tile.json','w'),ensure_ascii=False)
