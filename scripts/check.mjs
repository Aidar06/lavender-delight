import assert from'node:assert/strict';
import fs from'node:fs';
import path from'node:path';
import{invitationIdFromPath,adaptXanoInvitation,createGuestPatch}from'../dist/backend-adapter.js';

const root=path.resolve(import.meta.dirname,'../dist');
const fallback=JSON.parse(fs.readFileSync(path.join(root,'content.json'),'utf8'));
const fixture={public_id:'pub-3',languages:{enabled:['ru','ky'],default:'ru'},names:{groom:'Бекзат',bride:'Алина'},date:'2027-06-12T16:30:00',invitation:{ru:{title:'Дорогие гости',text:'Ждём вас'},ky:{title:'Кымбаттуу коноктор',text:'Сиздерди күтөбүз'}},wish_block:{enabled:true,content:{ru:{title:'Пожелание',text:'Будьте рядом'},ky:{title:'Каалоо',text:'Жаныбызда болуңуз'}}},ceremonies:[{time:'16:30',sort_order:1,content:{ru:{title:'Встреча',text:'Описание'},ky:{title:'Тосуп алуу',text:'Сүрөттөмө'}}},{time:'22:00',sort_order:2,content:{ru:{title:'Финал',text:'До встречи'},ky:{title:'Жыйынтык',text:'Көрүшкөнчө'}}}],venue:{content:{ru:{type:'Банкетный зал',name:'Очень длинное название свадебного банкетного зала',address:'г. Бишкек, ул. Чуй, 123'},ky:{type:'Банкеттик зал',name:'Узун аталыштагы зал',address:'Бишкек ш., Чүй көч., 123'}},map:{enabled:true,google_url:'',two_gis_url:''}},rsvp:{enabled:true,allow_guest_wish:true,max_guests:10},guests:[]};

assert.equal(invitationIdFromPath('/3',3),'3');
assert.equal(invitationIdFromPath('/4/',3),'4');
const adapted=adaptXanoInvitation(fixture,fallback);
assert.equal(adapted.locales.ky.schedule[1].title,'Жыйынтык');
const patch=createGuestPatch(fixture,'pub-3',{name:'Нурия',wish:'Любви!',guests_count:2,is_attending:true});
assert.equal(patch.guests[0].guests_count,2);
for(const file of['index.html','styles.css','app.js','content.json','assets/paper-texture.webp','assets/botanical-left.webp','assets/botanical-right.webp','assets/floral-divider.webp','assets/venue-watercolor.webp','assets/wax-seal.webp','assets/frame-tall.svg','assets/frame-wide.svg','assets/envelope-closed.webp','assets/envelope-opening.mp4'])assert(fs.statSync(path.join(root,file)).size>20,`Missing ${file}`);
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
assert(!/HIGGSFIELD_API_KEY|sk-[A-Za-z0-9]/.test(source),'Client secret found');
console.log('Passed: backend mapping, RSVP patch, envelope intro, routes and decorative assets.');
