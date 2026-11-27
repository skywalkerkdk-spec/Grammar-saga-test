/* Chapter II 마을 주민 걷기. 걷기 시트(512×512, 4열×4행: 왼발·기본·오른발·기본)가 있는 주민만 마을 안을 천천히 돌아다닙니다.
   - 시트가 없거나 불러오기에 실패하면 기존 정지 그림 핀을 그대로 씁니다.
   - 대화창이 열려 있거나 주인공이 바로 옆에 있으면 멈추고 주인공 쪽을 봅니다. 장면이 닫히면 타이머도 함께 끝납니다.
   - 위치는 저장하지 않습니다(장식 동작). 저장·진행 데이터에는 영향이 없습니다. */
(function(){
  const dirs=[[0,1],[-1,0],[1,0],[0,-1]];
  const STEP_MS=520,FRAME_MS=130,RADIUS=3;
  window.ChapterNpcWalk={
    start(ctx){
      const {world,size,targets,live,pins,map}=ctx;
      const fixed=new Set(targets.filter(t=>!(t.walk&&t.walk.ready)).map(t=>map.points[t.id].join(',')));
      const walkers=[];
      for(const t of targets){
        if(!(t.walk&&t.walk.ready))continue;
        const pin=pins[t.id];if(!pin)continue;
        const probe=new Image();
        probe.onload=()=>{
          const sprite=document.createElement('div');
          sprite.className='c2-npc-sprite';
          sprite.style.backgroundImage=`url(${t.walk.sheet})`;
          const cols=t.walk.cols||4;sprite.style.backgroundSize=`${cols*100}% 400%`;
          const old=pin.querySelector('img');
          if(old)old.replaceWith(sprite);else pin.prepend(sprite);
          const [hx,hy]=map.points[t.id];
          walkers.push({t,pin,sprite,cols,idle:t.walk.idle??1,home:[hx,hy],x:hx,y:hy,face:0,seg:null,next:performance.now()+400+Math.random()*2600,frame0:0});
          if(walkers.length===1)loop();
        };
        probe.src=t.walk.sheet; // 오류가 나면 정지 그림이 그대로 남습니다
      }
      let raf=0;
      function occupied(x,y,self){
        const h=ctx.hero();
        if(h.x===x&&h.y===y)return true;
        if(h.target&&h.target[0]===x&&h.target[1]===y)return true;
        if(fixed.has(x+','+y))return true;
        for(const w of walkers){if(w===self)continue;if(w.x===x&&w.y===y)return true;if(w.seg&&w.seg.x===x&&w.seg.y===y)return true;}
        return false;
      }
      function place(w,px,py,frame){
        w.pin.style.left=(px+.5)*size+'px';
        w.pin.style.top=(py+.72)*size+'px';
        w.pin.style.zIndex=String(10+Math.floor(py*10));
        w.sprite.style.backgroundPosition=`${w.cols>1?frame/(w.cols-1)*100:0}% ${w.face/3*100}%`;
      }
      function loop(){
        raf=requestAnimationFrame(now=>{
          if(!world.isConnected){return;}
          const host=world.closest('dialog'); // 마을 지도는 대화 상자 안에서 열리므로, 그 위에 다른 대화 상자가 겹칠 때만 멈춥니다
          const dialogOpen=document.querySelectorAll('dialog[open]').length>(host?1:0);
          const h=ctx.hero();
          for(const w of walkers){
            if(w.seg){
              const p=(now-w.seg.t0)/STEP_MS;
              if(p>=1){
                w.x=w.seg.x;w.y=w.seg.y;live[w.t.id]=[w.x,w.y];w.seg=null;
                place(w,w.x,w.y,w.idle);w.next=now+1200+Math.random()*3500;
              }else{
                place(w,w.x+(w.seg.x-w.x)*p,w.y+(w.seg.y-w.y)*p,Math.floor((now-w.seg.t0)/FRAME_MS)%w.cols);
              }
              continue;
            }
            const near=Math.max(Math.abs(h.x-w.x),Math.abs(h.y-w.y))<=1;
            if(near||dialogOpen){
              if(near){const dx=h.x-w.x,dy=h.y-w.y;w.face=Math.abs(dx)>Math.abs(dy)?(dx<0?1:2):(dy<0?3:0);}
              place(w,w.x,w.y,w.idle);w.next=Math.max(w.next,now+900);continue;
            }
            if(now<w.next){place(w,w.x,w.y,w.idle);continue;}
            const order=[0,1,2,3].sort(()=>Math.random()-.5);
            let moved=false;
            for(const d of order){
              const nx=w.x+dirs[d][0],ny=w.y+dirs[d][1];
              if(Math.abs(nx-w.home[0])+Math.abs(ny-w.home[1])>RADIUS)continue;
              if(!ctx.walkable(nx,ny)||occupied(nx,ny,w))continue;
              const pending=walkers.filter(o=>o!==w&&o.seg).map(o=>[o.seg.x,o.seg.y]);
              if(ctx.canStand&&!ctx.canStand(w.t.id,nx,ny,pending))continue; // 길목을 막아 다른 곳을 못 가게 만드는 칸은 피함
              w.face=d;w.seg={x:nx,y:ny,t0:now};moved=true;break;
            }
            if(!moved){w.next=now+800+Math.random()*1500;place(w,w.x,w.y,w.idle);}
          }
          loop();
        });
      }
    }
  };
})();
