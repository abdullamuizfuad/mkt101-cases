/* Site tests for the Boardroom "build your own position" (course.js bposHTML, MKT101) */
module.exports=({page,ok,STUDENT,LECT,shot})=>({
async bposSoneva(){const p=await page({sid:STUDENT});await p.evaluate(()=>LS.set('bt_soneva','Selling'));await p.go('#/case/soneva/board');await p.waitForTimeout(300);
  ok(/Judge every argument above first/.test(await p.textContent('.bpos')),'position should wait for the judgements');
  for(let n=0;n<10;n++){const b=await p.$('[data-v]');if(!b)break;const v=await p.evaluate(()=>{const i=CASEL.find(c=>c.id==='soneva').boardroom.findIndex((a,i)=>a.topic==='Selling'&&!U.verd['soneva:'+i]);return i<0?null:i+'|'+CASEL.find(c=>c.id==='soneva').boardroom[i].v});if(!v)break;await p.click(`[data-v="${v}"]`);await p.waitForTimeout(150)}
  await p.waitForSelector('#bpos');ok(await p.$('[data-bpa]'),'no argument chips');ok(await p.$('[data-bpt]'),'no theory chips');await p.evaluate(()=>document.getElementById('bpos').scrollIntoView());await shot(p,'bpos-form');
  await p.click('[data-bpa]');ok(/strongest argument/.test(await p.inputValue('#ta-bps')),'argument chip did not start a sentence');
  await p.fill('#ta-bpw','aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa');await p.dispatchEvent('#ta-bpw','input');await p.fill('#ta-bpo','x');await p.dispatchEvent('#ta-bpo','input');
  await p.click('#bpsend');ok(/real sentences/.test(await p.textContent('#bpmsg')),'filler was accepted');ok(await p.evaluate(()=>!Object.keys(U.ans||{}).some(k=>/^bpsv1_/.test(k))),'filler reached the marking queue');
  await p.fill('#ta-bps','The strongest argument is relationship selling because it builds trust with families who spend thousands on a villa.');await p.dispatchEvent('#ta-bps','input');
  await p.fill('#ta-bpw','The chatbot idea is weak because a luxury villa is a complex purchase and handling objections needs a trained salesperson.');await p.dispatchEvent('#ta-bpw','input');
  await p.fill('#ta-bpo','Soneva could invite returning guests to host small dinners for prospects in Germany, so referrals add to personal selling.');await p.dispatchEvent('#ta-bpo','input');
  const x0=await p.evaluate(()=>U.xp);await p.click('#bpsend');await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const k=Object.keys(U.ans).find(k=>/^bpsv1_/.test(k));return {k,a:k&&U.ans[k],pos:U.bpos&&U.bpos.bpsv1,xp:U.xp}});
  ok(r.k&&r.a.q==='bpsv1'&&/Your own idea:/.test(r.a.t)&&r.pos&&r.pos.key===r.k,'position not queued: '+JSON.stringify(r).slice(0,300));ok(r.xp-x0===10,'XP for sending: '+(r.xp-x0));
  ok(/Sent for marking/.test(await p.textContent('.bpos')),'sent state');await shot(p,'bpos-sent');
  ok(await p.evaluate(()=>qIndex().bpsv1&&/Boardroom/.test(qIndex().bpsv1.label)),'marking card cannot name the question');
  ok(!(await p.$('[data-lect]')),'lecturer-only element on a student page');await p.done()}
});
