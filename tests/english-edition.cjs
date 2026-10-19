/* Release smoke: English controls, read-only switches, offline native unlocks. */
const fs=require('fs'),path=require('path'),assert=require('assert');
const game=path.resolve(process.argv[2]||'.'),root=path.resolve(__dirname,'..');
const {chromium}=require(path.join(game,'tests/runtime.cjs')),{start,play}=require('./community-routes.cjs');
const data=JSON.parse(fs.readFileSync(path.join(root,'achievements/community-routes.json'),'utf8'));
const report={date:new Date().toISOString(),status:'running',network:'All non-loopback requests blocked',checks:[],runs:[],errors:[],external:[],missing:[]};
(async()=>{
 let browser;
 try{
  browser=await chromium.launch({headless:true,timeout:30000,executablePath:process.env.NCT_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  for(const id of ['ridingBiden-community','Vice-1960_Nixon_Goldwater-2-0.97-search']){
   const route=data.routes.find(r=>r.id===id),context=await browser.newContext({viewport:{width:1440,height:1000}});
   await context.route('**/*',r=>{const u=new URL(r.request().url());if(['localhost','127.0.0.1'].includes(u.hostname)||['data:','blob:'].includes(u.protocol))return r.continue();report.external.push(u.href);return r.abort();});
   const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.missing.push(r.url());});
   await start(page,route,1776,'en-US');
   const original=await page.evaluate(()=>[JSON.stringify(campaignTrail_temp),__rngCalls]);
   assert.match(await page.locator('#nct-guide-panel').innerText(),/Enable achievement coaching/);
   assert.match(await page.locator('#nct-guide-panel').innerText(),/Choose next/);
   await page.locator('#achievement-enabled').uncheck();
   assert.match(await page.locator('#nct-guide-panel').innerText(),/Showing ordinary campaign advice/);
   await page.locator('#language-toggle').click();await page.locator('#language-toggle').click();
   assert.equal(await page.locator('#achievement-enabled').isChecked(),false);
   await page.locator('#achievement-enabled').check();
   await page.locator('#achievement-target').selectOption(id.startsWith('riding')?'Vice':'ridingBiden');
   assert.match(await page.locator('.nct-achievements').innerText(),/compatible pairings|compatible pairing|Choose one of/i);
   await page.locator('#achievement-target').selectOption(route.achievement);
   assert.deepEqual(await page.evaluate(()=>[JSON.stringify(campaignTrail_temp),__rngCalls]),original);
   if(id.startsWith('riding')){
    for(const width of [390,1440]){
     await page.setViewportSize({width,height:1000});
     const r=await page.locator('#nct-guide-panel').boundingBox();assert(r.x>=-1&&r.x+r.width<=width+1);
    }
    const artifacts=path.join(root,'.test-artifacts');fs.mkdirSync(artifacts,{recursive:true});
    await page.locator('#nct-guide-panel').screenshot({path:path.join(artifacts,'english-guide-panel.png')});
   }
   const played=await play(page);assert.equal(played.result.answers.length,25);
   assert.equal(played.result.achievements.achievements[route.achievement],true);
   report.runs.push({route:id,scope:route.scope,language:'en-US',seed:1776,unlocked:true,steps:played.steps,result:played.result});
   console.log('English offline unlock',route.achievement);await context.close();
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);assert.deepEqual(report.missing,[]);
  report.checks=['English achievement labels and current recommendation','Independent achievement toggle and persistence across language switches','Incompatible objective displays English alternative-pairing advice','UI actions preserve campaign values and RNG count','Panel fits 390px and 1440px','Two full English native achievement unlocks with external network requests blocked'];report.status='passed';
 }catch(e){report.status='failed';report.failure=e.stack;throw e;}
 finally{fs.writeFileSync(path.join(root,'tests/english-edition-results.json'),JSON.stringify(report,null,2)+'\n');if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
