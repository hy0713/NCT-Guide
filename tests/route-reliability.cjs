/* Separate candidate replay from actual UI coaching; record every failure. */
const fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),game=path.resolve(process.argv[2]||'.');
const {chromium}=require(path.join(game,'tests/runtime.cjs')),{start,play}=require('./community-routes.cjs');
const routes=JSON.parse(fs.readFileSync(process.env.NCT_RELIABILITY_ROUTES||path.join(root,'achievements/community-routes.json'),'utf8')).routes;
const ids=process.env.NCT_RELIABILITY_IDS?.split(',')||['thebern-2016_Clinton_Sanders-1-0.97-margin-review'];
const seeds=(process.env.NCT_RELIABILITY_SEEDS||'1,2,3,4,5,1776,42,2026').split(',').map(Number);
const candidate=process.env.NCT_RELIABILITY_CANDIDATE==='1';
const report={date:new Date().toISOString(),status:'running',method:candidate?'Test-only fixed candidate answers/visits through native controls':'Follow the visible in-game advice with automatic route selection',runs:[],errors:[],external:[]};
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 for(const id of ids)for(const seed of seeds){const route=routes.find(r=>r.id===id);assert(route,id);
  const c=await b.newContext({viewport:{width:1440,height:1000}});await c.route('**/*',r=>{const u=new URL(r.request().url());if(['127.0.0.1','localhost'].includes(u.hostname)||['data:','blob:'].includes(u.protocol))return r.continue();report.external.push(u.href);return r.abort()});
  try{const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await start(p,{...route,id:''},seed,'zh-CN');
   const played=await play(p,candidate?{fixedRoute:route}:{}),s=await p.evaluate(()=>({candidate:campaignTrail_temp.candidate_id,coachingRoute:NCTAchievements.routeInfo(campaignTrail_temp,NCTAchievementData.rules.find(r=>r.id===NCTAchievements.selected),[])?.route.id,diagnosis:NCTAchievements.diagnosis(campaignTrail_temp,NCTAchievementData.rules.find(r=>r.id===NCTAchievements.selected)),html:document.querySelector('[data-achievement-result]')?.textContent}));
   const own=played.result.overall.find(r=>r.candidate===s.candidate);
   const row={route:id,achievement:route.achievement,scope:route.scope,seed,language:'zh-CN',electoral:own.electoral_votes,popular:own.popular_votes,outcome:played.result.outcome,unlocked:!!played.result.achievements?.achievements?.[route.achievement],progress:{yearRecorded:!!played.result.achievements?.threeosix?.[route.scope.split('_')[0]]},diagnosis:s.diagnosis,resultText:s.html,steps:played.steps,answers:played.result.answers,visits:played.result.visits,rngCalls:played.result.rngCalls};report.runs.push(row);
   row.coachingRoute=s.coachingRoute;
   if(candidate)row.routeSHA256=crypto.createHash('sha256').update(JSON.stringify([route.scope,route.answers,route.visits,route.difficulty,route.mode])).digest('hex');
   assert.equal(row.answers.length,25);assert.equal(s.diagnosis.votes,row.electoral);assert.equal(s.diagnosis.unlocked,row.unlocked);if(!candidate)assert(s.html?.includes(String(row.electoral)),'Actual results visible in coach');
   console.log(id,seed,row.electoral,row.unlocked?'UNLOCKED':'not unlocked');
  }finally{await c.close();fs.writeFileSync(path.join(root,'tests',process.env.NCT_RELIABILITY_REPORT||'route-reliability-results.json'),JSON.stringify(report,null,2)+'\n')}
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);report.status='passed';
}catch(e){report.status='failed';report.failure=e.stack;throw e}finally{await b.close();fs.writeFileSync(path.join(root,'tests',process.env.NCT_RELIABILITY_REPORT||'route-reliability-results.json'),JSON.stringify(report,null,2)+'\n')}})().catch(e=>{console.error(e);process.exitCode=1});
