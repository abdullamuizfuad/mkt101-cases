/* Site tests for live lectures (lecture/lecture.js, lecture/ch13.js; MKT101 only; required by run.js).
   The cloud is mocked in the page: the lecture document and the answers live in window variables. */
module.exports=({page,ok,STUDENT,LECT,shot})=>{
const mockStudent=()=>{ME.cloud=true;CLOUD.ok=true;window.__w=[];window.__cb=[];window.__doc=null;
  CLOUD.put=(p,d)=>{window.__w.push([p,d]);return Promise.resolve()};CLOUD.push=()=>{};CLOUD.flush=()=>Promise.resolve();CLOUD.get=()=>Promise.resolve(null);CLOUD.ts=()=>Date.now();
  CLOUD.watchOne=(p,cb)=>{if(p==='lec/ch13'){window.__cb.push(cb);setTimeout(()=>cb(window.__doc),0)}return ()=>{}};
  window.__set=d=>{window.__doc=d;window.__cb.forEach(f=>f(d))}};
const live=d=>Object.assign({st:'live',ends:Date.now()+3600e3,cur:null,ph:'closed',r:0},d);
return {
/* content rules: plain text with no em-dashes, every call branch complete, every voice clip present, Term Snap answers are distinct */
async lxcontent(){const p=await page({sid:STUDENT});const r=await p.evaluate(()=>{const L=LX_CH13,txt=JSON.stringify(L),bad=[];
    if(/[—–]/.test(txt))bad.push('em or en dash in lecture text');
    const need={A:3,B:3,A2:1,C:0};for(const c of Object.keys(L.call)){const s=L.call[c];if(s.d.length!==need[c])bad.push(c+': '+need[c]+' decisions');s.d.forEach((d,j)=>{if(d.opts.filter(o=>o.good).length!==1)bad.push(c+j+': one value move');d.opts.forEach(o=>{if(o.say.length<2)bad.push(c+j+': reply missing')})})}
    L.snap.forEach((x,i)=>{if(new Set(x.o).size!==4)bad.push('snap '+i+' options')});
    L.slides.forEach((x,i)=>{if(!x.n)bad.push('slide '+(i+1)+' has no note');if(x.act&&!L.acts[x.act])bad.push('slide '+(i+1)+' unknown activity')});
    return bad});ok(!r.length,r.join('; '));
  const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'../..');
  const keys=await p.evaluate(()=>{const o=[];for(const [c,s] of Object.entries(LX_CH13.call)){const a=(k,arr)=>arr.forEach((x,i)=>o.push(k+'-'+i));a(c+'-intro',s.intro);s.d.forEach((d,j)=>{a(c+'-d'+j+'-s',d.setup);d.opts.forEach((x,k)=>a(c+'-d'+j+'-o'+k,x.say))});a(c+'-outro',s.outro)}return o});
  const miss=keys.filter(k=>!fs.existsSync(path.join(root,'lecture/ch13/audio',k+'.mp3')));ok(!miss.length,'voice clips missing: '+miss.join(' '));
  const pics=await p.evaluate(()=>Object.values(LX_CH13.clients).flatMap(c=>c.feed.pics));const nof=pics.filter(x=>!fs.existsSync(path.join(root,x)));ok(pics.length===27&&!nof.length,'feed images: '+pics.length+' missing '+nof.join(' '));await p.done()},
/* a student's phone: waiting, a word, the team design, research and a prospect vote, a call vote, Term Snap, then the badge; XP, mastery and answers saved */
async lxphone(){const p=await page({sid:STUDENT,w:360});await p.evaluate(()=>{window.__noCeleb=1});await p.evaluate(mockStudent);await p.go('#/lecture/ch13');
  await p.evaluate(()=>window.__set({st:'idle'}));await p.waitForTimeout(150);ok(await p.isVisible('text=Get ready'),'waiting screen');
  const set=async d=>{await p.evaluate(d=>window.__set(Object.assign({st:'live',ends:Date.now()+3600e3,r:0},d)),d);await p.waitForTimeout(150)};
  await set({cur:'w1',ph:'open'});await p.fill('#lxw','help');await p.click('#lxf button');await p.waitForTimeout(100);
  await set({cur:'rep',ph:'open'});await p.click('.lxopt[data-i="2"]');await p.click('#lxgo');await p.waitForTimeout(100);
  await set({cur:'p2',ph:'open'});for(const c of ['A','B','C']){await p.click(`[data-f="${c}"]`);ok(await p.locator('.lxfp').count()===9,'feed '+c+' has 9 posts');await p.click('.modal .x')}await p.click('[data-s="A"]');ok(await p.isVisible('text=Simulated search'),'search panel');await p.click('.modal .x');
  await p.click('[data-v="1"]');await p.waitForTimeout(100);
  await set({cur:'c1',ph:'open',pick:'B'});await p.click('.lxopt[data-i="1"]');await p.waitForTimeout(100);await set({cur:'c1',ph:'closed',pick:'B'});
  await set({cur:'c3',ph:'open',pick:'B'});ok(await p.isVisible('text=Client A: Orbis Tech'),'second call is with Client A');await p.click('.lxopt[data-i="1"]');await p.waitForTimeout(100);await set({cur:'c3',ph:'closed',pick:'B'});
  await set({cur:'ln',ph:'open',r:0,pick:'B'});await p.click('.lxtile:has-text("Sales promotion")');await p.waitForTimeout(100);ok(await p.locator('.lxtile:disabled').count()===4,'tiles lock after one tap');
  await set({cur:'ln',ph:'closed',r:0,pick:'B'});await set({cur:'ln',ph:'closed',r:0,pick:'B',sfr:true,tc:['S081441']});await p.waitForTimeout(200);
  const r=await p.evaluate(()=>({log:Object.keys(U.log).filter(k=>k.startsWith('lec:')).sort().join(),b:['salesrep','keeneye','topcloser'].filter(b=>U.badges[b]).join(),mt:(U.mt||{})[13],last:window.__w[window.__w.length-1]}));
  ok(r.log==='lec:ch13:c1,lec:ch13:c1:v,lec:ch13:c3,lec:ch13:c3:v,lec:ch13:ke,lec:ch13:p2,lec:ch13:rep,lec:ch13:s0,lec:ch13:sfr,lec:ch13:tc,lec:ch13:w1','xp keys: '+r.log);ok(r.b==='salesrep,keeneye,topcloser','badges: '+r.b);
  ok(r.mt&&r.mt[0]===1&&r.mt[1]===1,'Term Snap counted toward Topic 13 mastery: '+JSON.stringify(r.mt));
  ok(r.last[0]==='lec/ch13/a/'+'S081441'&&r.last[1].a.w1==='help'&&r.last[1].a.rep.s===2&&r.last[1].a.s0.c===0&&r.last[1].n,'answers doc: '+JSON.stringify(r.last));
  ok(!(await p.locator('[data-lect]').count()),'lecturer-only element on the student lecture page');await shot(p,'lx-phone');await p.done()},
/* the deck: every slide and step runs with 55 simulated students and the live writes happen in order; no errors */
async lxdeck(){const p=await page({sid:LECT,w:1600,h:900});await p.go('#/lecture/ch13/deck');
  await p.evaluate(()=>{ME.cloud=true;CLOUD.ok=true;window.__w=[];CLOUD.put=(pth,d)=>{window.__w.push([pth,d]);if(pth==='lec/ch13'){LXD.doc=Object.assign({},LXD.doc||{},d);LXD.live=LXD.doc.st==='live';LXD.doc.ends=Date.now()+3600e3}return Promise.resolve()};CLOUD.ts=()=>Date.now();CLOUD.when=ms=>ms;
    LXD.ans=Array.from({length:55},(_,i)=>{const a={j:1,w1:['sell','talk','help'][i%3],rep:{s:i%3,v:40},p1:0,p2:i%4?1:0,c0:1,c1:i%5?1:0,c2:1,w2:'listen',sfr:1};for(let r=0;r<8;r++)a['s'+r]={c:(i+r)%4?0:2,ms:1000+i*50};return {id:'S08'+(1000+i),n:'Student '+i,a}});
    LXD.live=false;LXD.doc=null;LXD.i=0;LXD.s=0;lxEnter()});
  const steps=await p.evaluate(async()=>{let n=0;window.alert=()=>{};window.confirm=()=>true;while(n<400){const last=LXD.i===LXD.L.slides.length-1&&LXD.s===lxPlan(lxSl()).length-1;if(last)break;LXD.skip=true;LXD.busy=false;lxGo(1);n++;await new Promise(r=>setTimeout(r,5))}return n});
  const r=await p.evaluate(()=>{const d=window.__w.filter(x=>x[0]==='lec/ch13').map(x=>x[1]);return {st:d[0]&&d[0].st,opens:d.filter(x=>x.ph==='open').map(x=>x.cur+(x.cur==='ln'?x.r:'')).join(),sfr:d.some(x=>x.sfr===true),tc:(d.find(x=>x.tc&&x.tc.length)||{}).tc,pick:(d.find(x=>x.pick)||{}).pick}});
  ok(steps>150,'deck steps: '+steps);ok(r.st==='live','went live first');ok(r.opens==='w1,rep,p1,p2,c0,c1,c2,c3,ln0,ln1,ln2,ln3,ln4,ln5,ln6,ln7,w2','activities opened: '+r.opens);
  ok(r.sfr,'badge awarded');ok(r.tc&&r.tc.length===3,'top closers: '+JSON.stringify(r.tc));ok(r.pick==='B','client carried: '+r.pick);
  await shot(p,'lx-deck-end');await p.done()},
/* the Join card on Home: hidden before the schedule, shown in the window, shown early when the lecturer turns it on, gone after the end */
async lxhome(){const p=await page({sid:STUDENT});await p.evaluate(mockStudent);
  const at=async(t,doc)=>p.evaluate(([t,doc])=>{const real=Date.now;Date.now=()=>Date.parse(t);LX.gid='ch13';LX.gdoc=doc;const m=$('#lxhome');if(m)m.remove();lxHomeCard();Date.now=real;return !!document.getElementById('lxhome')},[t,doc]);
  await p.go('#/');ok(!(await at('2026-11-17T15:00:00+05:00',null)),'card before 3:30');ok(await at('2026-11-17T15:31:00+05:00',null),'no card at 3:31');
  ok(await at('2026-11-17T09:00:00+05:00',{show:true,st:'ready'}),'no card when shown early');ok(!(await at('2026-11-17T16:40:00+05:00',{st:'ended',show:false})),'card after the end');
  await at('2026-11-17T15:31:00+05:00',null);await p.click('#lxhome');await p.waitForTimeout(200);
  ok((await p.evaluate(()=>location.hash))==='#/lecture/ch13','card link: '+await p.evaluate(()=>location.hash));await p.done()},
/* the deck works with no cloud at all (show of hands): no writes, no errors */
async lxoffline(){const p=await page({sid:LECT,w:1280,h:720});await p.go('#/lecture/ch13/deck');
  const n=await p.evaluate(async()=>{window.confirm=()=>true;let n=0;while(n<300&&!(LXD.i===LXD.L.slides.length-1&&LXD.s===lxPlan(lxSl()).length-1)){LXD.skip=true;LXD.busy=false;lxGo(1);n++;await new Promise(r=>setTimeout(r,3))}return n});
  ok(n>150,'offline deck steps: '+n);await p.keyboard.press('ArrowLeft');await p.done()}
}};
