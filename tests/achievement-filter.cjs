/* Exercise native menus and persisted guide targets across scenario changes. */
const fs=require('fs'),path=require('path'),assert=require('assert');
const game=path.resolve(process.argv[2]||'.'),root=path.resolve(__dirname,'..');
const {chromium}=require(path.join(game,'tests/runtime.cjs'));
const scenarios=JSON.parse(fs.readFileSync(path.join(game,'localization/stories/catalogue.json'),'utf8')).scenarios;
const report={date:new Date().toISOString(),status:'running',cases:[],checks:[],errors:[],external:[],missing:[]};
const cases=[
 ['2020_Biden_Harris',['destiny','ridingBiden','nomalarkey']],
 ['2020_Trump_Pence',['destiny','magaa','nmpr']],
 ['2016_Clinton_Kaine',['destiny','whatbelt']],
 ['2016_Clinton_Sanders',['destiny','whatbelt','thebern']],
 ['2016_Trump_Palin',['destiny','whatbelt','moscow']],
 ['2012_Obama_Biden',['destiny','realdebate']],
 ['2012_Obama_Clinton',['destiny','realdebate','karmic']],
 ['2016a_Clinton_Booker',['why','what']],
 ['1960_Nixon_Goldwater',['Vice']],
 ['1960_Kennedy_Johnson',['BCitsHard','BCitsEasy']],
 ['1968_Wallace_LeMay',[]],
 ['1860_Lincoln_Hamlin',[]],
 ['2020_Biden_Harris',[],{mode:'3'}],
 ['1968_Wallace_LeMay',['stillAlive','yourchance'],{bigshot:true}],
 ['2020_Biden_Harris',['yourchance'],{bigshot:true}]
];
(async()=>{let browser;try{
 browser=await chromium.launch({headless:true,timeout:30000,executablePath:process.env.NCT_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 async function newPage(){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.route('**/*',r=>{const u=new URL(r.request().url());if(['localhost','127.0.0.1'].includes(u.hostname)||['data:','blob:'].includes(u.protocol))return r.continue();report.external.push(u.href);return r.abort();});
  const page=await context.newPage();page.on('dialog',d=>d.accept());page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.missing.push(r.url());});return page;
 }
 let page=await newPage();
 async function load(scope,settings={}){
  const s=scenarios.find(s=>s.scope===scope);assert(s,scope);
  await page.goto((process.env.NCT_BASE_URL||'http://localhost:18081')+'/campaign-trail/index.html');
  await page.waitForFunction(()=>window.campaignTrail_temp?.running_mate_json&&document.getElementById('game_start')&&!document.getElementById('game_start').disabled);
  if(settings.bigshot)for(let i=0;i<2;i++){await page.keyboard.type('BIGSHOT');await page.keyboard.press('Enter');}
  await page.evaluate(()=>{NCTI18n.setLanguage('en-US');const random=Math.random;window.__rngCalls=0;Math.random=()=>{__rngCalls++;return random();};});
  await page.locator('#game_start').first().click();await page.locator('#election_id').selectOption(String(s.election));await page.locator('#election_id_button').click();
  await page.locator('#candidate_id').selectOption(String(s.candidate));await page.locator('#candidate_id_button').click();await page.locator('#running_mate_id').selectOption(String(s.runningMate));await page.locator('#running_mate_id_button').click();
  await page.locator('#game_type_id').selectOption(settings.mode||'1');await page.locator('#opponent_selection_id_button').click();await page.waitForSelector('.game_answers');
  if(settings.coachingOff){await page.waitForFunction(()=>NCTAchievements.selected==='');assert.equal(await page.evaluate(()=>NCTAchievements.enabled),false);}
  await page.evaluate(()=>{NCTAchievements.setEnabled(true);NCTGuide.setEnabled(true);NCTGuide.refresh();});await page.waitForSelector('#achievement-target');
 }
 const values=()=>page.locator('#achievement-target option').evaluateAll(nodes=>nodes.map(n=>n.value));
 const snapshot=()=>page.evaluate(()=>[JSON.stringify(campaignTrail_temp),__rngCalls]);
 for(const [scope,expected,settings={}]of cases){
  if(settings.bigshot){await page.context().close();page=await newPage();}
  await load(scope,settings);assert.deepEqual(await values(),['',...expected],scope);
  const before=await snapshot();await page.locator('#language-toggle').click();assert.deepEqual(await values(),['',...expected]);await page.locator('#language-toggle').click();assert.deepEqual(await snapshot(),before);
  if(scope==='2020_Trump_Pence'){
   assert.equal(await page.locator('#achievement-target').inputValue(),'');
   assert.deepEqual(await page.evaluate(()=>[localStorage.getItem('nct.guide.achievement'),localStorage.getItem('nct.guide.route')]),['','']);
  }
  if(scope==='2020_Biden_Harris'&&!settings.bigshot&&!settings.mode){await page.locator('#achievement-target').selectOption('nomalarkey');await page.evaluate(()=>NCTAchievements.selectRoute('nomalarkey-community'));}
  if(scope==='1960_Kennedy_Johnson'){
   await page.locator('#achievement-target').selectOption('BCitsHard');assert.equal(await page.locator('[data-achievement-status]').getAttribute('data-achievement-status'),'settings');
  }
  report.cases.push({scope,...settings,options:expected,bilingual:true});console.log('PASS filtered objectives',scope,settings);
 }
 await page.context().close();page=await newPage();
 await load('2016_Clinton_Sanders');await page.locator('#achievement-target').selectOption('thebern');await page.locator('#achievement-enabled').uncheck();
 await load('2016_Clinton_Kaine',{coachingOff:true});assert.equal(await page.locator('#achievement-target').inputValue(),'');assert.equal(await page.evaluate(()=>NCTAchievements.selected),'');
 report.checks=['Exact objective lists from native menus for 15 scenario/settings cases','Running-mate-only goals appear only for the correct mate','No-goal scenarios retain ordinary victory advice','Difficulty-specific goals remain visible with requirements','Special achievements follow the native BIGSHOT branch','Incompatible saved goal and route are cleared across games, including coaching off','Language switches preserve filtered options, campaign data and RNG count'];
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);assert.deepEqual(report.missing,[]);report.status='passed';
}catch(e){report.status='failed';report.failure=e.stack;throw e;}finally{fs.writeFileSync(path.join(root,'tests/achievement-filter-results.json'),JSON.stringify(report,null,2)+'\n');if(browser)await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
