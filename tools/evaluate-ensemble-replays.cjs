/* Summarize native-browser screen/validation replays and select a route per objective. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),work=path.resolve(process.argv[2]);
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const source=read(path.join(root,'achievements/community-routes.json')).routes;
const files=fs.readdirSync(work);
const modeled=files.filter(f=>/^achievement-ensemble-(?:\d+|focus-[a-z0-9-]+)\.json$/.test(f)).flatMap(f=>read(path.join(work,f)).routes);
const routes=new Map([...source,...modeled].map(route=>[route.id,route]));
const baselineIds=[
 'whatbelt-2016_Clinton_Kaine-2-0.97-stress-v1','BCitsHard-community',
 'magaa-2020_Trump_Haley-1-0.97-stress-robust-15877',
 'destiny-2016_Clinton_Kaine-2-0.9-stress-v1','destiny-2000_Gore_Graham-2-0.97-search'
];
const seedSets={discovery:[421,1103,2309,3413],holdout:[667,1877,2851,4157,5437,7673,8933,10093]};
const group=r=>r.achievement==='destiny'?'destiny-'+r.scope.split('_')[0]:r.achievement;
const digest=r=>crypto.createHash('sha256').update(JSON.stringify([r.scope,r.answers,r.visits,r.difficulty,r.mode])).digest('hex');
const trials=new Map();

for(const filename of files.filter(f=>/^achievement-ensemble-(discovery|holdout)-.+\.json$/.test(f))){
 const phase=filename.split('-')[2],report=read(path.join(work,filename));
 assert.equal(report.status,'passed',filename);assert.deepEqual(report.errors,[],filename);assert.deepEqual(report.external,[],filename);
 for(const run of report.runs){
  const route=routes.get(run.route);assert(route,run.route);
  assert(seedSets[phase].includes(run.seed),filename+' '+run.seed);
  const routeSHA256=digest(route);
  if(run.routeSHA256)assert.equal(run.routeSHA256,routeSHA256);
  else assert.equal(run.coachingRoute,run.route,'Replay must follow the coach route');
  if(!trials.has(route.id)){
   const {id,achievement,scope,mode,difficulty,source,origin,answers,visits,search}=route;
   trials.set(id,{route:{id,achievement,scope,mode,difficulty,source,origin,answers,visits,search},routeSHA256,clickable:true,discovery:[],holdout:[]});
  }
  const record={seed:run.seed,electoral:run.electoral,popular:run.popular,outcome:run.outcome,
   unlocked:run.unlocked,yearRecorded:run.progress.yearRecorded,reasons:run.diagnosis.reasons};
  const stage=trials.get(route.id)[phase];
  assert(!stage.some(row=>row.seed===record.seed),'Duplicate run '+route.id+' '+record.seed);
  stage.push(record);
 }
}
const tally=(trial,phase)=>trial[phase].filter(row=>trial.route.achievement==='destiny'?row.yearRecorded:row.unlocked).length;
const comparisons=[],selection=[];
for(const id of baselineIds){
 const before=trials.get(id);assert(before,id);
 for(const phase of Object.keys(seedSets))assert.deepEqual(before[phase].map(row=>row.seed),seedSets[phase],id);
 const candidates=[...trials.values()].filter(t=>t!==before&&group(t.route)===group(before.route)&&t.holdout.length);
 for(const trial of candidates){
  for(const phase of Object.keys(seedSets))assert.deepEqual(trial[phase].map(row=>row.seed),seedSets[phase],trial.route.id);
  const old={discovery:tally(before,'discovery'),holdout:tally(before,'holdout')};
  const next={discovery:tally(trial,'discovery'),holdout:tally(trial,'holdout')};
  comparisons.push({objective:group(before.route),previous:id,candidate:trial.route.id,old,next,
   improved:next.holdout>old.holdout&&next.discovery+next.holdout>=2&&next.discovery+next.holdout>old.discovery+old.holdout});
 }
 const best=comparisons.filter(row=>row.previous===id&&row.improved)
  .sort((a,b)=>b.next.holdout-a.next.holdout||b.next.discovery-a.next.discovery||a.candidate.localeCompare(b.candidate))[0];
 if(best)selection.push({previous:id,promoted:best.candidate,reason:'better-replays'});
}
const played=[...trials.values()].reduce((n,row)=>n+row.discovery.length+row.holdout.length,0);
const report={date:new Date().toISOString(),status:'passed',seedSets,
 selectionCriteria:'More separate validation successes, more successes across both sets, and at least two overall. Destiny success means the year was recorded in the native save.',
 network:'All non-loopback requests blocked. Visits dispatched through native map SVG hit areas.',
 modeled:modeled.map(({id,search})=>({id,search})),played,comparisons,selection,trials:[...trials.values()]};
fs.writeFileSync(path.join(root,'tests/ensemble-route-comparison.json'),JSON.stringify(report,null,2)+'\n');
console.log(modeled.length,'simulated candidates;',played,'native replays; promoted',selection.map(r=>r.promoted));
