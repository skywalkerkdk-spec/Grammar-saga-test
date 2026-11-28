import json,math
from PIL import Image,ImageDraw,ImageFont
from layout import *
S=json.load(open('sites6.json'))
F='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
f1=ImageFont.truetype(F,18,index=1);f2=ImageFont.truetype(F,14,index=1)
TER={'pv':'sand','d9':'swamp','d10':'ice','d11':'lava','d12':'hill','d5':'grass','d4':'grass','d3':'canyon','d1':'forest','d8':'dark','d7':'dark','d2':'hill','d6':'rock','g1':'grass','g2':'hill','tn':'wheat','tn_t':'wheat','md_t':'forest','md':'rock','rp_t':'forest','rp':'forest','ps_t':'lake','ps':'lake','cj':'grass','d13':'desert','d16':'grass','d17':'rock','d14':'ice','d15':'sand','d18':'rock','pf':'desert','pc':'canyon','pn':'grass','rv_t':'sand','rv':'sand','sj_t':'hill','sj':'rock','cp_t':'hill','cp':'hill','ot':'sea2','iv':'hill','pe':'forest','rs':'sand','sx':'rock','TEMPLE':'grass','ng':'grass','id':'sand'}
COL={'grass':(150,205,120),'forest':(70,140,80),'dark':(100,70,130),'swamp':(110,140,90),'ice':(215,235,245),'lava':(210,100,70),'hill':(185,170,120),'canyon':(190,110,80),'rock':(150,150,160),'desert':(235,210,140),'wheat':(230,200,90),'sand':(230,220,170),'lake':(90,170,215),'sea2':(80,150,200)}
SEA=(45,110,170);LAKE=(8650,1000,520,380)
W,H=9216,4096;K=.25
def mk():
    im=Image.new('RGB',(int(W*K),int(H*K)),(150,205,120));d=ImageDraw.Draw(im,'RGBA')
    d.rectangle([0,0,W*K,150*K],fill=SEA);d.rectangle([0,(H-150)*K,W*K,H*K],fill=SEA);d.rectangle([0,0,150*K,H*K],fill=SEA);d.rectangle([(W-150)*K,0,W*K,H*K],fill=SEA)
    for k,(kind,x,y) in S.items():
        c=COL[TER[k]];r=420 if kind!='T' else 320
        d.ellipse([(x-r)*K,(y-r*.8)*K,(x+r)*K,(y+r*.8)*K],fill=c+(150,))
    x,y,rx,ry=LAKE;d.ellipse([(x-rx)*K,(y-ry)*K,(x+rx)*K,(y+ry)*K],fill=COL['lake']+(255,))
    for k,(kind,x,y) in S.items():  # side paths
        best=min(range(len(ROAD)-1),key=lambda i:dseg((x,y),ROAD[i],ROAD[i+1]))
        a,b=ROAD[best],ROAD[best+1];dx,dy=b[0]-a[0],b[1]-a[1];t=max(0,min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)))
        q=(a[0]+t*dx,a[1]+t*dy)
        if math.hypot(q[0]-x,q[1]-y)>60:d.line([(q[0]*K,q[1]*K),(x*K,y*K)],fill=(255,240,120),width=3)
    d.line([(x*K,y*K) for x,y in ROAD],fill=(200,170,120),width=8,joint='curve')
    return im,d
def sites(d,K2=K,off=(0,0),lab=True):
    for k,(kind,x,y) in S.items():
        X,Y=(x-off[0])*K2,(y-off[1])*K2
        if kind=='T':d.rectangle([X-14,Y-11,X+14,Y+11],fill=(220,60,60),outline=(255,255,255),width=2)
        elif kind=='L':d.polygon([(X,Y-14),(X+13,Y+10),(X-13,Y+10)],fill=(255,215,80),outline=(40,40,40))
        else:d.polygon([(X,Y-13),(X+12,Y+9),(X-12,Y+9)],fill=(60,40,90),outline=(255,255,255))
        if lab:d.text((X,Y+14),f"{k.replace('_t','')} {D[k][0].split(' / ')[0] if k in D else ''}",font=f2,fill=(20,20,20),anchor='ma',stroke_width=3,stroke_fill=(255,255,255))
if __name__=='__main__':
    im,d=mk();sites(d);im.save('guide_all6.png');print(im.size)
