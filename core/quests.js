(function() {
  function genDQ() { const t=today(); if(S.qd===t&&S.dq.length) return; const l=tlog(); S.dq=[...DQUESTS].sort(()=>Math.random()-0.5).slice(0,4).map(q=>{ const o=DQUESTS.find(x=>x.id===q.id); return {id:q.id,d:q.d,xp:q.xp,done:!!(o&&o.c(S,l))}; }); S.qd=t; }
  function genWQ() { const w=ws(); if(S.wqd===w&&S.wq.length) return; S.wq=[...WQUESTS].sort(()=>Math.random()-0.5).slice(0,5).map(q=>{ const o=WQUESTS.find(x=>x.id===q.id); return {id:q.id,d:q.d,xp:q.xp,done:!!(o&&o.c(S))}; }); S.wqd=w; }
  function genMQ() { const m=ms(); if(S.mqd===m&&S.mq.length) return; S.mq=[...MQUESTS].sort(()=>Math.random()-0.5).slice(0,7).map(q=>{ const o=MQUESTS.find(x=>x.id===q.id); return {id:q.id,d:q.d,xp:q.xp,done:!!(o&&o.c(S))}; }); S.mqd=m; }
  function genYQ() { const y=ys(); if(S.yqd===y&&S.yq.length) return; S.yq=[...YQUESTS].sort(()=>Math.random()-0.5).slice(0,10).map(q=>{ const o=YQUESTS.find(x=>x.id===q.id); return {id:q.id,d:q.d,xp:q.xp,done:!!(o&&o.c(S))}; }); S.yqd=y; }
  function genLQ() { if(!S.lq) S.lq=[]; const existing=new Set(S.lq.map(q=>q.id)); for(const q of LQUESTS) if(!existing.has(q.id)) S.lq.push({id:q.id,d:q.d,xp:q.xp,done:!!q.c(S)}); S.lqd='set'; }
  function checkQ() {
    let u=false, gained=0; const l=tlog();
    for(const q of S.dq){ const o=DQUESTS.find(x=>x.id===q.id); if(o&&!q.done&&o.c(S,l)){ q.done=true; gained+=q.xp; S.tq++; trackQuestXP('daily',q.xp); u=true; } }
    for(const q of S.wq){ const o=WQUESTS.find(x=>x.id===q.id); if(o&&!q.done&&o.c(S)){ q.done=true; gained+=q.xp; S.tq++; trackQuestXP('weekly',q.xp); u=true; } }
    for(const q of S.mq){ const o=MQUESTS.find(x=>x.id===q.id); if(o&&!q.done&&o.c(S)){ q.done=true; gained+=q.xp; S.tq++; trackQuestXP('monthly',q.xp); u=true; } }
    for(const q of S.yq){ const o=YQUESTS.find(x=>x.id===q.id); if(o&&!q.done&&o.c(S)){ q.done=true; gained+=q.xp; S.tq++; trackQuestXP('yearly',q.xp); u=true; } }
    for(const q of S.lq){ const o=LQUESTS.find(x=>x.id===q.id); if(o&&!q.done&&o.c(S)){ q.done=true; gained+=q.xp; S.tq++; trackQuestXP('lifetime',q.xp); u=true; } }
    if(u){ applyXpDelta(gained); checkA(); saveState(); if(typeof checkSurpriseReward==='function') checkSurpriseReward('quest'); }
  }
  function trackQuestXP(type, xp) { if (!S.questXP) S.questXP = {daily:0,weekly:0,monthly:0,yearly:0,lifetime:0}; S.questXP[type] = (S.questXP[type] || 0) + xp; S.questXP.lifetime = (S.questXP.lifetime || 0) + xp; }
  function toggleQuest(id,type,xp){ let arr; if(type==='daily') arr=S.dq; else if(type==='weekly') arr=S.wq; else if(type==='monthly') arr=S.mq; else if(type==='yearly') arr=S.yq; else if(type==='lifetime') arr=S.lq; else return; const q=arr.find(x=>x.id===id); if(!q) return; q.done=!q.done; const xpVal=xp||q.xp; if(q.done){ applyXpDelta(xpVal); S.tq++; trackQuestXP(type,xpVal); } else { spendXp(xpVal); S.tq=Math.max(0,S.tq-1); trackQuestXP(type,-xpVal); } saveAndRenderDirty(); if(q.done&&typeof checkSurpriseReward==='function') checkSurpriseReward('quest'); }

  window.genDQ = genDQ;
  window.genWQ = genWQ;
  window.genMQ = genMQ;
  window.genYQ = genYQ;
  window.genLQ = genLQ;
  window.checkQ = checkQ;
  window.trackQuestXP = trackQuestXP;
  window.toggleQuest = toggleQuest;
})();
