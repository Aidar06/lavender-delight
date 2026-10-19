import{invitationIdFromPath,createGuestPatch,adaptXanoInvitation}from'./backend-adapter.js';

const $=(selector,root=document)=>root.querySelector(selector),$$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const dictionary={
  ru:{invitation:'Приглашение на свадьбу',scroll:'Листайте ниже',dearSmall:'Для самых близких',dear:'Дорогие друзья и родные!',support:'Нам будет невероятно приятно разделить с вами этот особенный день и почувствовать ваше внимание, любовь и поддержку.',signature:'С любовью и нежностью',saveSmall:'Сохраните дату',when:'Когда?',dateLead:'Мы будем счастливы разделить с вами радость нашего особенного дня.',addCalendar:'Добавить в календарь',days:'дней',hours:'часов',minutes:'минут',programSmall:'В этот день',program:'Программа дня',whereSmall:'Место встречи',where:'Адрес проведения',answerSmall:'Ваш ответ',rsvp:'Будете с нами?',rsvpLead:'Пожалуйста, подтвердите присутствие — нам важно подготовить всё с заботой.',yourName:'Ваше имя',attendance:'Вы сможете прийти?',yes:'С радостью приду',no:'К сожалению, не смогу',count:'Количество гостей',wish:'Пожелание молодожёнам',send:'Отправить ответ',sending:'Отправляем…',sent:'Спасибо! Ваш ответ сохранён.',sendError:'Не удалось сохранить ответ. Попробуйте ещё раз.',guestSmall:'С любовью',guestList:'Пожелания гостей',waiting:'Будем рады видеть вас!',emptyGuests:'Пока здесь нет ответов гостей.',attending:'Будет',notAttending:'Не сможет',guest:'гость',guests:'гостя',manyGuests:'гостей',week:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],months:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']},
  ky:{invitation:'Үйлөнүү тоюна чакыруу',scroll:'Төмөн карай жылдырыңыз',dearSmall:'Эң жакындарыбызга',dear:'Кымбаттуу достор жана туугандар!',support:'Бул өзгөчө күндү сиздер менен бөлүшүп, көңүлүңүздөрдү, сүйүүңүздөрдү жана колдооңуздарды сезүү биз үчүн чоң бакыт.',signature:'Сүйүү жана назиктик менен',saveSmall:'Күндү белгилеп коюңуз',when:'Качан?',dateLead:'Өзгөчө күнүбүздүн кубанычын сиздер менен бөлүшүүгө абдан кубанычтабыз.',addCalendar:'Календарга кошуу',days:'күн',hours:'саат',minutes:'мүнөт',programSmall:'Бул күнү',program:'Күндүн программасы',whereSmall:'Жолугушуу жери',where:'Өткөрүлүүчү дарек',answerSmall:'Сиздин жообуңуз',rsvp:'Биз менен болосузбу?',rsvpLead:'Катышарыңызды ырастап коюңуз — баарын камкордук менен даярдоо биз үчүн маанилүү.',yourName:'Сиздин атыңыз',attendance:'Тойго келе аласызбы?',yes:'Кубануу менен келем',no:'Тилекке каршы, келе албайм',count:'Коноктордун саны',wish:'Жаштарга каалоо',send:'Жоопту жөнөтүү',sending:'Жөнөтүлүүдө…',sent:'Рахмат! Жообуңуз сакталды.',sendError:'Жооп сакталган жок. Кайра аракет кылыңыз.',guestSmall:'Сүйүү менен',guestList:'Коноктордун каалоолору',waiting:'Сиздерди көрүүгө кубанычтабыз!',emptyGuests:'Азырынча коноктордон жооп жок.',attending:'Келет',notAttending:'Келе албайт',guest:'конок',guests:'конок',manyGuests:'конок',week:['Дш','Шш','Шр','Бш','Жм','Иш','Жк'],months:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']}
};

let language=localStorage.getItem('lavender-estate-language')==='ky'?'ky':'ru';
let fallback,config,inviteId;

async function load(){
  fallback=await fetch('/content.json',{cache:'no-cache'}).then(response=>{if(!response.ok)throw new Error('fallback');return response.json()});
  inviteId=invitationIdFromPath(location.pathname,fallback.backend.defaultId)||String(fallback.backend.defaultId);
  try{
    const response=await fetch(`${fallback.backend.baseUrl}/${inviteId}`,{headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    config=adaptXanoInvitation(await response.json(),fallback);
  }catch(error){console.warn('Using invitation fallback',error);config=fallback}
  render();
}

function render(){
  const text=dictionary[language],content=config.locales[language],dateInfo=getDateInfo();
  document.documentElement.lang=language==='ky'?'ky':'ru';
  document.body.classList.toggle('lang-ky',language==='ky');
  $$('[data-lang]').forEach(button=>button.classList.toggle('active',button.dataset.lang===language));
  $$('[data-i18n]').forEach(element=>{const value=text[element.dataset.i18n];if(value)element.textContent=value});
  $$('[data-name="first"]').forEach(element=>element.textContent=config.names.first);
  $$('[data-name="second"]').forEach(element=>element.textContent=config.names.second);
  $('[data-initial="first"]').textContent=[...config.names.first][0]||'';
  $('[data-initial="second"]').textContent=[...config.names.second][0]||'';
  $('[data-content="welcome"]').textContent=content.welcome;
  $$('[data-venue]').forEach(element=>element.textContent=content.venue[element.dataset.venue]||'');
  $$('[data-date="long"]').forEach(element=>element.textContent=dateInfo.long);
  $('[data-date="monthYear"]').textContent=`${text.months[dateInfo.month-1]} ${dateInfo.year}`;
  $('[data-date="weekday"]').textContent=dateInfo.weekday;
  $('[data-date="time"]').textContent=dateInfo.time;
  $('[data-date="short"]').textContent=`${String(dateInfo.day).padStart(2,'0')} · ${String(dateInfo.month).padStart(2,'0')} · ${dateInfo.year}`;
  renderCalendar(dateInfo);renderSchedule(content.schedule);renderGuests(config.guests||[]);updateCountdown();updateMetadata(dateInfo.long);
  const mapQuery=[content.venue.name,content.venue.address].filter(Boolean).join(', ');
  $('#googleMapLink').href=config.mapUrl||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  $('#twoGisLink').href=`https://2gis.com/search/${encodeURIComponent(mapQuery)}`;
  observeReveals();
}

function getDateInfo(){
  const [year,month,day]=config.date.slice(0,10).split('-').map(Number),date=new Date(config.date),locale=language==='ky'?'ky-KG':'ru-RU';
  return{year,month,day,date,long:date.toLocaleDateString(locale,{day:'numeric',month:'long',year:'numeric',timeZone:config.timezone}),weekday:date.toLocaleDateString(locale,{weekday:'long',timeZone:config.timezone}),time:date.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:config.timezone})};
}

function renderCalendar(info){
  const holder=$('#calendar'),first=(new Date(info.year,info.month-1,1).getDay()+6)%7,days=new Date(info.year,info.month,0).getDate();
  holder.replaceChildren();
  dictionary[language].week.forEach(label=>holder.insertAdjacentHTML('beforeend',`<span class="weekday">${label}</span>`));
  for(let index=0;index<first;index++)holder.insertAdjacentHTML('beforeend','<span class="empty">0</span>');
  for(let day=1;day<=days;day++)holder.insertAdjacentHTML('beforeend',`<span${day===info.day?' class="wedding-day" aria-label="Дата свадьбы"':''}>${day}</span>`);
}

function renderSchedule(items){
  const icons=['welcome','rings','dinner','music','stars'];
  $('#schedule').innerHTML=items.map((item,index)=>`<article class="program-item reveal"><time>${escapeHtml(item.time)}</time><svg class="program-item__icon" aria-hidden="true"><use href="assets/program-icons.svg#${icons[index%icons.length]}"></use></svg><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></article>`).join('');
}

function guestWord(count){return count===1?dictionary[language].guest:(count>1&&count<5?dictionary[language].guests:dictionary[language].manyGuests)}
function renderGuests(guests){
  const holder=$('#guestList');
  if(!guests.length){holder.innerHTML=`<p class="guest-empty">${dictionary[language].emptyGuests}</p>`;return}
  holder.innerHTML=guests.map(guest=>{const count=Math.max(1,Number(guest.guests_count)||1);return`<article class="guest-card"><h3>${escapeHtml(guest.name)}</h3><span class="guest-meta ${guest.is_attending?'yes':'no'}">${guest.is_attending?dictionary[language].attending:dictionary[language].notAttending} · ${count} ${guestWord(count)}</span>${guest.wish?`<p>“${escapeHtml(guest.wish)}”</p>`:''}</article>`}).join('');
}

function updateCountdown(){
  if(!config)return;const remaining=Math.max(0,new Date(config.date).getTime()-Date.now());
  const values={days:Math.floor(remaining/86400000),hours:Math.floor(remaining/3600000)%24,minutes:Math.floor(remaining/60000)%60};
  $$('[data-count]').forEach(element=>{const key=element.dataset.count;element.textContent=key==='days'?String(values[key]).padStart(3,'0'):String(values[key]).padStart(2,'0')});
}

function updateMetadata(date){
  const title=`${config.names.first} & ${config.names.second} — ${dictionary[language].invitation}`,description=`${date}. ${config.locales[language].venue.name}`;
  document.title=title;$('meta[name="description"]').content=description;$('meta[property="og:title"]').content=title;$('meta[property="og:description"]').content=description;
}

function escapeHtml(value=''){const node=document.createElement('div');node.textContent=String(value);return node.innerHTML}

$$('[data-lang]').forEach(button=>button.addEventListener('click',()=>{if(language===button.dataset.lang)return;language=button.dataset.lang;localStorage.setItem('lavender-estate-language',language);if(config)render()}));

const sheet=$('#guestSheet');
function toggleSheet(open){sheet.classList.toggle('is-open',open);sheet.setAttribute('aria-hidden',String(!open));document.body.style.overflow=open?'hidden':'';if(open)$('.guest-sheet__close').focus()}
$('#openGuests').addEventListener('click',()=>toggleSheet(true));
$$('[data-close-sheet]').forEach(button=>button.addEventListener('click',()=>toggleSheet(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape')toggleSheet(false)});

$('#rsvpForm').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget,button=$('button[type="submit"]',form),status=$('#formStatus'),values=new FormData(form);
  const guest={name:String(values.get('name')||'').trim(),wish:String(values.get('wish')||'').trim(),guests_count:Number(values.get('guests_count')),is_attending:values.get('attending')==='yes'};
  if(!guest.name)return;
  button.disabled=true;$('span',button).textContent=dictionary[language].sending;status.textContent='';
  try{
    const base=config.backend?.baseUrl||fallback.backend.baseUrl,fresh=await fetch(`${base}/${inviteId}`,{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('read');return response.json()});
    const payload=createGuestPatch(fresh,inviteId,guest),response=await fetch(`${base}/${inviteId}/full`,{method:'PATCH',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    config=adaptXanoInvitation(payload,fallback);renderGuests(config.guests);form.reset();status.textContent=dictionary[language].sent;
  }catch(error){console.error(error);status.textContent=dictionary[language].sendError}
  finally{button.disabled=false;$('span',button).textContent=dictionary[language].send}
});

$('#calendarButton').addEventListener('click',()=>{
  if(!config)return;const content=config.locales[language],start=new Date(config.date),end=new Date(config.endDate||start.getTime()+21600000),stamp=date=>date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Lavender Estate//Wedding Invitation//RU','BEGIN:VEVENT',`UID:wedding-${inviteId}@lavender-estate`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:${config.names.first} & ${config.names.second}`,`LOCATION:${String(content.venue.address).replaceAll(',','\\,')}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
  const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='wedding.ics';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});

let observer;
function observeReveals(){observer?.disconnect();observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.12});$$('.reveal:not(.is-visible)').forEach(element=>observer.observe(element))}

let ticking=false;
addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{document.documentElement.style.setProperty('--scroll-y',String(scrollY));ticking=false})},{passive:true});

load();setInterval(updateCountdown,30000);
