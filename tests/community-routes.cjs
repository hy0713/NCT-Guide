/* Actual isolated browser games. Test RNG fixtures never ship in runtime code. */
const fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),game=path.resolve(process.argv[2]||'.');
const {chromium}=require(path.join(game,'tests/runtime.cjs'));
const catalogue=JSON.parse(fs.readFileSync(path.join(game,'localization/stories/catalogue.json'),'utf8'));
const routes=JSON.parse(fs.readFileSync(path.join(root,'achievements/community-routes.json'),'utf8')).routes;
const reportFile=path.join(root,'tests',process.env.NCT_ROUTE_REPORT||'community-route-results.json');
const report=process.env.NCT_ROUTE_APPEND?JSON.parse(fs.readFileSync(reportFile,'utf8')):{date:new Date().toISOString(),status:'running',network:'All non-loopback requests blocked',runs:[],errors:[],external:[],missing:[],checks:[]};report.status='running';
const routeHash=r=>crypto.createHash('sha256').update(JSON.stringify([r.scope,r.answers,r.visits,r.difficulty,r.mode])).digest('hex');
async function start(page,route,seed,language){
 const s=catalogue.scenarios.find(s=>s.scope===route.scope);
 await page.goto((process.env.NCT_BASE_URL||'http://localhost:18081')+'/campaign-trail/index.html');
 await page.waitForFunction(()=>window.campaignTrail_temp?.running_mate_json&&document.getElementById('game_start')&&!document.getElementById('game_start').disabled);
 if(route.bigshot){page.on('dialog',dialog=>dialog.accept());for(let i=0;i<2;i++){await page.keyboard.type('BIGSHOT');await page.keyboard.press('Enter');}assert(await page.evaluate(()=>campaignTrail_temp.bigshot_mode===true),'Original BIGSHOT keyboard activation');}
 await page.evaluate(({seed,language})=>{NCTI18n.setLanguage(language);window.__rngCalls=0;Math.random=()=>{__rngCalls++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};},{seed,language});
 await page.locator('#game_start').first().click();await page.locator('#election_id').selectOption(String(s.election));await page.locator('#election_id_button').click();
 await page.locator('#candidate_id').selectOption(String(s.candidate));await page.locator('#candidate_id_button').click();await page.locator('#running_mate_id').selectOption(String(s.runningMate));await page.locator('#running_mate_id_button').click();
 await page.locator('#game_type_id').selectOption(route.mode);
 const difficulty=await page.evaluate(value=>String(campaignTrail_temp.difficulty_level_json.find(d=>d.fields.multiplier===value).pk),route.difficulty);
 await page.locator('#difficulty_level_id').selectOption(difficulty);await page.locator('#opponent_selection_id_button').click();await page.waitForSelector('.game_answers');
 if(route.cheatMultiplier!=null)await page.locator('#difficulty_mult_bigshot').fill(String(route.cheatMultiplier));
 await page.evaluate(({achievement,id})=>{NCTAchievements.select(achievement);NCTAchievements.selectRoute(id);NCTGuide.setEnabled(true);},{achievement:route.achievement,id:route.id});
 await page.waitForSelector('#achievement-target');
 const audit=await page.evaluate(()=>{const before=JSON.stringify(campaignTrail_temp),rng=__rngCalls,ids=[...document.querySelectorAll('.game_answers')].map(n=>+n.value);NCTAchievements.plan(campaignTrail_temp,NCTGuide.result,ids);NCTI18n.setLanguage('en-US');NCTI18n.setLanguage('zh-CN');return before===JSON.stringify(campaignTrail_temp)&&rng===__rngCalls;});assert(audit,'Read-only route/language state');
 await page.evaluate(lang=>NCTI18n.setLanguage(lang),language);
}
async function play(page,options={}){
 const steps=[];
 let waitingForVisit=false;
 for(let i=0;i<230;i++){
  const action=await page.evaluate(({waitingForVisit,nativeFallback})=>{
   const click=id=>{const n=document.getElementById(id);if(!n)return false;n.click();return true;};
   if(document.getElementById('overall_results_button'))return {type:'done'};
   if(click('ok_button')||click('final_result_button'))return {type:'transition'};
   if(waitingForVisit&&click('confirm_visit_button'))return {type:'confirmedVisit'};
   if(document.querySelector('.visit_text')){const first=nativeFallback?null:document.querySelector('[data-guide-state]'),id=first?+first.dataset.guideState:nativeFallback?campaignTrail_temp.states_json[0].pk:null;if(id==null)return {type:'wait'};const s=campaignTrail_temp.states_json.find(s=>s.pk===id);jQuery('#map_container').usmap('trigger',s.fields.abbr,'click',{});return {type:'visit',id,abbr:s.fields.abbr};}
   const first=nativeFallback?null:document.querySelector('[data-guide-answer]');
   if(first){const id=+first.dataset.guideAnswer,a=document.querySelector(`.game_answers[value="${id}"]`),e=campaignTrail_temp,q=e.answers_json.find(a=>a.pk===id).fields.question,p=NCTAchievements.plan(e,NCTGuide.result,[...document.querySelectorAll('.game_answers')].map(n=>+n.value));a.click();click('answer_select_button');return {type:'answer',question:q,id,routeActive:p?.route?.active??false,fromRoute:p?.route?.answer===id};}
   if(nativeFallback){const a=document.querySelector('.game_answers');if(a){const id=+a.value,q=campaignTrail_temp.answers_json.find(a=>a.pk===id).fields.question;a.click();click('answer_select_button');return {type:'answer',question:q,id,nativeFallback:true};}}
   return {type:'wait'};
  },{waitingForVisit,nativeFallback:!!options.nativeFallback});
  if(action.type==='done')return {steps,result:await page.evaluate(()=>{const e=campaignTrail_temp;return {answers:e.player_answers,visits:e.player_visits,overall:e.final_overall_results,states:e.final_state_results,outcome:e.final_outcome,rngCalls:__rngCalls,achievements:JSON.parse(localStorage.getItem('achievements'))};})};
  if(action.type==='visit')waitingForVisit=true;
  if(action.type==='confirmedVisit')waitingForVisit=false;
  if(action.type==='answer'||action.type==='visit'){steps.push(action);if(process.env.NCT_ROUTE_TRACE)console.log(action);}
  if(action.type==='wait')await page.waitForTimeout(20);
 }
 throw Error('Did not reach actual election results');
}
async function run(){
 const browser=await chromium.launch({headless:true,executablePath:process.env.NCT_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const filter=process.env.NCT_ROUTES?.split(','),ids=process.env.NCT_ROUTE_IDS?.split(','),selected=routes.filter(r=>(!filter||filter.includes(r.achievement))&&(!ids||ids.includes(r.id))&&(!process.env.NCT_ROUTE_ORIGIN||r.origin===process.env.NCT_ROUTE_ORIGIN));
  assert(selected.length,'No routes selected; refusing an empty successful report');
  const defaultSeeds=(process.env.NCT_ROUTE_SEEDS||'1776,42,2026').split(',').map(Number),witnesses=JSON.parse(process.env.NCT_ROUTE_WITNESSES||'{}');
  for(const route of selected){let first;
   const seeds=witnesses[route.id]?[witnesses[route.id]]:defaultSeeds;
   let achieved=false;
   for(const seed of seeds)for(const language of seed===seeds[0]&&process.env.NCT_ROUTE_BILINGUAL!=='off'?['zh-CN','en-US']:['zh-CN']){
    if(achieved&&process.env.NCT_ROUTE_STOP_SUCCESS)continue;
    const context=await browser.newContext({viewport:{width:1440,height:1000}});
    await context.route('**/*',r=>{const u=new URL(r.request().url());if(['localhost','127.0.0.1'].includes(u.hostname)||['data:','blob:'].includes(u.protocol))return r.continue();report.external.push(u.href);return r.abort();});
    const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.missing.push(r.url());});
    try{console.log('START',route.id,seed,language);await start(page,route,seed,language);const played=await play(page),s=catalogue.scenarios.find(s=>s.scope===route.scope),own=played.result.overall.find(r=>r.candidate===s.candidate);
     const row={route:route.id,routeSHA256:routeHash(route),achievement:route.achievement,scope:route.scope,seed,language,electoral:own.electoral_votes,popular:own.popular_votes,outcome:played.result.outcome,unlocked:played.result.achievements?.achievements?.[route.achievement]===true,progress:{yearRecorded:!!played.result.achievements?.threeosix?.[s.year],counter:played.result.achievements?.tsatrolling||0},states:played.result.states.map(row=>({state:row.state,rank:row.result.findIndex(c=>c.candidate===s.candidate)+1,margin:row.result.find(c=>c.candidate===s.candidate).percent-Math.max(...row.result.filter(c=>c.candidate!==s.candidate).map(c=>c.percent))})),steps:played.steps,answers:played.result.answers,visits:played.result.visits,rngCalls:played.result.rngCalls};report.runs.push(row);achieved=row.unlocked||(route.achievement==='destiny'&&row.progress.yearRecorded);
     assert.equal(row.answers.length,25);if(process.env.NCT_ROUTE_REQUIRE_UNLOCK)assert(row.unlocked,'Known-success fixture failed actual unlock: '+route.id);if(seed===seeds[0]){if(language==='zh-CN')first=played;else assert.deepEqual(played,first,route.id+' bilingual game/RNG equivalence');}
     console.log(route.id,seed,language,own.electoral_votes,row.unlocked?'UNLOCKED':'not unlocked');
    }finally{await context.close();fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');}
   }
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);assert.deepEqual(report.missing,[]);
  report.checks=['Every recorded run played 25 questions to actual results','Actual achievement storage recorded, including failures','Read-only planning and language switching preserve game/RNG','No external requests, missing core resources or script errors'];if(report.runs.some(r=>r.language==='en-US'))report.checks.push('Recorded English replays match the same-seed Chinese choices, visits, votes, state results and RNG');report.status='passed';
 }catch(e){report.status='failed';report.failure=e.stack;throw e;}finally{fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');await browser.close();}
}
module.exports={start,play};
if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1;});
