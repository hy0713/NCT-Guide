/* Actual UI unlock tests, separate from synthetic predicate fixtures. */
const fs=require('fs'),path=require('path'),assert=require('assert');
const game=path.resolve(process.argv[2]||'..'),root=path.resolve(__dirname,'..');process.chdir(game);
const {chromium}=require(path.join(game,'tests/runtime.cjs')),{start,play}=require(path.join(game,'tests/stories-browser.cjs'));
const scenario=require(path.join(game,'localization/stories/catalogue.json')).scenarios.find(s=>s.scope==='2016a_Clinton_Booker');assert(scenario);
const report={date:new Date().toISOString(),checks:[],errors:[],external:[],missing:[],status:'running'};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.NCT_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const context=await browser.newContext();await context.route('**/*',r=>{const u=new URL(r.request().url());if(['localhost','127.0.0.1'].includes(u.hostname)||['data:','blob:'].includes(u.protocol))return r.continue();report.external.push(u.href);return r.abort();});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.missing.push({url:r.url(),status:r.status()});});page.on('dialog',d=>d.accept());
 await start(page,scenario,'zh-CN','1');await play(page,'zh-CN');
 const first=await page.evaluate(()=>JSON.parse(localStorage.getItem('achievements')));assert.equal(first.achievements.why,true);assert.equal(first.tsatrolling,1);report.checks.push('Actual 25-question classic 2016a run unlocks why and increments counter to 1');
 await page.reload();await page.waitForFunction(()=>typeof campaignTrail_temp!=='undefined');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('achievements')).achievements.why),true);report.checks.push('Achievement survives reload in the same origin');
 await page.goto((process.env.NCT_BASE_URL||'http://localhost:8000')+'/campaign-trail/index.html');
 await page.waitForFunction(()=>document.querySelector('#game_start')&&!document.querySelector('#game_start').disabled);
 await page.evaluate(()=>document.activeElement?.blur());
 for(let attempt=0;attempt<2;attempt++){for(const key of ['b','i','g','s','h','o','t','Enter'])await page.keyboard.press(key);}
 assert.equal(await page.evaluate(()=>campaignTrail_temp.bigshot_mode),true);
 await page.evaluate(()=>{window.__rngCalls=0;const original=Math.random;Math.random=()=>{__rngCalls++;return original();};});
 await page.locator('#game_start').first().click();await page.locator('#election_id').selectOption(String(scenario.election));await page.locator('#election_id_button').click();
 await page.locator('#candidate_id').selectOption(String(scenario.candidate));await page.locator('#candidate_id_button').click();await page.locator('#running_mate_id').selectOption(String(scenario.runningMate));await page.locator('#running_mate_id_button').click();await page.locator('#game_type_id').selectOption('1');await page.locator('#opponent_selection_id_button').click();await page.waitForSelector('.game_answers');
 await play(page,'zh-CN');const second=await page.evaluate(()=>JSON.parse(localStorage.getItem('achievements')));
 assert.equal(second.achievements.yourchance,true);assert.equal(second.tsatrolling,1);report.checks.push('Actual BIGSHOT keyboard activation and full run unlock yourchance; ordinary 2016a counter does not advance');
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);assert.deepEqual(report.missing,[]);report.status='passed';console.log('PASS',report.checks);
}catch(error){report.status='failed';report.failure=error.message;throw error;}finally{fs.writeFileSync(path.join(root,'achievements/BROWSER_TEST_REPORT.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
