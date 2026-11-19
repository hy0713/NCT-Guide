/* Run the promoted routes through the installed live coach in both languages. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const game=path.resolve(process.argv[2]),root=path.resolve(__dirname,'..');
const {chromium}=require(path.join(game,'tests/runtime.cjs'));
const {start,play}=require('./community-routes.cjs');
const evidence=require('./optimizer-route-comparison.json');
const {routes}=require('../achievements/community-routes.json');
const report={status:'running',runs:[],errors:[],external:[],missing:[]};

async function replay(browser,route,seed,language){
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
  await start(page,{...route,id:''},seed,language);
  await page.locator('[data-achievement-advice="fixed"]').waitFor();
  const live=await page.evaluate(id=>{
   const e=campaignTrail_temp,rule=NCTAchievementData.rules.find(r=>r.id===id);
   const ids=[...document.querySelectorAll('.game_answers')].map(node=>+node.value);
   return {route:NCTAchievements.routeInfo(e,rule,ids).route.id,candidate:e.candidate_id,
    visitCodes:NCTGuide.result.visits.map(state=>state.abbr),clickable:NCTAchievementData.visitMap};
  },route.achievement);
  assert.equal(live.route,route.id,'The installed coach should choose the promoted route');
  assert(live.visitCodes.every(abbr=>live.clickable.includes(abbr)));
  const holdout=await page.locator('[data-achievement-holdout]').innerText();
  assert(holdout.includes(route.replays.holdout.success+'/'+route.replays.holdout.total));
  const played=await play(page);
  const {result,steps}=played,own=result.overall.find(row=>row.candidate===live.candidate);
  assert.equal(result.answers.length,25);
  assert(steps.filter(step=>step.type==='answer').every(step=>step.fromRoute));
  assert.deepEqual(steps.filter(step=>step.type==='visit').map(step=>step.abbr),route.visits.sequence);
  if(route.achievement==='swap')assert(!result.answers.includes(3326));
  assert.equal(result.achievements.achievements[route.achievement],true);
  assert.equal(await page.locator('[data-achievement-result]').getAttribute('data-achievement-result'),'unlocked');
  const routeSHA256=crypto.createHash('sha256').update(JSON.stringify([route.scope,route.answers,route.visits,route.difficulty,route.mode])).digest('hex');
  report.runs.push({route:route.id,scope:route.scope,achievement:route.achievement,routeSHA256,seed,language,
   electoral:own.electoral_votes,popular:own.popular_votes,unlocked:true,outcome:result.outcome,rngCalls:result.rngCalls,steps});
  console.log('PASS',route.id,language,own.electoral_votes);
  return played;
 }finally{await context.close();}
}

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.NCT_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  for(const {promoted} of evidence.selection){
   const route=routes.find(row=>row.id===promoted);
   const trial=evidence.trials.find(row=>row.route.id===promoted);
   const seed=trial.holdout.find(row=>row.unlocked).seed;
   const chinese=await replay(browser,route,seed,'zh-CN');
   assert.deepEqual(await replay(browser,route,seed,'en-US'),chinese,'Bilingual votes, state ranks, steps and RNG must match');
  }
  const context=await browser.newContext();
  await context.route('**/*',q=>['localhost','127.0.0.1'].includes(new URL(q.request().url()).hostname)?q.continue():q.abort());
  try{
   const page=await context.newPage();
   await start(page,{id:'',scope:'1968_Humphrey_Connally',mode:'1',difficulty:.97,achievement:'ratio'},1973,'zh-CN');
   assert.match(await page.locator('[data-achievement-setup]').innerText(),/马斯基/);
   const before=await page.evaluate(()=>[JSON.stringify(campaignTrail_temp),__rngCalls,localStorage.getItem('achievements')]);
   await page.locator('#language-toggle').click();
   assert.match(await page.locator('[data-achievement-setup]').innerText(),/Muskie/);
   assert.deepEqual(await page.evaluate(()=>[JSON.stringify(campaignTrail_temp),__rngCalls,localStorage.getItem('achievements')]),before);
   report.restartSuggestion='The old Humphrey/Connally pairing recommends Humphrey/Muskie in both languages without restarting or consuming RNG';

   const vice=evidence.selection.find(row=>routes.find(r=>r.id===row.promoted).achievement==='Vice');
   const previous=routes.find(row=>row.id===vice.previous),revised=routes.find(row=>row.id===vice.promoted);
   const seed=evidence.trials.find(row=>row.route.id===revised.id).holdout.find(row=>row.unlocked).seed;
   await start(page,previous,seed,'zh-CN');
   for(let i=0;i<2;i++){
    const answer=await page.locator('[data-guide-answer]').first().getAttribute('data-guide-answer');
    await page.locator('.game_answers[value="'+answer+'"]').check();
    await page.locator('#answer_select_button').click();
    if(await page.locator('#ok_button').count())await page.locator('#ok_button').click();
   }
   await page.locator('.visit_text').waitFor();
   const abbr=revised.visits.sequence[0];
   assert.notEqual(abbr,previous.visits.sequence[0]);
   await page.evaluate(abbr=>{
    const hitArea=[...document.querySelectorAll('#map_container svg *')].find(node=>node.dataState===abbr);
    hitArea.dispatchEvent(new MouseEvent('click',{bubbles:true}));
   },abbr);
   await page.locator('#confirm_visit_button').click();
   await page.locator('[data-achievement-resumed]').waitFor();
   const adapted=await play(page);
   assert.equal(adapted.result.achievements.achievements.Vice,true);
   report.recovered={from:previous.id,to:revised.id,seed,unlocked:true};
  }finally{await context.close();}
  for(const field of ['errors','external','missing'])assert.deepEqual(report[field],[]);
  report.status='passed';
 }catch(error){report.status='failed';report.failure=error.stack;throw error;}
 finally{
  fs.writeFileSync(path.join(root,'tests/optimizer-coach-results.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
