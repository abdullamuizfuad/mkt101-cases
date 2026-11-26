/* MKT101 Arena: course marks card (course code). Always shown at the top of Home for a student who has marks.
   Data: the student's own private record reviews/{SID}.m['cm_<term>'] (tools/build-marks.py → tools/marks/upload.mjs). Only that
   student and the lecturer can read it, so nothing is in the public repo and no PIN is needed. engine/core.js applyMarks hands
   cm_ keys to cmSet(); View as student passes the student's record in U._cm (never saved).
   The lecturer's decision: this card may name the midterm and the final exam (an exception to the no-exam-wording rule).
   Record: {n, g, mt /60|null, mtw /20, rp /20, pr /10, tot /50, pass /100, hd /100|"NR", st Present|Absent|Not listed, nog 1 = no group} */
let CM=null;
const cmLS=()=>'mkt101_cm_'+(ME&&ME.sid||'');
function cmSet(key,v){if(!v||typeof v!=='object'||typeof ME==='undefined'||!ME)return;CM=v;try{localStorage.setItem(cmLS(),JSON.stringify(v))}catch(e){}
  const el=document.getElementById('cmcard');if(el)el.outerHTML=cmHTML(v);else if(!location.hash.replace(/^#\/?/,'')&&typeof route==='function')route()}
function cmRec(){if(typeof ME==='undefined'||!ME||ME.sid===LECTURER&&!VIEWAS||ME.sid==='S000000')return null;if(VIEWAS)return U&&U._cm||null;
  if(!CM){try{CM=JSON.parse(localStorage.getItem(cmLS())||'null')}catch(e){}}return CM}
function homeTopHTML(){const r=cmRec();return r?cmHTML(r):''}
const cmF=x=>x==null?'–':Number(x).toFixed(2);
const cmR=x=>x==null?'–':String(Math.round(x*10)/10);
function cmCss(){if(document.getElementById('cmcss'))return;const st=document.createElement('style');st.id='cmcss';st.textContent=
 '#cmcard{margin-bottom:16px;padding:12px 14px}.cmtop{display:flex;align-items:center;gap:8px;width:100%;margin:0 0 4px;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}.cmtop small{margin-left:auto}'+
 '.cmarr{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--sunk);font-size:.9rem;transition:transform .2s}#cmcard.open .cmarr{transform:rotate(180deg)}'+
 '.cmhint{margin:6px 0 0;font-size:.74rem;color:var(--blue);font-weight:600;text-align:center;cursor:pointer}#cmcard .cmbar{cursor:pointer}#cmmore{margin-top:8px}'+
 '@media (prefers-reduced-motion:reduce){.cmarr{transition:none}}'+
 '.cmtop b{font:700 1rem Lexend,sans-serif}.cmtop small{color:var(--muted);font-size:.78rem}'+
 '.cm3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.cmm{border:1px solid var(--line);border-radius:10px;padding:7px 8px;min-width:0}'+
 '.cmm small{color:var(--muted);font-size:.72rem}.cmm b{display:block;font:700 1.05rem Lexend,sans-serif;margin:1px 0 4px;white-space:nowrap}.cmm b span{font-size:.68rem;font-weight:500;color:var(--muted)}'+
 '.cmm .bar{height:5px;border-radius:9px;background:var(--sunk);overflow:hidden}.cmm .bar i{display:block;height:100%;border-radius:9px}.cmm .raw{font-size:.7rem;color:var(--muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cmm.abs b{color:var(--gold);font-size:.9rem}'+
 '.cmt{margin-top:10px}.cmt .row{justify-content:space-between;align-items:baseline}.cmt .row>b{font-size:.92rem}.cmt b.big{font:800 1.2rem Lexend,sans-serif}'+
 '.cmbar{position:relative;height:14px;border-radius:5px;background:repeating-linear-gradient(135deg,var(--sunk) 0 6px,var(--line) 6px 9px);border:1px solid var(--line);margin:20px 0 4px}'+
 '.cmbar>i{position:absolute;left:0;top:0;bottom:0;border-radius:4px 0 0 4px}.cmbar .gap{position:absolute;top:0;bottom:0;left:0;width:50%;background:var(--card);border-radius:4px 0 0 4px}'+
 '.cmk{position:absolute;top:-3px;bottom:-3px;border-left:2px dashed}.cmk span{position:absolute;top:-17px;transform:translateX(-50%);font-size:.7rem;font-weight:700;white-space:nowrap}'+
 '.cmk.p{border-color:#16a34a;color:#16a34a}.cmk.h{border-color:#d97706;color:#b45309}.cmlbl{display:flex;justify-content:space-between;font-size:.7rem;color:var(--muted)}'+
 '.cm2{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}.cmg{border-radius:10px;padding:7px 9px;line-height:1.25}.cmg small{font-size:.74rem;font-weight:700}.cmg b{font:800 1.2rem Lexend,sans-serif}.cmg b span{font-size:.72rem;font-weight:500}.cmg p{margin:1px 0 0;font-size:.7rem}'+
 '.cmg.p{background:rgba(22,163,74,.12);border:1px solid rgba(22,163,74,.35);color:#15803d}.cmg.h{background:linear-gradient(135deg,rgba(250,204,21,.22),rgba(217,119,6,.14));border:1px solid rgba(217,119,6,.55);color:#a16207}.cmg.h.nr b{font-size:.86rem;font-weight:700}'+
 '.cmg .stars{color:#f59e0b;text-shadow:0 0 6px rgba(250,204,21,.6);font-size:.7rem;letter-spacing:1px;margin-left:2px}.gflag{color:#16a34a}'+
 ':root[data-theme="dark"] .cmg.p,:root[data-theme="dark"] .gflag{color:#4ade80}:root[data-theme="dark"] .cmg.h{color:#fcd34d}:root[data-theme="dark"] .cmk.p{color:#4ade80;border-color:#4ade80}:root[data-theme="dark"] .cmk.h{color:#fcd34d;border-color:#fcd34d}'+
 '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .cmg.p,:root:not([data-theme="light"]) .gflag{color:#4ade80}:root:not([data-theme="light"]) .cmg.h{color:#fcd34d}:root:not([data-theme="light"]) .cmk.p{color:#4ade80;border-color:#4ade80}:root:not([data-theme="light"]) .cmk.h{color:#fcd34d;border-color:#fcd34d}}'+
 '.cmfoot{font-size:.68rem;color:var(--muted);margin:6px 0 0}';document.head.appendChild(st)}
function cmHTML(r){cmCss();const abs=r.st!=='Present',col=f=>`hsl(${Math.round(48+Math.max(0,Math.min(1,f))*82)},70%,45%)`;
  const mini=(t,v,mx,raw,rawMx,ok,why)=>ok?`<div class="cmm"><small>${t}</small><b>${cmF(v)}<span> /${mx}%</span></b><div class="bar"><i style="width:${Math.max(0,Math.min(100,v/mx*100))}%;background:${col(v/mx)}"></i></div><div class="raw">Raw ${cmR(raw)}/${rawMx}</div></div>`
    :`<div class="cmm abs"><small>${t}</small><b>${why[0]}</b><div class="raw" title="${why[1]}">${why[1]}</div></div>`;
  const tot=r.tot||0,hd=r.hd==='NR'||r.hd==null?null:r.hd;
  const open=cmOpen();
  return `<div class="card${open?' open':''}" id="cmcard" role="region" aria-label="My marks"><button type="button" class="cmtop" id="cmtg" aria-expanded="${open}" aria-controls="cmmore"><b>📊 My marks</b><small>${r.g?'Group '+esc(String(r.g))+' · ':''}${esc(r.term||'T2 2026')}</small><span class="cmarr" aria-hidden="true">▾</span></button>
    <div class="cmt"><div class="row"><b>Subject total so far</b><span><b class="big">${cmF(tot)}</b> <span class="muted">/ 100%</span></span></div>
   <div class="cmbar" role="img" aria-label="Earned ${cmF(tot)} of the 50% so far; the final exam is the other 50%. Pass line 50, HD line 85."><span class="gap"></span><i style="width:${Math.max(0,Math.min(50,tot))}%;background:${col(tot/50)}"></i>
    <span class="cmk p" style="left:50%"><span>Pass 50</span></span><span class="cmk h" style="left:85%"><span>HD 85</span></span></div>
   <div class="cmlbl"><span>Earned so far (of 50%)</span><span>Final exam to come (50%)</span></div></div>
  <p class="cmhint" id="cmhint"${open?' hidden':''}>Tap for your marks and what you need on the final ▾</p>
  <div id="cmmore"${open?'':' hidden'}><div class="cm3">${mini('Midterm',r.mtw,20,r.mt,60,!abs,r.st==='Absent'?['Absent','Ask about a resit']:['Not recorded','Ask your lecturer'])}
   ${mini('Report',r.rp,20,r.rp!=null?r.rp/20*70:null,70,!r.nog,['No mark yet','No group yet'])}
   ${mini('Presentation',r.pr,10,r.pr!=null?r.pr/10*50:null,50,!r.nog,['No mark yet','No group yet'])}</div>
  <div class="cm2"><div class="cmg p"><small>🎯 To pass <span class="gflag" aria-hidden="true">⚑</span> 😊</small><div><b>${cmR(r.pass)}<span> / 100</span></b></div><p>on the final exam${abs?' (midterm counted as 0 until a resit)':''}</p></div>
   <div class="cmg h${hd==null?' nr':''}"><small>🏆 For an HD 🎉<span class="stars" aria-hidden="true">★★★</span></small>${hd==null?'<div><b>Out of reach this term</b></div><p>A strong final still raises your grade.</p>':`<div><b>${cmR(hd)}<span> / 100</span></b></div><p>on the final exam (85% overall)</p>`}</div></div>
  <p class="cmfoot">ⓘ Provisional until confirmed by the Business School.</p></div></div>`}
/* collapsed by default; the choice is remembered on this device */
const cmOpen=()=>{try{return localStorage.getItem('mkt101_cm_open')==='1'}catch(e){return false}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#cmtg,#cmhint,#cmcard .cmbar');if(!b)return;const c=document.getElementById('cmcard');if(!c)return;
  const open=!c.classList.contains('open');c.classList.toggle('open',open);const t=document.getElementById('cmtg');if(t)t.setAttribute('aria-expanded',open);
  const m=document.getElementById('cmmore');if(m)m.hidden=!open;const h=document.getElementById('cmhint');if(h)h.hidden=open;try{localStorage.setItem('mkt101_cm_open',open?'1':'0')}catch(err){}});
onHook('signout',()=>{CM=null});
