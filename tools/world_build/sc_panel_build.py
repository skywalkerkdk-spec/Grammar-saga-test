import numpy as np,json,collections
from PIL import Image
from scipy import ndimage as ndi
Image.MAX_IMAGE_PIXELS=None
T=48;COLS=64;ROWS=42
im=Image.open('/tmp/gs/worldmap/south-center-hand-painted-preview.png').convert('RGB').resize((3072,2048),Image.LANCZOS).crop((0,0,3072,2016))
S=im.resize((768,504),Image.BOX)   # 4 px per source 16x... cell=12 per tile
hsv=np.asarray(S.convert('HSV')).astype(float)
H=hsv[:,:,0]*360/255;Sa=hsv[:,:,1]/255;V=hsv[:,:,2]/255
water=(H>165)&(H<250)&(Sa>0.30)&(V>0.28)
road=(H>20)&(H<55)&(Sa>0.25)&(Sa<0.75)&(V>0.60)
dk=(H>45)&(H<160)&(V<0.52)&(Sa>0.35)
rock=(Sa<0.40)&(V>0.25)&(V<0.80)&~road
wheat=(H>38)&(H<62)&(Sa>0.55)&(V>0.7)
cell=12
fr=lambda a:a.reshape(ROWS,cell,COLS,cell).mean((1,3))
blk=water|rock;fb,fd,frd=fr(blk),fr(dk),fr(road);fwh=fr(wheat);fdk=fd
tw=~((fb>=0.35)|(fd>=0.30));tw|=frd>=0.18
S0=json.load(open('/tmp/wm6/sites6.json'))
D={}
for f in ('1_CENTER','2_WEST','3_EAST'):
    for l in open(f'/tmp/wm6/old_{f}.md',encoding='utf8'):
        if l.startswith('|') and not l.startswith('|---') and not l.startswith('| id | place'):
            c=[x.strip() for x in l.strip().strip('|').split('|')];D[c[0].replace('(town)','_t')]=c[1]
XY={'d16':(900,300),'d17':(2000,470),'g1':(300,1040),'tn_t':(1300,1100),'md':(2760,1040),'g2':(540,1680),'tn':(2160,1600)}
pts={};meta={}
for k,(lx,ly) in XY.items():
    kind=S0[k][0]
    tx,ty=lx//T,min(ly//T+1,ROWS-1)
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
lab,n=ndi.label(tw);sp=pts['tn_t'];main=lab[sp[1],sp[0]]
print('sites',len(pts),'unreachable',[k for k,p in pts.items() if lab[p[1],p[0]]!=main],'walk%',round(tw.mean()*100,1))
# spawn on the left road at y~1180
sy=1140//T;spawn=None
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
js="/* Walkable overworld test: SOUTH-CENTER panel only (GPT art). */\nwindow.chapterFields=window.chapterFields||{};\nwindow.chapterFields.world="+json.dumps({'image':'story/maps/world.webp','tileSize':48,'displaySize':30,'stepMs':667,'walkCycleMs':480,'tiles':tiles,'zones':zones,'spawn':spawn,'points':pts,'sites':meta},ensure_ascii=False,separators=(',',':'))+";\n"
open('world.js','w').write(js);im.save('world.webp',quality=88,method=6)
vis=np.where(tw[:,:,None],np.array([240,240,240]),np.array([20,20,20])).astype(np.uint8)
v=Image.fromarray(vis).resize((COLS*12,ROWS*12),Image.NEAREST).convert('RGB')
from PIL import ImageDraw
d=ImageDraw.Draw(v)
for k,(a,b) in pts.items():d.ellipse([a*12-6,b*12-6,a*12+6,b*12+6],fill=(255,0,0))
v=Image.blend(v,Image.open('/tmp/gs/worldmap/south-center-hand-painted-preview.png').convert('RGB').resize(v.size),.45);v.save('mask.png');print(pts)
