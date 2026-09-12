const EXERCISES = [
  {id:'hip-thrust',name:'Ягодичный мост / Hip Thrust',group:'Ягодицы',target:'Ягодичные мышцы'},
  {id:'rdl',name:'Румынская тяга',group:'Ноги',target:'Ягодицы и задняя поверхность бедра'},
  {id:'bulgarian',name:'Болгарские выпады',group:'Ноги',target:'Ягодицы и квадрицепс'},
  {id:'abduction',name:'Разведение бёдер сидя',group:'Ягодицы',target:'Средняя ягодичная мышца'},
  {id:'adduction',name:'Сведение бёдер сидя',group:'Ноги',target:'Внутренняя поверхность бедра'},
  {id:'legpress',name:'Жим ногами',group:'Ноги',target:'Квадрицепс и ягодицы'},
  {id:'legcurl',name:'Сгибание ног лёжа',group:'Ноги',target:'Задняя поверхность бедра'},
  {id:'legext',name:'Разгибание ног сидя',group:'Ноги',target:'Квадрицепс'},
  {id:'latpulldown',name:'Тяга верхнего блока',group:'Спина',target:'Широчайшие мышцы'},
  {id:'seatedrow',name:'Тяга горизонтального блока',group:'Спина',target:'Спина'},
  {id:'pullup',name:'Подтягивания',group:'Спина',target:'Широчайшие и бицепс'},
  {id:'chestpress',name:'Жим от груди в тренажёре',group:'Грудь',target:'Грудные мышцы'},
  {id:'shoulderpress',name:'Жим гантелей вверх',group:'Плечи',target:'Дельтовидные мышцы'},
  {id:'lateralraise',name:'Разведение гантелей в стороны',group:'Плечи',target:'Средняя дельта'},
  {id:'bicepscurl',name:'Сгибание рук с гантелями',group:'Руки',target:'Бицепс'},
  {id:'triceps',name:'Разгибание рук на блоке',group:'Руки',target:'Трицепс'},
  {id:'cablekick',name:'Отведение ноги назад в кроссовере',group:'Ягодицы',target:'Ягодичные мышцы'},
  {id:'plank',name:'Планка',group:'Пресс',target:'Кор и пресс'}
];
const COLORS=['#ff6b6b','#ffa94d','#ffd43b','#69db7c','#4dabf7','#748ffc','#da77f2','#f783ac'];
const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){localStorage.setItem(k,JSON.stringify(v))}};
let state={tab:'workouts',modal:null,selected:new Set(),exerciseFilter:'Все',query:'',calendarDate:new Date(),active:null,detail:null};
function fmtDate(iso){return new Date(iso).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}
function fmtTime(iso){return new Date(iso).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}
function workouts(){return store.get('workouts',[])} function sessions(){return store.get('sessions',[])} function notes(){return store.get('calendarNotes',{})}
function getExercise(id){return EXERCISES.find(x=>x.id===id)}
function silhouette(kind='full',large=false){
  const w=large?330:120,h=large?210:78;
  return `<svg viewBox="0 0 240 150" width="${w}" height="${h}" aria-hidden="true">
  <g fill="none" stroke="#aeb1b7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="120" cy="24" r="12" fill="#eef0f3" stroke-width="4"/><path d="M120 38v43M120 52L90 75M120 52l30 23M120 80l-22 43M120 80l23 43"/>
  </g>
  <g fill="none" stroke="#ef5d5d" stroke-width="9" stroke-linecap="round" opacity=".9">${targetPath(kind)}</g>
  <g stroke="#d8dade" stroke-width="4" fill="none"><path d="M32 130h176"/></g></svg>`
}
function targetPath(id){
 const lower=['hip-thrust','rdl','bulgarian','abduction','adduction','legpress','legcurl','legext','cablekick'];
 if(lower.includes(id)) return '<path d="M111 78l-13 43M129 78l14 43"/><path d="M108 78h24"/>';
 if(['latpulldown','seatedrow','pullup'].includes(id)) return '<path d="M104 48l16 24 16-24"/>';
 if(id==='chestpress') return '<path d="M103 54h34"/>';
 if(['shoulderpress','lateralraise'].includes(id)) return '<path d="M104 50L90 64M136 50l14 14"/>';
 if(id==='bicepscurl') return '<path d="M94 68l-8 20M146 68l8 20"/>';
 if(id==='triceps') return '<path d="M97 69l-8 20M143 69l8 20"/>';
 return '<path d="M108 58h24M108 67h24"/>';
}
function nav(){return `<nav class="nav">${[['workouts','🏋️','Тренировки'],['exercises','📚','Упражнения'],['calendar','🗓','Календарь'],['history','🕘','История']].map(([t,i,l])=>`<button data-tab="${t}" class="${state.tab===t?'active':''}"><b>${i}</b>${l}</button>`).join('')}</nav>`}
function top(title,sub='',action=''){return `<div class="topbar"><div><h1>${title}</h1>${sub?`<div class="sub">${sub}</div>`:''}</div>${action}</div>`}
function render(){const app=$('#app');app.innerHTML=`<main class="app">${view()}</main>${nav()}${state.modal?modal():''}`;bind()}
function view(){if(state.active)return activeView(); if(state.detail)return exerciseDetail(state.detail); return ({workouts:workoutsView,exercises:exercisesView,calendar:calendarView,history:historyView})[state.tab]()}
function workoutsView(){const ws=workouts();return `${top('Тренировки','Шаблоны можно запускать сколько угодно раз')}<div class="grid">${ws.length?ws.map(w=>`<div class="card workout-card"><div data-open-workout="${w.id}"><h3>${w.name}</h3><div class="count">${w.exerciseIds.length} упражнений</div></div><button class="btn small" data-start="${w.id}">Начать</button></div>`).join(''):`<div class="empty"><span class="emoji">🏋️</span>Пока нет тренировок.<br>Создай первую из списка упражнений.</div>`}</div><button class="fab" data-create>+</button>`}
function exercisesView(){let list=EXERCISES.filter(e=>(state.exerciseFilter==='Все'||e.group===state.exerciseFilter)&&e.name.toLowerCase().includes(state.query.toLowerCase())); const groups=['Все',...new Set(EXERCISES.map(x=>x.group))];return `${top('Упражнения','Выбирай упражнения и собирай свои тренировки',state.selected.size?`<button class="pill" data-make>${state.selected.size} выбрано</button>`:'')}<input class="search" placeholder="Поиск упражнения" value="${state.query.replace(/"/g,'&quot;')}"><div class="chips">${groups.map(g=>`<button class="chip ${state.exerciseFilter===g?'active':''}" data-group="${g}">${g}</button>`).join('')}</div><div class="grid">${list.map(e=>`<div class="card exercise-card"><div class="thumb" data-detail="${e.id}">${silhouette(e.id)}</div><div data-detail="${e.id}"><h3>${e.name}</h3><p>${e.target}</p></div><button class="check ${state.selected.has(e.id)?'on':''}" data-select="${e.id}">${state.selected.has(e.id)?'✓':''}</button></div>`).join('')}</div>${state.selected.size?`<div style="height:72px"></div><button class="btn" style="position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom));width:min(650px,calc(100% - 32px));z-index:10" data-make>Создать тренировку (${state.selected.size})</button>`:''}`}
function exerciseDetail(id){const e=getExercise(id);const hist=sessions().filter(s=>s.exercises.some(x=>x.exerciseId===id)).slice().reverse();return `<button class="icon-btn" data-back-detail>← Назад</button><div class="hero"><div class="hero-ill">${silhouette(id,true)}</div><h2>${e.name}</h2><p>${e.target}</p></div><div class="card"><div class="section-title" style="margin-top:0">Инструкция</div><p style="line-height:1.5;margin-top:0">Выполняй движение плавно, сохраняя устойчивое положение корпуса. Рабочий вес выбирай так, чтобы последние повторения были тяжёлыми, но техника оставалась стабильной.</p></div><div class="section-title">Последние записи</div><div class="grid">${hist.length?hist.slice(0,5).map(s=>{const x=s.exercises.find(x=>x.exerciseId===id);return `<div class="card"><strong>${fmtDate(s.endedAt)}</strong><div class="sub">${x.sets.map(z=>`${z.weight||0} кг × ${z.reps||0}`).join(' · ')}</div></div>`}).join(''):`<div class="empty">Записей пока нет</div>`}</div><div class="detail-actions"><button class="btn secondary" data-add-detail="${id}">Добавить в тренировку</button><button class="btn" data-quick="${id}">Быстрый старт</button></div>`}
function workoutSheet(w){return `<div class="sheet-handle"></div><h2>${w.name}</h2><div class="grid">${w.exerciseIds.map(id=>{const e=getExercise(id);return `<div class="card exercise-card" style="grid-template-columns:74px 1fr"><div class="thumb" style="width:74px;height:64px">${silhouette(id)}</div><div><h3>${e.name}</h3><p>${e.target}</p></div></div>`}).join('')}</div><div style="height:12px"></div><button class="btn" data-start="${w.id}">Начать тренировку</button><div style="height:8px"></div><button class="btn danger" data-delete-workout="${w.id}">Удалить шаблон</button>`}
function startWorkout(id){
  const w=workouts().find(x=>x.id===id);
  const last=sessions().filter(s=>s.workoutId===id).at(-1);
  state.active={
    id:uid(),
    workoutId:w.id,
    name:w.name,
    startedAt:new Date().toISOString(),
    exercises:w.exerciseIds.map(eid=>{
      const prev=last?.exercises.find(x=>x.exerciseId===eid);
      return {
        exerciseId:eid,
        sets:prev?.sets?.length
          ? prev.sets.map(s=>({weight:s.weight,reps:s.reps}))
          : [{weight:'',reps:''},{weight:'',reps:''},{weight:'',reps:''}]
      };
    })
  };
  state.modal=null;
  render();
}
function activeView(){const a=state.active;return `${top(a.name,`Начато ${fmtTime(a.startedAt)}`,`<button class="pill" data-cancel-session>Закрыть</button>`)}<div class="card timer"><div><div class="sub">Таймер отдыха</div><strong id="timerText">01:30</strong></div><button class="btn small secondary" data-timer>Старт 90 сек</button></div><div class="section-title">Упражнения</div>${a.exercises.map((x,xi)=>{const e=getExercise(x.exerciseId);const last=findLastExercise(x.exerciseId);return `<div class="card exercise-block"><div class="exercise-head"><div><h3>${e.name}</h3><div class="last">${last?`Последний раз: ${last.sets.map(s=>`${s.weight||0}×${s.reps||0}`).join(' · ')}`:'Первое выполнение'}</div></div>${last?`<button class="link" data-copy-last="${xi}">Скопировать</button>`:''}</div><div class="labels"><span></span><span>КГ</span><span>ПОВТОРЫ</span><span></span></div>${x.sets.map((s,si)=>`<div class="set-row"><span class="set-num">${si+1}</span><input inputmode="decimal" data-weight="${xi}:${si}" value="${s.weight}"><input inputmode="numeric" data-reps="${xi}:${si}" value="${s.reps}"><button class="remove" data-remove-set="${xi}:${si}">×</button></div>`).join('')}<button class="link" data-add-set="${xi}">+ Добавить подход</button></div>`}).join('')}<button class="btn" data-finish>Завершить тренировку</button>`}
function findLastExercise(id){const ss=sessions().slice().reverse();for(const s of ss){const e=s.exercises.find(x=>x.exerciseId===id);if(e)return e}return null}
function historyView(){const ss=sessions().slice().reverse();return `${top('История','Каждое выполнение сохраняется отдельно')}<div class="grid">${ss.length?ss.map(s=>`<div class="card history-card" data-history="${s.id}"><h3>${s.name}</h3><div class="meta">${fmtDate(s.endedAt)} · ${fmtTime(s.endedAt)}</div><div class="summary">${s.exercises.length} упражнений · ${s.exercises.reduce((n,e)=>n+e.sets.length,0)} подходов</div></div>`).join(''):`<div class="empty"><span class="emoji">🕘</span>Завершённые тренировки появятся здесь.</div>`}</div>`}
function calendarView(){const d=new Date(state.calendarDate.getFullYear(),state.calendarDate.getMonth(),1);const y=d.getFullYear(),m=d.getMonth();const first=(d.getDay()+6)%7;const days=new Date(y,m+1,0).getDate();const n=notes();const ses=sessions();let cells='';for(let i=0;i<42;i++){const day=i-first+1;if(day<1||day>days){cells+=`<div class="day muted"></div>`;continue}const key=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;const note=n[key];const has=ses.some(s=>s.endedAt.slice(0,10)===key);const today=new Date();const isToday=today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===day;cells+=`<button class="day ${isToday?'today':''}" data-day="${key}" style="${note?.color?`background:${note.color}22;border-color:${note.color}`:''}"><span>${day}</span>${has?'<span class="dot"></span>':''}${note?.text?`<span class="note">${note.text}</span>`:''}</button>`}
return `${top('Календарь','Цветные отметки можно ставить вручную')}<div class="card"><div class="calendar-head"><button class="icon-btn" data-prev-month>‹</button><h2>${d.toLocaleDateString('ru-RU',{month:'long',year:'numeric'})}</h2><button class="icon-btn" data-next-month>›</button></div><div class="weekdays">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(x=>`<div>${x}</div>`).join('')}</div><div class="calendar-grid">${cells}</div><div class="sub" style="margin-top:12px">● Синяя точка — завершённая тренировка</div></div>`}
function modal(){
  if(state.modal.type==='workout'){
    return `<div class="modal" data-close-modal><div class="sheet" onclick="event.stopPropagation()">${workoutSheet(state.modal.workout)}</div></div>`;
  }
  if(state.modal.type==='create'){
    return `<div class="modal" data-close-modal><div class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>Новая тренировка</h2><div class="field"><label>Название</label><input id="workoutName" placeholder="Например, Ягодицы"></div><div class="sub" style="margin:10px 0 14px">Выбрано упражнений: ${state.selected.size}</div><button class="btn" data-save-workout>Создать тренировку</button></div></div>`;
  }
  if(state.modal.type==='calendar'){
    const k=state.modal.date,n=notes()[k]||{};
    return `<div class="modal" data-close-modal><div class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>${new Date(k+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}</h2><div class="field"><label>Что было?</label><input id="noteText" value="${(n.text||'').replace(/"/g,'&quot;')}" placeholder="Например, зал или скалодром"></div><div class="field"><label>Цвет</label><div class="colors">${COLORS.map(c=>`<button class="color ${n.color===c?'selected':''}" style="background:${c}" data-color="${c}"></button>`).join('')}</div></div><button class="btn" data-save-note>Сохранить</button><div style="height:8px"></div><button class="btn danger" data-delete-note>Очистить отметку</button></div></div>`;
  }
  if(state.modal.type==='history'){
    const s=state.modal.session;
    return `<div class="modal" data-close-modal><div class="sheet" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>${s.name}</h2><div class="sub">${fmtDate(s.endedAt)} · ${fmtTime(s.endedAt)}</div><div class="grid" style="margin-top:14px">${s.exercises.map(x=>`<div class="card"><strong>${getExercise(x.exerciseId).name}</strong><div class="sub" style="margin-top:6px">${x.sets.map(z=>`${z.weight||0} кг × ${z.reps||0}`).join(' · ')}</div></div>`).join('')}</div></div></div>`;
  }
  return '';
}
let chosenColor=null,timerHandle=null,timerEnd=0;
function bind(){
 $$('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;state.detail=null;render()});
 $('[data-create]')?.addEventListener('click',()=>{state.tab='exercises';state.selected=new Set();render()});
 $('.search')?.addEventListener('input',e=>{state.query=e.target.value;render()});
 $$('[data-group]').forEach(b=>b.onclick=()=>{state.exerciseFilter=b.dataset.group;render()});
 $$('[data-select]').forEach(b=>b.onclick=()=>{const id=b.dataset.select;state.selected.has(id)?state.selected.delete(id):state.selected.add(id);render()});
 $$('[data-detail]').forEach(b=>b.onclick=()=>{state.detail=b.dataset.detail;render()});
 $('[data-back-detail]')?.addEventListener('click',()=>{state.detail=null;render()});
 $$('[data-make]').forEach(b=>b.onclick=()=>state.selected.size&&(state.modal={type:'create'},render()));
 $('[data-save-workout]')?.addEventListener('click',()=>{const name=$('#workoutName').value.trim();if(!name)return toast('Введи название');const ws=workouts();ws.push({id:uid(),name,exerciseIds:[...state.selected],createdAt:new Date().toISOString()});store.set('workouts',ws);state.selected.clear();state.modal=null;state.tab='workouts';render();toast('Тренировка создана')});
 $$('[data-open-workout]').forEach(b=>b.onclick=()=>{const w=workouts().find(x=>x.id===b.dataset.openWorkout);state.modal={type:'workout',workout:w};render()});
 $$('[data-start]').forEach(b=>b.onclick=()=>startWorkout(b.dataset.start));
 $('[data-close-modal]')?.addEventListener('click',()=>{state.modal=null;render()});
 $('[data-delete-workout]')?.addEventListener('click',e=>{const id=e.currentTarget.dataset.deleteWorkout;if(confirm('Удалить шаблон тренировки? История сохранится.')){store.set('workouts',workouts().filter(x=>x.id!==id));state.modal=null;render()}});
 $('[data-add-detail]')?.addEventListener('click',e=>{state.selected=new Set([e.currentTarget.dataset.addDetail]);state.detail=null;state.tab='exercises';state.modal={type:'create'};render()});
 $('[data-quick]')?.addEventListener('click',e=>{const id=e.currentTarget.dataset.quick;state.active={id:uid(),workoutId:null,name:getExercise(id).name,startedAt:new Date().toISOString(),exercises:[{exerciseId:id,sets:[{weight:'',reps:''},{weight:'',reps:''},{weight:'',reps:''}]}]};state.detail=null;render()});
 $$('[data-weight]').forEach(i=>i.oninput=()=>{const[x,s]=i.dataset.weight.split(':').map(Number);state.active.exercises[x].sets[s].weight=i.value});
 $$('[data-reps]').forEach(i=>i.oninput=()=>{const[x,s]=i.dataset.reps.split(':').map(Number);state.active.exercises[x].sets[s].reps=i.value});
 $$('[data-add-set]').forEach(b=>b.onclick=()=>{state.active.exercises[+b.dataset.addSet].sets.push({weight:'',reps:''});render()});
 $$('[data-remove-set]').forEach(b=>b.onclick=()=>{const[x,s]=b.dataset.removeSet.split(':').map(Number);state.active.exercises[x].sets.splice(s,1);if(!state.active.exercises[x].sets.length)state.active.exercises[x].sets.push({weight:'',reps:''});render()});
 $$('[data-copy-last]').forEach(b=>b.onclick=()=>{const x=+b.dataset.copyLast;const last=findLastExercise(state.active.exercises[x].exerciseId);if(last)state.active.exercises[x].sets=last.sets.map(s=>({...s}));render()});
 $('[data-cancel-session]')?.addEventListener('click',()=>{if(confirm('Закрыть тренировку без сохранения?')){state.active=null;render()}});
 $('[data-finish]')?.addEventListener('click',()=>{const s={...state.active,endedAt:new Date().toISOString(),exercises:state.active.exercises.map(e=>({...e,sets:e.sets.filter(z=>String(z.weight).trim()||String(z.reps).trim())}))};const ss=sessions();ss.push(s);store.set('sessions',ss);state.active=null;state.tab='history';render();toast('Тренировка сохранена')});
 $('[data-timer]')?.addEventListener('click',startTimer);
 $$('[data-history]').forEach(b=>b.onclick=()=>{const s=sessions().find(x=>x.id===b.dataset.history);state.modal={type:'history',session:s};render()});
 $('[data-prev-month]')?.addEventListener('click',()=>{state.calendarDate=new Date(state.calendarDate.getFullYear(),state.calendarDate.getMonth()-1,1);render()});
 $('[data-next-month]')?.addEventListener('click',()=>{state.calendarDate=new Date(state.calendarDate.getFullYear(),state.calendarDate.getMonth()+1,1);render()});
 $$('[data-day]').forEach(b=>b.onclick=()=>{state.modal={type:'calendar',date:b.dataset.day};chosenColor=notes()[b.dataset.day]?.color||COLORS[5];render()});
 $$('[data-color]').forEach(b=>b.onclick=()=>{chosenColor=b.dataset.color;$$('[data-color]').forEach(x=>x.classList.toggle('selected',x.dataset.color===chosenColor))});
 $('[data-save-note]')?.addEventListener('click',()=>{const n=notes();n[state.modal.date]={text:$('#noteText').value.trim(),color:chosenColor||COLORS[5]};store.set('calendarNotes',n);state.modal=null;render()});
 $('[data-delete-note]')?.addEventListener('click',()=>{const n=notes();delete n[state.modal.date];store.set('calendarNotes',n);state.modal=null;render()});
}
function startTimer(){clearInterval(timerHandle);timerEnd=Date.now()+90000;tickTimer();timerHandle=setInterval(tickTimer,250)}
function tickTimer(){const el=$('#timerText');if(!el)return;const left=Math.max(0,Math.ceil((timerEnd-Date.now())/1000));el.textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;if(!left){clearInterval(timerHandle);if(navigator.vibrate)navigator.vibrate([120,80,120]);toast('Отдых закончен')}}
function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),1700)}
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
