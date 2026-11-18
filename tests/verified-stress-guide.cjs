/* Play each promoted route through the visible coach and check the exact-vote fallback. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),game=path.resolve(process.argv[2]);
const {chromium}=require(path.join(game,'tests/runtime.cjs')),{start,play}=require('./community-routes.cjs');
const evidence=require('./stress-route-comparison.json');
const report={status:'running',routes:[],errors:[],external:[],missing:[]};
async function context(browser){
 const c=await browser.newContext();
 await c.route('**/*',r=>{const url=new URL(r.request().url());if(['127.0.0.1','localhost'].includes(url.hostname)||['data:','blob:'].includes(url.protocol))return r.continue();report.external.push(url.href);return r.abort();});
 const page=await c.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.missing.push(r.url());});
 return {c,page};
}
async function replay(browser,trial,language){
 const {route,holdout}=trial,fixture=holdout.find(x=>x.met);
 const {c,page}=await context(browser);
 try{
  await start(page,{...route,id:''},fixture.seed,language);
  await page.locator('[data-achievement-advice="fixed"]').waitFor();
  const selected=await page.evaluate(id=>{
   const e=campaignTrail_temp,rule=NCTAchievementData.rules.find(r=>r.id===id);
   return NCTAchievements.routeInfo(e,rule,[]).route.id;
  },route.achievement);
  assert.equal(selected,route.id,'Automatic recommendation');
  const label=await page.locator('[data-achievement-holdout]').innerText();
  assert(label.includes(holdout.filter(x=>x.met).length.toString()+'/'+holdout.length));
  const {result,steps}=await play(page);
  const met=route.achievement==='destiny'?result.achievements.threeosix[route.scope.split('_')[0]]:result.achievements.achievements[route.achievement];
  assert(met,route.id);assert.equal(result.answers.length,25);
  assert(steps.filter(step=>step.type==='answer').every(step=>step.fromRoute));
  report.routes.push({id:route.id,seed:fixture.seed,language,unlocked:!!result.achievements.achievements[route.achievement],yearRecorded:route.achievement==='destiny'&&!!met,label,steps:steps.length});
  console.log('PASS visible coach',route.id,language);
  return result;
 }finally{await c.close();}
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.NCT_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  for(const id of evidence.chosen){const trial=evidence.tested.find(t=>t.route.id===id),zh=await replay(browser,trial,'zh-CN');if(trial.route.achievement==='Dewey')assert.deepEqual(await replay(browser,trial,'en-US'),zh);}
  const {c,page}=await context(browser);
  try{
   await start(page,{id:'',scope:'2020_Biden_Duckworth',mode:'1',difficulty:.97,achievement:'nomalarkey'},127,'zh-CN');
   const initial=await page.evaluate(()=>[JSON.stringify(campaignTrail_temp),__rngCalls]);
   await page.locator('[data-achievement-advice="model"]').waitFor();
   await page.waitForFunction(()=>{
    const ids=[...document.querySelectorAll('.game_answers')].map(n=>+n.value);
    return !NCTAchievements.planningPending&&!!NCTAchievements.plan(campaignTrail_temp,NCTGuide.result,ids)?.planning;
   });
   assert.deepEqual(await page.evaluate(()=>[JSON.stringify(campaignTrail_temp),__rngCalls]),initial);
   report.fallback='Exact-vote fallback finished in the worker without changing campaign state or consuming RNG';
  }finally{await c.close();}
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);assert.deepEqual(report.missing,[]);
  report.status='passed';
 }catch(error){report.status='failed';report.failure=error.stack;throw error;}
 finally{fs.writeFileSync(path.join(root,'tests/verified-stress-guide-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
