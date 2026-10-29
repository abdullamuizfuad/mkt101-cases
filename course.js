/* MKT101 course: content, pages and hooks that only this course has. The shared engine is in engine/. */
const LEVELS=[[0,'Intern'],[150,'Marketing Officer'],[400,'Marketing Executive'],[750,'Senior Marketing Executive'],[1200,'Marketing Manager'],[1800,'Marketing Director'],[2600,'Cluster Director'],[3600,'Chief Marketing Officer (CMO)'],[5000,'Marketing Consultant']];
const LVL_ICO=['🎫','🧑‍💼','📋','📈','🧭','🏢','🌐','👑','💎'];
const TOPIC_ICO={8:'🧪',9:'🏷️',10:'🚚',11:'🛒',12:'📣',13:'🤝',14:'🌱'},TOPIC_BADGE={8:'New Product Pro',9:'Pricing Pro',10:'Channel Pro',11:'Retail Pro',12:'Promotion Pro',13:'Sales Pro',14:'Sustainability Pro'};
const TOPICS=Object.keys(TERM.topics).map(Number);
const tName=t=>'Topic '+t+' · '+TERM.topics[t];
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
 {id:'mission10',ico:'🏅',name:'Mission Master',d:'Complete 10 daily missions',t:u=>u.n.missions>=10},
 ...PRES_BADGES];
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
 {id:'timed3',t:2,k:'timed',n:3,x:'Finish 3 timed answers on paper'},{id:'long1',t:2,k:'longs',n:1,x:'Write 1 long answer on paper, timed'},
 ...PRES_MISSIONS];
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
const NAV=[['#/','Home'],['#/mcq','Section A · MCQ'],['#/short','Section B · Written answers'],['#/cases','Section C · Cases'],['#/notes','Study notes'],['#/badges','Badges'],['#/board','Leaderboard']];
const XP_DEFAULT={typed:20,plan:15,perfect:10,timed:30,check:0,ltimed:40,lmark:0};
function presWhere(){const h=location.hash.replace(/^#\/?/,'').split('/'),m=((document.querySelector('main')||{}).textContent||'').match(/Question (\d+) of \d+/),q=m?' · Q'+m[1]:'';
  if(h[0]==='mcq'){const S=U&&U.mq;return S&&!S.done&&S.i<S.ids.length?'Section A · Q'+(S.i+1):'Section A · MCQ'}
  if(h[0]==='short')return 'Section B · Short answers'+q;
  if(h[0]==='long')return 'Section B · Long answers';
  if(h[0]==='notes')return 'Notes'+(h[1]?' · Topic '+h[1]:'');
  if(h[0]==='case'){const c=CASEL.find(x=>x.id===h[1]);return (c?c.short:'Case')+' · '+({read:'Read',board:'Boardroom',acts:'Activities',practice:'Practice',exhibits:'Exhibits',terms:'Terms'}[h[2]||'read']||'Read')+(h[2]==='practice'?q:'')}
  const lect=typeof ME!=='undefined'&&ME&&ME.sid===LECTURER;return ({'':'Home',cases:'Cases',badges:'Badges',board:'Leaderboard'}[h[0]])||(lect&&['lecturer','live','session','student'].includes(h[0])?'Lecturer':'Home')}
function presBusy(){const S=U&&U.mq;return /^#\/mcq/.test(location.hash)&&!!S&&!S.done&&S.i<S.ids.length&&S.ans&&S.ans[S.ids[S.i]]===undefined}
const TOUR=[['⚡','Quick-fire MCQs','Section A gives you one question at a time with the reason straight away. Correct answers earn XP; fast <b>and</b> accurate sets earn a speed bonus. Answers given before you could read the question earn nothing.'],['🧩','Plan with chips','Every question starts with a plan. Tap the ideas you would use, then check your plan. Some chips are decoys, and the feedback explains why.'],
 ['🏁','Finish your way','After planning, choose: <b>📝 Plan only</b> to move on, <b>✍️ Write on paper</b> against the clock, or <b>⌨️ Type my answer</b> (or speak it with 🎤) for an automatic check of the key ideas. Your lecturer may mark typed answers too.'],
 ['✨','XP, missions and badges','Earn XP for answering, reading, planning and writing. Three daily missions change every day and get tougher as you level up. <b>⏱️ Screen time</b> counts your active minutes: 20 a day meets your daily goal. In class, tap <b>Join</b> when your lecturer starts a live session.'],
 ['💾','Keep your progress safe','Your progress lives on this device. Tap <b>💾 Save</b> in the top bar to email a copy to your lecturer or download it.']];
function topicGrid(u){return `<div class="tcells">${TOPICS.map(t=>{const m=mastery(u,t),ok=mastered(u,t);
  return `<a class="tcell ${ok?'got':''}" href="#/notes/${t}"><b>${TOPIC_ICO[t]} Topic ${t}${ok?' ✓':''}</b><span>${esc(TERM.topics[t])}</span>
  <div class="tmarks"><i class="${m.notes?'on':''}" title="Notes studied">📖</i><i class="${m.mcq?'on':''}" title="80%+ on 15 MCQs">🎯 ${m.att?m.acc+'%':'–'}</i><i class="${m.wrote?'on':''}" title="Written answer">✍️</i></div></a>`}).join('')}</div>`}
CRS.missionGo={read:'#/cases',verdicts:'#/cases',verdictsRight:'#/cases',plans:'#/short',timed:'#/short',perfect:'#/short',typed:'#/short',mcq:'#/mcq',mcqRight:'#/mcq',mset20:'#/mcq',mset80:'#/mcq',notes:'#/notes',acts:'#/cases',longs:'#/long',stgoal:'#/mcq'};
/* the four big practice tiles on home and on #/practice (engine/simple.js) */
function homeTiles(){const live=U&&U.mq&&!U.mq.done&&U.mq.i<U.mq.ids.length;
  return [['🎯','Section A · MCQ',live?'Resume: question '+(U.mq.i+1)+' of '+U.mq.ids.length:BANK.mcq.length+' questions, with a speed bonus','#/mcq'],['🧩','Section B · Written answers',BANK_S.length+' short · '+BANK.essays.length+' long','#/short'],
    ['🏝️','Section C · Cases',CASEL.map(c=>c.short).join(' · '),'#/cases'],['📖','Study notes','Topics 8–14: ideas, terms, checks','#/notes']]}
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
  shell('#/short',`<p><a href="#/long">← Long answers</a></p><div class="card qcard" id="lq"><div class="qmeta"><span class="tag">${TOPIC_ICO[e.t]} Topic ${e.t}</span><span class="tag">${max} marks</span><span class="tag">About ${LMINS} min</span><button class="btn ghost sm rst" data-a="restart">↺ Restart</button>${notesBtn(e,{})}${rptBtn(e.id,'Long answer (Topic '+e.t+')')}</div>
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
function qCard(q,i,o={}){
  const secs=o.secs||600,mins=Math.round(secs/60),re=()=>qCard(q,i,o);
  const el=$('#q-'+q.id),st=U.plansSaved[q.id]||(U.plansSaved[q.id]={step:0,sel:[],checked:false,ticks:[]});
  if(!st.order)st.order=shuffle(q.chips.map((_,j)=>j));
  if(!st.route&&st.step>0)st.route='paper';if(st.final)st.done=true;
  const good=q.chips.map((c,j)=>c.g?j:-1).filter(j=>j>=0),planHTML=`<div class="plan"><b class="lex" style="font-size:.85rem">Your plan</b><ol>${st.sel.filter(j=>q.chips[j].g).map(j=>`<li>${esc(q.chips[j].t)}</li>`).join('')||'<li class="muted">No key ideas picked</li>'}</ol></div>`;
  const steps=st.route==='typed'?['1 · Plan','2 · Type','3 · Mark']:st.route==='plan'?['1 · Plan','✓ Plan only']:['1 · Plan','2 · Write','3 · Check'];
  const nextBtn=`<div class="row" style="margin-top:12px"><button class="btn" data-a="next">${o.last?'See set summary 🏁':'Next question →'}</button></div>`;
  let h=`<div class="qmeta"><span class="tag">Question ${i+1}</span><span class="tag">${esc(q.skill||q.topic)}</span>${q.t?`<span class="tag">${TOPIC_ICO[q.t]||''} Topic ${q.t}</span>`:''}<span class="tag">${q.marks||6} marks</span><button class="btn ghost sm rst" data-a="restart" title="Restart this question">↺ Restart</button>${notesBtn(q,o)}${rptBtn(q.id,(qIndex()[q.id]||{}).label||q.skill||q.topic)}</div>
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
    else h+=`${typeof hintHTML==='function'&&st.sel?hintHTML(q,st):''}<div class="row" style="margin-top:14px"><button class="btn" data-a="check" ${st.sel.length?'':'disabled'}>Check my plan</button><span class="muted" style="font-size:.85rem">${st.sel.length} selected</span></div>`}
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
    <div class="flagnote" id="fn-${q.id}">${st.fl&&st.fl.paste?'⚠️ Paste blocked. Type or speak your own answer.':st.fl&&st.fl.bigKept?'ℹ️ A large insert was kept and noted for your lecturer.':''}</div>
    <p class="muted" style="font-size:.8rem;margin:4px 0 0">Pasting is turned off. Typing and speaking are welcome: use 🎤 Speak or your keyboard's voice typing. Large inserts are kept but recorded for your lecturer.</p>
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
    const sp=Math.min(st.dw||0,w);st.fast=(st.act||0)/1000<(w-sp)*TYPE_SPW+sp*SPEAK_SPW;st.chk=CONCEPT.checkAnswer(q,st.txt,namesFor(q,o));clearInterval(TIMERS['sw'+q.id]);st.step=2;save();re()});
  on('tedit',()=>{st.step=1;st.chk=null;save();re()});
  el.querySelectorAll(`[name="bd-${q.id}"]`).forEach(b=>b.onchange=()=>{st.band=+b.value;save();re()});
  A('tfin')&&(A('tfin').onclick=()=>{const C=st.chk||CONCEPT.checkAnswer(q,st.txt||'',namesFor(q,o)),why=typedNoXP(st,C);st.done=true;st.xpGot=why?0:C.xp;if(!why)fin();else{U.fin=U.fin||{};U.fin[q.id]=1}
    if(st.fast){U.integ=U.integ||{};U.integ.fast=(U.integ.fast||0)+1}
    st.ak=submitAnswer(q,o,st,C);
    if(!why){countOnce('typed:'+q.id+':'+today(),'typed',o.week&&'btyped');award('typed:'+q.id+':'+today(),C.xp,'Typed answer checked')}
    weakMark(q,o,(C.band<=2?2:C.band<=4?1:0)+(C.found.length<C.need/2?1:0));save();re()})}
const MCQ_BY=Object.fromEntries(BANK.mcq.map(q=>[q.id,q]));
const minRead=q=>Math.max(3,Math.round((q.q.length+q.o.join('').length)/30));
const MQ_SIZES=[10,20,30];
function selTopics(){let a=Array.isArray(U.mtopics)?U.mtopics.filter(t=>TOPICS.includes(t)):(U.mtopic&&TOPICS.includes(U.mtopic)?[U.mtopic]:[]);return a.length?a.sort((x,y)=>x-y):TOPICS.slice()}
const tpLabel=a=>!a||a.length>=TOPICS.length?'All topics (8–14)':a.length===1?tName(a[0]):'Topics '+a.slice().sort((x,y)=>x-y).join(', ');
const mqTps=S=>S.tps||(S.topic?[S.topic]:TOPICS.slice());
function drawMcq(topic,size){const arr=Array.isArray(topic)?topic:topic?[topic]:TOPICS,one=arr.length===1?arr[0]:0;topic=one;const prev=new Set(U.mlast||[]),seen=U.mday&&U.mday.d===today()?U.mday.ids:{},pool=BANK.mcq.filter(q=>arr.includes(q.t));
  /* questions not seen today first, then ones seen today but not in the last set, then the last set */
  const rank=q=>prev.has(q.id)?2:seen[q.id]?1:0,pick=list=>[0,1,2].flatMap(r=>shuffle(list.filter(q=>rank(q)===r)));
  let ids;if(topic)ids=pick(pool).slice(0,size).map(q=>q.id);
  else{const by=arr.map(t=>pick(pool.filter(q=>q.t===t)));ids=[];let k=0;while(ids.length<size&&by.some(l=>l.length)){const l=by[k++%by.length];if(l.length)ids.push(l.shift().id)}ids=shuffle(ids)}
  return ids}
function startMcq(ids,o){U.mq={sid:Date.now().toString(36),ids,ord:Object.fromEntries(ids.map(id=>[id,shuffle([0,1,2,3])])),ans:{},tm:{},fr:{},rs:{},i:0,topic:o.topics&&o.topics.length===1?o.topics[0]:(o.topic||0),tps:o.topics||(o.topic?[o.topic]:TOPICS.slice()),retry:!!o.retry,start:Date.now(),shown:Date.now()};
  if(!o.retry)U.mlast=ids.slice();save()}
function mcqPage(topic){
  rollDay();if(!U.mday||U.mday.d!==today())U.mday={d:today(),ids:{}};
  const S=U.mq;if(S&&S.i<S.ids.length)return mcqPlay();if(S&&S.done)return mcqSummary();
  const sel=selTopics(),all=sel.length===TOPICS.length,size=U.msize||30,h=(U.mh||[]).slice(-5).reverse();
  shell('#/mcq',`<h1>Section A · Multiple choice</h1><p class="muted">One question at a time with instant feedback and a reason. Answer correctly and quickly for speed points, but read each question properly: answers given too fast earn nothing.</p>
  <div class="grid g2"><div class="card"><h2>Start a set</h2>
   <label style="margin-top:0" id="mtl">Topics</label><div class="tpicks" role="group" aria-labelledby="mtl"><label class="tpk tpall"><input type="checkbox" id="mtall" ${all?'checked':''}><span><b>All topics</b> 8–14, mixed</span></label>${TOPICS.map(t=>`<label class="tpk"><input type="checkbox" data-tp="${t}" ${sel.includes(t)?'checked':''}><span><b>${TOPIC_ICO[t]} Topic ${t}</b> ${esc(TERM.topics[t])}</span></label>`).join('')}</div><p class="tphint" id="mthint" aria-live="polite"></p>
   <label>Questions</label><div class="seg" role="radiogroup" aria-label="Number of questions">${MQ_SIZES.map(n=>`<button type="button" role="radio" aria-checked="${n===size}" data-n="${n}" class="${n===size?'on':''}">${n}</button>`).join('')}</div>
   <button class="btn" id="mgo" style="width:100%;margin-top:16px">▶ Start</button>
   <p class="muted" style="font-size:.82rem;margin:10px 0 0">Each new set avoids the questions from your last set where it can.</p></div>
  <div class="card"><h2>How XP works here</h2><ul class="sumlist" style="font-size:.92rem">
   <li><b>+2 XP</b> for each correct answer (each question counts once a day).</li>
   <li><b>Speed points</b> for correct answers: ⚡3 within 15 s, 2 within 30 s, 1 after that.</li>
   <li><b>Speed bonus</b> at the end: the faster and more accurate you are, the bigger it gets. Below about 60% accuracy there is no bonus.</li>
   <li>Answer before you have had time to read the question and it earns nothing.</li>
   <li><b>Finish bonus</b> for completing 10, 20 or 30 questions.</li></ul></div></div>
  ${h.length?`<h2 style="margin-top:22px">Recent sets</h2><div class="card"><div class="tablewrap"><table><tr><th>Date</th><th>Topics</th><th>Score</th><th>Accuracy</th><th>Time</th><th>XP</th></tr>${h.map(r=>`<tr><td>${esc(r.d)}</td><td>${r.tp?esc(tpLabel(r.tp)):r.topic?'Topic '+r.topic:'Mixed'}${r.retry?' · retry':''}</td><td>${r.c}/${r.n}</td><td>${r.acc}%</td><td>${fmtT(r.s)}</td><td>+${r.x}</td></tr>`).join('')}</table></div></div>`:''}
  <h2 style="margin-top:22px">Your accuracy by topic</h2><div class="tcells">${TOPICS.map(t=>{const m=mastery(U,t);return `<a class="tcell" href="#/mcq/t/${t}"><b>${TOPIC_ICO[t]} Topic ${t}</b><span>${esc(TERM.topics[t])}</span><div class="bar"><i style="width:${m.acc}%;background:${m.acc>=80?'var(--green)':'var(--gold)'}"></i></div><small>${m.att?m.acc+'% of '+m.att+' answered':'Not tried yet'}</small></a>`}).join('')}</div>`);
  document.querySelectorAll('.seg [data-n]').forEach(b=>b.onclick=()=>{U.msize=+b.dataset.n;save();document.querySelectorAll('.seg [data-n]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-checked',x===b)})});
  const boxes=[...document.querySelectorAll('[data-tp]')],hint=$('#mthint'),keep=()=>{const a=boxes.filter(b=>b.checked).map(b=>+b.dataset.tp);U.mtopics=a;U.mtopic=a.length===1?a[0]:0;$('#mtall').checked=a.length===TOPICS.length;save()};
  boxes.forEach(b=>b.onchange=()=>{if(!boxes.some(x=>x.checked)){b.checked=true;hint.textContent='Keep at least one topic ticked.'}else hint.textContent='';keep()});
  $('#mtall').onchange=e=>{if(e.target.checked){boxes.forEach(b=>b.checked=true);hint.textContent=''}else{e.target.checked=true;hint.textContent='Untick the topics you want to leave out.'}keep()};
  $('#mgo').onclick=()=>{const a=selTopics(),n=U.msize||30;startMcq(drawMcq(a,n),{topics:a});mcqPlay()}}
const fmtT=s=>{s=Math.round(s||0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
let MQT=null;
function mcqPlay(){const S=U.mq,id=S.ids[S.i],q=MCQ_BY[id];if(!q){S.i++;save();return S.i<S.ids.length?mcqPlay():mcqFinish()}
  const a=S.ans[id],done=a!==undefined,ord=S.ord[id],good=0;if(!done){S.shown=Date.now();save()}
  const right=S.ids.filter(x=>S.ans[x]===0).length,answered=Object.keys(S.ans).length;
  shell('#/mcq',`<div class="card mcqbox" id="mcq"><div class="row" style="justify-content:space-between"><span><b class="lex">Question ${S.i+1} of ${S.ids.length}</b><br><small class="muted" id="mqtp">${esc(tpLabel(mqTps(S)))}</small></span>
   <span class="row" style="gap:8px"><span class="tag">${TOPIC_ICO[q.t]} Topic ${q.t}</span>${S.retry?'<span class="tag">Retry</span>':''}<span class="qclock" id="qc" aria-label="Time on this question">⏱ 0 s</span></span></div>
   <div class="bar" style="margin:10px 0 14px"><i style="width:${answered/S.ids.length*100}%;background:var(--teal)"></i></div>
   <h2 class="mq" style="font-weight:600">${esc(q.q)}</h2>
   <div class="mopts">${ord.map((oi,k)=>{let cls='';if(done){cls=oi===0?'good':oi===a?'bad':'dim'}return `<button class="mopt ${cls}" data-oi="${oi}" ${done?'disabled':''}><span class="ml">${'ABCD'[k]}</span><span>${esc(q.o[oi])}</span></button>`}).join('')}</div>
   <div id="mfb">${done?mcqFb(S,q):''}</div>
   <div class="row" style="justify-content:space-between;margin-top:14px"><span class="muted" style="font-size:.85rem">✓ ${right} right · ⚡ ${mcqSpeed(S)} speed points</span>
   <span class="row" style="gap:8px">${rptBtn(id,'MCQ (Topic '+q.t+'): '+q.q.slice(0,80))}<button class="btn ghost sm" id="mqq">End set</button>${done?`<button class="btn" id="mnx">${S.i<S.ids.length-1?'Next →':'See results 🏁'}</button>`:''}</span></div></div>`);
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
  if(!ok)srsAdd(id,true);U.mrow=ok?(U.mrow||0)+1:0;if(U.mrow>(U.n.bestRow||0))U.n.bestRow=U.mrow;
  if(fresh){miNote(id,oi);U.mt=U.mt||{};const r=U.mt[q.t]||(U.mt[q.t]=[0,0]);r[0]++;if(ok)r[1]++;countOnce('mcq:'+id+':'+today(),'mcq',ok&&'mcqRight')}
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
  const fin=S.retry||ans.filter(id=>S.fr[id]&&!S.rs[id]).length<10||rushed>n*.3||acc<.5?0:n>=30?15:n>=20?10:n>=10?5:0,bonus=speedBonus+fin;
  S.done=1;S.end=Date.now();S.bonus={speed:speedBonus,fin,f:Math.round(f*100)};
  if(n>=10&&!S.retry){U.n.mcqSets=(U.n.mcqSets||0)+1;if(n>=20)countOnce('mset20:'+S.sid,'mset20');if(n>=20&&acc>=.8)countOnce('mset80:'+S.sid,'mset80')}
  const clean=ans.filter(id=>!S.rs[id]),avg=clean.length?clean.reduce((t,id)=>t+S.tm[id],0)/clean.length:99;
  if(!S.retry&&n>=30&&c===n&&rushed===0)U.n.perfect30=(U.n.perfect30||0)+1;
  if(!S.retry&&n>=20&&acc>=.9&&avg<=15&&rushed<=n*.1)U.n.speedrun=(U.n.speedrun||0)+1;
  if(bonus)award('mqs:'+S.sid,bonus,'MCQ set bonus');else{checkBadges();save()}
  const xp=xpOfSet(S);U.mh=(U.mh||[]).concat({d:today(),topic:S.topic,tp:mqTps(S),retry:S.retry,n,c,acc:Math.round(acc*100),s:secs,x:xp}).slice(-20);save();hud();mcqSummary()}
function xpOfSet(S){U.gain=U.gain||{};const d=new Date(S.start),day=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  return S.ids.reduce((t,id)=>t+(S.ans[id]===0&&!S.rs[id]?(S.fr[id]?(U.gain['mcq:'+id+':'+day]|0):S.retry?(U.gain['mcqr:'+id+':'+day]|0):0):0),0)+(U.gain['mqs:'+S.sid]|0)}
function mcqSummary(){const S=U.mq,ans=S.ids.filter(id=>S.ans[id]!==undefined),n=ans.length,c=ans.filter(id=>S.ans[id]===0).length,acc=n?Math.round(c/n*100):0;
  const secs=ans.reduce((t,id)=>t+(S.tm[id]||0),0),wrong=ans.filter(id=>S.ans[id]!==0),B=S.bonus||{speed:0,fin:0,f:0},rushed=ans.filter(id=>S.rs[id]).length;
  const by={};ans.forEach(id=>{const t=MCQ_BY[id].t,r=by[t]||(by[t]=[0,0]);r[0]++;if(S.ans[id]===0)r[1]++});
  const weakT=Object.keys(by).filter(t=>by[t][1]/by[t][0]<.7).sort((a,b)=>by[a][1]/by[a][0]-by[b][1]/by[b][0]);
  shell('#/mcq',`<div class="card"><div style="font-size:2.4rem">${acc>=90?'🏆':acc>=70?'🎉':'💪'}</div><h1 style="margin:4px 0">${S.retry?'Retry results':'Set results'}</h1><p class="muted" id="mstp" style="margin:0 0 8px">${esc(tpLabel(mqTps(S)))}</p>
  <div class="stats"><div class="stat"><b>${c}/${n}</b><span>correct</span></div><div class="stat"><b>${acc}%</b><span>accuracy</span></div><div class="stat"><b>${fmtT(secs)}</b><span>time</span></div><div class="stat"><b>+${xpOfSet(S)}</b><span>XP from this set</span></div></div>
  ${S.retry?'':`<div class="mres"><span>⚡ ${mcqSpeed(S)} speed points</span><span>Speed bonus <b>+${B.speed}</b>${B.speed?'':rushed>n*.3?' (too many rushed answers)':acc<=60?' (needs more than 60% accuracy)':''}</span><span>Finish bonus <b>+${B.fin}</b></span></div>`}
  ${rushed?`<p class="flagnote">⚠️ ${rushed} answer${rushed===1?' was':'s were'} given before there was time to read the question, so ${rushed===1?'it':'they'} earned no XP.</p>`:''}
  <h3 style="margin-top:16px">Accuracy by topic</h3><div class="tablewrap"><table><tr><th>Topic</th><th>Right</th><th>Accuracy</th></tr>${Object.keys(by).sort((a,b)=>a-b).map(t=>`<tr><td>${esc(tName(t))}</td><td>${by[t][1]}/${by[t][0]}</td><td><b style="color:${by[t][1]/by[t][0]>=.8?'var(--green)':by[t][1]/by[t][0]>=.6?'var(--gold)':'var(--red)'}">${Math.round(by[t][1]/by[t][0]*100)}%</b></td></tr>`).join('')}</table></div>
  ${weakT.length?`<div class="callout" style="margin-top:14px">🎯 <b>Practise next:</b> ${weakT.slice(0,2).map(t=>`<a href="#/notes/${t}">${esc(tName(t))} notes</a>`).join(' · ')}</div>`:''}
  ${wrong.length?`<h3 style="margin-top:16px">Questions to review (${wrong.length})</h3>${wrong.map(id=>{const q=MCQ_BY[id];return `<div class="mqi"><div class="muted" style="font-size:.8rem">Topic ${q.t}</div><b>${esc(q.q)}</b><div style="margin-top:6px;font-size:.92rem">Your answer: <span style="color:var(--red)">${esc(q.o[S.ans[id]])}</span><br>Correct: <span style="color:var(--green)">${esc(q.o[0])}</span></div><div class="muted" style="font-size:.88rem;margin-top:4px">${esc(q.why)}</div></div>`}).join('')}`:'<div class="fb ok" style="margin-top:14px">No mistakes in this set. Excellent.</div>'}
  <div class="row" style="margin-top:16px">${wrong.length?'<button class="btn gold" id="mrt">↺ Retry my mistakes</button>':''}<button class="btn" id="mns">🎲 New set</button><button class="btn ghost" id="mch">Change topic or length</button></div></div>`);
  $('#mrt')&&($('#mrt').onclick=()=>{startMcq(shuffle(wrong),{topics:mqTps(S),retry:1});mcqPlay()});
  $('#mns').onclick=()=>{startMcq(drawMcq(mqTps(S),U.msize||30),{topics:mqTps(S)});mcqPlay()};
  $('#mch').onclick=()=>{U.mq=null;save();mcqPage()}}
function badgesPage(){shell('#/badges',`<h1>Badges</h1><p class="muted">${Object.keys(U.badges).length} of ${BADGES.length} unlocked.</p>
 <div class="badges">${BADGES.map(b=>`<div class="badge ${U.badges[b.id]?'got':''}"><div class="ico">${b.ico}</div><b>${b.name}</b><span>${b.d}</span></div>`).join('')}</div>
 <h2 style="margin-top:26px">Levels</h2><div class="card"><div class="tablewrap"><table><tr><th>Level</th><th>Title</th><th>XP needed</th></tr>${LEVELS.map((l,i)=>`<tr style="${level(U.xp).i===i?'color:var(--teal);font-weight:700':''}"><td>${i+1}</td><td>${l[1]}</td><td>${l[0]}</td></tr>`).join('')}</table></div></div>
 <h2 style="margin-top:26px">How to earn XP</h2><div class="card"><div class="tablewrap"><table>
 <tr><td>Read a case section</td><td>+5</td></tr><tr><td>Read a whole case</td><td>+30</td></tr><tr><td>Judge a boardroom argument</td><td>+10 if you agree with our reading, +3 otherwise</td></tr>
 <tr><td>Build an answer plan</td><td>+15 (+10 bonus for a flawless plan). Choosing <b>Plan only</b> keeps this XP and moves on.</td></tr><tr><td>Type (or speak) an answer and check it</td><td>+10, plus +3 for each key idea and +2 for each structure point the automatic check finds, up to +32. Needs at least 40 words, at least one key idea, and your own typing or speech: pasting is turned off.</td></tr><tr><td>Answer marked by your lecturer</td><td>Up to +30, depending on the mark. It stays even if you restart the question.</td></tr><tr><td>Finish a timed answer on paper</td><td>+30 (write for at least 4 of the 10 minutes; any timed task needs 40% of its time on the clock)</td></tr><tr><td>Practise the same question again</td><td>XP and badge progress count once per question per day</td></tr><tr><td>Self-check</td><td>+3 per check met</td></tr>
 <tr><td>MCQ: correct answer</td><td>+2 (each question counts once a day). Answers given before you could read the question earn nothing.</td></tr><tr><td>MCQ: speed bonus</td><td>Speed points for correct answers (3 within 15 s, 2 within 30 s, 1 after). At the end you get half your speed points, scaled by accuracy: nothing at 60% or below, the full amount at 90% or better.</td></tr><tr><td>MCQ: finish bonus</td><td>+5 for 10 questions, +10 for 20, +15 for 30 (needs at least 10 new questions read properly and 50% accuracy)</td></tr><tr><td>MCQ: retry my mistakes</td><td>+1 per correct answer</td></tr>
 <tr><td>Study a topic in the notes</td><td>+20</td></tr><tr><td>Finish a case activity</td><td>+15 (+10 for a top-band argument)</td></tr><tr><td>Crack a case (all read, all judged, 5 questions finished)</td><td>+50</td></tr>
 <tr><td>Long answer written on paper (about 18 minutes)</td><td>+40 (write for at least 40% of the time)</td></tr><tr><td>Long answer self-marked</td><td>+2 per mark you give yourself</td></tr>
 <tr><td>Screen time: daily goal (20 active minutes)</td><td>+15 once a day</td></tr><tr><td>Screen time: every 20 active minutes outside live sessions</td><td>+10, up to 6 times a day (+60). Only counts while the portal is on screen and you're active: it pauses after 2 minutes idle, except while a writing timer runs.</td></tr>
 <tr><td>Live session: on screen 85%+ (at least 10 minutes joined)</td><td>+20 once per session</td></tr><tr><td>Hours logged</td><td>Badges at 5, 10 and 20 hours of active screen time</td></tr>
 <tr><td>Practise on a new day</td><td>+10</td></tr><tr><td>Complete the daily mission</td><td>+25 Starter · +35 Pro · +50 Elite (missions get tougher as you level up)</td></tr></table></div></div>`)}
const DEMO_ROWS=[ // [activity, XP each, Student 1 count, Student 2 count]
 ['Practise on a new day',10,6,1],['Daily missions completed (Starter)',25,2,1],['Daily missions completed (Pro)',35,3,0],['Correct MCQ answers (new questions)',2,150,90],
 ['MCQ speed and finish bonuses (per set)',30,6,1],['Topics studied in the notes',20,7,3],['Case sections read',5,20,10],['Boardroom verdicts that match our reading',10,18,8],
 ['Other boardroom verdicts',3,6,9],['Answer plans built',15,10,5],['Flawless plans (bonus)',10,3,0],['Timed answers written on paper',30,6,1],['Case activities finished',15,8,2],['Long answers written on paper',40,2,0]];
const DEMO_P=[{n:'Student 1',who:'Practises about 35 minutes a day, 6 days a week',em:'🐢',time:'≈ 3.5 hours',streak:6,
   badges:['🎫','🧑‍💼','📋','📈','🔥','☄️','📚','🎯','🎙️','⚖️','🧱','💎','⏱️','🛠️','✅']},
 {n:'Student 2',who:'Crams in one 4-hour session the night before',em:'🐇',time:'≈ 4 hours',streak:1,badges:['🎫','🧑‍💼','📋','🎯','🎙️','🧱','✅']}];
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
function studentPage(sid){
  if(ME.sid!==LECTURER)return home();
  if(!cloudOn())return shell('#/lecturer',`<p><a href="#/lecturer">← Lecturer</a></p><div class="callout">Student profiles need the live connection. Sign in with your PIN while online to open them.</div>`);
  if(!/^S0\d{5}$/.test(sid||''))return lecturer();
  shell('#/lecturer',`<p><a href="${esc(PFROM||'#/lecturer')}" id="pback">← Back</a></p><div id="prof"><p class="muted">Loading ${esc(sid)}…</p></div>`);
  let X,RV,open=null,tab='ans';const drafts={},OPEN=new Set();
  const draw=force=>{const el=$('#prof');if(!el||X===undefined||RV===undefined)return;const ae=document.activeElement;if(!force&&ae&&el.contains(ae)&&/TEXTAREA|INPUT|SELECT/.test(ae.tagName))return;
    if(!X||!X.u){el.innerHTML=`<div class="card"><h2>${esc(sid)}</h2><p class="muted">This student hasn't signed in with a PIN yet, so there is no saved progress. (Email: ${esc(CLOUD.email(sid))})</p></div>${actionsHTML()}`;bindActions();return}
    const u=Object.assign({log:{},days:[],badges:{},n:{}},X.u),L=level(u.xp|0),I=qIndex();
    const ans=Object.entries(u.ans||{}).sort((a,b)=>String(a[1].at)<String(b[1].at)?1:-1),notes=Object.entries(RV).filter(([k])=>isNote(k)).sort((a,b)=>String(a[1].at)<String(b[1].at)?1:-1);
    const marked=ans.filter(([k])=>RV[k]).length,first=[...(u.days||[])].sort()[0];
    if(!OPEN.init){OPEN.init=1;if(ans.some(([k])=>!RV[k]))OPEN.add('ans')}
    const ansItem=([k,a])=>{const e=I[a.q],r=RV[k],good=e?e.q.chips.filter(c=>c.g).length:0,fl=a.fl||{},flt=flagText(fl);
      const d=drafts[k]||{band:r?r.band:a.b|0,xp:r?r.xp:Math.min(30,(a.b|0)*4),fb:r?r.fb:''};
      return `<div class="mqi" data-k="${esc(k)}"><div class="row" style="justify-content:space-between"><b style="font-size:.9rem">${esc(e?e.label:a.q)}</b><span class="muted" style="font-size:.8rem">${esc(String(a.at||'').slice(0,16).replace('T',' '))}</span></div>
      <div class="muted" style="font-size:.85rem">${esc(e?e.q.q.slice(0,140):'')}${e&&e.q.q.length>140?'…':''}</div>
      <div style="font-size:.85rem;margin:4px 0">${a.w|0} words · automatic ${a.b|0}/6 · key ideas ${(a.f||[]).length}/${good}${flt?` · <span style="color:var(--gold)">⚠️ ${esc(flt)}</span>`:''}${r?` · <b>marked ${r.band}/6, +${r.xp} XP</b> <span class="muted">(${r.by==='lecturer'?'you':'Claude'})</span>`:' · <span class="tag">not marked</span>'}</div>
      ${r&&r.fb&&open!==k?`<p class="muted" style="font-size:.85rem;margin:4px 0">“${esc(r.fb)}”</p>`:''}
      ${open===k?`<div class="answerprev">${esc(a.t||'').replace(/\n/g,'<br>')}</div>${flagEvHTML(fl)}
      <div class="row" style="margin-top:8px"><label class="inl">Band <select data-f="band">${[0,1,2,3,4,5,6].map(b=>`<option value="${b}" ${b===d.band?'selected':''}>${b}</option>`).join('')}</select></label><label class="inl">XP <input type="number" min="0" max="30" data-f="xp" value="${d.xp}"></label></div>
      <textarea data-f="fb" maxlength="600" style="min-height:80px;margin-top:8px" placeholder="Feedback: one strength, the most important missing point, one tip">${esc(d.fb||'')}</textarea>
      <div class="row" style="margin-top:8px"><button class="btn sm" data-save>Save mark</button><button class="btn ghost sm" data-close>Close</button></div><div class="err" data-er></div>`
      :`<button class="btn ghost sm" data-open style="margin-top:4px">${r?'Read · edit mark':'Read and mark'}</button>`}</div>`};
    el.innerHTML=`<div class="card psec"><div class="prof-h"><div class="av">${esc((X.name||sid).trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase())}</div>
      <div><h1 style="margin:0">${esc(X.name||sid)}</h1><p class="muted" style="margin:2px 0 0">${LVL_ICO[L.i]} ${esc(L.name)} · <b>${u.xp|0} XP</b>${L.to?' · '+(L.to-(u.xp|0))+' XP to '+esc(LEVELS[L.i+1][1]):' · top level'}</p>
      <div class="bar" style="margin-top:8px"><i style="width:${L.pct}%;background:var(--teal)"></i></div></div></div>
      <div class="kv"><div>ID<b>${esc(sid)}</b></div><div>Student email<b>${esc(CLOUD.email(sid))}</b></div><div>Name (class list)<b>${u.dn?esc(u.dn):'not added yet'}</b></div><div>Username<b>${u.un?esc(u.un):'not picked yet'}</b></div>
      <div>Section<b>${esc(secLabel(u.dg)||'–')}</b></div><div>Streak<b>🔥 ${streak(u)} day${streak(u)===1?'':'s'}</b></div><div>Last active<b>${ago(X.ts)}</b></div><div>First practised<b>${esc(first||'–')}</b></div></div>
      ${profSumHTML(u,{last:X.ts,risk:riskOf(X)})}<div class="row" style="margin-top:10px"><button type="button" class="btn sm" data-va="${esc(sid)}" data-lect>👁 View as student</button></div></div>
    ${secsHTML(profSections(u,{sid,lect:1,marked}),OPEN)}${integSecHTML(u,OPEN)}
    ${secsHTML([{id:'ans',ico:'✍️',t:'Typed answers',sum:`${ans.length} answer${ans.length===1?'':'s'} · ${marked} marked`,html:(ans.length?ans.slice(0,30).map(ansItem).join(''):'<p class="muted">No typed answers yet.</p>')+(ans.length>30?'<p class="muted" style="font-size:.85rem">Showing the newest 30.</p>':'')},
      {id:'msgs',ico:'✉️',t:"Messages you've sent",sum:notes.length?notes.length+' sent':'None yet',html:notes.length?notes.map(([k,v])=>`<div class="note" style="border-left:3px solid var(--teal);padding:6px 10px;margin-top:6px"><p style="margin:0">${esc(v.fb)}</p><span class="muted" style="font-size:.8rem">${esc(String(v.at).slice(0,16).replace('T',' '))} · ${u.notes&&u.notes[k]?(u.notesRead&&u.notesRead[k]?'read':'delivered'):'not opened yet'}</span></div>`).join(''):'<p class="muted">None yet.</p>'}],OPEN)}
    ${profileXHTML(sid,u)}${nameEditHTML(sid,u)}${actionsHTML()}`;
    secsBind(el,OPEN);bindActions();
    el.querySelectorAll('.mqi').forEach(box=>{const k=box.dataset.k,a=(u.ans||{})[k],r=RV[k];
      box.querySelector('[data-open]')&&(box.querySelector('[data-open]').onclick=()=>{open=k;draw(1)});
      box.querySelector('[data-close]')&&(box.querySelector('[data-close]').onclick=()=>{open=null;delete drafts[k];draw(1)});
      box.querySelectorAll('[data-f]').forEach(f=>f.oninput=f.onchange=()=>{const d=drafts[k]||(drafts[k]={band:r?r.band:a.b|0,xp:r?r.xp:Math.min(30,(a.b|0)*4),fb:r?r.fb:''});
        d[f.dataset.f]=f.dataset.f==='fb'?f.value:+f.value;if(f.dataset.f==='band'&&!r&&!d.xpSet){d.xp=Math.min(30,d.band*4);box.querySelector('[data-f="xp"]').value=d.xp}if(f.dataset.f==='xp')d.xpSet=1});
      box.querySelector('[data-save]')&&(box.querySelector('[data-save]').onclick=async()=>{const g=x=>box.querySelector(`[data-f="${x}"]`);
        const v={q:a.q,band:Math.max(0,Math.min(6,+g('band').value|0)),xp:Math.max(0,Math.min(30,+g('xp').value|0)),fb:g('fb').value.trim().slice(0,600),at:new Date().toISOString(),by:'lecturer'};
        const b=box.querySelector('[data-save]');b.disabled=true;b.textContent='Saving…';
        try{await CLOUD.saveReview(sid,k,v);delete drafts[k];open=null;toast('✅','Mark saved',v.band+'/6, +'+v.xp+' XP');draw(1)}catch(e){b.disabled=false;b.textContent='Save mark';box.querySelector('[data-er]').textContent=CLOUD.say(e)}})})};
  function actionsHTML(){return `<div class="card psec"><h2>Actions</h2>
    <label for="pnote">Send a message</label><textarea id="pnote" maxlength="600" style="min-height:80px" placeholder="E.g. Great progress this week! Try the Topic 12 MCQs next."></textarea>
    <div class="row" style="margin-top:8px"><button class="btn sm" id="psend">✉️ Send message</button><span class="muted" style="font-size:.82rem">They see it on their Home page next time they open the portal. No XP.</span></div>
    <div class="row" style="margin-top:14px"><button class="btn ghost sm" id="preset">🔑 Send PIN reset email</button><button class="btn ghost sm" id="pdl">⬇ Download data (JSON)</button></div><div class="err" id="perr"></div></div>`}
  function bindActions(){
    $('#psend').onclick=async()=>{const t=$('#pnote').value.trim().slice(0,600);if(!t){$('#perr').textContent='Write a message first.';return}const b=$('#psend');b.disabled=true;
      try{await CLOUD.saveReview(sid,'note_'+Date.now().toString(36),{q:'note',band:0,xp:0,fb:t,at:new Date().toISOString(),by:'lecturer'});$('#pnote').value='';$('#perr').textContent='';toast('✉️','Message sent',(X&&X.name)||sid);draw(1)}
      catch(e){$('#perr').textContent=CLOUD.say(e)}b.disabled=false};
    $('#preset').onclick=async()=>{if(!confirm(`Send a PIN reset email to ${CLOUD.email(sid)}?\n\nThe student chooses a new PIN from the link. Their progress is kept.`))return;
      try{await CLOUD.reset(sid);toast('🔑','Reset email sent',CLOUD.email(sid))}catch(e){$('#perr').textContent=CLOUD.say(e)}};
    $('#pdl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({sid,name:X&&X.name,lastActive:X&&X.ts,progress:X&&X.u,reviews:RV},null,1)],{type:'application/json'}));a.download='mkt101-'+sid+'-'+today()+'.json';a.click()}}
  const err=e=>{const el=$('#prof');if(el)el.innerHTML=`<p class="err">${esc(CLOUD.say(e))}</p>`};
  CLOUD.watchStudent(sid,x=>{X=x;draw()},err);CLOUD.watchReview(sid,r=>{RV=r;draw()},err);presProfileWatch(()=>draw())}
function migrateSession(){if(LS.get('session',null))return;try{const r=JSON.parse(localStorage.getItem('mkt101-student')||sessionStorage.getItem('mkt101-student')||'null');
  if(r&&/^S0\d{5}$/.test(r.sid||'')&&r.name)LS.set('session',{sid:r.sid,name:r.name})}catch(e){}}
function migrateProgress(){if(U.migrated)return;U.migrated=1;const st=LS.get('st',null),dm=LS.get('done',null);let n=0;
  if(st&&typeof st==='object'){U.act=U.act||{};for(const k in st)if(!U.act[k]){U.act[k]=st[k];n++}}
  if(dm&&typeof dm==='object')for(const k in dm){const m=k.match(/^(sto|soneva)-(\d+)$/);if(dm[k]&&m){const key='actdone:'+m[1]+':'+m[2];if(award(key,15,'Activity done',1)){countOnce(key,'acts');n++}}}
  save();if(n)setTimeout(()=>toast('📦','Progress carried over','Your work from the old MKT101 practice site is here.'),900)}

/* the course's parts of a profile (engine/simple.js): shared by the lecturer's view of a student and the student's own My progress */
function profCourse(u,ctx){const n=u.n||{},fin=u.fin||{},done=practised(u),mh=u.mh||[];
  const topicRows=TOPICS.map(t=>{const m=mastery(u,t),sh=BANK_S.filter(q=>q.t===t),sd=sh.filter(q=>done.has(q.id)||fin[q.id]).length,w=((u.wk||{}).t||{})['t'+t],best=mh.filter(h=>h.topic===t&&!h.retry).reduce((b,h)=>Math.max(b,h.acc|0),-1);
  return `<div class="pb"><span>${TOPIC_ICO[t]} <b>Topic ${t}</b><br><span class="muted" style="font-size:.8rem">${esc(TERM.topics[t])}</span></span>
  <div class="bar"><i style="width:${Math.min(100,m.att/15*100)}%;background:${m.mcq?'var(--green)':'var(--teal)'}"></i></div>
  <span style="text-align:right;font-size:.82rem">${m.att} MCQs · ${m.acc}%${best>=0?' · best set '+best+'%':''}<br>📖 ${m.notes?'✓':'–'} · ✍️ ${sd}/${sh.length}${w&&w[1]?' · ⚠️ '+w[1]:''} · ${mastered(u,t)?'🏅 mastered':'not mastered'}</span></div>`}).join('');
  const caseRows=CASEL.map(c=>{const rd=c.sections.filter(s=>u.log['read:'+c.id+':'+s.id]).length,vs=c.boardroom.map((a,i)=>[a,(u.verd||{})[c.id+':'+i]]).filter(x=>x[1]),ok=vs.filter(x=>x[1]===x[0].v).length,
  qd=c.questions.filter(q=>fin[q.id]||done.has(q.id)).length,ad=c.acts.filter((a,i)=>u.log['actdone:'+c.id+':'+(i+1)]).length;
  return `<div class="pb"><span>${c.icon} <b>${esc(c.short)}</b></span><div class="bar"><i style="width:${(rd/c.sections.length*100)|0}%"></i></div>
  <span style="text-align:right;font-size:.82rem">read ${rd}/${c.sections.length} · Boardroom ${vs.length}/${c.boardroom.length}${vs.length?' ('+Math.round(ok/vs.length*100)+'% match)':''}<br>practice ${qd}/${c.questions.length} · activities ${ad}/${c.acts.length}${u.badges['case_'+c.id]?' · 🏅':''}</span></div>`}).join('');
  const ms=TOPICS.filter(t=>mastered(u,t)).length,rd=CASEL.reduce((t,c)=>t+c.sections.filter(s=>u.log['read:'+c.id+':'+s.id]).length,0),all=CASEL.reduce((t,c)=>t+c.sections.length,0);
  return {stats:[[n.mcq|0,'MCQs'],[n.mcqSets|0,'MCQ sets'],[n.plans|0,'plans'],[n.timed|0,'timed'],[n.typed|0,'typed'],[ctx.marked|0,'marked'],[n.longs|0,'long answers'],[n.acts|0,'activities'],[n.missions|0,'missions']],
    secs:[{id:'topics',ico:'🏅',t:'By topic',sum:ms+'/7 topics mastered · '+(n.mcq|0)+' MCQs answered',html:(ctx.self?'<p class="muted" style="font-size:.85rem;margin-top:0">Each topic badge needs 📖 the notes studied, 🎯 80%+ on at least 15 MCQs, and ✍️ one written answer on the topic.</p>'+topicGrid(u)+'<h3 style="margin-top:14px">Details</h3>':'')
      +'<p class="muted" style="font-size:.82rem;margin-top:0">Bar: MCQs answered towards the 15 needed for mastery (green once 80%+). ✍️ written questions practised. ⚠️ weak-spot score.</p>'+topicRows}],
    badgesX:`<h3 style="margin-top:14px">MCQ record</h3><p style="font-size:.9rem;margin:0">${n.mcqRight|0} right · best run ${n.bestRow|0} in a row · Perfect 30 ×${n.perfect30|0} · Speed Run ×${n.speedrun|0}</p>
      ${mh.length?`<div class="tablewrap"><table style="margin-top:8px"><tr><th>Date</th><th>Topic</th><th>Score</th><th>Time/Q</th><th>XP</th></tr>${mh.slice().reverse().slice(0,8).map(h=>`<tr><td>${esc(h.d)}</td><td>${h.topic?'T'+h.topic:'Mixed'}${h.retry?' (retry)':''}</td><td>${h.c}/${h.n} · ${h.acc}%</td><td>${h.n?Math.round(h.s/h.n)+' s':'–'}</td><td>${h.x|0}</td></tr>`).join('')}</table></div>`:'<p class="muted">No MCQ sets yet.</p>'}`,
    cases:{sum:rd+'/'+all+' case sections read',html:caseRows}}}

/* ---------- course hooks for the engine ---------- */
const CASE_ALL=CASEL,BANK_B_ALL=BANK_S;
const caseName=c=>c.short,caseNames=c=>[c.short,c.org,'Soneva','STO','Lena','Malé','Hulhumalé'];
const isB=o=>!!o.short,bArea=q=>'t'+q.t,bQLabel=q=>'Topic '+q.t+': '+q.topic,bLabel=k=>tName(+k.slice(1));
onHook('beforeMe',migrateSession);onHook('afterLoad',migrateProgress);
onHook('leave',()=>{clearInterval(MQT);document.onkeydown=null;delete document.body.dataset.case});
ROUTES.case=h=>caseView(h[1],h[2]||'read',parseInt(h[3],10)||1);
ROUTES.mcq=h=>{if(h[1]==='t'){const t=+h[2];if(U.mq&&U.mq.done)U.mq=null;U.mtopic=TOPICS.includes(t)?t:0;U.mtopics=U.mtopic?[U.mtopic]:TOPICS.slice();save();return mcqPage()}return mcqPage()};
ROUTES.short=h=>shortPage(h[1]==='t'?+h[2]:0);
ROUTES.long=h=>h[1]?longView(h[1]):longPage();

/* ---------- dashboard hooks (engine/dash.js): readiness by topic, MCQs in the review queue, flashcards from the notes ---------- */
function readyAreas(u){return TOPICS.map(t=>{const m=mastery(u,t);return {k:'t'+t,label:TOPIC_ICO[t]+' '+tName(t),href:'#/notes/'+t,cov:(m.notes?.25:0)+Math.min(1,m.att/15)*.45+(m.wrote?.3:0),acc:m.att?m.acc/100:null}})}
function qArea(id){const q=MCQ_BY[id];return q?'t'+q.t:((qIndex()[id]||{}).area||'')}
function revItem(id){const q=MCQ_BY[id];return q?{kind:'mcq',q:q.q,o:q.o,why:q.why,label:'Topic '+q.t+' · MCQ'}:null}
function dashStats(){return [[TOPICS.filter(t=>mastered(U,t)).length+'/7','topics mastered','#/notes']]}
function flashDecks(){const T=(NOTES.topics8||{}).topics||{};return TOPICS.filter(t=>T[t]&&(T[t].terms||[]).length).map(t=>({k:'t'+t,label:TOPIC_ICO[t]+' '+tName(t),cards:T[t].terms}))}

/* practice paper (engine/paper.js): MCQs, written answers and a case, 180 minutes in all */
function paperSpec(rng){const pick=(a,n)=>{a=a.slice();const o=[];while(a.length&&o.length<n)o.push(a.splice(Math.floor(rng()*a.length),1)[0]);return o};
  const M=TOPICS.flatMap(t=>pick(BANK.mcq.filter(q=>q.t===t),4)).slice(0,25);
  const st=pick(TOPICS,3),S=st.map(t=>pick(BANK_S.filter(q=>q.t===t),1)[0]).filter(Boolean).map(q=>({id:q.id,kind:'written',q:q.q,ideas:q.chips.filter(c=>c.g).map(c=>c.t),label:'Topic '+q.t+' · '+q.topic}));
  const lt=TOPICS.filter(t=>!st.includes(t)),e=pick(BANK.essays.filter(x=>lt.includes(x.t)),1)[0]||pick(BANK.essays,1)[0];
  const c=pick(CASEL,1)[0],C=pick(c.questions,3).map(q=>({id:q.id,kind:'written',q:q.q,ideas:q.chips.filter(x=>x.g).map(x=>x.t),label:c.short+': '+q.skill}));
  return [{k:'a',title:'MCQs',mins:30,note:'Pick one answer for each question. You can change your answers until you submit the section.',items:pick(M,M.length).map(q=>({id:q.id,kind:'mcq',q:q.q,o:q.o,label:'Topic '+q.t}))},
    {k:'b',title:'Written answers',mins:75,note:'Three short answers and one long answer. Explain, give an example, and say why it matters.',items:S.concat([{id:e.id,kind:'written',q:e.q,ideas:e.guide,label:'Topic '+e.t+' · long answer'}])},
    {k:'c',title:'Case study: '+c.short,mins:75,note:'Answer the questions about the case. You can open the case in a new tab.',items:C.map((x,i)=>i?x:Object.assign(x,{html:`<p><a href="#/case/${c.id}/read" target="_blank" rel="noopener">📖 Open ${esc(c.short)} in a new tab</a></p>`}))}]}

/* quick quiz items (engine/social.js: challenges, the weekend challenge, quiz battles): the MCQ bank */
function quizItem(id){const q=MCQ_BY[id];return q?{id:q.id,q:q.q,o:q.o,why:q.why,label:'Topic '+q.t}:null}
function quizItems(rng,n){const all=BANK.mcq,o=[],used=new Set();while(o.length<n&&o.length<all.length){const q=all[Math.floor(rng()*all.length)];if(used.has(q.id))continue;used.add(q.id);o.push(quizItem(q.id))}return o}

/* question editor (engine/qbank.js): MCQs and short answers */
const qbChips=d=>!Array.isArray(d.chips)?'chips must be a list.':d.chips.some(c=>!c||typeof c.t!=='string'||!c.t.trim())?'Every chip needs its text (t).':d.chips.filter(c=>c.g).length<3?'Give at least 3 key ideas (g: 1).':d.chips.filter(c=>!c.g).length<1?'Give at least one decoy (g: 0, with why).':d.chips.some(c=>!c.g&&!c.why)?'Every decoy needs a why.':'';
const qbText=(d,n)=>typeof d.q!=='string'||d.q.trim().length<n?'Write the question (q).':/\bexams?\b|\bmidterms?\b|\bresits?\b/i.test(JSON.stringify(d))?'Practice questions must not mention exams, midterms or resits.':'';
function qbPut(arr,L,kind,fix){L.filter(x=>x.kind===kind).forEach(x=>{const i=arr.findIndex(q=>q.id===x.id);if(x.st==='hidden'){if(i>=0)arr.splice(i,1);return}const q=fix?fix(x.data):x.data;if(i>=0)arr[i]=Object.assign({},arr[i],q);else arr.push(q)})}
function qbankKinds(){return {mcq:{label:'MCQ',template:{id:'',t:8,b:'K',d:1,q:'',o:['The correct answer','Wrong answer','Wrong answer','Wrong answer'],why:'Why the correct answer is right'},
    check:d=>qbText(d,10)||(!TOPICS.includes(+d.t)?'t must be a topic number (8 to 14).':!Array.isArray(d.o)||d.o.length!==4||d.o.some(x=>typeof x!=='string'||!x.trim())?'Give exactly 4 options (o), the correct one first.':!d.why?'Explain the answer (why).':''),find:id=>MCQ_BY[id]||null},
  short:{label:'Short answer',template:{id:'',t:8,topic:'',marks:6,q:'',chips:[{t:'Define: …',g:1},{t:'Explain: …',g:1},{t:'Example: …',g:1},{t:'A common mistake …',g:0,why:'Why it is wrong'}],checks:['I defined the key term accurately','I applied it to the situation']},
    check:d=>qbText(d,20)||(!TOPICS.includes(+d.t)?'t must be a topic number (8 to 14).':typeof d.topic!=='string'||!d.topic?'Give the topic.':'')||qbChips(d),find:id=>BANK_S.find(q=>q.id===id)||null}}}
function qbankApply(L){qbPut(BANK.mcq,L,'mcq',d=>Object.assign({b:'K',d:1},d,{t:+d.t}));qbPut(BANK_S,L,'short',d=>Object.assign({checks:[],marks:6},d,{t:+d.t}));
  Object.keys(MCQ_BY).forEach(k=>delete MCQ_BY[k]);BANK.mcq.forEach(q=>MCQ_BY[q.id]=q)}

/* ---------- study notes (engine/notes.js): Topics 8 to 14 from notes.js ---------- */
function notesCfg(){const N=NOTES.topics8;return {N,keys:TOPICS.filter(t=>N.topics[t]),get:k=>N.topics[k]||null,word:'Topic',ico:k=>TOPIC_ICO[k],title:k=>TERM.topics[k],egLabel:'Maldives example',
  badge:k=>TOPIC_BADGE[k],practice:k=>[['🎯 MCQs on Topic '+k,'#/mcq/t/'+k],['🧩 Short answers','#/short/t/'+k],['🖋️ Long answers','#/long']],last:['Try a mixed MCQ set','#/mcq']}}
/* "📖 Refer to notes": written questions and paragraph questions go to their topic */
function notesFor(q,o){const t=+(q.t||(q.kind==='chips'?q.topic:0)||o.topic||0);return TOPICS.includes(t)&&NOTES.topics8.topics[t]?'#/notes/'+t:''}
/* ---------- the weekly 6th-spot challenge (engine/wild.js) and paragraph practice (engine/chips.js) ---------- */
function wildTopicList(){return TOPICS.map(t=>[t,'Topic '+t+': '+TERM.topics[t]])}
const chipTopics=wildTopicList;
const wildArea=k=>'t'+k;
function wildItems(top,seed){return wildPick(top,seed)}
function wildItem(id){if(CHIPS_BY[id])return CHIPS_BY[id];const q=MCQ_BY[id];return q?{kind:'mcq',id:q.id,q:q.q,o:q.o,why:q.why,label:'Topic '+q.t}:null}
