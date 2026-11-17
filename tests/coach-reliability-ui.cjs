const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),game=path.resolve(process.argv[2]||'.');
const {chromium}=require(path.join(game,'tests/runtime.cjs')),{start,play}=require('./community-routes.cjs');
const report={date:new Date().toISOString(),status:'running',checks:[],errors:[],external:[]};
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const c=await b.newContext({viewport:{width:1440,height:1000}});await c.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():(report.external.push(r.request().url()),r.abort()));
 const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
 await start(p,{scope:'2016_Clinton_Sanders',mode:'1',difficulty:.97,achievement:'thebern',id:''},3,'zh-CN');
 assert.equal(await p.locator('[data-achievement-advice]').getAttribute('data-achievement-advice'),'fixed');
 assert.equal(await p.evaluate(()=>NCTAchievements.routeInfo(campaignTrail_temp,NCTAchievementData.rules.find(r=>r.id==='thebern'),[]).route.id),'thebern-2016_Clinton_Sanders-1-0.97-margin-review');
 const state=()=>p.evaluate(()=>[JSON.stringify(campaignTrail_temp),__rngCalls]);const before=await state();
 await p.evaluate(()=>{NCTAchievements.selectRoute('thebern-community');NCTGuide.refresh()});
 assert.equal(await p.evaluate(()=>NCTAchievements.routeInfo(campaignTrail_temp,NCTAchievementData.rules.find(r=>r.id==='thebern'),[]).route.id),'thebern-2016_Clinton_Sanders-1-0.97-margin-review');assert.deepEqual(await state(),before);
 report.checks.push('Automatic selection prefers the revised tested route; zero-unlock community route cannot override it');
 const artifacts=path.join(game,'.test-artifacts');await p.locator('#nct-guide-panel').screenshot({path:path.join(artifacts,'achievement-tested-route-review.png')});
 await play(p);
 const conditions=JSON.parse(fs.readFileSync(path.join(root,'achievements/source-audit.json'),'utf8')).achievements;
 const parity=await p.evaluate(conditions=>{
  const e=campaignTrail_temp,before=JSON.stringify(e),rng=__rngCalls,saved=JSON.parse(localStorage.getItem('achievements')),n=e.final_overall_results.findIndex(row=>row.candidate===e.candidate_id);
  for(const row of conditions){const run={...saved,achievements:{...saved.achievements,[row.id]:false}},original=new Function('e','campaignTrail_temp','run','n','modded','containsObject','return !!('+row.condition+');');
   if(original(e,e,run,n,false,(id,list)=>list.includes(id))!==NCTAchievementData.testCondition(row.id,e,saved))throw Error('Native condition differs: '+row.id);
  }
  return {count:conditions.length,unchanged:before===JSON.stringify(e)&&rng===__rngCalls,result:document.querySelector('[data-achievement-result]')?.dataset.achievementResult};
 },conditions);assert.equal(parity.count,31);assert(parity.unchanged);assert.equal(parity.result,'unlocked');report.checks.push('One actual coached Bern completion; all 31 generated final-condition checks equal the audited original expressions and preserve game/RNG');
 await p.locator('#nct-guide-panel').screenshot({path:path.join(artifacts,'achievement-result-review.png')});
 await start(p,{scope:'2020_Biden_Duckworth',mode:'1',difficulty:.97,achievement:'ridingBiden',id:''},3,'zh-CN');
 const loading=await p.evaluate(()=>{NCTAchievements.cancelPlanning();NCTGuide.refresh();return {pending:NCTAchievements.planningPending,advice:document.querySelectorAll('[data-guide-answer]').length}});assert(loading.pending);assert.equal(loading.advice,0);
 await p.waitForFunction(()=>!NCTAchievements.planningPending);assert.equal(await p.locator('[data-achievement-advice]').getAttribute('data-achievement-advice'),'model');assert(await p.locator('.nct-achievements').innerText().then(s=>s.includes('戴明斯')));report.checks.push('No tested route for Duckworth: show model label and tested alternative pairing; hide provisional advice while worker is running');
 await p.locator('#nct-guide-panel').screenshot({path:path.join(artifacts,'achievement-model-route-review.png')});
 await start(p,{scope:'1960_Kennedy_Johnson',mode:'1',difficulty:.97,achievement:'BCitsHard',id:''},3,'zh-CN');
 assert.equal(await p.locator('[data-achievement-advice]').getAttribute('data-achievement-advice'),'ordinary');assert.match(await p.locator('#nct-guide-panel h4').innerText(),/普通胜选/);report.checks.push('Ineligible difficulty labels the remaining advice as ordinary victory advice');
 await start(p,{scope:'2012_Obama_Biden',mode:'1',difficulty:.97,achievement:'realdebate',id:''},3,'zh-CN');
 const wrong=await p.evaluate(()=>[...document.querySelectorAll('.game_answers')].find(n=>+n.value!==729).value);await p.locator(`.game_answers[value="${wrong}"]`).check();await p.locator('#answer_select_button').click();if(await p.locator('#ok_button').count())await p.locator('#ok_button').click();
 assert.equal(await p.locator('[data-achievement-advice]').getAttribute('data-achievement-advice'),'ordinary');assert.equal(await p.locator('[data-achievement-status]').getAttribute('data-achievement-status'),'missed');const unchanged=await state();await p.locator('#language-toggle').click();assert.equal(await p.locator('[data-achievement-advice]').getAttribute('data-achievement-advice'),'ordinary');assert.deepEqual(await state(),unchanged);report.checks.push('Actually missing a mandatory answer stays visibly blocked in both languages; guide interactions preserve game and RNG');
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);report.status='passed';
}catch(e){report.status='failed';report.failure=e.stack;throw e}finally{await b.close();fs.writeFileSync(path.join(root,'tests/coach-reliability-ui-results.json'),JSON.stringify(report,null,2)+'\n')}})().catch(e=>{console.error(e);process.exitCode=1});
