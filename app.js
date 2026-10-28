/* MKT101 Arena: the engine (sign-in, XP, missions, badges, MCQ, written answers, cases, notes, lecturer tools, cloud sync).
   Ported from the MKT301 Arena. Data: bank.js, bank-x.js, bank-s.js, notes.js, cases-data.js, case-extend.js, args.js, acts.js. */
/* ---------- basics ---------- */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)], app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS={get(k,d){try{const v=localStorage.getItem('mkt101_'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('mkt101_'+k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem('mkt101_'+k)}catch(e){}}};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const LECTURER='S000001', SCORE_EMAIL='abdulla.muiz@mnu.edu.mv';

/* ---------- theme ---------- */
function theme(t){if(t)LS.set('theme',t);const cur=LS.get('theme','dark');document.documentElement.dataset.theme=cur;
  $('#tbtn').textContent=cur==='light'?'🌙':'☀️';$('#tbtn').setAttribute('aria-label',cur==='light'?'Switch to dark mode':'Switch to light mode');
  document.querySelector('meta[name=theme-color]').content=cur==='light'?'#f6f0e4':'#0d0718'}
$('#hud').onclick=e=>{if(e.target.closest('#svb'))openSave()};
$('#tbtn').onclick=()=>theme(LS.get('theme','dark')==='light'?'dark':'light');theme();

/* ---------- game model ---------- */
const LEVELS=[[0,'Intern'],[150,'Marketing Officer'],[400,'Marketing Executive'],[750,'Senior Marketing Executive'],[1200,'Marketing Manager'],[1800,'Marketing Director'],[2600,'Cluster Director'],[3600,'Chief Marketing Officer (CMO)'],[5000,'Marketing Consultant']];
const LVL_ICO=['🎫','🧑‍💼','📋','📈','🧭','🏢','🌐','👑','💎'];
const TOPIC_ICO={8:'🧪',9:'🏷️',10:'🚚',11:'🛒',12:'📣',13:'🤝',14:'🌱'},TOPIC_BADGE={8:'New Product Pro',9:'Pricing Pro',10:'Channel Pro',11:'Retail Pro',12:'Promotion Pro',13:'Sales Pro',14:'Sustainability Pro'};
const TOPICS=Object.keys(TERM.topics).map(Number);
const tName=t=>'Topic '+t+' · '+TERM.topics[t];
/* topic mastery: studied the notes, at least 15 fresh MCQs on the topic at 80% or better, and one written (paper or typed) answer */
function mastery(u,t){const m=(u.mt||{})[t]||[0,0];return {notes:!!u.log['notes:'+t],mcq:m[0]>=15&&m[1]/m[0]>=.8,att:m[0],acc:m[0]?Math.round(m[1]/m[0]*100):0,wrote:!!(u.tw||{})[t]}}
const mastered=(u,t)=>{const m=mastery(u,t);return m.notes&&m.mcq&&m.wrote};
function caseDone(u,c){return c.sections.every(s=>u.log['read:'+c.id+':'+s.id])&&c.boardroom.every((a,i)=>(u.verd||{})[c.id+':'+i])&&c.questions.filter(q=>(u.fin||{})[q.id]).length>=5}
const BADGES=[
 {id:'boarding',ico:'🎫',name:'Boarding Pass',d:'Sign in for the first time',t:u=>true},
 ...LEVELS.slice(1).map((l,i)=>({id:'lvl'+(i+2),ico:LVL_ICO[i+1],name:l[1],d:'Reach level '+(i+2)+': '+l[1],t:u=>u.xp>=l[0]})),
 {id:'fire3',ico:'🔥',name:'On Fire',d:'Practise 3 days in a row',t:u=>streak(u)>=3},
 {id:'fire7',ico:'☄️',name:'Unstoppable',d:'Practise 7 days in a row',t:u=>streak(u)>=7},
 {id:'fire14',ico:'🌋',name:'Habit Formed',d:'Practise 14 days in a row',t:u=>streak(u)>=14},
 ...TOPICS.map(t=>({id:'mt'+t,ico:TOPIC_ICO[t],name:TOPIC_BADGE[t],d:'Master Topic '+t+': study the notes, 80%+ on at least 15 MCQs, and write one answer on the topic',t:u=>mastered(u,t)})),
 {id:'scholar',ico:'📚',name:'Scholar',d:'Study the notes for all seven topics',t:u=>TOPICS.every(t=>u.log['notes:'+t])},
 {id:'hot10',ico:'🎯',name:'Hot Streak',d:'Get 10 MCQs right in a row',t:u=>u.n.bestRow>=10},
 {id:'perfect30',ico:'💯',name:'Perfect 30',d:'Score 30 out of 30 in one MCQ set',t:u=>u.n.perfect30>=1},
 {id:'speedrun',ico:'⚡',name:'Speed Run',d:'20+ MCQs in one set at 90%+, averaging 15 seconds or less',t:u=>u.n.speedrun>=1},
 {id:'sharp',ico:'🏹',name:'Sharpshooter',d:'100 MCQs right (each question counts once a day)',t:u=>u.n.mcqRight>=100},
 {id:'quiz10',ico:'🧠',name:'Quiz Machine',d:'Finish 10 MCQ sets of 10 or more',t:u=>u.n.mcqSets>=10},
 ...CASEL.map(c=>({id:'case_'+c.id,ico:c.icon,name:c.short+' Case Cracked',d:'Read all of '+c.short+', judge every Boardroom argument and finish 5 practice questions',t:u=>caseDone(u,c)})),
 {id:'voice',ico:'🎙️',name:'Boardroom Voice',d:'Judge 10 Boardroom arguments',t:u=>u.n.verdicts>=10},
 {id:'judge',ico:'⚖️',name:'Boardroom Judge',d:'15 Boardroom verdicts that match our reading',t:u=>u.n.verdictsRight>=15},
 {id:'devil',ico:'😈',name:"Devil's Advocate",d:'Spot 5 weak arguments correctly',t:u=>u.n.weakSpotted>=5},
 {id:'architect',ico:'🧱',name:'Architect',d:'Build 5 answer plans',t:u=>u.n.plans>=5},
 {id:'flawless',ico:'💎',name:'Flawless Planner',d:'3 plans with every key idea and no decoys',t:u=>u.n.perfect>=3},
 {id:'pressure',ico:'⏱️',name:'Under Pressure',d:'Finish 3 timed answers on paper',t:u=>u.n.timed>=3},
 {id:'marathon',ico:'🏃',name:'Marathon',d:'Finish 15 timed answers on paper',t:u=>u.n.timed>=15},
 {id:'longw',ico:'🖋️',name:'Long-Answer Writer',d:'Write 3 timed long answers on paper',t:u=>u.n.longs>=3},
 {id:'wordsmith',ico:'⌨️',name:'Wordsmith',d:'Type 5 answers that hit key ideas',t:u=>(u.n.typed||0)>=5},
 {id:'marked',ico:'🧑‍🏫',name:'Marked by the Pro',d:'Get a typed answer marked by your lecturer',t:u=>(u.n.reviewed||0)>=1},
 {id:'handson',ico:'🛠️',name:'Hands-On',d:'Finish 8 case activities',t:u=>u.n.acts>=8},
 {id:'mission',ico:'✅',name:'Mission Ready',d:'Complete a daily mission',t:u=>u.n.missions>=1},
 {id:'mission10',ico:'🏅',name:'Mission Master',d:'Complete 10 daily missions',t:u=>u.n.missions>=10}];
/* daily missions: 3 a day from a pool, harder as the student levels up (tier 0: levels 1-3, tier 1: 4-6, tier 2: 7-9) */
const MPOOL=[
 {id:'mcq10',t:0,k:'mcq',n:10,x:'Answer 10 new MCQs'},{id:'read2',t:0,k:'read',n:2,x:'Read 2 case sections'},{id:'verd3',t:0,k:'verdicts',n:3,x:'Judge 3 Boardroom arguments'},
 {id:'plan1',t:0,k:'plans',n:1,x:'Build 1 answer plan'},{id:'notes1',t:0,k:'notes',n:1,x:'Study 1 topic in the notes'},{id:'acts1',t:0,k:'acts',n:1,x:'Finish 1 case activity'},
 {id:'typed1',t:0,k:'typed',n:1,x:'Type 1 answer and check it'},{id:'timed1',t:0,k:'timed',n:1,x:'Finish 1 timed answer on paper'},
 {id:'mcq20',t:1,k:'mcq',n:20,x:'Answer 20 new MCQs'},{id:'right15',t:1,k:'mcqRight',n:15,x:'Get 15 new MCQs right'},{id:'mset20',t:1,k:'mset20',n:1,x:'Finish an MCQ set of 20 or more'},
 {id:'verd6',t:1,k:'verdicts',n:6,x:'Judge 6 Boardroom arguments'},{id:'vright4',t:1,k:'verdictsRight',n:4,x:'Make 4 Boardroom calls that match our reading'},
 {id:'plan3',t:1,k:'plans',n:3,x:'Build 3 answer plans'},{id:'perfect1',t:1,k:'perfect',n:1,x:'Build 1 flawless plan (every key idea, no decoys)'},
 {id:'timed2',t:1,k:'timed',n:2,x:'Finish 2 timed answers on paper'},{id:'typed2',t:1,k:'typed',n:2,x:'Type and check 2 answers'},
 {id:'mcq30',t:2,k:'mcq',n:30,x:'Answer 30 new MCQs'},{id:'right25',t:2,k:'mcqRight',n:25,x:'Get 25 new MCQs right'},{id:'mset80',t:2,k:'mset80',n:1,x:'Finish an MCQ set of 20+ with 80% or better'},
 {id:'vright6',t:2,k:'verdictsRight',n:6,x:'Make 6 Boardroom calls that match our reading'},{id:'perfect2',t:2,k:'perfect',n:2,x:'Build 2 flawless plans'},
 {id:'timed3',t:2,k:'timed',n:3,x:'Finish 3 timed answers on paper'},{id:'long1',t:2,k:'longs',n:1,x:'Write 1 long answer on paper, timed'}];
const MBONUS=[25,35,50],TIERS=['Starter','Pro','Elite'];
function tier(xp){const i=level(xp).i;return i<=2?0:i<=5?1:2}

function seeded(str){let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return ()=>{h=Math.imul(h^h>>>15,2246822507);h=Math.imul(h^h>>>13,3266489909);return ((h^=h>>>16)>>>0)/4294967296}}
function pickMissions(t){const r=seeded(today()+'|'+ME.sid),used=new Set(),out=[];
  const pool=MPOOL.filter(m=>m.t===t).concat(t?MPOOL.filter(m=>m.t===t-1):[]);
  const order=pool.map(m=>[m,r()+(m.t===t?0:.6)]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
  for(const m of order){if(out.length===3)break;if(!used.has(m.k)){used.add(m.k);out.push(m.id)}}return out}
function missions(){rollDay();return U.day.m.map(id=>MPOOL.find(m=>m.id===id)).filter(Boolean)}

let ME=null, U=null, LOAD_T=-1;
function me(){const r=LS.get('session',null);return r&&/^S0\d{5}$/.test(r.sid||'')?r:null}
function blank(){return {xp:0,log:{},days:[],badges:{},n:{verdicts:0,verdictsRight:0,weakSpotted:0,plans:0,perfect:0,timed:0,missions:0,typed:0,reviewed:0,mcq:0,mcqRight:0,mcqSets:0,bestRow:0,perfect30:0,speedrun:0,acts:0,notes:0,longs:0},day:{d:'',c:{},m:[],t:0,done:0},nick:'',hide:false,sets:{},focus:{},verd:{},plansSaved:{},act:{},long:{},fin:{},tw:{},mt:{},mq:null,mlast:[],mday:{d:'',ids:{}},mh:[]}}
function load(){const st=LS.get('u_'+ME.sid,null);LOAD_T=st?(st._t||0):-1;U=Object.assign(blank(),st||{});U.n=Object.assign(blank().n,U.n);if(!U.nick)U.nick=defaultNick(ME.name)}
function save(){U._t=Date.now();LS.set('u_'+ME.sid,U);if(ME&&ME.cloud)CLOUD.push()}
const cloudOn=()=>!!(ME&&ME.cloud&&CLOUD.ok);
function defaultNick(n){const p=String(n||'').trim().split(/\s+/);return p.length>1?p[0]+' '+p[p.length-1][0]+'.':(p[0]||'Player')}
function level(xp){let i=0;LEVELS.forEach((l,j)=>{if(xp>=l[0])i=j});const nx=LEVELS[i+1];return {i,name:LEVELS[i][1],from:LEVELS[i][0],to:nx?nx[0]:null,pct:nx?Math.round((xp-LEVELS[i][0])/(nx[0]-LEVELS[i][0])*100):100}}
function streak(u){const s=new Set(u.days);let n=0,d=new Date();const f=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');if(!s.has(f(d)))d.setDate(d.getDate()-1);while(s.has(f(d))){n++;d.setDate(d.getDate()-1)}return n}
function rollDay(){if(U.day.d!==today()||!U.day.c||!U.day.m){const t=tier(U.xp);U.day={d:today(),c:{},m:pickMissions(t),t,done:0}}}

/* award XP once per key (key=null: always); quiet: no XP toast (MCQ answers show XP in their own feedback) */
function award(key,xp,label,quiet){
  if(key&&U.log[key])return false;
  if(key){U.log[key]=1;U.gain=U.gain||{};U.gain[key]=xp}
  rollDay();
  if(!U.days.includes(today())){U.days.push(today());U.days=U.days.slice(-60);U.xp+=10;toast('📅','Daily check-in','+10 XP · streak '+streak(U))}
  const before=level(U.xp).i;U.xp+=xp;
  if(xp&&!quiet)toast('✨',label,'+'+xp+' XP');
  if(level(U.xp).i>before)toast('🚀','Level up!','You are now '+level(U.xp).name);
  checkBadges();save();hud();return true}
function count(k){rollDay();U.n[k]=(U.n[k]||0)+1;U.day.c[k]=(U.day.c[k]||0)+1;
  const ms=missions();if(!U.day.done&&ms.length&&ms.every(m=>(U.day.c[m.k]||0)>=m.n)){U.day.done=1;U.n.missions++;save();award(null,MBONUS[U.day.t],'Daily mission complete')}
  checkBadges();save()}
/* count activity once per award key (e.g. once per question per day); restart takes it back */
function countOnce(key,...ks){U.cnt=U.cnt||{};if(U.cnt[key])return;U.cnt[key]={d:today(),k:ks.filter(Boolean)};U.cnt[key].k.forEach(count)}
function uncount(test){U.cnt=U.cnt||{};rollDay();Object.keys(U.cnt).filter(test).forEach(key=>{const c=U.cnt[key];
  c.k.forEach(k=>{U.n[k]=Math.max(0,(U.n[k]||0)-1);if(c.d===today()&&U.day.c[k])U.day.c[k]--});delete U.cnt[key]})}
const MINPCT=.4,minMins=t=>Math.ceil(t*MINPCT/60);
function checkBadges(){BADGES.forEach(b=>{if(!U.badges[b.id]&&b.t(U)){U.badges[b.id]=today();toast(b.ico,'Badge unlocked: '+b.name,b.d)}})}
function toast(em,t,s){const el=document.createElement('div');el.className='toast';el.innerHTML=`<span class="em">${em}</span><div><b class="lex">${esc(t)}</b><div class="muted" style="font-size:.85rem">${esc(s)}</div></div>`;const box=$('#toasts');box.append(el);while(box.children.length>3)box.firstChild.remove();setTimeout(()=>el.remove(),2800)}

function hud(){if(!ME){$('#hud').innerHTML='';return}const L=level(U.xp);
  $('#hud').innerHTML=`<button class="pill save" id="svb" title="Save my progress" aria-label="Save my progress">💾<span class="lbl">&nbsp;Save</span></button><span class="pill fire" title="Day streak">🔥 ${streak(U)}</span><span class="pill gold" title="XP">✨ ${U.xp}</span><span class="pill lvl">${esc(L.name)}</span><span class="xpmini" title="${L.pct}% to next level"><i style="width:${L.pct}%"></i></span>`}

/* ---------- sign in ---------- */
const FLY=[['🛒','-170px','-120px'],['📣','160px','-110px'],['🏷️','-190px','40px'],['🚚','185px','60px'],['🤝','-120px','-150px'],['🎯','120px','-150px'],['🌱','-200px','-40px'],['🏆','200px','-20px'],['','-150px','110px'],['','150px','120px']];
const MOTTOS=['Every question you answer today is one less surprise tomorrow.','From Intern to Marketing Consultant: one level at a time.','Read it. Plan it. Write it with confidence.','Small steps every day add up to big results.','Your next level is one practice set away.','Great marketers are made, not born. Start now.'];
const SCENE=`<div class="scene" aria-hidden="true">${FLY.map((f,i)=>`<span class="fly ${f[0]?'':'w'}" style="--x:${f[1]};--y:${f[2]};--d:${(i*.36).toFixed(2)}s">${f[0]}</span>`).join('')}
<svg class="hero-svg" viewBox="0 0 200 170"><ellipse cx="100" cy="62" rx="34" ry="36" fill="#1b1430"/>
<path d="M46 170c4-40 22-58 54-58s50 18 54 58z" fill="#8b5cf6"/><path d="M88 112l12 26 12-26z" fill="#fff"/>
<rect x="93" y="86" width="14" height="16" rx="5" fill="#f2b98d"/><circle cx="100" cy="64" r="25" fill="#f6c39b"/>
<path d="M72 60c0-24 16-34 30-34s28 10 28 32c-6-10-16-14-24-14-10 0-24 4-34 16z" fill="#1b1430"/>
<g class="blink"><circle cx="91" cy="66" r="2.6" fill="#1b1430"/><circle cx="111" cy="66" r="2.6" fill="#1b1430"/></g>
<g fill="none" stroke="#39ff88" stroke-width="2.4"><circle cx="91" cy="66" r="8"/><circle cx="111" cy="66" r="8"/><path d="M99 66h4"/></g>
<path d="M94 78q6 4 12 0" stroke="#b5654a" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M18 170l22-44h120l22 44z" fill="#2a2f55"/>
<rect x="52" y="104" width="96" height="62" rx="8" fill="#e9ecf6"/><rect x="52" y="104" width="96" height="62" rx="8" fill="#39ff88" fill-opacity=".18" class="glow"/>
<rect x="112" y="116" width="9" height="9" rx="2" fill="#ff5a6e" transform="rotate(-8 116 120)"/><rect x="126" y="115" width="9" height="9" rx="2" fill="#35c46a"/>
<text x="100" y="146" text-anchor="middle" font-family="Lexend,sans-serif" font-weight="800" font-size="11" fill="#9aa3c8">MKT101</text>
<ellipse cx="50" cy="140" rx="10" ry="15" fill="#f6c39b"/><ellipse cx="150" cy="140" rx="10" ry="15" fill="#f6c39b"/></svg></div>`;
function gate(msg){
  app.innerHTML=`<div class="gate2"><section class="intro">${SCENE}
  <h1>Welcome to the <span>MKT101 Arena</span></h1>
  <p class="lead">Your practice ground for Introduction to Marketing, Topics 8 to 14: new products, pricing, channels, retailing, promotion, selling and sustainable marketing. Answer quick-fire questions, crack two Maldivian cases and climb from Intern to Marketing Consultant.</p>
  </section><section class="more"><ul class="perks"><li>⚡ <span><b>Quick-fire MCQs</b>: one question at a time, instant feedback and a speed bonus for fast, accurate answers.</span></li>
  <li>📖 <span><b>Cases you can explore</b>: STO and Soneva Fushi, with exhibits, hands-on activities and a Boardroom to judge.</span></li>
  <li>🧩 <span><b>Plan smarter answers</b>: build your structure with chips, then write on paper against the clock.</span></li>
  <li>🏆 <span><b>Level up</b>: earn XP, unlock badges, keep your streak and climb the class leaderboard.</span></li></ul>
  <p class="motto" id="motto">${MOTTOS[0]}</p></section>
  <div class="card signcard"><h2 style="margin-top:6px">Sign in</h2>
  <form id="f" novalidate><label for="nm">Full name</label><input type="text" id="nm" autocomplete="name" required>
  <label for="sid">Student ID</label><div class="idrow"><span class="pre">S</span><input type="text" id="sid" inputmode="numeric" maxlength="12" autocomplete="off" placeholder="0·····" aria-describedby="hn"></div>
  <div class="hint" id="hn">Type or paste your student ID. The S is optional; the numbers start with 0.</div>
  <div class="mail" id="ml"><span style="font-size:1.2rem">✉️</span><div><small><span id="mll">Your student email</span><span class="st" id="mst"></span></small><b id="mla">s0·····@student.mnu.edu.mv</b></div></div>
  <div class="err" id="er">${msg||''}</div>
  <button class="btn" id="go" disabled>${CLOUD.ok?'Continue':'Verify and start'}</button></form>
  <p class="muted" style="font-size:.8rem;margin-top:14px">${CLOUD.ok?'Sign in with your own 6-digit PIN. Your progress saves to your account, so you can carry on from any phone or laptop.':'Your progress is saved on this device. To move it to another device, use <b>Save my progress</b>.'}</p></div></div>`;
  let mi=0;const mt=setInterval(()=>{const m=$('#motto');if(!m)return clearInterval(mt);m.style.opacity=0;setTimeout(()=>{mi=(mi+1)%MOTTOS.length;m.textContent=MOTTOS[mi];m.style.opacity=1},500)},4500);
  let ok=false,seq=0;const sidIn=$('#sid'),nmIn=$('#nm');
  const ready=()=>{$('#go').disabled=!(ok&&nmIn.value.trim().length>1)};
  const check=async()=>{const d=sidIn.value.replace(/\D/g,'').slice(0,6); /* strip first, then cut: pasting "S081441" gives 081441 */if(sidIn.value!==d)sidIn.value=d;
    const ml=$('#ml'),me=++seq;ok=false;ml.className='mail';$('#mst').textContent='';$('#er').textContent='';
    if(d&&d[0]!=='0'){ml.className='mail no';$('#mst').textContent='Starts with 0';ready();return}
    const sid='S'+d;$('#mla').textContent=(sid.toLowerCase()+'·'.repeat(6-d.length))+'@student.mnu.edu.mv';$('#mll').textContent='Your student email';
    if(d.length<6){ready();return}
    if(sid===LECTURER){$('#mla').textContent='Lecturer access';}
    $('#mst').textContent='Checking…';
    let listed=true;if(typeof ROSTER!=='undefined'&&ROSTER.hashes&&ROSTER.hashes.length){
      if(!(window.crypto&&crypto.subtle)){$('#mst').textContent='';$('#er').textContent='This browser cannot check your ID. Try Chrome or Safari.';return}
      listed=ROSTER.hashes.includes(await sha(ROSTER.salt+'|'+sid))}
    if(me!==seq)return;ok=listed;ml.className='mail '+(listed?'ok':'no');$('#mst').textContent=listed?'✓ Verified':'✗ Not found';
    if(!listed)$('#er').textContent='That ID is not on the MKT101 class list. Check the numbers, or ask your lecturer.';
    else if(!nmIn.value.trim())nmIn.focus();ready()};
  sidIn.oninput=check;nmIn.oninput=ready;
  $('#f').onsubmit=e=>{e.preventDefault();if(!ok){check();return}const name=nmIn.value.trim();if(name.length<2){$('#er').textContent='Please type your full name.';nmIn.focus();return}
    const sid='S'+sidIn.value;if(CLOUD.ok)return pinStep(sid,name,mt);
    clearInterval(mt);LS.set('session',{sid,name});start()}}
/* step 2 (cloud): sign in with a 6-digit PIN, or create one the first time */
function pinStep(sid,name,mt,mode){mode=mode||'in';const card=document.querySelector('.signcard'),em=CLOUD.email(sid);
  card.innerHTML=`<h2 style="margin-top:6px">${mode==='in'?'Enter your PIN':'Create your PIN'}</h2>
  <p class="muted" style="font-size:.88rem;margin:0 0 10px">${esc(sid)} · ${esc(sid===LECTURER?'Lecturer access':em)} · <a href="javascript:void 0" id="chg">Change</a></p>
  <div class="subnav" role="tablist"><button type="button" data-pm="in" class="${mode==='in'?'on':''}">Sign in</button><button type="button" data-pm="new" class="${mode==='new'?'on':''}">First time? Create PIN</button></div>
  <form id="pf" novalidate><input type="text" autocomplete="username" value="${esc(em)}" hidden>
  <label for="pin">${mode==='in'?'Your 6-digit PIN':'Choose a 6-digit PIN'}</label><input type="password" id="pin" inputmode="numeric" maxlength="32" autocomplete="${mode==='in'?'current-password':'new-password'}" class="pinbox">
  ${mode==='new'?'<label for="pin2">Type it again</label><input type="password" id="pin2" inputmode="numeric" maxlength="6" autocomplete="new-password" class="pinbox"><p class="hint">Pick something you will remember but others can\'t guess. Not 123456 or your birthday.</p>':''}
  <div class="err" id="per"></div><button class="btn" id="pgo">${mode==='in'?'Sign in':'Create PIN and start'}</button></form>
  ${mode==='in'?'<p class="row" style="margin:12px 0 0;justify-content:space-between"><a href="javascript:void 0" id="fgt">Forgot PIN?</a><a href="javascript:void 0" id="abc" style="font-size:.85rem">My PIN has letters</a></p>':''}
  <div id="pof"></div>
  <p class="muted" style="font-size:.8rem;margin-top:14px">Your PIN protects your progress and lets you carry on from any device.</p>`;
  const er=t=>{$('#per').textContent=t},pin=$('#pin');pin.focus();
  card.querySelectorAll('[data-pm]').forEach(b=>b.onclick=()=>pinStep(sid,name,mt,b.dataset.pm));
  $('#abc')&&($('#abc').onclick=()=>{const t=pin.inputMode==='numeric';pin.inputMode=t?'text':'numeric';pin.classList.toggle('pinbox',!t);$('#abc').textContent=t?'My PIN is only numbers':'My PIN has letters';pin.focus()});
  $('#chg').onclick=()=>{clearInterval(mt);gate()};
  const offline=()=>{$('#pof').innerHTML=`<div class="fb no" style="margin-top:12px">No connection to your account right now. <a href="javascript:void 0" id="loc">Use this device only for now</a>: your progress will stay on this phone or laptop until you sign in with your PIN again.</div>`;
    $('#loc').onclick=()=>{clearInterval(mt);LS.set('session',{sid,name});start()}};
  $('#fgt')&&($('#fgt').onclick=async()=>{if(sid===LECTURER)return er('The lecturer PIN can be reset in the Firebase console (Authentication → Users).');
    er('');try{await CLOUD.reset(sid);$('#per').style.color='var(--green)';$('#per').innerHTML=`📧 We sent a reset link to <b>${esc(em)}</b>.<br>Check your MNU student inbox and the <b>spam / junk</b> folder for an email from <b>noreply@mkt101-arena.firebaseapp.com</b>. It may say <i>password</i>: that means your PIN.<br>Open the link and choose a new PIN of at least 6 characters (6 digits recommended), then come back and sign in.`}
    catch(e){$('#per').style.color='';er(CLOUD.say(e));if(CLOUD.isNetwork(e))offline()}});
  $('#pf').onsubmit=async e=>{e.preventDefault();$('#per').style.color='';const p=pin.value.trim();
    if(mode==='new'){if(!/^\d{6}$/.test(p))return er('Your PIN must be exactly 6 digits.');if(p!==$('#pin2').value.trim())return er('The two PINs don\'t match.');if(/^(\d)\1{5}$|^(123456|654321|012345)$/.test(p))return er('That PIN is too easy to guess. Choose another.')}
    else if(p.length<6)return er('Type your 6-digit PIN.');
    $('#pgo').disabled=true;$('#pgo').textContent=mode==='in'?'Signing in…':'Creating…';
    try{await (mode==='in'?CLOUD.signIn(sid,p):CLOUD.create(sid,p));clearInterval(mt);LS.set('session',{sid,name,cloud:true});start()}
    catch(e){$('#pgo').disabled=false;$('#pgo').textContent=mode==='in'?'Sign in':'Create PIN and start';er(CLOUD.say(e));if(CLOUD.isNetwork(e))offline()}}}
async function signOut(){if(ME&&ME.cloud){await CLOUD.flush();await CLOUD.signOut()}LS.del('session');ME=null;U=null;hud();location.hash='#/';gate()}

/* ---------- layout ---------- */
const NAV=[['#/','Home'],['#/mcq','Section A · MCQ'],['#/short','Section B · Written answers'],['#/cases','Section C · Cases'],['#/notes','Study notes'],['#/badges','Badges'],['#/board','Leaderboard']];
function shell(active,body){
  const nav=NAV.concat(ME.sid===LECTURER?[['#/lecturer','Lecturer']]:[]).map(n=>`<a href="${n[0]}" class="${n[0]===active?'on':''}">${n[1]}</a>`).join('');
  app.innerHTML=`<div class="wrap"><nav class="tabs">${nav}</nav><main>${body}</main>
  <footer><div class="row"><span>Signed in as <b>${esc(ME.name)}</b> · ${esc(ME.sid)}</span><button class="btn ghost sm" id="so">Sign out</button></div>
  <p style="margin-top:10px">Practice material only. Write your full answers on paper. · <a href="javascript:void 0" id="help">? How it works</a></p></footer></div>`;
  $('#so').onclick=signOut;$('#help').onclick=()=>tour(0);scrollTo(0,0)}

/* ---------- restart: remove a question's progress and the XP it earned ---------- */
const XP_DEFAULT={typed:20,plan:15,perfect:10,timed:30,check:0,ltimed:40,lmark:0};
function xpFor(test){U.gain=U.gain||{};return Object.keys(U.log).filter(test).reduce((t,k)=>t+(k in U.gain?U.gain[k]:(XP_DEFAULT[k.split(':')[0]]||0)),0)}
function restartItem(test,what,clear){const x=Math.min(xpFor(test),U.xp);
  if(!confirm(`Restart ${what}?\n\nYour plan, timer and answers for it will be cleared${x?`, and the ${x} XP it earned will be removed`:''}. Badges you already have are kept.`))return false;
  Object.keys(U.log).filter(test).forEach(k=>{delete U.log[k];delete U.gain[k]});uncount(test);U.xp-=x;clear();save();hud();
  toast('↺','Restarted',x?'−'+x+' XP · start fresh':'Start fresh');return true}
const qKeys=id=>k=>k.startsWith('plan:'+id+':')||k.startsWith('typed:'+id+':')||k==='perfect:'+id||k.startsWith('timed:'+id+':')||k.startsWith('check:'+id+':');

/* ---------- backup and restore (no server: a signed code the student keeps) ---------- */
const b64e=t=>btoa(unescape(encodeURIComponent(t))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d=t=>decodeURIComponent(escape(atob(t.replace(/-/g,'+').replace(/_/g,'/'))));
const bytesB64=u=>{let t='';for(let i=0;i<u.length;i+=8192)t+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(t).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const b64Bytes=t=>Uint8Array.from(atob(t.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const pipe=async(data,S)=>new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(S)).arrayBuffer());
/* MKT101Z = gzip-compressed (short enough to email); MKT101B = plain, for browsers without compression */
async function backupCode(){const json=JSON.stringify({v:1,s:ME.sid,at:today(),u:U});let tag='MKT101B',j;
  if(window.CompressionStream){try{j=bytesB64(await pipe(new TextEncoder().encode(json),new CompressionStream('gzip')));tag='MKT101Z'}catch(e){}}
  if(!j)j=b64e(json);return tag+'-'+j+'-'+(await sha('mkt101-backup|'+j)).slice(0,10)}
async function restore(text){const m=String(text).replace(/\s+/g,'').match(/(MKT101[BZ])-([A-Za-z0-9_-]+)-([0-9a-f]{10})/);
  if(!m)return 'That doesn\'t look like an MKT101 backup code.';
  if((await sha('mkt101-backup|'+m[2])).slice(0,10)!==m[3])return 'This backup is damaged or incomplete. Copy the whole code, or use the backup file.';
  let p;try{p=JSON.parse(m[1]==='MKT101Z'?new TextDecoder().decode(await pipe(b64Bytes(m[2]),new DecompressionStream('gzip'))):b64d(m[2]))}catch(e){return 'This backup could not be read on this browser. Try Chrome or Safari, or use the backup file.'}
  if(p.s!==ME.sid)return 'This backup belongs to a different student ID ('+esc(p.s)+'). Sign in with that ID to restore it.';
  if(!confirm(`Restore your backup from ${p.at}?\n\nBackup: ${p.u.xp} XP\nThis device now: ${U.xp} XP\n\nYour progress on this device will be replaced.`))return '';
  U=Object.assign(blank(),p.u);U.n=Object.assign(blank().n,U.n);save();closeModal();hud();home();toast('💾','Progress restored',U.xp+' XP · '+level(U.xp).name);return ''}
const markSaved=()=>LS.set('bk_'+ME.sid,today());
async function downloadBackup(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([await backupCode()],{type:'text/plain'}));a.download='mkt101-progress-'+ME.sid+'-'+today()+'.txt';a.click();markSaved();toast('💾','Backup saved','Keep the file somewhere safe')}
async function emailBackup(){const c=await backupCode();markSaved();
  location.href='mailto:'+SCORE_EMAIL+'?subject='+encodeURIComponent('MKT101 progress backup: '+ME.name+' ('+ME.sid+')')+'&body='+encodeURIComponent(`Hello,\n\nHere is my MKT101 Arena progress backup (${U.xp} XP, ${level(U.xp).name}, ${today()}).\n\n${c}\n\nThank you,\n${ME.name}\n`);
  return c.length}
/* first-time tour: 4 steps, re-openable from the footer */
const TOUR=[['⚡','Quick-fire MCQs','Section A gives you one question at a time with the reason straight away. Correct answers earn XP; fast <b>and</b> accurate sets earn a speed bonus. Answers given before you could read the question earn nothing.'],['🧩','Plan with chips','Every question starts with a plan. Tap the ideas you would use, then check your plan. Some chips are decoys, and the feedback explains why.'],
 ['🏁','Finish your way','After planning, choose: <b>📝 Plan only</b> to move on, <b>✍️ Write on paper</b> against the clock, or <b>⌨️ Type my answer</b> (or speak it with 🎤) for an automatic check of the key ideas. Your lecturer may mark typed answers too.'],
 ['✨','XP, missions and badges','Earn XP for answering, reading, planning and writing. Three daily missions change every day and get tougher as you level up. Unlock badges and climb the leaderboard.'],
 ['💾','Keep your progress safe','Your progress lives on this device. Tap <b>💾 Save</b> in the top bar to email a copy to your lecturer or download it.']];
function tour(n){closeModal();const t=n===TOUR.length-1&&cloudOn()?['☁️','Your progress follows you','You signed in with your PIN, so your progress saves to your account automatically. Carry on from any phone or laptop. Tap <b>💾 Save</b> any time for an extra backup copy.']:TOUR[n],m=document.createElement('div');m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','How it works');
  const done=()=>{U.tour=1;save();closeModal()};
  m.innerHTML=`<div class="card" style="text-align:center"><button class="x" aria-label="Close">✕</button><div style="font-size:2.6rem;margin-top:6px">${t[0]}</div>
  <p class="muted" style="font:700 .75rem Lexend;letter-spacing:.08em;margin:6px 0 2px">STEP ${n+1} OF ${TOUR.length}</p><h2 style="margin:0 0 8px">${t[1]}</h2><p style="color:var(--ink2)">${t[2]}</p>
  <div class="dots" style="justify-content:center;margin:6px 0 14px">${TOUR.map((_,j)=>`<span class="dot ${j===n?'on':j<n?'done':''}" style="width:12px;height:12px"></span>`).join('')}</div>
  <div class="row" style="justify-content:center">${n?'<button class="btn ghost" id="tb">← Back</button>':'<button class="btn ghost" id="ts">Skip</button>'}<button class="btn" id="tn">${n<TOUR.length-1?'Next →':'Let\'s go 🚀'}</button></div></div>`;
  document.body.append(m);m.querySelector('.x').onclick=done;m.onclick=e=>{if(e.target===m)done()};$('#tn').focus();
  $('#tn').onclick=()=>n<TOUR.length-1?tour(n+1):done();$('#tb')&&($('#tb').onclick=()=>tour(n-1));$('#ts')&&($('#ts').onclick=done)}

/* popup opened from the 💾 button in the top bar */
function closeModal(){document.querySelector('.modal')?.remove()}
function openSave(){closeModal();const last=LS.get('bk_'+ME.sid,''),L=level(U.xp);
  const m=document.createElement('div');m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Save my progress');
  m.innerHTML=`<div class="card"><button class="x" aria-label="Close">✕</button><h2 style="margin-right:40px">💾 Save my progress</h2>
  <p class="muted" style="font-size:.9rem;margin:0">${U.xp} XP · ${esc(L.name)} · ${Object.keys(U.badges).length} badge${Object.keys(U.badges).length===1?'':'s'} · 🔥 ${streak(U)}<br>${last?'Last saved '+last:'Not saved yet'}</p>
  ${cloudOn()?`<p style="margin:10px 0 0">${syncChip()}</p><p style="font-size:.92rem;margin:10px 0 0">Your progress saves to your account automatically. These copies are an extra backup.</p>`:'<p style="font-size:.92rem;margin:12px 0 0">Your progress lives on this device only. Keep a copy so you never lose it.</p>'}
  <button class="opt" id="mem"><span class="em">📧</span><span><b>Email a copy to my lecturer</b><small>Opens your email app with your backup ready to send to ${SCORE_EMAIL}. If you ever lose your progress, your lecturer can send it back.</small></span></button>
  <button class="opt" id="mdl"><span class="em">⬇️</span><span><b>Download a copy to this device</b><small>Saves a small .txt file. Open it on another device to carry on.</small></span></button>
  <button class="opt" id="mcp"><span class="em">📋</span><span><b>Copy backup code</b><small>Paste it into a note or a message to yourself.</small></span></button>
  <p style="margin:14px 0 0"><a href="javascript:void 0" id="mrs">Restore a backup on this device →</a></p>
  <div id="mrp" class="hide"><textarea id="mrt" style="min-height:80px;margin-top:8px" placeholder="MKT101Z-..."></textarea>
  <div class="row" style="margin-top:8px"><input type="file" id="mrf" accept=".txt,text/plain" style="max-width:100%;color:var(--ink2)"><button class="btn gold sm" id="mrgo">Restore</button></div></div>
  <div class="err" id="mer"></div></div>`;
  document.body.append(m);const k=e=>{if(e.key==='Escape'){closeModal();removeEventListener('keydown',k)}};addEventListener('keydown',k);
  m.onclick=e=>{if(e.target===m)closeModal()};m.querySelector('.x').onclick=closeModal;m.querySelector('#mem').focus();
  $('#mem').onclick=async()=>{const n=await emailBackup();$('#mer').style.color='var(--muted)';$('#mer').textContent=n>1800?'Your email app should open with the backup inside. If the code arrives cut off, download a copy and attach the file instead.':'Your email app should open. Press send to finish.'};
  $('#mdl').onclick=downloadBackup;
  $('#mcp').onclick=async()=>{const c=await backupCode();try{await navigator.clipboard.writeText(c);markSaved();toast('📋','Backup code copied','Keep it somewhere safe')}catch(e){$('#mrp').classList.remove('hide');$('#mrt').value=c;$('#mer').textContent='Copy the code above and keep it somewhere safe.'}};
  $('#mrs').onclick=()=>$('#mrp').classList.toggle('hide');
  $('#mrf').onchange=async e=>{const f=e.target.files[0];if(f)$('#mrt').value=(await f.text()).trim()};
  $('#mrgo').onclick=async()=>{$('#mer').style.color='';$('#mer').textContent=await restore($('#mrt').value)}}
function backupCard(){
  const last=LS.get('bk_'+ME.sid,'');$('#bkl').textContent=last?'Last saved '+last:'Not saved yet';
  $('#bkd').onclick=async()=>{await downloadBackup();$('#bkl').textContent='Last saved '+today()};
  $('#bkc').onclick=openSave;
  $('#bkr').onclick=()=>$('#bkp').classList.toggle('hide');
  $('#bkf').onchange=async e=>{const f=e.target.files[0];if(f)$('#bkt').value=(await f.text()).trim()};
  $('#bkgo').onclick=async()=>{$('#bke').textContent=await restore($('#bkt').value)}}

/* ---------- home ---------- */
function topicGrid(){return `<div class="tcells">${TOPICS.map(t=>{const m=mastery(U,t),ok=mastered(U,t);
  return `<a class="tcell ${ok?'got':''}" href="#/notes/${t}"><b>${TOPIC_ICO[t]} Topic ${t}${ok?' ✓':''}</b><span>${esc(TERM.topics[t])}</span>
  <div class="tmarks"><i class="${m.notes?'on':''}" title="Notes studied">📖</i><i class="${m.mcq?'on':''}" title="80%+ on 15 MCQs">🎯 ${m.att?m.acc+'%':'–'}</i><i class="${m.wrote?'on':''}" title="Written answer">✍️</i></div></a>`}).join('')}</div>`}
function home(){
  rollDay();const L=level(U.xp),got=Object.keys(U.badges).length;
  const GO={read:'#/cases',verdicts:'#/cases',verdictsRight:'#/cases',plans:'#/short',timed:'#/short',perfect:'#/short',typed:'#/short',mcq:'#/mcq',mcqRight:'#/mcq',mset20:'#/mcq',mset80:'#/mcq',notes:'#/notes',acts:'#/cases',longs:'#/long'};
  const ms=missions().map(m=>{const v=Math.min(U.day.c[m.k]||0,m.n);return `<div class="mission"><span class="tick ${v>=m.n?'on':''}">${v>=m.n?'✓':''}</span><div style="flex:1">${esc(m.x)}<div class="bar" style="margin-top:6px"><i style="width:${v/m.n*100}%"></i></div></div><span class="muted">${v}/${m.n}</span>${v<m.n?`<a class="btn ghost sm" href="${GO[m.k]||'#/mcq'}" style="min-height:32px;padding:4px 10px">Go</a>`:''}</div>`}).join('');
  const caseCards=CASEL.map(c=>{const read=c.sections.filter(s=>U.log['read:'+c.id+':'+s.id]).length;return `<a class="card zone" href="#/case/${c.id}/read"><div class="em">${c.icon}</div><h3>${esc(c.short)}</h3><p class="muted" style="font-size:.9rem">${esc(c.title)}</p><div class="bar"><i style="width:${read/c.sections.length*100}%;background:var(--teal)"></i></div><p class="muted" style="font-size:.8rem;margin:6px 0 0">${read}/${c.sections.length} sections read${U.badges['case_'+c.id]?' · ✓ cracked':''}</p></a>`}).join('');
  const live=U.mq&&!U.mq.done&&U.mq.i<U.mq.ids.length;
  shell('#/',`
  <div class="card hero"><div class="ring" style="--p:${L.pct}"><div><b>${L.i+1}</b><small>LEVEL</small></div></div>
  <div><h1>Welcome back, ${esc(String(ME.name).split(' ')[0])}</h1><p class="muted" style="margin:0">${LVL_ICO[L.i]} ${esc(L.name)} · ${L.to?(L.to-U.xp)+' XP to '+LEVELS[L.i+1][1]:'Top level reached'}</p>
  <div class="stats"><div class="stat"><b>${U.xp}</b><span>XP</span></div><div class="stat"><b>🔥 ${streak(U)}</b><span>day streak</span></div><div class="stat"><b>${got}/${BADGES.length}</b><span>badges</span></div><div class="stat"><b>${TOPICS.filter(t=>mastered(U,t)).length}/7</b><span>topics mastered</span></div></div></div></div>
  <div class="grid g2" style="margin-top:16px">
   <div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Today's mission</h2><span class="tag">${TIERS[U.day.t]} · +${MBONUS[U.day.t]} XP</span></div><p class="muted" style="font-size:.9rem;margin-top:6px">${U.day.done?'✅ Done for today. New missions tomorrow.':'Complete all three for the bonus. New missions every day, and they get tougher as you level up.'}</p>${ms}</div>
   <a class="card zone quick" href="#/mcq"><div class="em">⚡</div><h2 style="margin:4px 0">${live?'Carry on with your MCQ set':'Quick MCQ round'}</h2><p class="muted" style="font-size:.92rem">${live?`Question ${U.mq.i+1} of ${U.mq.ids.length}. Pick up where you left off.`:'Up to 30 questions, one at a time, with instant feedback. Be quick and accurate for a speed bonus.'}</p><span class="btn" style="margin-top:6px">${live?'Resume →':'Start →'}</span></a>
  </div>
  <h2 style="margin-top:26px">Topic mastery</h2><p class="muted" style="margin-top:-4px;font-size:.9rem">Each topic badge needs 📖 the notes studied, 🎯 80%+ on at least 15 MCQs, and ✍️ one written answer on the topic.</p>${topicGrid()}
  <h2 style="margin-top:26px">Practice</h2>
  <div class="grid g3">
   <a class="card zone" href="#/mcq"><div class="em">🎯</div><h3>Section A · MCQ</h3><p class="muted" style="font-size:.9rem">Question by question, with reasons and a speed bonus.</p><div class="chipline"><span class="tag">${BANK.mcq.length} questions</span></div></a>
   <a class="card zone" href="#/short"><div class="em">🧩</div><h3>Section B · Written answers</h3><p class="muted" style="font-size:.9rem">Plan short answers with chips, then write long answers against the clock.</p><div class="chipline"><span class="tag">${BANK_S.length} short</span><span class="tag">${BANK.essays.length} long</span></div></a>
   <a class="card zone" href="#/notes"><div class="em">📖</div><h3>Study notes</h3><p class="muted" style="font-size:.9rem">Key ideas, diagrams, terms and quick checks for every topic.</p><div class="chipline"><span class="tag">Topics 8–14</span></div></a>
  </div>
  <h2 style="margin-top:26px">Section C · Case studies</h2>
  <div class="grid g2">${caseCards}</div>
  <div class="grid g2" style="margin-top:26px">
   <div class="card"><h2>Recent badges</h2>${got?`<div class="badges">${BADGES.filter(b=>U.badges[b.id]).sort((a,b)=>U.badges[a.id]<U.badges[b.id]?1:-1).slice(0,4).map(b=>`<div class="badge got"><div class="ico">${b.ico}</div><b>${b.name}</b></div>`).join('')}</div>`:'<p class="muted">None yet. Start an MCQ round to earn your first.</p>'}<p style="margin:12px 0 0"><a href="#/badges">See all badges →</a></p></div>
   <div class="card" id="bk"><div class="row" style="justify-content:space-between"><h2 style="margin:0">💾 Save my progress</h2><span class="tag" id="bkl"></span></div>
  <p class="muted" style="font-size:.9rem;margin:8px 0 12px">${cloudOn()?'Your progress saves to your account. A backup copy is an extra safety net.':'Your progress lives on this device only. Save a backup to move it to another phone or laptop, or to keep it safe before clearing your browser.'}</p>
  <div class="row"><button class="btn" id="bkd">⬇ Download backup</button><button class="btn ghost" id="bkc">📧 Email or copy…</button><button class="btn ghost" id="bkr">Restore</button></div>
  <div id="bkp" class="hide" style="margin-top:14px"><label for="bkt">Paste your backup code, or choose your backup file</label><textarea id="bkt" style="min-height:90px" placeholder="MKT101Z-..."></textarea>
  <div class="row" style="margin-top:10px"><input type="file" id="bkf" accept=".txt,text/plain" style="max-width:100%;color:var(--ink2)"><button class="btn gold" id="bkgo">Restore</button></div><div class="err" id="bke"></div></div></div></div>`);
  backupCard()}

/* ---------- Section B: short answers (BANK_S) and long answers (BANK.essays) ---------- */
function writtenTabs(on){return `<div class="subnav"><a class="sbtn ${on==='s'?'on':''}" href="#/short">🧩 Short answers · 6 marks</a><a class="sbtn ${on==='l'?'on':''}" href="#/long">🖋️ Long answers · 10 marks</a></div>`}
function shortPage(topic){
  if(topic&&TOPICS.includes(topic)&&U.stopic!==topic){U.stopic=topic;clearPlans(U.sets._s);U.sets._s=null;U.focus=U.focus||{};U.focus._s=0}
  let tp=U.stopic||0;if(tp&&!TOPICS.includes(tp))tp=0;const pool=BANK_S.filter(q=>!tp||q.t===tp);
  if(!U.sets._s||!U.sets._s.every(id=>pool.some(q=>q.id===id))){U.sets._s=drawS(pool,[]);save()}
  const qs=U.sets._s.map(id=>BANK_S.find(q=>q.id===id)).filter(Boolean),done=BANK_S.filter(q=>(U.fin||{})[q.id]).length;
  shell('#/short',`<h1>Section B · Written answers</h1>${writtenTabs('s')}<p class="muted">${BANK_S.length} short-answer questions across Topics 8–14. Each set has up to 6 questions worth 6 marks: plan with chips, then finish your way: plan only, write on paper (about 8 minutes), or type your answer.</p>
  <div class="card" style="margin-bottom:14px"><div class="bar"><i style="width:${done/BANK_S.length*100}%;background:var(--teal)"></i></div><p class="muted" style="font-size:.8rem;margin:6px 0 12px">${done}/${BANK_S.length} questions finished so far</p>
  <label for="stp" style="margin-top:0">Topic</label><div class="row"><select id="stp"><option value="0">All topics</option>${TOPICS.map(t=>`<option value="${t}" ${t===tp?'selected':''}>${esc(tName(t))}</option>`).join('')}</select>
  <button class="btn gold" id="ns">🎲 New set</button></div></div><div id="qs"></div>`);
  $('#stp').onchange=()=>{U.stopic=+$('#stp').value;clearPlans(U.sets._s);U.sets._s=drawS(BANK_S.filter(q=>!U.stopic||q.t===U.stopic),U.sets._s);U.focus=U.focus||{};U.focus._s=0;save();location.hash='#/short'+(U.stopic?'/t/'+U.stopic:'');shortPage()};
  const fresh=ids=>{clearPlans(U.sets._s);U.sets._s=ids;U.focus=U.focus||{};U.focus._s=0;save();shortPage()};
  $('#ns').onclick=()=>{if(confirm('Start a new random set? Your current plans and timers will be cleared.'))fresh(drawS(pool,U.sets._s))};
  player({key:'_s',qs,o:q=>({short:1,secs:480}),next:()=>fresh(drawS(pool,U.sets._s)),weak:()=>{U.stopic=0;fresh(weakSet(BANK_S,6,q=>tk(q,{short:1}),U.sets._s))}})}
function drawS(pool,prev){const fresh=pool.filter(q=>!prev.includes(q.id));return shuffle(fresh.length>=Math.min(6,pool.length)?fresh:pool).slice(0,6).map(q=>q.id)}

const LMINS=TERM.longMins||18;
const longKeys=id=>k=>k.startsWith('ltimed:'+id+':')||k.startsWith('lmark:'+id+':');
function longPage(){const L=U.long||{};
  shell('#/short',`<h1>Section B · Written answers</h1>${writtenTabs('l')}<p class="muted">Ten-mark questions to write on paper in about ${LMINS} minutes. Read the plan guide, write against the clock, then mark yourself with the rubric and compare with the model answer.</p>
  ${TOPICS.map(t=>`<h3 style="margin-top:18px">${TOPIC_ICO[t]} ${esc(tName(t))}</h3><div class="grid g2">${BANK.essays.filter(e=>e.t===t).map(e=>{const s=L[e.id]||{};
    return `<a class="card zone" href="#/long/${e.id}" style="padding:16px"><div class="chipline" style="margin:0 0 6px"><span class="tag">${e.b==='K'?'Explain':'Apply'}</span><span class="tag">${s.done?'✓ Marked '+s.total+'/10':s.step?'In progress':'10 marks'}</span></div><p style="margin:0;font-size:.95rem">${esc(e.q)}</p></a>`}).join('')}</div>`).join('')}`)}
function longView(id){const e=BANK.essays.find(x=>x.id===id);if(!e)return longPage();U.long=U.long||{};const s=U.long[id]||(U.long[id]={step:0,mk:{}});
  const max=e.marks.reduce((t,r)=>t+r[1],0),tot=e.marks.reduce((t,r,i)=>t+Math.min(r[1],+(s.mk[i]||0)),0),re=()=>longView(id);
  shell('#/short',`<p><a href="#/long">← Long answers</a></p><div class="card qcard" id="lq"><div class="qmeta"><span class="tag">${TOPIC_ICO[e.t]} Topic ${e.t}</span><span class="tag">${max} marks</span><span class="tag">About ${LMINS} min</span><button class="btn ghost sm rst" data-a="restart">↺ Restart</button></div>
  <h2 style="font-weight:600">${esc(e.q)}</h2><div class="steps">${['1 · Plan','2 · Write','3 · Mark'].map((x,j)=>`<span class="${j===s.step?'on':j<s.step||s.done?'done':''}">${j<s.step?'✓ ':''}${x}</span>`).join('')}</div>
  ${s.step===0?`<details class="mine" open><summary>How to build your answer</summary><ol style="margin:8px 0 0;padding-left:1.2em">${e.guide.map(g=>`<li>${esc(g)}</li>`).join('')}</ol></details>
   <h4>How it is marked</h4><div class="tablewrap"><table><tr><th>Part</th><th>Marks</th><th>What earns them</th></tr>${e.marks.map(r=>`<tr><td>${esc(r[0])}</td><td>${r[1]}</td><td>${esc(r[2])}</td></tr>`).join('')}</table></div>
   <div class="row" style="margin-top:14px"><button class="btn" data-a="go">I'm ready to write →</button></div>`
  :s.step===1?`<div class="timer" id="t-l_${id}">${LMINS}:00</div><div class="row" style="justify-content:center"><button class="btn" data-a="tgo">Start</button><button class="btn ghost" data-a="tstop">Stop</button><button class="btn gold" data-a="done">I've finished writing</button></div>
   <p class="muted" style="text-align:center;font-size:.85rem;margin-top:10px">Write your full answer on paper. Plan for 2–3 minutes, then write. <a href="javascript:void 0" data-a="back">Back to the guide</a></p>`
  :`<p>Mark your answer honestly with the rubric. Then open the model answer.</p>${e.marks.map((r,i)=>`<div class="sortrow"><div><b>${esc(r[0])}</b><div class="muted" style="font-size:.85rem">${esc(r[2])}</div></div><select data-mk="${i}" ${s.done?'disabled':''}>${Array.from({length:r[1]+1},(_,n)=>`<option ${+(s.mk[i]||0)===n?'selected':''}>${n}</option>`).join('')}</select></div>`).join('')}
   <p style="margin-top:14px;font:700 1.2rem Lexend">${tot}/${max}</p>
   ${s.done?`<div class="fb ok"><b>Marked.</b> ${tot>=8?'Excellent work.':tot>=5?'A good base. Compare with the model to find the missing points.':'Read the model answer and the notes for this topic, then try again another day.'}</div>`:'<button class="btn" data-a="fin">Save my mark</button>'}
   <details class="mine" ${s.done?'open':''}><summary>Model answer</summary>${e.model.map(p=>`<p>${esc(p)}</p>`).join('')}</details>
   <div class="row" style="margin-top:12px"><a class="btn ghost" href="#/notes/${e.t}">Topic ${e.t} notes</a><a class="btn ghost" href="#/long">More long answers</a></div>`}</div>`);
  const el=$('#lq'),A=a=>el.querySelector(`[data-a="${a}"]`);
  A('restart').onclick=()=>restartItem(longKeys(id),'this long answer',()=>{delete U.long[id];LS.del('tm_l_'+id);clearInterval(TIMERS['l_'+id])})&&re();
  A('go')&&(A('go').onclick=()=>{s.step=1;save();re()});A('back')&&(A('back').onclick=()=>{LS.del('tm_l_'+id);clearInterval(TIMERS['l_'+id]);s.step=0;save();re()});
  if(s.step===1)timer('l_'+id,LMINS*60,el,ok=>{s.step=2;if(ok){countOnce('ltimed:'+id+':'+today(),'timed','longs');award('ltimed:'+id+':'+today(),40,'Long answer written');U.tw=U.tw||{};U.tw[e.t]=1;checkBadges()}else noTimeXP(LMINS*60);save();re()});
  el.querySelectorAll('[data-mk]').forEach(x=>x.onchange=()=>{s.mk[x.dataset.mk]=+x.value;save();re()});
  A('fin')&&(A('fin').onclick=()=>{s.done=true;s.total=tot;award('lmark:'+id+':'+today(),tot*2,'Long answer self-marked');save();re()})}

/* ---------- study notes (data in notes.js) ---------- */
function diagramHTML(d){
 const cap=d.title?`<figcaption>${esc(d.title)}</figcaption>`:'';const sub=x=>x?`<small>${esc(x)}</small>`:'';let body='';
 if(d.type==='flow')body=`<ol class="dflow${d.steps.length>5?' dlong':''}">${d.steps.map(([h,s],i)=>`<li><span class="dn">${i+1}</span><b>${esc(h)}</b>${sub(s)}</li>`).join('')}</ol>${d.loop?`<p class="dloop">↻ ${esc(d.loop)}</p>`:''}`;
 else if(d.type==='grid')body=`<div class="dgrid"><span class="dyl">${esc(d.yl)}</span><div class="dbox"><span class="dyv">${esc(d.y[0])}</span><span class="dyv">${esc(d.y[1])}</span>
   ${d.cells.map(([h,s],i)=>`<div class="dcell c${i}"><b>${esc(h)}</b>${sub(s)}</div>`).join('')}<span></span><span class="dxv">${esc(d.x[0])}</span><span class="dxv">${esc(d.x[1])}</span></div><span class="dxl">${esc(d.xl)}</span></div>`;
 else if(d.type==='pyramid')body=`<div class="dpyr">${d.levels.map(([h,s],i)=>`<div style="width:${Math.round(40+60*i/Math.max(1,d.levels.length-1))}%"><b>${esc(h)}</b>${sub(s)}</div>`).join('')}</div>${d.note?`<p class="dloop">${esc(d.note)}</p>`:''}`;
 else if(d.type==='rings'){const r=k=>k>=d.rings.length?'':`<div class="dring r${k}"><b>${esc(d.rings[k][0])}</b>${sub(d.rings[k][1])}${r(k+1)}</div>`;body=r(0)}
 else if(d.type==='compare')body=`<div class="dcmp">${d.cols.map(([h,items])=>`<div><b>${esc(h)}</b><ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>`;
 return `<figure class="dia">${cap}${body}</figure>`}
const listHTML=l=>`<ul>${l.map(x=>`<li>${Array.isArray(x)?`<b>${esc(x[0])}:</b> ${esc(x[1])}`:esc(x)}</li>`).join('')}</ul>`;
function ideaHTML(c,k){const ps=[].concat(c.p||[]);
 return `<section class="card concept" id="n-i${k}" style="margin-bottom:12px"><h3>${esc(c.h)}</h3>${ps.map(x=>`<p>${esc(x)}</p>`).join('')}${c.l?listHTML(c.l):''}${c.dia?diagramHTML(c.dia):''}${c.more?[].concat(c.more).map(x=>`<p>${esc(x)}</p>`).join(''):''}
  ${c.eg?`<p class="eg"><b>Maldives example:</b> ${esc(c.eg)}</p>`:''}${c.tip?`<p class="tip"><b>Tip:</b> ${esc(c.tip)}</p>`:''}</section>`}
const GEMINI='https://gemini.google.com/app';
function notesPage(sub){const N=NOTES.topics8,t=parseInt(sub,10),T=N.topics[t];
 if(!T){shell('#/notes',`<h1>Study notes</h1><p class="muted">${esc(N.intro)}</p>
  <div class="card" style="margin-bottom:16px"><h3>How to use these notes</h3><div class="nsteps">${N.how.map(([h,s],i)=>`<div><b>${i+1}. ${esc(h)}</b><span>${esc(s)}</span></div>`).join('')}</div></div>
  <div class="ntopics">${TOPICS.filter(x=>N.topics[x]).map(x=>`<a class="ntopic" href="#/notes/${x}"><span class="kick">${TOPIC_ICO[x]} Topic ${x}${U.log['notes:'+x]?' · ✓ studied':''}</span><b>${esc(TERM.topics[x])}</b><span>${esc(N.topics[x].sum)}</span></a>`).join('')}</div>
  ${[].concat(N.answer||[]).map(A=>`<div class="card" style="margin-top:18px"><h3>${esc(A.h)}</h3><p class="muted">${esc(A.p)}</p>${A.dia?diagramHTML(A.dia):''}${listHTML(A.l)}
   ${A.links?`<div class="row">${A.links.map(([n,h])=>`<a class="btn ghost sm" href="${h}">${esc(n)} →</a>`).join('')}</div>`:''}</div>`).join('')}`);return}
 const tps=TOPICS.filter(x=>N.topics[x]),i=tps.indexOf(t),prev=tps[i-1],next=tps[i+1],W=T.worked,studied=!!U.log['notes:'+t];
 const jumps=[['n-min','In one minute'],['n-ideas','Key ideas'],['n-terms','Key terms'],T.mistakes&&['n-mis','Common mistakes'],W&&['n-ans','Answer like this'],['n-chk','Check yourself'],['n-prac','Practise'],['n-ai','Explore with AI']].filter(Boolean);
 shell('#/notes',`<nav class="dots" aria-label="Topics" style="margin-bottom:12px">${tps.map(x=>`<a href="#/notes/${x}" class="dot ${x===t?'on':''} ${U.log['notes:'+x]?'done':''}" aria-label="Topic ${x}" style="text-decoration:none">${x}</a>`).join('')}<a href="#/notes" class="btn ghost sm">All topics</a></nav>
  <div class="casehead" style="--c:#8b5cf6"><div class="kick lex">${TOPIC_ICO[t]} Topic ${t}</div><h1 style="margin:4px 0 0">${esc(TERM.topics[t])}</h1></div>
  <div class="chipline" style="margin-bottom:12px">${jumps.map(([id,n])=>`<button type="button" class="chip" data-jump="${id}">${esc(n)}</button>`).join('')}</div>
  <div class="card lo" id="n-min"><h3>In one minute</h3>${listHTML(T.min)}<h3>What you need to be able to do</h3><p>${esc(T.lo)}</p></div>
  <h2 id="n-ideas" style="margin-top:18px">Key ideas</h2><p class="muted">Read one card at a time. Look at each diagram and try to say it in your own words.</p>
  ${T.ideas.map(ideaHTML).join('')}
  <h2 id="n-terms" style="margin-top:18px">Key terms</h2><p class="muted">Tap a card to see the meaning. Say the meaning out loud before you tap.</p>
  <div class="terms">${T.terms.map(([a],k)=>`<button type="button" class="term" aria-pressed="false" data-ti="${k}"><b>${esc(a)}</b><span>Tap to reveal</span></button>`).join('')}</div>
  <div class="row" style="margin-top:10px"><button type="button" class="btn ghost sm" data-tall="1">Show all</button><button type="button" class="btn ghost sm" data-tall="0">Hide all</button></div>
  ${T.mistakes?`<div class="card mis" id="n-mis" style="margin-top:18px"><h3>Common mistakes</h3>${listHTML(T.mistakes)}</div>`:''}
  ${W?`<div class="card" id="n-ans" style="margin-top:18px"><h3>Answer like this</h3><p class="muted">A worked practice question. Plan your own answer first, then open the model.</p>
   <div class="callout"><b>Practice question · ${W.marks||5} marks</b><br>${esc(W.q)}</div>
   <details class="mine"><summary>✍ Plan</summary><ol style="padding-left:1.2em">${W.plan.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></details>
   <details class="mine"><summary>Model answer, with what each part does</summary>${W.model.map(([tag,x])=>`<p><span class="tag">${esc(tag)}</span> ${esc(x)}</p>`).join('')}</details></div>`:''}
  <h2 id="n-chk" style="margin-top:18px">Check yourself</h2><p class="muted">Answer in your head or on paper first. Then open the answer.</p>
  ${T.check.map(([q,a],k)=>`<details class="mine"><summary>${k+1}. ${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
  <div class="card" id="n-prac" style="margin-top:18px"><h3>${studied?'✓ You have studied this topic':'Finished reading?'}</h3>
   ${studied?'<p class="muted" style="margin:0">Now practise it.</p>':`<p class="muted" style="margin:0 0 10px">Mark the topic as studied to earn XP and move towards the ${esc(TOPIC_BADGE[t])} badge.</p><button class="btn gold" id="nst">📖 I've studied this topic · +20 XP</button>`}
   <div class="row" style="margin-top:12px"><a class="btn" href="#/mcq/t/${t}">🎯 MCQs on Topic ${t}</a><a class="btn ghost" href="#/short/t/${t}">🧩 Short answers</a><a class="btn ghost" href="#/long">🖋️ Long answers</a></div></div>
  <div class="card" id="n-ai" style="margin-top:18px"><h3>Explore further with AI</h3><p class="muted">Copy a prompt, open Gemini, and paste it in. Read the reply with care. Check every idea against these notes and your textbook.</p>
   ${T.prompts.map((x,k)=>`<div class="prompt"><p>${esc(x)}</p><button class="btn ghost sm" type="button" data-copy="${k}">Copy prompt</button></div>`).join('')}
   <div class="row" style="margin-top:10px"><a class="btn ghost sm" href="${GEMINI}" target="_blank" rel="noopener">Open Gemini ↗</a></div></div>
  <div class="row" style="justify-content:space-between;margin-top:18px">${prev?`<a class="btn ghost" href="#/notes/${prev}">← Topic ${prev}</a>`:'<span></span>'}${next?`<a class="btn" href="#/notes/${next}">Topic ${next} →</a>`:`<a class="btn" href="#/mcq">Try a mixed MCQ set →</a>`}</div>`);
 const el=$('main');$('#nst')&&($('#nst').onclick=()=>{if(award('notes:'+t,20,'Topic studied'))countOnce('notes:'+t,'notes');notesPage(String(t));$('#n-prac').scrollIntoView({block:'center'})});
 const flip=(b,on)=>{b.setAttribute('aria-pressed',on);b.querySelector('span').textContent=on?T.terms[b.dataset.ti][1]:'Tap to reveal'};
 el.onclick=e=>{const j=e.target.closest('[data-jump]');if(j){const x=document.getElementById(j.dataset.jump);if(x)x.scrollIntoView({behavior:'smooth'});return}
  const tm=e.target.closest('[data-ti]');if(tm){flip(tm,tm.getAttribute('aria-pressed')!=='true');return}
  const ta=e.target.closest('[data-tall]');if(ta){document.querySelectorAll('[data-ti]').forEach(b=>flip(b,ta.dataset.tall==='1'));return}
  const b=e.target.closest('[data-copy]');if(!b)return;const txt=T.prompts[+b.dataset.copy];
  const ok=()=>{b.textContent='Copied ✓';setTimeout(()=>{b.textContent='Copy prompt'},2000)};
  const old=()=>{const a=document.createElement('textarea');a.value=txt;a.setAttribute('readonly','');a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();
   try{document.execCommand('copy');ok()}catch(err){b.textContent='Select and copy the text'}a.remove()};
  if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(txt).then(ok,old);else old()}}

/* ---------- case activities (renderers in acts.js) ---------- */
function actPane(c,n){n=Math.min(Math.max(1,n||1),c.acts.length);const a=c.acts[n-1],dk='actdone:'+c.id+':'+n;U.act=U.act||{};document.body.dataset.case=c.id;
 $('#pane').innerHTML=`<div class="card" style="margin-bottom:14px"><h2>Hands-on activities</h2><p class="muted" style="margin:0">Short interactive tasks that build the ideas you need for full answers. Mark each one as done when you have finished it.</p>
  <div class="dots" style="margin-top:12px">${c.acts.map((x,i)=>`<button class="dot ${i+1===n?'on':''} ${U.log['actdone:'+c.id+':'+(i+1)]?'done':''}" data-an="${i+1}" title="${esc(x.title)}" aria-label="Activity ${i+1}">${U.log['actdone:'+c.id+':'+(i+1)]?'✓':i+1}</button>`).join('')}</div></div>
 <div class="card" style="margin-bottom:14px"><div class="qmeta"><span class="tag">Activity ${n} of ${c.acts.length}</span><span class="tag">${esc(a.topic)}</span><span class="tag">${esc(a.bloom)}</span></div><h2>${esc(a.title)}</h2>
  <div class="callout"><b>Practice question</b><br>${esc(a.q)}</div></div>
 <div id="parts"></div>
 <div class="card apaper" style="margin-top:14px"><h3>✍ Write it on paper</h3><ol>${a.paper.map(p=>`<li>${esc(p)}</li>`).join('')}</ol></div>
 <details class="mine" style="margin-top:12px"><summary>Check your thinking</summary><ul>${a.think.map(p=>`<li>${esc(p)}</li>`).join('')}</ul><p class="muted">Compare with what you wrote. Add anything you missed.</p></details>
 <div class="row" style="justify-content:space-between;margin-top:16px"><button class="btn ghost" id="apv" ${n===1?'disabled':''}>← Previous</button>
  ${U.log[dk]?'<span class="tag">✓ Done</span>':'<button class="btn gold" id="adn">Mark as done · +15 XP</button>'}
  <button class="btn ghost" id="anx">${n<c.acts.length?'Next →':'Practice set →'}</button></div>`;
 document.querySelectorAll('[data-an]').forEach(b=>b.onclick=()=>location.hash='#/case/'+c.id+'/acts/'+b.dataset.an);
 $('#apv').onclick=()=>location.hash='#/case/'+c.id+'/acts/'+(n-1);$('#anx').onclick=()=>location.hash=n<c.acts.length?'#/case/'+c.id+'/acts/'+(n+1):'#/case/'+c.id+'/practice';
 $('#adn')&&($('#adn').onclick=()=>{if(award(dk,15,'Activity done'))countOnce(dk,'acts');actPane(c,n)});
 const box=$('#parts'),part=(k,fn)=>{const d=document.createElement('div');d.className='card part';box.appendChild(d);const st=U.act[k]||(U.act[k]={});fn(d,st,()=>{U.act[k]=st;save()})};
 const arg=a.arg||typeof ARGS!=='undefined'&&(ARGS[c.id]||[])[n-1];
 if(arg)part(c.id+'-'+(a.key||n)+'-arg',(d,st,sv)=>R.argue(d,Object.assign({title:'Start here: build your argument'},ARGUE,arg),st,()=>{sv();if(st.last>=2&&award('argue:'+c.id+':'+n,10,'Strong argument'))save()}));
 a.parts.forEach((p,pi)=>part(c.id+'-'+(a.key||n)+'-'+pi,(d,st,sv)=>R[p.type](d,p,st,sv)))}
function termsPane(c){$('#pane').innerHTML=`<div class="card" style="margin-bottom:14px"><h2>Key terms</h2><p class="muted" style="margin:0">Tap a card to see the meaning. Say it out loud before you tap.</p></div>
 <div class="terms">${c.terms.map(([a],k)=>`<button type="button" class="term" aria-pressed="false" data-ti="${k}"><b>${esc(a)}</b><span>Tap to reveal</span></button>`).join('')}</div>`;
 $('#pane').onclick=e=>{const b=e.target.closest('[data-ti]');if(!b)return;const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);b.querySelector('span').textContent=on?c.terms[b.dataset.ti][1]:'Tap to reveal'}}

/* ---------- cases ---------- */
function caseList(){shell('#/cases',`<h1>Section C · Case studies</h1><p class="muted">Two Maldivian cases. Read each one in full, judge the Boardroom, try the hands-on activities, then practise full answers. Crack a case to earn its badge.</p>
 <div class="grid g2">${CASEL.map(c=>{const read=c.sections.filter(s=>U.log['read:'+c.id+':'+s.id]).length,jd=c.boardroom.filter((a,i)=>U.verd[c.id+':'+i]).length,fq=c.questions.filter(q=>(U.fin||{})[q.id]).length,ad=c.acts.filter((a,i)=>U.log['actdone:'+c.id+':'+(i+1)]).length;
  return `<a class="card zone" href="#/case/${c.id}/read"><div class="em">${c.icon}</div><h3>${esc(c.title)}</h3><p class="muted" style="font-size:.9rem">${esc(c.subtitle)}</p><div class="chipline"><span class="tag">${esc(c.tag)}</span></div>
  <ul class="ck" style="margin-top:12px"><li class="${read===c.sections.length?'':'no'}"><i>${read===c.sections.length?'✅':'○'}</i><span>Read ${read}/${c.sections.length} sections</span></li><li class="${jd===c.boardroom.length?'':'no'}"><i>${jd===c.boardroom.length?'✅':'○'}</i><span>Boardroom ${jd}/${c.boardroom.length} judged</span></li><li class="${fq>=5?'':'no'}"><i>${fq>=5?'✅':'○'}</i><span>Practice ${fq}/5 questions finished</span></li><li class="${ad===c.acts.length?'':'no'}"><i>${ad===c.acts.length?'✅':'○'}</i><span>Activities ${ad}/${c.acts.length} done</span></li></ul>${U.badges['case_'+c.id]?'<span class="tag" style="color:var(--gold)">🏅 Case cracked</span>':''}</a>`}).join('')}</div>`)}

const COLORS=['#39ff88','#ffd166','#ff5fb7','#b388ff','#8b5cf6','#2bff9a','#ff9f43'];
function caseView(id,tab,n){
  const c=CASEL.find(x=>x.id===id);if(!c)return caseList();
  const tabs=[['read','📖 Read'],['board','🎙️ Boardroom'],['acts','🛠️ Activities'],['practice','✍️ Practice'],['exhibits','📊 Exhibits'],['terms','🔤 Terms']];
  shell('#/cases',`<div class="casehead" style="--c:${c.color}"><div class="row"><span style="font-size:2.4rem">${c.icon}</span><div><h1 style="margin:0">${esc(c.title)}</h1><p class="muted" style="margin:0">${esc(c.subtitle)}</p></div></div><p class="muted" style="font-size:.8rem;margin:10px 0 0">${esc(c.note)}</p></div>
  <div class="subnav">${tabs.map(t=>`<button data-t="${t[0]}" class="${t[0]===tab?'on':''}">${t[1]}</button>`).join('')}</div><div id="pane"></div>`);
  document.querySelectorAll('.subnav button').forEach(b=>b.onclick=()=>location.hash='#/case/'+id+'/'+b.dataset.t);
  document.body.dataset.case=c.id;if(tab==='acts')return actPane(c,n);({read:readPane,board:boardPane,practice:practicePane,exhibits:exhibitPane,terms:termsPane}[tab]||readPane)(c)}

function readPane(c){
  const P=$('#pane');
  P.innerHTML=`<div class="reader"><div class="card toc">${c.sections.map((s,i)=>`<a href="javascript:void 0" data-s="${s.id}" class="${U.log['read:'+c.id+':'+s.id]?'read':''}"><span class="d"></span>${i+1}. ${esc(s.title)}</a>`).join('')}</div>
  <div>${c.sections.map((s,i)=>`<article class="card sec" id="s-${s.id}"><div class="num">PART ${i+1}</div><h2>${esc(s.title)}</h2>${s.html}
  <div class="row" style="margin-top:12px">${U.log['read:'+c.id+':'+s.id]?'<span class="tag">✓ Read</span>':`<button class="btn sm" data-r="${s.id}">Mark as read · +5 XP</button>`}</div></article>`).join('')}
  <p class="muted" style="font-size:.8rem">${esc(c.note)}</p><div class="row"><a class="btn" href="#/case/${c.id}/board">Next: the Boardroom →</a></div></div></div>`;
  P.querySelectorAll('.toc a').forEach(a=>a.onclick=()=>$('#s-'+a.dataset.s).scrollIntoView({behavior:'smooth'}));
  P.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{if(award('read:'+c.id+':'+b.dataset.r,5,'Section read'))count('read');b.outerHTML='<span class="tag">✓ Read</span>';
    P.querySelector(`.toc a[data-s="${b.dataset.r}"]`)?.classList.add('read');
    if(c.sections.every(s=>U.log['read:'+c.id+':'+s.id]))award('readall:'+c.id,30,'Whole case read');caseCheck(c)})}
function caseCheck(c){if(caseDone(U,c))award('casedone:'+c.id,50,c.short+' case cracked')}

function exhibitPane(c){$('#pane').innerHTML=c.exhibits.map(x=>`<div class="card exhibit" style="margin-bottom:14px"><h3>${esc(x.title)}</h3><div class="tablewrap">${x.html}</div><small>${esc(x.note)}</small></div>`).join('')}

function boardPane(c){
  const topics=[...new Set(c.boardroom.map(a=>a.topic))];let cur=LS.get('bt_'+c.id,topics[0]);if(!topics.includes(cur))cur=topics[0];
  const who=[...new Set(c.boardroom.map(a=>a.who))];
  const draw=()=>{const done=c.boardroom.filter((a,i)=>U.verd[c.id+':'+i]).length;
    $('#pane').innerHTML=`<div class="card" style="margin-bottom:14px"><h2>The Boardroom</h2><p class="muted">Each person argues a position. Some arguments are strong, some are weak, some are partly right. Judge each one, then read why. Use the strong points, and your own ideas, to build answers.</p>
    <div class="bar"><i style="width:${done/c.boardroom.length*100}%;background:var(--teal)"></i></div><p class="muted" style="font-size:.8rem;margin:6px 0 0">${done}/${c.boardroom.length} judged</p></div>
    <div class="subnav">${topics.map(t=>`<button data-tp="${esc(t)}" class="${t===cur?'on':''}">${esc(t)}</button>`).join('')}</div>
    ${c.boardroom.map((a,i)=>a.topic!==cur?'':argCard(c,a,i,COLORS[who.indexOf(a.who)%COLORS.length])).join('')}
    <div class="card"><h3>Now build your own position</h3><p class="muted" style="margin:0">On paper, write 3–4 sentences on "${esc(cur)}": pick the strongest point, challenge the weakest one with theory, and add one idea nobody in the room suggested.</p></div>`;
    document.querySelectorAll('[data-tp]').forEach(b=>b.onclick=()=>{cur=b.dataset.tp;LS.set('bt_'+c.id,cur);draw()});
    document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{const [i,v]=b.dataset.v.split('|');const a=c.boardroom[+i],k=c.id+':'+i;if(U.verd[k])return;
      U.verd[k]=v;count('verdicts');const right=v===a.v;if(right){count('verdictsRight');if(a.v==='weak')count('weakSpotted')}
      award('verdict:'+k,right?10:3,right?'Good call':'Verdict recorded');caseCheck(c);draw()})};
  draw()}
function argCard(c,a,i,col){const k=c.id+':'+i,mine=U.verd[k],L={strong:'Strong',mixed:'Partly right',weak:'Weak'};
  return `<div class="card arg" style="margin-bottom:12px"><div class="avatar" style="background:${col}">${esc(a.who[0])}</div><div>
  <b class="lex">${esc(a.who)}</b> <span class="muted" style="font-size:.85rem">· ${esc(a.role)}</span><q>${esc(a.say)}</q>
  <div class="verdicts">${['strong','mixed','weak'].map(v=>`<button data-v="${i}|${v}" class="${mine===v?'pick-'+v:''}" ${mine?'disabled':''}>${L[v]}</button>`).join('')}</div>
  ${mine?`<div class="fb ${mine===a.v?'ok':'no'}"><b>${mine===a.v?'✓ Agreed':'Our reading: '+L[a.v]}.</b> ${esc(a.why)}</div>`:''}</div></div>`}

/* practice: one question per slot, random sets */
function newSet(c){const slots=[...new Set(c.questions.map(q=>q.slot))].sort();const prev=U.sets[c.id]||[];
  return slots.map(s=>{const pool=c.questions.filter(q=>q.slot===s);const fresh=pool.filter(q=>!prev.includes(q.id));return shuffle(fresh.length?fresh:pool)[0].id})}
function practicePane(c){
  if(!U.sets[c.id]){U.sets[c.id]=newSet(c);save()}
  const qs=U.sets[c.id].map(id=>c.questions.find(q=>q.id===id)).filter(Boolean),O=()=>({cid:c.id});
  $('#pane').innerHTML=`<div class="card" style="margin-bottom:14px"><div class="row" style="justify-content:space-between"><div><h2 style="margin:0">Practice set</h2><p class="muted" style="margin:4px 0 0">${qs.length} questions · 6 marks each. Plan with chips, then finish your way: plan only, write on paper, or type.</p></div>
  <button class="btn gold" id="ns">🎲 New set</button></div></div><div id="qs"></div>`;
  const fresh=ids=>{clearPlans(U.sets[c.id]);U.sets[c.id]=ids;U.focus=U.focus||{};U.focus['c:'+c.id]=0;save();practicePane(c);$('#pane').scrollIntoView()};
  $('#ns').onclick=()=>{if(confirm('Start a new random set? Your current plans and timers will be cleared.'))fresh(newSet(c))};
  player({key:'c:'+c.id,qs,o:O,next:()=>fresh(newSet(c)),weak:()=>fresh(weakSet(c.questions,qs.length,q=>tk(q,O()),U.sets[c.id]))})}
function clearPlans(ids){(ids||[]).forEach(id=>{delete U.plansSaved[id];LS.del('tm_'+id)})}

/* weak spots: per question and per topic (Section B by week, cases by skill). Kept on restart: it records struggle, not rewards. */
const tk=(q,o)=>o.short?'t'+q.t:o.cid+'|'+(q.skill||q.topic);
function tkLabel(k){if(k[0]==='t')return tName(+k.slice(1));
  const [cid,sk]=k.split('|'),c=CASEL.find(x=>x.id===cid);return sk+(c?' ('+c.short+')':'')}
function weakMark(q,o,pts,attempt){U.wk=U.wk||{q:{},t:{}};const t=tk(q,o),r=U.wk.t[t]||(U.wk.t[t]=[0,0]);
  if(attempt)r[0]++;r[1]=Math.round((r[1]+pts)*10)/10;U.wk.q[q.id]=Math.round(((U.wk.q[q.id]||0)+pts)*10)/10}
function weakTopics(){const t=(U.wk||{}).t||{};return Object.keys(t).filter(k=>t[k][1]>0).sort((a,b)=>t[b][1]/Math.max(1,t[b][0])-t[a][1]/Math.max(1,t[a][0]))}
function weakSet(pool,size,tkOf,prev){const W=U.wk||{q:{},t:{}},T=W.t||{},Q=W.q||{};
  const sc=q=>{const r=T[tkOf(q)];return (Q[q.id]||0)*2+(r?r[1]/Math.max(1,r[0]):0)};
  if(!pool.some(q=>sc(q)>0)){toast('🎯','No weak spots yet','Practise a few questions first. Here is a fresh set.');return shuffle(pool).slice(0,size).map(q=>q.id)}
  return pool.map(q=>[q,sc(q)+Math.random()*.3]).sort((a,b)=>b[1]-a[1]).slice(0,size).map(x=>x[0].id)}

/* focus mode: one question at a time, with progress, dots and an end-of-set summary */
function player(P){
  U.focus=U.focus||{};let i=U.focus[P.key];if(i!=='sum'&&!(i>=0&&i<P.qs.length))i=0;
  const host=$('#qs'),stOf=q=>U.plansSaved[q.id]||{},isDone=q=>{const s=stOf(q);return !!(s.done||s.final)};
  const go=n=>{i=n;U.focus[P.key]=i;save();draw();host.scrollIntoView({block:'start'})};
  const head=()=>{const h=$('#fh');if(!h||i==='sum')return;const dn=P.qs.filter(isDone).length;
    h.innerHTML=`<div class="row" style="justify-content:space-between"><b class="lex">Question ${i+1} of ${P.qs.length}</b><span class="muted" style="font-size:.85rem">${dn}/${P.qs.length} finished</span></div>
    <div class="bar" style="margin:8px 0 10px"><i style="width:${dn/P.qs.length*100}%;background:var(--teal)"></i></div>
    <div class="dots">${P.qs.map((x,j)=>`<button data-dot="${j}" class="dot ${j===i?'on':''} ${isDone(x)?'done':stOf(x).checked?'part':''}" aria-label="Question ${j+1}${isDone(x)?', finished':''}">${isDone(x)?'✓':j+1}</button>`).join('')}<button data-dot="sum" class="dot" aria-label="Set summary" title="Set summary">🏁</button></div>`;
    h.querySelectorAll('[data-dot]').forEach(b=>b.onclick=()=>go(b.dataset.dot==='sum'?'sum':+b.dataset.dot))};
  const draw=()=>{if(i==='sum')return setSummary(P,go);const q=P.qs[i],last=i===P.qs.length-1;
    host.innerHTML=`<div class="card" id="fh" style="margin-bottom:12px;padding:14px 16px"></div><div class="card qcard" id="q-${q.id}"></div>
    <div class="row" style="justify-content:space-between;margin-top:12px"><button class="btn ghost" id="pv" ${i===0?'disabled':''}>← Previous</button><button class="btn ghost" id="nx">${last?'Set summary 🏁':'Next →'}</button></div>`;
    $('#pv').onclick=()=>go(i-1);$('#nx').onclick=()=>go(last?'sum':i+1);
    qCard(q,i,Object.assign(P.o(q),{refresh:head,next:()=>go(last?'sum':i+1),last}))};
  draw()}
function setSummary(P,go){const host=$('#qs'),sts=P.qs.map(q=>[q,U.plansSaved[q.id]||{}]);
  const xp=P.qs.reduce((t,q)=>t+xpFor(qKeys(q.id)),0),R={plan:0,paper:0,typed:0};let open=0;
  sts.forEach(([q,s])=>{if(s.done||s.final)R[s.route||'paper']++;else open++});
  const miss={},bad={};sts.forEach(([q,s])=>{if(!s.checked)return;q.chips.forEach((c,j)=>{const sel=(s.sel||[]).includes(j);if(c.g&&!sel)miss[c.t]=(miss[c.t]||0)+1;if(!c.g&&sel)bad[c.t]=c.why||''})});
  const mk=Object.keys(miss).slice(0,5),bk=Object.keys(bad).slice(0,4);
  const setT=P.qs.map(q=>tk(q,P.o(q))),wt=weakTopics(),sug=wt.find(t=>setT.includes(t))||wt[0];
  host.innerHTML=`<div class="card"><div style="font-size:2.4rem">🏁</div><h2 style="margin:4px 0">Set summary</h2>
  <div class="stats"><div class="stat"><b>${xp}</b><span>XP from this set</span></div><div class="stat"><b>${R.paper}</b><span>✍️ on paper</span></div><div class="stat"><b>${R.typed}</b><span>⌨️ typed</span></div><div class="stat"><b>${R.plan}</b><span>📝 plan only</span></div></div>
  ${(()=>{const T=sts.filter(([q,s])=>s.route==='typed'&&s.done);return T.length?`<h3 style="margin-top:16px">Typed answers</h3><ul class="sumlist">${T.map(([q,s])=>{const r=s.ak&&U.rev&&U.rev[s.ak],c=s.chk;return `<li>${esc(q.skill||q.topic)}: automatic ${c?c.band:'–'}/6${r?` · <b>marked ${r.band}/6</b>${r.fb?`<div class="muted" style="font-size:.85rem">${esc(r.fb)}</div>`:''}`:cloudOn()?' · <span class="muted">waiting to be marked</span>':''}</li>`}).join('')}</ul>`:''})()}
  ${open?`<p class="muted" style="margin-top:12px">${open} question${open===1?' is':'s are'} not finished yet. <a href="javascript:void 0" id="sfo">Go back to ${open===1?'it':'them'}</a>.</p>`:''}
  ${mk.length?`<h3 style="margin-top:16px">Key ideas you left out</h3><ul class="sumlist">${mk.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:''}
  ${bk.length?`<h3 style="margin-top:12px">Decoys you picked</h3><ul class="sumlist">${bk.map(t=>`<li><b>${esc(t)}</b>${bad[t]?`: <span class="muted">${esc(bad[t])}</span>`:''}</li>`).join('')}</ul>`:''}
  ${!mk.length&&!bk.length&&sts.some(([q,s])=>s.checked)?'<div class="fb ok">Every plan hit the key ideas with no decoys. Excellent.</div>':''}
  <div class="callout" style="margin-top:14px">🎯 <b>Practise next:</b> ${sug?esc(tkLabel(sug)):'Try a new set to build up your practice record.'}</div>
  <div class="row" style="margin-top:14px"><button class="btn gold" id="snx">🎲 Next set</button><button class="btn" id="swk">Practise my weak spots</button><button class="btn ghost sm" id="sbk">← Back to questions</button></div></div>`;
  $('#sbk').onclick=()=>go(0);$('#sfo')&&($('#sfo').onclick=()=>go(sts.findIndex(([q,s])=>!(s.done||s.final))));
  $('#snx').onclick=()=>{if(!open||confirm('Some questions are unfinished. Start a new set anyway?'))P.next()};
  $('#swk').onclick=()=>{if(!open||confirm('Some questions are unfinished. Start a weak-spots set anyway?'))P.weak()}}

const TIMERS={},BANDS6=[[0,'Off topic or missing'],[1,'Lists a term or two'],[2,'Lists several terms with little explanation'],[3,'Explains the idea with some application'],[4,'Explains clearly and applies it to the example'],[5,'Applies well and starts to evaluate'],[6,'Applies to the case or example throughout and evaluates with a clear judgement']];
const MINWORDS=40,words=t=>(String(t||'').trim().match(/\S+/g)||[]).length;
function qCard(q,i,o={}){
  const secs=o.secs||600,mins=Math.round(secs/60),re=()=>qCard(q,i,o);
  const el=$('#q-'+q.id),st=U.plansSaved[q.id]||(U.plansSaved[q.id]={step:0,sel:[],checked:false,ticks:[]});
  if(!st.order)st.order=shuffle(q.chips.map((_,j)=>j));
  if(!st.route&&st.step>0)st.route='paper';if(st.final)st.done=true;
  const good=q.chips.map((c,j)=>c.g?j:-1).filter(j=>j>=0),planHTML=`<div class="plan"><b class="lex" style="font-size:.85rem">Your plan</b><ol>${st.sel.filter(j=>q.chips[j].g).map(j=>`<li>${esc(q.chips[j].t)}</li>`).join('')||'<li class="muted">No key ideas picked</li>'}</ol></div>`;
  const steps=st.route==='typed'?['1 · Plan','2 · Type','3 · Mark']:st.route==='plan'?['1 · Plan','✓ Plan only']:['1 · Plan','2 · Write','3 · Check'];
  const nextBtn=`<div class="row" style="margin-top:12px"><button class="btn" data-a="next">${o.last?'See set summary 🏁':'Next question →'}</button></div>`;
  let h=`<div class="qmeta"><span class="tag">Question ${i+1}</span><span class="tag">${esc(q.skill||q.topic)}</span>${q.t?`<span class="tag">${TOPIC_ICO[q.t]||''} Topic ${q.t}</span>`:''}<span class="tag">${q.marks||6} marks</span><button class="btn ghost sm rst" data-a="restart" title="Restart this question">↺ Restart</button></div>
  <h3 style="font-weight:600">${esc(q.q)}</h3><div class="steps">${steps.map((s,j)=>`<span class="${st.done&&j===steps.length-1||j===st.step?'on':j<st.step||st.done?'done':''}">${j<st.step||st.done&&j<steps.length-1?'✓ ':''}${s}</span>`).join('')}</div>`;
  const fin=()=>{U.fin=U.fin||{};U.fin[q.id]=1;if(st.route!=='plan'){U.tw=U.tw||{};if(q.t)U.tw[q.t]=1}const cc=o.cid&&CASEL.find(x=>x.id===o.cid);if(cc)caseCheck(cc);checkBadges()};
  const modelH=q.model&&st.done?`<details class="mine"><summary>Model answer: compare it with yours</summary>${q.model.model.map(x=>`<p>${esc(x)}</p>`).join('')}${q.model.rub?`<div class="tablewrap"><table><tr><th>Part</th><th>Marks</th><th>What earns them</th></tr>${q.model.rub.map(r=>`<tr><td>${esc(r[0])}</td><td>${r[1]}</td><td>${esc(r[2])}</td></tr>`).join('')}</table></div>`:''}</details>`:'';
  if(st.step===0&&!(st.done&&st.route==='plan')){
    h+=`${q.model&&!st.checked?`<details class="mine"><summary>How to build your answer</summary><ol style="margin:8px 0 0;padding-left:1.2em">${q.model.guide.map(g=>`<li>${esc(g)}</li>`).join('')}</ol></details>`:''}<p class="muted" style="font-size:.9rem">Tap the ideas you would use in your answer. Some are decoys.</p><div class="chips">${st.order.map(j=>{const ch=q.chips[j],s=st.sel.includes(j);
      let cls=s?'sel':'';if(st.checked)cls=ch.g?(s?'good':'miss'):(s?'bad':'');return `<button class="chip ${cls}" data-j="${j}" ${st.checked?'disabled':''}>${esc(ch.t)}</button>`}).join('')}</div>`;
    if(st.checked){const hit=st.sel.filter(j=>q.chips[j].g).length,bad=st.sel.filter(j=>!q.chips[j].g);
      h+=`<div class="fb ${bad.length?'no':'ok'}"><b>${hit}/${good.length} key ideas · ${bad.length} decoy${bad.length===1?'':'s'}</b>${bad.map(j=>`<div>✗ <i>${esc(q.chips[j].t)}</i>: ${esc(q.chips[j].why||'')}</div>`).join('')}${hit<good.length?'<div>Dashed chips are ideas you left out. You don\'t need all of them, but they could earn marks.</div>':''}</div>
      ${planHTML}<h4 style="margin-bottom:8px">How do you want to finish?</h4><div class="routes">
      <button class="route" data-a="rplan"><span>📝</span><b>Plan only</b><small>Move on now. Keeps your plan XP.</small></button>
      <button class="route" data-a="rpaper"><span>✍️</span><b>Write on paper</b><small>Timed, about ${mins} min. Full XP.</small></button>
      <button class="route" data-a="rtyped"><span>⌨️</span><b>Type my answer</b><small>Type or speak it. Automatic check of key ideas.</small></button></div>
      <div class="row" style="margin-top:10px"><button class="btn ghost sm" data-a="replan">Re-plan</button></div>`}
    else h+=`<div class="row" style="margin-top:14px"><button class="btn" data-a="check" ${st.sel.length?'':'disabled'}>Check my plan</button><span class="muted" style="font-size:.85rem">${st.sel.length} selected</span></div>`}
  else if(st.route==='plan'){
    h+=`${planHTML}<div class="fb ok"><b>✓ Finished with your plan.</b> Want more practice and XP? You can still write or type it.</div>${q.model?`<details class="mine"><summary>Model answer</summary>${q.model.model.map(x=>`<p>${esc(x)}</p>`).join('')}</details>`:''}
    <div class="row" style="margin-top:10px"><button class="btn ghost sm" data-a="rpaper">✍️ Write on paper</button><button class="btn ghost sm" data-a="rtyped">⌨️ Type my answer</button></div>${nextBtn}`}
  else if(st.route==='paper'&&st.step===1){
    h+=`${planHTML}<div class="timer" id="t-${q.id}">${mins}:00</div><div class="row" style="justify-content:center"><button class="btn" data-a="tgo">Start</button><button class="btn ghost" data-a="tstop">Stop</button><button class="btn gold" data-a="done">I've finished writing</button></div>
    <p class="muted" style="text-align:center;font-size:.85rem;margin-top:10px">Write your full answer on paper. Aim for about ${mins} minutes. <a href="javascript:void 0" data-a="back">Choose another way</a></p>`}
  else if(st.route==='paper'){
    h+=`<p>Read your answer on paper and tick what is true:</p><div class="checks">${q.checks.map((t,j)=>`<label><input type="checkbox" data-k="${j}" ${st.ticks.includes(j)?'checked':''} ${st.done?'disabled':''}> ${esc(t)}</label>`).join('')}</div>
    ${st.done?`<div class="fb ok"><b>Done.</b> ${st.ticks.length}/${q.checks.length} checks met. ${st.ticks.length<q.checks.length?'Try the missing ones next time.':'Excellent work.'}</div>${modelH}${nextBtn}`:`<button class="btn" data-a="fin">Finish</button>`}`}
  else if(st.route==='typed'&&st.step===1){const w=words(st.txt);
    h+=`${planHTML}<label for="ta-${q.id}">Type your answer</label><textarea id="ta-${q.id}" class="answer" placeholder="Use your plan: define, explain, apply to the example, then evaluate. Pasting is turned off: type or speak your own answer.">${esc(st.txt||'')}</textarea>
    <div class="interim" id="im-${q.id}"></div><div class="row" style="justify-content:space-between;margin-top:2px"><span class="muted" style="font-size:.85rem" id="wc-${q.id}">${w} words · aim for 150–250</span><span class="muted" style="font-size:.85rem" id="sw-${q.id}"></span></div>
    <div class="flagnote" id="fn-${q.id}">${(st.fl&&(st.fl.paste||st.fl.big))?'⚠️ Pasted text was removed. Type or speak your own answer.':''}</div>
    <div class="row" style="margin-top:10px"><button class="btn" data-a="tdone">Check my answer →</button>${SR?`<button class="btn ghost sm mic" data-a="mic" aria-pressed="false">🎤 Speak</button>`:''}${st.sw?'':'<button class="btn ghost sm" data-a="sw">⏱ Show a timer</button>'}<button class="btn ghost sm" data-a="back">Choose another way</button></div>`}
  else if(st.route==='typed'){const C=st.chk||CONCEPT.checkAnswer(q,st.txt||'',namesFor(q,o)),SL={def:'Defines the key term',ex:'Gives an example or names the case/company',ev:'Evaluates (however, but, therefore…)',rec:'Makes a recommendation or judgement'};
    const why=typedNoXP(st,C);
    h+=`<details class="mine"><summary>Your answer (${C.words} words)</summary><p>${esc(st.txt||'').replace(/\n/g,'<br>')}</p></details>
    <div class="autob"><b class="big">${C.band}/6</b><div><b>Automatic check</b><div class="muted" style="font-size:.85rem">${esc(BANDS6[C.band][1])} · ${C.found.length} of ${C.need} key ideas · ${Object.values(C.struct).filter(Boolean).length}/4 structure</div></div></div>
    <h4>Key ideas in a strong answer</h4><ul class="ck">${good.map(j=>{const f=C.found.includes(j);return `<li class="${f?'':'no'}"><i>${f?'✅':'○'}</i><span>${esc(q.chips[j].t)}${f?'':' <span class="tag">not found</span>'}</span></li>`}).join('')}</ul>
    <h4>Structure</h4><ul class="ck">${Object.keys(SL).map(k=>`<li class="${C.struct[k]?'':'no'}"><i>${C.struct[k]?'✅':'○'}</i><span>${SL[k]}</span></li>`).join('')}</ul>
    <p class="muted" style="font-size:.82rem">The check looks for key words and phrases, so it can miss ideas written in very different words. ${cloudOn()?'Your lecturer may also mark this answer.':''}</p>
    ${reviewHTML_(st.ak)}
    <h4>How do you rate it? <span class="muted" style="font-weight:400;font-size:.85rem">(optional, for your own reflection)</span></h4><div class="bands">${BANDS6.map(b=>`<label class="band ${st.band===b[0]?'on':''}"><input type="radio" name="bd-${q.id}" value="${b[0]}" ${st.band===b[0]?'checked':''} ${st.done?'disabled':''}><b>${b[0]}</b><span>${esc(b[1])}</span></label>`).join('')}</div>
    ${st.done?`<div class="fb ${why?'no':'ok'}"><b>Done.</b> ${why?'No XP this time: '+why:'+'+(st.xpGot||C.xp)+' XP from the automatic check.'}</div>${modelH}${nextBtn}`:`<div class="fb ${why?'no':'ok'}">${why?'No XP this time: '+why:'This answer earns <b>+'+C.xp+' XP</b> when you finish.'}</div><div class="row" style="margin-top:10px"><button class="btn" data-a="tfin">Finish and submit</button><button class="btn ghost sm" data-a="tedit">← Keep editing</button></div>`}`}
  el.innerHTML=h;o.refresh&&o.refresh();
  el.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{const j=+b.dataset.j;st.sel=st.sel.includes(j)?st.sel.filter(x=>x!==j):st.sel.concat(j);save();re()});
  el.querySelector('[data-a="restart"]').onclick=()=>restartItem(qKeys(q.id),'this question',()=>{stopMic();delete U.plansSaved[q.id];if(U.fin)delete U.fin[q.id];LS.del('tm_'+q.id);clearInterval(TIMERS[q.id]);clearInterval(TIMERS['sw'+q.id])})&&re();
  const A=a=>el.querySelector(`[data-a="${a}"]`),on=(a,f)=>el.querySelectorAll(`[data-a="${a}"]`).forEach(b=>b.onclick=f);
  A('check')&&(A('check').onclick=()=>{st.checked=true;const hit=st.sel.filter(j=>q.chips[j].g).length,bad=st.sel.filter(j=>!q.chips[j].g).length;
    countOnce('plan:'+q.id+':'+today(),'plans',o.week&&'bplans');award('plan:'+q.id+':'+today(),15,'Answer plan built');if(!bad&&hit===good.length){countOnce('perfect:'+q.id,'perfect');award('perfect:'+q.id,10,'Flawless plan')}
    weakMark(q,o,bad+(good.length-hit)*.5,true);save();re()});
  on('replan',()=>{st.checked=false;st.sel=[];save();re()});
  on('rplan',()=>{st.route='plan';st.done=true;st.step=0;fin();save();toast('📝','Finished with your plan','Plan XP kept');o.next?o.next():re()});
  on('rpaper',()=>{st.route='paper';st.done=false;st.step=1;save();re()});
  on('rtyped',()=>{st.route='typed';st.done=false;st.step=1;save();re()});
  on('back',()=>{stopMic();LS.del('tm_'+q.id);clearInterval(TIMERS[q.id]);clearInterval(TIMERS['sw'+q.id]);st.route=null;st.step=0;save();re()});
  on('next',()=>o.next?o.next():0);
  if(st.route==='paper'&&st.step===1)timer(q.id,secs,el,ok=>{st.step=2;if(ok){countOnce('timed:'+q.id+':'+today(),'timed',o.week&&'btimed');award('timed:'+q.id+':'+today(),30,'Timed answer finished')}else noTimeXP(secs);save();re()});
  el.querySelectorAll('[data-k]').forEach(b=>b.onchange=()=>{const j=+b.dataset.k;st.ticks=b.checked?st.ticks.concat(j):st.ticks.filter(x=>x!==j);save()});
  A('fin')&&(A('fin').onclick=()=>{st.final=st.done=true;fin();award('check:'+q.id+':'+today(),st.ticks.length*3,'Self-check');if(st.ticks.length<q.checks.length/2)weakMark(q,o,1);save();re()});
  /* typed route */
  const ta=$('#ta-'+q.id);if(ta)typingBox(q,st,ta,el);
  on('sw',()=>{st.sw=Date.now();save();re()});
  on('tdone',()=>{stopMic();st.txt=ta.value;const w=words(st.txt);if(!w){toast('⌨️','Nothing typed yet','Type or speak your answer first');return}
    st.noxp=w<MINWORDS;if(st.noxp&&!confirm(`Only ${w} words.\n\nTyped XP needs at least ${MINWORDS} words. Check it anyway, without XP?`))return;
    st.fast=(st.act||0)/1000<w*TYPE_SPW;st.chk=CONCEPT.checkAnswer(q,st.txt,namesFor(q,o));clearInterval(TIMERS['sw'+q.id]);st.step=2;save();re()});
  on('tedit',()=>{st.step=1;st.chk=null;save();re()});
  el.querySelectorAll(`[name="bd-${q.id}"]`).forEach(b=>b.onchange=()=>{st.band=+b.value;save();re()});
  A('tfin')&&(A('tfin').onclick=()=>{const C=st.chk||CONCEPT.checkAnswer(q,st.txt||'',namesFor(q,o)),why=typedNoXP(st,C);st.done=true;st.xpGot=why?0:C.xp;if(!why)fin();else{U.fin=U.fin||{};U.fin[q.id]=1}
    if(st.fast){U.integ=U.integ||{};U.integ.fast=(U.integ.fast||0)+1}
    st.ak=submitAnswer(q,o,st,C);
    if(!why){countOnce('typed:'+q.id+':'+today(),'typed',o.week&&'btyped');award('typed:'+q.id+':'+today(),C.xp,'Typed answer checked')}
    weakMark(q,o,(C.band<=2?2:C.band<=4?1:0)+(C.found.length<C.need/2?1:0));save();re()})}

/* ---------- typed answers: integrity, speech, submission ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition,TYPE_SPW=.5,BIG=15;
let MIC=null;
function stopMic(){if(MIC){const m=MIC;MIC=null;try{m.rec.stop()}catch(e){}m.done()}}
function namesFor(q,o){const c=o&&o.cid?CASEL.find(x=>x.id===o.cid):null,n=[];
  if(c){n.push(c.short,c.org,'Soneva','STO','Lena','Malé','Hulhumalé',...c.title.split(/\s+/).filter(w=>w.length>3));(c.boardroom||[]).forEach(a=>n.push(a.who))}
  (String(q.q).match(/\b[A-Z][a-zA-Z]{2,}(?:\s[A-Z][a-zA-Z]+)*/g)||[]).slice(1).forEach(x=>n.push(x));return [...new Set(n)]}
function typedNoXP(st,C){if(st.noxp||C.words<MINWORDS)return 'typed XP needs at least '+MINWORDS+' words.';if(!C.found.length)return 'no key ideas were found. Use your plan and try again.';
  if(st.fast)return 'this was entered faster than typing allows. Type or speak your own answer to earn XP.';return ''}
/* keep the answer box honest: no pasting or dropping, no big insertions (except our own speech button), count active typing time */
function typingBox(q,st,ta,el){let prev=ta.value,last=0,tmo;st.fl=st.fl||{};const wc=$('#wc-'+q.id),fn=$('#fn-'+q.id);
  const sync=()=>{st.txt=ta.value;prev=ta.value;wc.textContent=words(ta.value)+' words · aim for 150–250';clearTimeout(tmo);tmo=setTimeout(save,400)};
  const tick=()=>{const t=Date.now();if(last)st.act=(st.act||0)+Math.min(t-last,15000);last=t};
  const flag=(k,msg)=>{st.fl[k]=(st.fl[k]||0)+1;U.integ=U.integ||{};U.integ[k]=(U.integ[k]||0)+1;fn.textContent='⚠️ '+msg;toast('🚫','Pasting is turned off','Type or speak your own answer');save()};
  ['paste','drop'].forEach(ev=>ta.addEventListener(ev,e=>{e.preventDefault();flag('paste','Pasted text was removed. Type or speak your own answer.')}));
  ta.addEventListener('beforeinput',e=>{const t=e.inputType||'';
    if(/^insertFrom(Paste|Drop|Yank|PasteAsQuotation)$/.test(t)){e.preventDefault();return flag('paste','Pasted text was removed. Type or speak your own answer.')}
    if(e.data&&t!=='insertFromDictation'&&words(e.data)>BIG){e.preventDefault();return flag('big','A large block of text was removed. Type or speak your own answer.')}});
  ta.addEventListener('input',e=>{const t=e.inputType||'';
    if(t!=='insertFromDictation'&&words(ta.value)-words(prev)>BIG){ta.value=prev;return flag('big','A large block of text was removed. Type or speak your own answer.')}
    tick();sync()});
  ta.addEventListener('focus',()=>{last=Date.now()});
  const swp=()=>{const s=$('#sw-'+q.id);if(!s)return clearInterval(TIMERS['sw'+q.id]);if(st.sw){const t=Math.floor((Date.now()-st.sw)/1000);s.textContent='⏱ '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0')}};
  if(st.sw){clearInterval(TIMERS['sw'+q.id]);TIMERS['sw'+q.id]=setInterval(swp,1000);swp()}
  const mb=el.querySelector('[data-a="mic"]');if(!mb)return;
  mb.onclick=()=>{if(MIC)return stopMic();
    if(!LS.get('micnote',0)){LS.set('micnote',1);toast('🎤','Speech to text','Your speech is converted by Google or Apple and is not stored by MKT101 Arena.')}
    let rec;try{rec=new SR()}catch(e){return toast('🎤','Speech not available','Your browser does not support speech to text.')}
    rec.lang='en-GB';rec.continuous=true;rec.interimResults=true;const im=$('#im-'+q.id),t0=Date.now();
    MIC={rec,done:()=>{st.act=(st.act||0)+(Date.now()-t0);mb.classList.remove('on');mb.textContent='🎤 Speak';mb.setAttribute('aria-pressed','false');if(im)im.textContent='';save()}};
    rec.onresult=e=>{let tmp='';for(let k=e.resultIndex;k<e.results.length;k++){const r=e.results[k],t=r[0].transcript.trim();
        if(r.isFinal){if(t){ta.value=(ta.value&&!/\s$/.test(ta.value)?ta.value+' ':ta.value)+t;sync()}}else tmp+=t+' '}if(im)im.textContent=tmp?'🎤 '+tmp:''};
    rec.onerror=e=>{if(e.error==='not-allowed')toast('🎤','Microphone blocked','Allow the microphone for this site in your browser settings.');stopMic()};
    rec.onend=()=>{if(MIC&&MIC.rec===rec){MIC=null;st.act=(st.act||0)+(Date.now()-t0);mb.classList.remove('on');mb.textContent='🎤 Speak';if(im)im.textContent='';save()}};
    try{rec.start();mb.classList.add('on');mb.textContent='⏹ Stop';mb.setAttribute('aria-pressed','true')}catch(e){MIC=null}}}
/* store a submitted typed answer so the lecturer (and Claude marking) can review it */
function submitAnswer(q,o,st,C){U.ans=U.ans||{};const key=q.id+'_'+Date.now().toString(36);
  U.ans[key]={q:q.id,sec:o.short?'B':o.cid||'',t:String(st.txt||'').slice(0,3000),at:new Date().toISOString(),b:C.band,f:C.found,s:Object.keys(C.struct).filter(k=>C.struct[k]),w:C.words,x:st.xpGot||0,
    fl:{paste:(st.fl&&st.fl.paste)||0,big:(st.fl&&st.fl.big)||0,fast:st.fast?1:0}};
  /* keep the newest 80: drop the oldest already-marked answers first, then the oldest */
  const old=()=>Object.keys(U.ans).sort((a,b)=>U.ans[a].at<U.ans[b].at?-1:1);
  for(const k of old()){if(Object.keys(U.ans).length<=80)break;if(U.rev&&U.rev[k]&&k!==key)delete U.ans[k]}
  for(const k of old()){if(Object.keys(U.ans).length<=80)break;if(k!==key)delete U.ans[k]}
  return key}
/* a mark from the lecturer or Claude, shown on the question */
function reviewHTML_(key){const r=key&&U.rev&&U.rev[key];if(!r)return '';
  return `<div class="mark"><div class="row" style="justify-content:space-between"><span><b class="big">✓ Marked ${r.band}/6</b></span><span class="tag">+${r.xp} XP</span></div>${r.fb?`<p style="margin:8px 0 0">${esc(r.fb)}</p>`:''}<p class="muted" style="font-size:.8rem;margin:6px 0 0">${r.by==='claude'?'Marked with AI assistance for your lecturer':'Marked by your lecturer'} · ${esc(String(r.at||'').slice(0,10))}</p></div>`}

/* timer that survives leaving the page: stored as {left, end} */
function timer(id,total,el,done,tick){
  const key='tm_'+id,T=LS.get(key,{left:total,end:null}),disp=el.querySelector('#t-'+id),go=el.querySelector('[data-a="tgo"]');
  const left=()=>T.end?Math.round((T.end-Date.now())/1000):T.left;
  const fmt=s=>{const a=Math.abs(s);return (s<0?'+':'')+Math.floor(a/60)+':'+String(a%60).padStart(2,'0')};
  const paint=()=>{const s=left();disp.textContent=fmt(s);disp.className='timer'+(s<0?' over':s<=60?' warn':'');go.textContent=T.end?'Pause':(T.left<total?'Resume':'Start');tick&&tick(s)};
  clearInterval(TIMERS[id]);TIMERS[id]=setInterval(()=>{if(!document.body.contains(disp))return clearInterval(TIMERS[id]);paint()},500);paint();
  go.onclick=()=>{if(T.end){T.left=left();T.end=null}else T.end=Date.now()+T.left*1000;LS.set(key,T);paint()};
  el.querySelector('[data-a="tstop"]').onclick=()=>{T.left=total;T.end=null;LS.set(key,T);paint()};
  el.querySelector('[data-a="done"]').onclick=()=>{const used=total-left(),ok=used>=total*MINPCT;
    if(!ok&&!confirm(`Only ${Math.floor(used/60)} min ${used%60} s on the clock.\n\nTimed XP needs at least ${minMins(total)} minutes of writing. Finish without XP?`))return;
    LS.del(key);clearInterval(TIMERS[id]);done(ok)}}
const noTimeXP=t=>toast('⏱️','No XP this time','Write for at least '+minMins(t)+' minutes to earn timed XP');

/* ---------- Section A: MCQ, one question per screen ----------
   XP: +2 for each correct answer to a question not already answered today ("fresh").
   Speed points (fresh, correct, not rushed): 3 within 15 s, 2 within 30 s, 1 after that.
   A question answered faster than its reading time (about 1 s per 30 characters, at least 3 s) is "rushed": no XP, no speed points.
   End of set: speed bonus = half the speed points × an accuracy factor (0 at 60% or below, full at 90%+),
   cancelled if more than 30% of answers were rushed; plus a finish bonus of 5 / 10 / 15 for 10 / 20 / 30 answers
   (needs at least 10 fresh answers and 50% accuracy). "Retry my mistakes": +1 XP per correct answer, no bonuses. */
const MCQ_BY=Object.fromEntries(BANK.mcq.map(q=>[q.id,q]));
const minRead=q=>Math.max(3,Math.round((q.q.length+q.o.join('').length)/30));
const MQ_SIZES=[10,20,30];
function drawMcq(topic,size){const prev=new Set(U.mlast||[]),pool=BANK.mcq.filter(q=>!topic||q.t===topic);
  const pick=list=>{const fresh=shuffle(list.filter(q=>!prev.has(q.id))),old=shuffle(list.filter(q=>prev.has(q.id)));return fresh.concat(old)};
  let ids;if(topic)ids=pick(pool).slice(0,size).map(q=>q.id);
  else{const by=TOPICS.map(t=>pick(pool.filter(q=>q.t===t)));ids=[];let k=0;while(ids.length<size&&by.some(l=>l.length)){const l=by[k++%by.length];if(l.length)ids.push(l.shift().id)}ids=shuffle(ids)}
  return ids}
function startMcq(ids,o){U.mq={sid:Date.now().toString(36),ids,ord:Object.fromEntries(ids.map(id=>[id,shuffle([0,1,2,3])])),ans:{},tm:{},fr:{},rs:{},i:0,topic:o.topic||0,retry:!!o.retry,start:Date.now(),shown:Date.now()};
  if(!o.retry)U.mlast=ids.slice();save()}
function mcqPage(topic){
  rollDay();if(!U.mday||U.mday.d!==today())U.mday={d:today(),ids:{}};
  const S=U.mq;if(S&&S.i<S.ids.length)return mcqPlay();if(S&&S.done)return mcqSummary();
  const tp=topic||U.mtopic||0,size=U.msize||30,h=(U.mh||[]).slice(-5).reverse();
  shell('#/mcq',`<h1>Section A · Multiple choice</h1><p class="muted">One question at a time with instant feedback and a reason. Answer correctly and quickly for speed points, but read each question properly: answers given too fast earn nothing.</p>
  <div class="grid g2"><div class="card"><h2>Start a set</h2>
   <label for="mtp" style="margin-top:0">Topics</label><select id="mtp" style="width:100%"><option value="0">All topics (8–14), mixed</option>${TOPICS.map(t=>`<option value="${t}" ${t===tp?'selected':''}>${esc(tName(t))}</option>`).join('')}</select>
   <label>Questions</label><div class="seg" role="radiogroup" aria-label="Number of questions">${MQ_SIZES.map(n=>`<button type="button" role="radio" aria-checked="${n===size}" data-n="${n}" class="${n===size?'on':''}">${n}</button>`).join('')}</div>
   <button class="btn" id="mgo" style="width:100%;margin-top:16px">▶ Start</button>
   <p class="muted" style="font-size:.82rem;margin:10px 0 0">Each new set avoids the questions from your last set where it can.</p></div>
  <div class="card"><h2>How XP works here</h2><ul class="sumlist" style="font-size:.92rem">
   <li><b>+2 XP</b> for each correct answer (each question counts once a day).</li>
   <li><b>Speed points</b> for correct answers: ⚡3 within 15 s, 2 within 30 s, 1 after that.</li>
   <li><b>Speed bonus</b> at the end: the faster and more accurate you are, the bigger it gets. Below about 60% accuracy there is no bonus.</li>
   <li>Answer before you have had time to read the question and it earns nothing.</li>
   <li><b>Finish bonus</b> for completing 10, 20 or 30 questions.</li></ul></div></div>
  ${h.length?`<h2 style="margin-top:22px">Recent sets</h2><div class="card"><div class="tablewrap"><table><tr><th>Date</th><th>Topics</th><th>Score</th><th>Accuracy</th><th>Time</th><th>XP</th></tr>${h.map(r=>`<tr><td>${esc(r.d)}</td><td>${r.topic?'Topic '+r.topic:'Mixed'}${r.retry?' · retry':''}</td><td>${r.c}/${r.n}</td><td>${r.acc}%</td><td>${fmtT(r.s)}</td><td>+${r.x}</td></tr>`).join('')}</table></div></div>`:''}
  <h2 style="margin-top:22px">Your accuracy by topic</h2><div class="tcells">${TOPICS.map(t=>{const m=mastery(U,t);return `<a class="tcell" href="#/mcq/t/${t}"><b>${TOPIC_ICO[t]} Topic ${t}</b><span>${esc(TERM.topics[t])}</span><div class="bar"><i style="width:${m.acc}%;background:${m.acc>=80?'var(--green)':'var(--gold)'}"></i></div><small>${m.att?m.acc+'% of '+m.att+' answered':'Not tried yet'}</small></a>`}).join('')}</div>`);
  document.querySelectorAll('.seg [data-n]').forEach(b=>b.onclick=()=>{U.msize=+b.dataset.n;save();document.querySelectorAll('.seg [data-n]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-checked',x===b)})});
  $('#mtp').onchange=()=>{U.mtopic=+$('#mtp').value;save()};
  $('#mgo').onclick=()=>{const t=+$('#mtp').value,n=U.msize||30;U.mtopic=t;startMcq(drawMcq(t,n),{topic:t});mcqPlay()}}
const fmtT=s=>{s=Math.round(s||0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
let MQT=null;
function mcqPlay(){const S=U.mq,id=S.ids[S.i],q=MCQ_BY[id];if(!q){S.i++;save();return S.i<S.ids.length?mcqPlay():mcqFinish()}
  const a=S.ans[id],done=a!==undefined,ord=S.ord[id],good=0;if(!done){S.shown=Date.now();save()}
  const right=S.ids.filter(x=>S.ans[x]===0).length,answered=Object.keys(S.ans).length;
  shell('#/mcq',`<div class="card mcqbox" id="mcq"><div class="row" style="justify-content:space-between"><b class="lex">Question ${S.i+1} of ${S.ids.length}</b>
   <span class="row" style="gap:8px"><span class="tag">${TOPIC_ICO[q.t]} Topic ${q.t}</span>${S.retry?'<span class="tag">Retry</span>':''}<span class="qclock" id="qc" aria-label="Time on this question">⏱ 0 s</span></span></div>
   <div class="bar" style="margin:10px 0 14px"><i style="width:${answered/S.ids.length*100}%;background:var(--teal)"></i></div>
   <h2 class="mq" style="font-weight:600">${esc(q.q)}</h2>
   <div class="mopts">${ord.map((oi,k)=>{let cls='';if(done){cls=oi===0?'good':oi===a?'bad':'dim'}return `<button class="mopt ${cls}" data-oi="${oi}" ${done?'disabled':''}><span class="ml">${'ABCD'[k]}</span><span>${esc(q.o[oi])}</span></button>`}).join('')}</div>
   <div id="mfb">${done?mcqFb(S,q):''}</div>
   <div class="row" style="justify-content:space-between;margin-top:14px"><span class="muted" style="font-size:.85rem">✓ ${right} right · ⚡ ${mcqSpeed(S)} speed points</span>
   <span class="row" style="gap:8px"><button class="btn ghost sm" id="mqq">End set</button>${done?`<button class="btn" id="mnx">${S.i<S.ids.length-1?'Next →':'See results 🏁'}</button>`:''}</span></div></div>`);
  clearInterval(MQT);const qc=$('#qc'),t0=S.shown;
  const paint=()=>{if(!document.body.contains(qc))return clearInterval(MQT);const s=done?S.tm[id]:Math.floor((Date.now()-t0)/1000);qc.textContent='⏱ '+s+' s';qc.className='qclock'+(done?'':s<=15?' fast':s<=30?'':' slow')};
  paint();if(!done)MQT=setInterval(paint,500);
  document.querySelectorAll('.mopt').forEach(b=>b.onclick=()=>mcqAnswer(+b.dataset.oi));
  $('#mnx')&&($('#mnx').onclick=()=>{S.i++;save();S.i<S.ids.length?mcqPlay():mcqFinish()});
  $('#mqq').onclick=()=>{if(!answered){if(confirm('Leave this set? No questions have been answered yet.')){U.mq=null;save();mcqPage()}return}
    if(confirm(`End the set now?\n\nYou answered ${answered} of ${S.ids.length}. Bonuses depend on how many you finish.`))mcqFinish()};
  document.onkeydown=e=>{if(!$('#mcq')){document.onkeydown=null;return}if(e.target.closest&&e.target.closest('input,textarea,select'))return;
    const k=e.key.toUpperCase(),i='ABCD'.indexOf(k);if(!done&&i>=0&&ord[i]!==undefined){e.preventDefault();mcqAnswer(ord[i])}else if(done&&e.key==='Enter'&&$('#mnx')){e.preventDefault();$('#mnx').click()}};
  if(done)$('#mnx')&&$('#mnx').focus()}
function mcqSpeed(S){return S.ids.reduce((t,id)=>t+speedOf(S,id),0)}
function speedOf(S,id){if(S.retry||S.ans[id]!==0||!S.fr[id]||S.rs[id])return 0;const t=S.tm[id];return t<=15?3:t<=30?2:1}
function mcqAnswer(oi){const S=U.mq,id=S.ids[S.i],q=MCQ_BY[id];if(S.ans[id]!==undefined)return;clearInterval(MQT);
  const t=Math.min(600,Math.round((Date.now()-S.shown)/1000)),ok=oi===0;S.ans[id]=oi;S.tm[id]=t;
  if(!U.mday||U.mday.d!==today())U.mday={d:today(),ids:{}};
  const fresh=!S.retry&&!U.mday.ids[id];S.fr[id]=fresh;S.rs[id]=t<minRead(q);U.mday.ids[id]=1;
  U.mrow=ok?(U.mrow||0)+1:0;if(U.mrow>(U.n.bestRow||0))U.n.bestRow=U.mrow;
  if(fresh){U.mt=U.mt||{};const r=U.mt[q.t]||(U.mt[q.t]=[0,0]);r[0]++;if(ok)r[1]++;countOnce('mcq:'+id+':'+today(),'mcq',ok&&'mcqRight')}
  if(ok&&!S.rs[id]){if(fresh)award('mcq:'+id+':'+today(),2,'Correct',1);else if(S.retry)award('mcqr:'+id+':'+today(),1,'Correct',1)}
  else{checkBadges();save();hud()}
  if(!ok){U.wk=U.wk||{q:{},t:{}};const k='t'+q.t,r=U.wk.t[k]||(U.wk.t[k]=[0,0]);r[0]++;r[1]=Math.round((r[1]+.5)*10)/10}
  save();mcqPlay()}
function mcqFb(S,q){const id=q.id,a=S.ans[id],ok=a===0,sp=speedOf(S,id),t=S.tm[id];
  return `<div class="fb ${ok?'ok':'no'}" role="status"><b>${ok?'✓ Correct':'✗ Not quite'}</b>${ok?'':` · The answer is <b>${esc(q.o[0])}</b>`}<div style="margin-top:4px">${esc(q.why)}</div>
  <div class="muted" style="font-size:.85rem;margin-top:6px">⏱ ${t} s${ok?(S.rs[id]?' · Too quick to count: take time to read the whole question. No XP for this one.':sp?` · ⚡ +${sp} speed point${sp===1?'':'s'}${S.fr[id]?' · +2 XP':''}`:S.retry?' · +1 XP':' · already answered today, so no XP this time'):''}</div></div>`}
function mcqFinish(){const S=U.mq;clearInterval(MQT);document.onkeydown=null;if(S.done)return mcqSummary();
  const ans=S.ids.filter(id=>S.ans[id]!==undefined),n=ans.length,c=ans.filter(id=>S.ans[id]===0).length,acc=n?c/n:0;
  const fresh=ans.filter(id=>S.fr[id]).length,rushed=ans.filter(id=>S.rs[id]).length,sp=mcqSpeed(S),secs=ans.reduce((t,id)=>t+(S.tm[id]||0),0);
  const f=Math.max(0,Math.min(1,(acc-.6)/.3)),speedBonus=S.retry||rushed>n*.3?0:Math.round(sp/2*f);
  const fin=S.retry||fresh<10||acc<.5?0:n>=30?15:n>=20?10:n>=10?5:0,bonus=speedBonus+fin;
  S.done=1;S.end=Date.now();S.bonus={speed:speedBonus,fin,f:Math.round(f*100)};
  if(n>=10&&!S.retry){U.n.mcqSets=(U.n.mcqSets||0)+1;if(n>=20)countOnce('mset20:'+S.sid,'mset20');if(n>=20&&acc>=.8)countOnce('mset80:'+S.sid,'mset80')}
  const clean=ans.filter(id=>!S.rs[id]),avg=clean.length?clean.reduce((t,id)=>t+S.tm[id],0)/clean.length:99;
  if(!S.retry&&n>=30&&c===n&&rushed===0)U.n.perfect30=(U.n.perfect30||0)+1;
  if(!S.retry&&n>=20&&acc>=.9&&avg<=15&&rushed<=n*.1)U.n.speedrun=(U.n.speedrun||0)+1;
  if(bonus)award('mqs:'+S.sid,bonus,'MCQ set bonus');else{checkBadges();save()}
  const xp=xpOfSet(S);U.mh=(U.mh||[]).concat({d:today(),topic:S.topic,retry:S.retry,n,c,acc:Math.round(acc*100),s:secs,x:xp}).slice(-20);save();hud();mcqSummary()}
function xpOfSet(S){U.gain=U.gain||{};const d=new Date(S.start),day=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  return S.ids.reduce((t,id)=>t+(S.ans[id]===0&&!S.rs[id]?(S.fr[id]?(U.gain['mcq:'+id+':'+day]|0):S.retry?(U.gain['mcqr:'+id+':'+day]|0):0):0),0)+(U.gain['mqs:'+S.sid]|0)}
function mcqSummary(){const S=U.mq,ans=S.ids.filter(id=>S.ans[id]!==undefined),n=ans.length,c=ans.filter(id=>S.ans[id]===0).length,acc=n?Math.round(c/n*100):0;
  const secs=ans.reduce((t,id)=>t+(S.tm[id]||0),0),wrong=ans.filter(id=>S.ans[id]!==0),B=S.bonus||{speed:0,fin:0,f:0},rushed=ans.filter(id=>S.rs[id]).length;
  const by={};ans.forEach(id=>{const t=MCQ_BY[id].t,r=by[t]||(by[t]=[0,0]);r[0]++;if(S.ans[id]===0)r[1]++});
  const weakT=Object.keys(by).filter(t=>by[t][1]/by[t][0]<.7).sort((a,b)=>by[a][1]/by[a][0]-by[b][1]/by[b][0]);
  shell('#/mcq',`<div class="card"><div style="font-size:2.4rem">${acc>=90?'🏆':acc>=70?'🎉':'💪'}</div><h1 style="margin:4px 0">${S.retry?'Retry results':'Set results'}</h1>
  <div class="stats"><div class="stat"><b>${c}/${n}</b><span>correct</span></div><div class="stat"><b>${acc}%</b><span>accuracy</span></div><div class="stat"><b>${fmtT(secs)}</b><span>time</span></div><div class="stat"><b>+${xpOfSet(S)}</b><span>XP from this set</span></div></div>
  ${S.retry?'':`<div class="mres"><span>⚡ ${mcqSpeed(S)} speed points</span><span>Speed bonus <b>+${B.speed}</b>${B.speed?'':rushed>n*.3?' (too many rushed answers)':acc<=60?' (needs more than 60% accuracy)':''}</span><span>Finish bonus <b>+${B.fin}</b></span></div>`}
  ${rushed?`<p class="flagnote">⚠️ ${rushed} answer${rushed===1?' was':'s were'} given before there was time to read the question, so ${rushed===1?'it':'they'} earned no XP.</p>`:''}
  <h3 style="margin-top:16px">Accuracy by topic</h3><div class="tablewrap"><table><tr><th>Topic</th><th>Right</th><th>Accuracy</th></tr>${Object.keys(by).sort((a,b)=>a-b).map(t=>`<tr><td>${esc(tName(t))}</td><td>${by[t][1]}/${by[t][0]}</td><td><b style="color:${by[t][1]/by[t][0]>=.8?'var(--green)':by[t][1]/by[t][0]>=.6?'var(--gold)':'var(--red)'}">${Math.round(by[t][1]/by[t][0]*100)}%</b></td></tr>`).join('')}</table></div>
  ${weakT.length?`<div class="callout" style="margin-top:14px">🎯 <b>Practise next:</b> ${weakT.slice(0,2).map(t=>`<a href="#/notes/${t}">${esc(tName(t))} notes</a>`).join(' · ')}</div>`:''}
  ${wrong.length?`<h3 style="margin-top:16px">Questions to review (${wrong.length})</h3>${wrong.map(id=>{const q=MCQ_BY[id];return `<div class="mqi"><div class="muted" style="font-size:.8rem">Topic ${q.t}</div><b>${esc(q.q)}</b><div style="margin-top:6px;font-size:.92rem">Your answer: <span style="color:var(--red)">${esc(q.o[S.ans[id]])}</span><br>Correct: <span style="color:var(--green)">${esc(q.o[0])}</span></div><div class="muted" style="font-size:.88rem;margin-top:4px">${esc(q.why)}</div></div>`}).join('')}`:'<div class="fb ok" style="margin-top:14px">No mistakes in this set. Excellent.</div>'}
  <div class="row" style="margin-top:16px">${wrong.length?'<button class="btn gold" id="mrt">↺ Retry my mistakes</button>':''}<button class="btn" id="mns">🎲 New set</button><button class="btn ghost" id="mch">Change topic or length</button></div></div>`);
  $('#mrt')&&($('#mrt').onclick=()=>{startMcq(shuffle(wrong),{topic:S.topic,retry:1});mcqPlay()});
  $('#mns').onclick=()=>{startMcq(drawMcq(S.topic,U.msize||30),{topic:S.topic});mcqPlay()};
  $('#mch').onclick=()=>{U.mq=null;save();mcqPage()}}

/* ---------- badges ---------- */
function badgesPage(){shell('#/badges',`<h1>Badges</h1><p class="muted">${Object.keys(U.badges).length} of ${BADGES.length} unlocked.</p>
 <div class="badges">${BADGES.map(b=>`<div class="badge ${U.badges[b.id]?'got':''}"><div class="ico">${b.ico}</div><b>${b.name}</b><span>${b.d}</span></div>`).join('')}</div>
 <h2 style="margin-top:26px">Levels</h2><div class="card"><div class="tablewrap"><table><tr><th>Level</th><th>Title</th><th>XP needed</th></tr>${LEVELS.map((l,i)=>`<tr style="${level(U.xp).i===i?'color:var(--teal);font-weight:700':''}"><td>${i+1}</td><td>${l[1]}</td><td>${l[0]}</td></tr>`).join('')}</table></div></div>
 <h2 style="margin-top:26px">How to earn XP</h2><div class="card"><div class="tablewrap"><table>
 <tr><td>Read a case section</td><td>+5</td></tr><tr><td>Read a whole case</td><td>+30</td></tr><tr><td>Judge a boardroom argument</td><td>+10 if you agree with our reading, +3 otherwise</td></tr>
 <tr><td>Build an answer plan</td><td>+15 (+10 bonus for a flawless plan). Choosing <b>Plan only</b> keeps this XP and moves on.</td></tr><tr><td>Type (or speak) an answer and check it</td><td>+10, plus +3 for each key idea and +2 for each structure point the automatic check finds, up to +32. Needs at least 40 words, at least one key idea, and your own typing or speech: pasting is turned off.</td></tr><tr><td>Answer marked by your lecturer</td><td>Up to +30, depending on the mark. It stays even if you restart the question.</td></tr><tr><td>Finish a timed answer on paper</td><td>+30 (write for at least 4 of the 10 minutes; any timed task needs 40% of its time on the clock)</td></tr><tr><td>Practise the same question again</td><td>XP and badge progress count once per question per day</td></tr><tr><td>Self-check</td><td>+3 per check met</td></tr>
 <tr><td>MCQ: correct answer</td><td>+2 (each question counts once a day). Answers given before you could read the question earn nothing.</td></tr><tr><td>MCQ: speed bonus</td><td>Speed points for correct answers (3 within 15 s, 2 within 30 s, 1 after). At the end you get half your speed points, scaled by accuracy: nothing at 60% or below, the full amount at 90% or better.</td></tr><tr><td>MCQ: finish bonus</td><td>+5 for 10 questions, +10 for 20, +15 for 30 (needs at least 10 new questions and 50% accuracy)</td></tr><tr><td>MCQ: retry my mistakes</td><td>+1 per correct answer</td></tr>
 <tr><td>Study a topic in the notes</td><td>+20</td></tr><tr><td>Finish a case activity</td><td>+15 (+10 for a top-band argument)</td></tr><tr><td>Crack a case (all read, all judged, 5 questions finished)</td><td>+50</td></tr>
 <tr><td>Long answer written on paper (about 18 minutes)</td><td>+40 (write for at least 40% of the time)</td></tr><tr><td>Long answer self-marked</td><td>+2 per mark you give yourself</td></tr>
 <tr><td>Practise on a new day</td><td>+10</td></tr><tr><td>Complete the daily mission</td><td>+25 Starter · +35 Pro · +50 Elite (missions get tougher as you level up)</td></tr></table></div></div>`)}

/* ---------- leaderboard (weekly, from score codes) ---------- */
async function scoreCode(){const p={v:1,s:ME.sid,n:U.hide?'':U.nick,x:U.xp,l:level(U.xp).i,b:Object.keys(U.badges).length,d:today()};
  const j=btoa(unescape(encodeURIComponent(JSON.stringify(p)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return 'MKT101-'+j+'-'+(await sha('mkt101-score|'+j)).slice(0,8)}
async function rowKey(sid){return (await sha(ROSTER.salt+'|'+sid)).slice(0,12)}
/* live leaderboard (cloud): updates as soon as anyone earns XP */
function liveBoard(){
  shell('#/board',`<div class="row" style="justify-content:space-between"><h1 style="margin:0">Leaderboard</h1><span class="live"><i></i>LIVE</span></div>
  <p class="muted">Scores update the moment anyone earns XP. Student IDs are never shown.</p>
  <div class="grid g2"><div class="card lb" id="lbl"><p class="muted">Loading the class…</p></div>
  <div class="card"><h2>You on the board</h2><p style="margin:0 0 6px">Your score: <b>${U.xp} XP</b> · ${esc(level(U.xp).name)} · ${Object.keys(U.badges).length} badges</p>
   ${ME.sid===LECTURER?'<p class="muted" style="font-size:.9rem">The lecturer account is not shown on the board.</p>':`
   <label for="nk">Name on the board</label><input type="text" id="nk" maxlength="24" value="${esc(U.nick)}">
   <label style="display:flex;gap:8px;align-items:center;font:400 .95rem Inter;color:var(--ink)"><input type="checkbox" id="hd" ${U.hide?'checked':''} style="width:20px;height:20px;accent-color:var(--teal)"> Show me as "Hidden player"</label>
   <p class="muted" style="font-size:.85rem;margin-top:12px">No need to send anything: your score updates automatically. ${syncChip()}</p>`}</div></div>`);
  const upd=()=>{U.nick=$('#nk').value.trim().slice(0,24)||defaultNick(ME.name);U.hide=$('#hd').checked;save();toast('🏷️','Saved','The board will update in a moment')};
  $('#nk')&&($('#nk').onchange=upd);$('#hd')&&($('#hd').onchange=upd);
  CLOUD.watchBoard(rows=>{const el=$('#lbl');if(!el)return;rows=rows.filter(r=>r.id!==LECTURER);
    el.innerHTML=rows.length?rows.map((r,i)=>`<div class="r ${r.id===ME.sid?'me':''}"><span class="pos ${i<3?'p'+(i+1):''}">${i<3?['🥇','🥈','🥉'][i]:i+1}</span><div><b>${esc(r.n||'Hidden player')}${r.id===ME.sid?' <span class="tag">You</span>':''}</b><div class="muted" style="font-size:.8rem">${esc(LEVELS[r.l]?.[1]||'')} · ${r.b} badge${r.b===1?'':'s'} · 🔥 ${r.s}</div></div><b class="lex" style="color:var(--gold)">${r.x} XP</b></div>`).join(''):'<p class="muted">No scores yet. Earn some XP and you will appear here.</p>'},
    e=>{const el=$('#lbl');if(el)el.innerHTML=`<p class="err">${esc(CLOUD.say(e))}</p>`})}
async function boardPage(){if(cloudOn())return liveBoard();
  const rows=(LEADERBOARD.rows||[]).slice().sort((a,b)=>b.x-a.x),mine=await rowKey(ME.sid);
  shell('#/board',`<h1>Leaderboard</h1><p class="muted">${LEADERBOARD.updated?'Updated '+esc(LEADERBOARD.updated)+'. ':''}The board is updated weekly from the scores students send in.</p>
  <div class="grid g2"><div class="card lb">${rows.length?rows.map((r,i)=>`<div class="r ${r.k===mine?'me':''}"><span class="pos ${i<3?'p'+(i+1):''}">${i<3?['🥇','🥈','🥉'][i]:i+1}</span><div><b>${esc(r.n||'Hidden player')}</b><div class="muted" style="font-size:.8rem">${esc(LEVELS[r.l]?.[1]||'')} · ${r.b} badges</div></div><b class="lex" style="color:var(--gold)">${r.x} XP</b></div>`).join(''):'<p class="muted">No scores yet. Be the first: send your score →</p>'}</div>
  <div class="card"><h2>Send my score</h2><p class="muted" style="font-size:.9rem">Send your score each week to appear on the board. Your student ID is never shown.</p>
   <label for="nk">Name on the board</label><input type="text" id="nk" maxlength="24" value="${esc(U.nick)}">
   <label style="display:flex;gap:8px;align-items:center;font:400 .95rem Inter;color:var(--ink)"><input type="checkbox" id="hd" ${U.hide?'checked':''} style="width:20px;height:20px;accent-color:var(--teal)"> Show me as "Hidden player"</label>
   <p style="margin-top:14px">Your score: <b>${U.xp} XP</b> · ${esc(level(U.xp).name)} · ${Object.keys(U.badges).length} badges</p>
   <div class="row"><a class="btn" id="em">📧 Email my score</a><button class="btn ghost" id="cp">Copy code</button></div>
   <p class="muted" style="font-size:.8rem;margin-top:10px">If email doesn't open, copy the code and send it to your lecturer.</p><div class="code hide" id="cd"></div></div></div>`);
  const upd=async()=>{U.nick=$('#nk').value.trim().slice(0,24)||defaultNick(ME.name);U.hide=$('#hd').checked;save();const code=await scoreCode();
    $('#em').href='mailto:'+SCORE_EMAIL+'?subject='+encodeURIComponent('MKT101 score: '+(U.hide?'Hidden player':U.nick))+'&body='+encodeURIComponent('My MKT101 Arena score code:\n\n'+code+'\n');return code};
  $('#nk').onchange=upd;$('#hd').onchange=upd;await upd();
  $('#cp').onclick=async()=>{const code=await upd();$('#cd').textContent=code;$('#cd').classList.remove('hide');try{await navigator.clipboard.writeText(code);toast('📋','Copied','Paste it into a message to your lecturer')}catch(e){}}}

/* ---------- lecturer tools ---------- */
/* classroom demo: made-up students, XP worked out from the real scoring rules */
const DEMO_ROWS=[ // [activity, XP each, Student 1 count, Student 2 count]
 ['Practise on a new day',10,6,1],['Daily missions completed (Starter)',25,2,1],['Daily missions completed (Pro)',35,3,0],['Correct MCQ answers (new questions)',2,150,90],
 ['MCQ speed and finish bonuses (per set)',30,6,1],['Topics studied in the notes',20,7,3],['Case sections read',5,20,10],['Boardroom verdicts that match our reading',10,18,8],
 ['Other boardroom verdicts',3,6,9],['Answer plans built',15,10,5],['Flawless plans (bonus)',10,3,0],['Timed answers written on paper',30,6,1],['Case activities finished',15,8,2],['Long answers written on paper',40,2,0]];
const DEMO_P=[{n:'Student 1',who:'Practises about 35 minutes a day, 6 days a week',em:'🐢',time:'≈ 3.5 hours',streak:6,
   badges:['🎫','🧑‍💼','📋','📈','🔥','☄️','📚','🎯','🎙️','⚖️','🧱','💎','⏱️','🛠️','✅']},
 {n:'Student 2',who:'Crams in one 4-hour session the night before',em:'🐇',time:'≈ 4 hours',streak:1,badges:['🎫','🧑‍💼','📋','🎯','🎙️','🧱','✅']}];
function demoXP(i){return DEMO_ROWS.reduce((t,r)=>t+r[1]*r[2+i],0)}
function demo(){
  let mode='board';
  const draw=()=>{document.querySelectorAll('[data-dm]').forEach(b=>b.classList.toggle('on',b.dataset.dm===mode));const x1=demoXP(0),x2=demoXP(1);let h='';
    if(mode==='board'){const rows=[['Student 1',x1,11],['Student 3',1010,10],['Student 4',860,9],['Student 5',655,8],['Student 6',540,7],['Student 2',x2,6],['Student 7',310,4],['Student 8',150,2]].sort((a,b)=>b[1]-a[1]);
      h=`<div class="lb">${rows.map((r,i)=>`<div class="r ${r[0]==='Student 1'||r[0]==='Student 2'?'me':''}"><span class="pos ${i<3?'p'+(i+1):''}">${i<3?['🥇','🥈','🥉'][i]:i+1}</span><div><b>${r[0]}</b><div class="muted" style="font-size:.8rem">${LEVELS[level(r[1]).i][1]} · ${r[2]} badges</div></div><b class="lex" style="color:var(--gold)">${r[1]} XP</b></div>`).join('')}</div>
      <p class="muted" style="font-size:.85rem;margin-top:10px">Students 1 and 2 are highlighted. Open <b>Student 1 vs Student 2</b> to see why they are so far apart.</p>`}
    else if(mode==='vs'){
      h=`<div class="grid g2">${DEMO_P.map((p,i)=>{const x=demoXP(i),L=level(x);return `<div class="card" style="text-align:center;box-shadow:none"><div style="font-size:2.4rem">${p.em}</div><h3 style="margin:4px 0">${p.n}</h3><p class="muted" style="font-size:.88rem">${p.who}</p>
        <div class="ring" style="--p:${L.pct};margin:0 auto;width:110px;height:110px"><div><b style="font-size:1.5rem">${x}</b><small>XP</small></div></div>
        <div class="stats" style="grid-template-columns:repeat(3,1fr)"><div class="stat"><b style="font-size:1rem">${esc(L.name)}</b><span>level</span></div><div class="stat"><b>🔥 ${p.streak}</b><span>streak</span></div><div class="stat"><b>${p.badges.length}</b><span>badges</span></div></div>
        <p style="font-size:1.3rem;letter-spacing:2px;margin:12px 0 4px">${p.badges.join('')}</p><p class="muted" style="font-size:.8rem;margin:0">Time spent: ${p.time}</p></div>`}).join('')}</div>
      <h3 style="margin-top:18px">Where the XP came from</h3><div class="tablewrap"><table class="wide"><tr><th>Activity</th><th>XP each</th><th>Student 1</th><th>Student 2</th></tr>
      ${DEMO_ROWS.map(r=>`<tr><td>${r[0]}</td><td>+${r[1]}</td><td>${r[2]} × ${r[1]} = <b>${r[1]*r[2]}</b></td><td>${r[3]} × ${r[1]} = <b>${r[1]*r[3]}</b></td></tr>`).join('')}
      <tr><th>Total</th><th></th><th style="color:var(--gold)">${x1} XP</th><th style="color:var(--gold)">${x2} XP</th></tr></table></div>
      <div class="callout" style="margin-top:14px"><b>Less time, ${(x1/x2).toFixed(1)}× the XP.</b> Student 1 spent about the same time but practised a little every day: daily check-ins and missions add up, timed writing on paper earns the most, and repeat practice makes plans flawless.</div>`}
    else h=`<div class="grid g2">${[
      ['📅','Show up daily','+10 for each new day and +25 to +50 for the daily mission. Six short days beat one long night.'],
      ['⚡','Fast and accurate MCQs','+2 for each new correct answer, plus a speed bonus that only pays when accuracy is high. Guessing quickly earns nothing.'],
      ['✍️','Write on paper, timed','+30 per timed short answer and +40 per long answer: the habit that matters most.'],
      ['🎯','Judge the boardroom carefully','+10 when your verdict matches our reading, +3 otherwise. Read the reasons; they teach the theory.'],
      ['💎','Plan without decoys','+15 per plan, +10 more when it has every key idea and no decoys.'],
      ['📖','Read every case in full','+5 a section, +30 for the whole case. Any case could be the one that matters.'],
      ['🏆','Master every topic','Study the notes, score 80%+ on 15 MCQs and write one answer for each topic to unlock seven mastery badges.']
     ].map(t=>`<div class="card" style="box-shadow:none"><div style="font-size:1.8rem">${t[0]}</div><h3 style="margin:6px 0 4px">${t[1]}</h3><p class="muted" style="margin:0;font-size:.92rem">${t[2]}</p></div>`).join('')}</div>`;
    $('#dm').innerHTML=h};
  document.querySelectorAll('[data-dm]').forEach(b=>b.onclick=()=>{mode=b.dataset.dm;draw()});
  $('#fs').onclick=()=>{const d=$('#demo');if(document.fullscreenElement)document.exitFullscreen();else if(d.requestFullscreen)d.requestFullscreen()};
  draw()}
/* lecturer content review: every invented or simplified fact to check, mostly pulled from the data files */
const REAL=['Naver','World Bank','WTO','Starbucks','Global Exchange','Magnum','7-Eleven','Jollibee','McDonald','Coca-Cola','KFC','IKEA','Toyota','Unilever','Nestlé','Samsung','Apple','Google','Amazon','Alibaba','Netflix','Uber','Airbnb','Nike','Zara','Dhiraagu','Ooredoo','Bank of Maldives','MIFCO','STO','Facebook','Instagram','TikTok','WhatsApp','Visa','Mastercard','DHL','Maersk','Emirates','SriLankan'];
function reviewHTML(){const rv=LS.get('review',{}),num=t=>esc(t).replace(/(\b(?:MVR|USD|SGD|MYR|THB|EUR|JPY)\s?)?\d[\d,.]*\s?(%|percent|million|billion|years?|divers|boats|users|craftspeople|followers|outlets|stores)?/g,m=>`<mark>${m}</mark>`);
  const strip=h=>String(h).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(),box=(id,html)=>`<label class="rv"><input type="checkbox" data-rv="${id}" ${rv[id]?'checked':''}><span>${html}</span></label>`;
  const cases=CASEL.map(c=>`<details class="mine"><summary>${c.icon} ${esc(c.title)}</summary><p class="muted" style="font-size:.85rem">${esc(c.note)}</p>
    <h4>Check these</h4>${(c.review||[]).map((t,j)=>box(c.id+':n'+j,num(t))).join('')}
    <h4>People</h4>${box(c.id+':ppl',esc(c.people.map(p=>p[0]+' ('+p[1]+')').join(' · ')))}
    <h4>Exhibits</h4>${c.exhibits.map((x,j)=>box(c.id+':x'+j,`<b>${esc(x.title)}</b><br><span class="muted" style="font-size:.85rem">${num(strip(x.html))}</span>`)).join('')}
    <h4>Boardroom readings</h4>${box(c.id+':br',`<span style="font-size:.85rem">${c.boardroom.map(a=>`<b>${esc(a.who)}</b> → ${a.v}`).join(' · ')}</span>`)}</details>`).join('');
  const nq=BANK.mcq.filter(q=>+q.id.split('-')[1]>22),named=BANK.mcq.concat(BANK_S).map(q=>[q,REAL.filter(n=>JSON.stringify(q).includes(n))]).filter(x=>x[1].length);
  const bq=named.map(([q,n])=>box('r:'+q.id,`<b>${esc(n.join(', '))}</b> in ${esc(q.id)} (Topic ${q.t}): <span class="muted" style="font-size:.85rem">${esc(q.q)}</span>`)).join('');
  return `<p class="muted" style="font-size:.9rem;margin-top:0">Everything below was created or simplified for practice. Tick each item once you've checked it. Ticks are saved on this device. Numbers are highlighted.</p>
  <h3>Cases</h3>${cases}
  <h3 style="margin-top:16px">New for the arena</h3><details class="mine"><summary>${nq.length} new MCQs (8 per topic)</summary>${nq.map(q=>box('m:'+q.id,`<b>${esc(q.id)}</b> ${esc(q.q)}<br><span class="muted" style="font-size:.85rem">✓ ${esc(q.o[0])} · ${esc(q.why)}</span>`)).join('')}</details>
  <details class="mine"><summary>${BANK_S.length} short-answer questions with plan chips</summary>${BANK_S.map(q=>box('s:'+q.id,`<b>${esc(q.id)}</b> ${esc(q.q)}<br><span class="muted" style="font-size:.85rem">${q.chips.filter(c=>c.g).map(c=>esc(c.t)).join(' · ')}</span>`)).join('')}</details>
  <h3 style="margin-top:16px">Real organisations named</h3><details class="mine"><summary>${named.length} question${named.length===1?'':'s'} name real organisations: check the claims</summary>${bq||'<p class="muted">None found.</p>'}</details>`}
/* live class dashboard (cloud): every student's progress, class-wide decoys and the least-practised topics */
let QIDX=null;
function qIndex(){if(QIDX)return QIDX;QIDX={};CASEL.forEach(c=>c.questions.forEach(q=>QIDX[q.id]={q,area:'c:'+c.id,label:c.short+': '+q.skill}));
  BANK_S.forEach(q=>QIDX[q.id]={q,area:'t'+q.t,label:'Topic '+q.t+': '+q.topic});return QIDX}
const practised=u=>new Set(Object.keys((u&&u.log)||{}).map(k=>(k.match(/^(?:plan|timed|typed|check):([^:]+):/)||[])[1]).filter(Boolean));
function weakOf(u){const t=((u&&u.wk)||{}).t||{};return Object.keys(t).filter(k=>t[k][1]>0).sort((a,b)=>t[b][1]/Math.max(1,t[b][0])-t[a][1]/Math.max(1,t[a][0])).slice(0,2).map(tkLabel)}
function ago(d){if(!d)return '–';const m=Math.round((Date.now()-d)/60000);return m<2?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'}
function classDash(){
  $('#cdash').innerHTML=`<div class="row" style="justify-content:space-between"><h2 style="margin:0">Class dashboard</h2><span class="live"><i></i>LIVE</span></div><div id="cdb"><p class="muted">Loading students…</p></div>`;
  CLOUD.watchUsers(list=>{const el=$('#cdb');if(!el)return;const I=qIndex();
    const st=list.filter(x=>x.id!==LECTURER&&x.u).map(x=>{const u=x.u,n=u.n||{};return {id:x.id,name:x.name||'',xp:u.xp|0,lv:level(u.xp|0).name,str:streak(Object.assign({days:[]},u)),ts:x.ts,
      plans:n.plans|0,timed:n.timed|0,typed:n.typed|0,flags:Object.values(u.integ||{}).reduce((t,v)=>t+(v|0),0),badges:Object.keys(u.badges||{}).length,weak:weakOf(u),done:practised(u),u}}).sort((a,b)=>b.xp-a.xp);
    const day=864e5,now=Date.now(),act=d=>st.filter(x=>x.ts&&now-x.ts<d).length,total=(typeof ROSTER!=='undefined'?ROSTER.hashes.length-1:st.length);
    const dec={};st.forEach(x=>Object.entries(x.u.plansSaved||{}).forEach(([id,p])=>{const e=I[id];if(!e||!p.checked)return;(p.sel||[]).forEach(j=>{const c=e.q.chips[j];if(c&&!c.g){const k=id+'|'+j;dec[k]=dec[k]||{t:c.t,why:c.why,where:e.label,n:0};dec[k].n++}})}));
    const topDec=Object.values(dec).sort((a,b)=>b.n-a.n).slice(0,8);
    const areas=[...new Set(Object.values(I).map(e=>e.area))].map(a=>({a,label:a[0]==='t'?tkLabel(a):CASEL.find(c=>'c:'+c.id===a).short+' (case practice)',n:st.filter(x=>[...x.done].some(id=>I[id]&&I[id].area===a)).length})).sort((a,b)=>a.n-b.n).slice(0,6);
    el.innerHTML=`<div class="stats" style="margin:12px 0"><div class="stat"><b>${st.length}/${total}</b><span>signed up</span></div><div class="stat"><b>${act(day)}</b><span>active today</span></div><div class="stat"><b>${act(7*day)}</b><span>active this week</span></div><div class="stat"><b>${st.length?Math.round(st.reduce((t,x)=>t+x.xp,0)/st.length):0}</b><span>average XP</span></div></div>
    <div class="tablewrap"><table class="wide"><tr><th>#</th><th>Name</th><th>ID</th><th>XP</th><th>Level</th><th>🔥</th><th>Last active</th><th>Plans</th><th>Timed</th><th>Typed</th><th title="Pastes blocked, big insertions removed, too-fast answers">Flags</th><th>Badges</th><th>Weak topics</th></tr>
    ${st.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.name)}</td><td>${esc(x.id)}</td><td><b>${x.xp}</b></td><td>${esc(x.lv)}</td><td>${x.str}</td><td>${ago(x.ts)}</td><td>${x.plans}</td><td>${x.timed}</td><td>${x.typed}</td><td>${x.flags?'<b style="color:var(--gold)">'+x.flags+'</b>':'0'}</td><td>${x.badges}</td><td style="font-size:.82rem">${esc(x.weak.join('; ')||'–')}</td></tr>`).join('')||'<tr><td colspan="13" class="muted">No students have signed in with a PIN yet.</td></tr>'}</table></div>
    <div class="grid g2" style="margin-top:16px"><div><h3>Decoys the class picks most</h3>${topDec.length?`<ol class="sumlist">${topDec.map(d=>`<li><b>${esc(d.t)}</b> <span class="tag">${d.n} student${d.n===1?'':'s'}</span><div class="muted" style="font-size:.82rem">${esc(d.where)}${d.why?' · '+esc(d.why):''}</div></li>`).join('')}</ol>`:'<p class="muted">No decoys picked yet.</p>'}</div>
    <div><h3>Practised by the fewest students</h3><ol class="sumlist">${areas.map(a=>`<li>${esc(a.label)} <span class="tag">${a.n}/${st.length||0}</span></li>`).join('')}</ol></div></div>
    <button class="btn ghost sm" id="csv" style="margin-top:12px">⬇ Download CSV</button>`;
    $('#csv').onclick=()=>{const q=v=>'"'+String(v).replace(/"/g,'""')+'"',rows=[['Name','ID','XP','Level','Streak','Last active','Plans','Timed','Typed','Integrity flags','Badges','Weak topics']].concat(st.map(x=>[x.name,x.id,x.xp,x.lv,x.str,x.ts?x.ts.toISOString():'',x.plans,x.timed,x.typed,x.flags,x.badges,x.weak.join('; ')]));
      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.map(r=>r.map(q).join(',')).join('\n')],{type:'text/csv'}));a.download='mkt101-class-'+today()+'.csv';a.click()}},
  e=>{const el=$('#cdb');if(el)el.innerHTML=`<p class="err">${esc(CLOUD.say(e))}</p>`})}
/* marking: typed answers waiting for a mark, and marks already given (by Claude marking or by the lecturer) */
function markQueue(){let US=null,RV=null,tab='q',open=null;const drafts={},I=qIndex();
  $('#mq').innerHTML=`<div class="row" style="justify-content:space-between"><h2 style="margin:0">Marking</h2><span class="live"><i></i>LIVE</span></div>
  <p class="muted" style="font-size:.88rem;margin:6px 0 10px">Typed answers students have submitted. Mark them here, or ask Claude to mark the queue (see CLAUDE.md in the repo). Students see the mark, feedback and XP straight away.</p><div id="mqb"><p class="muted">Loading answers…</p></div>`;
  const flags=a=>{const f=a.fl||{};return [f.paste?'paste blocked ×'+f.paste:'',f.big?'big insert ×'+f.big:'',f.fast?'too fast':''].filter(Boolean).join(' · ')};
  const draw=force=>{const el=$('#mqb');if(!el||!US||!RV)return;const ae=document.activeElement;if(!force&&ae&&el.contains(ae)&&/TEXTAREA|INPUT|SELECT/.test(ae.tagName))return;
    const all=[];US.forEach(x=>{if(x.id===LECTURER||!x.u||!x.u.ans)return;Object.entries(x.u.ans).forEach(([k,a])=>{if(a&&a.q)all.push({sid:x.id,name:x.name||'',k,a,r:(RV[x.id]||{})[k]})})});
    all.sort((p,q)=>String(p.a.at)<String(q.a.at)?1:-1);const pend=all.filter(x=>!x.r),done=all.filter(x=>x.r),list=(tab==='q'?pend:done).slice(0,40);
    const item=x=>{const e=I[x.a.q],qt=e?e.q.q:x.a.q,d=drafts[x.k]||{band:x.r?x.r.band:x.a.b|0,xp:x.r?x.r.xp:Math.min(30,(x.a.b|0)*4),fb:x.r?x.r.fb:''},fl=flags(x.a);
      return `<div class="mqi" data-k="${esc(x.k)}"><div class="row" style="justify-content:space-between"><b>${esc(x.name||x.sid)}</b><span class="muted" style="font-size:.8rem">${esc(x.sid)} · ${esc(String(x.a.at||'').slice(0,16).replace('T',' '))}</span></div>
      <div class="muted" style="font-size:.85rem">${esc(e?e.label:x.a.q)}: ${esc(qt.slice(0,150))}${qt.length>150?'…':''}</div>
      <div style="font-size:.85rem;margin:4px 0">Automatic ${x.a.b|0}/6 · ${x.a.w|0} words${fl?` · <span style="color:var(--gold)">⚠️ ${esc(fl)}</span>`:''}${x.r?` · <b>marked ${x.r.band}/6, +${x.r.xp} XP</b> <span class="muted">(${x.r.by==='lecturer'?'you':'Claude'})</span>`:''}</div>
      ${open===x.k?`<div class="answerprev">${esc(x.a.t||'').replace(/\n/g,'<br>')}</div>
      <div class="row" style="margin-top:8px"><label class="inl">Band <select data-f="band">${[0,1,2,3,4,5,6].map(b=>`<option value="${b}" ${b===d.band?'selected':''}>${b}</option>`).join('')}</select></label><label class="inl">XP <input type="number" min="0" max="30" data-f="xp" value="${d.xp}"></label></div>
      <textarea data-f="fb" maxlength="600" style="min-height:80px;margin-top:8px" placeholder="Feedback: one strength, the most important missing point, one tip">${esc(d.fb||'')}</textarea>
      <div class="row" style="margin-top:8px"><button class="btn sm" data-save>Save mark</button><button class="btn ghost sm" data-close>Close</button></div><div class="err" data-er></div>`
      :`<button class="btn ghost sm" data-open style="margin-top:4px">${x.r?'Edit mark':'Read and mark'}</button>`}</div>`};
    el.innerHTML=`<div class="subnav"><button data-t="q" class="${tab==='q'?'on':''}">⏳ To mark (${pend.length})</button><button data-t="d" class="${tab==='d'?'on':''}">✅ Marked (${done.length})</button></div>
    ${list.map(item).join('')||`<p class="muted">${tab==='q'?'Nothing waiting. New typed answers appear here.':'No marks yet.'}</p>`}${(tab==='q'?pend:done).length>40?'<p class="muted" style="font-size:.85rem">Showing the newest 40.</p>':''}`;
    el.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tab=b.dataset.t;open=null;draw(1)});
    el.querySelectorAll('.mqi').forEach(box=>{const k=box.dataset.k,x=all.find(y=>y.k===k);
      box.querySelector('[data-open]')&&(box.querySelector('[data-open]').onclick=()=>{open=k;draw(1)});
      box.querySelector('[data-close]')&&(box.querySelector('[data-close]').onclick=()=>{open=null;delete drafts[k];draw(1)});
      box.querySelectorAll('[data-f]').forEach(f=>f.oninput=f.onchange=()=>{const d=drafts[k]||(drafts[k]={band:x.r?x.r.band:x.a.b|0,xp:x.r?x.r.xp:Math.min(30,(x.a.b|0)*4),fb:x.r?x.r.fb:''});
        d[f.dataset.f]=f.dataset.f==='fb'?f.value:+f.value;if(f.dataset.f==='band'&&!x.r&&!d.xpSet){d.xp=Math.min(30,d.band*4);box.querySelector('[data-f="xp"]').value=d.xp}if(f.dataset.f==='xp')d.xpSet=1});
      box.querySelector('[data-save]')&&(box.querySelector('[data-save]').onclick=async()=>{const g=n=>box.querySelector(`[data-f="${n}"]`);
        const v={q:x.a.q,band:Math.max(0,Math.min(6,+g('band').value|0)),xp:Math.max(0,Math.min(30,+g('xp').value|0)),fb:g('fb').value.trim().slice(0,600),at:new Date().toISOString(),by:'lecturer'};
        const b=box.querySelector('[data-save]');b.disabled=true;b.textContent='Saving…';
        try{await CLOUD.saveReview(x.sid,k,v);delete drafts[k];open=null;toast('✅','Mark saved',(x.name||x.sid)+': '+v.band+'/6, +'+v.xp+' XP');draw(1)}
        catch(e){b.disabled=false;b.textContent='Save mark';box.querySelector('[data-er]').textContent=CLOUD.say(e)}})})};
  const err=e=>{const el=$('#mqb');if(el)el.innerHTML=`<p class="err">${esc(CLOUD.say(e))}</p>`};
  CLOUD.watchUsers(l=>{US=l;draw()},err);CLOUD.watchReviews(r=>{RV=r;draw()},err)}
function lecturer(){
  if(ME.sid!==LECTURER)return home();
  shell('#/lecturer',`<h1>Lecturer</h1>
  ${cloudOn()?'<div class="card" id="cdash" style="margin-bottom:22px"></div><div class="card" id="mq" style="margin-bottom:22px"></div>':'<div class="callout" style="margin-bottom:18px">Sign in with your PIN to see the live class dashboard. In device-only mode, use the score-code tools at the bottom of this page.</div>'}
  <div class="card" id="demo" style="margin-bottom:22px"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Show the class</h2><button class="btn ghost sm" id="fs">⛶ Full screen</button></div>
  <p class="muted" style="font-size:.9rem;margin:6px 0 12px">Example students only, made up to explain how scoring works. Real scores appear on the Leaderboard tab.</p>
  <div class="subnav"><button data-dm="board" class="on">🏆 Example leaderboard</button><button data-dm="vs">⚔️ Student 1 vs Student 2</button><button data-dm="tips">💡 How to climb</button></div><div id="dm"></div></div>
  <h2>Content review</h2><div class="card" id="rvw" style="margin-bottom:22px"></div>
  <details class="card"${cloudOn()?'':' open'}><summary class="lex" style="cursor:pointer;font-weight:700">Offline fallback: update the leaderboard from score codes</summary><p class="muted" style="font-size:.88rem">Only needed if the live leaderboard is unavailable.</p><ol style="padding-left:1.2em;margin-top:0"><li>Paste all the score emails or codes below (everything at once is fine).</li><li>Check the preview, then <b>Download leaderboard.js</b>.</li><li>On GitHub, open the <b>mkt101-cases</b> repo → <b>Add file → Upload files</b> → drop in <code>leaderboard.js</code> → <b>Commit changes</b>.</li></ol>
  <textarea id="tx" placeholder="Paste score emails or codes here"></textarea><div class="row" style="margin-top:12px"><button class="btn" id="go">Read codes</button></div><div id="out" style="margin-top:16px"></div></details>`);
  if(cloudOn()){classDash();markQueue()}
  demo();$('#rvw').innerHTML=reviewHTML();$('#rvw').querySelectorAll('[data-rv]').forEach(b=>b.onchange=()=>{const r=LS.get('review',{});r[b.dataset.rv]=b.checked;LS.set('review',r)});
  $('#go').onclick=async()=>{const found=$('#tx').value.match(/MKT101-[A-Za-z0-9_-]+-[0-9a-f]{8}/g)||[];const best={};let bad=0,off=0;
    for(const code of found){const m=code.match(/^MKT101-(.+)-([0-9a-f]{8})$/);if((await sha('mkt101-score|'+m[1])).slice(0,8)!==m[2]){bad++;continue}
      let p;try{p=JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g,'+').replace(/_/g,'/')))))}catch(e){bad++;continue}
      if(!ROSTER.hashes.includes(await sha(ROSTER.salt+'|'+p.s))||p.s===LECTURER){off++;continue}
      const o=best[p.s];if(!o||p.d>o.d||(p.d===o.d&&p.x>o.x))best[p.s]=p}
    const rows=[];for(const p of Object.values(best))rows.push({k:await rowKey(p.s),n:String(p.n||'').slice(0,24),x:+p.x||0,l:+p.l||0,b:+p.b||0});
    const prev=(LEADERBOARD.rows||[]).filter(r=>!rows.some(x=>x.k===r.k));const all=prev.concat(rows).sort((a,b)=>b.x-a.x);
    const file='/* Weekly leaderboard. Made on the lecturer page from students\' score codes, then uploaded here.\n   k = scrambled student ID (no readable IDs), n = nickname, x = XP, l = level, b = badges. */\nconst LEADERBOARD='+JSON.stringify({updated:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),rows:all})+';\n';
    $('#out').innerHTML=`<p><b>${rows.length}</b> students read from ${found.length} codes${bad?` · ${bad} damaged codes skipped`:''}${off?` · ${off} not on the class list skipped`:''}. Students not in this batch keep their last score.</p>
    <div class="tablewrap"><table><tr><th>#</th><th>Name</th><th>XP</th><th>Badges</th></tr>${all.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.n||'Hidden player')}</td><td>${r.x}</td><td>${r.b}</td></tr>`).join('')}</table></div>
    <button class="btn gold" id="dl" style="margin-top:12px">⬇ Download leaderboard.js</button>`;
    $('#dl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([file],{type:'text/javascript'}));a.download='leaderboard.js';a.click()}}}

/* ---------- router ---------- */
function route(){CLOUD.unwatch();clearInterval(MQT);document.onkeydown=null;delete document.body.dataset.case;if(!ME)return gate();const h=location.hash.replace(/^#\/?/,'').split('/');
  if(h[0]==='case')return caseView(h[1],h[2]||'read',parseInt(h[3],10)||1);
  if(h[0]==='mcq'){if(h[1]==='t'){const t=+h[2];if(U.mq&&U.mq.done)U.mq=null;U.mtopic=TOPICS.includes(t)?t:0;save();return mcqPage(U.mtopic)}return mcqPage()}
  if(h[0]==='short')return shortPage(h[1]==='t'?+h[2]:0);
  if(h[0]==='long')return h[1]?longView(h[1]):longPage();
  if(h[0]==='notes')return notesPage(h[1]);
  ({'':home,cases:caseList,badges:badgesPage,board:boardPage,lecturer:lecturer}[h[0]]||home)()}
/* ---------- cloud sync ---------- */
const SYNC={synced:['ok','☁️ Saved to your account'],saving:['','⏳ Saving…'],syncing:['','⏳ Syncing…'],offline:['bad','📴 Offline: saves when you reconnect'],error:['bad','⚠️ Couldn\'t save, will retry'],off:['','']};
const syncChip=()=>{const v=SYNC[CLOUD.state]||SYNC.off;return v[1]?`<span class="sync ${v[0]}" id="sync">${v[1]}</span>`:''};
CLOUD.onStatus(()=>{const e=$('#sync');if(e)e.outerHTML=syncChip()});
const rowOf=sid=>sid===LECTURER?null:{n:U.hide?'':String(U.nick||'').slice(0,24),x:U.xp,l:level(U.xp).i,b:Object.keys(U.badges).length,s:streak(U)};
async function cloudSync(){const sid=ME.sid;
  if(!CLOUD.ok){toast('📴','Saving on this device only','Your account could not be reached. Sign in again when you are online.');return}
  const u=await CLOUD.current();if(!ME||ME.sid!==sid)return;
  if(!u||!CLOUD.mine(sid)){LS.del('session');ME=null;U=null;hud();gate('Please sign in again with your PIN.');return}
  let r;try{r=await CLOUD.pull(sid)}catch(e){if(!ME||ME.sid!==sid)return;console.warn('Pull failed',e);addEventListener('online',()=>ME&&ME.sid===sid&&cloudSync(),{once:true});
    toast('📴','Offline for now','Your progress is saved on this device and will sync when you reconnect.');return}
  if(!ME||ME.sid!==sid)return;const R=r&&r.u;
  if(R&&(R._t||0)>LOAD_T){U=Object.assign(blank(),R);U.n=Object.assign(blank().n,U.n);LS.set('u_'+sid,U);hud();route();toast('☁️','Progress loaded',U.xp+' XP from your account')}
  CLOUD.ready(sid,()=>ME&&ME.sid===sid?{sid,name:ME.name,U,row:rowOf(sid)}:null);CLOUD.flush();
  if(sid!==LECTURER)CLOUD.watchMine(sid,m=>{if(ME&&ME.sid===sid)applyMarks(m)})}
/* a new or changed mark: award its XP once (and adjust if the lecturer changes it later). Restart doesn't remove it. */
function applyMarks(m){U.rev=U.rev||{};U.gain=U.gain||{};let n=0,ch=0;
  for(const [key,v] of Object.entries(m||{})){if(!v||typeof v!=='object')continue;
    const r={q:String(v.q||''),band:Math.max(0,Math.min(6,v.band|0)),xp:Math.max(0,Math.min(30,v.xp|0)),fb:String(v.fb||'').slice(0,600),at:String(v.at||''),by:v.by==='lecturer'?'lecturer':'claude'},k='review:'+key;
    const old=U.rev[key];U.rev[key]=r;
    if(!U.log[k]){countOnce(k,'reviewed');award(k,r.xp,'Marked by your lecturer');n++}
    else if((U.gain[k]|0)!==r.xp){U.xp=Math.max(0,U.xp+r.xp-(U.gain[k]|0));U.gain[k]=r.xp;ch++}
    else if(old&&(old.band!==r.band||old.fb!==r.fb))ch++}
  if(n||ch){save();hud();if(n)toast('🧑‍🏫',n===1?'An answer was marked':n+' answers were marked','Open the question to read the feedback');else toast('🧑‍🏫','A mark was updated','Open the question to see it');
    const ae=document.activeElement;if(!(ae&&ae.tagName==='TEXTAREA'))route()}}
/* email links: Firebase sends students here (Templates → Customize action URL) */
const ACT=(()=>{const q=new URLSearchParams(location.search);return q.get('oobCode')&&q.get('mode')?{mode:q.get('mode'),code:q.get('oobCode')}:null})();
function clearAct(){const q=new URLSearchParams(location.search);['mode','oobCode','apiKey','lang','continueUrl'].forEach(k=>q.delete(k));
  history.replaceState(null,'',location.pathname+(q.toString()?'?'+q:'')+location.hash)}
function signInWith(sid,msg){clearAct();gate();if(msg)$('#f').insertAdjacentHTML('beforebegin',`<div class="fb ok" id="gmsg" style="margin-bottom:10px">${esc(msg)}</div>`);const d=String(sid||'').replace(/^S/i,'');if(/^0\d{5}$/.test(d)){$('#sid').value=d;$('#sid').dispatchEvent(new Event('input'))}}
async function actionPage(a){
  const box=h=>{app.innerHTML=`<div class="gate"><div class="card signcard" id="act">${h}</div></div>`};
  const fail=e=>box(`<div style="font-size:2.4rem">⚠️</div><h2>That link didn't work</h2><p class="muted">${esc(CLOUD.say(e))}</p><button class="btn" id="ab">Go to sign in</button>`)||($('#ab').onclick=()=>signInWith(''));
  if(!CLOUD.ok)return box(`<h2>Can't open this link right now</h2><p class="muted">Check your internet connection and open the link again.</p>`);
  box('<p class="muted">Checking your link…</p>');
  if(a.mode==='resetPassword'){let email;try{email=await CLOUD.verifyReset(a.code)}catch(e){return fail(e)}
    const sid=email.split('@')[0].toUpperCase();
    box(`<div style="font-size:2.4rem">🔐</div><h2 style="margin-top:6px">Choose a new PIN</h2><p class="muted" style="font-size:.88rem;margin:0 0 6px">${esc(sid)} · ${esc(email)}</p>
    <form id="rf" novalidate><input type="text" autocomplete="username" value="${esc(email)}" hidden>
    <label for="np">New 6-digit PIN</label><input type="password" id="np" inputmode="numeric" maxlength="6" autocomplete="new-password" class="pinbox">
    <label for="np2">Type it again</label><input type="password" id="np2" inputmode="numeric" maxlength="6" autocomplete="new-password" class="pinbox">
    <p class="hint">Pick something you will remember but others can't guess. Not 123456 or your birthday.</p>
    <div class="err" id="rer"></div><button class="btn" id="rgo">Save my new PIN</button></form>`);
    $('#np').focus();
    $('#rf').onsubmit=async e=>{e.preventDefault();const p=$('#np').value.trim(),er=t=>{$('#rer').textContent=t};
      if(!/^\d{6}$/.test(p))return er('Your PIN must be exactly 6 digits.');if(p!==$('#np2').value.trim())return er("The two PINs don't match.");
      if(/^(\d)\1{5}$|^(123456|654321|012345)$/.test(p))return er('That PIN is too easy to guess. Choose another.');
      $('#rgo').disabled=true;$('#rgo').textContent='Saving…';
      try{await CLOUD.confirmReset(a.code,p);signInWith(sid,'✅ Your PIN has been changed. Sign in with your new PIN.')}
      catch(e){$('#rgo').disabled=false;$('#rgo').textContent='Save my new PIN';er(CLOUD.say(e))}};return}
  if(a.mode==='verifyEmail'||a.mode==='recoverEmail'){try{const info=a.mode==='recoverEmail'?await CLOUD.checkCode(a.code):null;await CLOUD.applyCode(a.code);
      box(`<div style="font-size:2.4rem">✅</div><h2>${a.mode==='verifyEmail'?'Email confirmed':'Email restored'}</h2><p class="muted">${a.mode==='verifyEmail'?'Thanks, your student email is confirmed.':'Your account email has been changed back'+(info&&info.data&&info.data.email?' to '+esc(info.data.email):'')+'. If you did not ask for a change, reset your PIN to be safe.'}</p><button class="btn" id="ab">Go to sign in</button>`);
      $('#ab').onclick=()=>signInWith('')}catch(e){fail(e)}return}
  box(`<h2>Unknown link</h2><p class="muted">This link isn't one the MKT101 Arena understands.</p><button class="btn" id="ab">Go to sign in</button>`);$('#ab').onclick=()=>signInWith('')}
function start(){if(ACT&&!start.done){start.done=1;return actionPage(ACT)}migrateSession();ME=me();if(!ME)return gate();load();migrateProgress();if(!U.badges.boarding){checkBadges();save()}hud();route();if(ME.cloud)cloudSync();if(!U.tour)setTimeout(()=>{if(ME&&!U.tour&&!document.querySelector('.modal'))tour(0)},700)}
/* upgrade from the original MKT101 practice site: keep the signed-in student and their activity work (never wipe) */
function migrateSession(){if(LS.get('session',null))return;try{const r=JSON.parse(localStorage.getItem('mkt101-student')||sessionStorage.getItem('mkt101-student')||'null');
  if(r&&/^S0\d{5}$/.test(r.sid||'')&&r.name)LS.set('session',{sid:r.sid,name:r.name})}catch(e){}}
function migrateProgress(){if(U.migrated)return;U.migrated=1;const st=LS.get('st',null),dm=LS.get('done',null);let n=0;
  if(st&&typeof st==='object'){U.act=U.act||{};for(const k in st)if(!U.act[k]){U.act[k]=st[k];n++}}
  if(dm&&typeof dm==='object')for(const k in dm){const m=k.match(/^(sto|soneva)-(\d+)$/);if(dm[k]&&m){const key='actdone:'+m[1]+':'+m[2];if(award(key,15,'Activity done',1)){countOnce(key,'acts');n++}}}
  save();if(n)setTimeout(()=>toast('📦','Progress carried over','Your work from the old MKT101 practice site is here.'),900)}
addEventListener('hashchange',route);start();
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js',{scope:'./'}).catch(()=>{}));
