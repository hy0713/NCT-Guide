const fs=require('fs'),assert=require('assert'),{chromium}=require('./runtime.cjs'),{start}=require('./stories-browser.cjs');
const scenarios=require('../localization/stories/catalogue.json').scenarios;
const report={date:new Date().toISOString(),status:'running',checks:[],cases:[],errors:[],external:[],requests:[]};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const context=await browser.newContext();await context.route('**/*',r=>{const u=new URL(r.request().url());if(!['localhost','127.0.0.1'].includes(u.hostname)&&!['data:','blob:'].includes(u.protocol)){report.external.push(u.href);return r.abort();}return r.continue();});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.stack));page.on('requestfailed',r=>report.requests.push({url:r.url(),error:r.failure()}));
 for(const [scope,mode]of [['2020_Biden_Harris','1'],['2012_Obama_Biden','2'],['2020_Biden_Harris','3'],['1860_Lincoln_Hamlin','1']]){
  const s=scenarios.find(s=>s.scope===scope);await start(page,s,'zh-CN',mode);
  if(!report.cases.length)assert.equal(await page.evaluate(()=>NCTGuide.enabled),false,'New profile defaults to guide off');
  await page.evaluate(()=>NCTGuide.setEnabled(false));const before=await page.evaluate(()=>[JSON.stringify(campaignTrail_temp),__rngCalls]);
  await page.locator('#guide-toggle').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>NCTGuide.enabled),true);
  assert.deepEqual(await page.evaluate(()=>[JSON.stringify(campaignTrail_temp),__rngCalls]),before);
  await page.locator('#language-toggle').focus();await page.keyboard.press('Enter');await page.keyboard.press('Enter');assert.deepEqual(await page.evaluate(()=>[JSON.stringify(campaignTrail_temp),__rngCalls]),before,'Keyboard language toggle preserves state and RNG');
  const expectedVisits=await page.evaluate(()=>campaignTrail_temp.election_json.find(s=>Number(s.pk)===Number(campaignTrail_temp.election_id)).fields.has_visits===1);
  assert.equal(await page.locator('.nct-guide-table').count()>0,expectedVisits);
  if(!expectedVisits)assert.match(await page.locator('#nct-guide-panel').innerText(),/没有州访问环节/);
  if(mode==='3')assert.match(await page.locator('#nct-guide-panel').innerText(),/高级竞选模式/);
  await page.reload();await page.waitForFunction(()=>!!window.NCTGuide);assert.equal(await page.evaluate(()=>NCTGuide.enabled),true,'Guide preference survives reload');
  await start(page,s,'zh-CN',mode);
  await page.evaluate(()=>{document.querySelector('.game_answers').click();document.getElementById('answer_select_button').click();});
  await page.waitForSelector('#ok_button');await page.waitForFunction(()=>document.getElementById('nct-guide-panel').hidden);assert.equal(await page.locator('#nct-guide-panel').isVisible(),false);
  await page.locator('#ok_button').click();await page.waitForFunction(()=>!document.getElementById('nct-guide-panel').hidden);
  if(scope==='2020_Biden_Harris'&&mode==='1'){
   await page.evaluate(()=>{document.querySelector('.game_answers').click();document.getElementById('answer_select_button').click();});if(await page.locator('#ok_button').count())await page.locator('#ok_button').click();await page.waitForSelector('.visit_text');
   await page.evaluate(()=>jQuery('#map_container').usmap('trigger','TX','click',{}));await page.waitForSelector('#visit_overlay');
   const unchanged=await page.evaluate(()=>[JSON.stringify(campaignTrail_temp),__rngCalls]);await page.locator('#guide-toggle').focus();await page.keyboard.press('Space');assert.deepEqual(await page.evaluate(()=>[JSON.stringify(campaignTrail_temp),__rngCalls]),unchanged,'Space on guide control must not trigger original anti-cheat ending');
  }
  report.cases.push({scope,mode,visitsEnabled:expectedVisits,status:'passed'});console.log('PASS guide UI',scope,'mode',mode);
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);assert.deepEqual(report.requests,[]);report.status='passed';report.checks=['Guide defaults off in a new profile','Keyboard Enter toggle preserves game state and RNG','Persistent guide preference','No visit recommendation in a non-visiting scenario','Classic, proportional and advanced modes display advice','Feedback hides old-question advice; next question restores it'];
}catch(e){report.failure=e.stack;throw e;}finally{fs.writeFileSync('tests/guide-ui-results.json',JSON.stringify(report,null,2)+'\n');await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
