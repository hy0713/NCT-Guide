/* Capture original initialized inputs through UI; private artifacts only. */
const fs=require('fs'),path=require('path');
const game=path.resolve(process.argv[2]||'.'),root=path.resolve(__dirname,'..');
const {chromium}=require(path.join(game,'tests/runtime.cjs')),{start}=require('../tests/community-routes.cjs');
const scenarios=JSON.parse(fs.readFileSync(path.join(game,'localization/stories/catalogue.json'),'utf8')).scenarios;
const target=path.join(game,'.test-artifacts/route-inputs');fs.mkdirSync(target,{recursive:true});
const scopes=[['2012_Obama_Clinton',1,.97],['2000_Gore_Graham',1,.97],['2000_Bush_Cheney',1,.97],['1896_Bryan_Teller',1,.97],['1968_Humphrey_Harris',1,.97],['1988_Dukakis_Jackson',1,.97],['1916_Hughes_Fairbanks',1,.97],['1968_Nixon_Agnew',1,.97],['1960_Kennedy_Humphrey',1,1.33],['2016_Clinton_Kaine',2,.9],['2016a_Clinton_Booker',1,.97],['2012_Obama_Biden',2,.97],['2000_Gore_Graham',2,.97],['1964_Johnson_Humphrey',2,.97]];
const published=JSON.parse(fs.readFileSync(path.join(root,'achievements/community-routes.json'),'utf8')).routes;
const cases=process.env.NCT_CAPTURE_CASES?JSON.parse(process.env.NCT_CAPTURE_CASES).map(([scope,mode,difficulty])=>({scope,mode:String(mode),difficulty,achievement:'',id:'capture'})):[...scopes.map(([scope,mode,difficulty])=>({scope,mode:String(mode),difficulty,achievement:'',id:'capture'})),...published];
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const seen=new Set();for(const r of cases){const key=r.scope+'-'+r.mode+'-'+r.difficulty;if(seen.has(key))continue;seen.add(key);if(!scenarios.some(s=>s.scope===r.scope))throw Error('Unknown '+r.scope);
  const context=await browser.newContext();await context.route('**/*',q=>['localhost','127.0.0.1'].includes(new URL(q.request().url()).hostname)?q.continue():q.abort());const page=await context.newPage();
  await start(page,r,1776,'zh-CN');const e=await page.evaluate(()=>JSON.parse(JSON.stringify(campaignTrail_temp)));fs.writeFileSync(path.join(target,key+'.json'),JSON.stringify(e));console.log('CAPTURED',key);await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
