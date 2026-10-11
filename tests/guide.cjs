/* Real native games; external requests blocked. No original mechanics edited. */
const fs=require('fs'),assert=require('assert'),{chromium,babel}=require('./runtime.cjs');
const {start}=require('./stories-browser.cjs');
const scenarios=require('../localization/stories/catalogue.json').scenarios;
const report={date:new Date().toISOString(),network:'Loopback/data/blob only',scenarios:[],checks:[],errors:[],external:[],missing:[]};
const reportFile=process.env.NCT_GUIDE_REPORT||'tests/guide-results.json';
// Independent test harness executes the actual current original functions with
// zero noise. It is not shipped or evaluated by the game at runtime.
const source=fs.readFileSync('static/js/campaign_trail.js','utf8'),functions={};
function walk(n){if(!n||typeof n!=='object')return;
 if(n.type==='FunctionDeclaration'&&['A','R','P','removeIssueDuplicates','divideElectoralVotesProp'].includes(n.id?.name))functions[n.id.name]=source.slice(n.start,n.end);
 for(const[k,v]of Object.entries(n))if(!['loc','extra','comments'].includes(k)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}
}walk(babel.babelParse(source,'original.js',false));
const reference=`const e=JSON.parse(JSON.stringify(input));const F=()=>0;const Math=Object.create(globalThis.Math);Math.random=()=>0.5;let a,d;${Object.values(functions).join('\n')};return A(1);`;
async function audit(page){
 return page.evaluate(code=>{
  const e=campaignTrail_temp,before=JSON.stringify(e),rng=__rngCalls;
  const reference=new Function('input',code);
  const ids=[...document.querySelectorAll('.game_answers')].map(n=>Number(n.value));
  const states=[...new Set([e.states_json[0].pk,e.states_json.at(-1).pk])];
  const cases=[e,...ids.map(id=>({...e,player_answers:[...e.player_answers,id]})),...states.map(id=>({...e,player_visits:[...e.player_visits,id]}))];
  const exact=cases.every(c=>JSON.stringify(NCTGuideModel.project(c))===JSON.stringify(reference(c)));
  NCTGuide.setEnabled(false);NCTGuide.setEnabled(true);
  NCTI18n.setLanguage('en-US');NCTI18n.setLanguage('zh-CN');
  const advice=NCTGuide.result;
  const sourceIds=advice?.answers.map(a=>a.id).sort((a,b)=>a-b);
  const finite=advice&&[advice.base,...advice.answers].every(a=>Number.isFinite(a.score)&&Number.isFinite(a.popular))&&advice.visits.every(s=>Number.isFinite(s.gain)&&Number.isFinite(s.score));
  return {exact,cases:cases.length,finite,sourceIds,ids:ids.sort((a,b)=>a-b),stateUnchanged:before===JSON.stringify(e),rngUnchanged:rng===__rngCalls,panelVisible:!document.getElementById('nct-guide-panel').hidden};
 },reference);
}
async function play(page,visible=true){
 await page.evaluate(v=>NCTGuide.setEnabled(v),visible);
 let answers=0,visits=0;
 for(let step=0;step<180;step++){
  const action=await page.evaluate(()=>{
   const click=id=>{const n=document.getElementById(id);if(n){n.click();return true;}return false;};
   if(document.getElementById('overall_results_button'))return 'done';
   if(click('ok_button'))return 'ok';if(click('final_result_button'))return 'final';if(click('confirm_visit_button'))return 'visit';
   const e=campaignTrail_temp;
   if(document.querySelector('.visit_text')){
    const target=NCTGuide.analyze(e,[]).visits[0];
    jQuery('#map_container').usmap('trigger',target.abbr,'click',{});return 'map';
   }
   const inputs=[...document.querySelectorAll('.game_answers')];
   if(inputs.length){
    const analysis=NCTGuide.analyze(e,inputs.map(n=>Number(n.value))),best=analysis.answers[0];
    inputs.find(n=>Number(n.value)===best.id).click();click('answer_select_button');return 'answer';
   }return 'wait';
  });
  if(action==='done')break;if(action==='answer'){answers++;if(process.argv.includes('--verbose')&&answers%5===0)console.log('  guide answered',answers);}if(action==='visit')visits++;if(action==='wait')await page.waitForTimeout(20);
 }
 await page.waitForSelector('#overall_results_button');
 const result=await page.evaluate(()=>({overall:campaignTrail_temp.final_overall_results,states:campaignTrail_temp.final_state_results,answers:campaignTrail_temp.player_answers,visits:campaignTrail_temp.player_visits,rngCalls:__rngCalls,outcome:campaignTrail_temp.final_outcome}));
 assert.equal(answers,25);return {answers,visits,result};
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});report.browser=browser.version();
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.route('**/*',r=>{const u=new URL(r.request().url());if(!['localhost','127.0.0.1'].includes(u.hostname)&&!['data:','blob:'].includes(u.protocol)){report.external.push(u.href);return r.abort();}return r.continue();});
  report.requestFailures=[];
  const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>report.errors.push(e.stack));page.on('requestfailed',r=>report.requestFailures.push({url:r.url(),error:r.failure()}));page.on('response',r=>{if(r.status()>=400)report.missing.push({url:r.url(),status:r.status()});});
  const selected=process.argv.includes('--smoke')?scenarios.filter(s=>['2020_Biden_Harris','2000_Nader_LaDuke','1860_Lincoln_Hamlin','1968_Wallace_LeMay','1844_Polk_Dallas'].includes(s.scope)):process.env.NCT_GUIDE_FROM?scenarios.slice(Number(process.env.NCT_GUIDE_FROM)):scenarios;
  const visibilityScopes=new Set(['2020_Biden_Harris','2000_Nader_LaDuke','1860_Lincoln_Hamlin','1968_Wallace_LeMay','1844_Polk_Dallas']);
  for(const s of selected){
   await start(page,s,'zh-CN');const auditResult=await audit(page);assert.ok(auditResult.exact&&auditResult.finite&&auditResult.stateUnchanged&&auditResult.rngUnchanged&&auditResult.panelVisible,s.scope+JSON.stringify(auditResult));assert.deepEqual(auditResult.sourceIds,auditResult.ids);
   if(s.scope==='2020_Biden_Harris'){
    for(const zoom of [0.8,1,1.25,1.5]){await page.evaluate(z=>document.documentElement.style.zoom=z,zoom);assert.ok(await page.evaluate(()=>{const p=document.getElementById('nct-guide-panel'),r=p.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1;}));}
    await page.evaluate(()=>document.documentElement.style.zoom='1');await page.setViewportSize({width:390,height:900});await page.waitForFunction(()=>document.getElementById('nct-guide-panel').getBoundingClientRect().right<=innerWidth+1);assert.ok(await page.evaluate(()=>document.getElementById('nct-guide-panel').getBoundingClientRect().right<=innerWidth+1));await page.screenshot({path:'.test-artifacts/guide-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'.test-artifacts/guide-desktop.png',fullPage:true});
   }
   await start(page,s,'zh-CN');const zh=await play(page);
   await start(page,s,'en-US');const en=await play(page);assert.deepEqual(zh,en,s.scope+' bilingual guidance numerical equivalence');
   let visibility=false;
   if(visibilityScopes.has(s.scope)){await start(page,s,'zh-CN');const off=await play(page,false);assert.deepEqual(off,zh,s.scope+' visible/hidden guide identical results/RNG');visibility=true;}
   report.scenarios.push({scope:s.scope,zeroNoiseCases:auditResult.cases,questions:zh.answers,visits:zh.visits,outcome:zh.result.outcome,overall:zh.result.overall,guideVisibilityFullGame:visibility,status:'passed'});
   if(!process.argv.includes('--smoke'))fs.writeFileSync(reportFile,JSON.stringify({...report,status:'running'},null,2)+'\n');
   console.log('PASS guide',s.scope,'25 questions; bilingual numerical equivalence',visibility?'and guide hidden equivalence':'');
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);assert.deepEqual(report.missing,[]);assert.deepEqual(report.requestFailures,[]);
  report.checks.push('Every visible answer ID included exactly once','Zero-noise projections exactly equal original calculator on current/answer/visit clones','Guide toggle and language toggle preserve entire game object and RNG count','All selected scenarios complete both languages using guide answers and visits',report.scenarios.filter(s=>s.guideVisibilityFullGame).length+' representative full games identical with guide hidden','390px and 80/100/125/150 percent CSS zoom guide layout','External network blocked; no JS errors or missing resources');
  report.status='passed';
 }catch(e){report.failure=e.stack;throw e;}finally{fs.writeFileSync(process.argv.includes('--smoke')?'tests/guide-smoke-results.json':reportFile,JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
