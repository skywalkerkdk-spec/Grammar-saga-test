import json,math,os
from PIL import Image,ImageDraw
from layout import *
import render6 as R
S=json.load(open('sites6.json'))
RAW='https://raw.githubusercontent.com/skywalkerkdk-spec/grammar-saga-test/main/worldmap-brief/'
PAN={'SC':(1,1),'SW':(0,1),'SE':(2,1),'NC':(1,0),'NW':(0,0),'NE':(2,0)}
NAMES={'SC':'SOUTH-CENTER','SW':'SOUTH-WEST','SE':'SOUTH-EAST','NC':'NORTH-CENTER','NW':'NORTH-WEST','NE':'NORTH-EAST'}
ORDER=['SC','SW','SE','NC','NW','NE']
NEI={'SC':[],'SW':[('right','SC','left')],'SE':[('left','SC','right')],'NC':[('bottom','SC','top')],'NW':[('right','NC','left'),('bottom','SW','top')],'NE':[('left','NC','right'),('bottom','SE','top')]}
GEO={
'SW':"Start of the journey. Outer ocean along the left and bottom edges. Gentle bright forest around d1 (far west), then hills (d2), red-rock canyon (d3), a market plain (d4) and the workshop (d5) along the south; the north half is a rocky plateau with the black castle d6, and the north-west corner is dark corrupted land (purple mist) around d7 and d8. The main road runs from d1 east along the south half and leaves through the right edge.",
'SC':"First panel drawn (no neighbor). Bottom edge is ocean with a bay. West: meadow (g1) and a rocky hill with a cave (g2). Middle: golden wheat plains around Tensefield with the clock ruin to its south-east. North half: scholarly highlands with a hedge-maze library (d16), a rocky eyrie (d17) and a mountain pass with the cliff gate md. The main road crosses the whole panel from the left edge to the right edge.",
'SE':"Bottom and right edges are ocean (south-east coast with harbor id and the little Noun Village). West: pine-forest valley around Modalvale. North-west: deserts and a red canyon (pf, pc). East: dense forest with the giant-tree town Relawood and its forest ruin. The main road enters from the left edge, dips south through Pronoun Village's meadow, then curves north to Relawood and leaves through the TOP edge.",
'NC':"Top edge is ocean with harbors and a lighthouse bay (d15, rv). A snowy rise with the fortress d14 in the north-west, scholarly highlands with the manor d12, a stone tower d18, a small desert patch with the pyramid d13 and the grey castle sx in the south. The main road enters from the RIGHT edge, passes Whereport (sandy coastal town) and leaves through the left edge.",
'NW':"Left and top edges are ocean; the Isle of Proverbs sits in a bay in the north-west corner, joined by a causeway. West: foggy swamp (d9). Centre: ice cave in a snowfield (d10), volcanic canyon (d11). South and east: hills with Ifhaven and Compare Hills towns and their caves. The main road enters from the RIGHT edge, goes past Ifhaven and ends at Compare Hills near the bottom-left.",
'NE':"Top and right edges are ocean with the Preposition Isles chain. West: forests (pe) and a river-bridge gorge (cj). North: the town Passive Lake beside a big turquoise lake in the east (ps sunken gate on its peninsula). Centre-south: a plateau (iv) and the Job-Change Temple. East coast: Reported Speech Harbor. The main road enters from the BOTTOM edge, climbs to Passive Lake and leaves through the left edge."}
def local(k):
    kind,x,y=S[k];c,r=PAN[panel_of(x,y)];return x-3072*c,y-2048*r
def panel_of(x,y):
    for p,(c,r) in PAN.items():
        if c*3072<=x<(c+1)*3072 and r*2048<=y<(r+1)*2048:return p
def crossings():
    out={p:{} for p in PAN}
    for i in range(len(ROAD)-1):
        a,b=ROAD[i],ROAD[i+1]
        for sx in (3072,6144):
            if (a[0]-sx)*(b[0]-sx)<0:
                t=(sx-a[0])/(b[0]-a[0]);y=a[1]+t*(b[1]-a[1]);r=int(y//2048);c=int(sx//3072)
                lp=[p for p,(cc,rr) in PAN.items() if rr==r and cc==c-1][0];rp=[p for p,(cc,rr) in PAN.items() if rr==r and cc==c][0]
                out[lp]['right']=round(y-2048*r);out[rp]['left']=round(y-2048*r)
        sy=2048
        if (a[1]-sy)*(b[1]-sy)<0:
            t=(sy-a[1])/(b[1]-a[1]);x=a[0]+t*(b[0]-a[0]);c=int(x//3072)
            lp=[p for p,(cc,rr) in PAN.items() if rr==0 and cc==c][0];rp=[p for p,(cc,rr) in PAN.items() if rr==1 and cc==c][0]
            out[lp]['bottom']=round(x-3072*c);out[rp]['top']=round(x-3072*c)
    return out
X=crossings();print(X)
LAKEL=R.LAKE
def guide(p):
    c,r=PAN[p];ox,oy=3072*c,2048*r
    im=Image.new('RGB',(1536,1024),(150,205,120));d=ImageDraw.Draw(im,'RGBA')
    if r==0:d.rectangle([0,0,1536,75],fill=R.SEA)
    if r==1:d.rectangle([0,949,1536,1024],fill=R.SEA)
    if c==0:d.rectangle([0,0,75,1024],fill=R.SEA)
    if c==2:d.rectangle([1461,0,1536,1024],fill=R.SEA)
    for k,(kind,x,y) in S.items():
        rr=420 if kind!='T' else 320;col=R.COL[R.TER[k]]
        d.ellipse([(x-rr-ox)/2,(y-rr*.8-oy)/2,(x+rr-ox)/2,(y+rr*.8-oy)/2],fill=col+(150,))
    x,y,rx,ry=LAKEL;d.ellipse([(x-rx-ox)/2,(y-ry-oy)/2,(x+rx-ox)/2,(y+ry-oy)/2],fill=R.COL['lake']+(255,))
    for k,(kind,x,y) in S.items():
        best=min(range(len(ROAD)-1),key=lambda i:dseg((x,y),ROAD[i],ROAD[i+1]))
        a,b=ROAD[best],ROAD[best+1];dx,dy=b[0]-a[0],b[1]-a[1];t=max(0,min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));q=(a[0]+t*dx,a[1]+t*dy)
        if math.hypot(q[0]-x,q[1]-y)>60:d.line([((q[0]-ox)/2,(q[1]-oy)/2),((x-ox)/2,(y-oy)/2)],fill=(255,240,120),width=4)
    d.line([((x-ox)/2,(y-oy)/2) for x,y in ROAD],fill=(200,170,120),width=10,joint='curve')
    R.sites(d,.5,(ox,oy),True)
    d.text((16,992),f"{NAMES[p]}  3072x2048 (scale 1/2) - red square=town, purple triangle=dungeon, yellow line=side path",font=R.f2,fill=(255,255,255),stroke_width=2,stroke_fill=(0,0,0))
    im.save(f'{p}_guide.png')
COMMON=open('common.txt',encoding='utf8').read()
for i,p in enumerate(ORDER,1):
    guide(p);c,r=PAN[p];ox,oy=3072*c,2048*r
    rows=[]
    for k,(kind,x,y) in S.items():
        if panel_of(x,y)!=p:continue
        lx,ly=x-ox,y-oy;nm,desc=D[k]
        ty='TOWN ICON (~110x90 px)' if kind=='T' else ('LANDMARK ICON (~110x110 px)' if kind=='L' else 'DUNGEON ICON (~90x90 px)')
        desc=desc
        rows.append(f"| {k.replace('_t','(town)')} | {nm} | {ty} | {lx},{ly} | {desc} |")
    ed=X[p];seam=[]
    for side,v in ed.items():
        if side in('left','right'):seam.append(f"{side.upper()} edge: the main road crosses at y={v}")
        else:seam.append(f"{side.upper()} edge: the main road crosses at x={v}")
    nb=NEI[p]
    nbtxt="No neighbor image is needed." if not nb else "Also use the finished neighbor panel image(s) the person will attach and CONTINUE their touching edge exactly: "+"; ".join(f"this panel's {a.upper()} edge continues the {NAMES[n]} panel's {b.upper()} edge" for a,n,b in nb)+"."
    md=f"""# Panel {i}: {NAMES[p]}

Layout guide image (use it as the placement reference, do NOT draw its text): {RAW}{p}_guide.png

{nbtxt}

--- 1단계: 지도 ---
{COMMON}
PANEL: {NAMES[p]} (grid position: column {c+1} of 3, row {r+1} of 2; the whole continent is 3 x 2 panels = 9216x4096 px).
Geography: {GEO[p]}
Road crossings on this panel's seams (keep exactly): {'; '.join(seam)}. Edges not listed have NO road: keep them open grass/forest/rock continuing the terrain, with no sites within 250 px.

Sites (center coordinates in px at 3072x2048):
| id | place | type | x,y (px) | description / terrain |
|---|---|---|---|---|
"""+"\n".join(rows)+"""

--- 2단계: 마스크와 지형 구역도 (완성된 이 패널 이미지를 첨부하고 아래를 붙여넣기) ---
"""+f"PANEL: {NAMES[p]}.\n"+open('step2.txt',encoding='utf8').read()
    open(f'{i}_{p}.md','w',encoding='utf8').write(md)
