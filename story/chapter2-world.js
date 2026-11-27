/* Optional Chapter II narratives and resident conversations. */
window.createChapterWorld = function(api, data) {
  const {node,button,show,panel,save,recovered,flag,state,townName,visit,available}=api;
  const residents=new Map();
  const townResidents=new Map();
  const addResident=(id,town,en,ko,role)=>{
    if (residents.has(id)) throw new Error('Duplicate resident '+id);
    const boundary=en.lastIndexOf(' ');
    const name=boundary>0?en.slice(boundary+1):en;
    const jobEn=boundary>0?en.slice(0,boundary):'';
    const jobKo={Baker:'제빵사',Miller:'방앗간지기',Courier:'배달부',Gardener:'정원사',Shepherd:'양치기',Cook:'요리사',Waiter:'식당 종업원'}[jobEn];
    const job=jobKo||jobEn;
    const resident={id,town,en,ko,role,name,job};
    residents.set(id,resident);
    if(!townResidents.has(town)) townResidents.set(town,[]);
    townResidents.get(town).push(resident);
  };
  for(const town of data.TOWN_NETWORK.towns) for(const npc of town.new_residents) {
    addResident(npc.id,town.town_id,npc.name_en,npc.name_ko||npc.role_ko,npc.role);
  }
  for(const event of data.DEMON_ARMY_INTRIGUE.events) {
    const npc=event.agent;
    addResident(npc.id,event.town_id,npc.name_en,npc.name_ko);
  }
  const daily=new Map(data.RESIDENT_DAILY_DIALOGUE.residents.map(item=>[item.npc_id,item]));
  const roles=data.RESIDENT_DAILY_DIALOGUE.role_pools;
  const stageStore=()=>state().stages ||= {};
  const cursor=id=>stageStore()[id]||0;
  const label=n=>n ? n.en+' · '+n.ko : '';
  const events=[];
  function lineChunks(text) {
    if(text.chunks?.length>1)return text.chunks;
    const en=text.en.split(/(?<=[.!?])\s+/);
    const ko=text.ko.split(/(?<=[.!?])\s+/);
    return en.length===ko.length&&en.length<=5
      ? en.map((value,i)=>({en:value,ko:ko[i]}))
      : [{en:text.en,ko:text.ko}];
  }
  const localized=(text,speaker)=>{
    const key=text.speaker||speaker;
    const npc=residents.get(key);
    const named=api.speakerName?.(key);
    return {
      ...text,speaker:npc?.ko||named?.ko||key||'이야기',
      speaker_en:npc?.en||named?.en||key||'Narrator',
      speakerName:npc?.name,speakerJob:npc?.job,
      chunks:lineChunks(text),
    };
  };

  function takeStage(step,defaultTown) {
    const npc=step.npc_id||step.npc;
    if(npc&&!residents.has(npc))throw new Error('Unknown quest resident '+npc);
    const task=step.task|| (step.options?step:null);
    if(task&&(!task.question_en||!task.options[task.correct_index]||new Set(task.options).size!==task.options.length)) {
      throw new Error('Malformed quest task '+task.question_en);
    }
    const spoken=step.line||step.dialogue||(step.en?step:null);
    const lines=step.lines|| (spoken?[spoken]:[]);
    return {npc,town:residents.get(npc)?.town||step.town||defaultTown,lines:lines.map(line=>localized(line,npc)),task,field:step.field};
  }

  function add(event,steps,settings={}) {
    if(events.some(existing=>existing.id===event.id))throw new Error('Duplicate event '+event.id);
    const town=event.town_id||event.town||settings.town;
    const stages=steps.map(step=>takeStage(step,town));
    for(const [i,item] of stages.entries())if(!item.town&&i>0)item.town=stages[i-1].town;
    if(!stages.length||stages.some(stage=>!stage.town||(!stage.lines.length&&!stage.task))) {
      throw new Error('Missing event stage '+event.id);
    }
    events.push({id:event.id,title:settings.title||[event.title_en,event.title_ko].filter(Boolean).join(' · '),
      stages,after:event.aftermath,finish:event.completion_flag||settings.finish||event.id+'_complete',
      requires:settings.requires||(()=>true),souvenir:settings.souvenir,group:settings.group||'마을'});
  }
  for(const town of data.TOWN_EVENTS.towns) for(const event of town.events) {
    const souvenir=event.reward?.type==='collection_flag'?{id:event.id,ko:event.reward.name_ko}:null;
    add(event,event.steps,{town:town.town_id,souvenir});
  }
  for(const event of [...data.TOWN_UNIQUE_EVENTS.events,...data.TOWN_RELATIONSHIP_STORIES.events])add(event,event.steps);
  for(const event of data.REGIONAL_STORIES_REVISED.cases) {
    const previous=data.TOWN_NETWORK.chains.find(chain=>chain.id===event.id);
    add(event,event.steps,{title:previous.title_en+' · '+previous.title_ko,group:'지역'});
  }
  for(const event of data.DEMON_ARMY_INTRIGUE.events) {
    const resolution=data.DEMON_ARMY_RESOLUTIONS.cases.find(item=>item.parent===event.id);
    if(!resolution)throw new Error('Missing investigation resolution '+event.id);
    add({...event,aftermath:resolution.aftermath},[...event.steps,...resolution.steps],{
      finish:resolution.steps.at(-1).grant_flag,group:'조사',
    });
  }
  for(const event of data.COMPANION_AND_OFFICER_DEPTH.arcs) {
    add(event,event.scenes,{
      title:event.character+' · 동료 이야기',group:'동료',
      requires:()=>api.companion(event.character)&&event.requires.recovered_towns.every(recovered),
    });
    const lines=event.epilogue?.lines;
    if(lines?.length)add({id:event.id+'_epilogue'},[{town:'library',lines}],{
      title:event.character+' · 동료 후일담',group:'동료',
      requires:()=>flag(event.completion_flag)&&flag(event.epilogue.requires),
    });
  }
  for(const event of data.BOOK_SECRETS_AND_MERCHANTS.quests) {
    add(event,event.steps,{
      title:event.reward.ko+' · 도서 단서',group:'도서',souvenir:event.reward,
      requires:()=>recovered(event.town)&&api.volumeRead(event.volume_id),
    });
  }

  const close=data.CHAPTER2_CLOSURE_AND_EXPLORATION;
  const finaleData=data.CHAPTER2_FINAL_EXPANSION;
  const mainArc=data.DEMON_ARMY_MAIN_ARC;
  for(const scene of mainArc.scenes.filter(item=>!['final_counter','resistance'].includes(item.id))){
    const gates={
      ink_warning:()=>flag('pc_infiltration_verified'),
      cinder_defection:()=>flag('pf_infiltration_verified'),
      vesper_reveal:()=>cursor('cinder_defection')>0&&cursor('ink_warning')>0&&api.pages()===18,
    };
    add(scene,[scene],{title:{vesper_first:'여행자에게 건넨 빵',ink_warning:'잉크의 흔적',
      cinder_defection:'신더의 증언',vesper_reveal:'베스퍼의 고백'}[scene.id],group:'조사',requires:gates[scene.id]});
  }
  for(const event of finaleData.arcs.filter(item=>item.id!=='aftermath')){
    const steps=event.id==='companion_rescue'
      ? event.scenes.map((scene,index)=>index===3?{...scene,lines:[...scene.lines,...close.rescue.lines]}:scene)
      : event.scenes;
    add(event,steps,{group:'대마왕군',requires:event.id==='eve'
      ? ()=>api.pages()===18&&!flag('sanctuary_of_silence_cleared')
      : ()=>event.requires.every(flag)});
  }
  const hideouts=finaleData.lairs;
  const coverage=data.COMPANION_AND_OFFICER_DEPTH.officers;
  for (const lair of hideouts) {
    const officer=coverage.find(entry=>entry.lair===lair.id);
    const preparation=lair.scenes.filter(scene=>scene.id!=='return').map(scene=>({
      ...scene,town:'library',lines:scene.id==='boss'?[...officer.lines,...scene.lines]:scene.lines,
    }));
    add({...lair,id:lair.id+'_briefing'},preparation,{
      group:'숨겨진 던전',requires:()=>lair.unlock.all_verified.every(flag),
    });
    add({...lair,id:lair.id+'_return'},[{town:'library',lines:[
      ...lair.scenes.find(scene=>scene.id==='return').lines,officer.after_clear,
    ]}],{group:'숨겨진 던전',requires:()=>flag(lair.reward.id)});
  }
  const merchants=data.BOOK_SECRETS_AND_MERCHANTS.merchants;
  const stock={
    bread:'등불 식료품점 빵 포장지','repair supplies':'수리점 견본 표찰',
    'chart souvenirs':'항로도 엽서','notebook cosmetics':'제본 견본 표지',
    'festival cosmetics':'꽃 축제 리본','bookmark cosmetics':'기록실 책갈피',
  };
  function shop(merchant,back) {
    const title=merchant.en+' · '+merchant.ko;
    const body=panel(title,back,'주민에게 돌아가기');
    const id='souvenir_'+merchant.id;
    const name=stock[merchant.stock_category];
    const owned=state().souvenirs?.[id];
    body.append(node('p',name+(owned?' · 수집 완료':' · 기념품')));
    if(!owned)body.append(button('기념품 받기',()=>{
      (state().souvenirs ||= {})[id]=name;
      save();shop(merchant,back);
    }));
    body.append(button('상인과 대화',()=>show(title,[localized(merchant.dialogue,merchant.npc)],null,()=>shop(merchant,back),{dock:true,skip:false})));
  }
  const vaultArt=['nbg_05.webp','nbg_08.webp','nbg_10.webp','nbg_04.webp','nbg_12.webp','nbg_20.webp'];
  for(const [index,room] of close.vaults.entries()){
    add(room,[{town:room.town,line:room.entry},{town:room.town,line:room.evidence,task:room.task,field:vaultArt[index]}],{
      group:'숨겨진 장소',requires:()=>flag(room.requires),souvenir:room.reward,
    });
  }

  function nextStep(event,index) {
    const stage=event.stages[index];
    if(!stage)return null;
    const npc=residents.get(stage.npc);
    return {
      town:stage.town,npcId:stage.npc,locked:!canVisit(stage.town),
      text:npc ? `${api.townName(stage.town)}에서 ${npc.en}에게 말을 걸어 보세요.`
        : `${api.townName(stage.town)}에서 ‘${event.title}’${stage.task?'의 단서를 확인하세요.':'을 이어가세요.'}`,
    };
  }
  function guidance() {
    const event=events.find(item=>item.id===state().trackedStory);
    if(!event||!event.requires()||flag(event.finish))return null;
    const next=nextStep(event,cursor(event.id));
    return next&&{...next,title:event.title};
  }

  function openQuest(event,index,back,portrait) {
    if(index>cursor(event.id)||!event.requires())return;
    const stage=event.stages[index];
    if(!stage||!canVisit(stage.town))return;
    const replay=index<cursor(event.id)||flag(event.finish);
    const proceed=()=>{
      if(!replay&&index===cursor(event.id)){
        stageStore()[event.id]=index+1;
        state().trackedStory=event.id;
        if(index===event.stages.length-1){
          state().flags[event.finish]=true;
          if(event.souvenir)(state().souvenirs ||= {})[event.souvenir.id]=event.souvenir.ko;
        }
        save();
      }
      back();
    };
    const ask=()=>{
      const task=stage.task;
      const body=panel(event.title,back,'돌아가기');
      const status=node('p');status.setAttribute('role','status');
      const question=node('p',task.question_en);question.lang='en';body.append(question);
      if(task.question_ko&&api.koreanVisible?.())body.append(node('p',task.question_ko));
      const row=node('div',undefined,'c2-actions');
      for(const [i,option] of task.options.entries())row.append(button(option,()=>{
        if(i===task.correct_index)proceed();
        else status.textContent=task.retry_ko||task.feedback_ko||'앞서 들은 단서를 다시 확인하세요.';
      }));
      body.append(row,status);
    };
    const openEvidence=()=>{
      if(stage.lines.length)show(event.title,stage.lines,stage.task?null:proceed,stage.task?ask:null,{skip:false,cancel:back,dock:!!stage.npc,field:portrait,confirm:true,
        questTitle:event.title,
        nextHint:stage.task?'이 대화를 마치면 단서를 확인하는 문제가 나옵니다.'
          : nextStep(event,index+1)?.text||'이야기가 마무리됩니다.'});
      else ask();
    };
    if(stage.field&&api.field){
      const body=panel(event.title,back,'마을로');
      const map={image:stage.field,spawn:[7,7],points:{chest:[7,3]},tiles:[
        '###############','###############','###############','#####.....#####','#####.....#####',
        '####.......####','###.........###','###.........###','###############',
      ]};
      api.field(body,map,[{id:'chest',label:'보물함 조사',action:openEvidence,
        art:()=>node('div',undefined,'c2-chest-art')}]);
    }else openEvidence();
  }

  const canVisit=town=>town==='library'||available(town);
  const ready=event=>event.requires()&&!flag(event.finish);
  const active=(town,npc)=>events.filter(event=>{
    if(!ready(event))return false;
    const stage=event.stages[cursor(event.id)];
    return stage?.town===town&&(!npc||stage.npc===npc);
  });
  function dailyLine(npc,back,portrait) {
    const record=daily.get(npc.id);
    if(!record)return;
    const seen=new Set();
    const lines=[...record.personal_dialogue||[],record.idle,record.local_topic,...roles[record.role_pool]||[]].filter(line=>{
      if(!line?.en||seen.has(line.en))return false;
      seen.add(line.en);return true;
    });
    const bags=state().dialogueBags ||= {};
    let queue=(bags[npc.id]||[]).filter(i=>i>=0&&i<lines.length);
    if(!queue.length)queue=api.shuffle(lines.map((_,i)=>i));
    if(!queue.length)return;
    const index=queue.shift();
    bags[npc.id]=queue;save();
    show(label(npc),[localized(lines[index],npc.id)],null,back,{dock:true,field:portrait,skip:false});
  }
  function resident(npc,back) {
    const body=panel(label(npc),back,'주민 목록으로');
    for(const event of active(npc.town,npc.id))body.append(button(event.title,()=>openQuest(event,cursor(event.id),()=>resident(npc,back),api.portraitFor?.(npc.id))));
    for(const event of events)if(flag(event.finish)&&event.after?.npc===npc.id) {
      body.append(button(event.title+' · 후일담',()=>show(event.title,[localized(event.after,npc.id)],null,()=>resident(npc,back),{dock:true,field:api.portraitFor?.(npc.id),questTitle:event.title,skip:false})));
    }
    if(daily.has(npc.id)&&recovered(npc.town))body.append(button('일상 대화',()=>dailyLine(npc,()=>resident(npc,back))));
    for(const merchant of merchants.filter(item=>item.npc===npc.id&&flag(item.requires))){
      body.append(button(merchant.ko,()=>shop(merchant,()=>resident(npc,back))));
    }
    const aftermath=close.aftermath.find(item=>item.npc===npc.id&&
      item.requires.every(requirement=>requirement==='town_recovered'?recovered(npc.town):flag(requirement)));
    if(aftermath)body.append(button('마을 후일담',()=>show(label(npc),[localized(aftermath,npc.id)],null,()=>resident(npc,back),{dock:true,skip:false})));
  }
  function town(townId,back) {
    const body=panel(townName(townId)+' · 주민',back,'마을 이야기로');
    for(const npc of townResidents.get(townId)||[]) {
      body.append(button(label(npc),()=>resident(npc,()=>town(townId,back))));
    }
    for(const event of active(townId).filter(item=>!item.stages[cursor(item.id)].npc)){
      body.append(button(event.title,()=>openQuest(event,cursor(event.id),()=>town(townId,back))));
    }
  }

  function journal(back) {
    const body=panel('Chapter II 이야기 일지',back,'돌아가기');
    const list=node('div');
    for(const event of events.filter(item=>cursor(item.id)||flag(item.finish)||item.stages[0].town==='library'&&ready(item))){
      const index=cursor(event.id);
      const stage=event.stages[index];
      const record=node('details');
      record.append(node('summary',event.group+' · '+event.title+(flag(event.finish)?' · 완료':'')));
      if(stage&&!flag(event.finish)){
        record.append(node('p',townName(stage.town)+(stage.npc?' · '+label(residents.get(stage.npc)):'')));
        if(stage.town==='library'&&event.requires())record.append(button('이야기 보기',()=>openQuest(event,index,()=>journal(back))));
        else if(canVisit(stage.town))record.append(button('마을 방문',()=>visit(stage.town)));
        else record.append(node('p','아직 방문할 수 없는 지역입니다.'));
      }
      for(const [stepIndex,step] of event.stages.slice(0,index).entries())if(step.lines.length) {
        record.append(button((stepIndex+1)+'번째 기록 읽기',()=>show(event.title,step.lines,null,()=>journal(back))));
      }
      list.append(record);
    }
    body.append(list);
    for (const lair of hideouts.filter(entry=>flag(entry.id+'_briefing_complete')&&!flag(entry.reward.id))) {
      body.append(button(lair.title_ko+' 입장',()=>api.startHideout(lair.id,()=>journal(back))));
    }
    const souvenirs=Object.values(state().souvenirs||{});
    if(souvenirs.length)body.append(node('p','수집품 · '+souvenirs.join(' · ')));
  }

  function finaleOpening() {
    const ids=new Set(['arrival','reveal','answer']);
    const support=mainArc.support.filter(item=>flag(item.requires)).map(item=>({
      speaker:'Lexion',en:item.en+' helped us reach this place.',ko:item.ko+' 덕분에 여기까지 올 수 있었네.',
      direct_chunks:[{en:item.en,ko:item.ko},{en:'helped',ko:'도왔어'},{en:'us',ko:'우리가'},{en:'reach',ko:'도착하도록'},{en:'this place.',ko:'이곳에.'}],
    }));
    return [...close.finale.filter(line=>ids.has(line.id)),...support].map(line=>localized(line));
  }
  function finaleClosing() {
    const ids=new Set(['victory','victory2','return','end']);
    const ending=close.finale.filter(line=>ids.has(line.id));
    const aftermath=finaleData.arcs.find(event=>event.id==='aftermath').scenes[0].lines;
    return [...ending,...aftermath].map(line=>localized(line));
  }
  function finalePhase(index) {
    const line=close.finale.find(item=>item.id==='phase'+(index+1));
    return line&&localized(line);
  }
  function meetResident(id,portrait,back,guide=false) {
    const npc=residents.get(id);
    if(!npc)return;
    const routes=active(npc.town,id);
    const tracked=routes.find(route=>route.id===state().trackedStory);
    if(guide&&tracked){openQuest(tracked,cursor(tracked.id),back,portrait);return;}
    const talk=()=>{
      if(daily.has(id)){dailyLine(npc,null,portrait);return;}
      const greeting={
        en:'I am staying in this town. We may speak again later.',
        ko:'이 마을에 머물고 있어요. 나중에 다시 이야기할 수도 있겠군요.',
        chunks:[{en:'I am staying in this town.',ko:'이 마을에 머물고 있어요.'},{en:'We may speak again later.',ko:'나중에 다시 이야기할 수도 있겠군요.'}],
      };
      show(label(npc),[localized(greeting,id)],null,null,{field:portrait,skip:false});
    };
    if(!routes.length){talk();return;}
    const {body,close}=api.conversationMenu(npc);
    body.append(button('일반 대화',()=>{close();talk();}));
    body.append(node('p','퀘스트 대화','c2-talk-label'));
    for(const event of routes){
      body.append(button(event.title,()=>{close();openQuest(event,cursor(event.id),back,portrait);}));
    }
  }
  const residentsForTown=id=>townResidents.get(id)||[];
  return {town,journal,finaleOpening,finaleClosing,finalePhase,meetResident,residentsForTown,guidance};
};
