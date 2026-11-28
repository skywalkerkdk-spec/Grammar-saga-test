import numpy as np,json,collections
from PIL import Image
from scipy import ndimage as ndi
Image.MAX_IMAGE_PIXELS=None
T=48;COLS=64;ROWS=42
im=Image.open('/tmp/gs/worldmap/south-center-old-paths.png').convert('RGB').crop((0,0,3072,2016))
S=im.resize((768,504),Image.BOX)   # 4 px per source 16x... cell=12 per tile
hsv=np.asarray(S.convert('HSV')).astype(float)
H=hsv[:,:,0]*360/255;Sa=hsv[:,:,1]/255;V=hsv[:,:,2]/255
water=(H>165)&(H<250)&(Sa>0.30)&(V>0.28)
road=(H>18)&(H<55)&(Sa>0.25)&(Sa<0.7)&(V>0.55)
rock=((Sa<0.32)&(V>0.22)&(V<0.82))|((H>=15)&(H<45)&(Sa>=0.22)&(Sa<0.55)&(V>=0.28)&(V<0.62))
dk=(H>88)&(H<160)&(V<0.56)
wheat=(H>38)&(H<62)&(Sa>0.55)&(V>0.7)
cell=12
fr=lambda a:a.reshape(ROWS,cell,COLS,cell).mean((1,3))
blk=water|(rock&~road);fb,fd,frd=fr(blk),fr(dk),fr(road);fwh=fr(wheat);fdk=fd
tw=~((fb>=0.40)|(fd>=0.28));tw|=frd>=0.18
S0=json.load(open('/tmp/wm6/sites6.json'))
D={}
for f in ('1_CENTER','2_WEST','3_EAST'):
    for l in open(f'/tmp/wm6/old_{f}.md',encoding='utf8'):
        if l.startswith('|') and not l.startswith('|---') and not l.startswith('| id | place'):
            c=[x.strip() for x in l.strip().strip('|').split('|')];D[c[0].replace('(town)','_t')]=c[1]
pts={};meta={}
for k,(kind,x,y) in S0.items():
    lx,ly=x-3072,y-2048
    if not(0<=lx<3072 and 0<=ly<2048):continue
    tx,ty=lx//T,min(ly//T+1,ROWS-1)
    # nearest walkable tile at/below
    best=None
    for r in range(0,8):
        for dy in range(0,r+1):
            for dx in range(-r,r+1):
                a,b=tx+dx,ty+dy
                if 0<=b<ROWS and 0<=a<COLS and tw[b,a]:best=(a,b);break
            if best:break
        if best:break
    pts[k]=list(best);en,ko=D[k].split(' / ');meta[k]={'kind':'T' if kind=='T' else 'D','en':en,'ko':ko}
# connectivity
lab,n=ndi.label(tw);sp=pts['g1'];main=lab[sp[1],sp[0]]
print('sites',len(pts),'unreachable',[k for k,p in pts.items() if lab[p[1],p[0]]!=main],'walk%',round(tw.mean()*100,1))
# spawn on the left road at y~1180
sy=1180//T;spawn=None
for x in range(0,6):
    if tw[sy,x] and lab[sy,x]==main:spawn=[x,sy,0];break
print('spawn',spawn)
letters={'a':fwh>0.25,'f':fdk>0.3,'h':fr(rock&~road)>0.25}
zt=np.full((ROWS,COLS),'g',dtype='<U1')
for l in 'hfa':zt[letters[l]]=l
yy,xx=np.mgrid[0:ROWS,0:COLS]
for k,(px,py) in pts.items():
    r=4 if k.endswith('_t') else 3;zt[(xx-px)**2+(yy-(py-1))**2<=r*r]='.'
tiles=[''.join('.' if tw[y,x] else '#' for x in range(COLS)) for y in range(ROWS)]
zones=[''.join(zt[y]) for y in range(ROWS)]
js="/* Walkable overworld test: SOUTH-CENTER panel only (GPT art). */\nwindow.chapterFields=window.chapterFields||{};\nwindow.chapterFields.world="+json.dumps({'image':'story/maps/world.webp','tileSize':48,'displaySize':24,'stepMs':1000,'walkCycleMs':720,'tiles':tiles,'zones':zones,'spawn':spawn,'points':pts,'sites':meta},ensure_ascii=False,separators=(',',':'))+";\n"
open('world.js','w').write(js);im.save('world.webp',quality=80,method=6)
vis=np.where(tw[:,:,None],np.array([240,240,240]),np.array([20,20,20])).astype(np.uint8)
v=Image.fromarray(vis).resize((COLS*12,ROWS*12),Image.NEAREST).convert('RGB')
from PIL import ImageDraw
d=ImageDraw.Draw(v)
for k,(a,b) in pts.items():d.ellipse([a*12-6,b*12-6,a*12+6,b*12+6],fill=(255,0,0))
v.save('mask.png');print(pts)
