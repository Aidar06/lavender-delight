import assert from'node:assert/strict';
import fs from'node:fs';
import path from'node:path';
import{invitationIdFromPath,adaptXanoInvitation,createGuestPatch}from'../dist/backend-adapter.js';

const root=path.resolve(import.meta.dirname,'../dist');
const fallback=JSON.parse(fs.readFileSync(path.join(root,'content.json'),'utf8'));
const fixture={priglosi_id:3,names:{has:'Бекзат',wife:'Алина'},date:'2027-06-12T16:30:00',ceremonies:[{time:'16:30',ceremony_ru:'Встреча',text_ru:'Описание',ceremony_kg:'Тосуп алуу',text_kg:'Сүрөттөмө'},{time:'22:00',ceremony_ru:'Финал',text_ru:'До встречи',ceremony_kg:'Жыйынтык',text_kg:'Көрүшкөнчө'}],adress:{pl:'Банкетный зал',name:'Очень длинное название свадебного банкетного зала',adrr:'г. Бишкек, ул. Чуй, 123'},guests:[]};

assert.equal(invitationIdFromPath('/3',3),'3');
assert.equal(invitationIdFromPath('/4/',3),'4');
const adapted=adaptXanoInvitation(fixture,fallback);
assert.equal(adapted.locales.ky.schedule[1].title,'Жыйынтык');
const patch=createGuestPatch(fixture,3,{name:'Нурия',wish:'Любви!',guests_count:2,is_attending:true});
assert.equal(patch.guests[0].guests_count,2);
for(const file of['index.html','styles.css','app.js','content.json','assets/paper-texture.webp','assets/botanical-left.webp','assets/botanical-right.webp','assets/floral-divider.webp','assets/venue-watercolor.webp','assets/wax-seal.webp','assets/frame-tall.svg','assets/frame-wide.svg','assets/envelope-closed.webp','assets/envelope-opening.mp4'])assert(fs.statSync(path.join(root,file)).size>20,`Missing ${file}`);
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
assert(!/HIGGSFIELD_API_KEY|sk-[A-Za-z0-9]/.test(source),'Client secret found');
console.log('Passed: backend mapping, RSVP patch, envelope intro, routes and decorative assets.');
