/* Use native keyboard/menu controls only; no achievement or multiplier writes. */
const fs=require('fs'),path=require('path'),assert=require('assert');
const game=path.resolve(process.argv[2]||'.'),root=path.resolve(__dirname,'..');
const {chromium}=require(path.join(game,'tests/runtime.cjs')),{start,play}=require('./community-routes.cjs');
const report=['counter','destiny'].includes(process.env.NCT_PROCEDURAL)&&fs.existsSync(path.join(root,'tests/procedural-achievement-results.json'))?JSON.parse(fs.readFileSync(path.join(root,'tests/procedural-achievement-results.json'),'utf8')):{date:new Date().toISOString(),status:'running',network:'Non-loopback blocked',cases:[],errors:[],external:[]};report.status='running';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 async function context(){const c=await browser.newContext();await c.route('**/*',r=>{const u=new URL(r.request().url());if(['localhost','127.0.0.1'].includes(u.hostname)||['data:','blob:'].includes(u.protocol))return r.continue();report.external.push(u.href);return r.abort();});return c;}
 if(!['counter','destiny'].includes(process.env.NCT_PROCEDURAL))for(const [achievement,cheatMultiplier]of [['yourchance',null],['stillAlive',41]]){
  const c=await context(),page=await c.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await start(page,{id:'procedural',scope:'1968_Wallace_LeMay',mode:'1',difficulty:.97,achievement,bigshot:true,cheatMultiplier},1776,'zh-CN');
  // Special cheat-related achievements are tested using ordinary manual choices.
  await page.evaluate(enabled=>NCTGuide.setEnabled(enabled),achievement==='stillAlive');const result=await play(page,{nativeFallback:achievement!=='stillAlive'});
  const actual=await page.evaluate(id=>({unlocked:JSON.parse(localStorage.getItem('achievements')).achievements[id]===true,bigshot:campaignTrail_temp.bigshot_mode,multiplier:campaignTrail_temp.difficulty_level_multiplier,ownEV:campaignTrail_temp.final_overall_results.find(r=>r.candidate===campaignTrail_temp.candidate_id).electoral_votes,lostStates:campaignTrail_temp.final_state_results.filter(row=>row.result[0].candidate!==campaignTrail_temp.candidate_id).map(row=>campaignTrail_temp.states_json.find(s=>s.pk===row.state)?.fields.name)}),achievement);
  report.cases.push({achievement,...actual,questions:result.result.answers.length});console.log(achievement,actual);assert(actual.unlocked,achievement+' actual native unlock');await c.close();
 }
 if(!['special','destiny'].includes(process.env.NCT_PROCEDURAL)){
  const c=await context(),page=await c.newPage();page.on('pageerror',e=>report.errors.push(e.message));const games=[];
  for(let n=1;n<=100;n++){
   await start(page,{id:'procedural',scope:'2016a_Clinton_Booker',mode:'1',difficulty:.97,achievement:'what'},1776+n,'zh-CN');await page.evaluate(()=>NCTGuide.setEnabled(false));const result=await play(page,{nativeFallback:true});
   const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('achievements')));games.push({game:n,questions:result.result.answers.length,counter:stored.tsatrolling,why:!!stored.achievements.why,what:!!stored.achievements.what});assert.equal(stored.tsatrolling,n);if(n===1)assert(stored.achievements.why);if(n%10===0)console.log('Actual 2016a completions',n,'counter',stored.tsatrolling);
  }
  assert(games.at(-1).what);report.cases.push({achievement:'what',games,unlocked:true});await c.close();
 }
 if(process.env.NCT_PROCEDURAL==='destiny'){
  const data=JSON.parse(fs.readFileSync(path.join(root,'achievements/community-routes.json'),'utf8')).routes;
  const cases=[['destiny-2020-Bass-community',1],['destiny-destiny2016-community',4],['destiny-2012_Obama_Biden-2-0.97-search',10],['destiny-2000_Gore_Graham-2-0.97-search',8],['destiny-1988-Jackson-community',1],['destiny-destiny1976-community',1],['destiny-1964_Johnson_Humphrey-2-0.97-search',29]];
  let chinese;
  for(const language of ['zh-CN','en-US']){const c=await context(),page=await c.newPage(),games=[];page.on('pageerror',e=>report.errors.push(e.message));
   for(const[id,seed]of cases){const route=data.find(r=>r.id===id);assert(route);await start(page,route,seed,language);const played=await play(page),stored=played.result.achievements;const year=route.scope.split('_')[0];assert(stored.threeosix[year],year+' actually recorded');games.push({route:id,seed,year,played});console.log('Actual cumulative destiny',language,year,Object.keys(stored.threeosix).filter(y=>stored.threeosix[y]));}
   assert(games.at(-1).played.result.achievements.achievements.destiny);if(language==='zh-CN')chinese=games;else assert.deepEqual(games,chinese,'Bilingual cumulative games and RNG identical');
   report.cases.push({achievement:'destiny',language,unlocked:true,games});await c.close();
  }
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);report.status='passed';
}catch(e){report.status='failed';report.failure=e.stack;throw e;}finally{fs.writeFileSync(path.join(root,'tests/procedural-achievement-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
