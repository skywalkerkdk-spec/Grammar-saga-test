import json,math,random,re
# --- descriptions from existing briefs
D={}
for f in ('1_CENTER','2_WEST','3_EAST'):
    for l in open(f'/tmp/gs/worldmap-brief/{f}.md',encoding='utf8'):
        if l.startswith('|') and not l.startswith('|---') and not l.startswith('| id | place'):
            c=[x.strip() for x in l.strip().strip('|').split('|')]
            i=c[0].replace('(town)','_t');D[i]=(c[1],c[4])
SITES={ # id:(kind,x,y,fixed)
'd1':('D',500,3500,1),'d2':('D',1150,3250,0),'d3':('D',1750,3700,0),'d4':('D',2300,3200,0),'d5':('D',2800,3700,0),'d6':('D',2650,2650,0),'d7':('D',1500,2650,0),'d8':('D',600,2650,0),
'g1':('D',3450,3050,0),'g2':('D',3650,3700,0),'tn_t':('T',4400,3200,1),'tn':('D',4900,3700,0),'md':('D',5600,2650,0),'d17':('D',4500,2350,0),'d16':('D',3400,2300,0),
'md_t':('T',6900,3220,1),'rp_t':('T',8450,2680,1),'rp':('D',7800,2500,0),'pf':('D',7200,2400,0),'pc':('D',6600,2450,0),'pn':('D',7700,3750,1),'ng':('D',8800,3350,0),'id':('D',8650,3800,1),
'ps_t':('T',7300,650,1),'ps':('D',8250,1050,1),'cj':('D',6600,1600,0),'ot':('D',8500,400,1),'iv':('D',7600,1650,0),'pe':('D',6500,500,0),'rs':('D',8800,1500,1),'TEMPLE':('L',7900,1250,0),
'rv_t':('T',4900,1150,1),'rv':('D',5600,430,1),'d14':('D',3500,450,1),'d15':('D',4500,420,1),'d18':('D',3600,1700,0),'sx':('D',5400,1800,0),'d13':('D',4400,1800,0),'d12':('D',3700,1300,0),
'sj_t':('T',2400,800,1),'sj':('D',2600,1500,0),'cp_t':('T',700,1750,1),'cp':('D',1500,1300,0),'pv':('D',450,450,0),'d9':('D',400,1100,0),'d10':('D',1300,500,0),'d11':('D',1800,450,0)}
ROAD=[(500,3560),(1150,3400),(1700,3480),(2300,3350),(3060,3200),(3800,3250),(4400,3290),(5200,3400),(6130,3350),(6900,3290),(7500,3700),(8200,3650),(8650,3200),(8450,2750),(8700,2300),(8700,2040),(8600,1700),(8000,1250),(7400,720),(6700,900),(6130,1100),(5600,1300),(4900,1220),(4200,1000),(3600,900),(3060,900),(2400,870),(1800,1200),(1100,1400),(700,1820)]
def pl_len(P):return sum(math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]) for i in range(len(P)-1))
def dseg(p,a,b):
    ax,ay=a;bx,by=b;px,py=p;dx,dy=bx-ax,by-ay;t=max(0,min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)))
    return math.hypot(px-ax-t*dx,py-ay-t*dy)
def droad(p):return min(dseg(p,ROAD[i],ROAD[i+1]) for i in range(len(ROAD)-1))
def panel(x,y):return ('N' if y<2048 else 'S')+('W','C','E')[min(2,int(x//3072))]
if __name__=='__main__':
    random.seed(7)
    P={k:[v[1],v[2]] for k,v in SITES.items()}
    free=[k for k,v in SITES.items() if not v[3]]
    for it in range(600):
        for k in free:
            fx=fy=0
            for j,q in P.items():
                if j==k:continue
                dx,dy=P[k][0]-q[0],P[k][1]-q[1];d=math.hypot(dx,dy)+1e-6
                if d<1000:fx+=dx/d*(1000-d)*.05;fy+=dy/d*(1000-d)*.05
            dr=droad(P[k])
            if dr<350:  # push away from road? find nearest road pt direction
                pass
            # keep within own panel
            px,py=P[k];pn=panel(*SITES[k][1:3])
            x0=(0,3072,6144)[('W','C','E').index(pn[1])];y0=0 if pn[0]=='N' else 2048
            P[k][0]=min(max(px+fx,x0+330),x0+3072-330);P[k][1]=min(max(py+fy,y0+330),y0+2048-330)
    out={k:[SITES[k][0],round(P[k][0]),round(P[k][1])] for k in SITES}
    json.dump(out,open('sites6.json','w'))
    ks=list(out);md=min((math.hypot(out[a][1]-out[b][1],out[a][2]-out[b][2]),a,b) for i,a in enumerate(ks) for b in ks[i+1:])
    print('min dist',md)
    print('road len',round(pl_len(ROAD)))
    T=['d1','tn_t','md_t','rp_t','ps_t','rv_t','sj_t','cp_t']
    # distance along road between towns
    def along(k):
        best=None
        for i in range(len(ROAD)-1):
            d=dseg(P[k],ROAD[i],ROAD[i+1])
            if best is None or d<best[0]:best=(d,i)
        i=best[1];s=pl_len(ROAD[:i+1])
        a,b=ROAD[i],ROAD[i+1];dx,dy=b[0]-a[0],b[1]-a[1];t=max(0,min(1,((P[k][0]-a[0])*dx+(P[k][1]-a[1])*dy)/(dx*dx+dy*dy)))
        return s+t*math.hypot(dx,dy)
    L=[round(along(T[i+1])-along(T[i])) for i in range(len(T)-1)]
    print('legs px',L,'tiles@48',[round(x/48) for x in L])
    print({k:round(droad(P[k])) for k in P if droad(P[k])>900 or (droad(P[k])<200 and SITES[k][0]=='D')})
