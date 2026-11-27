/* Walkable illustrated fields for Chapter II. Movement is local to the open map. */
window.openChapterField = function(container, map, hero, targets, options={}) {
  const live={};
  const directions=[[0,1],[-1,0],[1,0],[0,-1]];
  const keys=['ArrowDown','ArrowLeft','ArrowRight','ArrowUp'];
  const size=map.tileSize??46;
  const duration=map.tileSize ? map.tileSize * 4.5 : 155;
  const world=document.createElement('div');
  world.className='c2-field-world';
  world.style.width=map.tiles[0].length*size+'px';
  world.style.height=map.tiles.length*size+'px';
  world.style.backgroundImage=`url(${map.image})`;
  const viewport=document.createElement('div');
  viewport.className='c2-field-viewport';
  viewport.append(world);
  const actor=document.createElement('div');
  actor.className='c2-field-hero';
  actor.style.backgroundImage=`url(story/maps/wk_${hero}_walk8.webp)`;
  world.append(actor);
  const controls=document.createElement('div');
  controls.className='c2-field-controls';
  const instructions=document.createElement('p');
  instructions.textContent='조이스틱을 밀거나, 길을 누르거나, 화면을 누른 채 끌어서 이동하세요.';
  const destinations=document.createElement('select');
  destinations.setAttribute('aria-label','탐험 목적지');
  destinations.add(new Option('목적지 선택',''));
  for (const target of targets) destinations.add(new Option(target.label,target.id));
  destinations.onchange=event=>{
    const target=targets.find(item=>item.id===destinations.value);
    if (target) moveTo(...live[target.id],()=>target.action(event.detail));
    destinations.value='';
  };
  container.append(destinations,viewport,controls,instructions);
  let [x,y,initialFace]=options.position||map.spawn;
  let face=initialFace??0;

  // ---- 주민 배치 검증: 주인공이 주민 칸에 올라가지 못하므로, 주민이 길목을 막아 다른 곳을 못 가게 만들지 않게 합니다 ----
  const isNpc=t=>!!(t.image||t.walk||t.caption);
  const keyOf=(a,b)=>a+','+b;
  function reach(sx,sy,blocked) {
    const seen=new Set([keyOf(sx,sy)]);
    const queue=[[sx,sy]];
    for (const [cx,cy] of queue) {
      for (const [dx,dy] of directions) {
        const nx=cx+dx,ny=cy+dy,k=keyOf(nx,ny);
        if (seen.has(k)||map.tiles[ny]?.[nx]!=='.'||blocked.has(k)) continue;
        seen.add(k);
        queue.push([nx,ny]);
      }
    }
    return seen;
  }
  const componentSize=new Map();
  function layoutOK(npcTiles,sx,sy) {
    const blocked=new Set(npcTiles.map(([a,b])=>keyOf(a,b)));
    blocked.delete(keyOf(sx,sy));
    const comp=componentSize.get(keyOf(sx,sy))||(()=>{const c=reach(sx,sy,new Set());componentSize.set(keyOf(sx,sy),c);return c;})();
    let blockedInside=0;
    for (const k of blocked) if (comp.has(k)) blockedInside++;
    const seen=reach(sx,sy,blocked);
    if (seen.size!==comp.size-blockedInside) return false;
    return npcTiles.every(([a,b])=>{
      for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) if ((dx||dy)&&seen.has(keyOf(a+dx,b+dy))) return true;
      return false;
    });
  }
  {
    const points={...map.points};
    const npcs=targets.filter(isNpc);
    const others=targets.filter(t=>!isNpc(t)).map(t=>points[t.id]);
    const placed=[];
    for (const t of npcs) {
      const home=points[t.id];
      const order=[];
      const seen=new Set([keyOf(...home)]);
      const queue=[home];
      for (const [cx,cy] of queue) {
        order.push([cx,cy]);
        for (const [dx,dy] of directions) {
          const nx=cx+dx,ny=cy+dy;
          if (seen.has(keyOf(nx,ny))||map.tiles[ny]?.[nx]!=='.') continue;
          seen.add(keyOf(nx,ny));queue.push([nx,ny]);
        }
        if (order.length>80) break;
      }
      const taken=new Set([...placed,...others,[x,y]].map(([a,b])=>keyOf(a,b)));
      const pick=order.find(c=>!taken.has(keyOf(...c))&&layoutOK([...placed,c],x,y));
      const chosen=pick||home;
      points[t.id]=chosen;
      placed.push(chosen);
    }
    map={...map,points};
  }
  const canStand=(id,nx,ny,pending=[])=>{
    const tiles=targets.filter(t=>isNpc(t)&&t.id!==id).map(t=>live[t.id]||map.points[t.id]);
    return layoutOK([...tiles,...pending,[nx,ny]],x,y);
  };
  let segment=null;
  let route=[];
  let arrival=null;
  let held=null;
  let requested=null;
  const pressedKeys=[];
  let frame=0;
  let began=null;

  function floor(x,y) {
    return map.tiles[y]?.[x]==='.';
  }

  // 주인공은 주민·표지가 서 있는 칸에는 들어가지 않습니다(옆 칸까지 가서 말을 겁니다).
  function walkable(x,y) {
    if (!floor(x,y)) return false;
    for (const id in live) if (live[id][0]===x && live[id][1]===y) return false;
    return true;
  }

  function paint(px,py,step) {
    const left=(px+.5)*size;
    const top=(py+.72)*size;
    actor.style.left=left+'px';
    actor.style.top=top+'px';
    actor.style.zIndex=String(10+Math.floor(py*10));
    actor.style.backgroundPosition=`${step/7*100}% ${face/3*100}%`;
    viewport.scrollLeft=left-viewport.clientWidth/2;
    viewport.scrollTop=top-viewport.clientHeight/2;
  }

  function schedule() {
    if (!frame) frame=requestAnimationFrame(tick);
  }

  function tick(now) {
    frame=0;
    if (!world.isConnected) return;
    let start=now;
    if (segment && now<segment.start+duration && requested!==null) {
      const current=segment.returning ? 3-segment.direction : segment.direction;
      const reverse=3-current;
      if (requested===reverse) {
        const elapsed=Math.max(0,Math.min(duration,now-segment.start));
        segment.start=now-(duration-elapsed);
        segment.returning=!segment.returning;
        face=requested;
        requested=null;
      } else if (requested===current) requested=null;
    }
    if (segment && now>=segment.start+duration) {
      const completed=!segment.returning;
      if (completed) {x=segment.x;y=segment.y;}
      start=Math.max(now-30,segment.start+duration);
      segment=null;
      if (completed && options.onStep?.([x,y,face])) return;
    }
    if (!segment) {
      const queued=requested??route.shift();
      let direction=queued??held?.direction;
      if (held?.token===stick && direction===held.direction && fallback!==null) {
        const [dx,dy]=directions[direction];
        if (!walkable(x+dx,y+dy)) direction=fallback;
      }
      requested=null;
      if (direction!==undefined) {
        const [dx,dy]=directions[direction];
        face=direction;
        if (walkable(x+dx,y+dy)) {
          segment={x:x+dx,y:y+dy,start,direction,returning:false};
          began??=start;
        }
      }
    }
    if (segment) {
      const progress=(now-segment.start)/duration;
      const t=segment.returning ? 1-progress : progress;
      paint(x+(segment.x-x)*t,y+(segment.y-y)*t,Math.floor((now-began)/29)%8);
      schedule();
    } else {
      began=null;
      paint(x,y,2);
      const action=arrival;
      arrival=null;
      action?.();
    }
  }

  function moveTo(tx,ty,action=null) {
    const distanceLimit=action || !walkable(tx,ty) ? 1 : 0;
    const start=segment && !segment.returning ? {x:segment.x,y:segment.y} : {x,y};
    const queue=[{...start,path:[]}];
    const seen=new Set([start.x+','+start.y]);
    for (const current of queue) {
      const distance=action ? Math.max(Math.abs(current.x-tx),Math.abs(current.y-ty)) : Math.abs(current.x-tx)+Math.abs(current.y-ty);
      if (distance<=distanceLimit) {
        route=current.path;
        held=requested=null;
        arrival=action ? ()=>{
          const ddx=tx-x,ddy=ty-y;
          if (ddx||ddy) face=Math.abs(ddx)>=Math.abs(ddy) ? (ddx<0?1:2) : (ddy<0?3:0);
          paint(x,y,2);
          action();
        } : null;
        schedule();
        return;
      }
      directions.forEach(([dx,dy],direction)=>{
        const nx=current.x+dx,ny=current.y+dy,key=nx+','+ny;
        if (!walkable(nx,ny)||seen.has(key)) return;
        seen.add(key);
        queue.push({x:nx,y:ny,path:[...current.path,direction]});
      });
    }
  }

  function move(direction,token) {
    route=[];
    arrival=null;
    held=token ? {direction,token} : null;
    requested=direction;
    schedule();
  }

  function control(label,action) {
    const el=document.createElement('button');
    el.type='button';
    el.className='btn-s';
    el.textContent=label;
    el.onclick=action;
    return el;
  }

  const pins={};
  for (const target of targets) {
    const [tx,ty]=map.points[target.id];
    live[target.id]=[tx,ty];
    const pin=control('',()=>moveTo(...live[target.id],target.action));
    pins[target.id]=pin;
    pin.classList.add('c2-field-pin');
    pin.setAttribute('aria-label',target.label);
    pin.style.left=(tx+.5)*size+'px';
    pin.style.top=(ty+.72)*size+'px';
    pin.style.zIndex=String(10+ty*10);
    if (target.caption) pin.classList.add('c2-field-extra');
    if (target.art) pin.append(target.art());
    if (target.image) {
      const sprite=document.createElement('img');
      sprite.src=target.image;
      sprite.alt='';
      pin.append(sprite);
    }
    const label=document.createElement('span');
    if(target.job)label.append(Object.assign(document.createElement('small'),{textContent:target.job}));
    label.append(target.caption||target.label);
    pin.append(label);
    world.append(pin);
  }

  window.ChapterNpcWalk?.start({world,size,targets,live,pins,map,walkable,canStand,hero:()=>({x,y,target:segment?[segment.x,segment.y]:null})});
  const stick=control('',()=>{});
  stick.className='c2-field-stick';
  stick.setAttribute('aria-label','이동 조이스틱');
  const knob=document.createElement('span');
  knob.className='c2-field-knob';
  knob.setAttribute('aria-hidden','true');
  stick.append(knob);
  let pointer=null;
  let fallback=null;
  function aim(event) {
    const box=stick.getBoundingClientRect();
    const dx=event.clientX-box.left-box.width/2;
    const dy=event.clientY-box.top-box.height/2;
    const distance=Math.hypot(dx,dy);
    if (distance<9) {
      if (held?.token===stick) {held=null;requested=null;}
      fallback=null;
      knob.style.transform='';
      return;
    }
    const scale=Math.min(1,27/distance);
    knob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;
    const horizontal=dx<0?1:2;
    const vertical=dy<0?3:0;
    const horizontalFirst=Math.abs(dx)>Math.abs(dy);
    const direction=horizontalFirst?horizontal:vertical;
    fallback=Math.min(Math.abs(dx),Math.abs(dy))>=distance*.35 ? (horizontalFirst?vertical:horizontal) : null;
    if (held?.token!==stick || held.direction!==direction) move(direction,stick);
    else schedule();
  }
  stick.onpointerdown=event=>{
    if (event.button!==0 || pointer!==null) return;
    pointer=event.pointerId;
    stick.setPointerCapture(pointer);
    aim(event);
  };
  stick.onpointermove=event=>{if (event.pointerId===pointer) aim(event);};
  const release=event=>{
    if (event.pointerId!==pointer) return;
    pointer=null;
    if (held?.token===stick) held=null;
    fallback=null;
    knob.style.transform='';
  };
  stick.onpointerup=stick.onpointercancel=stick.onlostpointercapture=release;
  controls.append(stick);
  const interact=control('상호작용',()=>{
    const reach=item=>{const [tx,ty]=live[item.id]||map.points[item.id];return Math.max(Math.abs(x-tx),Math.abs(y-ty));};
    const target=targets.filter(item=>reach(item)<=1).sort((a,b)=>reach(a)-reach(b))[0];
    if (target && !segment) target.action();
  });
  controls.append(interact);
  container.onkeydown=event=>{
    const direction=keys.indexOf(event.key);
    if (direction<0 || event.target===destinations) return;
    event.preventDefault();
    if (event.repeat || pressedKeys.includes(event.key)) return;
    pressedKeys.push(event.key);
    move(direction,event.key);
  };
  container.onkeyup=event=>{
    const index=pressedKeys.indexOf(event.key);
    if (index>=0) pressedKeys.splice(index,1);
    if (held?.token!==event.key) return;
    const previous=pressedKeys.at(-1);
    if (previous) move(keys.indexOf(previous),previous);
    else held=null;
  };
  container.onfocusout=event=>{
    if (!container.contains(event.relatedTarget)) {
      held=null;
      pressedKeys.length=0;
    }
  };
  // Press and hold on the map, then drag: the hero walks toward the finger like the joystick.
  let dragId=null,dragStart=null,dragging=false,dragSkipClick=false,dragTimer=0,lastPoint=null;
  viewport.style.touchAction='none';
  const steer=event=>{
    const box=actor.getBoundingClientRect();
    const dx=event.clientX-(box.left+box.width/2);
    const dy=event.clientY-(box.top+box.height/2);
    if (Math.hypot(dx,dy)<size*.6) {
      if (held?.token===viewport) {held=null;requested=null;}
      return;
    }
    const horizontalFirst=Math.abs(dx)>Math.abs(dy);
    const direction=horizontalFirst?(dx<0?1:2):(dy<0?3:0);
    if (held?.token!==viewport || held.direction!==direction) move(direction,viewport);
  };
  const beginDrag=()=>{dragging=true;dragSkipClick=true;if (lastPoint) steer(lastPoint);};
  viewport.addEventListener('pointerdown',event=>{
    if (event.button!==0 || dragId!==null || (event.target!==world && event.target!==actor)) return;
    dragId=event.pointerId;dragStart=[event.clientX,event.clientY];dragging=false;dragSkipClick=false;lastPoint=event;
    dragTimer=setTimeout(beginDrag,220);
  });
  viewport.addEventListener('pointermove',event=>{
    if (event.pointerId!==dragId) return;
    lastPoint=event;
    if (!dragging && Math.hypot(event.clientX-dragStart[0],event.clientY-dragStart[1])>10) {clearTimeout(dragTimer);beginDrag();}
    if (dragging) steer(event);
  });
  const endDrag=event=>{
    if (event.pointerId!==dragId) return;
    clearTimeout(dragTimer);dragId=null;dragging=false;
    if (held?.token===viewport) held=null;
    setTimeout(()=>{dragSkipClick=false;},0);
  };
  viewport.addEventListener('pointerup',endDrag);
  viewport.addEventListener('pointercancel',endDrag);
  world.onclick=event=>{
    if (dragSkipClick) {dragSkipClick=false;return;}
    if (event.target!==world) return;
    const box=world.getBoundingClientRect();
    moveTo(Math.floor((event.clientX-box.left)/size),Math.floor((event.clientY-box.top)/size));
  };
  schedule();
};
