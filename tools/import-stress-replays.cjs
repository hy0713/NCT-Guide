/* Compare native browser replays and retain only candidates that beat the baseline. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),work=path.resolve(process.argv[2]);
const rawReports=process.argv[3]?path.resolve(process.argv[3]):path.join(root,'tests');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const write=(file,value)=>fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');
const routeFile=path.join(root,'achievements/community-routes.json'),guide=read(routeFile);
const old=read(path.join(root,'tests/all31-2026-11-17/summary.json'));
const routeId=row=>row.coachingRoute;
const group=row=>row.achievement==='destiny'?'destiny-'+row.scope.split('_')[0]:row.achievement;
const success=row=>row.unlocked||(row.achievement==='destiny'&&(row.progress?.yearRecorded||row.yearRecorded))||false;
const stamp=route=>crypto.createHash('sha256').update(JSON.stringify([route.scope,route.answers,route.visits,route.difficulty,route.mode])).digest('hex');
const baselineRows=old.rows.filter(row=>!['destiny','what','stillAlive','yourchance'].includes(row.id)).flatMap(row=>read(path.join(root,row.report)).runs);
baselineRows.push(...read(path.join(root,'tests/all31-2026-11-17/destiny-grid.json')).runs);
const discovered=read(path.join(work,'stress-all-routes.json')).routes.concat(read(path.join(work,'stress-maga-routes.json')).routes,read(path.join(work,'stress-belt-routes.json')).routes);
const baselineHoldout=load('stress-holdout-baseline').runs;
const discovery=['stress-discovery-0','stress-discovery-1','stress-discovery-2','stress-discovery-maga','stress-discovery-belt'].flatMap(name=>load(name).runs);
const holdout=load('stress-holdout-candidates').runs;
function load(name){const report=read(path.join(rawReports,name+'.json'));assert.equal(report.status,'passed',name);assert.deepEqual(report.errors,[],name);assert.deepEqual(report.external,[],name);return report;}
const counted=row=>({seed:row.seed,electoral:row.electoral,popular:row.popular,outcome:row.outcome,met:success(row)});
const results=(rows,id,accessor)=>rows.filter(r=>accessor(r)===id).map(counted);
const tally=rows=>({success:rows.filter(r=>r.met).length,total:rows.length});
const chosen=[],comparisons=[],tested=[];
for(const route of discovered){
 const discoveryRuns=discovery.filter(r=>r.route===route.id),holdoutRuns=holdout.filter(r=>r.route===route.id);
 if(!discoveryRuns.length)continue;
 for(const row of [...discoveryRuns,...holdoutRuns])assert.equal(row.routeSHA256,stamp(route),route.id);
 assert.equal(discoveryRuns.length,5);
 const candidates={discovery:discoveryRuns.map(counted),holdout:holdoutRuns.map(counted)};
 tested.push({route,discovery:candidates.discovery,holdout:candidates.holdout});
 if(!holdoutRuns.length)continue;
 const baseline=baselineRows.find(row=>group(row)===group(route));
 const priorId=routeId(baseline);
 const before={discovery:results(baselineRows,priorId,routeId),holdout:results(baselineHoldout,priorId,r=>r.route)};
 assert.deepEqual(candidates.discovery.map(r=>r.seed),before.discovery.map(r=>r.seed));
 assert.deepEqual(candidates.holdout.map(r=>r.seed),before.holdout.map(r=>r.seed));
 assert(before.discovery.every(r=>!before.holdout.some(h=>h.seed===r.seed)));
 const prev=Object.fromEntries(Object.entries(before).map(([name,rows])=>[name,tally(rows)]));
 const next=Object.fromEntries(Object.entries(candidates).map(([name,rows])=>[name,tally(rows)]));
 const accepted=next.holdout.success>prev.holdout.success&&next.discovery.success>=prev.discovery.success&&next.discovery.success+next.holdout.success>=2;
 comparisons.push({achievement:route.achievement,group:group(route),original:priorId,candidate:route.id,before:prev,after:next,accepted});
 for(const [id,stages] of [[priorId,before],[route.id,candidates]]){
  if(id===route.id&&!accepted)continue;
  let stored=guide.routes.find(r=>r.id===id);
  if(!stored){stored={...route};guide.routes.push(stored);}
  const existing=new Map((stored.replays?.samples||[]).map(row=>[row.seed,row]));
  for(const [phase,runs]of Object.entries(stages))for(const replay of runs){
   existing.set(replay.seed,{seed:replay.seed,electoral:replay.electoral,unlocked:stored.achievement!=='destiny'&&replay.met,yearRecorded:stored.achievement==='destiny'&&replay.met,report:'stress-route-comparison.json',phase});
  }
  const samples=[...existing.values()];
  stored.replays={success:samples.filter(r=>r.unlocked||r.yearRecorded).length,total:samples.length,samples,holdout:tally(stages.holdout)};
  if(id===route.id){
   stored.verification=stored.achievement==='destiny'?'actual-year-record':'actual-unlock';
   stored.notes={'zh-CN':'用多组模拟波动搜索，并通过原版答题、访问和结算回放核验。','en-US':'Searched across simulated vote swings and checked by replaying native questions, visits and results.'};
   chosen.push(id);
  }
 }
}
assert(chosen.length,'No candidate passed both replay comparisons');
const scanned=baselineRows.map(r=>routeId(r));
const baselines=Array.from(new Set(baselineHoldout.map(r=>r.route))).map(id=>{
 assert(scanned.includes(id),'Unknown audited baseline '+id);
 return {route:id,discovery:results(baselineRows,id,routeId),holdout:results(baselineHoldout,id,r=>r.route)};
});
write(path.join(root,'tests/stress-route-comparison.json'),{status:'passed',date:new Date().toISOString().slice(0,10),comparison:'Discovery seeds 1,3,42,1776,2026; holdout seeds 127,149,173,197,223,251. Native browser outcomes; Destiny checks year recording.',selection:'Require more holdout successes, at least as many discovery successes and at least two combined successes.',chosen,comparisons,baselines,tested});
write(routeFile,guide);console.log('Promoted',chosen);
