/* Exercise new routes through the installed coach and complete Destiny in a real save. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const game=path.resolve(process.argv[2]),root=path.resolve(__dirname,'..');
const {chromium}=require(path.join(game,'tests/runtime.cjs'));
const {start,play}=require('./community-routes.cjs');
const {routes}=require('../achievements/community-routes.json');
const {selection,trials}=require('./ensemble-route-comparison.json');
const prior=require('./procedural-achievement-results.json').cases.find(c=>c.achievement==='destiny'&&c.language==='en-US');
const report={status:'running',runs:[],cumulative:[],errors:[],external:[],missing:[]};
const pick=id=>routes.find(route=>route.id===id);
const year=route=>route.scope.split('_')[0];
const choices=selection.map(({promoted})=>{
 const route=pick(promoted),trial=trials.find(t=>t.route.id===promoted);
 const seed=trial.holdout.find(run=>run.unlocked||route.achievement==='destiny'&&run.yearRecorded).seed;
 return {route,seed};
});

async function withPage(browser,action){
 const context=await browser.newContext();
 await context.route('**/*',request=>{
  const url=new URL(request.request().url());
  if(['localhost','127.0.0.1'].includes(url.hostname)||['data:','blob:'].includes(url.protocol))return request.continue();
  report.external.push(url.href);return request.abort();
 });
 try{
  const page=await context.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400)report.missing.push(response.url());});
  return await action(page);
 }finally{await context.close();}
}

async function replay(page,route,seed,language,automatic){
 await start(page,{...route,id:automatic?'':route.id},seed,language);
 if(automatic){
  await page.locator('[data-achievement-advice="fixed"]').waitFor();
  const chosen=await page.evaluate(id=>{
   const rule=NCTAchievementData.rules.find(r=>r.id===id);
   const ids=[...document.querySelectorAll('.game_answers')].map(node=>+node.value);
   return NCTAchievements.routeInfo(campaignTrail_temp,rule,ids).route.id;
  },route.achievement);
  assert.equal(chosen,route.id);
 }
 const played=await play(page);
 const {result,steps}=played;
 assert.equal(result.answers.length,25);
 if(automatic){
  assert(steps.filter(step=>step.type==='answer').every(step=>step.fromRoute));
  assert.deepEqual(steps.filter(step=>step.type==='visit').map(step=>step.abbr),route.visits.sequence);
 }
 return played;
}

async function cumulative(browser,language){
 return withPage(browser,async page=>{
  const entries=[];
  for(const legacy of prior.games){
   const candidate=choices.find(item=>item.route.achievement==='destiny'&&year(item.route)===legacy.year);
   const {route,seed}=candidate||{route:pick(legacy.route),seed:legacy.seed};
   const played=await replay(page,route,seed,language,!!candidate);
   assert.equal(played.result.achievements.threeosix[legacy.year],true);
   const last=entries.length===prior.games.length-1;
   assert.equal(!!played.result.achievements.achievements.destiny,last);
   const result=await page.locator('[data-achievement-result]').getAttribute('data-achievement-result');
   assert.equal(result,last?'unlocked':'year-recorded');
   if(!last)assert((await page.locator('[data-achievement-result]').innerText()).includes(legacy.year));
   entries.push({route:route.id,seed,year:legacy.year,played,updated:!!candidate});
   console.log('PASS cumulative',language,legacy.year,route.id,result);
  }
  report.cumulative.push({language,unlocked:true,years:entries.map(({year,route,seed,updated,played})=>({
   year,route,seed,updated,rngCalls:played.result.rngCalls,...(updated?{played}:{})
  }))});
  return entries;
 });
}

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.NCT_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const chinese=await cumulative(browser,'zh-CN');
  assert.deepEqual(await cumulative(browser,'en-US'),chinese,'Bilingual game results and RNG must match across the seven years');
  for(const {route,seed} of choices.filter(item=>item.route.achievement!=='destiny')){
   let chinese;
   for(const language of ['zh-CN','en-US'])await withPage(browser,async page=>{
    const played=await replay(page,route,seed,language,true),{result,steps}=played;
    assert.equal(result.achievements.achievements[route.achievement],true);
    if(language==='zh-CN')chinese=played;else assert.deepEqual(played,chinese);
    const candidate=await page.evaluate(()=>campaignTrail_temp.candidate_id);
    const electoral=result.overall.find(row=>row.candidate===candidate).electoral_votes;
    const routeSHA256=crypto.createHash('sha256').update(JSON.stringify([route.scope,route.answers,route.visits,route.difficulty,route.mode])).digest('hex');
    report.runs.push({route:route.id,scope:route.scope,achievement:route.achievement,routeSHA256,seed,language,electoral,steps,unlocked:true});
    console.log('PASS single',route.id,language,electoral);
   });
  }
  await withPage(browser,async page=>{
   const candidate=choices.find(item=>item.route.achievement==='destiny'&&year(item.route)==='2016');
   if(!candidate)return;
   const previous=selection.find(item=>item.promoted===candidate.route.id).previous;
   await start(page,pick(previous),candidate.seed,'zh-CN');
   const suggested=await page.evaluate(()=>NCTAchievements.suggestions(NCTAchievementData.rules.find(r=>r.id==='destiny'),'2016')[0].verified.id);
   assert.equal(suggested,candidate.route.id);
   await page.locator('[data-achievement-setup]').waitFor();
   report.sameYearSuggestion=suggested;
  });
  for(const field of ['errors','external','missing'])assert.deepEqual(report[field],[]);
  report.status='passed';
 }catch(error){report.status='failed';report.failure=error.stack;throw error;}
 finally{fs.writeFileSync(path.join(root,'tests/ensemble-coach-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
