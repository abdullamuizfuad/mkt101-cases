/* Cloud tests for live lectures (lecture/lecture.js) against the emulators: the lec rules, the deck and the phones in step,
   55 students answering at once, the badge, and the end of the lecture. Required by firebase.js. */
module.exports=({page,ok,signIn,tourOff,ensure,fsDoc,fsPut,waitFor,waitDoc,A,B,L,PIN,PINB,PINL,RULES})=>({
async liveLecture(){if(!/match \/lec\//.test(RULES?require('fs').readFileSync(RULES,'utf8'):''))return;
  const al=/permission|PERMISSION|insufficient|400|403|Failed to load resource|identitytoolkit/;
  const l=await page({w:1280,h:800,allow:al});await ensure(l,L,PINL);await signIn(l,L,PINL);await tourOff(l);
  await l.evaluate(()=>{location.hash='#/lecture/ch13/deck'});await l.waitForTimeout(600);
  await l.evaluate(()=>{window.confirm=()=>true;LXD.i=0;LXD.s=0;lxEnter()});await l.keyboard.press('ArrowRight');
  await waitFor(l,()=>LXD.live===true);
  /* the deck's own listener sees the write before the server has it (latency compensation), so wait for the server copy */
  const d0=await waitDoc('lec','ch13',d=>d.st&&d.st.stringValue==='live');ok(d0&&d0.st.stringValue==='live','lecture not live: '+JSON.stringify(d0&&d0.st));
  /* a student joins on the phone */
  const a=await page({allow:al});await ensure(a,A,PIN);await signIn(a,A,PIN);await tourOff(a);await a.evaluate(()=>{location.hash='#/lecture/ch13'});
  await waitFor(a,()=>!!document.querySelector('.lxeyes'));await waitFor(l,()=>LXD.ans.some(x=>x.id==='S081441'&&x.a.j));
  /* the deck opens the warm-up cloud: it opens on the phone, the word comes back to the deck */
  await l.evaluate(()=>{LXD.i=LXD.L.slides.findIndex(s=>s.act==='w1');LXD.s=0;lxEnter();lxGo(1)});
  await waitFor(a,()=>!!document.querySelector('#lxw'));await a.fill('#lxw','listen');await a.click('#lxf button');
  await waitFor(l,()=>!!document.querySelector('.lxw[data-w="listen"]'));
  /* 55 students answer at the same moment (written as the server, so no 55 sign-ins); the deck counts them all */
  const ids=Array.from({length:55},(_,i)=>'S09'+String(1000+i));
  await Promise.all(ids.map((id,i)=>fsPut('lec/ch13/a',id,{n:'Load '+i,a:{j:1,w1:['help','solve','trust','sell'][i%4]}})));
  await waitFor(l,()=>LXD.ans.filter(x=>x.a&&x.a.w1).length>=56,null,20000);
  ok(await l.evaluate(()=>/56/.test(document.querySelector('.lxn').textContent)),'deck count: '+await l.evaluate(()=>document.querySelector('.lxn').textContent));
  /* the rules: another student can't read A's answers, can't run the lecture, can't add other fields */
  const b=await page({allow:al});await ensure(b,B,PINB);await signIn(b,B,PINB);await tourOff(b);
  const r=await b.evaluate(async()=>{const o={};const t=async(k,f)=>{try{await f();o[k]='allowed'}catch(e){o[k]='denied'}};
    await t('readOther',()=>CLOUD.get('lec/ch13/a/S081441'));await t('runLecture',()=>CLOUD.put('lec/ch13',{st:'live'},true));
    await t('extraField',()=>CLOUD.put('lec/ch13/a/S085542',{a:{j:1},n:'B',t:CLOUD.ts(),xp:999}));await t('ownAnswer',()=>CLOUD.put('lec/ch13/a/S085542',{a:{j:1},n:'B',t:CLOUD.ts()}));
    await t('asOther',()=>CLOUD.put('lec/ch13/a/S081441',{a:{j:1},n:'B',t:CLOUD.ts()}));await t('readDoc',()=>CLOUD.get('lec/ch13'));return o});
  ok(r.readOther==='denied'&&r.runLecture==='denied'&&r.extraField==='denied'&&r.asOther==='denied','rules too open: '+JSON.stringify(r));ok(r.ownAnswer==='allowed'&&r.readDoc==='allowed','rules too strict: '+JSON.stringify(r));
  /* the badge ceremony reaches the phone */
  await l.evaluate(()=>{LXD.i=LXD.L.slides.findIndex(s=>s.k==='badge');LXD.s=0;lxEnter();lxGo(1)});
  await waitFor(a,()=>!!U.badges.salesrep);await waitFor(l,()=>LXD.ans.some(x=>x.id==='S081441'&&x.a.sfr));
  /* the end: phones can no longer answer */
  await l.evaluate(()=>{window.confirm=()=>true});await l.keyboard.press('e');await waitFor(a,()=>!!document.querySelector('.lxlive.off'));
  const late=await b.evaluate(async()=>{try{await CLOUD.put('lec/ch13/a/S085542',{a:{j:1,w2:'late'},n:'B',t:CLOUD.ts()});return 'allowed'}catch(e){return 'denied'}});ok(late==='denied','answer accepted after the end');
  await a.done();await b.done();await l.done()}
});
