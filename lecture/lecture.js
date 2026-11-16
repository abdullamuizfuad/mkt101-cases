/* MKT101 Arena: live lectures. Course-level code (not part of the shared engine; MKT301 is untouched).
   Routes: #/lecture/<id>        students: the live page on their phones (answers, research, Term Snap, badges)
           #/lecture/<id>/deck   lecturer: the projector deck (full screen, keyboard and clicker), runs the live activities
           #/lecture/<id>/notes  lecturer: the presenter window (note line, pacing, next slide), opened from the deck with P
   Cloud (Firestore, rules block "lec" in tools/build-rules.py):
     lec/{id}       the lecturer only: {st:'live'|'ended', at, ends, cur (open activity id), ph:'open'|'closed', r (Term Snap round),
                    oat, pick ('A'|'B': the client the class carries), sfr (badge given), tc ([SID] top closers), pod ([{n,s}] podium)}
     lec/{id}/a/{SID}  that student only, while live: {a:{activity id: answer}, n: podium name, t}
   Progress: U.lec[id] = {a (answers), sfr, tc, sc (Term Snap rounds settled)} (additive). XP keys: lec:<id>:<activity>[:extra].
   Term Snap answers also count toward Topic mastery (U.mt[topic]) and the MCQ counters, like other MCQs.
   Without the cloud (or before the rules are published) the deck still runs: every live slide has a show-of-hands version. */
const LX_LECS={ch13:LX_CH13};
const LX_KEEN=1;/* the right priority client in round 2: Client B (index 1) */
const LX_ORDER=['w1','rep','p1','p2','c0','c1','c2','ln','w2'];
const LX_DUR={words:60,rep:90,prospect:60,research:150,call:30,snap:12};
const LX_BLOCK=/\b(fuck|shit|bitch|dick|sex|porn|ass|bastard|damn|idiot|stupid)\b/i;
const LX={id:null,L:null,doc:null,mine:null,stops:[],sig:'',rT0:0,err:null,gstop:null,gid:null};
const lxPath=id=>'lec/'+id;
const lxStop=()=>{LX.stops.forEach(f=>{try{f&&f()}catch(e){}});LX.stops=[]};
const lxLive=d=>!!(d&&d.st==='live'&&(!d.ends||Date.now()<d.ends));
const lxIsStudent=()=>typeof ME!=='undefined'&&ME&&ME.sid!==LECTURER&&!VIEWAS;
function lxU(id){U.lec=U.lec||{};const r=U.lec[id]||(U.lec[id]={a:{}});r.a=r.a||{};r.sc=r.sc||{};return r}
const lxNick=()=>String((U&&U.nick)||defaultNick(ME.name)||'Player').slice(0,24);
const lxSeed=(s,arr)=>{const r=seeded(s);return arr.map((x,i)=>[x,r(),i]).sort((a,b)=>a[1]-b[1]).map(x=>x[2])};
/* Term Snap points: 500 for a right answer, up to 500 more for speed, +100 for each extra answer in a row */
function lxSnapScore(a,n,ms){let s=0,row=0,t=0;for(let r=0;r<n;r++){const x=a&&a['s'+r];if(x&&x.c===0){row++;s+=500+Math.round(500*Math.max(0,1-(x.ms|0)/ms))+(row-1)*100;t+=x.ms|0}else row=0}return {s,t}}
function lxWords(list,k){const c={};list.forEach(d=>{const w=d.a&&d.a[k];if(typeof w!=='string')return;const x=w.toLowerCase().replace(/[^a-zÀ-ɏ' -]/g,'').trim().slice(0,20);if(!x||LX_BLOCK.test(x))return;c[x]=(c[x]|0)+1});
  return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,40)}
function lxCount(list,k,n,f){const c=new Array(n).fill(0);list.forEach(d=>{const v=d.a&&d.a[k];const i=f?f(v):v;if(Number.isInteger(i)&&i>=0&&i<n)c[i]++});return c}
const lxPick=(p1,p2)=>{const v=(p2&&p2.reduce((a,b)=>a+b,0))?p2:p1;if(!v||!(v[0]+v[1]+v[2]))return 'B';if(v[2]>=v[0]&&v[2]>=v[1])return v[1]>=v[0]?'B':'A';return v[1]>=v[0]?'B':'A'};

/* ---------- badges ---------- */
BADGES.push({id:'salesrep',ico:'🤝',name:'Sales Force Representative',d:'Join the sales team in the live Chapter 13 lecture',t:u=>!!(((u.lec||{}).ch13||{}).sfr)},
  {id:'keeneye',ico:'👀',name:'Keen Eye',d:'Spot the secret VIP client in the live Chapter 13 lecture',t:u=>!!(((u.lec||{}).ch13||{}).ke)},
  {id:'topcloser',ico:'🏅',name:'Top Closer',d:'Finish in the top 3 of Term Snap in the live Chapter 13 lecture',t:u=>!!(((u.lec||{}).ch13||{}).tc)});

/* ---------- routes ---------- */
ROUTES.lecture=h=>{const id=h[1]||'ch13';if(!LX_LECS[id])return home();if(h[2]==='deck')return lxDeck(id);if(h[2]==='notes')return lxNotes(id);return lxPhone(id)};
onHook('leave',()=>{lxStop();lxDeckClose();window.__presNoBreak=window.__lxNB0;LX.sig=''});
window.__lxNB0=window.__presNoBreak;

/* ---------- students: the live page ---------- */
function lxPhone(id){const L=LX_LECS[id];LX.id=id;LX.L=L;LX.doc=null;LX.sig='';LX.mine=null;LX.err=null;
  if(ME.sid===LECTURER){shell('#/lecturer',`<div data-lect><h1>🎤 Live lecture</h1><p class="muted">${esc(L.short)}</p><div class="row"><a class="btn" href="#/lecture/${id}/deck">Open the deck</a><a class="btn ghost" href="#/lecture/${id}/notes" target="_blank">Presenter view</a></div></div>`);return}
  shell('#/',`<div class="lxp" id="lxp"><p class="muted">Connecting to the live lecture…</p></div>`);
  lxPreload(L);
  if(!cloudOn()){lxPDraw();return}
  window.__presNoBreak=1;/* no break reminder on the lecture page */
  const mine=Object.assign({},lxU(id).a);LX.mine={a:mine};
  CLOUD.get(lxPath(id)+'/a/'+ME.sid).then(d=>{if(d&&d.a)LX.mine.a=Object.assign(mine,d.a);lxPDraw(1)}).catch(()=>{});
  LX.stops.push(CLOUD.watchOne(lxPath(id),d=>{const p=LX.doc;LX.doc=d;lxPOnDoc(p,d)},e=>{LX.err=e;lxPDraw(1)},true))}
function lxPreload(L){Object.values(L.clients).forEach(C=>{if(C.feed)C.feed.pics.forEach(s=>{const i=new Image();i.src=s})})}
async function lxSend(k,v){if(!lxIsStudent()||!lxLive(LX.doc))return false;const R=lxU(LX.id);R.a[k]=v;LX.mine.a[k]=v;save();
  try{await CLOUD.put(lxPath(LX.id)+'/a/'+ME.sid,{a:LX.mine.a,n:lxNick(),t:CLOUD.ts()});return true}
  catch(e){toast('⚠️','Not sent yet','Check your connection, then tap again.');return false}}
function lxPOnDoc(p,d){if(!lxIsStudent())return;const id=LX.id;
  if(lxLive(d)&&!LX.mine.a.j)lxSend('j',1);
  if(d&&d.cur==='ln'&&d.ph==='open'&&!(p&&p.cur==='ln'&&p.ph==='open'&&p.r===d.r))LX.rT0=Date.now();
  lxSettle(d);
  const R=lxU(id);
  if(d&&d.sfr&&!R.sfr&&(LX.mine.a.j||lxLive(d))){R.sfr=today();award('lec:'+id+':sfr',20,'Sales Force Representative',true);checkBadges();save();if(lxLive(d))lxSend('sfr',1)}
  if(d&&d.pick&&LX.mine.a.p2===LX_KEEN&&!R.ke){R.ke=today();award('lec:'+id+':ke',10,'Keen Eye',true);checkBadges();save();if(lxLive(d))lxSend('ke',1)}
  if(d&&(d.tc||[]).includes(ME.sid)&&!R.tc){R.tc=today();award('lec:'+id+':tc',25,'Top Closer',true);checkBadges();save();if(lxLive(d))lxSend('tc',1)}
  const sig=d?[d.st,d.cur,d.ph,d.r,d.pick].join('|'):'none';if(sig!==LX.sig){LX.sig=sig;lxPDraw(1)}else lxPMini()}
/* XP that depends on the result is given once an activity has closed (stable keys, so a reload never gives it twice) */
function lxSettle(d){if(!d||!LX.mine)return;const id=LX.id,L=LX.L,a=LX.mine.a,R=lxU(id),ci=LX_ORDER.indexOf(d.cur);
  const past=k=>d.st==='ended'||LX_ORDER.indexOf(k)<ci||(d.cur===k&&d.ph!=='open');
  ['c0','c1','c2'].forEach((k,j)=>{if(Number.isInteger(a[k])&&past(k)){const c=L.call[a.pk||d.pick||'B']||L.call.B,o=c.d[j].opts[a[k]];if(o&&o.good)lxAw('lec:'+id+':'+k+':v',5,'Value move: '+c.d[j].step)}});
  for(let r=0;r<L.snap.length;r++){const x=a['s'+r];if(!x||R.sc[r])continue;const done=d.st==='ended'||LX_ORDER.indexOf('ln')<ci||(d.cur==='ln'&&(d.r>r||(d.r===r&&d.ph!=='open')));if(!done)continue;
    R.sc[r]=1;const ok=x.c===0;U.mt=U.mt||{};const m=U.mt[L.topic]||(U.mt[L.topic]=[0,0]);m[0]++;if(ok)m[1]++;countOnce('lecsnap:'+id+':'+r,'mcq',ok&&'mcqRight');
    if(ok)award('lec:'+id+':s'+r,3,'Term Snap: right',true);save()}}
/* XP during the lecture is quiet (no toasts over the buttons): the pill at the top counts up instead */
function lxAw(k,xp,l){if(award(k,xp,l,true)){const e=$('#lxpx');if(e){e.textContent='+'+lxMyXP()+' XP in this lecture';e.classList.remove('lxbump');void e.offsetWidth;e.classList.add('lxbump')}return true}return false}
function lxMyXP(){const p='lec:'+LX.id+':';return Object.keys(U.log||{}).filter(k=>k.startsWith(p)).reduce((t,k)=>t+((U.gain||{})[k]|0),0)}
function lxPMini(){const el=$('#lxpx');if(el)el.textContent='+'+lxMyXP()+' XP in this lecture';const pd=$('#lxpod');if(pd&&LX.doc)pd.innerHTML=lxPodHTML(LX.doc.pod)}
const lxPodHTML=pod=>(pod&&pod.length)?`<ol class="lxpod">${pod.map((x,i)=>`<li><span>${['🥇','🥈','🥉','4','5'][i]}</span><b>${esc(x.n)}</b><i>${x.s}</i></li>`).join('')}</ol>`:'';
function lxPDraw(){const el=$('#lxp');if(!el)return;const L=LX.L,d=LX.doc,id=LX.id;
  const head=`<div class="lxph"><div><span class="lxlive${lxLive(d)?'':' off'}">${lxLive(d)?'● LIVE':'○ Not live'}</span><h1>🎤 ${esc(L.title)}</h1></div><span class="pill" id="lxpx">+${lxMyXP()} XP in this lecture</span></div>`;
  if(!cloudOn()){el.innerHTML=head+`<div class="card"><p>The live lecture needs your Arena account online. Sign in with your student ID and PIN, and check your internet.</p></div>`;return}
  if(LX.err){el.innerHTML=head+`<div class="card"><p>The live lecture is not switched on yet. Keep this page open, or reload it in a minute.</p></div>`;return}
  if(!LX.mine||d===undefined){el.innerHTML=head+'<p class="muted">Loading…</p>';return}
  if(!lxLive(d)){const ended=d&&d.st==='ended';el.innerHTML=head+`<div class="card lxwait"><div class="lxbig">${ended?'🙌':'⏳'}</div><h2>${ended?'Thanks for joining the lecture':'Get ready'}</h2>
    <p>${ended?'Your XP and badges are saved. The tutorial uses the full Soneva case: look for the steps you learned today.':'You are on the right page. When your lecturer starts, activities open here by themselves.'}</p>${lxBadgeRow()}</div>`;return}
  const k=d.ph==='open'?d.cur:null,A=k&&L.acts[k];
  el.innerHTML=head+(A?`<div class="card lxact" id="lxact"></div>`:`<div class="card lxwait"><div class="lxbig lxeyes">👀</div><h2>Eyes on the screen</h2><p class="muted">The next activity opens here by itself.</p>${lxAfter(d)}</div>`)+`<div id="lxpod">${lxPodHTML(d.pod)}</div>`+lxBadgeRow();
  if(A)lxPAct(k,A,d)}
function lxBadgeRow(){const b=['salesrep','keeneye','topcloser'].map(i=>BADGES.find(x=>x.id===i)).filter(Boolean);return `<div class="lxbadges">${b.map(x=>`<div class="lxbdg${U.badges[x.id]?' got':''}"><span>${x.ico}</span><b>${esc(x.name)}</b><small>${U.badges[x.id]?'Earned':'Earn it today'}</small></div>`).join('')}</div>`}
/* what the student did in the activity that just closed */
function lxAfter(d){const L=LX.L,a=LX.mine.a,k=d.cur;if(!k||!L.acts[k])return '';const A=L.acts[k];
  if(A.kind==='snap'&&a['s'+d.r]){const x=a['s'+d.r];return `<p class="lxfb ${x.c===0?'ok':'no'}">${x.c===0?'✅ Right!':'❌ Not this time.'} The answer: <b>${esc(L.snap[d.r].o[0])}</b></p><p class="muted">Your score: ${lxSnapScore(a,d.r+1,A.ms).s}</p>`}
  if(A.kind==='call'&&Number.isInteger(a[k])){const o=(L.call[a.pk||d.pick]||L.call.B).d[A.d].opts[a[k]];return `<p class="lxfb ${o.good?'ok':''}">You voted: <b>${esc(o.t)}</b>${o.good?' · a value move (+5 XP)':''}</p>`}
  if(a[k]!=null)return '<p class="lxfb ok">✅ Your answer is in. See the results on the screen.</p>';return ''}
function lxPAct(k,A,d){const el=$('#lxact'),L=LX.L,a=LX.mine.a,done=a[k]!=null;
  const top=`<p class="lxk">${esc(A.title)}</p>`;
  if(A.kind==='words'){el.innerHTML=top+`<h2>${esc(A.q)}</h2><form id="lxf" class="row" autocomplete="off"><input id="lxw" maxlength="20" placeholder="${esc(A.ph)}" value="${esc(a[k]||'')}" aria-label="${esc(A.ph)}"><button class="btn">${done?'Change':'Send'}</button></form><p class="muted" id="lxm">${done?'✅ Sent. You can change it until the cloud closes.':'One word, in English.'}</p>`;
    $('#lxf').onsubmit=async e=>{e.preventDefault();const w=$('#lxw').value.trim().split(/\s+/).slice(0,2).join(' ').slice(0,20);if(!w)return;if(LX_BLOCK.test(w)){$('#lxm').textContent='Please choose another word.';return}
      const first=a[k]==null;if(await lxSend(k,w)){if(first)lxAw('lec:'+LX.id+':'+k,A.xp,'Word sent');$('#lxm').textContent='✅ Sent: “'+w+'”. Look at the screen!'}};return}
  if(A.kind==='rep'){const v=a[k]||{s:null,v:50};el.innerHTML=top+`<h2>${esc(A.q)}</h2><p><b>1. Choose a structure</b></p><div class="lxopts">${A.opts.map((o,i)=>`<button class="lxopt" data-i="${i}" aria-pressed="${v.s===i}">${esc(o)}</button>`).join('')}</div>
      <p style="margin-top:14px"><b>2. ${esc(A.slider.q)}</b></p><div class="lxsl"><span>${esc(A.slider.l)}</span><input type="range" id="lxr" min="0" max="100" step="10" value="${v.v}" aria-label="${esc(A.slider.q)}"><span>${esc(A.slider.r)}</span></div>
      <p class="lxsv" id="lxsv"></p><button class="btn" id="lxgo" style="width:100%">${done?'Update my answer':'Send'}</button><p class="muted" id="lxm">${done?'✅ Sent. You can change it until the vote closes.':''}</p>`;
    let s=v.s;const sv=()=>{const x=+$('#lxr').value;$('#lxsv').textContent=(100-x)+'% salary · '+x+'% commission'};sv();$('#lxr').oninput=sv;
    $$('.lxopt',el).forEach(b=>b.onclick=()=>{s=+b.dataset.i;$$('.lxopt',el).forEach(x=>x.setAttribute('aria-pressed',x===b))});
    $('#lxgo').onclick=async()=>{if(s==null){$('#lxm').textContent='Choose a structure first.';return}const first=a[k]==null;if(await lxSend(k,{s,v:+$('#lxr').value})){if(first)lxAw('lec:'+LX.id+':'+k,A.xp,'Sales team designed');$('#lxm').textContent='✅ Sent. Look at the screen!'}};return}
  if(A.kind==='prospect'){const C=L.clients;el.innerHTML=top+`<h2>${esc(A.q)}</h2><p class="lxtag">Teaching scenario</p>${['A','B','C'].map((c,i)=>`<div class="lxpros${a[k]===i?' on':''}" data-i="${i}"><div class="lxprh"><span class="lxpi">${C[c].ico}</span><b>Client ${c}</b></div><ul>${C[c].card.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
      ${A.research?`<div class="row lxrsb"><button class="btn ghost sm" data-s="${c}">🔎 Search</button>${C[c].feed?`<button class="btn ghost sm" data-f="${c}">📱 Their feed</button>`:''}</div>`:''}<button class="btn sm lxvote" data-v="${i}">${a[k]===i?'✅ Your choice':'Call Client '+c+' first'}</button></div>`).join('')}<p class="muted" id="lxm"></p>`;
    $$('[data-s]',el).forEach(b=>b.onclick=()=>lxSearch(b.dataset.s));$$('[data-f]',el).forEach(b=>b.onclick=()=>lxFeed(b.dataset.f));
    $$('[data-v]',el).forEach(b=>b.onclick=async()=>{const i=+b.dataset.v,first=a[k]==null;if(await lxSend(k,i)){if(first)lxAw('lec:'+LX.id+':'+k,A.xp,'Prospect chosen');lxPAct(k,A,d)}});return}
  if(A.kind==='call'){const pk=d.pick||'B',c=L.call[pk],D=c.d[A.d],cl=L.clients[pk];
    el.innerHTML=top+`<p class="lxtag">Teaching scenario · Client ${pk}: ${esc(cl.name)}</p>${D.setup.map(([w,t])=>`<div class="lxbub ${w==='rep'?'rep':'cli'}"><b>${esc(L.voices[w])}</b>${esc(t)}</div>`).join('')}<h2>${esc(D.q)}</h2>
      <div class="lxopts">${D.opts.map((o,i)=>`<button class="lxopt" data-i="${i}" aria-pressed="${a[k]===i}">${esc(o.t)}</button>`).join('')}</div><p class="muted" id="lxm">${a[k]!=null?'✅ Vote in. You can change it until the vote closes.':'Tap one. The class vote decides what Maya says.'}</p>`;
    $$('.lxopt',el).forEach(b=>b.onclick=async()=>{const i=+b.dataset.i,first=a[k]==null;LX.mine.a.pk=pk;if(await lxSend(k,i)){if(first)lxAw('lec:'+LX.id+':'+k,A.xp,'Vote: '+D.step);$$('.lxopt',el).forEach(x=>x.setAttribute('aria-pressed',x===b));$('#lxm').textContent='✅ Vote in. Listen to the call on the screen.'}});return}
  if(A.kind==='snap'){const r=d.r|0,it=L.snap[r],sk='s'+r,ord=lxSeed(ME.sid+'|'+r,it.o);
    el.innerHTML=`<div class="lxsnaph"><span class="lxk">⚡ Term Snap · Round ${r+1}</span><span class="pill" id="lxsc">${lxSnapScore(a,r,A.ms).s} pts</span></div><p class="muted" style="margin:4px 0 10px">Read the definition on the screen. Tap the term. Fast and right wins.</p>
      <div class="lxtiles">${ord.map(i=>`<button class="lxtile${a[sk]&&a[sk].c===i?' on':''}" data-i="${i}" ${a[sk]?'disabled':''}>${esc(it.o[i])}</button>`).join('')}</div><p class="lxfb" id="lxm">${a[sk]?'🔒 Locked in. Wait for the answer.':''}</p>`;
    $$('.lxtile',el).forEach(b=>b.onclick=async()=>{if(LX.mine.a[sk])return;const i=+b.dataset.i,ms=Math.max(0,Date.now()-(LX.rT0||Date.now()));$$('.lxtile',el).forEach(x=>x.disabled=true);b.classList.add('on');
      if(await lxSend(sk,{c:i,ms}))$('#lxm').textContent='🔒 Locked in. Wait for the answer.';else{$$('.lxtile',el).forEach(x=>x.disabled=false);delete LX.mine.a[sk]}});return}}
/* simulated research (teaching scenario) */
function lxSearch(c){const C=LX.L.clients[c];modal('Search results',`<p class="lxtag">Simulated search · Teaching scenario</p><div class="lxsearch"><div class="lxsbar">🔎 ${esc(C.name)} ${esc(C.from)}</div>
  ${C.search.map(s=>`<div class="lxsr"><small>${esc(s.src)}</small><b>${esc(s.h)}</b><p>${esc(s.p)}</p></div>`).join('')}</div>`)}
function lxFeed(c){const F=LX.L.clients[c].feed;modal('Social feed',`<p class="lxtag">Simulated feed · Teaching scenario · Client ${c}</p><div class="lxfeed f${c}"><div class="lxfh"><div class="lxfav">${F.av||'📱'}</div><div class="lxfn"><b>@${esc(F.handle)}</b><em>${esc(F.type||'')}</em><span><b>${F.posts}</b> posts · <b>${esc(F.followers)}</b> followers · <b>${esc(F.following)}</b> following</span><small>${esc(F.bio)}</small></div></div>
  <div class="lxfg">${F.pics.map((p,i)=>`<button class="lxfp" data-p="${i}" aria-label="${esc(F.caps[i])}"><img src="${p}" alt="" loading="eager"></button>`).join('')}</div><p class="lxfc" id="lxfc">Tap a post to read it.</p></div>`);
  $$('.lxfp').forEach(b=>b.onclick=()=>{$$('.lxfp').forEach(x=>x.classList.toggle('on',x===b));$('#lxfc').textContent='“'+F.caps[+b.dataset.p]+'”'})}

/* ---------- the Join card on Home (from L.joinFrom, while live, or when the lecturer shows it) ---------- */
function lxJoinOn(L,d){if(d&&d.st==='ended'&&!d.show)return false;if(lxLive(d)||(d&&d.show))return true;const t=Date.now();return t>=Date.parse(L.joinFrom)&&t<Date.parse(L.joinTo)}
function lxHomeCard(){const m=document.getElementById('main');if(!m||!lxIsStudent())return;const h=location.hash.replace(/^#\/?/,'');let c=document.getElementById('lxhome');
  const id=LX.gid||'ch13',L=LX_LECS[id],on=(h===''||h==='/')&&m.querySelector('h1.sr')&&lxJoinOn(L,LX.gdoc);
  if(!on){if(c)c.remove();return}if(c&&c._live===lxLive(LX.gdoc))return;if(!c){c=document.createElement('a');c.id='lxhome';c.className='lxhome';c.href='#/lecture/'+id;m.prepend(c)}
  c._live=lxLive(LX.gdoc);c.innerHTML=`<span class="lxlive${c._live?'':' off'}">${c._live?'● LIVE NOW':'TODAY 4:00 PM'}</span><b>🎤 Join the live lecture</b><small>${esc(L.title)} · tap to join and get ready</small><i aria-hidden="true">›</i>`}
new MutationObserver(()=>{try{lxHomeCard()}catch(e){}}).observe(document.getElementById('app'),{childList:true});
setInterval(()=>{try{lxHomeCard()}catch(e){}},30000);

/* ---------- a banner on every page while a lecture is live ---------- */
function lxGlobal(){if(LX.gstop||!lxIsStudent()||!cloudOn())return;const id='ch13';LX.gid=id;
  LX.gstop=CLOUD.watchOne(lxPath(id),d=>{LX.gdoc=d;lxHomeCard();let b=document.getElementById('lxbar');const on=lxLive(d)&&location.hash.indexOf('#/lecture/')!==0;
    if(!on){if(b)b.remove();return}if(!b){b=document.createElement('a');b.id='lxbar';b.className='lxbar';b.href='#/lecture/'+id;document.body.append(b)}
    b.innerHTML='<span>● LIVE</span> Lecture now: '+esc(LX_LECS[id].title)+' <b>Join ›</b>'},()=>{},true)}
onHook('signout',()=>{if(LX.gstop){LX.gstop();LX.gstop=null}const b=document.getElementById('lxbar');if(b)b.remove()});
window.addEventListener('hashchange',()=>{const b=document.getElementById('lxbar');if(b&&location.hash.indexOf('#/lecture/')===0)b.remove()});
setInterval(()=>{try{if(!LX.gstop&&typeof ME!=='undefined'&&ME&&cloudOn())lxGlobal()}catch(e){}},4000);

/* ---------- lecturer card ---------- */
LF_META.lxc=['🎤 Live lecture','Run Chapter 13 from the Arena'];
lcard('lxc',el=>{el.hidden=false;const id='ch13',L=LX_LECS[id];el.innerHTML=`<h2 style="margin:0 0 6px">🎤 Live lecture</h2><p class="muted" style="margin:0 0 10px">${esc(L.short)}. The deck runs the phone activities. Open it on the projector laptop. Students see a Join button on Home from ${new Date(Date.parse(L.joinFrom)).toLocaleString('en-GB',{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit',timeZone:'Indian/Maldives'})}.</p>
  <p id="lxcs" class="muted">Checking…</p><div class="row"><a class="btn" href="#/lecture/${id}/deck">▶ Open the deck</a><a class="btn ghost" href="#/lecture/${id}/notes" target="_blank" rel="noopener">Presenter view</a><button class="btn ghost" id="lxshow">📣 Show the Join button now</button><button class="btn ghost" id="lxend">■ End lecture</button><button class="btn ghost" id="lxrst">↺ Clear answers (after a dry run)</button></div>`;
  const st=$('#lxcs');CLOUD.get(lxPath(id)).then(d=>{st.textContent=!d?'Not started yet. Starting the deck’s first slide makes it live for 3 hours.':lxLive(d)?'● Live now.':'Ended.'}).catch(()=>{st.textContent='Publish the newest rules (they include the live lecture block), then reload.'});
  $('#lxshow').onclick=async()=>{const d=await CLOUD.get(lxPath(id)).catch(()=>null),on=!(d&&d.show);await CLOUD.put(lxPath(id),on?{show:true,st:(d&&d.st==='live')?'live':'ready'}:{show:false},true);
    $('#lxshow').textContent=on?'🙈 Hide the Join button':'📣 Show the Join button now';st.textContent=on?'The Join button is on every student’s Home.':'The Join button follows the schedule again.'};
  CLOUD.get(lxPath(id)).then(d=>{if(d&&d.show)$('#lxshow').textContent='🙈 Hide the Join button'}).catch(()=>{});
  $('#lxend').onclick=async()=>{if(!confirm('End the live lecture? Phones stop taking answers.'))return;await CLOUD.put(lxPath(id),{st:'ended',cur:null,ph:'closed',show:false},true);st.textContent='Ended.'};
  $('#lxrst').onclick=async()=>{if(!confirm('Delete every answer saved for this lecture and reset it? Do this only after a dry run. XP already earned stays.'))return;
    const ds=await CLOUD.docs(lxPath(id)+'/a');for(const d of ds)await CLOUD.del(lxPath(id)+'/a/'+d.id);await CLOUD.put(lxPath(id),{st:'ended',cur:null,ph:'closed',r:0,pick:null,sfr:false,tc:[],pod:[]});st.textContent='Cleared '+ds.length+' answer(s). Ready for the real lecture.'}});

/* =====================================================================================================================
   The projector deck (lecturer only)
   ===================================================================================================================== */
const LXD={id:null,L:null,i:0,s:0,el:null,doc:null,ans:[],live:false,tEnd:0,tic:null,au:{},mute:false,busy:false,skip:false,short:false,
  trust:50,won:{},over:{},t0:null,bc:null,notes:false,theme:'light',hide:new Set(),scores:[]};
function lxDeckClose(){if(!LXD.el)return;clearInterval(LXD.tic);document.removeEventListener('keydown',lxKey);window.removeEventListener('resize',lxFit);LXD.el.remove();LXD.el=null;document.body.classList.remove('lxon');
  Object.values(LXD.au).forEach(a=>{try{a.pause()}catch(e){}});if(LXD.bc){LXD.bc.close();LXD.bc=null}}
function lxDeck(id){if(ME.sid!==LECTURER)return lxPhone(id);const L=LX_LECS[id];lxDeckClose();Object.assign(LXD,{asked:0,id,L,i:+(sessionStorage.getItem('lx_i_'+id)||0),s:0,ans:[],doc:null,live:false,won:{},over:{},trust:50,hide:new Set()});
  try{LXD.theme=localStorage.getItem('lx_theme')||'light'}catch(e){}
  window.__presNoBreak=1;document.body.classList.add('lxon');
  const el=document.createElement('div');el.id='lxd';el.setAttribute('data-lect','');el.dataset.lxt=LXD.theme;el.innerHTML=`<div class="lxbg" aria-hidden="true"><i></i><i></i><i></i><svg class="lxwave" viewBox="0 0 2400 200" preserveAspectRatio="none"><path d="M0 120 Q 300 60 600 120 T 1200 120 T 1800 120 T 2400 120 V200 H0Z"/><path d="M0 140 Q 300 90 600 140 T 1200 140 T 1800 140 T 2400 140 V200 H0Z"/></svg></div>
    <div class="lxstage" id="lxst"></div><div class="lxnote" id="lxnote" hidden></div><canvas class="confetti lxconf" id="lxconf" aria-hidden="true"></canvas>`;
  document.body.append(el);LXD.el=el;lxFit();window.addEventListener('resize',lxFit);document.addEventListener('keydown',lxKey);
  el.addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(b){e.preventDefault();lxAction(b.dataset.x,b)}});
  try{LXD.bc=new BroadcastChannel('lx-'+id);LXD.bc.onmessage=e=>{if(e.data==='next')lxGo(1);else if(e.data==='prev')lxGo(-1);else if(e.data==='hello')lxPost()}}catch(e){}
  Object.keys(L.call).forEach(c=>{const s=L.call[c],pre=(k,arr)=>arr.forEach((x,i)=>{const a=new Audio('lecture/'+id+'/audio/'+k+'-'+i+'.mp3');a.preload='auto';LXD.au[k+'-'+i]=a});
    pre(c+'-intro',s.intro);s.d.forEach((d,j)=>{pre(c+'-d'+j+'-s',d.setup);d.opts.forEach((o,k)=>pre(c+'-d'+j+'-o'+k,o.say))});pre(c+'-outro',s.outro)});
  if(cloudOn()){LX.stops.push(CLOUD.watchOne(lxPath(id),d=>{LXD.doc=d;LXD.live=lxLive(d);if(d&&d.at&&!LXD.t0)LXD.t0=d.at;lxLiveDraw()},()=>{LXD.live=false;LXD.doc=null;lxLiveDraw()},true));
    LX.stops.push(CLOUD.watch(lxPath(id)+'/a',{},list=>{LXD.ans=list.filter(x=>x.id!==LECTURER);lxLiveDraw()},()=>{},true))}
  LXD.tic=setInterval(lxTick,250);lxEnter()}
function lxFit(){const st=$('#lxst');if(!st)return;const k=Math.min(innerWidth/1600,innerHeight/900);st.style.transform=`translate(-50%,-50%) scale(${k})`}
const lxSl=()=>LXD.L.slides[LXD.i];
const lxPk=()=>(LXD.doc&&LXD.doc.pick)||LXD.over.pick||'B';
const lxOther=p=>p==='A'?'B':'A';
async function lxSet(patch){if(!LXD.live&&!('st' in patch))return;try{await CLOUD.put(lxPath(LXD.id),patch,true)}catch(e){console.warn('lecture write',e)}}
async function lxStart(){if(!cloudOn()){LXD.t0=Date.now();lxGo(1);return}
  try{await CLOUD.put(lxPath(LXD.id),{st:'live',at:CLOUD.ts(),ends:CLOUD.when(Date.now()+3*3600e3),cur:null,ph:'closed',r:0,pick:null,sfr:false,tc:[],pod:[]},true);LXD.live=true;LXD.t0=Date.now()}
  catch(e){alert('The live lecture could not start: publish the newest Firestore rules (tools/build-rules.py), then reload. The slides still work with a show of hands.')}lxGo(1)}

/* ---------- steps of each slide ---------- */
function lxPlan(sl){const L=LXD.L,b=(sl.b||[]).length;switch(sl.k){
  case 'title':return [{t:'show'}];
  case 'act':return [{t:'join'},{t:'open',k:sl.act},{t:'close',k:sl.act}];
  case 'badge':return [{t:'show'},{t:'award'}];
  case 'podium':return [{t:'show'},{t:'award'}];
  case 'call':{const c=L.call[lxPk()],P=[{t:'scene'},{t:'say',lines:'intro'}];c.d.forEach((d,j)=>P.push({t:'open',k:'c'+j,d:j},{t:'close',k:'c'+j,d:j},{t:'win',d:j}));P.push({t:'say',lines:'outro',end:1});return P}
  case 'snap':{const n=LXD.short?6:L.snap.length,P=[{t:'intro'}];for(let r=0;r<n;r++)P.push({t:'open',k:'ln',r},{t:'close',k:'ln',r});return P}
  case 'stairs':return [{t:'show',n:0},{t:'show',n:1},{t:'show',n:2},{t:'show',n:3}];
  case 'prospects':return [{t:'show',n:0},{t:'show',n:1},{t:'show',n:2},{t:'show',n:3}];
  case 'qualify':return [{t:'show',n:0},{t:'show',n:1},{t:'show',n:2},{t:'show',n:3},{t:'pick'}];
  case 'bridge2':return Array.from({length:L.sto.length+1},(_,n)=>({t:'show',n}));
  case 'compare':return [{t:'show',n:0},{t:'show',n:1},{t:'show',n:2}];
  case 'define':return [{t:'show',n:0},{t:'show',n:1}];
  case 'tools':case 'exemplar':case 'clouds':return [{t:'show',n:0},{t:'show',n:1}];
  default:return Array.from({length:b+1+(sl.case||sl.caseBy||sl.other||sl.s?1:0)},(_,n)=>({t:'show',n}))}}
function lxGo(dir){if(LXD.busy){LXD.skip=true;return}const P=lxPlan(lxSl());
  if(dir>0){if(lxSl().k==='title'&&LXD.i===0&&!LXD.live&&cloudOn()&&LXD.s===0&&!LXD.asked){LXD.asked=1;if(!(LXD.doc&&LXD.doc.st==='ended'&&LXD.ans.length)||confirm('This lecture ended earlier. Go live again? Answers already saved are kept.'))return lxStart()}
    if(LXD.s<P.length-1){LXD.s++;lxDo(P[LXD.s]);lxApply()}else if(LXD.i<LXD.L.slides.length-1){lxLeave();LXD.i++;LXD.s=0;lxEnter()}}
  else{if(LXD.s>0){const p=P[LXD.s];if(p.t==='open')lxClose(p.k);LXD.s--;lxApply()}else if(LXD.i>0){lxLeave();LXD.i--;LXD.s=lxPlan(lxSl()).length-1;lxEnter(1)}}}
function lxLeave(){const d=LXD.doc;if(d&&d.ph==='open'&&LXD.live)lxSet({ph:'closed'});LXD.tEnd=0;Object.values(LXD.au).forEach(a=>{try{a.pause()}catch(e){}})}
function lxOpen(k,r){const A=LXD.L.acts[k],dur=(A.research?LX_DUR.research:LX_DUR[A.kind])||60;LXD.tEnd=Date.now()+dur*1000;LXD.tDur=dur;if(LXD.live)lxSet({cur:k,ph:'open',r:r|0,oat:CLOUD.ts()})}
function lxClose(k){LXD.tEnd=0;lxSet({ph:'closed'});if(k==='ln')setTimeout(lxPodWrite,700)}
function lxDo(p){const sl=lxSl();
  if(p.t==='open'){if(sl.k==='call'){const c=LXD.L.call[lxPk()],D=c.d[p.d];lxOpen(p.k,0);if(D.setup.length)lxSay(D.setup,lxPk()+'-d'+p.d+'-s',1)}else lxOpen(p.k,p.r)}
  if(p.t==='close'){lxClose(p.k);if(sl.k==='call')lxSaveWin(p.d)}
  if(p.t==='win'){const c=LXD.L.call[lxPk()],w=LXD.won[p.d],o=c.d[p.d].opts[w];LXD.trust=Math.max(0,Math.min(100,LXD.trust+o.tr*12));lxSay(o.say,lxPk()+'-d'+p.d+'-o'+w)}
  if(p.t==='say'){const c=LXD.L.call[lxPk()];lxSay(c[p.lines],lxPk()+'-'+p.lines)}
  if(p.t==='award'&&sl.k==='badge'){lxSet({sfr:true});lxBoom()}
  if(p.t==='award'&&sl.k==='podium'){const top=lxBoard().filter(x=>x.s>0).slice(0,3);lxSet({tc:top.map(x=>x.id)});lxBoom(1)}
  if(p.t==='pick'){const pk=LXD.over.pick||lxPick(lxCount(LXD.ans,'p1',3),lxCount(LXD.ans,'p2',3));LXD.over.pick=pk;lxSet({pick:pk});setTimeout(()=>lxBoom(),400)}
  if(sl.k==='podium'&&p.t==='show')setTimeout(()=>lxBoom(1),900)}
function lxSaveWin(d){const c=LXD.L.call[lxPk()],D=c.d[d],v=lxCount(LXD.ans.filter(x=>(x.a.pk||lxPk())===lxPk()),'c'+d,3),g=D.opts.findIndex(o=>o.good);
  if(LXD.over['c'+d]!=null)return LXD.won[d]=LXD.over['c'+d];const mx=Math.max(...v);LXD.won[d]=!LXD.live||!mx?g:(v[g]===mx?g:v.indexOf(mx))}
/* play lines one after another: the bubble types while the voice plays; Next skips */
async function lxSay(lines,key,keep){LXD.busy=true;LXD.skip=false;const box=$('#lxchat');if(box&&!keep)box.querySelectorAll('.lxbub').forEach(b=>b.classList.add('old'));
  for(let i=0;i<lines.length;i++){const [w,t]=lines[i],b=document.createElement('div');b.className='lxbub '+(w==='rep'?'rep':'cli');b.innerHTML=`<b>${esc(LXD.L.voices[w])}</b><span></span>`;
    if(box){box.append(b);box.scrollTop=1e6}const sp=b.querySelector('span'),a=LXD.au[key+'-'+i];
    const dur=await new Promise(res=>{let done=false;const fin=()=>{if(!done){done=true;res()}};
      const est=Math.max(1500,t.length*62);const typ=d=>{const t0=Date.now();const step=()=>{const f=LXD.skip?1:Math.min(1,(Date.now()-t0)/d);sp.textContent=t.slice(0,Math.ceil(t.length*f));if(f<1&&!done)requestAnimationFrame(step)};step()};
      if(a&&!LXD.mute){a.currentTime=0;const go=()=>{typ(((a.duration&&isFinite(a.duration))?a.duration*1000:est)*.92)};a.onended=fin;a.onerror=()=>{typ(est);setTimeout(fin,est)};a.play().then(go).catch(()=>{typ(est);setTimeout(fin,est)})}
      else{typ(est);setTimeout(fin,est+300)}
      const sk=setInterval(()=>{if(LXD.skip){clearInterval(sk);try{a&&a.pause()}catch(e){}sp.textContent=t;fin()}if(done)clearInterval(sk)},80)});
    sp.textContent=t;if(LXD.skip){for(let j=i+1;j<lines.length;j++){const [w2,t2]=lines[j],b2=document.createElement('div');b2.className='lxbub '+(w2==='rep'?'rep':'cli');b2.innerHTML=`<b>${esc(LXD.L.voices[w2])}</b><span>${esc(t2)}</span>`;box&&box.append(b2)}break}
    await new Promise(r=>setTimeout(r,250))}
  if(box)box.scrollTop=1e6;LXD.busy=false;LXD.skip=false;lxMeter()}

/* ---------- drawing ---------- */
function lxEnter(back){const sl=lxSl(),st=$('#lxst');try{sessionStorage.setItem('lx_i_'+LXD.id,LXD.i)}catch(e){}
  if(sl.k==='call'&&!back){LXD.trust=50;LXD.won={}}
  st.className='lxstage k-'+sl.k;st.innerHTML=lxSlideHTML(sl)+(sl.at||sl.k==='call'?lxMiniHTML(sl.at||[]):'')+`<div class="lxfoot"><span>${esc(LXD.L.foot)}</span><span>${LXD.i+1} / ${LXD.L.slides.length}</span></div>`;
  if(back){const P=lxPlan(sl);for(let s=1;s<=LXD.s;s++){const p=P[s];if(p.t==='pick')LXD.over.pick=LXD.over.pick||lxPk()}}
  lxApply();lxLiveDraw();lxPost()}
function lxApply(){const st=$('#lxst');if(!st)return;const sl=lxSl(),P=lxPlan(sl),p=P[LXD.s]||{};
  let n=0;for(let s=0;s<=LXD.s;s++)if(P[s].t==='show')n=P[s].n|0;const shown=sl.k==='act'||sl.k==='call'||sl.k==='snap'?99:(P[LXD.s].t==='show'?n:LXD.s);
  $$('[data-bi]',st).forEach(e=>e.classList.toggle('on',+e.dataset.bi<=shown));
  st.dataset.step=p.t||'';st.dataset.si=LXD.s;
  if(sl.k==='path')st.style.setProperty('--pp',Math.max(0,Math.min(1,(shown)/Math.max(1,(sl.b||[]).length))));
  lxLiveDraw();lxPost()}
function lxCaseHTML(sl,bi){const pk=lxPk();const c=sl.caseBy?sl.caseBy[pk]:sl.case;if(!c&&!sl.other)return '';
  return `<div class="lxcase" data-bi="${bi}"><span class="lxcl">At Soneva${sl.caseBy?' · Client '+pk:''}</span><p>${esc(c||'')}</p>${sl.other?`<p class="lxoth">↪ ${esc(sl.other[pk])}</p>`:''}</div>`}
const lxH=(sl)=>`${sl.lo?`<span class="lxlo">LO ${esc(sl.lo)}</span>`:''}${sl.kick?`<p class="lxkick">${esc(sl.kick)}</p>`:''}<h1 class="lxh">${esc(sl.t||'')}</h1>`;
function lxSlideHTML(sl){const L=LXD.L,b=sl.b||[],pk=lxPk();switch(sl.k){
  case 'title':return `<div class="lxtitle"><p class="lxkick">${esc(sl.kick)}</p><h1 class="lxh xl">${esc(sl.t)}</h1><p class="lxsub">${esc(sl.s)}</p>${lxJoinHTML()}<p class="lxhint" id="lxstart"></p></div>`;
  case 'cards':return `${lxH(sl)}<p class="lxsub">${esc(sl.s)}</p><div class="lxcards">${b.map((c,i)=>`<div class="lxcard" data-bi="${i+1}" style="--d:${i}"><span class="lxci">${c.i}</span><b>${esc(c.h)}</b><small>${esc(c.p)}</small></div>`).join('')}</div>`;
  case 'define':return `<span class="lxlo">LO ${esc(sl.lo)}</span><div class="lxdef"><p class="lxterm">${esc(sl.term)}</p><p class="lxdt">${esc(sl.t)}</p></div>${sl.sub?`<p class="lxsub" data-bi="1">${esc(sl.sub)}</p>`:''}${sl.case?lxCaseHTML(sl,1):''}`;
  case 'points':case 'end':{const ch=sl.ch?`<span class="lxchip">Client ${pk}: ${esc(L.clients[pk].name)}</span>`:'';return `${lxH(sl)}${ch}<ul class="lxpts">${b.map((x,i)=>`<li data-bi="${i+1}">${esc(x)}</li>`).join('')}</ul>${sl.s?`<p class="lxsub" data-bi="${b.length+1}">${esc(sl.s)}</p>`:''}${lxCaseHTML(sl,b.length+1)}`}
  case 'grid':return `${lxH(sl)}<div class="lxgrid">${b.map((x,i)=>`<div class="lxg" data-bi="${i+1}"><b>${esc(x.h)}</b><p>${esc(x.p)}</p></div>`).join('')}</div>${lxCaseHTML(sl,b.length+1)}`;
  case 'tools':return `${lxH(sl)}<div class="lxtools">${b.map((x,i)=>`<div class="lxtool" data-bi="0" style="--d:${i}"><span>${x.i}</span><b>${esc(x.h)}</b><small>${esc(x.p)}</small></div>`).join('')}</div>${lxCaseHTML(sl,1)}`;
  case 'targets':return `${lxH(sl)}<div class="lxtg"><div class="lxtgc">Sales<br>promotion</div>${b.map((x,i)=>`<div class="lxtgi t${i}" data-bi="${i+1}"><b>${esc(x.h)}</b><small>${esc(x.p)}</small><p>${esc(x.o)}</p></div>`).join('')}<svg class="lxtgs" viewBox="0 0 1400 520" aria-hidden="true">${[[700,260,250,90],[700,260,1150,90],[700,260,250,430],[700,260,1150,430]].map(([a,b2,c,d],i)=>`<path data-bi="${i+1}" class="lxar" d="M${a} ${b2} L${c} ${d}"/>`).join('')}</svg></div>${lxCaseHTML(sl,b.length+1)}`;
  case 'bridge':return `${lxH(sl)}<div class="lxbr"><div class="lxbre">${esc(sl.l)}</div><svg viewBox="0 0 900 220" class="lxbrs" aria-hidden="true"><path id="lxbp" d="M40 150 Q450 -10 860 150" class="lxbrp"/>${[0,1,2,3,4,5].map(i=>`<circle r="9" class="${i%2?'b':'a'}"><animateMotion dur="${3.2+i%3*.4}s" begin="${i*.55}s" repeatCount="indefinite" ${i%2?'keyPoints="1;0" keyTimes="0;1" calcMode="linear"':''}><mpath href="#lxbp"/></animateMotion></circle>`).join('')}</svg><div class="lxbre r">${esc(sl.r)}</div></div>
    <ul class="lxpts sm">${b.map((x,i)=>`<li data-bi="${i+1}">${esc(x)}</li>`).join('')}</ul>${lxCaseHTML(sl,b.length+1)}`;
  case 'path':{const n=b.length;return `${lxH(sl)}<div class="lxpath${n>6?' seven':''}"><svg viewBox="0 0 1400 160" preserveAspectRatio="none" aria-hidden="true"><path class="lxpl0" d="M60 80 C 300 10, 450 150, 700 80 S 1100 10, 1340 80"/><path class="lxpl" pathLength="1" d="M60 80 C 300 10, 450 150, 700 80 S 1100 10, 1340 80"/></svg>
    <div class="lxps">${b.map((x,i)=>`<div class="lxp1" data-bi="${i+1}"><span>${i+1}</span><b>${esc(x)}</b></div>`).join('')}</div>${sl.steps7?`<div class="lxav" aria-hidden="true">🧳</div>`:''}</div>${lxCaseHTML(sl,n+1)}`}
  case 'stairs':return `${lxH(sl)}${lxStairsHTML()}`;
  case 'act':return lxActHTML(sl);
  case 'reveal':return `${lxH(sl)}<div class="lxrev"><div class="lxrevr" id="lxres"></div><ul class="lxpts sm">${b.map((x,i)=>`<li data-bi="${i+1}">${esc(x)}</li>`).join('')}</ul></div>`;
  case 'badge':return `<div class="lxbadge"><p class="lxkick">LO 13.2 · You passed every step</p><h1 class="lxh xl">You’re hired!</h1><div class="lxmedal"><span>🤝</span></div><h2>Sales Force Representative</h2><p class="lxsub">Badge for everyone in Soneva’s new sales team</p><p class="lxcount" id="lxbc"></p></div>`;
  case 'prospects':{const C=L.clients;return `${lxH(sl)}<p class="lxsub">${esc(sl.s)}</p><div class="lxpro">${['A','B','C'].map((c,i)=>`<div class="lxprc" data-bi="${i+1}"><div class="lxprh"><span>${C[c].ico}</span><b>Client ${c}</b></div><ul>${C[c].card.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div><p class="lxsub" data-bi="4">Qualify: can they pay? Do they need us? Can they decide? Will they come back?</p>`}
  case 'qualify':{const C=L.clients,rows=[['need','Do they need us?'],['pay','Can they pay?'],['decide','Can they decide?'],['back','Will they come back?']];
    return `${lxH(sl)}<div class="lxq"><table><tr><th></th>${['A','B','C'].map((c,i)=>`<th data-bi="${i+1}">${C[c].ico} Client ${c}<small>${esc(C[c].name)}</small></th>`).join('')}</tr>${rows.map(([k,q])=>`<tr><td>${q}</td>${['A','B','C'].map((c,i)=>`<td data-bi="${i+1}">${esc(C[c].verdict[k])}</td>`).join('')}</tr>`).join('')}</table>
      <div class="lxqside"><div id="lxres"></div><div class="lxpick" data-bi="4" id="lxpick"></div></div></div>`}
  case 'call':return `<div class="lxcall"><div class="lxcallh"><span class="lxtag">Teaching scenario · AI voices</span><h1 class="lxh">The live sales call</h1><p class="lxsub" id="lxcw"></p></div>
    <div class="lxcallb"><div class="lxper rep"><div class="lxava">🧑🏽‍💼</div><b>Maya</b><small>Soneva sales executive (you)</small></div><div class="lxchat" id="lxchat"></div><div class="lxper cli"><div class="lxava" id="lxcava"></div><b id="lxcn"></b><small id="lxcs2"></small></div></div>
    <div class="lxcallf"><div class="lxmeter"><span>Trust</span><i><b id="lxtm"></b></i><em id="lxtv"></em></div><div id="lxres" class="lxcallr"></div></div>${lxJoinMini()}</div>`;
  case 'snap':return `<div class="lxsnap" id="lxsnap"></div>${lxJoinMini()}`;
  case 'podium':return `<div class="lxpodium"><p class="lxkick">Term Snap · Final results</p><h1 class="lxh">Top Closers</h1><div class="lxpods" id="lxpods"></div><p class="lxsub" id="lxpaw"></p></div>`;
  case 'compare':return `${lxH(sl)}<div class="lxcmp"><div class="lxcm" data-bi="1"><h2>${esc(sl.l.h)}</h2><ul>${sl.l.b.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="lxcmar" data-bi="2">→</div><div class="lxcm r" data-bi="2"><h2>${esc(sl.r.h)}</h2><ul>${sl.r.b.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>`;
  case 'exemplar':return `${lxH(sl)}<span class="lxchip">Model answer · Client ${pk}: ${esc(L.clients[pk].name)}</span><table class="lxex">${L.exemplar[pk].map((r,i)=>`<tr data-bi="1" style="--d:${i}"><th>${i+1}. ${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</table>`;
  case 'bridge2':return `${lxH(sl)}<table class="lxsto"><tr><th>Idea</th><th>🏝️ Soneva Fushi</th><th>🚚 STO</th></tr>${L.sto.map((r,i)=>`<tr data-bi="${i+1}"><th>${esc(r[0])}</th><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</table>`;
  case 'clouds':return `${lxH(sl)}<div class="lxcl2"><div><h2>At the start</h2><div class="lxcloud" id="lxcw1"></div></div><div data-bi="1"><h2>Now</h2><div class="lxcloud" id="lxcw2"></div></div></div>`;
  default:return lxH(sl)}}
/* the seller's staircase and the customer's funnel (adapted from the lecturer's GEO demo lecture) */
function lxStairsHTML(){const L=LXD.L,S=L.stairs,F=L.funnel,y=[10,110,210,310,414];
  return `<div class="lxsx"><div class="lxsxl"><p class="lxview">The seller’s view · seven steps</p><div class="lxstairs" data-bi="1">${S.map((x,i)=>`<div class="lxst ${i<4?'d':'h'}" style="--i:${i}"><span>${i+1}</span><b>${esc(x[0])}</b><small>${esc(x[1])}</small></div>`).join('')}
    <span class="lxband d">Social selling and digital tools help most</span><span class="lxband h">People win the sale</span></div><p class="lxcite">Seven steps: Kotler &amp; Armstrong, Marketing: An Introduction (15th ed.)</p></div>
    <div class="lxsxr"><p class="lxview" data-bi="2">The customer’s view · marketing funnel<br><small>AIDA funnel: general marketing</small></p><svg class="lxfun" viewBox="0 0 680 560" role="img" aria-label="Marketing funnel: awareness, interest, consideration, action, loyalty, mapped to the seven steps, with a loop from loyalty back to awareness">
      <defs><marker id="lxarr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
      <g data-bi="2">${F.slice(0,4).map((f,i)=>{const t=y[i],a=90+i*49.5,b=610-i*49.5;return `<path class="lxfl l${i}" d="M${a},${t} L${b},${t} L${b-39.6},${t+80} L${a+39.6},${t+80} Z" style="--d:${i*.12}s"/><text class="lxfn" x="350" y="${t+49}">${esc(f[0])}</text><g class="lxfc"><rect x="${i*14}" y="${t+22}" width="${i===1||i===2?150:104}" height="36" rx="18"/><text x="${i*14+(i===1||i===2?75:52)}" y="${t+47}">${esc(f[1])}</text></g>`}).join('')}
        <rect class="lxfl l4" x="276" y="414" width="148" height="58" rx="29"/><text class="lxfn inv" x="350" y="452">${esc(F[4][0])}</text><g class="lxfc"><rect x="120" y="425" width="104" height="36" rx="18"/><text x="172" y="450">${esc(F[4][1])}</text></g></g>
      <g class="lxloop" data-bi="3"><path d="M432,443 C560,443 662,420 662,320 L662,150 C662,70 650,50 626,50" marker-end="url(#lxarr)"/><text x="672" y="506">Loyal guests return</text><text x="672" y="534">and refer new prospects</text></g></svg></div></div>`}
/* a small staircase in the corner: where this slide sits in the seven steps */
const lxMiniHTML=at=>`<div class="lxmini" aria-label="Selling steps ${at.join(', ')}">${[1,2,3,4,5,6,7].map(i=>`<i class="${at.includes(i)?'on':''}" style="--i:${i}"><b>${i}</b></i>`).join('')}</div>`;
const lxJoinHTML=()=>`<div class="lxjoin"><img src="${LXD.L.qr}" alt="QR code to join"><div><p>Join on the Arena</p><b>${esc(LXD.L.url)}</b><p class="lxjn" id="lxjn"></p></div></div>`;
const lxJoinMini=()=>`<div class="lxjm"><img src="${LXD.L.qr}" alt=""><span id="lxjn"></span></div>`;
function lxActHTML(sl){const A=LXD.L.acts[sl.act];return `<div class="lxact"><div class="lxacth"><span class="lxk">📱 ${esc(A.title)}</span><h1 class="lxh">${esc(A.q)}</h1></div><div class="lxactb"><div class="lxres" id="lxres"></div>${lxJoinHTML()}</div><div class="lxtimer" id="lxtimer"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><circle class="v" cx="22" cy="22" r="19" pathLength="100"/></svg><b></b></div>${lxJoinMini()}</div>`}

/* live parts: results, counts, timers. lxSetH only touches the DOM when the HTML changes, so animations don't restart on every answer */
function lxSetH(el,h){if(el&&el._h!==h){el.innerHTML=h;el._h=h}}
/* the word cloud grows: existing words keep their place and resize, new words pop in */
function lxCloudInto(el,w){if(!el)return;if(!w.length){lxSetH(el,'<p class="lxwaitt">Words appear here…</p>');return}if(el.querySelector('.lxwaitt')){el.innerHTML='';el._h=null}
  const mx=w[0][1];w.forEach(([t,c],i)=>{let sp=[...el.children].find(x=>x.dataset.w===t);const s=(.9+2.6*(c/mx)).toFixed(2);
    if(!sp){sp=document.createElement('span');sp.className='lxw';sp.dataset.w=t;sp.style.setProperty('--r',(((el.children.length*37)%9)-4)+'deg');sp.style.setProperty('--d','0s');
      const n=el.children.length;if(n%2&&el.firstChild)el.insertBefore(sp,el.firstChild);else el.append(sp)}
    sp.style.setProperty('--s',s);const h=esc(t)+(c>1?'<sup>'+c+'</sup>':'');if(sp._h!==h){sp.innerHTML=h;sp._h=h}});
  [...el.children].forEach(x=>{if(x.dataset.w&&!w.some(([t])=>t===x.dataset.w))x.remove()})}
function lxJoined(){return LXD.ans.filter(x=>x.a&&x.a.j).length}
function lxLiveDraw(){if(!LXD.el)return;const sl=lxSl(),P=lxPlan(sl),p=P[LXD.s]||{},L=LXD.L,ans=LXD.ans,live=LXD.live;
  const jn=live?lxJoined()+' joined':(cloudOn()?'':'Offline: show of hands');$$('#lxjn').forEach(e=>e.textContent=jn);
  const s0=$('#lxstart');if(s0)s0.textContent=live?'● Live · press → to begin':cloudOn()?'Press → to go live (phones can then join)':'Offline mode: the deck works with a show of hands';
  const res=$('#lxres');
  if(sl.k==='act'){const A=L.acts[sl.act],k=sl.act,n=ans.filter(x=>x.a&&x.a[k]!=null).length,open=p.t==='open',closed=p.t==='close';$('#lxst').classList.toggle('isopen',open||closed);
    if(!res)return;if(p.t==='join'){lxSetH(res,`<p class="lxwaitt">${live?'Press → to open this on every phone':'Show of hands: read the question aloud'}</p>${!live?lxHands(A):''}`);return}
    const cnt=`<p class="lxn"><b>${n}</b> answered${live?' of '+lxJoined():''}</p>`;
    if(A.kind==='words'){if(!res.querySelector('.lxcloud')){res.innerHTML='<p class="lxn"></p><div class="lxcloud big"></div>';res._h=null}res.querySelector('.lxn').innerHTML=live?`<b>${n}</b> answered of ${lxJoined()}`:'';lxCloudInto(res.querySelector('.lxcloud'),lxWords(ans,k));return}
    if(!live){lxSetH(res,lxHands(A));return}
    if(open&&A.kind!=='prospect'){lxSetH(res,cnt+`<div class="lxpulse">📱</div>`);return}
    if(A.kind==='rep'){lxSetH(res,cnt+(closed?lxRepHTML():''));return}
    if(A.kind==='prospect'){const v1=lxCount(ans,'p1',3),v2=lxCount(ans,'p2',3);lxSetH(res,cnt+(A.research?(open?`<div class="lxresearch"><span>🔎</span><span>📱</span><span>📰</span></div><p class="lxsub">Research on your phones: search each client and scroll their feed.</p>`:lxBars(['Client A','Client B','Client C'],v2,v1)):(closed?lxBars(['Client A','Client B','Client C'],v1):'')));return}}
  if(sl.k==='reveal'&&res){lxSetH(res,live?lxRepHTML():lxHands(L.acts.rep))}
  if(sl.k==='qualify'){if(res)lxSetH(res,live?`<p class="lxk">Round 1 vs round 2</p>${lxBars(['A','B','C'],lxCount(ans,'p2',3),lxCount(ans,'p1',3))}`:'<p class="lxsub">Press 1 or 2 to carry Client A or B</p>');
    const pe=$('#lxpick');if(pe){const pk=lxPk(),C=L.clients[pk];lxSetH(pe,`<span>We call first:</span><b>${C.ico} Client ${pk}: ${esc(C.name)}</b><small>Client ${lxOther(pk)} comes back in every step: “Remember Client ${lxOther(pk)}?”</small>${live?`<em class="lxke">👀 Keen Eye badge: ${LXD.ans.filter(x=>x.a&&x.a.p2===LX_KEEN).length} students spotted the secret VIP client</em>`:''}`)}}
  if(sl.k==='badge'){const e=$('#lxbc');if(e)e.textContent=P[LXD.s].t==='award'?(live?LXD.ans.filter(x=>x.a&&x.a.sfr).length+' badges received':'Badge awarded'):(live?'Press → to award the badge to '+lxJoined()+' students':'Press → to award the badge')}
  if(sl.k==='call')lxCallDraw(p);
  if(sl.k==='snap')lxSnapDraw(p);
  if(sl.k==='podium')lxPodDraw(p);
  if(sl.k==='clouds'){lxCloudInto($('#lxcw1'),lxWords(ans,'w1'));lxCloudInto($('#lxcw2'),lxWords(ans,'w2'))}}
function lxHands(A){if(A.kind==='words')return '<p class="lxsub">Ask five students for one word each. Write them on the board.</p>';
  if(A.kind==='rep')return `<ol class="lxhand">${A.opts.map(o=>`<li>${esc(o)}</li>`).join('')}</ol><p class="lxsub">Hands up for each. Then: salary or commission?</p>`;
  if(A.kind==='prospect')return '<p class="lxsub">Hands up: A, B or C?</p>';return ''}
function lxCloudHTML(w){if(!w.length)return '<p class="lxwaitt">Words appear here…</p>';const mx=w[0][1],L=w.slice();const ord=[];L.forEach((x,i)=>i%2?ord.push(x):ord.unshift(x));
  return ord.map(([t,c],i)=>{const s=.9+2.6*(c/mx);return `<span class="lxw" style="--s:${s.toFixed(2)};--d:${(i%7)*.08}s;--r:${((i*37)%9)-4}deg" data-w="${esc(t)}">${esc(t)}${c>1?`<sup>${c}</sup>`:''}</span>`}).join('')}
function lxBars(labels,v,prev){const tot=Math.max(1,v.reduce((a,b)=>a+b,0)),pt=prev?Math.max(1,prev.reduce((a,b)=>a+b,0)):1;
  return `<div class="lxbars">${labels.map((l,i)=>`<div class="lxbar1"><span>${esc(l)}</span><i>${prev?`<em style="width:${Math.round(prev[i]/pt*100)}%"></em>`:''}<b style="width:${Math.round(v[i]/tot*100)}%"></b></i><small>${Math.round(v[i]/tot*100)}%${prev?` <s>was ${Math.round(prev[i]/pt*100)}%</s>`:''}</small></div>`).join('')}</div>`}
function lxRepHTML(){const A=LXD.L.acts.rep,v=lxCount(LXD.ans,'rep',3,x=>x&&x.s),sl=LXD.ans.map(x=>x.a&&x.a.rep&&x.a.rep.v).filter(x=>x!=null),avg=sl.length?Math.round(sl.reduce((a,b)=>a+b,0)/sl.length):50;
  return `<div class="lxrep">${lxBars(['Territorial','Product','Customer'],v)}<div class="lxdial"><svg viewBox="0 0 200 120"><path d="M20 110 A80 80 0 0 1 180 110" class="t"/><line x1="100" y1="110" x2="100" y2="40" class="n" style="transform:rotate(${(avg-50)*1.8}deg)"/></svg><b>${100-avg}% salary · ${avg}% commission</b><small>class average</small></div></div>`}
function lxCallDraw(p){const L=LXD.L,pk=lxPk(),C=L.clients[pk],c=L.call[pk];const e=$('#lxcava');if(e&&!e.textContent){e.textContent=C.ico;$('#lxcn').textContent=pk==='A'?'Mr Tan':'T. M.';$('#lxcs2').textContent=C.who+', '+C.from}
  const mi=$('.lxmini');if(mi){const on=p.d!=null?[[3],[5],[6]][p.d]:p.end?[7]:p.t==='say'?[3]:[];mi.querySelectorAll('i').forEach((e,j)=>e.classList.toggle('on',on.includes(j+1)))}
  const w=$('#lxcw');if(w)w.textContent=p.d!=null?'Step: '+c.d[p.d].step:(p.t==='scene'?'Client '+pk+': '+C.name+'. Press → to start the call.':'');
  const res=$('#lxres');if(!res)return;const live=LXD.live;
  if(p.t==='open'){const D=c.d[p.d],n=LXD.ans.filter(x=>x.a&&x.a['c'+p.d]!=null).length;lxSetH(res,`<p class="lxk">📱 Vote now: ${esc(D.q)}</p><ol class="lxhand sm">${D.opts.map(o=>`<li>${esc(o.t)}</li>`).join('')}</ol>${live?`<p class="lxn"><b>${n}</b> voted of ${lxJoined()}</p>`:'<p class="lxsub">Hands up. Then press 1, 2 or 3 for the class choice.</p>'}`)}
  else if(p.t==='close'||p.t==='win'){const D=c.d[p.d],v=live?lxCount(LXD.ans,'c'+p.d,3):D.opts.map((o,i)=>i===LXD.won[p.d]?1:0);lxSetH(res,lxBars(D.opts.map(o=>o.t),v)+(LXD.won[p.d]!=null?`<p class="lxsub">Class choice: <b>${esc(D.opts[LXD.won[p.d]].t)}</b>${D.opts[LXD.won[p.d]].good?' ✅ value move':''}</p>`:''))}
  else if(p.end){const g=Object.keys(LXD.won).filter(d=>c.d[d].opts[LXD.won[d]].good).length;lxSetH(res,`<p class="lxsub"><b>${g} of 3</b> value moves. ${LXD.trust>=75?'The client trusts Maya. A strong relationship starts.':LXD.trust>=50?'The client is interested, but not sure yet.':'Trust was lost. Price moves rarely build relationships.'}</p>`)}
  else lxSetH(res,'');lxMeter()}
function lxMeter(){const m=$('#lxtm'),v=$('#lxtv');if(m){m.style.width=LXD.trust+'%';m.dataset.lv=LXD.trust>=70?'hi':LXD.trust>=45?'mid':'lo'}if(v)v.textContent=LXD.trust}
function lxBoard(){const n=LXD.L.snap.length,ms=LXD.L.acts.ln.ms;return LXD.ans.map(x=>Object.assign({id:x.id,n:x.n||'Player'},lxSnapScore(x.a,n,ms))).sort((a,b)=>b.s-a.s||a.t-b.t)}
function lxPodWrite(){if(!LXD.live)return;lxSet({pod:lxBoard().filter(x=>x.s>0).slice(0,5).map(x=>({n:x.n,s:x.s}))})}
function lxSnapDraw(p){const el=$('#lxsnap');if(!el)return;const L=LXD.L,n=LXD.short?6:L.snap.length;
  if(p.t==='intro'){lxSetH(el,`<p class="lxkick">LO 13.1 to 13.4 · Lightning round</p><h1 class="lxh xl">⚡ Term Snap</h1><p class="lxsub">The definition shows here. Tap the right term on your phone. Fast and right wins. ${n} rounds.</p><p class="lxhint">${LXD.short?'Short version: 6 rounds (press 6 for 8)':'Press 6 for the short version (6 rounds)'}</p>`);return}
  const it=L.snap[p.r],k='s'+p.r,got=LXD.ans.filter(x=>x.a&&x.a[k]),right=got.filter(x=>x.a[k].c===0).length;
  if(p.t==='open'){const tm=el.querySelector('#lxtimer');if(el.dataset.r!=='o'+p.r||!tm){el.dataset.r='o'+p.r;el._h=null;el.innerHTML=`<div class="lxsnr"><span class="lxk">Round ${p.r+1} of ${n}</span><span class="lxn"><b>${got.length}</b> answered${LXD.live?' of '+lxJoined():''}</span></div><p class="lxdefq">${esc(it.d)}</p>${LXD.live?'':`<ol class="lxhand">${it.o.map(o=>`<li>${esc(o)}</li>`).join('')}</ol>`}<div class="lxtimer big" id="lxtimer"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><circle class="v" cx="22" cy="22" r="19" pathLength="100"/></svg><b></b></div>`}const nn=el.querySelector('.lxn');if(nn)nn.innerHTML=`<b>${got.length}</b> answered${LXD.live?' of '+lxJoined():''}`;return}
  const B=lxBoard().slice(0,5),mx=Math.max(1,...B.map(x=>x.s));
  el.dataset.r='c'+p.r;lxSetH(el,`<div class="lxsnr"><span class="lxk">Round ${p.r+1} of ${n}</span><span class="lxn">${LXD.live?`<b>${right}</b> of ${got.length} right`:''}</span></div><p class="lxdefq sm">${esc(it.d)}</p><p class="lxans">✅ ${esc(it.o[0])}</p>
    ${LXD.live?`<ol class="lxlb">${B.map((x,i)=>`<li style="--d:${i*.08}s"><span>${i+1}</span><b>${esc(x.n)}</b><i><em style="width:${Math.round(x.s/mx*100)}%"></em></i><small>${x.s}</small></li>`).join('')}</ol>`:''}`)}
function lxPodDraw(p){const el=$('#lxpods');if(!el)return;const B=lxBoard().filter(x=>x.s>0).slice(0,3);
  lxSetH(el,LXD.live&&B.length?[1,0,2].filter(i=>B[i]).map(i=>`<div class="lxpd p${i}" style="--d:${i===0?.6:i===1?.3:0}s"><span>${['🥇','🥈','🥉'][i]}</span><b>${esc(B[i].n)}</b><small>${B[i].s} pts</small><i></i></div>`).join(''):'<p class="lxsub">Name the three fastest students from the show of hands.</p>');
  const a=$('#lxpaw');if(a)a.textContent=p.t==='award'?'🏅 Top Closer badge sent to the top 3':'Press → to award the Top Closer badge'}
function lxTick(){const t=$('#lxtimer');if(t){const left=LXD.tEnd?Math.max(0,LXD.tEnd-Date.now()):0;t.hidden=!LXD.tEnd;if(LXD.tEnd){const s=Math.ceil(left/1000);t.querySelector('b').textContent=s>=60?Math.floor(s/60)+':'+String(s%60).padStart(2,'0'):s;t.querySelector('.v').style.strokeDashoffset=100-100*left/(LXD.tDur*1000);t.classList.toggle('low',s<=5)}
    if(LXD.tEnd&&left<=0&&lxSl().k==='snap'){const P=lxPlan(lxSl());if(P[LXD.s].t==='open'){LXD.tEnd=0;lxGo(1)}}}
  if(LXD.notes)lxNoteDraw()}
/* the confetti burst on the projector (engine/cheer.js confetti, gold for the podium) */
function lxBoom(gold){const cv=$('#lxconf');if(!cv||typeof confetti!=='function'||(typeof calm==='function'&&calm()))return;confetti(cv,!!gold);setTimeout(()=>confetti(cv,!!gold),700)}

/* keys: → space PageDown next · ← PageUp back · F full screen · T theme · P presenter window · N notes strip · M mute · A replay ·
   + / − 30 seconds · 1 2 3 the class choice (offline) or the client to carry · 6 short Term Snap · E end the lecture */
function lxKey(e){if(!LXD.el||e.target.closest&&e.target.closest('input,textarea'))return;const k=e.key;
  if(['ArrowRight','PageDown',' ','Enter','ArrowDown'].includes(k)){e.preventDefault();lxGo(1)}
  else if(['ArrowLeft','PageUp','Backspace','ArrowUp'].includes(k)){e.preventDefault();lxGo(-1)}
  else if(k==='f'||k==='F'){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen().catch(()=>{})}
  else if(k==='t'||k==='T'){LXD.theme=LXD.theme==='light'?'dark':'light';LXD.el.dataset.lxt=LXD.theme;try{localStorage.setItem('lx_theme',LXD.theme)}catch(x){}}
  else if(k==='p'||k==='P')window.open('#/lecture/'+LXD.id+'/notes','lxnotes','width=720,height=520');
  else if(k==='n'||k==='N'){LXD.notes=!LXD.notes;$('#lxnote').hidden=!LXD.notes;lxNoteDraw()}
  else if(k==='m'||k==='M'){LXD.mute=!LXD.mute;Object.values(LXD.au).forEach(a=>a.muted=LXD.mute)}
  else if(k==='a'||k==='A'){const P=lxPlan(lxSl()),p=P[LXD.s];if(lxSl().k==='call'&&!LXD.busy&&(p.t==='say'||p.t==='win')){LXD.s--;lxGo(1)}}
  else if(k==='+'||k==='='){if(LXD.tEnd){LXD.tEnd+=30000;LXD.tDur+=30}}
  else if(k==='-'||k==='_'){if(LXD.tEnd)LXD.tEnd=Math.max(Date.now()+3000,LXD.tEnd-30000)}
  else if(k==='6'&&lxSl().k==='snap'&&LXD.s===0){LXD.short=!LXD.short;lxApply()}
  else if(['1','2','3'].includes(k)){const sl=lxSl(),p=lxPlan(sl)[LXD.s];
    if(sl.k==='call'&&p.t==='close'){LXD.over['c'+p.d]=+k-1;LXD.won[p.d]=+k-1;lxApply()}
    else if((sl.k==='qualify'||sl.k==='prospects')&&k!=='3'){LXD.over.pick=k==='1'?'A':'B';lxSet({pick:LXD.over.pick});lxApply()}}
  else if(k==='e'||k==='E'){if(confirm('End the live lecture now? Phones stop taking answers.'))lxSet({st:'ended',cur:null,ph:'closed',show:false})}}
function lxAction(x){if(x==='next')lxGo(1)}

/* ---------- presenter notes (strip on the deck with N, or the window with P) ---------- */
function lxPace(){const sl=lxSl(),el=LXD.t0?(Date.now()-LXD.t0)/60000:0,d=LXD.t0?el-sl.m:0;return {el,d,txt:LXD.t0?`${Math.floor(el)} min in · plan ${sl.m} min · ${d>5?'⚠ '+Math.round(d)+' min behind':d<-5?Math.round(-d)+' min ahead':'on time'}`:'Not started',lv:d>8?'hi':d>4?'mid':'ok'}}
function lxNoteDraw(){const el=$('#lxnote');if(!el||el.hidden)return;const sl=lxSl(),nx=LXD.L.slides[LXD.i+1],pc=lxPace();el.innerHTML=`<b>${esc(sl.n||'')}</b><span class="pc ${pc.lv}">${pc.txt}</span><span>Next: ${esc(nx?(nx.t||nx.term||(nx.act&&LXD.L.acts[nx.act].title)||nx.k):'End')}</span>`}
function lxPost(){if(!LXD.bc)return;const sl=lxSl(),nx=LXD.L.slides[LXD.i+1],pc=lxPace(),P=lxPlan(sl);
  try{LXD.bc.postMessage({i:LXD.i,n:LXD.L.slides.length,s:LXD.s,ns:P.length,note:sl.n||'',t:sl.t||sl.term||(sl.act&&LXD.L.acts[sl.act].q)||sl.k,next:nx?(nx.t||nx.term||(nx.act&&LXD.L.acts[nx.act].title)||nx.k):'End',pace:pc.txt,lv:pc.lv,joined:lxJoined(),live:LXD.live})}catch(e){}}
setInterval(()=>{if(LXD.el)lxPost()},5000);
function lxNotes(id){if(ME.sid!==LECTURER)return lxPhone(id);shell('#/lecturer',`<div data-lect class="lxpres"><h1>🎤 Presenter view</h1><p class="muted">Keep this window on your laptop screen and the deck on the projector. Both must be open in the same browser.</p>
  <div class="card"><p class="lxk" id="lxpn">Waiting for the deck…</p><h2 id="lxpt"></h2><p class="lxpnote" id="lxpnn"></p><p id="lxpp" class="pc"></p><p class="muted" id="lxpx"></p>
  <div class="row"><button class="btn ghost" id="lxpb">← Back</button><button class="btn" id="lxpf">Next →</button></div></div>
  <div class="card" style="margin-top:12px"><h3>Keys on the deck</h3><p class="muted" style="font-size:.9rem">→ / Space / clicker: next · ←: back · F: full screen · T: light or dark · N: notes strip · M: mute voices · A: replay the last voice · + / −: 30 seconds on the timer · 1 2 3: the class choice when offline, or which client to carry · 6: short Term Snap · E: end the lecture</p></div></div>`);
  let bc;try{bc=new BroadcastChannel('lx-'+id)}catch(e){return}LX.stops.push(()=>bc.close());bc.postMessage('hello');
  bc.onmessage=e=>{const d=e.data;if(!d||typeof d!=='object')return;$('#lxpn').textContent=`Slide ${d.i+1} of ${d.n} · step ${d.s+1} of ${d.ns}${d.live?' · ● live, '+d.joined+' joined':''}`;$('#lxpt').textContent=d.t;$('#lxpnn').textContent=d.note;const pp=$('#lxpp');pp.textContent=d.pace;pp.className='pc '+d.lv;$('#lxpx').textContent='Next: '+d.next};
  $('#lxpf').onclick=()=>bc.postMessage('next');$('#lxpb').onclick=()=>bc.postMessage('prev')}
