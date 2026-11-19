/* Rebuild evidence from real browser reports. Counts are fixtures, not probabilities. */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(__dirname,'..'),file=path.join(root,'achievements/community-routes.json');
const data=JSON.parse(fs.readFileSync(file,'utf8')),files=['community-route-results.json','remaining-route-results.json','baseline-route-results.json','whatbelt-source-results.json','whatbelt-neighbor-results.json','verified-route-results.json','reliability-before-results.json','bern-margin-candidate-results.json','all-objective-coach-review-results.json','bern-coach-review-results.json'];
const reports=files.filter(f=>fs.existsSync(path.join(root,'tests',f))).map(f=>({file:f,...JSON.parse(fs.readFileSync(path.join(root,'tests',f),'utf8'))}));
for(const r of reports)assert.equal(r.status,'passed',r.file+' must finish before publishing evidence');
const hash=r=>crypto.createHash('sha256').update(JSON.stringify([r.scope,r.answers,r.visits,r.difficulty,r.mode])).digest('hex');
const runs=reports.flatMap(r=>r.runs.map(x=>({...x,route:x.coachingRoute||x.route,achievement:x.achievement||data.routes.find(route=>route.id===x.route)?.achievement,report:r.file}))),rules=JSON.parse(fs.readFileSync(path.join(root,'achievements/source-audit.json'),'utf8')).achievements;
const stressFile=path.join(root,'tests/stress-route-comparison.json');
const stress=fs.existsSync(stressFile)?JSON.parse(fs.readFileSync(stressFile,'utf8')):null;
if(stress)assert.equal(stress.status,'passed');
const optimizerFile='optimizer-route-comparison.json';
const optimizerPath=path.join(root,'tests',optimizerFile);
const optimizer=fs.existsSync(optimizerPath)?JSON.parse(fs.readFileSync(optimizerPath,'utf8')):null;
const optimizedEvidence=new Map();
if(optimizer){
 assert.equal(optimizer.status,'passed');
 const trials=new Map(optimizer.trials.map(row=>[row.route.id,row]));
 for(const {previous,promoted,reason} of optimizer.selection){
  const trial=trials.get(promoted);
  assert(trial.clickable,'A promoted route needs clickable visits');
  const existing=data.routes.find(r=>r.id===promoted);
  if(existing)assert.equal(hash(existing),hash(trial.route),'Replayed route definition changed');
  else data.routes.push({...trial.route,improves:previous,notes:{
   'zh-CN':'按原版解锁条件搜索，并在另选的随机序列中回放验证。',
   'en-US':'Searched against the native unlock conditions and replayed on separate validation sequences.'
  }});
  const old=data.routes.find(r=>r.id===previous);assert(old,previous);
  if(reason==='unclickable-visit')old.supersededBy=promoted;
  optimizedEvidence.set(promoted,trial);
  if(trials.get(previous)?.clickable)optimizedEvidence.set(previous,trials.get(previous));
 }
}
const stressEvidence=new Map();
for(const comparison of stress?.comparisons||[]){
 const baseline=stress.baselines.find(r=>r.route===comparison.original);
 stressEvidence.set(comparison.original,baseline);
 if(comparison.accepted){
  const trial=stress.tested.find(r=>r.route.id===comparison.candidate);
  const route=data.routes.find(r=>r.id===comparison.candidate);
  assert.equal(hash(trial.route),hash(route),'Replayed candidate definition changed');
  stressEvidence.set(comparison.candidate,trial);
 }
}
for(const route of data.routes){const compatible=runs.filter(x=>x.route===route.id&&x.scope===route.scope&&(!x.routeSHA256||x.routeSHA256===hash(route)));const seen=new Set(),samples=[];
 for(const run of compatible){if(run.language&&run.language!=='zh-CN')continue;const key=run.seed+':'+hash(route);if(seen.has(key))continue;
  // Older reports lack a route hash. Check the recorded choices against the
  // current mapping and label that limitation instead of inventing a hash.
  if(!run.routeSHA256&&run.steps?.some(s=>s.type==='answer'&&route.answers[s.question]&&!route.answers[s.question].includes(s.id)))continue;
  if(!run.routeSHA256&&route.visits.sequence&&run.steps?.filter(s=>s.type==='visit').some((s,i)=>s.abbr!==route.visits.sequence[Math.min(i,route.visits.sequence.length-1)]))continue;
  seen.add(key);samples.push({seed:run.seed,electoral:run.electoral,unlocked:!!run.unlocked,yearRecorded:!!run.progress?.yearRecorded,report:run.report,identity:run.routeSHA256?'SHA256':'legacy-route-id-without-hash'});
 }
 const extra=stressEvidence.get(route.id);
 const merged=new Map(samples.map(row=>[row.seed,row]));
 for(const phase of ['discovery','holdout'])for(const row of extra?.[phase]||[]){
  merged.set(row.seed,{seed:row.seed,electoral:row.electoral,unlocked:route.achievement!=='destiny'&&row.met,yearRecorded:route.achievement==='destiny'&&row.met,report:'stress-route-comparison.json',phase});
 }
 const optimized=optimizedEvidence.get(route.id);
 if(optimized)assert.equal(hash(optimized.route),hash(route));
 for(const phase of ['discovery','holdout'])for(const row of optimized?.[phase]||[]){
  merged.set(row.seed,{seed:row.seed,electoral:row.electoral,unlocked:row.unlocked,yearRecorded:false,report:optimizerFile,phase});
 }
 const distinct=[...merged.values()];
 route.replays={total:distinct.length,success:distinct.filter(x=>x.unlocked||(route.achievement==='destiny'&&x.yearRecorded)).length,samples:distinct};
 if(extra)route.replays.holdout={total:extra.holdout.length,success:extra.holdout.filter(r=>r.met).length};
 if(optimized)route.replays.holdout={total:optimized.holdout.length,success:optimized.holdout.filter(r=>r.unlocked).length};
 route.verification=route.replays.success?(route.achievement==='destiny'?'actual-year-record':'actual-unlock'):samples.length?'tested-no-unlock':'unverified';
}
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
const procedural=JSON.parse(fs.readFileSync(path.join(root,'tests/procedural-achievement-results.json'),'utf8'));assert.equal(procedural.status,'passed');
const rows=rules.map(rule=>{const routes=data.routes.filter(r=>r.achievement===rule.id),unlocks=runs.filter(r=>r.achievement===rule.id&&r.unlocked),special=procedural.cases.filter(c=>c.achievement===rule.id&&c.unlocked),verified=routes.filter(r=>r.replays.success&&!r.supersededBy);return {id:rule.id,name:rule.name,actualUnlock:unlocks.length>0||special.length>0||verified.some(r=>r.replays.samples.some(s=>s.unlocked)),routes:routes.length,testedRoutes:routes.filter(r=>r.replays.total).length,verifiedRoutes:verified.map(r=>({id:r.id,scope:r.scope,mode:r.mode,difficulty:r.difficulty,success:r.replays.success,total:r.replays.total})),procedureEvidence:special.length? 'tests/procedural-achievement-results.json':null};});
const optimizerGames=optimizer?.trials.filter(row=>row.clickable).reduce((n,row)=>n+row.discovery.length+row.holdout.length,0)||0;
const report={date:new Date().toISOString(),method:'Actual native achievement storage, offline browser replays. Route evidence counts independent Chinese seed fixtures once. Browser run totals also include earlier bilingual checks and failed candidates. Simulations are excluded.',actualUnlocks:rows.filter(r=>r.actualUnlock).length,total:rows.length,actualGames:runs.length+procedural.cases.reduce((n,c)=>n+(c.games?.length||1),0)+optimizerGames,rows,remaining:rows.filter(r=>!r.actualUnlock).map(r=>r.id)};
fs.writeFileSync(path.join(root,'achievements/route-coverage.json'),JSON.stringify(report,null,2)+'\n');
const lines=['# 原生成就路线与实际解锁覆盖','',`统计时间：${report.date}。实际解锁 **${report.actualUnlocks}/${report.total}** 项；当前报告包含 **${report.actualGames}** 局实际浏览器游戏。`,'','每局通过原版按钮完成，读取原版存档判定。测试种子只用于隔离浏览器回归，不进入插件。中英文重复回放不当作独立成功样本；以下次数不是胜率。未注明实际解锁的搜索候选不能当作成功攻略。','','| 成就 | 实际解锁 | 路线／已测试 | 已验证组合与配置 |','| --- | --- | --- | --- |'];
for(const r of rows)lines.push(`| ${r.name} (${r.id}) | ${r.actualUnlock?'是':'尚未'} | ${r.routes} / ${r.testedRoutes} | ${r.verifiedRoutes.map(v=>`${v.scope}，模式${v.mode}，系数${v.difficulty}（${v.success}/${v.total}）`).join('<br>')||(r.procedureEvidence?'原版操作／累计流程，见实际报告':'尚无解锁证据')} |`);
lines.push('','## 可核对的原始记录','','- [逐题路线回归](../tests/community-route-results.json)','- [后续困难目标与失败记录](../tests/remaining-route-results.json)','- [普通攻略路线提取](../tests/baseline-route-results.json)','- [原版彩蛋、百局计数、跨年累计](../tests/procedural-achievement-results.json)');
if(optimizer)lines.push('- [新旧路线逐局对照](../tests/'+optimizerFile+')');
lines.push('','固定路线按开局配置、已选答案、已访问州与原文指纹匹配。偏离后优先接入仍符合当前进度的实测路线，再使用模型建议。','');
fs.writeFileSync(path.join(root,'achievements/COVERAGE_ZH.md'),lines.join('\n'));console.log('Actual unlocks',report.actualUnlocks+'/'+report.total,'actual games',report.actualGames,'remaining',report.remaining);
