/* MKT101 Arena: hands-on case activities (classify, builder, channel, atmosphere, intensity, order, grid, claims, argument builder).
   Ported from the original MKT101 case pages; class names carry an "a" prefix so they do not clash with the arena styles. */
function barsHTML(arr){return `<div class="bars">${arr.map(([l,v])=>`<div class="barr"><span>${esc(l)}</span><i><b style="width:${v*20}%"></b></i></div>`).join('')}</div>`}
/* ---------- renderers ---------- */
const R={};
const head=cfg=>(cfg.title?`<h3>${esc(cfg.title)}</h3>`:'')+(cfg.intro?`<p class="aintro">${esc(cfg.intro)}</p>`:'');

/* classify: choose one category per item */
R.classify=(el,cfg,st,save)=>{
 st.sel=st.sel||{};
 const draw=()=>{el.innerHTML=head(cfg)+cfg.items.map((it,i)=>`<div class="aitem" data-i="${i}"><p class="it">${esc(it.t)}</p>${it.bars?barsHTML(it.bars):''}<div class="aopts">${cfg.cats.map((c,ci)=>`<button class="aopt" data-ci="${ci}" aria-pressed="${st.sel[i]===c}">${esc(c)}</button>`).join('')}</div><p class="fbk" hidden></p></div>`).join('')+`<div class="arow"><button class="abtn aprim" data-a="chk">Check answers</button><button class="abtn" data-a="rst">Start again</button><span class="ascore" aria-live="polite"></span></div>`};
 draw();
 el.onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.ci!==undefined){const it=b.closest('.aitem');const i=it.dataset.i;st.sel[i]=cfg.cats[b.dataset.ci];save();
   $$('.aopt',it).forEach(x=>x.setAttribute('aria-pressed',x===b));const f=$('.fbk',it);f.hidden=true;$('.ascore',el).textContent='';}
  else if(b.dataset.a==='rst'){st.sel={};save();draw();}
  else if(b.dataset.a==='chk'){let ok=0;cfg.items.forEach((it,i)=>{const f=$(`.aitem[data-i="${i}"] .fbk`,el);f.hidden=false;const s=st.sel[i];
    if(!s){f.className='fbk info';f.textContent='Choose an answer first.';return}
    if(it.ok.includes(s)){ok++;f.className='fbk good';f.textContent='✓ '+(it.ok.length>1?`Good. Accepted: ${it.ok.join(' or ')}. `:'')+it.why}
    else{f.className='fbk bad';f.textContent=`✗ Not quite. Best fit: ${it.ok.join(' or ')}. ${it.why}`}});
   $('.ascore',el).textContent=`${ok} of ${cfg.items.length} correct`;}
 };
};

/* builder: choose one option per section, assemble a plan card */
/* Options are written strong first in the data. Show them in a fixed mixed order (by a hash of the text),
   so the position does not give the answer away. data-oi keeps the original index. */
const mixed=opts=>opts.map((o,oi)=>[o,oi]).sort((x,y)=>{const h=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,7);return h(x[0].t)-h(y[0].t)});
R.builder=(el,cfg,st,save)=>{
 st.sel=st.sel||{};
 const draw=()=>{
  el.innerHTML=head(cfg)+cfg.sections.map((s,si)=>`<div class="asec" data-si="${si}"><h4>${esc(s.label)}</h4><div class="aopts col">${mixed(s.opts).map(([o,oi])=>`<button class="aopt" data-oi="${oi}" aria-pressed="${st.sel[s.k]===oi}">${esc(o.t)}</button>`).join('')}</div><p class="fbk" hidden></p></div>`).join('')+
  `<div class="aplan" aria-live="polite"><h4>${esc(cfg.cardTitle||'Your plan')}</h4><div class="pc"></div></div>
  <div class="arow"><button class="abtn aprim" data-a="chk">Check my choices</button>${cfg.tests?'<button class="abtn" data-a="test">Run stress tests</button>':''}<button class="abtn" data-a="rst">Start again</button></div>
  <div class="tests"></div>`;card();};
 const card=()=>{$('.pc',el).innerHTML=cfg.sections.map(s=>`<p><b>${esc(s.label)}:</b> ${st.sel[s.k]!==undefined?esc(s.opts[st.sel[s.k]].t):'<span style="color:var(--mute)">not chosen yet</span>'}</p>`).join('')};
 draw();
 el.onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.oi!==undefined){const sec=b.closest('.asec');const s=cfg.sections[sec.dataset.si];st.sel[s.k]=+b.dataset.oi;save();
   $$('.aopt',sec).forEach(x=>x.setAttribute('aria-pressed',x===b));$('.fbk',sec).hidden=true;$('.tests',el).innerHTML='';card();}
  else if(b.dataset.a==='rst'){st.sel={};save();draw();}
  else if(b.dataset.a==='chk'){cfg.sections.forEach((s,si)=>{const f=$(`.asec[data-si="${si}"] .fbk`,el);f.hidden=false;const v=st.sel[s.k];
    if(v===undefined){f.className='fbk info';f.textContent='Choose an option for this part.';return}
    const o=s.opts[v];f.className='fbk '+(o.q==='good'?'good':'warn');f.textContent=(o.q==='good'?'✓ Strong choice. ':'⚠ Rethink this. ')+o.fb;});}
  else if(b.dataset.a==='test'){const box=$('.tests',el);
   if(cfg.sections.some(s=>st.sel[s.k]===undefined)){box.innerHTML='<p class="fbk info">Choose an option for every part first.</p>';return}
   box.innerHTML=cfg.tests.map(t=>{const p=t.pass(st.sel);return `<p class="fbk ${p?'good':'warn'}"><b>${esc(t.n)}:</b> ${esc(p?t.ok:t.fail)}</p>`}).join('');}
 };
};

/* channel builder */
R.channel=(el,cfg,st,save)=>{
 st.ch=st.ch||{};st.r=st.r||0;
 const lvl=n=>n===0?'Direct channel (zero-level)':n===1?'One-level channel':`${['','','Two','Three','Four'][n]||n}-level channel`;
 const draw=(msg)=>{const r=cfg.routes[st.r];const ch=st.ch[st.r]||[];const ok=JSON.stringify(ch)===JSON.stringify(r.expect);const showP=msg&&ok&&r.showPrice;
  el.innerHTML=head(cfg)+`<div class="rtabs">${cfg.routes.map((x,i)=>`<button class="aopt" data-r="${i}" aria-pressed="${i===st.r}">${esc(x.name)}</button>`).join('')}</div>
  <p class="aintro" style="margin-bottom:8px"><b>Customer:</b> ${esc(r.who)}</p>
  <div class="chain"><span class="node end">STO${showP?`<small>MVR ${cfg.prices.STO}</small>`:''}</span>${ch.map((x,i)=>`<span class="arrow">→</span><button class="node mid" data-rm="${i}" title="Remove">${esc(x)}${showP?`<small>MVR ${cfg.prices[x]}</small>`:''}</button>`).join('')}<span class="arrow">→</span><span class="node end">Customer${showP?`<small>pays MVR ${cfg.prices[ch[ch.length-1]]||cfg.prices.STO}</small>`:''}</span></div>
  <div class="alvl" aria-live="polite">${lvl(ch.length)} · ${ch.length} intermediar${ch.length===1?'y':'ies'}</div>
  <p class="aintro" style="margin:14px 0 6px">Add a business to the chain:</p>
  <div class="aopts">${cfg.palette.map((p,i)=>`<button class="aopt" data-add="${i}">+ ${esc(p)}</button>`).join('')}</div>
  <div class="arow"><button class="abtn aprim" data-a="chk">Check this route</button><button class="abtn" data-a="clr">Clear route</button><span class="ascore">${cfg.routes.filter((x,i)=>JSON.stringify(st.ch[i]||[])===JSON.stringify(x.expect)&&st['ok'+i]).length} of ${cfg.routes.length} routes checked</span></div>
  ${msg?`<p class="fbk ${ok?'good':'bad'}">${ok?'✓ '+esc(r.note):'✗ Not quite. Re-read the case and Exhibit 2. Which businesses does the product pass through on this route, and in what order?'}</p>`:''}`;};
 draw();
 el.onclick=e=>{const b=e.target.closest('button');if(!b)return;const ch=st.ch[st.r]=st.ch[st.r]||[];
  if(b.dataset.r!==undefined){st.r=+b.dataset.r;save();draw();}
  else if(b.dataset.add!==undefined){const p=cfg.palette[b.dataset.add];if(!ch.includes(p))ch.push(p);st['ok'+st.r]=false;save();draw();}
  else if(b.dataset.rm!==undefined){ch.splice(+b.dataset.rm,1);st['ok'+st.r]=false;save();draw();}
  else if(b.dataset.a==='clr'){st.ch[st.r]=[];st['ok'+st.r]=false;save();draw();}
  else if(b.dataset.a==='chk'){const r=cfg.routes[st.r];st['ok'+st.r]=JSON.stringify(ch)===JSON.stringify(r.expect);save();draw(true);}
 };
};

/* atmosphere designer */
R.atmos=(el,cfg,st,save)=>{
 st.sel=st.sel||cfg.controls.map(()=>0);
 const max=cfg.controls.reduce((a,c)=>a+Math.max(...c.opts.map(o=>o.s)),0);
 const draw=()=>{const sc=cfg.controls.reduce((a,c,i)=>a+c.opts[st.sel[i]].s,0);const pct=Math.round(sc/max*100);
  const label=pct<=30?'Practical and everyday':pct<70?'Mixed signals':'Premium and curated';
  const left=cfg.controls.filter((c,i)=>st.sel[i]===0).map(c=>c.k.toLowerCase());
  const senses=[...new Set(cfg.controls.filter((c,i)=>c.opts[st.sel[i]].s>0).map(c=>c.sense))];
  el.innerHTML=head(cfg)+cfg.controls.map((c,i)=>`<div class="ctrl"><div class="lab">${esc(c.k)}<small>${esc(c.sense)}</small></div><div class="aopts">${c.opts.map((o,oi)=>`<button class="aopt" data-c="${i}" data-o="${oi}" aria-pressed="${st.sel[i]===oi}">${esc(o.t)}</button>`).join('')}</div></div>`).join('')+
  `<div style="margin-top:16px"><b>What your corner says: ${label}</b>
   <div class="meter" role="img" aria-label="${label}, ${pct} percent premium"><i style="left:${Math.max(2,Math.min(98,pct))}%"></i></div>
   <div class="mlab"><span>Practical and everyday</span><span>Premium and curated</span></div></div>
  <p class="fbk ${pct>=70?'good':pct>30?'warn':'info'}">${pct===100?'Every cue signals premium. Now think about what should stay the same so it still feels like STO: bilingual signs, easy movement, friendly service.':pct>=70?`Strong premium feel. These cues still say “everyday”: ${left.join(', ')}. Is that on purpose?`:pct>30?`Mixed signals. Shoppers may be unsure what this corner is for. Still everyday: ${left.join(', ')}.`:'This looks like the rest of People’s Choice. Change some cues to make the corner feel premium.'}${senses.length?` Senses you are using: ${senses.join(', ')}.`:''}</p>
  <div class="tbl" style="margin-top:12px"><table><tr><th>Cue</th><th>Main store</th><th>Your STO Select corner</th></tr>${cfg.controls.map((c,i)=>`<tr><td>${esc(c.k)}</td><td>${esc(c.opts[0].t)}</td><td>${esc(c.opts[st.sel[i]].t)}</td></tr>`).join('')}</table></div>
  <div class="arow"><button class="abtn" data-a="rst">Start again</button></div>`;};
 draw();
 el.onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.c!==undefined){st.sel[+b.dataset.c]=+b.dataset.o;save();draw();}
  else if(b.dataset.a==='rst'){st.sel=cfg.controls.map(()=>0);save();draw();}};
};

/* distribution intensity */
R.intensity=(el,cfg,st,save)=>{
 st.sel=st.sel||{};const L=Object.keys(cfg.levels);const tag={strong:['good','✓ Strong choice. '],possible:['warn','~ Possible. '],weak:['bad','✗ Weak choice. ']};
 const draw=()=>{el.innerHTML=head(cfg)+cfg.items.map((it,i)=>{const s=st.sel[i];const f=s&&it.fb[s];
  return `<div class="aitem" data-i="${i}"><p class="it" style="font-weight:700">${esc(it.t)}</p><p class="aintro" style="margin:0 0 8px">${esc(it.d)}</p>
  <div class="aopts">${L.map(l=>`<button class="aopt" data-l="${l}" aria-pressed="${s===l}">${l}</button>`).join('')}</div>
  ${s?barsHTML(cfg.levels[s])+`<p class="fbk ${tag[f[0]][0]}">${tag[f[0]][1]}${esc(f[1])}</p>`:''}</div>`}).join('')+
  `<div class="arow"><button class="abtn" data-a="rst">Start again</button></div>`;};
 draw();
 el.onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.l){st.sel[b.closest('.aitem').dataset.i]=b.dataset.l;save();draw();}
  else if(b.dataset.a==='rst'){st.sel={};save();draw();}};
};

/* order the selling process */
R.order=(el,cfg,st,save)=>{
 st.o=st.o||cfg.start.slice();st.cmp=!!st.cmp;
 const draw=(chk)=>{const allOk=st.o.every((x,i)=>x===i);
  el.innerHTML=head(cfg)+st.o.map((si,pos)=>{const s=cfg.steps[si];const ok=chk&&si===pos;
   return `<div class="orow ${chk?(ok?'ok':'no'):''}"><span class="apos">${pos+1}</span><div>${ok||st.cmp&&chk&&allOk?`<span class="sn">${esc(s.n)}</span>`:''}${esc(s.m)}${st.cmp?`<span class="tr">Transactional seller: ${esc(s.tr)}</span>`:''}</div>
   <div class="mv"><button data-up="${pos}" aria-label="Move up" ${pos===0?'disabled':''}>↑</button><button data-dn="${pos}" aria-label="Move down" ${pos===st.o.length-1?'disabled':''}>↓</button></div></div>`}).join('')+
  `<div class="arow"><button class="abtn aprim" data-a="chk">Check order</button><button class="abtn" data-a="cmp" aria-pressed="${st.cmp}">${st.cmp?'Hide':'Show'} transactional seller</button><button class="abtn" data-a="rst">Shuffle again</button>
  ${chk?`<span class="ascore">${st.o.filter((x,i)=>x===i).length} of ${st.o.length} in the right place</span>`:''}</div>
  ${chk&&allOk?'<p class="fbk good">✓ All seven steps in order. Each step now shows its name. Which two steps do the most to build a long-term relationship?</p>':''}`;};
 draw();
 el.onclick=e=>{const b=e.target.closest('button');if(!b||b.disabled)return;
  const sw=(a,c)=>{[st.o[a],st.o[c]]=[st.o[c],st.o[a]];save();draw();};
  if(b.dataset.up!==undefined){const p=+b.dataset.up;sw(p,p-1);}
  else if(b.dataset.dn!==undefined){const p=+b.dataset.dn;sw(p,p+1);}
  else if(b.dataset.a==='chk')draw(true);
  else if(b.dataset.a==='cmp'){st.cmp=!st.cmp;save();draw();}
  else if(b.dataset.a==='rst'){st.o=cfg.start.slice();save();draw();}};
};

/* 2x2 grid placement */
R.grid=(el,cfg,st,save)=>{
 st.p=st.p||{};let pick=null;
 const draw=(chk)=>{const tray=cfg.items.map((it,i)=>i).filter(i=>!st.p[i]);
  const chip=i=>{const it=cfg.items[i];const cls=chk&&st.p[i]?(st.p[i]===it.q?'ok':'no'):'';return `<button class="pchip ${cls}" data-it="${i}" aria-pressed="${pick===i}">${esc(it.t)}</button>`};
  el.innerHTML=head(cfg)+`<div class="tray" aria-label="Products to place">${tray.length?tray.map(chip).join(''):'<span class="aintro" style="margin:0">All products placed.</span>'}</div>
  <div class="gwrap"><div class="yax">Long-run benefit: low → high</div><div class="aboard">${cfg.quads.map(q=>`<div class="quad" data-q="${esc(q.n)}" role="button" tabindex="0"><b>${esc(q.n)}</b><small>${esc(q.d)}</small>${cfg.items.map((it,i)=>st.p[i]===q.n?chip(i):'').join('')}</div>`).join('')}</div><div class="xax">Satisfaction right now: low → high</div></div>
  <div class="arow"><button class="abtn aprim" data-a="chk">Check grid</button><button class="abtn" data-a="rst">Start again</button>${chk?`<span class="ascore">${cfg.items.filter((it,i)=>st.p[i]===it.q).length} of ${cfg.items.length} correct</span>`:''}</div>
  ${chk?`<div>${cfg.items.filter((it,i)=>st.p[i]&&st.p[i]!==it.q).map(it=>`<p class="fbk bad">✗ “${esc(it.t)}” belongs in <b>${esc(it.q)}</b>.</p>`).join('')}</div>`:''}`;};
 draw();
 const place=q=>{if(pick===null)return;st.p[pick]=q;pick=null;save();draw();};
 el.onclick=e=>{const ch=e.target.closest('.pchip');
  if(ch){const i=+ch.dataset.it;if(st.p[i]&&pick===null){delete st.p[i];save();draw();return}pick=pick===i?null:i;draw();return}
  const q=e.target.closest('.quad');if(q){place(q.dataset.q);return}
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.a==='chk')draw(true);else if(b.dataset.a==='rst'){st.p={};pick=null;save();draw();}};
 el.onkeydown=e=>{const q=e.target.closest('.quad');if(q&&(e.key==='Enter'||e.key===' ')){e.preventDefault();place(q.dataset.q)}};
};

/* claim checker */
R.claims=(el,cfg,st,save)=>{
 st.t=st.t||{};st.show=!!st.show;
 const lab=n=>n>=3?'Credible':n===2?'Weak':'Greenwashing risk';
 const draw=()=>{el.innerHTML=head(cfg)+cfg.claims.map((c,i)=>{const t=st.t[i]||[0,0,0,0];const n=t.filter(Boolean).length;
  return `<div class="claim" data-i="${i}"><div class="awho">${esc(c.who)}</div><p class="ct">“${esc(c.t)}”</p>
  <div class="crit">${cfg.crit.map((k,ki)=>`<button class="aopt" data-k="${ki}" aria-pressed="${!!t[ki]}">${esc(k)}</button>`).join('')}</div>
  <div class="gauge"><span class="aseg">${[0,1,2,3].map(x=>`<i class="${x<n?'on':''}"></i>`).join('')}</span><span>${lab(n)}</span></div>
  ${st.show?`<p class="sugg">Suggested: ${cfg.crit.filter((k,ki)=>c.s[ki]).map(k=>k.split(':')[0]).join(', ')||'none of the tests'} → <b>${lab(c.s.filter(Boolean).length)}</b>. ${esc(c.why)}</p>`:''}</div>`}).join('')+
  `<div class="arow"><button class="abtn aprim" data-a="show">${st.show?'Hide':'Show'} suggested ticks</button><button class="abtn" data-a="rst">Start again</button></div>`;};
 draw();
 el.onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.k!==undefined){const i=b.closest('.claim').dataset.i;const t=st.t[i]=st.t[i]||[0,0,0,0];t[+b.dataset.k]=t[+b.dataset.k]?0:1;save();draw();}
  else if(b.dataset.a==='show'){st.show=!st.show;save();draw();}
  else if(b.dataset.a==='rst'){st.t={};st.show=false;save();draw();}};
};

/* Defaults for every activity's argument builder (a.arg). An activity gives its own steps, and may override rows or intro. */
const ARGUE={intro:'Build a short answer from parts of the case. Tap chips in each step, then check. Some chips are weak, so choose with care.',
 bands:[[5,'Excellent','good'],[3,'Moderate','warn'],[0,'Needs work','bad']],
 rows:[
  {n:'Key ideas',tip:['Name and define the marketing idea. Read the notes for this topic if you are not sure.','One idea is missing or not quite right. Check the definitions.','The key ideas are named and defined correctly.']},
  {n:'Case evidence',tip:['Use facts from the case, not opinions. Read the case again.','Use at least two specific case facts, and take out any vague or off-topic ones.','Strong, specific evidence from the case.']},
  {n:'Analysis',tip:['Choose points that answer the question, and give a reason for each.','Nearly there. Check that every reason links back to the question.','Clear analysis. Each reason links the idea to the case.']}]};

/* argument builder: pick chips in each step to build an answer. Each step scores one rubric row
   (cfg.rows) from 0 to 2: full marks need `need` good chips and no weak ones. The total gives a band.
   Stars: 1 for the middle band, 2 for the top band, 3 for the top band on the first check. */
R.argue=(el,cfg,st,save)=>{
 st.p=st.p||{};st.best=st.best||0;st.tries=st.tries||0;
 const picks=si=>st.p[si]||[];
 const rowScore=ri=>{const ss=cfg.steps.map((s,si)=>[s,si]).filter(([s])=>s.row===ri);const need=ss.reduce((a,[s])=>a+s.need,0);let g=0,w=0;
  ss.forEach(([s,si])=>picks(si).forEach(oi=>s.opts[oi].s==='good'?g++:w++));return g>=need&&!w?2:g>=Math.ceil(need/2)?1:0};
 const max=cfg.rows.length*2,band=t=>cfg.bands.find(x=>t>=x[0]);
 const stars=n=>`<span class="stars" aria-label="${n} of 3 stars">${'★'.repeat(n)}${'☆'.repeat(3-n)}</span>`;
 const draw=(chk,msg)=>{const sc=cfg.rows.map((r,ri)=>rowScore(ri)),tot=sc.reduce((a,x)=>a+x,0),bd=band(tot);
  el.innerHTML=head(cfg)+`<div class="aarg">${cfg.steps.map((s,si)=>`<div class="asec" data-si="${si}"><h4>${si+1}. ${esc(s.label)} <small>${s.max===1?'pick one':'pick up to '+s.max}</small></h4>
   <div class="aopts col">${mixed(s.opts).map(([o,oi])=>{const on=picks(si).includes(oi);return `<button class="aopt ${chk&&on?(o.s==='good'?'ok':'no'):''}" data-oi="${oi}" aria-pressed="${on}">${esc(o.t)}</button>`}).join('')}</div>
   ${msg&&msg[0]===si?`<p class="fbk info">${esc(msg[1])}</p>`:''}
   ${chk?picks(si).map(oi=>{const o=s.opts[oi];return `<p class="fbk ${o.s==='good'?'good':'warn'}">${o.s==='good'?'✓ ':'⚠ '}${esc(o.fb)}</p>`}).join(''):''}</div>`).join('')}
  <div class="aplan" aria-live="polite"><h4>Your answer so far</h4>${cfg.steps.map((s,si)=>picks(si).length?`<p>${picks(si).map(oi=>esc(s.opts[oi].t)).join(' ')}</p>`:`<p class="no">${si+1}. ${esc(s.label)}: not chosen yet</p>`).join('')}</div>
  ${chk?`<div class="ares" id="argres"><div class="akick">Your argument</div><div class="abig ${bd[2]}">${esc(bd[1])}</div><p class="aintro" style="margin:4px 0 10px">${tot} / ${max} · ${stars(st.last)}</p>
   ${cfg.rows.map((r,ri)=>`<p class="fbk ${['bad','warn','good'][sc[ri]]}"><b>${esc(r.n)} ${sc[ri]}/2.</b> ${esc(r.tip[sc[ri]])}</p>`).join('')}
   <p class="aintro" style="margin:12px 0 0">${tot===max?'Now write this answer on paper in your own words. Add one more detail from the case.':'Change some chips and check again. Can you reach '+esc(cfg.bands[0][1])+'?'}</p>
   ${tot===max&&document.body.dataset.case?`<p style="margin:10px 0 0"><a class="abtn aprim" style="text-decoration:none" href="#/case/${document.body.dataset.case}/practice">Next: practise full answers →</a></p>`:''}</div>`:''}
  <div class="arow"><button class="abtn aprim" data-a="chk">Check my argument</button><button class="abtn" data-a="rst">Start again</button><span class="ascore">Best: ${stars(st.best)}</span></div></div>`;};
 draw();
 el.onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.oi!==undefined){const si=+b.closest('.asec').dataset.si,s=cfg.steps[si],oi=+b.dataset.oi;const p=picks(si).slice(),i=p.indexOf(oi);
   if(i>=0)p.splice(i,1);else if(s.max===1)p.splice(0,1,oi);else if(p.length>=s.max){draw(false,[si,`You can pick up to ${s.max}. Tap a chosen chip to remove it first.`]);return}else p.push(oi);
   st.p[si]=p;save();const y=scrollY;draw();scrollTo(0,y);}
  else if(b.dataset.a==='rst'){st.p={};save();draw();}
  else if(b.dataset.a==='chk'){const miss=cfg.steps.findIndex((s,si)=>!picks(si).length);
   if(miss>=0){draw(false,[miss,'Pick at least one chip here first.']);$(`.asec[data-si="${miss}"]`,el).scrollIntoView({behavior:'smooth',block:'center'});return}
   st.tries++;const tot=cfg.rows.reduce((a,r,ri)=>a+rowScore(ri),0),top=tot>=cfg.bands[0][0];
   st.last=top?(st.tries===1?3:2):tot>=cfg.bands[1][0]?1:0;st.best=Math.max(st.best,st.last);save();draw(true);$('#argres',el).scrollIntoView({behavior:'smooth',block:'start'});}
 };
};

