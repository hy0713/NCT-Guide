/* Rebuild evidence from real browser reports. Counts are fixtures, not probabilities. */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(__dirname,'..'),file=path.join(root,'achievements/community-routes.json');
const data=JSON.parse(fs.readFileSync(file,'utf8')),files=['community-route-results.json','remaining-route-results.json','baseline-route-results.json','whatbelt-source-results.json','whatbelt-neighbor-results.json','verified-route-results.json'];
const reports=files.filter(f=>fs.existsSync(path.join(root,'tests',f))).map(f=>({file:f,...JSON.parse(fs.readFileSync(path.join(root,'tests',f),'utf8'))}));
for(const r of reports)assert.equal(r.status,'passed',r.file+' must finish before publishing evidence');
const hash=r=>crypto.createHash('sha256').update(JSON.stringify([r.scope,r.answers,r.visits,r.difficulty,r.mode])).digest('hex');
const runs=reports.flatMap(r=>r.runs.map(x=>({...x,achievement:x.achievement||data.routes.find(route=>route.id===x.route)?.achievement,report:r.file}))),rules=JSON.parse(fs.readFileSync(path.join(root,'achievements/source-audit.json'),'utf8')).achievements;
for(const route of data.routes){const compatible=runs.filter(x=>x.route===route.id&&x.scope===route.scope&&(!x.routeSHA256||x.routeSHA256===hash(route)));const seen=new Set(),samples=[];
 for(const run of compatible){if(run.language&&run.language!=='zh-CN')continue;const key=run.seed+':'+hash(route);if(seen.has(key))continue;
  // Older reports lack a route hash. Check the recorded choices against the
  // current mapping and label that limitation instead of inventing a hash.
  if(!run.routeSHA256&&run.steps?.some(s=>s.type==='answer'&&route.answers[s.question]&&!route.answers[s.question].includes(s.id)))continue;
  seen.add(key);samples.push({seed:run.seed,electoral:run.electoral,unlocked:!!run.unlocked,yearRecorded:!!run.progress?.yearRecorded,report:run.report,identity:run.routeSHA256?'SHA256':'legacy-route-id-without-hash'});
 }
 route.replays={total:samples.length,success:samples.filter(x=>x.unlocked||(route.achievement==='destiny'&&x.yearRecorded)).length,samples};
 route.verification=route.replays.success?(route.achievement==='destiny'?'actual-year-record':'actual-unlock'):samples.length?'tested-no-unlock':'unverified';
}
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
const procedural=JSON.parse(fs.readFileSync(path.join(root,'tests/procedural-achievement-results.json'),'utf8'));assert.equal(procedural.status,'passed');
const rows=rules.map(rule=>{const routes=data.routes.filter(r=>r.achievement===rule.id),unlocks=runs.filter(r=>r.achievement===rule.id&&r.unlocked),special=procedural.cases.filter(c=>c.achievement===rule.id&&c.unlocked),verified=routes.filter(r=>r.replays.success);return {id:rule.id,name:rule.name,actualUnlock:unlocks.length>0||special.length>0,routes:routes.length,testedRoutes:routes.filter(r=>r.replays.total).length,verifiedRoutes:verified.map(r=>({id:r.id,scope:r.scope,mode:r.mode,difficulty:r.difficulty,success:r.replays.success,total:r.replays.total})),procedureEvidence:special.length? 'tests/procedural-achievement-results.json':null};});
const report={date:new Date().toISOString(),method:'Actual native achievement storage, offline browser replays; independent Chinese seed fixtures counted once, English duplicates excluded. These are not success probabilities. Candidate search and synthetic predicate tests are excluded from unlock coverage.',actualUnlocks:rows.filter(r=>r.actualUnlock).length,total:rows.length,actualGames:runs.length+procedural.cases.reduce((n,c)=>n+(c.games?.length||1),0),rows,remaining:rows.filter(r=>!r.actualUnlock).map(r=>r.id)};
fs.writeFileSync(path.join(root,'achievements/route-coverage.json'),JSON.stringify(report,null,2)+'\n');
const lines=['# 原生成就路线与实际解锁覆盖','',`统计时间：${report.date}。实际解锁 **${report.actualUnlocks}/${report.total}** 项；当前报告包含 **${report.actualGames}** 局实际浏览器游戏。`,'','每局通过原版按钮完成，读取原版存档判定。测试种子只用于隔离浏览器回归，不进入插件。中英文重复回放不当作独立成功样本；以下次数不是胜率。未注明实际解锁的搜索候选不能当作成功攻略。','','| 成就 | 实际解锁 | 路线／已测试 | 已验证组合与配置 |','| --- | --- | --- | --- |'];
for(const r of rows)lines.push(`| ${r.name} (${r.id}) | ${r.actualUnlock?'是':'尚未'} | ${r.routes} / ${r.testedRoutes} | ${r.verifiedRoutes.map(v=>`${v.scope}，模式${v.mode}，系数${v.difficulty}（${v.success}/${v.total}）`).join('<br>')||(r.procedureEvidence?'原版操作／累计流程，见实际报告':'尚无解锁证据')} |`);
lines.push('','## 可核对的原始记录','','- [逐题路线回归](../tests/community-route-results.json)','- [后续困难目标与失败记录](../tests/remaining-route-results.json)','- [普通攻略路线提取](../tests/baseline-route-results.json)','- [原版彩蛋、百局计数、跨年累计](../tests/procedural-achievement-results.json)','','固定路线按年份、搭档、问题ID、答案ID及英文指纹匹配；设置不符、原文变化或偏离路线时，明确停用固定路线并回到条件／模型建议。个别社区来源缺少题目或访问次数，缺口在运行时和JSON中保留。原文中的历史观点不等同于游戏最佳数值策略。','');
fs.writeFileSync(path.join(root,'achievements/COVERAGE_ZH.md'),lines.join('\n'));console.log('Actual unlocks',report.actualUnlocks+'/'+report.total,'actual games',report.actualGames,'remaining',report.remaining);
