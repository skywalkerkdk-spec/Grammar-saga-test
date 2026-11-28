import numpy as np,json
from PIL import Image
from scipy import ndimage as ndi
Image.MAX_IMAGE_PIXELS=None
SRC='/tmp/gs/worldmap/'
T=48;COLS=192;ROWS=42
ims=[Image.open(SRC+n).convert('RGB') for n in ('west-overworld.png','center-east-seam.png','east-overworld.png')]
W=Image.new('RGB',(9216,2016))
for i,im in enumerate(ims):W.paste(im.crop((0,0,3072,2016)),(i*3072,0))
W.save('/tmp/ow/world_full.png')
S=W.resize((2304,504),Image.BOX)
hsv=np.asarray(S.convert('HSV')).astype(float);rgb=np.asarray(S).astype(float)
H=hsv[:,:,0]*360/255;Sa=hsv[:,:,1]/255;V=hsv[:,:,2]/255
r,g,b=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
water=(H>165)&(H<250)&(Sa>0.30)&(V>0.28)
lava=(H<28)&(Sa>0.65)&(V>0.7)
road=(H>18)&(H<50)&(Sa>0.28)&(Sa<0.65)&(V>0.62)
snow=(Sa<0.22)&(V>0.82)
rock=((Sa<0.32)&(V>0.22)&(V<0.82)&~snow)|((H>=15)&(H<45)&(Sa>=0.22)&(Sa<0.55)&(V>=0.28)&(V<0.62))|((H>=250)&(H<320)&(Sa<0.5)&(V<0.75))
dkgreen=(H>70)&(H<165)&(V<0.42)
blk=water|lava|(rock&~road)
cell=12
def frac(a):return a.reshape(ROWS,cell,COLS,cell).mean((1,3))
fb=frac(blk);fd=frac(dkgreen);fr=frac(road);fw=frac(water)
tw=~((fb>=0.40)|(fd>=0.70))
tw|= fr>=0.18   # roads always walkable
np.save('/tmp/ow/tw2.npy',tw);np.save('/tmp/ow/fw.npy',fw);np.save('/tmp/ow/fr.npy',fr)
print('walk%',round(tw.mean()*100,1))
vis=np.where(tw[:,:,None],np.array([240,240,240]),np.array([20,20,20])).astype(np.uint8)
S2=Image.fromarray(vis).resize((192*8,42*8),Image.NEAREST);S2.save('/tmp/ow/tilemask2.png')
