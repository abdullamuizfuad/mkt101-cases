#!/usr/bin/env node
/* MKT101 Arena end-to-end tests (Playwright + Chromium).
   Run from the repo root:  node tools/tests/run.js
   Starts its own `python3 -m http.server`, runs every group, prints PASS/FAIL and exits non-zero on failure.
   Uses a made-up test class list (served in place of roster.js), never real student IDs.
   Options: --only=<group>  --headed  --shots=<dir> */
const path=require('path'),{spawn}=require('child_process'),crypto=require('crypto'),fs=require('fs');
let chromium;try{({chromium}=require('playwright'))}catch(e){console.error('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium');process.exit(2)}

const ROOT=path.resolve(__dirname,'../..'),PORT=8700+Math.floor(Math.random()*200),URL0=`http://localhost:${PORT}/`;
const ARGS=Object.fromEntries(process.argv.slice(2).map(a=>a.replace(/^--/,'').split('=')).map(([k,v])=>[k,v??true]));
const STUDENT='S081441',OTHER='S085542',LECT='S000001';
const SALT=(fs.readFileSync(path.join(ROOT,'roster.js'),'utf8').match(/"salt":\s*"([^"]+)"/)||[])[1]||'mkt101|T2 2026';
const TEST_ROSTER='const ROSTER='+JSON.stringify({term:'test',salt:SALT,hashes:[LECT,STUDENT,OTHER].map(s=>crypto.createHash('sha256').update(SALT+'|'+s).digest('hex'))})+';';
let browser,fails=0,passes=0;
const ok=(cond,msg)=>{if(!cond)throw new Error(msg)};
const shot=async(p,name,full)=>{if(ARGS.shots)await p.screenshot({path:path.join(ARGS.shots,name+'.png'),fullPage:!!full})};

async function page(opts={}){
  const ctx=await browser.newContext({viewport:{width:opts.w||390,height:opts.h||844},permissions:['clipboard-read','clipboard-write'],serviceWorkers:opts.sw?'allow':'block'});
  await ctx.route('**/roster.js',r=>r.fulfill({contentType:'text/javascript',body:TEST_ROSTER}));
  const p=await ctx.newPage();p.errs=[];p.reqs=[];
  p.on('request',r=>p.reqs.push(r.url()));
  p.on('pageerror',e=>p.errs.push('pageerror: '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/mailto|favicon|fonts\.g/.test(m.text()))p.errs.push('console: '+m.text())});
  p.on('dialog',d=>d.accept());
  if(opts.clock)await p.clock.install();if(opts.init)await p.addInitScript(opts.init);
  if(!opts.breaks)await p.addInitScript(()=>{window.__presNoBreak=1});/* break reminders only in the breaks test */
  await p.goto(URL0);
  if(opts.sid){await p.evaluate(([sid,theme,tour])=>{localStorage.setItem('mkt101_session',JSON.stringify({sid,name:'Test Student'}));
      if(tour)localStorage.setItem('mkt101_u_'+sid,JSON.stringify({tour:1,inst:1,migrated:1}));if(theme)localStorage.setItem('mkt101_theme',JSON.stringify(theme))},[opts.sid,opts.theme,opts.tour!==false]);
    await p.reload();await p.waitForTimeout(300)}
  p.go=async h=>{await p.goto(URL0+h);await p.waitForTimeout(200)};
  p.U=()=>p.evaluate(()=>({xp:U.xp,n:U.n,day:U.day,badges:Object.keys(U.badges)}));
  p.done=async()=>{const w=await p.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);ok(w[0]<=w[1],`horizontal scroll: ${w[0]} > ${w[1]}`);ok(!p.errs.length,p.errs.join('\n'));await ctx.close()};
  return p}

const ALLQ='CASEL.flatMap(c=>c.questions).concat(BANK_S)';
/* plan the focused question: pick every key idea (flawless) or the first k chips */
async function plan(p,k){const q=p.locator('.qcard').first();
  if(k)for(let j=0;j<k;j++)await q.locator('.chip').nth(j).click();
  else{const id=(await q.getAttribute('id')).slice(2);const good=await p.evaluate(([id,A])=>eval(A).find(x=>x.id===id).chips.map((c,i)=>c.g?i:-1).filter(i=>i>=0),[id,ALLQ]);
    for(const j of good)await q.locator(`.chip[data-j="${j}"]`).click()}
  await q.locator('[data-a="check"]').click();await p.waitForTimeout(30)}
/* type into the focused answer box like a person: small chunks, with time passing (needs page({clock:true})) */
async function typeAnswer(p,text,o={}){const ta=p.locator('.qcard textarea');await ta.click();const w=text.split(/\s+/);
  for(let i=0;i<w.length;i+=8){await p.keyboard.insertText(w.slice(i,i+8).join(' ')+' ');if(!o.fast)await p.clock.runFor(6000)}await p.waitForTimeout(20)}
async function goodText(p){const id=(await p.locator('.qcard').first().getAttribute('id')).slice(2);
  return p.evaluate(([id,A])=>{const q=eval(A).find(x=>x.id===id);
    return 'This means '+q.chips.filter(c=>c.g).map(c=>c.t).join('. ')+'. For example, the company can test this first. However, there is a risk. Overall I recommend this approach.'},[id,ALLQ])}
/* finish the focused question by one route */
async function finish(p,r){await plan(p);await p.click(`[data-a="${r}"]`);
  if(r==='rpaper'){await p.click('[data-a="tgo"]');await p.clock.fastForward(600000);await p.click('[data-a="done"]');await p.locator('[data-k]').first().check();await p.click('[data-a="fin"]')}
  if(r==='rtyped'){await typeAnswer(p,await goodText(p));await p.click('[data-a="tdone"]');const b=+(await p.textContent('.autob b.big')).split('/')[0];
    ok(b>=4,(await p.locator('.qcard').first().getAttribute('id'))+': good typed answer scored '+b);await p.locator('.band input[value="5"]').check();await p.click('[data-a="tfin"]')}
  await p.waitForTimeout(20)}
/* answer the MCQ on screen: right or wrong, after `secs` seconds (needs the clock) */
async function answerMcq(p,right,secs){await p.clock.runFor(secs*1000);const oi=right?0:await p.evaluate(()=>U.mq.ord[U.mq.ids[U.mq.i]].find(x=>x!==0));
  await p.click(`.mopt[data-oi="${oi}"]`);await p.waitForTimeout(10)}
async function nextMcq(p){await p.click('#mnx');await p.waitForTimeout(10)}

const T={
async content(){const p=await page({sid:STUDENT});const r=await p.evaluate(()=>{const by={};BANK.mcq.forEach(q=>by[q.t]=(by[q.t]||0)+1);
  const ids=new Set(BANK.mcq.map(q=>q.id));const badMcq=BANK.mcq.filter(q=>q.o.length!==4||new Set(q.o).size!==4||!q.why||!TERM.topics[q.t]).map(q=>q.id);
  const badS=BANK_S.concat(CASEL.flatMap(c=>c.questions)).filter(q=>q.chips.filter(c=>c.g).length<4||!q.chips.some(c=>!c.g)||q.chips.some(c=>!c.g&&!c.why)||!q.checks||!q.checks.length||!TERM.topics[q.t]).map(q=>q.id);
  const sByT={};BANK_S.forEach(q=>sByT[q.t]=(sByT[q.t]||0)+1);
  const text=JSON.stringify([BANK,BANK_S,CASEL.map(c=>[c.sections,c.boardroom,c.questions,c.exhibits]),NOTES,TOUR,BADGES.map(b=>[b.name,b.d]),MPOOL,TERM])+document.body.innerText;
  return {by,n:ids.size,total:BANK.mcq.length,badMcq,badS,sByT,cases:CASEL.map(c=>[c.id,c.sections.length,c.exhibits.length,c.boardroom.length,c.questions.length,c.acts.length]),
    banned:(text.match(/\b(exams?|examination|midterm|mid-term|resits?|final paper|final exam)\b/gi)||[])}});
  ok(r.total===r.n,'duplicate MCQ ids');ok(Object.keys(r.by).length===7&&Object.values(r.by).every(n=>n>=30),'MCQs per topic: '+JSON.stringify(r.by));
  ok(!r.badMcq.length,'malformed MCQs: '+r.badMcq);ok(!r.badS.length,'malformed written questions: '+r.badS);ok(Object.values(r.sByT).every(n=>n>=6),'short answers per topic: '+JSON.stringify(r.sByT));
  ok(r.cases.every(c=>c[1]>=12&&c[2]>=5&&c[3]>=20&&c[4]===15&&c[5]===8),'case content: '+JSON.stringify(r.cases));
  ok(!r.banned.length,'banned wording: '+r.banned.join(', '));await p.done()},

async concepts(){const p=await page({sid:STUDENT});const r=await p.evaluate(()=>{const out=[];
  for(const q of CASEL.flatMap(c=>c.questions).concat(BANK_S)){const good='This means '+q.chips.filter(c=>c.g).map(c=>c.t).join('. ')+'. For example, the company can test this first. However, there is a risk. Overall I recommend this approach.';
    const g=CONCEPT.checkAnswer(q,good),f=CONCEPT.checkAnswer(q,'word '.repeat(60)),d=CONCEPT.checkAnswer(q,q.chips.filter(c=>!c.g).map(c=>c.t).join('. '));
    if(g.band<4||f.band>0||f.xp>0||d.found.length>=g.need)out.push(q.id+' '+g.band+'/'+f.band+'/'+d.found.length)}return out});
  ok(!r.length,'concept check off for: '+r.join(', '));await p.done()},

async signin(){const p=await page();
  ok(await p.$('#sid'),'sign-in form missing');if(!await p.evaluate(()=>CLOUD_ON)){ok(!p.reqs.some(u=>/vendor\/firebase\.js/.test(u)),'Firebase SDK loaded while the cloud is off');ok(await p.evaluate(()=>!CLOUD.ok),'cloud should be off')}
  await p.fill('#nm','Test Student');await p.type('#sid','0814');ok((await p.textContent('#mla')).startsWith('s0814'),'email does not fill while typing');
  ok(await p.$eval('#go',b=>b.disabled),'button should be disabled before verifying');
  await p.type('#sid','41');await p.waitForTimeout(300);ok((await p.textContent('#mst')).includes('Verified'),'listed ID not verified');
  await p.fill('#sid','');await p.type('#sid','099999');await p.waitForTimeout(300);ok((await p.textContent('#mst')).includes('Not found'),'unlisted ID accepted');
  await p.fill('#sid','');await p.type('#sid','5');ok((await p.textContent('#mst')).includes('0'),'leading-digit rule missing');
  /* pasting the full ID with its S used to lose the last digit */
  await p.fill('#sid','');await p.locator('#sid').click();await p.evaluate(()=>navigator.clipboard.writeText('S081441'));await p.keyboard.press('Control+V');await p.waitForTimeout(300);
  ok(await p.inputValue('#sid')==='081441'&&(await p.textContent('#mst')).includes('Verified'),'pasted S081441 not accepted: '+await p.inputValue('#sid'));
  await shot(p,'signin');await p.click('#go');await p.waitForTimeout(400);
  ok(await p.evaluate(()=>ME&&ME.sid==='S081441'),'sign-in did not complete');await p.done()},

async migration(){const p=await page();await p.evaluate(()=>{localStorage.setItem('mkt101-student',JSON.stringify({sid:'S081441',name:'Old Student'}));
    localStorage.setItem('mkt101_st',JSON.stringify({'sto-1-0':{ch:{0:['Atoll distributor']}}}));localStorage.setItem('mkt101_done',JSON.stringify({'sto-1':true,'soneva-3':true,'sto-2':false}));localStorage.setItem('mkt101_theme',JSON.stringify('light'))});
  await p.reload();await p.waitForTimeout(500);
  const r=await p.evaluate(()=>({me:ME&&ME.sid,name:ME&&ME.name,act:!!U.act['sto-1-0'],l1:!!U.log['actdone:sto:1'],l2:!!U.log['actdone:soneva:3'],l3:!!U.log['actdone:sto:2'],acts:U.n.acts,theme:document.documentElement.dataset.theme,old:!!localStorage.getItem('mkt101_st')}));
  ok(r.me==='S081441'&&r.name==='Old Student','old sign-in not carried over: '+JSON.stringify(r));ok(r.act&&r.l1&&r.l2&&!r.l3&&r.acts===2,'old activity work not carried over: '+JSON.stringify(r));
  ok(r.theme==='light'&&r.old,'theme lost or old data wiped');await p.reload();await p.waitForTimeout(300);ok((await p.U()).n.acts===2,'migration ran twice');await p.done()},

async tour(){const p=await page({sid:STUDENT,tour:false});await p.waitForTimeout(900);ok(await p.$('.modal'),'tour not shown on first sign-in');
  for(let i=0;i<5;i++){await p.click('#tn');await p.waitForTimeout(60)}ok(!await p.$('.modal'),'tour did not close');
  await p.reload();await p.waitForTimeout(900);ok(!await p.$('#tn'),'tour shown again');await p.evaluate(()=>closeModal());await p.click('#help');ok(await p.$('.modal'),'help link does not open tour');await p.done()},

/* every MCQ goes through the one-at-a-time flow: one set of 30 per topic */
async mcqAll(){const p=await page({sid:STUDENT,clock:true});const topics=await p.evaluate(()=>TOPICS);let seen=new Set();
  for(const t of topics){await p.go('#/mcq/t/'+t);await p.click('.seg [data-n="30"]');await p.click('#mgo');await p.waitForTimeout(20);
    const ids=await p.evaluate(()=>U.mq.ids);ok(ids.length===30&&new Set(ids).size===30,'set size '+ids.length);
    for(let i=0;i<ids.length;i++){const q=await p.evaluate(()=>({id:U.mq.ids[U.mq.i],t:MCQ_BY[U.mq.ids[U.mq.i]].t,min:minRead(MCQ_BY[U.mq.ids[U.mq.i]]),why:MCQ_BY[U.mq.ids[U.mq.i]].why}));
      ok(q.t===t,'topic filter broken');seen.add(q.id);ok(await p.textContent('#mcq h2')!=='','question text missing');
      await answerMcq(p,i%5!==4,q.min+2);ok((await p.textContent('#mfb')).includes(q.why.slice(0,30)),'reason not shown for '+q.id);await nextMcq(p)}
    ok((await p.textContent('main')).includes('Set results'),'summary missing for topic '+t);ok((await p.textContent('main')).includes('Questions to review (6)'),'wrong answers not listed')}
  const all=await p.evaluate(()=>BANK.mcq.length);ok(seen.size===all,`only ${seen.size} of ${all} MCQs shown`);
  const u=await p.evaluate(()=>({mt:U.mt,sets:U.n.mcqSets,right:U.n.mcqRight,mcq:U.n.mcq}));ok(u.sets===7&&u.mcq===all&&u.right===all-42,'counters off: '+JSON.stringify(u));
  ok(Object.values(u.mt).every(r=>r[0]===30&&r[1]===24),'topic accuracy off: '+JSON.stringify(u.mt));await p.done()},

/* XP and speed design */
async mcqXP(){const p=await page({sid:STUDENT,clock:true});
  /* 30 fresh, all right, comfortably read but quick: 60 base + 45 speed bonus + 15 finish + 10 daily check-in */
  await p.go('#/mcq');await p.click('.seg [data-n="30"]');await p.click('#mgo');
  for(let i=0;i<30;i++){const m=await p.evaluate(()=>minRead(MCQ_BY[U.mq.ids[U.mq.i]]));await answerMcq(p,true,Math.max(m,8));await nextMcq(p)}
  let u=await p.U();ok(u.xp===130,'perfect quick set should give 130 XP, got '+u.xp);ok(u.badges.includes('perfect30')&&u.badges.includes('hot10')&&u.badges.includes('speedrun'),'MCQ badges missing: '+u.badges);
  await shot(p,'mcq-summary',true);
  /* the same questions again today: nothing */
  const ids=await p.evaluate(()=>U.mq.ids);await p.evaluate(ids=>{startMcq(ids,{topic:0});mcqPlay()},ids);
  for(let i=0;i<30;i++){await answerMcq(p,true,10);await nextMcq(p)}ok((await p.U()).xp===130,'repeated questions earned XP');
  /* rushed guessing: right answers given too fast earn nothing, and no bonus */
  await p.click('#mns');for(let i=0;i<30;i++){await answerMcq(p,true,1);if(i===0)ok((await p.textContent('#mfb')).includes('Too quick'),'rushed answer not flagged');await nextMcq(p)}
  ok((await p.U()).xp===130,'rushed answers earned XP: '+(await p.U()).xp);ok((await p.textContent('main')).includes('too many rushed'),'rushed note missing');
  /* 60% accuracy: base XP only plus the finish bonus, no speed bonus */
  await p.click('#mns');let right=0;for(let i=0;i<30;i++){const r=i%5<3;if(r)right++;await answerMcq(p,r,12);await nextMcq(p)}
  ok(right===18,'setup');let x=(await p.U()).xp;ok(x===130+18*2+15,'60% set should give base + finish bonus only: +'+(x-130));
  /* retry my mistakes: +1 each, no bonus */
  const wrong=await p.evaluate(()=>U.mq.ids.filter(id=>U.mq.ans[id]!==0).length);await p.click('#mrt');for(let i=0;i<wrong;i++){await answerMcq(p,true,10);await nextMcq(p)}
  ok((await p.U()).xp===x+wrong,'retry should give +1 each');
  /* resume after leaving the page */
  await p.click('#mns');await answerMcq(p,true,10);await nextMcq(p);await p.go('#/');await p.go('#/mcq');ok((await p.textContent('#mcq')).includes('Question 2 of'),'set did not resume');
  /* keyboard: A-D answers, Enter goes on */
  await p.clock.runFor(10000);await p.keyboard.press('B');await p.waitForTimeout(20);ok(await p.evaluate(()=>U.mq.ans[U.mq.ids[1]]!==undefined),'keyboard answer ignored');await p.keyboard.press('Enter');
  ok(await p.evaluate(()=>U.mq.i===2),'Enter did not move on');await p.done()},

async shortAll(){const p=await page({sid:STUDENT,clock:true});const ids=await p.evaluate(()=>BANK_S.map(q=>q.id));
  for(const [k,id] of ids.entries()){await p.evaluate(id=>{U.sets._s=[id];U.stopic=0;(U.focus=U.focus||{})._s=0;save();location.hash='#/short';shortPage()},id);await p.waitForTimeout(40);
    ok(await p.$('#q-'+id),'question not shown: '+id);await finish(p,['rplan','rpaper','rtyped'][k%3])}
  const u=await p.U();ok(u.n.timed>=14&&u.n.typed>=14,'routes not counted: timed '+u.n.timed+', typed '+u.n.typed);ok(u.badges.includes('wordsmith')&&u.badges.includes('pressure'),'badges missing: '+u.badges);
  const tw=await p.evaluate(()=>Object.keys(U.tw).length);ok(tw===7,'written-answer record per topic: '+tw);
  await p.go('#/short');await p.selectOption('#stp','12');await p.waitForTimeout(50);ok(await p.evaluate(()=>U.sets._s.every(id=>BANK_S.find(q=>q.id===id).t===12)),'topic filter broken');
  await p.click('.dot[data-dot="sum"]');ok((await p.textContent('#qs')).includes('Set summary'),'summary missing');await p.done()},

async longAll(){const p=await page({sid:STUDENT,clock:true});const ids=await p.evaluate(()=>BANK.essays.map(e=>e.id));ok(ids.length>=28,'long answers missing');
  for(const id of ids){await p.go('#/long/'+id);ok(await p.$('[data-a="go"]'),id+': not at the plan step: '+(await p.textContent('#lq')).slice(0,80));await p.click('[data-a="go"]');await p.click('[data-a="tgo"]');await p.clock.fastForward(1000000);await p.click('[data-a="done"]');
    await p.selectOption('select[data-mk="0"]',{index:1});await p.click('[data-a="fin"]');ok((await p.textContent('#lq')).includes('Model answer'),id+': model missing')}
  const u=await p.U();ok(u.n.longs===ids.length&&u.badges.includes('longw'),'long answers not counted: '+u.n.longs);
  await p.click('[data-a="restart"]');ok((await p.U()).xp===u.xp-42,'long restart refund wrong: '+(u.xp-(await p.U()).xp));
  await p.click('[data-a="go"]');await p.click('[data-a="tgo"]');await p.clock.runFor(60000);await p.click('[data-a="done"]');ok((await p.U()).n.longs===ids.length-1,'one-minute long answer earned credit');await p.done()},

async cases(){const p=await page({sid:STUDENT,clock:true});const C=await p.evaluate(()=>CASEL.map(c=>({id:c.id,acts:c.acts.length,q:c.questions.map(q=>q.id)})));ok(C.length===2,'expected 2 cases');
  for(const c of C){await p.go(`#/case/${c.id}/read`);while(await p.locator('[data-r]').count()){await p.locator('[data-r]').first().click();await p.waitForTimeout(10)}
    await p.go(`#/case/${c.id}/exhibits`);ok(await p.$$eval('table',t=>t.length)>=5,c.id+': exhibits missing');
    await p.go(`#/case/${c.id}/terms`);await p.locator('.term').first().click();ok(await p.locator('.term[aria-pressed="true"]').count()===1,'terms flip broken');
    await p.go(`#/case/${c.id}/board`);for(const t of await p.$$eval('[data-tp]',e=>e.map(x=>x.dataset.tp))){await p.click(`[data-tp="${t}"]`);
      while(await p.locator('[data-v]:not([disabled])').count()){await p.locator('[data-v]:not([disabled])').first().click();await p.waitForTimeout(10)}}
    for(let n=1;n<=c.acts;n++){await p.go(`#/case/${c.id}/acts/${n}`);ok(await p.locator('#parts .part').count()>=1,c.id+' activity '+n+' empty');
      const ck=p.locator('#parts [data-a="chk"]').first();if(await ck.count())await ck.click();await p.click('#adn')}
    for(const [k,id] of c.q.entries()){await p.evaluate(([cid,id])=>{U.sets[cid]=[id];(U.focus=U.focus||{})['c:'+cid]=0;save();caseView(cid,'practice')},[c.id,id]);await p.waitForTimeout(30);
      ok(await p.$('#q-'+id),'case question not shown: '+id);await finish(p,['rplan','rpaper','rtyped'][k%3])}
    ok(await p.evaluate(cid=>!!U.badges['case_'+cid]&&!!U.log['casedone:'+cid],c.id),c.id+': case badge not unlocked')}
  const u=await p.U();ok(u.n.acts===16&&u.badges.includes('handson'),'activities not counted: '+u.n.acts);ok(u.badges.includes('judge')&&u.badges.includes('voice'),'boardroom badges missing');
  await p.evaluate(()=>{delete U.sets.sto;save()});await p.go('#/');await p.go('#/case/sto/practice');
  ok(await p.$$eval('#fh .dot',d=>d.length-1)===5,'practice set should hold 5 questions');await p.done()},

async notesMastery(){const p=await page({sid:STUDENT,clock:true});const topics=await p.evaluate(()=>TOPICS);
  for(const t of topics){await p.go('#/notes/'+t);ok(await p.$('.concept'),'notes missing for '+t);await p.locator('.term').first().click();await p.click('#nst');ok(await p.evaluate(t=>!!U.log['notes:'+t],t),'study not recorded')}
  let u=await p.U();ok(u.badges.includes('scholar')&&u.n.notes===7,'Scholar badge missing');ok(!u.badges.some(b=>/^mt\d/.test(b)),'mastery given too early');
  /* 15 MCQs at 80%+ on each topic, then one written answer per topic */
  for(const t of topics){await p.evaluate(t=>{startMcq(drawMcq(t,15),{topic:t});mcqPlay()},t);for(let i=0;i<15;i++){await answerMcq(p,i!==0,10);await nextMcq(p)}}
  u=await p.U();ok(!u.badges.some(b=>/^mt\d/.test(b)),'mastery without a written answer');
  for(const t of topics){const id=await p.evaluate(t=>BANK_S.find(q=>q.t===t).id,t);await p.evaluate(id=>{U.sets._s=[id];(U.focus=U.focus||{})._s=0;save();location.hash='#/short';shortPage()},id);await p.waitForTimeout(30);await finish(p,'rpaper')}
  u=await p.U();ok(topics.every(t=>u.badges.includes('mt'+t)),'topic mastery badges missing: '+u.badges.join(','));
  await p.go('#/');ok((await p.textContent('main')).includes('7/7'),'home does not show 7/7 mastered');await p.done()},

async antiFarming(){const p=await page({sid:STUDENT,clock:true});await p.evaluate(()=>{U.sets.sto=['st2a','st1b','st3c','st4a','st5b'];save()});await p.go('#/case/sto/practice');
  for(let r=0;r<6;r++){await plan(p);if(r<5)await p.click('[data-a="replan"]')}
  let u=await p.U();ok(u.n.plans===1&&u.n.perfect===1,'re-planning inflated counters: '+JSON.stringify(u.n));const x1=u.xp;
  await p.click('[data-a="restart"]');await p.waitForTimeout(60);u=await p.U();ok(u.xp===x1-25&&u.n.plans===0,'restart did not refund plan XP/counters');
  await plan(p);await p.click('[data-a="rpaper"]');await p.click('[data-a="tgo"]');await p.clock.runFor(5000);await p.click('[data-a="done"]');u=await p.U();ok(u.n.timed===0,'instant timer earned timed credit');
  await p.click('[data-a="restart"]');await plan(p);await p.click('[data-a="rtyped"]');await typeAnswer(p,'too short');await p.click('[data-a="tdone"]');
  await p.click('[data-a="tfin"]');u=await p.U();ok(!u.n.typed,'short typed answer earned credit');
  await p.click('[data-a="restart"]');await plan(p);await p.click('[data-a="rtyped"]');await typeAnswer(p,'word '.repeat(60));await p.click('[data-a="tdone"]');
  ok((await p.textContent('.qcard')).includes('no key ideas'),'off-topic typed answer should earn nothing');await p.click('[data-a="tedit"]');
  await p.locator('.qcard textarea').fill('');await typeAnswer(p,await goodText(p));await p.click('[data-a="tdone"]');
  const exp=await p.evaluate(()=>{const id=document.querySelector('.qcard').id.slice(2);return U.plansSaved[id].chk.xp});const x2=(await p.U()).xp;await p.click('[data-a="tfin"]');u=await p.U();
  ok(exp>=20&&u.xp===x2+exp&&u.n.typed===1,'typed XP should be +'+exp+', got +'+(u.xp-x2));
  ok((await p.textContent('.qcard')).includes('Model answer'),'model answer not offered after finishing');
  ok(await p.evaluate(()=>Object.values(U.ans||{}).some(a=>a.b>=4&&a.t.length>100)),'submitted answer not stored for marking');
  await p.click('[data-a="restart"]');u=await p.U();ok(!u.n.typed&&u.xp===x2-25,'restart did not refund typed XP');
  /* boardroom and reading cannot be farmed */
  await p.go('#/case/sto/read');await p.locator('[data-r]').first().click();const x3=(await p.U()).xp;await p.reload();await p.waitForTimeout(200);ok(await p.locator('[data-r]').count()===11&&(await p.U()).xp===x3,'section read twice');
  await p.go('#/case/sto/acts/1');await p.click('#adn');const x4=(await p.U()).xp;await p.go('#/case/sto/acts/1');ok(!await p.$('#adn')&&(await p.U()).xp===x4,'activity done twice');await p.done()},

async integrity(){const p=await page({sid:STUDENT,clock:true});await p.go('#/short');await plan(p);await p.click('[data-a="rtyped"]');
  const ta=p.locator('.qcard textarea'),fl=()=>p.evaluate(()=>{const id=document.querySelector('.qcard').id.slice(2);return U.plansSaved[id].fl||{}});
  await ta.click();await p.evaluate(()=>navigator.clipboard.writeText('Pasted from somewhere else. '.repeat(10)));
  await p.keyboard.press('Control+V');await p.waitForTimeout(60);ok(!(await ta.inputValue()).includes('Pasted'),'paste was not blocked');
  let f=await fl();ok(f.paste>=1&&f.ev.some(x=>x.k==='paste'&&x.s.startsWith('Pasted from somewhere')&&x.t&&x.at),'paste snippet not recorded: '+JSON.stringify(f.ev));
  /* one 40-word insertion that isn't a paste (e.g. keyboard voice typing): kept, with a soft flag and a snippet */
  const forty=Array.from({length:40},(_,i)=>'word'+i).join(' ');await ta.fill(forty);await p.waitForTimeout(40);
  ok((await ta.inputValue())===forty,'large insertion was removed');let g=await p.evaluate(()=>U.integ||{});ok(g.paste>=1&&g.bigKept>=1&&!g.big,'flags not counted: '+JSON.stringify(g));
  f=await fl();const k=f.ev.find(x=>x.k==='bigKept');ok(k&&k.s.startsWith('word0 word1')&&k.s.length<=120&&'c' in k,'large insert snippet not recorded: '+JSON.stringify(k));
  ok((await p.textContent('.qcard')).includes('Large inserts are kept but recorded'),'student note missing');
  await ta.fill('');await typeAnswer(p,await goodText(p),{fast:true});await p.click('[data-a="tdone"]');ok((await p.textContent('.qcard')).includes('faster than typing'),'too-fast answer not caught');
  const x=(await p.U()).xp;await p.click('[data-a="tfin"]');ok((await p.U()).xp===x,'too-fast answer earned XP');
  ok(await p.evaluate(()=>Object.values(U.ans).some(a=>a.fl.fast&&a.fl.paste&&a.fl.bigKept&&a.fl.ev.length>=2)),'flags not stored with the answer');await p.done()},

/* a 150-word answer spoken with the 🎤 button over about a minute earns XP (speech is timed at 1 s per 3 words) */
async dictation(){const p=await page({sid:STUDENT,clock:true,init:()=>{window.SpeechRecognition=class{start(){setTimeout(()=>{
    this.onresult&&this.onresult({resultIndex:0,results:[Object.assign([{transcript:window.__T||''}],{isFinal:true})]});this.onend&&this.onend()},60000)}stop(){this.onend&&this.onend()}}}});
  await p.go('#/short');await plan(p);await p.click('[data-a="rtyped"]');const g=await goodText(p);
  const t=(g+' '+'This matters because customers compare options and the firm must respond with a clear plan that fits its market and its budget. '.repeat(8)).split(/\s+/).slice(0,150).join(' ');
  await p.evaluate(t=>{window.__T=t},t);await p.click('[data-a="mic"]');await p.clock.runFor(61000);await p.waitForTimeout(50);
  const v=await p.locator('.qcard textarea').inputValue();ok(v.split(/\s+/).filter(Boolean).length>=150,'dictated text missing');
  const x=(await p.U()).xp;await p.click('[data-a="tdone"]');ok(!(await p.textContent('.qcard')).includes('faster than typing'),'dictated answer marked too fast');
  await p.click('[data-a="tfin"]');ok((await p.U()).xp>x,'dictated answer earned no XP');ok(!(await p.evaluate(()=>U.integ&&(U.integ.bigKept||U.integ.big))),'the 🎤 button was flagged as a large insert');await p.done()},

async mic(){const p=await page({sid:STUDENT,clock:true,init:()=>{window.SpeechRecognition=class{start(){setTimeout(()=>{const t='Market skimming pricing means setting a high price first to earn the most from each layer of the market, for example a new phone case in Malé.';
    this.onresult&&this.onresult({resultIndex:0,results:[Object.assign([{transcript:t}],{isFinal:true})]});this.onend&&this.onend()},50)}stop(){this.onend&&this.onend()}}}});
  await p.go('#/short');await plan(p);await p.click('[data-a="rtyped"]');ok(await p.$('[data-a="mic"]'),'mic button missing');await p.click('[data-a="mic"]');await p.waitForTimeout(300);
  ok((await p.locator('.qcard textarea').inputValue()).includes('skimming'),'speech not added');ok(!(await p.evaluate(()=>U.integ&&U.integ.big)),'speech was treated as a big insertion');await p.done()},

async backup(){const p=await page({sid:STUDENT});await p.evaluate(()=>{U.xp=777;U.mh=[{d:'x',n:1,c:1}];save()});const code=await p.evaluate(()=>backupCode());ok(/^MKT101[ZB]-/.test(code),'bad backup code');
  await p.evaluate(()=>{localStorage.removeItem('mkt101_u_S081441')});await p.reload();await p.waitForTimeout(200);
  ok((await p.evaluate(c=>restore(c),code))==='','restore failed');ok((await p.U()).xp===777&&await p.evaluate(()=>U.mh.length===1),'XP not restored');
  await p.evaluate(()=>localStorage.setItem('mkt101_session',JSON.stringify({sid:'S085542',name:'Other'})));await p.reload();await p.waitForTimeout(200);
  ok((await p.evaluate(c=>restore(c),code)).includes('different student'),'another ID could restore');
  ok((await p.evaluate(c=>restore(c.slice(0,-4)+'0000'),code)).includes('damaged'),'damaged code accepted');
  ok((await p.evaluate(()=>restore('MKT301Z-abc-0123456789'))).includes("doesn't look like"),'an MKT301 code was accepted');
  await p.click('#svb');ok(await p.$('.modal #mem'),'Save popup missing');await shot(p,'save-popup');await p.done()},

async missions(){const p=await page({sid:STUDENT,clock:true});const v=await p.evaluate(()=>[0,1,2].map(t=>pickMissions(t).map(id=>MPOOL.find(m=>m.id===id).t)));
  ok(v.every((a,t)=>a.length===3&&a.every(x=>x===t||x===t-1)),'mission tiers wrong: '+JSON.stringify(v));
  const ms=await p.evaluate(()=>missions().map(m=>m.k));ok(new Set(ms).size===3,'missions track the same activity twice');
  /* complete today's missions by force-picking three MCQ-driven ones */
  await p.evaluate(()=>{U.day.m=['mcq10','right15','mset20'];save()});const x0=(await p.U()).xp;
  await p.go('#/mcq');await p.click('.seg [data-n="20"]');await p.click('#mgo');for(let i=0;i<20;i++){await answerMcq(p,true,10);await nextMcq(p)}
  const u=await p.U();ok(u.day.done===1&&u.n.missions===1&&u.badges.includes('mission'),'missions not completed: '+JSON.stringify(u.day));
  ok(u.xp>=x0+25,'mission bonus missing');await p.done()},

async levels(){const p=await page({sid:STUDENT});const r=await p.evaluate(()=>LEVELS.map(l=>{U.xp=l[0];checkBadges();return [level(l[0]).name,Object.keys(U.badges).length]}));
  ok(r.map(x=>x[0]).join('|')==='Intern|Marketing Officer|Marketing Executive|Senior Marketing Executive|Marketing Manager|Marketing Director|Cluster Director|Chief Marketing Officer (CMO)|Marketing Consultant','level names wrong');
  ok(r.every((x,i)=>i===0||x[1]>r[i-1][1]),'no badge per level');const t=await p.evaluate(()=>[0,150,400,750,1200,1800,2600,3600,5000].map(tier));ok(t.join('')==='000111222','tiers: '+t);
  await p.go('#/badges');ok(await p.locator('.badge').count()>=38,'badge list short');await p.done()},

async lecturer(){const p=await page({sid:LECT});await p.go('#/lecturer');ok(await p.$('#demo'),'demo panel missing');ok(await p.$$eval('#rvw [data-rv]',e=>e.length)>100,'content review list too short');
  await p.click('[data-dm="vs"]');ok((await p.textContent('#dm')).includes('Student 1'),'demo comparison missing');await p.done();
  const s=await page({sid:STUDENT});await s.go('#/lecturer');ok(!await s.$('#demo'),'students can open the lecturer page');await s.done()},

async layout(){const pages=['#/','#/mcq','#/short','#/long','#/long/e10a','#/cases','#/case/sto/read','#/case/soneva/board','#/case/sto/acts/1','#/case/sto/acts/7','#/case/soneva/acts/3','#/case/soneva/acts/6','#/case/soneva/acts/7','#/case/soneva/practice','#/case/sto/exhibits','#/notes','#/notes/10','#/badges','#/board'];
  for(const w of [320,390,1280])for(const theme of ['dark','light']){const p=await page({sid:STUDENT,w,theme,clock:true});for(const h of pages){await p.go(h);const sw=await p.evaluate(()=>document.documentElement.scrollWidth);ok(sw<=w,`${h} at ${w}px ${theme}: scrollWidth ${sw}`)}
    await p.go('#/mcq');await p.click('#mgo');await answerMcq(p,true,9);ok(await p.evaluate(()=>document.documentElement.scrollWidth)<=w,'MCQ screen overflows at '+w);
    ok(await p.evaluate(t=>document.documentElement.dataset.theme===t,theme),'theme not applied');await p.done()}
  const g=await page({w:320});ok(await p320(g),'sign-in overflows at 320');await g.done()},

async contrast(){const p=await page({sid:STUDENT});const r=[];for(const theme of ['dark','light']){await p.evaluate(t=>theme(t),theme);
    r.push(...await p.evaluate(()=>{const lum=c=>{const m=c.match(/\d+(\.\d+)?/g).map(Number);return m.slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((t,v,i)=>t+v*[.2126,.7152,.0722][i],0)};
      const cs=getComputedStyle(document.documentElement),rgb=v=>{const d=document.createElement('div');d.style.color=cs.getPropertyValue(v);document.body.append(d);const c=getComputedStyle(d).color;d.remove();return c};
      const ratio=(a,b)=>{const x=lum(rgb(a)),y=lum(rgb(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};const out=[];
      for(const bg of ['--bg','--card','--card2'])for(const fg of ['--ink','--ink2','--muted'])if(ratio(fg,bg)<4.5)out.push(document.documentElement.dataset.theme+' '+fg+' on '+bg+' '+ratio(fg,bg).toFixed(2));
      for(const fg of ['--teal','--gold','--green','--red'])if(ratio(fg,'--card')<4.5)out.push(document.documentElement.dataset.theme+' '+fg+' on card '+ratio(fg,'--card').toFixed(2));
      if(ratio('--on','--teal')<4.5)out.push('button text '+ratio('--on','--teal').toFixed(2));return out}))}
  ok(!r.length,'contrast below AA: '+r.join('; '));await p.done()},

async profileLocal(){const p=await page({sid:'S000001'});await p.go('#/student/S081441');await p.waitForTimeout(300);
  ok((await p.textContent('main')).includes('need the live connection'),'device-only profile note missing');
  const s=await page({sid:STUDENT});await s.go('#/student/S081441');await s.waitForTimeout(300);ok(!(await s.textContent('main')).includes('live connection')&&!!await s.$('.hero'),'student reached a profile');await s.done();await p.done()},

/* screen time: visible + active counts, idle stops after 2 minutes, a writing timer keeps it counting, hidden stops; goal, bonus blocks + cap, hours badges */
async screentime(){const p=await page({sid:STUDENT,clock:true});await p.evaluate(()=>{U.st={};U.stx={};save()});
  const sec=()=>p.evaluate(()=>((U.st||{})[today()]|0)+PR.pend),poke=()=>p.mouse.click(5,600),vis=v=>p.evaluate(v=>{Object.defineProperty(document,'visibilityState',{value:v,configurable:true});document.dispatchEvent(new Event('visibilitychange'))},v);
  await poke();let a=await sec();await p.clock.runFor(90000);let b=await sec();ok(b-a>=85&&b-a<=92,'90 active seconds counted as '+(b-a));
  await poke();a=await sec();await p.clock.runFor(300000);b=await sec();ok(b-a>=115&&b-a<=126,'idle did not pause after 2 minutes: '+(b-a));
  await poke();await vis('hidden');a=await sec();await p.clock.runFor(60000);ok(await sec()-a<1,'counted while hidden');await vis('visible');
  await p.evaluate(()=>{const t=document.createElement('button');t.dataset.a='tgo';t.textContent='Pause';t.id='fk';document.querySelector('main').append(t)});
  await poke();a=await sec();await p.clock.runFor(300000);b=await sec();ok(b-a>=295,'a running writing timer did not keep it counting: '+(b-a));await p.evaluate(()=>document.getElementById('fk').remove());
  await p.evaluate(()=>{U.st[today()]=1190;U.stx[today()]=1190;PR.pend=PR.pendx=0;save()});await poke();await p.clock.runFor(15000);await p.evaluate(()=>stFlush(true));
  let u=await p.evaluate(()=>({g:!!U.log['stgoal:'+today()],b:Object.keys(U.log).filter(k=>k.startsWith('stblock:')).length,c:U.day.c.stgoal,gx:U.gain['stgoal:'+today()]}));
  ok(u.g&&u.b===1&&u.c===1&&u.gx===15,'daily goal or first block not awarded: '+JSON.stringify(u));
  await p.evaluate(()=>{U.stx[today()]=1200*9;stFlush(true)});ok(await p.evaluate(()=>Object.keys(U.log).filter(k=>k.startsWith('stblock:')).length)===6,'bonus blocks not capped at 6');
  await p.evaluate(()=>{PR.sess={id:'x',name:'t',active:true,endsAt:Date.now()+3600e3};PR.sessOn=true;PR.joined=true;U.sess={x:{j:Date.now(),on:0,idle:0,away:0,left:0,lg:0,pr:[],c:0}};PR.pendx=0});
  await poke();await p.clock.runFor(30000);ok(await p.evaluate(()=>PR.pendx)<1&&await p.evaluate(()=>PR.pend)>0,'live-session time counted towards bonus blocks');
  await p.evaluate(()=>{PR.sess=null;PR.sessOn=false;PR.joined=false;presBar()});
  await p.evaluate(()=>{U.stArch=5*3600;stFlush(true)});ok((await p.U()).badges.includes('hrs5'),'5 Hours Logged badge missing');
  await p.go('#/');ok((await p.textContent('#stcard')).includes('GOAL MET'),'Home card does not show the goal met');
  await p.evaluate(()=>{document.querySelectorAll('.toast').forEach(t=>t.remove());document.querySelector('#stcard').scrollIntoView({block:'center'})});await shot(p,'st-card');
  await p.go('#/badges');ok((await p.textContent('main')).includes('every 20 active minutes'),'How to earn XP row missing');await p.done()},

/* break reminder: after 20 focused minutes; Not now = 10 more minutes; a break pauses screen time; deferred during a timer or an MCQ question; never in a live session */
async breaks(){const p=await page({sid:STUDENT,clock:true,breaks:true});const brk=()=>p.$('[aria-label="Take a break"]'),poke=()=>p.mouse.click(5,600),min=async n=>{for(let i=0;i<n;i++){await poke();await p.clock.runFor(60000)}};
  await min(19);ok(!await brk(),'reminder before 20 minutes');await min(2);ok(await brk(),'no reminder after 20 minutes');await shot(p,'break-reminder');
  await p.click('#brn');await min(9);ok(!await brk(),'"Not now" asked again too soon');await min(2);ok(await brk(),'no reminder 10 minutes after "Not now"');
  await p.click('#brs');ok(await p.$('#brt'),'break countdown missing');const s0=await p.evaluate(()=>((U.st||{})[today()]|0)+PR.pend);await p.clock.runFor(120000);
  ok(await p.evaluate(()=>((U.st||{})[today()]|0)+PR.pend)-s0<1,'screen time counted during the break');await p.clock.runFor(200000);ok(!await p.$('#brt'),'break did not end after 5 minutes');
  await p.evaluate(()=>{PR.fc=1250;const t=document.createElement('button');t.dataset.a='tgo';t.textContent='Pause';t.id='fk';document.querySelector('main').append(t)});await poke();await p.clock.runFor(5000);ok(!await brk(),'reminder during a writing timer');
  await p.evaluate(()=>document.getElementById('fk').remove());await poke();await p.clock.runFor(3000);ok(await brk(),'deferred reminder not shown after the timer');await p.click('#brn');
  await p.evaluate(()=>{PR.sess={id:'x',name:'t',active:true,endsAt:Date.now()+3600e3};PR.sessOn=true;PR.fc=5000;PR.next=1200});await poke();await p.clock.runFor(3000);ok(!await brk(),'reminder during a live session');
  await p.evaluate(()=>{PR.sess=null;PR.sessOn=false;presBar()});
  await p.go('#/mcq');await p.click('#mgo');await p.waitForSelector('.mopt');await p.evaluate(()=>{PR.fc=5000;PR.next=1200});await poke();await p.clock.runFor(3000);ok(!await brk(),'reminder in the middle of an MCQ question');
  await p.clock.runFor(8000);await p.click('.mopt[data-oi="0"]');await p.clock.runFor(2000);ok(await brk(),'reminder not shown after answering');await p.done()},

async install(){const p=await page({sid:STUDENT,tour:false});await p.waitForTimeout(1200);ok(await p.$('#tn'),'tour should open for a new student');
  for(let n=0;n<8&&await p.$('#tn');n++){await p.click('#tn');await p.waitForTimeout(120)}
  await p.waitForTimeout(700);ok(await p.$('[aria-label="Install the app"]'),'install popup should follow the tour');
  ok(/COMPUTER|THIS BROWSER/.test(await p.textContent('.modal .card')),'desktop steps expected');
  await p.click('#idone');await p.reload();await p.waitForTimeout(1600);ok(!await p.$('[aria-label="Install the app"]'),'install popup should show only once');
  await p.click('#inst');await p.waitForTimeout(200);ok(await p.$('[aria-label="Install the app"]'),'footer link should reopen it');await p.done()},

async offline(){const p=await page({sid:STUDENT,sw:true});const s=await p.evaluate(async()=>{const r=await navigator.serviceWorker.ready;return {a:!!r.active,scope:r.scope}});ok(s.a,'service worker not active');
  const keys=await p.evaluate(()=>caches.keys());ok(keys.some(k=>/^mkt101-arena-v\d+$/.test(k))&&!keys.some(k=>/mkt301/.test(k)),'cache name: '+keys);
  const man=await p.evaluate(async()=>(await (await fetch('manifest.webmanifest')).json()).name);ok(man==='MKT101 Arena','manifest');await p.done()}
};
async function p320(g){await g.waitForTimeout(200);return (await g.evaluate(()=>document.documentElement.scrollWidth))<=320}

(async()=>{const server=spawn('python3',['-m','http.server',String(PORT)],{cwd:ROOT,stdio:'ignore'});await new Promise(r=>setTimeout(r,800));
  browser=await chromium.launch({headless:!ARGS.headed});
  for(const [name,fn] of Object.entries(T)){if(ARGS.only&&!ARGS.only.split(',').includes(name))continue;const t0=Date.now();
    try{await fn();passes++;console.log(`PASS ${name} (${((Date.now()-t0)/1000).toFixed(1)}s)`)}catch(e){fails++;console.log(`FAIL ${name}: ${e.message.split('\n').slice(0,4).join(' | ')}`)}}
  await browser.close();server.kill();console.log(`\n${passes} passed, ${fails} failed`);process.exit(fails?1:0)})();
