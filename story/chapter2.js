/* Chapter II uses the live town and clear records from index.html. */
(() => {
  'use strict';

  const modes = { literal:'직독직해', english:'영어 전용' };
  const preferencesKey = 'grammar-saga.chapter2.dialogue';
  let story;
  let naming;
  let episodes = new Map();
  let specialQuests = new Map();
  let specialPalette;
  let libraryData;
  let expansion;
  let serialReading;
  let chapterWorld;
  const hideoutDungeons=new Map();
  let dataReady=false;
  let dialogue;
  let reading = {mode:'literal', color:true, slash:true};
  try {
    const saved = JSON.parse(localStorage.getItem(preferencesKey) || '{}');
    if (Object.hasOwn(modes,saved.mode)) reading.mode=saved.mode;
    for (const key of ['color','slash']) if (typeof saved[key] === 'boolean') reading[key]=saved[key];
  } catch {}

  function displayName(english,korean) {
    return english ? english+' · '+korean : korean;
  }

  const titleFor=episode=>displayName(episode.title_en,episode.title);
  const townFor=episode=>displayName(episode.town_en,episode.town);

  function node(tag, value, className) {
    const el = document.createElement(tag);
    if (value !== undefined) el.textContent = value;
    if (className) el.className = className;
    return el;
  }

  function button(label, action) {
    const el=node('button',label,'btn-s');
    el.type='button';
    el.addEventListener('click',action);
    return el;
  }

  function persistReading() {
    try { localStorage.setItem(preferencesKey,JSON.stringify(reading)); } catch {}
  }

  function closeDialogue() {
    window.speechSynthesis?.cancel();
    dialogue.close();
    dialogue.remove();
    dialogue=null;
  }

  function modeSelect() {
    const select=node('select');
    select.setAttribute('aria-label','대화 표시 모드');
    for (const [key,label] of Object.entries(modes)) select.add(new Option(label,key,key===reading.mode,key===reading.mode));
    return select;
  }

  function dialogueSettings(back) {
    const body=worldPanel('대화 설정',back,'닫기');
    const select=modeSelect();
    select.onchange=()=>{reading.mode=select.value;persistReading();};
    body.append(select);
  }

  function show(title, lines, done, back, options = {}) {
    const docked=!!(options.field||options.dock);
    const field=docked ? dialogue : null;
    if (!field && dialogue?.open) closeDialogue();
    dialogue=node('dialog',undefined,docked?'c2-dialog c2-field-dialogue':'c2-dialog');
    if(docked&&options.questTitle)dialogue.classList.add('c2-quest-dialogue');
    dialogue.setAttribute('aria-label',docked ? displayName(lines[0].speaker_en,lines[0].speaker) : title);
    document.body.append(dialogue);
    let index=0;
    const dismiss=()=>{
      closeDialogue();
      if (field?.open) dialogue=field;
    };
    const finish=() => { dismiss(); done?.(); back?.(); };
    const leave=() => { dismiss(); (options.cancel||back)?.(); };
    dialogue.addEventListener('cancel', event => {
      event.preventDefault();
      if (docked && index===lines.length-1) finish();
      else leave();
    });
    if (docked) dialogue.addEventListener('click',event=>{
      if (event.target!==event.currentTarget) return;
      const {left,right,top,bottom}=event.currentTarget.getBoundingClientRect();
      if (event.clientX>=left && event.clientX<=right && event.clientY>=top && event.clientY<=bottom) return;
      if (index===lines.length-1) finish();
      else leave();
    });
    const section=node('div',undefined,'c2-body');
    dialogue.append(section);
    const speech = window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function';

    function renderLine() {
      const line=lines[index];
      const mode=reading.mode;
      const controls=node('div',undefined,'c2-actions');
      const select=modeSelect();
      select.onchange=()=>{reading.mode=select.value;persistReading();renderLine();section.querySelector('select').focus();};
      controls.append(select);
      for (const [key,label] of [['color','색상'],['slash','슬래시']]) {
        const toggle=button(label,()=>{
          reading[key]=!reading[key];persistReading();renderLine();
          section.querySelector('[data-setting="'+key+'"]').focus();
        });
        toggle.dataset.setting=key;
        toggle.setAttribute('aria-pressed',String(reading[key]));
        toggle.disabled=mode!=='literal';
        controls.append(toggle);
      }
      const content=node('div',undefined,'c2-lines');
      content.setAttribute('aria-live','polite');
      const speaker=node('strong',line.speakerName||displayName(line.speaker_en,line.speaker),'c2-speaker-name');
      if (docked) {
        const header=node('div',undefined,'c2-field-speaker');
        if (options.field) {
          const portrait=node('img');
          const art=/art\/npc\/sprites\/(npc_[\w]+)\.webp$/.exec(options.field);
          portrait.src=art?'art/npc/face/'+art[1]+'.webp':options.field;
          portrait.alt='';
          const frame=node('div',undefined,'c2-speaker-photo'+(art?' is-art':''));
          frame.append(portrait);
          header.append(frame);
        }
        const identity=node('div',undefined,'c2-speaker-identity');
        identity.append(node('span',options.questTitle?'퀘스트 대화':'일반 대화','c2-talk-label'));
        if(options.questTitle)identity.append(node('span',options.questTitle,'c2-dialogue-quest-title'));
        if(line.speakerJob)identity.append(node('span',line.speakerJob,'c2-speaker-job'));
        identity.append(speaker);
        header.append(identity);
        content.append(header);
      } else content.append(speaker);
      const languages=mode==='english' ? ['en'] : ['en','ko'];
      for (const language of languages) {
        const p=node('p',undefined,'c2-line');
        p.lang=language;
        if (mode==='literal') (line.direct_chunks||line.chunks).forEach((chunk,i)=>{
          if (i) p.append(reading.slash ? ' / ' : ' ');
          const span=node('span',chunk[language]);
          if (reading.color) span.style.color=(options.palette||story.palette)[i%(options.palette||story.palette).length];
          p.append(span);
        });
        else p.textContent=line[language];
        content.append(p);
      }
      const actions=node('div',undefined,'c2-actions');
      const audio=button('영어 듣기',()=>{
        window.speechSynthesis.cancel();
        const utterance=new SpeechSynthesisUtterance(line.en);
        utterance.lang='en-US';
        window.speechSynthesis.speak(utterance);
      });
      audio.disabled=!speech;
      const previous=button('이전',()=>{index--;window.speechSynthesis?.cancel();renderLine();section.querySelector('[data-advance]').focus();});
      previous.disabled=index===0;
      const advance=button(index===lines.length-1?(docked&&!options.confirm?'닫기':'완료'):'다음',()=>{
        if (index===lines.length-1) finish();
        else {index++;window.speechSynthesis?.cancel();renderLine();section.querySelector('[data-advance]').focus();}
      });
      advance.dataset.advance='';
      actions.append(audio);
      if (!docked || lines.length>1) actions.append(previous);
      actions.append(advance);
      if (options.skip!==false) actions.append(button('건너뛰기',finish));
      if (!docked || options.confirm || index<lines.length-1) actions.append(button('닫기',leave));
      if (docked) section.replaceChildren(content,controls,actions);
      else section.replaceChildren(node('h2',title),node('p',`${index+1} / ${lines.length}`),controls,content,actions);
      if (options.nextHint && index===lines.length-1) {
        const hint=node('p',options.nextHint,'c2-next-step');
        hint.setAttribute('aria-label','다음 이야기 안내');
        actions.before(hint);
      }
      if (options.art?.image) {
        const art=node('img',undefined,'c2-scene-art');
        art.alt='';
        art.src=options.art.image;
        controls.before(art);
      } else if (options.art?.mon) {
        const art=node('div',undefined,'c2-portrait');
        art.innerHTML=sp(options.art.mon,'','MON');
        controls.before(art);
        fill(art);
      }
    }
    renderLine();
    dialogue.showModal();
  }

  function progress() {
    return SV.chapter2 || {episodes:{}, seenEvents:{}};
  }

  function episodeState(id) {
    return progress().episodes?.[id] || {};
  }

  function update(id, changes) {
    const state=SV.chapter2 ||= {episodes:{}, seenEvents:{}};
    if (id) {
      const item=(state.episodes ||= {})[id] ||= {accepted:false,rewardClaimed:false,registered:false,seenEvents:{}};
      Object.assign(item,changes);
    } else Object.assign(state.seenEvents ||= {},changes);
    saveNow();
  }

  function rememberEpisode(id, event) {
    update(id,{seenEvents:{...episodeState(id).seenEvents,[event]:true}});
  }

  function registeredCount() {
    return [...episodes.keys()].filter(id=>episodeState(id).registered).length;
  }

  function hubPanel(title, back) {
    closeDialogueIfOpen();
    dialogue=node('dialog',undefined,'c2-dialog');
    dialogue.setAttribute('aria-label',title);
    const body=node('div',undefined,'c2-body');
    const leave=back || closeDialogue;
    dialogue.append(body);
    dialogue.addEventListener('cancel',event=>{event.preventDefault();leave();});
    document.body.append(dialogue);
    body.append(node('h2',title),button(back?'대도서관으로':'닫기',leave));
    dialogue.showModal();
    return body;
  }

  function conversationMenu(npc) {
    const field=dialogue;
    dialogue=node('dialog',undefined,'c2-dialog c2-field-dialogue c2-talk-menu');
    dialogue.setAttribute('aria-label',npc.en+' 대화 선택');
    const body=node('div',undefined,'c2-body');
    const close=()=>{
      closeDialogue();
      if(field?.open)dialogue=field;
    };
    const title=node('h2',npc.name,'c2-speaker-name');
    if(npc.job)title.prepend(node('span',npc.job+' ','c2-speaker-job'));
    body.append(title,button('닫기',close));
    dialogue.append(body);
    dialogue.addEventListener('cancel',event=>{event.preventDefault();close();});
    document.body.append(dialogue);
    dialogue.showModal();
    return {body,close};
  }

  function worldProgress() {
    const world=SV.chapter2World ||= {version:1};
    world.flags ||= {};
    return world;
  }

  function worldFlag(id) {
    if (id==='sanctuary_of_silence_cleared') {
      return !!finaleDungeon && twCleared(finaleDungeon.id);
    }
    return !!worldProgress().flags?.[id];
  }

  function worldPanel(title,back,backLabel) {
    const body=hubPanel(title,back);
    if (backLabel) body.querySelector('button').textContent=backLabel;
    return body;
  }

  function saveWorld() {
    saveNow();
    try {
      return JSON.stringify(JSON.parse(lsg('sg_save_'+G.name)||'{}').chapter2World)===JSON.stringify(SV.chapter2World);
    } catch { return false; }
  }

  async function loadSerialReading() {
    const catalogues=await Promise.all([
      'LIBRARY_SERIAL_BOOKS','LIBRARY_SERIAL_EXPANSION_A','LIBRARY_SERIAL_EXPANSION_B',
    ].map(file=>loadData('story/'+file+'.json')));
    serialReading=window.createChapterReading({
      node,button,show,library,panel:worldPanel,chapter:worldProgress,pages:registeredCount,
      recovered:twCleared,flag:worldFlag,save:saveWorld,player:()=>G.name,
      townName:id=>townFor(episodes.get(id)),
      field:(body,map,targets)=>window.openChapterField(body,map,isRpgM()?rhero():lhero(),targets),
    },catalogues);
  }

  async function loadChapterWorld() {
    const files=['TOWN_NETWORK','TOWN_EVENTS','TOWN_UNIQUE_EVENTS','TOWN_RELATIONSHIP_STORIES',
      'REGIONAL_STORIES_REVISED','RESIDENT_DAILY_DIALOGUE','DEMON_ARMY_INTRIGUE','DEMON_ARMY_RESOLUTIONS',
      'DEMON_ARMY_MAIN_ARC','COMPANION_AND_OFFICER_DEPTH','BOOK_SECRETS_AND_MERCHANTS',
      'CHAPTER2_CLOSURE_AND_EXPLORATION','CHAPTER2_FINAL_EXPANSION','CHAPTER2_REVIEW_AND_COMPANIONS'];
    const data=Object.fromEntries(await Promise.all(files.map(async key=>[key,await loadData('story/'+key+'.json')])));
    chapterWorld=window.createChapterWorld({
      node,button,show,panel:worldPanel,save:saveWorld,state:worldProgress,flag:worldFlag,
      recovered:twCleared,available:wmUnlocked,visit:visitTown,shuffle,pages:registeredCount,
      speakerName:key=>naming.characters[key]||Object.values(naming.characters).find(name=>name.en===key)||
        (key==='Subject'?{en:G.name,ko:'모험가'}:null),
      townName:id=>id==='library'?'그래머 대도서관':townFor(episodes.get(id)),
      companion:key=>{
        const unit=companionIds[key];
        return unit==='tank'||(unit==='pet'?!!PETS[SV.pet]:DUNGEONS.some(d=>twCleared(d.id)&&d.need?.includes(unit)));
      },
      volumeRead:id=>!!worldProgress().reading?.read?.[id],startHideout,
      field:(body,map,targets)=>window.openChapterField(body,map,isRpgM()?rhero():lhero(),targets),
      koreanVisible:()=>reading.mode!=='english',conversationMenu,portraitFor:extraPortrait,
    },data);
    registerHideouts(data.CHAPTER2_FINAL_EXPANSION.lairs);
  }

  function library() {
    const title=libraryData ? displayName(libraryData.name_en,libraryData.name_ko) : '그래머 대도서관';
    const body=hubPanel(title);
    const seen=progress().seenEvents || {};
    const librarian=displayName(story.library_intro[0].speaker_en,'대사서 렉시온');
    body.append(node('p',librarian+' · 그라마티카 등록 '+registeredCount()+' / 18'));
    if (seen.finaleTitle && expansion) body.append(node('p',displayName(expansion.finale.reward.title_en,expansion.finale.reward.title_ko)));
    const menu=node('div',undefined,'c2-actions');
    menu.append(button(seen.intro?'오프닝 다시 보기':'Chapter II 오프닝',()=>show('The Lost Pages',story.intro,()=>update(null,{intro:true}),library)),
      button(seen.library?'렉시온 대화 다시 보기':'렉시온과 대화',()=>show(librarian,story.library_intro,()=>update(null,{library:true}),library)));
    for (const room of libraryData?.rooms || []) menu.append(button(displayName(room.en,room.ko),()=>libraryRoom(room.id)));
    if (serialReading) menu.append(button('대도서관 열람실',serialReading.readingRoom));
    body.append(menu);
  }

  function libraryLine(entry) {
    return {...entry,speaker:'대사서 렉시온',speaker_en:'Lexion',ko:entry.ko_direct};
  }

  function visitTown(id) {
    closeDialogue();
    twOpen(id);
  }

  function libraryRoom(id) {
    const room=libraryData.rooms.find(item=>item.id===id);
    const body=hubPanel(displayName(room.en,room.ko),library);
    const back=()=>libraryRoom(id);
    const read=(title,lines)=>show(title,lines.map(libraryLine),null,back,{palette:libraryData.palette,gloss:'direct'});
    if (id==='grammatica') {
      body.append(node('p','그라마티카 등록 '+registeredCount()+' / 18'));
      const pending=libraryData.pages.filter(page=>episodeState(page.town_id).rewardClaimed && !episodeState(page.town_id).registered);
      if (pending.length) body.append(button('가져온 페이지 모두 등록',()=>{
        for (const page of pending) update(page.town_id,{registered:true});
        back();
      }));
      const pages=node('ol');
      for (const page of libraryData.pages) {
        const episode=episodes.get(page.town_id);
        const saved=episodeState(page.town_id);
        const item=node('li',displayName(page.en,page.ko)+' · '+(saved.registered?'등록됨':saved.rewardClaimed?'등록 가능':'미수집'));
        if (saved.registered) item.append(' ',button('회복 기록 보기',()=>show(displayName(page.en,page.ko),[episode.completion],null,back)));
        else if (saved.rewardClaimed) item.append(' ',button('등록',()=>{update(page.town_id,{registered:true});back();}));
        item.append(' ',button(townFor(episode)+' 방문',()=>visitTown(episode.id)));
        pages.append(item);
      }
      body.append(pages);
    } else if (id==='grammar') {
      const list=node('div',undefined,'c2-actions');
      function openTopic(item) {
        const topic=hubPanel(item.title_ko,back);
        topic.querySelector('button').textContent='문법 자료실로';
        topic.append(node('p',item.rule_ko),
          button('이중 언어 예문',()=>show(item.title_ko,item.examples.map(libraryLine),null,()=>openTopic(item),{palette:libraryData.palette,gloss:'direct'})));
        const field=taskField({question_en:item.review.question_en,question_ko:''});
        const feedback=feedbackBox();
        const choices=node('div',undefined,'c2-actions');
        item.review.options.forEach((option,i)=>choices.append(button(option,()=>{
          feedback.textContent=i===item.review.correct_index ? item.review.feedback_ko : '다시 골라 보세요.';
        })));
        field.append(choices,feedback);
        topic.append(field);
      }
      for (const item of libraryData.grammar) list.append(button(item.title_ko,()=>openTopic(item)));
      body.append(list);
    } else if (id==='world') {
      for (const item of libraryData.world) {
        const entry=node('details');
        entry.append(node('summary',displayName(item.name_en,item.name_ko)),node('p',item.grammar+' · '+item.quest_en));
        const residents=node('ul');
        for (const resident of item.residents) residents.append(node('li',displayName(resident.en,resident.ko)));
        entry.append(residents);
        if (SV.town?.[item.town_id]?.b || SV.town?.[item.town_id]?.h || twCleared(item.town_id)) {
          const premise=specialQuests.get(item.town_id)?.premise_ko;
          if (premise) entry.append(node('p',premise));
        }
        entry.append(button('마을 방문',()=>visitTown(item.town_id)));
        body.append(entry);
      }
    } else if (id==='monsters') {
      for (const item of libraryData.monsters) {
        const entry=node('details');
        const episode=episodes.get(item.town_id);
        entry.append(node('summary',townFor(episode)+' · '+(twCleared(item.town_id)?displayName(item.boss_en,item.boss_ko):'미확인')));
        if (twCleared(item.town_id)) {
          const live=GRMAP[item.town_id];
          const portrait=node('div',undefined,'c2-portrait');
          portrait.innerHTML=sp(live.boss.mon,'','MON');
          fill(portrait);
          const stats=estats(RT[item.town_id],true);
          entry.append(portrait,node('p',`RPG 보스 기본 능력치 · 체력 ${stats.hp} · 공격력 ${stats.atk}`),
            node('p','등장 몬스터 · '+live.mons.map(key=>MNAME[key]||key).join(', ')));
        } else entry.append(node('p','기존 던전을 클리어하면 기록이 열립니다.'));
        body.append(entry);
      }
    } else if (id==='journal') {
      body.append(button('특별 퀘스트 일지',()=>specialJournal(undefined,back)));
      if (serialReading) body.append(button('모험가의 수첩',()=>serialReading.notebook(back)));
      if (chapterWorld) body.append(button('이야기 일지',()=>chapterWorld.journal(back)));
      for (const companion of expansion?.companions || []) {
        const seen=episodeState(companion.quest.town_id).seenEvents?.['companion:'+companion.character_key];
        body.append(node('p',displayName(companion.character_key,companion.name_ko)+' · '+(seen?companion.quest.title_en:'동료 기록 미발견')));
      }
    } else if (id==='secret') {
      const count=registeredCount();
      const seen=progress().seenEvents || {};
      const eligible=libraryData.secrets.filter(record=>count>=record.registered_pages).sort((a,b)=>a.registered_pages-b.registered_pages);
      const next=eligible.find(record=>!seen['milestone'+record.milestone_ref]);
      for (const record of libraryData.secrets) {
        const title=displayName(record.title_en,record.title_ko);
        const key='milestone'+record.milestone_ref;
        if (seen[key] && count>=record.registered_pages) body.append(button(title+' 다시 보기',()=>read(title,[record.record])));
        else if (record===next) body.append(button(title,()=>show(title,story.milestones[record.milestone_ref],()=>update(null,{[key]:true}),back)));
        else body.append(node('p',record.registered_pages+' / 18 · 기록 잠김'));
      }
      if (twCleared(libraryData.optional_nova_card.source_dungeon)) {
        body.append(button('노바의 대출 카드 · 비밀 기록',()=>read('노바의 대출 카드',[libraryData.optional_nova_card.bonus_record])));
      }
      if (count===18 && expansion) {
        body.append(button('Sanctuary of Silence · 침묵의 성역',()=>startFinale(back)));
        if (seen.finaleEnding) body.append(button('Chapter II 엔딩 다시 보기',()=>showEnding(back)),
          node('p','다음 이야기 · '+expansion.finale.next_chapter.title_en));
      }
    }
  }

  function closeDialogueIfOpen() {
    if (dialogue?.open) closeDialogue();
  }

  const meadowId='g1';
  const drawEncounterDistance=()=>6+Math.floor(Math.random()*6);

  function originalResidentIdentity(resident) {
    const en=resident.name_en||resident.name;
    const boundary=en.lastIndexOf(' ');
    const job=en.slice(0,boundary);
    const names={Farmer:'농부',Herbalist:'약초상',Chef:'요리사',Baker:'제빵사',Postman:'우체부',
      Foreman:'반장',Runner:'달리기 선수',Captain:'대장',Ranger:'숲지기',Librarian:'사서',
      Mechanic:'정비공',Hunter:'사냥꾼',Traveler:'여행자',Guard:'경비병',Cleaner:'청소부',
      Landlord:'여관 주인',Student:'학생',Clockmaker:'시계공',Gourmet:'미식가',Fisher:'어부',
      Coach:'코치',Mayor:'마을 대표',Walker:'산책객',Falconer:'매사냥꾼',Merchant:'상인',
      Teacher:'교사',Bookseller:'책방 주인','Fruit Seller':'과일 상인',Sailor:'선원',
      Swimmer:'수영 선수',Linguist:'언어학자','Chess Master':'체스 명인',Birdwatcher:'탐조가',
      Florist:'꽃집 주인',Keeper:'관리인',Detective:'탐정',Guide:'안내인',Officer:'장교',Artist:'화가'};
    return names[job]?{name:en.slice(boundary+1),job:names[job]}:{name:en};
  }

  function townDialogue(episode,resident,portrait) {
    const recovered=twCleared(episode.id)||SV.town?.[episode.id]?.q?.[resident.index];
    const identity=originalResidentIdentity(resident);
    const line=recovered?resident.after_recovery:resident.before_problem;
    show(titleFor(episode),[{...line,speakerName:identity.name,speakerJob:identity.job}],()=>{
      if (!episodeState(episode.id).accepted) update(episode.id,{accepted:true});
      rememberEpisode(episode.id,`resident-${resident.index}-${recovered?'after':'before'}`);
    },undefined,{skip:false,field:portrait,dock:true});
  }

  function activeMeadow() {
    const state=G.c2Meadow;
    if (!state || state.rpg!==isRpgM()) return null;
    if (state.pending) return state;
    const run=state.rpg ? G.rp : G.run?.[0];
    return run?.c2Meadow===state ? state : null;
  }

  function meadowIndex(state) {
    return state.rpg ? G.rp.ei : G.ei;
  }

  function meadowEnemies(state) {
    return state.rpg ? G.rp.en : G.run;
  }

  function meadowRemaining(state) {
    if (!state || state.pending) return null;
    return meadowEnemies(state).slice(meadowIndex(state)).filter(enemy=>!enemy.boss).length;
  }

  function saveMeadow(state) {
    // RPG's standard run saver only runs in its battle screen.
    if (state.rpg) {
      const screen=G.scr;
      G.scr='rbattle';
      try {rpgSaveRun();} finally {G.scr=screen;}
    } else saveRun();
  }

  function beginMeadowFight(position, guardian) {
    const state=activeMeadow();
    if (guardian && (!state || meadowRemaining(state)!==0)) return false;
    closeDialogue();
    if (state) {
      state.position=position;
      state.onField=false;
      state.lastFight=meadowIndex(state);
      state.steps=drawEncounterDistance();
      G.scr=state.rpg?'rbattle':'battle';
      saveMeadow(state);
      render();
      return true;
    }
    const rpg=isRpgM();
    G.c2Meadow={rpg,pending:true,onField:false,lastFight:0,position,steps:drawEncounterDistance()};
    G.tw=null;
    const dungeon=DUNGEONS.find(d=>d.id===meadowId);
    if (rpg) rpgStart(dungeon);
    else {
      G.dg=dungeon;
      G.mates=dungeon.need.slice();
      G.pets=1;
      G.clearPaid=false;
      G.fails=0;
      G.scr='formed';
      render();
    }
    return true;
  }

  // 새 NPC 그림(art/npc)이 검사를 통과해 등록되어 있으면 그것을 쓰고, 없으면 기존 그림으로 대체합니다.
  function npcArt(episode,index) {
    return window.NPC_ATLAS?.[`${episode.id}_o${index}`]||null;
  }
  const artFront=e=>e?.front?.ready?e.front.sheet:null;
  const artWalk=e=>e?.walk?.ready?e.walk:null;

  function residentTargets(episode,portraitFor) {
    return episode.residents.map(resident=>{
      const art=npcArt(episode,resident.index);
      const image=artFront(art)||portraitFor(resident.index);
      const identity=originalResidentIdentity(resident);
      return {
        id:'npc'+resident.index,
        label:displayName(resident.name_en,resident.name),
        image,caption:identity.name,job:identity.job,
        walk:artWalk(art),
        action:()=>townDialogue(episode,resident,image),
      };
    });
  }

  function openTownField(episode) {
    if (episode.id===meadowId) bevilleField('town');
    else {
      const map=window.chapterFields?.villages?.[episode.id];
      if(map)villageField(episode,map);
    }
  }

  function townTravel(current,back) {
    const list=worldPanel('다른 마을로 이동',back,'현재 마을로');
    for(const episode of episodes.values()){
      if(episode.id===current.id)continue;
      const access=wmUnlocked(episode.id);
      const entry=button(townFor(episode)+(access?'':' · 잠김'),()=>{
        if(!wmUnlocked(episode.id))return;
        closeDialogue();
        twOpen(episode.id);
        openTownField(episode);
      });
      entry.disabled=!access;
      list.append(entry);
    }
  }

  function townFieldActions(body,episode,back) {
    const actions=node('div',undefined,'c2-actions');
    if(chapterWorld)actions.append(button('다른 주민 만나기',()=>chapterWorld.town(episode.id,back)));
    actions.append(button('다른 마을로 이동',()=>townTravel(episode,back)),button('대화 설정',()=>dialogueSettings(back)));
    body.append(actions);
  }

  function showTownGuidance(body,episode) {
    const guide=chapterWorld?.guidance();
    if(!guide)return;
    const notice=node('div',undefined,'c2-next-step');
    notice.append(node('strong',guide.title),node('p',guide.text));
    if(guide.locked)notice.append(node('p','이 마을을 개방하면 계속할 수 있어요.'));
    else if(guide.town===episode.id&&guide.npcId){
      notice.append(button('다음 주민에게 가기',()=>{
        const select=body.querySelector('select[aria-label="탐험 목적지"]');
        if(!select)return;
        select.value=guide.npcId;
        select.dispatchEvent(new CustomEvent('change',{detail:{guide:true}}));
      }));
    }else if(guide.town==='library'){
      notice.append(button('대도서관으로',library));
    }else if(guide.town!==episode.id){
      const target=episodes.get(guide.town);
      if(target)notice.append(button('다음 마을로 이동',()=>{
        if(!wmUnlocked(target.id))return;
        closeDialogue();twOpen(target.id);openTownField(target);
      }));
    }else notice.append(button('이야기 이어가기',()=>chapterWorld.town(episode.id,()=>openTownField(episode))));
    body.append(notice);
  }

  function extraPortrait(id) {
    const [town,,number]=id.split('_');
    const portraits=['tn-0','g2-0','pf-0','sx-1','rp-2','ps-0','sj-1','ng-0','rs-0','cp-1','iv-1','ot-0','md-3','pe-0','pn-0','rv-0'];
    const available=portraits.filter(name=>!name.startsWith(town+'-'));
    return 'story/maps/villages/'+available[number?Number(number)-1:10]+'.webp';
  }

  function townResidentsOnMap(episode,map,targets,back) {
    if(!chapterWorld)return {map,targets};
    const points={...map.points};
    const choices=[];
    for(const [y,row] of map.tiles.entries())for(const [x,tile] of [...row].entries()){
      if(tile==='.' && [[0,1],[1,0],[0,-1],[-1,0]].filter(([dx,dy])=>map.tiles[y+dy]?.[x+dx]==='.').length>=2) choices.push([x,y]);
    }
    const residents=chapterWorld.residentsForTown(episode.id);
    const extras=[];
    // Keep existing actors and exits in place. Spread new actors across open ground.
    for(const npc of residents){
      const occupied=[map.spawn,...Object.values(points)];
      const distance=([x,y])=>Math.min(...occupied.map(([a,b])=>Math.hypot(x-a,y-b)));
      const point=choices.reduce((best,tile)=>distance(tile)>distance(best)?tile:best,choices[0]);
      if(!point||distance(point)===0)throw new Error('No resident placement for '+npc.id);
      points[npc.id]=point;
      const art=window.NPC_ATLAS?.[npc.id]||null;
      const image=artFront(art)||extraPortrait(npc.id);
      extras.push({id:npc.id,label:npc.en+' · '+npc.ko,caption:npc.name,job:npc.job,image,walk:artWalk(art),
        action:detail=>chapterWorld.meetResident(npc.id,image,back,!!detail?.guide)});
    }
    return {map:{...map,points},targets:[...targets,...extras]};
  }

  function villageField(episode,map) {
    const body=hubPanel(townFor(episode),closeDialogue);
    body.querySelector('button').textContent='마을 이야기로';
    townFieldActions(body,episode,()=>villageField(episode,map));
    showTownGuidance(body,episode);
    const targets=residentTargets(episode,index=>`story/maps/villages/${episode.id}-${index}.webp`);
    const layout=townResidentsOnMap(episode,map,targets,()=>villageField(episode,map));
    const positions=G.c2VillagePositions ||= {};
    window.openChapterField(body,layout.map,isRpgM()?rhero():lhero(),layout.targets,{
      position:positions[episode.id],
      onStep(position){positions[episode.id]=position;},
    });
  }

  function bevilleField(area) {
    const map=window.chapterFields?.[area];
    if (!map || typeof window.openChapterField!=='function') return;
    const episode=episodes.get(meadowId);
    const isTown=area==='town';
    const state=activeMeadow();
    const remaining=meadowRemaining(state);
    const body=hubPanel(isTown?townFor(episode):'Be Meadow · 비 초원',()=>{
      if (!isTown) {
        if (G.scr!=='town') twOpen(meadowId);
        bevilleField('town');
      } else closeDialogue();
    });
    body.querySelector('button').textContent=isTown?'비빌 이야기로':'비빌로 돌아가기';
    if(isTown){townFieldActions(body,episode,()=>bevilleField('town'));showTownGuidance(body,episode);}
    const start=window.chapterFields.meadow.spawn;
    const position=isTown ? G.c2TownPosition : state?.position;
    let at=position||map.spawn;
    let steps=G.c2MeadowSteps??(G.c2MeadowSteps=drawEncounterDistance());
    const status=node('p',isTown?'':remaining===null ?
      '초원 길을 걷다 보면 몬스터와 만납니다.' : remaining ?
      `남은 일반 몬스터 ${remaining}마리 · 계속 탐험하세요.` : '일반 몬스터를 모두 쓰러뜨렸습니다. 수호자 제단으로 가세요.');
    status.setAttribute('role','status');
    if (!isTown) body.append(status);

    const openMeadow=()=>{
      const rpg=isRpgM();
      if (!activeMeadow() && !wmUnlocked(meadowId)) {
        body.append(node('p','비 초원 던전이 아직 잠겨 있습니다.'));
        return;
      }
      const continued=rpg?rpgPeek():peekRun();
      if (!activeMeadow() && continued) {
        body.append(node('p','이어하기 기록이 있습니다. 그 모험을 이어서 진행하거나 정리한 뒤 초원에 입장하세요.'));
        return;
      }
      bevilleField('meadow');
    };
    const npcImages=['farmer','guide','grandmother','dogkeeper'];
    const targets=isTown ? [
      ...residentTargets(episode,index=>`story/maps/${npcImages[index]}.webp`),
      {id:'meadow',label:'비 초원 입구',action:openMeadow},
    ] : [
      {id:'town',label:'마을 출구',action:()=>{
        if (G.scr!=='town') twOpen(meadowId);
        bevilleField('town');
      }},
      {id:'guardian',label:displayName(episode.boss_en,episode.boss),art:()=>{
        const portrait=node('div',undefined,'c2-field-monster');
        portrait.innerHTML=sp(GRMAP.g1.boss.mon,'','MON');
        fill(portrait);
        return portrait;
      },action:()=>{
        if (!beginMeadowFight(at,true)) status.textContent='수호자는 아직 길을 막고 있습니다. 초원을 더 탐험하세요.';
      }},
    ];
    const layout=isTown?townResidentsOnMap(episode,map,targets,()=>bevilleField('town')):{map,targets};
    window.openChapterField(body,layout.map,state?.rpg||isRpgM()?rhero():lhero(),layout.targets,{
      position,
      onStep(next) {
        at=next;
        if (isTown) {G.c2TownPosition=next;return false;}
        if (state) state.position=next;
        if (remaining===0 || Math.abs(next[0]-start[0])+Math.abs(next[1]-start[1])<=2) return false;
        if (state) return --state.steps<=0 && beginMeadowFight(next,false);
        G.c2MeadowSteps=--steps;
        return steps<=0 && beginMeadowFight(next,false);
      },
    });
  }

  function meadowBeforeRender() {
    if (G.dg?.id!==meadowId || G.rvm) return false;
    const rpg=G.scr==='rbattle';
    if (!rpg && G.scr!=='battle') return false;
    const source=rpg?G.rp:G.run?.[0];
    if (!source) return false;
    let state=G.c2Meadow;
    if (state?.pending && state.rpg===rpg) {
      state.pending=false;
      source.c2Meadow=state;
      saveMeadow(state);
      return false;
    }
    if (!source.c2Meadow) return false;
    state=G.c2Meadow=source.c2Meadow;
    const advanced=meadowIndex(state)>state.lastFight;
    const previous=meadowEnemies(state)[state.lastFight];
    if (!state.onField && (!advanced || !previous || previous.boss)) return false;
    state.onField=true;
    state.lastFight=meadowIndex(state);
    if (state.steps<=0) state.steps=drawEncounterDistance();
    G.scr='c2meadow';
    syncBgm();
    saveMeadow(state);
    bevilleField('meadow');
    return true;
  }

  function decorateTown(episode) {
    const cards=document.querySelectorAll('#app .twn');
    const saved=episodeState(episode.id);
    const cleared=twCleared(episode.id);
    const representative=episode.residents.find(resident=>(resident.name_legacy||resident.name)===(episode.completion.speaker_legacy||episode.completion.speaker));
    const heading=document.querySelector('#app .speaker');
    if (heading) heading.textContent=townFor(episode);
    for (const resident of episode.residents) {
      const card=cards[resident.index];
      if (!card) continue;
      const name=card.querySelector('.twh b');
      if (name) name.textContent=displayName(resident.name_en,resident.name);
      card.append(button('스토리 대화',()=>townDialogue(episode,resident)));
    }
    const map=episode.id===meadowId ? window.chapterFields?.town : window.chapterFields?.villages?.[episode.id];
    if (map && typeof window.openChapterField==='function') {
      const entry=button(episode.id===meadowId?'비빌 마을 탐험':'마을 탐험',()=>{
        if (episode.id===meadowId) bevilleField('town');
        else villageField(episode,map);
      });
      document.querySelector('#app .speaker')?.after(entry);
    }
    if (chapterWorld) {
      const residents=button('다른 주민 만나기',()=>chapterWorld.town(episode.id,closeDialogue));
      document.querySelector('#app .speaker')?.after(residents);
    }
    townEvents(episode,cleared);
    if (!cleared || !representative) return;
    cards[representative.index].append(button(saved.rewardClaimed?'마을 완료 대화 다시 보기':'페이지와 기념품 받기',()=>{
      if (!twCleared(episode.id)) return;
      const position=story.episodes.indexOf(episode);
      const prior=story.episodes[position-1];
      const canLink=prior ? episodeState(prior.id).rewardClaimed : true;
      const allOthers=[...episodes.keys()].every(id=>id===episode.id||episodeState(id).rewardClaimed);
      const hasAnotherPage=[...episodes.keys()].some(id=>id!==episode.id&&episodeState(id).rewardClaimed);
      const relevantClear=hasAnotherPage ? episode.boss_clear : episode.boss_clear.filter(line=>!line.en.includes('another page'));
      const lines=[...relevantClear,episode.completion];
      const next= !episodeState(episode.id).seenEvents?.nextDialogue &&
        ((episode.next_id&&canLink)||(!episode.next_id&&allOthers));
      if (next) lines.push(episode.next_dialogue);
      show(titleFor(episode),lines,()=>{
        if (!episodeState(episode.id).rewardClaimed && twCleared(episode.id)) {
          update(episode.id,{accepted:true,rewardClaimed:true});
        }
        rememberEpisode(episode.id,'completion');
        if (next) rememberEpisode(episode.id,'nextDialogue');
        render();
      });
    }));
  }

  function decorate() {
    if (G.scr==='title') {
      const container=document.querySelector('#app #go')?.parentElement;
      if(container&&!container.querySelector('#c2-dialogue-settings')){
        const entry=button('대화 설정',()=>dialogueSettings());
        entry.id='c2-dialogue-settings';
        container.append(entry);
      }
    }
    if (!dataReady || !worldOpen()) return;
    decorateSpecial();
    const app=document.getElementById('app');
    decorateFinale(app);
    recordHideoutClear();
    if (G.scr==='dsel' && !app.querySelector('#c2-library')) {
      const entry=button('Chapter II · 그래머 대도서관',library);
      entry.id='c2-library';
      const host=app.querySelector('.card') || app;
      host.prepend(entry);
      if (serialReading) entry.after(button('모험가의 수첩',()=>serialReading.notebook()));
    }
    const episode=episodes.get(G.scr==='town' ? G.tw?.id : G.dg?.id);
    if (!episode || app.querySelector('[data-c2]')) return;
    if (G.scr==='town') {
      decorateTown(episode);
      app.querySelector('.twn')?.setAttribute('data-c2','');
    }
    const boss=G.scr==='battle' ? G.run?.[G.ei]?.boss : G.scr==='rbattle' && G.rp?.en?.[G.rp.ei]?.boss;
    if (boss && !G.rvm) {
      const entry=button(episodeState(episode.id).seenEvents?.boss?'보스 대화 다시 보기':'보스 대화',
        ()=>show(titleFor(episode),[...episode.boss_intro,...sceneLines(scenesByTown.get(episode.id)?.boss.lines||[])],
          ()=>rememberEpisode(episode.id,'boss'),null,{art:sceneArt(episode,true)}));
      entry.dataset.c2='';
      const caption=node('span',displayName(episode.boss_en,episode.boss));
      const item=node('div',undefined,'c2-actions');
      item.append(caption,entry);
      (app.querySelector('.card') || app).prepend(item);
    }
  }

  function specialState(townId) {
    return SV.specialQuests?.[townId] || {};
  }

  function saveSpecial(townId, changes) {
    const quests=SV.specialQuests ||= {};
    quests[townId]={...quests[townId],...changes};
    saveNow();
  }

  function clueAvailable(townId,index) {
    return twCleared(townId) || !!SV.town?.[townId]?.q?.[index];
  }

  function readClue(quest,index,back,collect) {
    const townId=quest.town_id;
    show(specialTitle(quest),[quest.clues[index]],()=>{
      if (collect && clueAvailable(townId,index) && !specialState(townId).clues?.[index]) {
        saveSpecial(townId,{clues:{...specialState(townId).clues,[index]:true}});
      }
    },back,{palette:specialPalette,gloss:true,skip:!collect});
  }

  function specialTitle(quest) {
    return displayName(quest.title_en,quest.title_ko);
  }

  const caseBoards = {
    identity_match:'안내소의 이름표와 위치', order_builder:'주문표와 확인 질문',
    safety_plan:'통행 경로와 안전 장비', suspect_match:'수색 대상과 목격 기록',
    detective:'용의자와 책의 회수 장소', memory_archive:'편지의 인물과 사건',
    manuscript_decode:'발견자와 비문의 내용', wish_solution:'소원과 해결 방법',
    lost_found:'분실물에 주인 연결하기', goal_match:'여행 목표와 활동',
    witness_board:'목격한 일과 느낀 일', festival_setup:'축제 물품과 안전 표지',
    seal_puzzle:'문을 연 열쇠와 필요한 덕목',
  };

  function saveAnswers(quest, correct) {
    const townId=quest.town_id;
    const saved=specialState(townId);
    if (!quest.clues.every((_,i)=>saved.clues?.[i])) return;
    const answers={...saved.answers};
    for (const task of correct) answers[task.id]=true;
    const complete=quest.tasks.every(task=>answers[task.id]);
    saveSpecial(townId,{answers,...(complete?{completionFlag:quest.reward.id}:{})});
  }

  function taskField(task) {
    const field=node('fieldset',undefined,'c2-task');
    const english=node('legend',task.question_en);
    english.lang='en';
    field.append(english);
    if (reading.mode!=='english' && task.question_ko) field.append(node('p',task.question_ko));
    return field;
  }

  function feedbackBox() {
    const feedback=node('p',undefined,'c2-feedback');
    feedback.setAttribute('role','status');
    return feedback;
  }

  function caseBoard(quest,saved,back) {
    const board=node('section',undefined,'c2-case');
    const feedback=feedbackBox();
    const selected=new Map();
    const slots=[];
    const allDone=quest.tasks.every(task=>saved.answers?.[task.id]);
    board.append(node('h4',caseBoards[quest.interaction_type] ||
      (quest.interaction_type==='ranking'?'시상대 배치':'사건 기록')));
    if (!allDone) board.append(node('p','각 칸에 후보를 놓고 제출하세요.'));
    for (const [index,task] of quest.tasks.entries()) {
      const field=taskField(task);
      field.classList.add('c2-slot');
      if (saved.answers?.[task.id]) {
        field.append(node('p',task.options[task.correct_index],'c2-placement'));
      } else {
        const placement=node('p','비어 있음','c2-placement');
        placement.setAttribute('aria-live','polite');
        const options=node('div',undefined,'c2-actions');
        const choices=task.options.map((choice,i)=>{
          const option=button(choice,()=>{
            selected.set(task.id,i);
            placement.textContent=choice;
            placement.lang='en';
            choices.forEach((item,j)=>item.setAttribute('aria-pressed',String(i===j)));
            updateSubmit();
          });
          option.lang='en';
          option.setAttribute('aria-pressed','false');
          return option;
        });
        options.append(...choices);
        field.append(placement,options);
        slots.push({task,field});
      }
      if (quest.interaction_type==='ranking') {
        field.classList.add('c2-podium');
        field.dataset.place=String(index+1);
      }
      board.append(field);
    }
    const submit=button('배치 제출',()=>{
      const correct=slots.filter(({task})=>selected.get(task.id)===task.correct_index);
      const wrong=slots.filter(slot=>!correct.includes(slot));
      if (!wrong.length) {saveAnswers(quest,correct.map(slot=>slot.task));back();return;}
      if (correct.length) {
        saveAnswers(quest,correct.map(slot=>slot.task));
        for (const {field,task} of correct) {
          field.querySelector('.c2-actions').remove();
          field.querySelector('.c2-placement').textContent=task.options[task.correct_index];
        }
        slots.splice(0,slots.length,...wrong);
      }
      feedback.textContent=wrong.map(({task})=>task.retry_ko).join(' ');
      updateSubmit();
    });
    function updateSubmit() {
      const choices=quest.tasks.map(task=>saved.answers?.[task.id]?task.options[task.correct_index]:task.options[selected.get(task.id)]);
      const duplicate=quest.interaction_type==='ranking' && choices[0] && choices[0]===choices[1];
      submit.disabled=!!duplicate || slots.some(({task})=>!selected.has(task.id));
      if (duplicate) feedback.textContent='1위와 2위에는 서로 다른 선수를 놓아야 합니다.';
      else if (feedback.textContent==='1위와 2위에는 서로 다른 선수를 놓아야 합니다.') feedback.textContent='';
    }
    if (!allDone) {
      updateSubmit();
      board.append(submit,feedback);
    }
    return board;
  }

  function chronology(task) {
    const order=['Baking bread','Buying apples','Delivering the cake'].map(event=>task.options.indexOf(event));
    return order[0]===task.correct_index && order.every(index=>index>=0) ? order : null;
  }

  function timelineTask(quest,task,back,sequence) {
    const field=taskField(task);
    field.append(node('p','위·아래 버튼으로 이른 사건부터 순서대로 배치하세요.'));
    const order=task.options.map((_,index)=>index);
    const list=node('ol',undefined,'c2-timeline');
    const feedback=feedbackBox();
    function renderOrder(focusIndex,direction) {
      list.replaceChildren(...order.map((index,position)=>{
        const row=node('li');
        const event=node('span',task.options[index]);
        event.lang='en';
        const controls=node('div',undefined,'c2-actions');
        for (const delta of [-1,1]) {
          const move=button(delta<0?'↑':'↓',()=>{
            const other=position+delta;
            [order[position],order[other]]=[order[other],order[position]];
            feedback.textContent='';
            renderOrder(other,delta);
          });
          move.setAttribute('aria-label',task.options[index]+(delta<0?' 위로':' 아래로'));
          move.dataset.delta=delta;
          move.disabled=position+delta<0 || position+delta>=order.length;
          controls.append(move);
        }
        row.append(event,controls);
        return row;
      }));
      if (focusIndex!==undefined) {
        const row=list.children[focusIndex];
        (row.querySelector('[data-delta="'+direction+'"]:not(:disabled)') || row.querySelector('button:not(:disabled)')).focus();
      }
    }
    renderOrder();
    field.append(list,button('시간표 제출',()=>{
      if (order.some((index,i)=>index!==sequence[i])) {feedback.textContent=task.retry_ko;return;}
      saveAnswers(quest,[task]);
      back();
    }),feedback);
    return field;
  }

  function choiceTask(quest,task,back, map) {
    const field=taskField(task);
    const feedback=feedbackBox();
    const options=node('div',undefined,map?'c2-map c2-map-'+quest.town_id:'c2-actions');
    if (map) field.append(node('p','약도에서 단서와 일치하는 지점을 선택하세요.'));
    task.options.forEach((choice,index)=>{
      const option=button(choice,()=>{
        if (index!==task.correct_index) {feedback.textContent=task.retry_ko;return;}
        saveAnswers(quest,[task]);
        back();
      });
      option.lang='en';
      if (map) option.classList.add('c2-map-point');
      options.append(option);
    });
    field.append(options,feedback);
    return field;
  }

  function renderSpecialTasks(body,quest,saved,back) {
    const type=quest.interaction_type;
    if (Object.hasOwn(caseBoards,type) || type==='ranking') {
      body.append(caseBoard(quest,saved,back));
      return;
    }
    const map=['map_search','navigation','message_restore'].includes(type);
    for (const [i,task] of quest.tasks.entries()) {
      const sequence=i===0 && type==='timeline' ? chronology(task) : null;
      if (saved.answers?.[task.id]) {
        const field=taskField(task);
        field.append(node('p','해결 완료'));
        body.append(field);
      } else if (sequence) {
        body.append(timelineTask(quest,task,back,sequence));
      } else {
        body.append(choiceTask(quest,task,back,map&&i===0));
      }
    }
  }

  function specialJournal(townId, exit) {
    closeDialogueIfOpen();
    const quest=specialQuests.get(townId);
    const title='특별 퀘스트 일지';
    dialogue=node('dialog',undefined,'c2-dialog');
    dialogue.setAttribute('aria-label',title);
    document.body.append(dialogue);
    const body=node('div',undefined,'c2-body');
    dialogue.append(body);
    dialogue.addEventListener('cancel',event=>{event.preventDefault();closeDialogue();});
    body.append(node('h2',title));
    const back=()=>specialJournal(townId,exit);
    const navigation=node('div',undefined,'c2-actions');
    if (quest) navigation.append(button('퀘스트 목록',()=>specialJournal(undefined,exit)));
    else if (exit) navigation.append(button('대도서관으로',exit));
    navigation.append(button('닫기',closeDialogue));
    body.append(navigation);
    if (quest) {
      const saved=specialState(townId);
      const count=quest.clues.filter((_,i)=>saved.clues?.[i]).length;
      body.append(node('h3',specialTitle(quest)),node('p',quest.premise_ko),
        node('p',`수집한 단서 ${count} / ${quest.clues.length}${saved.completionFlag?' · 사건 해결 완료':''}`));
      const evidence=node('ol',undefined,'c2-evidence');
      quest.clues.forEach((clue,i)=>{
        const row=node('li');
        if (saved.clues?.[i]) row.append(button(clue.speaker+' · 단서 다시 보기',()=>readClue(quest,i,back,false)));
        else row.append(node('span',clue.speaker+' · 미수집'));
        evidence.append(row);
      });
      body.append(evidence);
      if (count<quest.clues.length) {
        body.append(node('p','마을에서 주민의 말을 고치거나 관련 던전을 클리어한 후, 주민에게 단서를 들을 수 있어요.'));
        if (G.scr!=='town' || G.tw?.id!==townId) {
          body.append(button('마을 방문',()=>{closeDialogue();twOpen(townId);}));
        }
      } else {
        renderSpecialTasks(body,quest,saved,back);
      }
      if (saved.completionFlag && !episodeState(townId).seenEvents?.nextDialogue &&
          (!quest.next_id ? [...episodes.keys()].every(id=>episodeState(id).rewardClaimed) : true)) {
        body.append(button('후속 대화',()=>show(specialTitle(quest),[quest.next_dialogue],
          ()=>rememberEpisode(townId,'nextDialogue'),back)));
      }
    } else {
      const list=node('ul');
      for (const item of specialQuests.values()) {
        const saved=specialState(item.town_id);
        const count=item.clues.filter((_,i)=>saved.clues?.[i]).length;
        const row=node('li');
        row.append(button(`${item.town_en} · ${item.title_ko} · ${saved.completionFlag?'해결 완료':count+' / '+item.clues.length}`,
          ()=>specialJournal(item.town_id,exit)));
        list.append(row);
      }
      body.append(list);
    }
    dialogue.showModal();
  }

  function decorateSpecial() {
    if (!specialQuests.size) return;
    const app=document.getElementById('app');
    if (app.querySelector('[data-special-quest]')) return;
    if (G.scr==='dsel') {
      const entry=button('특별 퀘스트 일지',()=>specialJournal());
      entry.dataset.specialQuest='';
      (app.querySelector('.card') || app).prepend(entry);
    } else if (G.scr==='town') {
      const quest=specialQuests.get(G.tw?.id);
      if (!quest) return;
      const entry=button('특별 퀘스트 일지',()=>specialJournal(quest.town_id));
      entry.dataset.specialQuest='';
      (app.querySelector('.card') || app).prepend(entry);
      const cards=app.querySelectorAll('.twn');
      quest.clues.forEach((_,i)=>{
        const collected=specialState(quest.town_id).clues?.[i];
        const clue=button(collected?'단서 다시 보기':'특별 퀘스트 단서',()=>readClue(quest,i,()=>{
          render();
          specialJournal(quest.town_id);
        },!collected));
        clue.disabled=!clueAvailable(quest.town_id,i) && !collected;
        if (clue.disabled) clue.title='주민 교정 또는 던전 클리어 후 열립니다.';
        cards[i]?.append(clue);
      });
    }
  }

  function validateSpecial(data) {
    if (!Array.isArray(data.palette) || !data.palette.every(c=>/^#[0-9a-f]{6}$/i.test(c))) throw new Error('Invalid special quest palette');
    const ids=new Set();
    for (const quest of data.quests) {
      const episode=episodes.get(quest.town_id);
      if (!episode || ids.has(quest.town_id) || quest.clues.length!==4 || quest.tasks.length!==2 ||
          quest.town_en!==episode.town_en || quest.reward.type!=='completion_flag' ||
          quest.clues.some((line,i)=>line.speaker!==episode.residents.find(r=>r.index===i)?.name_en ||
            !line.chunks.length || line.chunks.length>data.palette.length ||
            !line.chunks.every(chunk=>typeof chunk.en==='string' && typeof chunk.ko==='string')) ||
          quest.tasks.some(task=>task.options.length!==3 || !Number.isInteger(task.correct_index) ||
            task.correct_index<0 || task.correct_index>=task.options.length ||
            !task.evidence_indices.length || task.evidence_indices.some(i=>!Number.isInteger(i)||!quest.clues[i]))) {
        throw new Error('Invalid special quest: '+quest.town_id);
      }
      ids.add(quest.town_id);
    }
    if (ids.size!==episodes.size) throw new Error('Incomplete special quest coverage');
  }

  const companionIds={Subject:'tank',Verbella:'healer',Comple:'paladin',Ob:'dealer',Oxy:'shaman',Indy:'trader',Direct:'item',Modi:'pet'};
  let scenesByTown=new Map();
  let finaleDungeon;

  function sceneLines(lines) {
    return lines.map(line=>({...line,speaker:line.speaker||({
      Narrator:'내레이션',Lexion:'렉시온',Subject:'주어의 계승자',Verbella:'버벨라',Comple:'컴플리',
      Ob:'오브',Oxy:'옥시',Indy:'인디',Direct:'디렉',Modi:'모디',Silentius:'사일렌티우스',
    }[line.speaker_en]||line.speaker_en)}));
  }

  function sceneArt(episode,boss=false) {
    if (boss) return {mon:GRMAP[episode.id].boss.mon};
    return {image:'nb_'+DUNGEONS.find(d=>d.id===episode.id).bg+'.jpg'};
  }

  function townEvents(episode,cleared) {
    const scene=scenesByTown.get(episode.id);
    if (!scene) return;
    const hub=document.querySelector('#app .card');
    if (!hub) return;
    const options=node('div',undefined,'c2-actions');
    const sections=[['entry','마을 도착 장면']];
    if (cleared) sections.push(['recovery','마을 회복 장면']);
    if (specialState(episode.id).completionFlag) sections.push(['special_complete','특별 퀘스트 해결 장면']);
    for (const [key,title] of sections) {
      const saved=episodeState(episode.id).seenEvents?.[key];
      options.append(button(title+(saved?' 다시 보기':''),()=>show(title,sceneLines(scene[key].lines),
        ()=>{rememberEpisode(episode.id,key);render();},null,{art:sceneArt(episode)})));
    }
    for (const companion of expansion.companions.filter(item=>item.quest.town_id===episode.id)) {
      if (!cleared) continue;
      const key='companion:'+companion.character_key;
      const unit=companionIds[companion.character_key];
      const party=G.dg?.id===episode.id && G.tw?.cont ? G.mates : DUNGEONS.find(d=>d.id===episode.id).need;
      const available=unit==='tank' || (unit==='pet' ? !!PETS[SV.pet] : Array.isArray(party)&&party.includes(unit));
      const title=companion.quest.title_en;
      const saved=episodeState(episode.id).seenEvents?.[key];
      const action=button(title+(saved?' 다시 보기':''),()=>show(title,sceneLines(companion.quest.dialogue),
        ()=>companionActivity(episode,companion,key),null,{art:sceneArt(episode)}));
      action.disabled=!available;
      if (!available) action.title='이 동료가 함께할 때 열립니다.';
      options.append(action);
    }
    hub.insertBefore(options,hub.querySelector('.twn'));
  }

  function companionActivity(episode,companion,key) {
    const body=hubPanel(companion.quest.title_en,()=>{closeDialogue();render();});
    body.querySelector('button').textContent='마을로';
    const quest=specialQuests.get(episode.id);
    const clues=quest?.clues.filter((_,i)=>specialState(episode.id).clues?.[i]) || [];
    const back=()=>companionActivity(episode,companion,key);
    if (clues.length) body.append(button('수집한 단서 복습',()=>show(companion.quest.title_en,clues,null,back,{palette:specialPalette,gloss:true})));
    else body.append(node('p','수집한 단서는 마을의 특별 퀘스트 일지에서 복습할 수 있습니다.'));
    body.append(button('동료 기록 남기기',()=>{rememberEpisode(episode.id,key);closeDialogue();render();}));
  }

  function registerHideouts(lairs) {
    for (const lair of lairs) {
      const townIds=lair.unlock.all_verified.map(rule=>rule.split('_')[0]);
      const source=GRMAP[townIds[0]];
      if (!source || DUNGEONS.some(d=>d.id===lair.id)) throw new Error('Invalid hideout '+lair.id);
      const dungeon={id:lair.id,name:displayName(lair.title_en,lair.title_ko),
        mon:source.boss.mon,bg:source.bg,mix:true,full:true,open:false,
        need:['healer','paladin','dealer','shaman','trader','item'],enc:true,
        size:townIds.length,form:'1~5',storyRewardOnly:true,
        formed:'확인한 단서를 지키고 간부를 물리치세요.',
        sample:lair.boss.name_en,next:'대도서관 이야기 일지에서 귀환 보고를 할 수 있습니다.',
      };
      DUNGEONS.push(dungeon);
      hideoutDungeons.set(lair.id,{lair,dungeon,townIds});
    }
    const previous=genRun;
    genRun=function(dungeon){
      const entry=hideoutDungeons.get(dungeon.id);
      if(!entry)return previous.apply(this,arguments);
      return entry.townIds.map((id,i)=>{
        const question=genRunG({id}).find(item=>item.type==='gq'&&!item.boss);
        return {...question,boss:true,big:true,mon:dungeon.mon,
          mname:displayName(entry.lair.boss.name_en,entry.lair.boss.name_ko),
          hp0:Math.round(100*(1-i/entry.townIds.length)),
          hp1:Math.round(100*(1-(i+1)/entry.townIds.length)),talk:'',taunt:'',kill:''};
      });
    };
  }

  const hideoutArt=['nbg_05.webp','nbg_11.webp','nbg_04.webp','nbg_24.webp','nbg_12.webp'];

  function startHideout(id,back) {
    const entry=hideoutDungeons.get(id);
    if(!entry||!worldFlag(id+'_briefing_complete')||!entry.lair.unlock.all_verified.every(worldFlag))return;
    const body=worldPanel(entry.dungeon.name,back,'이야기 일지로');
    const running=peekRun();
    if(running?.id===id)body.append(button('던전 이어서 하기',()=>{closeDialogue();if(loadRun())render();}));
    else if(running)body.append(node('p','기존 던전의 이어하기 기록이 있습니다.'));
    else body.append(button('던전에 들어가기',()=>{
      const room=worldPanel(entry.dungeon.name,back,'이야기 일지로');
      const map={
        image:hideoutArt[[...hideoutDungeons.keys()].indexOf(id)],spawn:[8,7],points:{boss:[8,3]},
        tiles:['#################','#################','#################','######.....######',
          '######.....######','#####.......#####','####.........####','####.........####','#################'],
      };
      window.openChapterField(room,map,isRpgM()?rhero():lhero(),[{
        id:'boss',label:entry.lair.boss.name_en+' · '+entry.lair.boss.name_ko,
        art:()=>{
          const portrait=node('div',undefined,'c2-field-monster');
          portrait.innerHTML=sp(entry.dungeon.mon,'','MON');fill(portrait);return portrait;
        },
        action:()=>{
          closeDialogue();
          G.dg=entry.dungeon;G.mates=G.dg.need.slice();G.pets=1;
          G.rpg=false;G.clearPaid=false;G.fails=0;G.scr='formed';render();
        },
      }]);
    }));
  }

  function recordHideoutClear() {
    if(G.scr!=='clear'||!G.clearPaid)return;
    const entry=hideoutDungeons.get(G.dg?.id);
    if(!entry||worldFlag(entry.lair.reward.id))return;
    worldProgress().flags[entry.lair.reward.id]=true;
    saveWorld();
  }

  function startFinale(back) {
    if (!finaleDungeon || registeredCount()!==18) return;
    const finale=expansion.finale;
    const ready=hubPanel('Sanctuary of Silence · 침묵의 성역',back);
    ready.lastElementChild.textContent='비밀 기록실로';
    ready.append(node('p','네 단계에서 열여덟 문법 영역을 사용합니다.'));
    const savedRun=peekRun();
    if (savedRun?.id===finaleDungeon.id) {
      ready.append(button('성역 이어서 하기',()=>{closeDialogue();if (loadRun()) render();}));
    } else if (savedRun) {
      ready.append(node('p','기존 던전의 이어하기 기록이 남아 있습니다. 해당 모험을 끝낸 뒤 성역에 입장할 수 있습니다.'));
      return;
    }
    ready.append(button('성역 입장',()=>show(finaleDungeon.name,[...sceneLines(finale.opening),...(chapterWorld?.finaleOpening()||[]),...sceneLines(finale.confrontation)],()=>{
      G.dg=finaleDungeon;
      G.mates=finaleDungeon.need.slice();
      G.pets=1;
      G.clearPaid=false;
      G.rpg=false;
      G.scr='formed';
      render();
    },null,{art:{mon:finaleDungeon.mon}})));
  }

  function showEnding(back) {
    const finale=expansion.finale;
    const title=displayName(finale.reward.title_en,finale.reward.title_ko);
    show(title,[...sceneLines(finale.ending),...(chapterWorld?.finaleClosing()||[]),...sceneLines(finale.epilogue)],()=>{if (!progress().seenEvents?.finaleEnding) update(null,{finaleEnding:true,finaleTitle:finale.reward.title_en});},back,{art:{image:'end2.jpg'}});
  }

  function registerFinale() {
    const finale=expansion.finale;
    const existing=DUNGEONS.find(d=>d.id===finale.id);
    if (existing) throw new Error('Finale dungeon collision');
    const mon=EXMAP.d18.boss.mon;
    if (!MON[mon]) throw new Error('Finale fallback monster missing');
    finaleDungeon={
      id:finale.id,name:'Sanctuary of Silence · 침묵의 성역',mon,
      size:8,form:'1~5',full:true,mix:true,open:false,bg:'d6',storyRewardOnly:true,
      need:['healer','paladin','dealer','shaman','trader','item'],enc:true,
      formed:'열여덟 문법 영역을 사용해 사일렌티우스의 침묵을 깨뜨리세요.',
      sample:'Voices of Identity → Chains of Connection → Freedom of Choice → The Final Voice',
      next:'대도서관 비밀 기록실에서 Chapter II 엔딩을 다시 볼 수 있습니다.',
    };
    DUNGEONS.push(finaleDungeon);
    const existingRun=genRun;
    genRun=function(d) {
      if (d.id!==finaleDungeon.id) return existingRun.apply(this,arguments);
      const questions=[];
      for (const [index,phase] of finale.phases.entries()) for (const id of phase.town_ids) {
        const question=genRunG({id}).find(item=>item.type==='gq'&&!item.boss);
        questions.push({...question,phase:phase.title_en,phaseLine:id===phase.town_ids[0]?chapterWorld?.finalePhase(index):null});
      }
      return questions.map((question,i)=>({
        ...question,mon,mname:displayName(finale.villain.name_en,finale.villain.name_ko),
        talk:'',kill:'',taunt:'',big:true,boss:true,filter:'',
        hp0:Math.round((1-i/questions.length)*100),
        hp1:Math.round((1-(i+1)/questions.length)*100),
      }));
    };
  }

  function decorateFinale(app) {
    if (!finaleDungeon || G.dg?.id!==finaleDungeon.id) return;
    const host=app.querySelector('.card') || app;
    if (G.scr==='battle' && !G.rvm && G.run?.[G.ei]?.phase && !app.querySelector('[data-c2-phase]')) {
      const phase=node('p',G.run[G.ei].phase,'c2-phase');
      phase.dataset.c2Phase='';
      const line=G.run[G.ei].phaseLine;
      if (line) phase.append(' ',button('단계 대화',()=>show(G.run[G.ei].phase,[line])));
      host.prepend(phase);
    }
    if (G.scr==='clear' && G.clearPaid && !app.querySelector('[data-c2-ending]')) {
      const ending=button(progress().seenEvents?.finaleEnding?'엔딩 다시 보기':'Chapter II 엔딩 보기',()=>showEnding(null));
      ending.dataset.c2Ending='';
      host.prepend(ending);
    }
  }

  function expansionReady(data) {
    const known=[...episodes.keys()];
    const checkCoverage=(items,label)=>{
      const ids=items.map(x=>x.town_id);
      if (ids.length!==known.length || known.some(id=>!ids.includes(id))) throw new Error('Invalid '+label+' town coverage');
    };
    checkCoverage(data.cutscenes,'scene');
    checkCoverage(data.finale.phases.flatMap(p=>p.town_ids.map(id=>({town_id:id}))),'finale');
    if (data.finale.phases.length!==4 || data.finale.unlock.registered_unique_pages!==18 ||
        data.companions.some(c=>!companionIds[c.character_key] || !episodes.has(c.quest.town_id)) ||
        known.some(id=>!GQD[GRMAP[id]?.pool]?.length)) throw new Error('Invalid expansion');
    expansion=data;
    scenesByTown=new Map(data.cutscenes.map(scene=>[scene.town_id,scene]));
    registerFinale();
  }

  function libraryReady(data) {
    const roomIds=['grammatica','grammar','world','monsters','journal','secret'];
    if (data.rooms.length!==roomIds.length || roomIds.some(id=>!data.rooms.some(room=>room.id===id)) ||
        data.existing_dungeon_id!=='d16' || data.pages.length!==18 ||
        new Set(data.pages.map(page=>page.id)).size!==18 ||
        data.pages.some(page=>episodes.get(page.town_id)?.page_id!==page.id)) throw new Error('Invalid library');
    for (const section of ['grammar','world','monsters']) {
      if (data[section].length!==18 || new Set(data[section].map(item=>item.town_id)).size!==18 ||
          data[section].some(item=>!episodes.has(item.town_id))) throw new Error('Invalid library '+section);
    }
    for (const item of data.world) {
      const episode=episodes.get(item.town_id);
      if (item.name_en!==episode.town_en || item.residents.length!==4 ||
          item.residents.some(resident=>episode.residents.find(r=>r.index===resident.index)?.name_en!==resident.en)) {
        throw new Error('Invalid library residents: '+item.town_id);
      }
    }
    libraryData=data;
  }

  function validate(data,registry) {
    if (!Array.isArray(data.palette) || !data.palette.every(c=>/^#[0-9a-f]{6}$/i.test(c))) throw new Error('Invalid palette');
    const validateLine=line=>{
      if (!line || !['speaker','en','ko'].every(k=>typeof line[k]==='string') ||
          !Array.isArray(line.chunks) || !line.chunks.length || line.chunks.length>data.palette.length ||
          !line.chunks.every(chunk=>typeof chunk.en==='string'&&typeof chunk.ko==='string')) throw new Error('Invalid dialogue');
    };
    const legacyTown=value=>value?.replace(/\s+/g,'');
    const ids=new Set(), pages=new Set();
    for (const episode of data.episodes) {
      const town=TOWN[episode.id];
      const names=registry.episodes[episode.id];
      const boss=GRMAP[episode.id]?.boss;
      if (!names || legacyTown(town?.nm) !== legacyTown(episode.town_legacy) || boss?.mname !== episode.boss_legacy ||
          names.town.en !== episode.town_en || names.boss.en !== episode.boss_en ||
          episode.residents.some(resident=>{
            const named=names.residents.find(row=>row.index===resident.index);
            return named?.legacy!==resident.name_legacy || named?.en!==resident.name_en;
          })) throw new Error('Naming registry mismatch: '+episode.id);
      if (!town || ids.has(episode.id) || pages.has(episode.page_id) || town.n.length!==episode.residents.length ||
          new Set(episode.residents.map(r=>r.index)).size!==town.n.length ||
          episode.residents.some(r=>town.n[r.index]?.who!==(r.name_legacy||r.name))) throw new Error('Town mismatch: '+episode.id);
      ids.add(episode.id);
      pages.add(episode.page_id);
      [...episode.boss_intro,...episode.boss_clear,episode.completion,episode.next_dialogue,
        ...episode.residents.flatMap(r=>[r.before_problem,r.after_recovery])].forEach(validateLine);
    }
    if (ids.size!==18 || Object.keys(TOWN).some(id=>!ids.has(id))) throw new Error('Expected 18 episodes');
    [...data.intro,...data.library_intro,...data.finale,...Object.values(data.milestones).flat()].forEach(validateLine);
  }

  // Keep monotonic story flags from both devices using the existing save conflict rule.
  function mergeChapter(local, online = {}) {
    const merged={episodes:{...online.episodes},seenEvents:{...online.seenEvents,...local.seenEvents}};
    for (const [id,item] of Object.entries(local.episodes||{})) {
      const previous=merged.episodes[id]||{};
      merged.episodes[id]={
        accepted:!!(previous.accepted||item.accepted),
        rewardClaimed:!!(previous.rewardClaimed||item.rewardClaimed),
        registered:!!(previous.registered||item.registered),
        seenEvents:{...previous.seenEvents,...item.seenEvents},
      };
    }
    return merged;
  }

  function mergeSpecial(local, online = {}) {
    const merged={...online};
    for (const [id,item] of Object.entries(local)) {
      const previous=merged[id]||{};
      merged[id]={...previous,...item,clues:{...previous.clues,...item.clues},answers:{...previous.answers,...item.answers}};
      const quest=specialQuests.get(id);
      if (quest && quest.clues.every((_,i)=>merged[id].clues[i]) && quest.tasks.every(task=>merged[id].answers[task.id])) {
        merged[id].completionFlag ||= quest.reward.id;
      }
    }
    return merged;
  }

  function mergeWorld(local, online={}) {
    const reading={...online.reading,...local.reading,
      lettersPermission:!!(online.reading?.lettersPermission||local.reading?.lettersPermission),
      read:{...online.reading?.read,...local.reading?.read}};
    const entries={...online.notebook?.entries};
    const deleted={...online.notebook?.deleted};
    for (const [id,time] of Object.entries(local.notebook?.deleted||{})) {
      deleted[id]=Math.max(deleted[id]||0,time);
    }
    for (const [id,note] of Object.entries(local.notebook?.entries||{})) {
      if (!entries[id] || note.updated>=entries[id].updated) entries[id]=note;
    }
    for (const [id,time] of Object.entries(deleted)) {
      if (entries[id]?.updated<=time) delete entries[id];
    }
    const stages={...online.stages};
    for (const [id,stage] of Object.entries(local.stages||{})) {
      stages[id]=Math.max(stages[id]||0,stage);
    }
    return {...online,...local,reading,stages,notebook:{version:1,entries,deleted},
      flags:{...online.flags,...local.flags},souvenirs:{...online.souvenirs,...local.souvenirs}};
  }

  const baseMergeSave=mergeSave;
  mergeSave=function(name,remote) {
    const key='sg_save_'+name;
    let local;
    try { local=JSON.parse(lsg(key)||'null'); } catch {}
    const localNewer=baseMergeSave.call(this,name,remote);
    if (!local || !remote) return localNewer;
    const chosen=JSON.parse(lsg(key)||'null');
    if (!chosen) return localNewer;
    let added=false;
    for (const [field,merge] of [['chapter2',mergeChapter],['specialQuests',mergeSpecial],['chapter2World',mergeWorld]]) {
      if (!local[field]) {
        if (localNewer && remote[field]) chosen[field]=remote[field];
        continue;
      }
      chosen[field]=merge(local[field],remote[field]);
      if (JSON.stringify(chosen[field])!==JSON.stringify(remote[field])) added=true;
    }
    if (added || localNewer) lss(key,JSON.stringify(chosen));
    return localNewer||added;
  };

  const originalRender=render;
  render=function() {
    if (G.dg?.id===meadowId && ['clear','rresult','fail'].includes(G.scr)) {
      G.c2Meadow=null;
      G.c2MeadowSteps=null;
    }
    if (dataReady && meadowBeforeRender()) return;
    const result=originalRender.apply(this,arguments);
    decorate();
    if (G.c2Meadow?.pending && !G.c2Meadow.rpg && G.scr==='formed' && G.dg?.id===meadowId) {
      document.getElementById('enter')?.click();
    }
    return result;
  };

  function loadData(path) {
    return fetch(new URL(path,document.baseURI),{cache:'no-cache'})
      .then(response=>{if (!response.ok) throw new Error(path+' unavailable');return response.json();});
  }

  Promise.all([loadData('story/STORY_DATA.json'),loadData('story/NAMING_REGISTRY.json')])
    .then(([data,registry])=>{
      validate(data,registry);
      story=data;
      naming=registry;
      episodes=new Map(data.episodes.map(episode=>[episode.id,episode]));
      const parts=[
        ['SPECIAL_QUESTS.json',special=>{
          validateSpecial(special);
          specialPalette=special.palette;
          specialQuests=new Map(special.quests.map(quest=>[quest.town_id,quest]));
        }],
        ['LIBRARY_DATA.json',libraryReady],
        ['CHAPTER2_EXPANSION.json',expansionReady],
        ['serial catalogues',loadSerialReading],
        ['world narratives',loadChapterWorld],
      ];
      return Promise.allSettled(parts.map(async ([file,apply])=>{
        if (file==='serial catalogues'||file==='world narratives') await apply();
        else apply(await loadData('story/'+file));
      })).then(results=>{
        results.forEach((result,i)=>{
          if (result.status==='rejected') console.error('Chapter II:',parts[i][0],result.reason);
        });
        dataReady=true;
        decorate();
      });
    })
    .catch(error=>console.error('Chapter II:',error));
})();
