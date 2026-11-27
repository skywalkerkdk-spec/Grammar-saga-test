/* Serialized reading room and the player's personal notebook. */
window.createChapterReading = function(api, catalogues) {
  const {node, button, panel, chapter, pages, recovered, flag, save, library, show}=api;
  const shelves=[
    ['역사 책장',['history','army']],
    ['모험 책장',['hero','knight','stars','king','librarian']],
    ['여행 책장',['merchant','letters']],
    ['전승 책장',['guardians','beasts']],
  ];
  const books=new Map();
  const volumes=new Map();
  for (const book of catalogues.flatMap(item=>item.books)) {
    if (books.has(book.id)) throw new Error('Duplicate collection '+book.id);
    books.set(book.id,book);
    for (const volume of book.volumes) {
      if (volumes.has(volume.id) || !volume.en || !volume.ko || !volume.segments?.length ||
          ['en','ko'].some(lang=>volume.segments.map(row=>row[lang]).join(' ')!==volume[lang].replace(/\s+/g,' ').trim())) throw new Error('Invalid volume '+volume.id);
      volumes.set(volume.id,{book,volume});
    }
  }
  if (books.size!==11 || volumes.size!==89 || shelves.flatMap(entry=>entry[1]).some(id=>!books.has(id))) {
    throw new Error('Expected 11 collections and 89 volumes');
  }

  const state=()=>chapter().reading ||= {read:{},bookmarks:{}};
  const title=volume=>volume.title_en+' · '+volume.title_ko;
  const unlocked=volume=>{
    const rule=volume.unlock;
    return (!rule.registered_pages||pages()>=rule.registered_pages) &&
      (!rule.town_recovered||recovered(rule.town_recovered)) &&
      (!rule.quest||flag(rule.quest)) && (!rule.permission_scene||state().lettersPermission);
  };
  function lockText(volume) {
    const rule=volume.unlock;
    const requirements=[];
    if(rule.registered_pages) requirements.push('그라마티카 '+rule.registered_pages+'페이지 등록');
    if(rule.town_recovered) requirements.push(api.townName(rule.town_recovered)+' 회복');
    if(rule.quest) requirements.push(rule.permission_scene?'편지 사건 해결':'수호자의 성소 결전 완료');
    if(rule.permission_scene) requirements.push('편지 공개 허락');
    return requirements.join(' · ');
  }

  const roomMap={
    image:'nbg_08.webp',
    spawn:[8,8],
    points:{history:[5,6],adventure:[7,5],travel:[10,5],legends:[12,6]},
    tiles:['##################','##################','##################','##################',
      '######......######','#####........#####','####..........####','####..........####',
      '####..........####','##################'],
  };
  function readingRoom() {
    const body=panel('대도서관 열람실',library,'대도서관으로');
    body.append(button('모험가의 수첩',()=>notebook(readingRoom)));
    const keys=Object.keys(roomMap.points);
    const targets=shelves.map(([name,ids],i)=>({
      id:keys[i],label:name,action:()=>shelf(name,ids),
      art:()=>node('div',undefined,'c2-shelf-art'),
    }));
    api.field(body,roomMap,targets);
  }

  function shelf(name,ids) {
    const body=panel(name,readingRoom,'열람실로');
    for (const id of ids) {
      const book=books.get(id);
      const group=node('details');
      group.append(node('summary',title(book)));
      const list=node('ol');
      group.append(node('p',genres[book.genre]||'연재 도서'),list);
      if (id==='letters' && flag('regional_3_complete') && !state().lettersPermission) {
        group.append(button('편지 열람 허락 받기',()=>{
          show('편지 열람 허락',[{
            speaker:'대사서 렉시온',speaker_en:'Lexion',
            en:'This is a later letter, and both writers have agreed to share it.',
            ko:'이것은 나중에 쓴 편지이며, 두 사람이 모두 공개에 동의했네.',
            chunks:[{en:'This is a later letter,',ko:'이것은 나중에 쓴 편지이며,'},{en:'and both writers have agreed to share it.',ko:'두 사람이 모두 공개에 동의했네.'}],
          }],()=>{state().lettersPermission=true;save();},()=>shelf(name,ids));
        }));
      }
      for (const volume of book.volumes) {
        const item=node('li');
        if (unlocked(volume)) {
          item.append(button(title(volume),()=>reader(volume.id,()=>shelf(name,ids))));
          if (state().read?.[volume.id]) item.append(' · 읽음');
          if (state().bookmarks?.[volume.id]) item.append(' · 책갈피');
        } else item.textContent=title(volume)+' · 잠김 · '+lockText(volume);
        list.append(item);
      }
      body.append(group);
    }
  }

  const genres={historical_account:'역사 기록',historical_fiction:'역사 소설',fiction:'소설',
    fictional_travelogue:'가상 여행기',folklore:'민간 전승',personal_letters_with_permission:'공개 허락을 받은 서신',restricted_historical_fragments:'제한 열람 역사 기록'};
  function reader(id,back) {
    const item=volumes.get(id);
    if (!item || !unlocked(item.volume)) return back();
    const {book,volume}=item;
    const record=state();
    record.read ||= {};
    if (!record.read[id]) {record.read[id]=true;save();}
    const body=panel(title(volume),back,'책장으로');
    const mode=node('select');
    mode.setAttribute('aria-label','독서 언어');
    for(const [key,label] of [['both','영어·한국어'],['aligned','문장별 색상'],['en','영어'],['ko','한국어']]) mode.add(new Option(label,key));
    mode.value=record.mode||'both';
    const text=node('article',undefined,'c2-book-text');
    const paint=()=>{
      if(mode.value==='aligned'){
        const colors=['#ffcb78','#9fdab8','#a5d4ff','#ecb5f0','#ffc3ad'];
        text.replaceChildren(...volume.segments.map((unit,i)=>{
          const pair=node('div',undefined,'c2-book-pair');
          pair.style.color=colors[i%colors.length];
          for(const lang of ['en','ko']){
            const p=node('p',unit[lang]);p.lang=lang;pair.append(p);
          }
          return pair;
        }));
        return;
      }
      const languages=mode.value==='both'?['en','ko']:[mode.value];
      text.replaceChildren(...languages.map(lang=>{
        const p=node('p',volume[lang]);p.lang=lang;return p;
      }));
    };
    mode.onchange=()=>{record.mode=mode.value;save();paint();};
    paint();
    body.append(mode,text);
    const actions=node('div',undefined,'c2-actions');
    record.bookmarks ||= {};
    const mark=button(record.bookmarks[id]?'책갈피 지우기':'책갈피 꽂기',()=>{
      record.bookmarks[id]=!record.bookmarks[id];save();
      mark.textContent=record.bookmarks[id]?'책갈피 지우기':'책갈피 꽂기';
    });
    actions.append(mark,button('이 책에 메모 쓰기',()=>editNote(null,()=>reader(id,back),id)));
    const available=book.volumes.filter(unlocked);
    const index=available.findIndex(row=>row.id===id);
    if(index>0) actions.append(button('이전 권',()=>reader(available[index-1].id,back)));
    if(index<available.length-1) actions.append(button('다음 권',()=>reader(available[index+1].id,back)));
    body.append(actions);
  }

  const notes=()=>chapter().notebook ||= {version:1,entries:{}};
  function notebook(back) {
    const body=panel('모험가의 수첩',back,back?'돌아가기':'닫기');
    const search=node('input');
    search.type='search';search.placeholder='제목·내용·책 검색';search.setAttribute('aria-label','메모 검색');
    const filter=node('select');
    filter.setAttribute('aria-label','메모 모음 필터');
    filter.add(new Option('모든 메모',''));
    filter.add(new Option('일반 메모','general'));
    for(const book of books.values()) filter.add(new Option(book.title_ko,book.id));
    const list=node('ul');
    const redraw=()=>{
      list.replaceChildren();
      for(const note of Object.values(notes().entries).sort((a,b)=>b.updated-a.updated)) {
        const item=volumes.get(note.volume_id);
        if(filter.value&&(item?.book.id||'general')!==filter.value)continue;
        const needle=search.value.trim().toLowerCase();
        if(![note.title,note.text,item?.volume.title_en,item?.volume.title_ko,item?.book.title_en,item?.book.title_ko].some(value=>value?.toLowerCase().includes(needle)))continue;
        const li=node('li',note.title);
        li.append(' ',button('편집',()=>editNote(note,()=>notebook(back))));
        if(item&&unlocked(item.volume))li.append(' ',button('원문 열기',()=>reader(item.volume.id,()=>notebook(back))));
        list.append(li);
      }
      if(!list.children.length)list.append(node('li','표시할 메모가 없습니다.'));
    };
    search.oninput=filter.onchange=redraw;
    body.append(button('새 메모',()=>editNote(null,()=>notebook(back))),search,filter,list);
    redraw();
  }

  function editNote(note,back,volumeId=note?.volume_id) {
    const body=panel(note?'메모 편집':'새 메모',back,'돌아가기');
    const item=volumes.get(volumeId);
    const key='sg_c2_draft_'+api.player()+':'+(note?.id||volumeId||'general');
    let draft={};
    try {draft=JSON.parse(localStorage.getItem(key)||'{}');} catch {}
    const heading=node('input');
    heading.maxLength=100;heading.value=draft.title??note?.title??'';
    heading.setAttribute('aria-label','메모 제목');
    const value=node('textarea');
    value.maxLength=5000;value.value=draft.text??note?.text??'';
    value.setAttribute('aria-label','메모 내용');
    const excerpt=node('input');
    excerpt.maxLength=500;excerpt.value=draft.excerpt??note?.excerpt??'';
    excerpt.setAttribute('aria-label','인용문');
    const feedback=node('p');feedback.setAttribute('role','status');
    const fields=()=>({title:heading.value.trim(),text:value.value.trim(),excerpt:excerpt.value.trim()});
    heading.oninput=value.oninput=excerpt.oninput=()=>{
      try {localStorage.setItem(key,JSON.stringify(fields()));} catch {}
    };
    if(item)body.append(node('p',title(item.volume)));
    const label=(text,control)=>{const el=node('label',text);el.append(control);return el;};
    body.append(label('제목',heading),label('내용',value),label('인용문 (선택)',excerpt),feedback);
    const eraseDraft=()=>{try{localStorage.removeItem(key);}catch{}};
    const clock=Date.now;
    const submit=button('메모 저장',()=>{
      const data=fields();
      if(!data.title||!data.text){feedback.textContent='제목과 내용을 입력하세요.';return;}
      const id=note?.id||crypto.randomUUID();
      const record={...data,id,book_id:item?.book.id,volume_id:item?.volume.id,created:note?.created||clock(),updated:clock()};
      notes().entries[id]=record;
      if(!save()){
        if(note) notes().entries[id]=note;
        else delete notes().entries[id];
        feedback.textContent='기기에 메모를 저장하지 못했습니다.';
        return;
      }
      eraseDraft();
      editNote(record,back);
      document.querySelector('dialog[open] [role=status]').textContent='메모를 저장했습니다.';
    });
    body.append(submit);
    if(note)body.append(button('메모 삭제',()=>{
      const confirm=panel('이 메모를 삭제할까요?',()=>editNote(note,back),'취소');
      confirm.append(button('삭제 확인',()=>{
        const record=notes();
        const deleted=record.deleted ||= {};
        const previous=deleted[note.id];
        deleted[note.id]=clock();
        delete record.entries[note.id];
        if(!save()){
          record.entries[note.id]=note;
          if (previous) deleted[note.id]=previous;
          else delete deleted[note.id];
          confirm.append(node('p','삭제를 저장하지 못했습니다.'));
          return;
        }
        eraseDraft();back();
      }));
    }));
  }
  return {readingRoom,notebook,reader,unlocked,volumes};
};
