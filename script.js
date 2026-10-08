const $=s=>document.querySelector(s),E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let db;try{db=JSON.parse(localStorage.bt)}catch(e){}db=db||{students:[],tests:[],cws:[],score:0};
const save=()=>{try{localStorage.bt=JSON.stringify(db)}catch(e){alert("Xotira to'ldi")}};
let cur='home',openT=null,openC=null,run=null,gm=null;
const TABS=[['home','🏠 Asosiy'],['tests','📝 Testlar'],['cw','🧩 Krosswordlar'],['st',"👥 O'quvchilar"],['tasks','📎 Vazifalarim'],['set','⚙️ Sozlamalar']];
const go=v=>{cur=v;openT=openC=null;run=null;render()};
const sorted=()=>[...db.students].sort((a,b)=>(a.f+a.n).localeCompare(b.f+b.n,'uz'));
const pr=h=>{$('#pa').innerHTML=h;print()};
function render(){const a=$('#app');
if(!db.user||!sessionStorage.in){a.innerHTML=`<div class="card auth"><h1>📚 Bilim Maydoni</h1><p>${db.user?'Tizimga kiring':'Birinchi marta: doimiy login va parol yarating'}</p><input id="l" placeholder="Login"><input id="p" type="password" placeholder="Parol"><button onclick="auth()">${db.user?'Kirish':"Ro'yxatdan o'tish"}</button></div>`;return}
a.innerHTML=`<nav>${TABS.map(t=>`<button class="${cur==t[0]?'on':'s'}" onclick="go('${t[0]}')">${t[1]}</button>`).join('')}<button class="s" onclick="sessionStorage.clear();render()">Chiqish</button></nav><div id="v"></div>`;
$('#v').innerHTML=({home,tests,cw,st,tasks,set,run:runV})[cur]();if(cur=='tasks')listTasks()}
function auth(){const l=$('#l').value.trim(),p=$('#p').value;if(!l||!p)return alert("Login va parolni kiriting");
if(!db.user){db.user={l,p};save()}else if(db.user.l!=l||db.user.p!=p)return alert("Login yoki parol xato");sessionStorage.in=1;render()}
/* ASOSIY */
function home(){const sc=db.score;return `<div class="card"><h2>Xush kelibsiz, ${E(db.user.l)}! 👋</h2><p>O'quvchilar: <b>${db.students.length}</b> · Testlar: <b>${db.tests.length}</b> · Krosswordlar: <b>${db.cws.length}</b> · O'yin ochkosi: <b>${sc}</b></p></div>
<div class="card"><h3>🎮 So'z topish o'yini</h3>${gameV()}</div>
<div class="card"><h3>📝 Mening testlarim</h3><div class="grid">${db.tests.map(t=>`<div class="item" onclick="startRun(${t.id})"><b>📁 ${E(t.name)}</b><br>${t.qs.length} ta savol<br><small>▶ Testni boshlash</small></div>`).join('')||'<i>Hali test yo\'q</i>'}</div></div>
<div class="card"><h3>🧩 Mening krosswordlarim</h3><div class="grid">${db.cws.map(c=>`<div class="item" onclick="openC=${c.id};cur='cw';render()"><b>🧩 ${E(c.name)}</b><br>${c.pl.length} ta so'z</div>`).join('')||'<i>Hali krossword yo\'q</i>'}</div></div>`}
const WORDS=['maktab','kitob','daftar','qalam','olim','bilim','matematika','fizika','kimyo','tarix','geografiya','informatika','talaba','imtihon','universitet','laboratoriya','kutubxona','adabiyot','biologiya','algebra'];
function newWord(){const w=WORDS[Math.random()*WORDS.length|0];let s;do s=[...w].sort(()=>Math.random()-.5).join('');while(s==w);gm={w,s,m:''}}
function gameV(){if(!gm)newWord();return `<p>Harflari aralashgan so'zni toping!</p><div class="big">${gm.s.toUpperCase()}</div><div class="row"><input id="gi" placeholder="So'zni yozing" onkeydown="if(event.key=='Enter')chk()"><button onclick="chk()">Tekshirish</button><button class="s" onclick="newWord();render()">O'tkazish</button></div><p>${gm.m}</p>`}
function chk(){const v=$('#gi').value.trim().toLowerCase();if(v==gm.w){db.score+=10;save();newWord();gm.m='✅ To\'g\'ri! +10 ochko'}else gm.m="❌ Noto'g'ri, yana urining";render()}
/* O'QUVCHILAR */
function st(){return `<div class="card"><h2>👥 O'quvchilar</h2><div class="row"><input id="fm" placeholder="Familiya"><input id="nm" placeholder="Ism"><button onclick="addSt()">Qo'shish</button></div></div><div class="card"><div class="row"><h3>Ro'yxat (${db.students.length})</h3><button class="g" onclick="stPdf()">📄 PDF yuklash</button></div><table>${sorted().map((s,i)=>`<tr><td>${i+1}</td><td>${E(s.f)} ${E(s.n)}</td><td style="width:50px"><button class="d" onclick="delSt(${s.id})">✕</button></td></tr>`).join('')}</table></div>`}
function addSt(){const f=$('#fm').value.trim(),n=$('#nm').value.trim();if(!f||!n)return alert("Familiya va ismni kiriting");db.students.push({id:Date.now(),f,n});save();render()}
function delSt(id){if(confirm("O'chirilsinmi?")){db.students=db.students.filter(s=>s.id!=id);save();render()}}
function stPdf(){pr(`<h2 style="text-align:center">O'quvchilar ro'yxati</h2><table><tr><th>№</th><th>Familiya va ism</th></tr>${sorted().map((s,i)=>`<tr><td>${i+1}</td><td>${E(s.f)} ${E(s.n)}</td></tr>`).join('')}</table>`)}
/* TESTLAR */
function tests(){if(openT){const t=db.tests.find(x=>x.id==openT);return `<div class="card"><div class="row"><button class="s" onclick="openT=null;render()">← Papkalar</button><h2>📁 ${E(t.name)}</h2><button class="g" onclick="testPdf(${t.id})">📄 PDF yuklash</button></div></div>
<div class="card"><h3>Yangi savol</h3><textarea id="q" rows="2" placeholder="Savol matni"></textarea>${[0,1,2,3].map(i=>`<input id="o${i}" placeholder="${'ABCD'[i]} variant">`).join('')}<select id="ca">${[0,1,2,3].map(i=>`<option value="${i}">To'g'ri javob: ${'ABCD'[i]}</option>`).join('')}</select><button onclick="addQ(${t.id})">Savolni qo'shish</button></div>
<div class="card"><h3>Savollar (${t.qs.length})</h3>${t.qs.map((q,i)=>`<div class="item" style="cursor:default;margin:6px 0"><b>${i+1}. ${E(q.q)}</b><br>${q.o.map((o,j)=>`<span style="${j==q.a?'color:var(--g);font-weight:700':''}">${'ABCD'[j]}) ${E(o)}</span>`).join(' &nbsp; ')}<br><button class="d" onclick="delQ(${t.id},${i})">O'chirish</button></div>`).join('')}</div>`}
return `<div class="card"><h2>📝 Testlar</h2><div class="row"><input id="tn" placeholder="Yangi test (papka) nomi"><button onclick="addT()">📁 Papka yaratish</button></div></div><div class="grid">${db.tests.map(t=>`<div class="card item" onclick="openT=${t.id};render()"><b>📁 ${E(t.name)}</b><br>${t.qs.length} ta savol<br><button class="d" onclick="event.stopPropagation();delT(${t.id})">O'chirish</button></div>`).join('')}</div>`}
function addT(){const n=$('#tn').value.trim();if(!n)return;db.tests.push({id:Date.now(),name:n,qs:[]});save();render()}
function delT(id){if(confirm("Papka o'chirilsinmi?")){db.tests=db.tests.filter(t=>t.id!=id);save();render()}}
function addQ(id){const q=$('#q').value.trim(),o=[0,1,2,3].map(i=>$('#o'+i).value.trim());if(!q||o.some(x=>!x))return alert("Savol va 4 ta variantni to'ldiring");db.tests.find(t=>t.id==id).qs.push({q,o,a:+$('#ca').value});save();render()}
function delQ(id,i){db.tests.find(t=>t.id==id).qs.splice(i,1);save();render()}
function testPdf(id){const t=db.tests.find(x=>x.id==id);pr(`<h2 style="text-align:center">${E(t.name)}</h2>${t.qs.map((q,i)=>`<p><b>${i+1}. ${E(q.q)}</b><br>${q.o.map((o,j)=>`${'ABCD'[j]}) ${E(o)}`).join('&emsp;')}</p>`).join('')}<h3 style="page-break-before:always">Javoblar kaliti</h3><p>${t.qs.map((q,i)=>`${i+1}-${'ABCD'[q.a]}`).join(', ')}</p>`)}
/* KROSSWORD */
function gen(items){const N=40,g=Array.from({length:N},()=>Array(N).fill('')),pl=[],miss=[];
const at=(a,b)=>a<0||b<0||a>=N||b>=N?'':g[b][a];
const ok=(w,x,y,d)=>{const dx=d?0:1,dy=d?1:0;if(x<0||y<0||x+dx*w.length>N||y+dy*w.length>N)return 0;if(at(x-dx,y-dy)||at(x+dx*w.length,y+dy*w.length))return 0;let c=0;for(let i=0;i<w.length;i++){const a=x+dx*i,b=y+dy*i,v=g[b][a];if(v){if(v!=w[i])return 0;c++}else if(at(a+dy,b+dx)||at(a-dy,b-dx))return 0}return c||!pl.length?1:0};
const put=(it,x,y,d)=>{for(let i=0;i<it.w.length;i++)g[y+(d?i:0)][x+(d?0:i)]=it.w[i];pl.push({...it,x,y,d})};
items.map(i=>({c:i.c,w:i.w.toUpperCase().replace(/\s/g,'')})).sort((a,b)=>b.w.length-a.w.length).forEach(it=>{if(!pl.length)return put(it,5,20,0);
for(const p of pl){const d=1-p.d;for(let i=0;i<it.w.length;i++)for(let j=0;j<p.w.length;j++)if(it.w[i]==p.w[j]){const x=d?p.x+(p.d?0:j):p.x+(p.d?0:j)-0;const X=d?p.x+j:p.x-i,Y=d?p.y-i:p.y+j;if(ok(it.w,X,Y,d))return put(it,X,Y,d)}}miss.push(it.w)});
const mx=Math.min(...pl.map(p=>p.x)),my=Math.min(...pl.map(p=>p.y));pl.forEach(p=>{p.x-=mx;p.y-=my});
const W=Math.max(...pl.map(p=>p.x+(p.d?1:p.w.length))),H=Math.max(...pl.map(p=>p.y+(p.d?p.w.length:1)));
const nums={};let n=0;[...pl].sort((a,b)=>a.y-b.y||a.x-b.x).forEach(p=>{const k=p.x+','+p.y;if(!nums[k])nums[k]=++n;p.n=nums[k]});return{pl,W,H,miss}}
function cwTable(c,ans){const m={},nn={};c.pl.forEach(p=>{nn[p.x+','+p.y]=p.n;for(let i=0;i<p.w.length;i++)m[(p.x+(p.d?0:i))+','+(p.y+(p.d?i:0))]=p.w[i]});let h='<table class="cw" style="width:auto">';for(let y=0;y<c.H;y++){h+='<tr>';for(let x=0;x<c.W;x++){const k=x+','+y;h+=m[k]?`<td class="f">${nn[k]?`<sup>${nn[k]}</sup>`:''}${ans?m[k]:''}</td>`:'<td class="e"></td>'}h+='</tr>'}return h+'</table>'}
function clues(c){const f=d=>c.pl.filter(p=>p.d==d).sort((a,b)=>a.n-b.n).map(p=>`<div>${p.n}. ${E(p.c)}</div>`).join('');return `<div class="row" style="align-items:flex-start"><div><h3>➡ Gorizontal</h3>${f(0)}</div><div><h3>⬇ Vertikal</h3>${f(1)}</div></div>`}
function cw(){if(openC){const c=db.cws.find(x=>x.id==openC);return `<div class="card"><div class="row"><button class="s" onclick="openC=null;render()">← Orqaga</button><h2>🧩 ${E(c.name)}</h2><button class="g" onclick="cwPdf(${c.id})">📄 PDF yuklash</button><button class="d" onclick="delC(${c.id})">O'chirish</button></div><div class="w">${cwTable(c,0)}</div>${clues(c)}<details><summary>Javoblarni ko'rish</summary><div class="w">${cwTable(c,1)}</div></details></div>`}
return `<div class="card"><h2>🧩 Krosswordlar</h2><input id="cn" placeholder="Krossword nomi"><textarea id="ci" rows="6" placeholder="Har qatorga bittadan: so'z - izoh&#10;masalan:&#10;maktab - Bilim olinadigan joy&#10;kitob - O'qish uchun"></textarea><button onclick="addC()">Krossword yaratish</button></div><div class="grid">${db.cws.map(c=>`<div class="card item" onclick="openC=${c.id};render()"><b>🧩 ${E(c.name)}</b><br>${c.pl.length} ta so'z</div>`).join('')}</div>`}
function addC(){const n=$('#cn').value.trim(),it=$('#ci').value.split('\n').map(l=>l.split(/\s+[-–]\s+/)).filter(a=>a.length>1&&a[0].trim()).map(a=>({w:a[0].trim(),c:a.slice(1).join(' - ').trim()}));
if(!n||it.length<2)return alert("Nom va kamida 2 ta \"so'z - izoh\" kiriting");const r=gen(it);if(r.miss.length)alert("Joylashmagan so'zlar: "+r.miss.join(', '));db.cws.push({id:Date.now(),name:n,...r});save();render()}
function delC(id){if(confirm("O'chirilsinmi?")){db.cws=db.cws.filter(c=>c.id!=id);openC=null;save();render()}}
function cwPdf(id){const c=db.cws.find(x=>x.id==id);pr(`<h2 style="text-align:center">${E(c.name)}</h2><p>Ism, familiya: ____________________</p>${cwTable(c,0)}${clues(c)}<div style="page-break-before:always"><h3>Javoblar</h3>${cwTable(c,1)}</div>`)}
/* TEST O'TKAZISH */
function startRun(id){const t=db.tests.find(x=>x.id==id);if(!t.qs.length)return alert("Bu testda savol yo'q");if(!db.students.length)return alert("Avval o'quvchilar bo'limida o'quvchilarni qo'shing");run={t,step:'att'};cur='run';render()}
function runV(){const r=run;
if(r.step=='att')return `<div class="card"><h2>📋 ${E(r.t.name)} — o'quvchilar jadvali</h2><p>Darsda <b>yo'q</b> o'quvchilarni belgilang:</p><table>${sorted().map(s=>`<tr><td style="width:50px"><input type="checkbox" style="width:22px;height:22px" class="ab" value="${s.id}"></td><td>${E(s.f)} ${E(s.n)}</td></tr>`).join('')}</table><br><div class="row"><button class="s" onclick="go('home')">Bekor</button><button class="g" onclick="begin()">▶ Testni boshlash</button></div></div>`;
if(r.step=='end'){const per={};r.P.forEach(s=>per[s]={ok:0,no:0});r.log.forEach(l=>per[l.s][l.ok?'ok':'no']++);
return `<div class="card"><h2>🏁 Testlar tugadi!</h2>${resH()}<div class="row"><button class="g" onclick="resPdf()">📄 Natijani PDF yuklash</button><button class="s" onclick="go('home')">Asosiyga qaytish</button></div></div>`}
const q=r.t.qs[r.qi],s=r.P[r.si%r.P.length];
return `<div class="card"><div class="row"><b>${E(r.t.name)} · Savol ${r.qi+1}/${r.t.qs.length}</b><button class="s" onclick="skip()">Savolni o'tkazish</button></div><h2>${E(q.q)}</h2>${q.o.map((o,i)=>`<button class="opt ${r.ans==i?(r.ok?'ok':'no'):''}" onclick="pick(${i})">${'ABCD'[i]}) ${E(o)}</button>`).join('')}<div class="who">👤 ${E(s)}</div>${r.ans!==null?`<p style="text-align:center;font-size:1.2rem">${r.ok?"✅ To'g'ri!":"❌ Noto'g'ri! Savol keyingi o'quvchiga o'tadi."}</p><button style="width:100%" onclick="nextQ()">Keyingisi →</button>`:''}</div>`}
function resH(){const r=run,per={};r.P.forEach(s=>per[s]={ok:0,no:0});r.log.forEach(l=>per[l.s][l.ok?'ok':'no']++);
return `<table><tr><th>O'quvchi</th><th>To'g'ri</th><th>Noto'g'ri</th></tr>${r.P.map(s=>`<tr><td>${E(s)}</td><td>✅ ${per[s].ok}</td><td>❌ ${per[s].no}</td></tr>`).join('')}</table><h3>Batafsil</h3><table><tr><th>Savol</th><th>O'quvchi</th><th>Natija</th></tr>${r.log.map(l=>`<tr><td>${l.q}</td><td>${E(l.s)}</td><td>${l.ok?"✅ To'g'ri":"❌ Noto'g'ri"}</td></tr>`).join('')}</table>${r.ab.length?`<p><b>Darsda yo'q:</b> ${r.ab.map(E).join(', ')}</p>`:''}`}
function resPdf(){pr(`<h2 style="text-align:center">${E(run.t.name)} — natijalar</h2>${resH()}`)}
function begin(){const ab=[...document.querySelectorAll('.ab:checked')].map(c=>+c.value),S=sorted();const P=S.filter(s=>!ab.includes(s.id)).map(s=>s.f+' '+s.n);if(!P.length)return alert("Kamida bitta o'quvchi qatnashishi kerak");Object.assign(run,{P,ab:S.filter(s=>ab.includes(s.id)).map(s=>s.f+' '+s.n),qi:0,si:0,log:[],ans:null,step:'q'});render()}
function pick(i){const r=run;if(r.ans!==null)return;const q=r.t.qs[r.qi];r.ans=i;r.ok=i==q.a;r.log.push({s:r.P[r.si%r.P.length],q:r.qi+1,ok:r.ok});render()}
function nextQ(){const r=run;if(r.ok)r.qi++;r.si++;r.ans=null;if(r.qi>=r.t.qs.length)r.step='end';render()}
function skip(){const r=run;r.qi++;r.ans=null;if(r.qi>=r.t.qs.length)r.step='end';render()}
/* VAZIFALAR */
const idb=()=>new Promise((res,rej)=>{const q=indexedDB.open('bt',1);q.onupgradeneeded=()=>q.result.createObjectStore('f',{keyPath:'id'});q.onsuccess=()=>res(q.result);q.onerror=rej});
const tx=async(m,f)=>{const d=await idb();return new Promise((res,rej)=>{const r=f(d.transaction('f',m).objectStore('f'));r.onsuccess=()=>res(r.result);r.onerror=rej})};
function tasks(){return `<div class="card"><h2>📎 Vazifalarim — taqdimotlar</h2><input type="file" id="fl" multiple accept=".pptx,.ppt,.pdf,.key,.odp"><button onclick="upl()">⬆ Yuklash</button></div><div class="card"><div id="tl">Yuklanmoqda…</div></div>`}
async function upl(){const fs=$('#fl').files;if(!fs.length)return alert("Fayl tanlang");try{for(const f of fs)await tx('readwrite',s=>s.put({id:Date.now()+Math.random(),name:f.name,size:f.size,date:new Date().toLocaleDateString(),blob:f}));listTasks()}catch(e){alert("Saqlab bo'lmadi")}}
async function listTasks(){let a=[];try{a=await tx('readonly',s=>s.getAll())}catch(e){}window.TL=a;$('#tl').innerHTML=a.map((f,i)=>`<div class="row" style="border-bottom:1px solid var(--b);padding:8px 0"><span>📊 <b>${E(f.name)}</b><br><small>${(f.size/1048576).toFixed(2)} MB · ${f.date}</small></span><button onclick="viewF(${i})">👁 Ko'rish</button><button class="d" onclick="delF(${i})">✕</button></div>`).join('')||"<i>Hali taqdimot yuklanmagan</i>"}
function viewF(i){const u=URL.createObjectURL(TL[i].blob);if(!window.open(u,'_blank')){const a=document.createElement('a');a.href=u;a.download=TL[i].name;a.click()}}
async function delF(i){if(confirm("O'chirilsinmi?")){await tx('readwrite',s=>s.delete(TL[i].id));listTasks()}}
/* SOZLAMALAR */
function set(){return `<div class="card"><h2>⚙️ Sozlamalar</h2><p>Login va parolni o'zgartirish</p><input id="op" type="password" placeholder="Joriy parol"><input id="nl" placeholder="Yangi login" value="${E(db.user.l)}"><input id="np" type="password" placeholder="Yangi parol"><button onclick="chg()">Saqlash</button></div>`}
function chg(){if($('#op').value!=db.user.p)return alert("Joriy parol xato");const l=$('#nl').value.trim(),p=$('#np').value;if(!l||!p)return alert("Yangi login va parolni kiriting");db.user={l,p};save();alert("O'zgartirildi ✅")}
render();