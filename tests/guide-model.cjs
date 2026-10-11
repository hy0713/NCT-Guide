const fs=require('fs'),assert=require('assert'),{chromium}=require('./runtime.cjs');
const {start}=require('./stories-browser.cjs');
const scenarios=require('../localization/stories/catalogue.json').scenarios;
const report={date:new Date().toISOString(),status:'running',scenarios:[],errors:[],external:[],checks:[]};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});report.browser=browser.version();
 try{
  const context=await browser.newContext();await context.route('**/*',r=>{const u=new URL(r.request().url());if(!['localhost','127.0.0.1'].includes(u.hostname)&&!['data:','blob:'].includes(u.protocol)){report.external.push(u.href);return r.abort();}return r.continue();});
  report.requestFailures=[];
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.stack));page.on('requestfailed',r=>report.requestFailures.push({url:r.url(),error:r.failure()}));
  for(const s of scenarios){
   await start(page,s,'zh-CN');
   const check=await page.evaluate(()=>{
    const e=campaignTrail_temp,ids=[...document.querySelectorAll('.game_answers')].map(n=>Number(n.value));
    const before=JSON.stringify(e),rng=__rngCalls;let cases=0,maxError=0;
    // Exercise every current UI mode with low, normal and high multipliers.
    for(const mode of ['1','2','3'])for(const multiplier of [0.6,0.97,1.3]){
     const copy={...e,game_type_id:mode,difficulty_level_multiplier:multiplier};
     const advice=NCTGuide.analyze(copy,ids);
     for(const id of [copy.states_json[0].pk,copy.states_json.at(-1).pk]){
      const full=NCTGuide.summary(copy,NCTGuideModel.project({...copy,player_visits:[...copy.player_visits,id]}));
      const target=advice.visits.find(r=>r.id===id),state=full.states.find(r=>r.id===id),base=advice.base.states.find(r=>r.id===id);
      maxError=Math.max(maxError,Math.abs(target.score-(full.score-advice.base.score)),Math.abs(target.gain-(state.margin-base.margin)));cases++;
     }
    }
    NCTGuide.setEnabled(true);document.querySelector('#guide-toggle').click();document.querySelector('#guide-toggle').click();
    const panel=document.getElementById('nct-guide-panel'),chinese=/[\u3400-\u9fff]/.test(panel.textContent);
    NCTI18n.setLanguage('en-US');const english=panel.querySelector('h3')?.textContent==='Campaign guide: current-state forecasts';NCTI18n.setLanguage('zh-CN');
    return {cases,maxError,chinese,english,mode:e.game_type_id,stateUnchanged:JSON.stringify(e)===before,rngUnchanged:rng===__rngCalls};
   });
   assert.equal(check.maxError,0,s.scope+' optimized visits exactly match complete original projection');assert.ok(check.chinese&&check.english&&check.stateUnchanged&&check.rngUnchanged,s.scope+JSON.stringify(check));
   report.scenarios.push({scope:s.scope,...check,status:'passed'});console.log('PASS model',s.scope,check.cases,'mode/difficulty/visit cases');
   fs.writeFileSync('tests/guide-model-results.json',JSON.stringify(report,null,2)+'\n');
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);assert.deepEqual(report.requestFailures,[]);report.status='passed';
  report.checks=['All 105 native pairings load and yield bilingual recommendations','Optimized single-state visit projections exactly match complete national recalculations','1890 visit comparisons: 105 pairings × 3 modes × 3 multipliers × 2 states','Mouse toggles and language changes preserve entire game object and RNG count','External network blocked'];
 }catch(e){report.failure=e.stack;throw e;}finally{fs.writeFileSync('tests/guide-model-results.json',JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
