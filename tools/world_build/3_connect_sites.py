import numpy as np,json,heapq
from scipy import ndimage as ndi
from PIL import Image,ImageDraw
tw=np.load('/tmp/ow/tw2.npy').copy();ROWS,COLS=tw.shape
S=json.load(open('/tmp/ow/sites_tile.json'))
# cleanup
inv=~tw;lab,n=ndi.label(inv);sz=ndi.sum(inv,lab,range(1,n+1))
for i,s in enumerate(sz):
    if s<=2:tw[lab==i+1]=True
lab,n=ndi.label(tw);sz=ndi.sum(tw,lab,range(1,n+1))
for i,s in enumerate(sz):
    if s<25:tw[lab==i+1]=False
lab,n=ndi.label(tw);sz=ndi.sum(tw,lab,range(1,n+1));main=1+int(np.argmax(sz))
print('components',n,'main share',round(sz.max()/tw.sum()*100,1))
def nearest_walk(x,y,r=3):
    best=None
    for dy in range(-r,r+1):
        for dx in range(-r,r+1):
            xx,yy=x+dx,y+dy
            if 0<=xx<COLS and 0<=yy<ROWS and tw[yy,xx]:
                d=dx*dx+dy*dy
                if best is None or d<best[0]:best=(d,xx,yy)
    return best
carved=[]
def carve(sx,sy):
    # dijkstra from (sx,sy) to any main-component tile; blocked cost 6
    dist={(sx,sy):0};prev={};pq=[(0,sx,sy)]
    while pq:
        d,x,y=heapq.heappop(pq)
        if d>dist.get((x,y),1e9):continue
        if lab[y,x]==main and tw[y,x]:
            path=[];c=(x,y)
            while c in prev:path.append(c);c=prev[c]
            path.append((sx,sy));return path
        for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
            nx,ny=x+dx,y+dy
            if not(1<=nx<COLS-1 and 1<=ny<ROWS-1):continue
            c=1 if tw[ny,nx] else 6
            nd=d+c
            if nd<dist.get((nx,ny),1e9):dist[(nx,ny)]=nd;prev[(nx,ny)]=(x,y);heapq.heappush(pq,(nd,nx,ny))
    return None
pts={}
fixed=[]
for id_,t,en,ko,x,y in S:
    # entry tile = south of icon (icons ~3 tiles tall): look around site point
    nw=nearest_walk(x,y+2,4) or nearest_walk(x,y,6)
    if nw is None:
        # force walkable at site and carve
        tw[y,x]=True;ex,ey=x,y;fixed.append(id_)
    else:
        ex,ey=nw[1],nw[2]
    if lab[ey,ex]!=main:
        p=carve(ex,ey)
        if p:
            for cx,cy in p:tw[cy,cx]=True
            fixed.append((id_,len(p)))
    pts[id_]=[int(ex),int(ey)]
lab,n=ndi.label(tw);main=1+int(np.argmax(ndi.sum(tw,lab,range(1,n+1))))
unreach=[k for k,(x,y) in pts.items() if lab[y,x]!=main]
print('carved:',fixed);print('unreachable after:',unreach)
np.save('/tmp/ow/tw3.npy',tw);json.dump(pts,open('/tmp/ow/points.json','w'))
im=Image.fromarray(np.where(tw[:,:,None],np.array([235,235,235]),np.array([25,25,25])).astype(np.uint8)).resize((COLS*8,ROWS*8),Image.NEAREST)
d=ImageDraw.Draw(im)
for id_,t,en,ko,x,y in S:
    px,py=pts[id_];d.ellipse([px*8-5,py*8-5,px*8+5,py*8+5],outline=(255,0,0) if t!='T' else (0,200,0),width=3)
im.save('/tmp/ow/tilemask3.png')
