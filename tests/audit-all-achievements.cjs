/* Fresh, sequential native-browser audit. No game/save edits; test RNG only. */
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(__dirname,'..'),game=path.resolve(process.argv[2]||'.'),phase=process.argv[3]||'ordinary';
const {chromium}=require(path.join(game,'tests/runtime.cjs')),{start,play}=require('./community-routes.cjs');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8')),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const folder=path.join(root,'tests',process.env.NCT_AUDIT_DIR||'all31-2026-11-17');fs.mkdirSync(folder,{recursive:true});
const box={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'guide/achievement-data.js'),'utf8'),box);const data=box.window.NCTAchievementData;
const routes=read('achievements/community-routes.json').routes,catalogue=JSON.parse(fs.readFileSync(path.join(game,'localization/stories/catalogue.json'),'utf8'));
const seeds=(process.env.NCT_AUDIT_SEEDS||'1,3,42,1776,2026').split(',').map(Number);
const runtime=Object.fromEntries(['model.js','achievement-data.js','achievements.js','guide.js','planner-worker.js','messages.json'].map(name=>[name,hash(fs.readFileSync(path.join(game,'localization/guide',name)))]));
const checkRuntime=()=>{for(const [name,digest]of Object.entries(runtime))assert.equal(hash(fs.readFileSync(path.join(game,'localization/guide',name))),digest,'Runtime changed during audit: '+name)};
const selected=data.rules.filter(r=>!['destiny','what','stillAlive','yourchance'].includes(r.id)).map(r=>{
 const choices=data.routes.filter(x=>x.achievement===r.id&&x.replays?.success>0).sort((a,b)=>b.replays.success/b.replays.total-a.replays.success/a.replays.total||b.replays.total-a.replays.total);
 assert(choices.length,'No tested setup for '+r.id);return {id:r.id,name:r.name,route:choices[0]};
});assert.equal(selected.length,27);
const output=(name,value)=>fs.writeFileSync(path.join(folder,name+'.json'),JSON.stringify(value,null,2)+'\n');
const state=()=>({date:new Date().toISOString(),execution:'running',network:'All non-loopback requests blocked',runtimeSHA256:runtime,runs:[],errors:[],external:[],missing:[]});
async function context(b,report){const c=await b.newContext({viewport:{width:1440,height:1000}});await c.route('**/*',r=>{const u=new URL(r.request().url());if(['127.0.0.1','localhost'].includes(u.hostname)||['data:','blob:'].includes(u.protocol))return r.continue();report.external.push(u.href);return r.abort()});return c;}
async function page(c,report){const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));p.on('response',r=>{if(r.status()>=400)report.missing.push(r.url())});return p;}
async function run(p,route,seed,language='zh-CN',explicit=false){
 checkRuntime();await start(p,{...route,id:explicit?route.id:''},seed,language);
 const pre=await p.evaluate(()=>({saved:JSON.parse(localStorage.getItem('achievements')),rule:NCTAchievements.selected,route:NCTAchievements.routeInfo(campaignTrail_temp,NCTAchievementData.rules.find(r=>r.id===NCTAchievements.selected),[])?.route.id}));
 const played=await play(p);
 const final=await p.evaluate(()=>({candidate:campaignTrail_temp.candidate_id,diagnosis:NCTAchievements.diagnosis(campaignTrail_temp,NCTAchievementData.rules.find(r=>r.id===NCTAchievements.selected)),resultText:document.querySelector('#nct-guide-panel')?.innerText}));
 const own=played.result.overall.find(row=>row.candidate===final.candidate),scenario=catalogue.scenarios.find(s=>s.scope===route.scope);
 const row={achievement:route.achievement,scope:route.scope,mode:route.mode,difficulty:route.difficulty,seed,language,requestedRoute:route.id,coachingRoute:pre.route,
  unlocked:!!played.result.achievements?.achievements?.[route.achievement],newUnlocks:Object.keys(played.result.achievements.achievements).filter(id=>played.result.achievements.achievements[id]&&!pre.saved.achievements[id]),
  electoral:own.electoral_votes,popular:own.popular_votes,outcome:played.result.outcome,yearRecorded:!!played.result.achievements.threeosix[scenario.year],counter:played.result.achievements.tsatrolling,
  diagnosis:final.diagnosis,resultText:final.resultText,steps:played.steps,answers:played.result.answers,visits:played.result.visits,rngCalls:played.result.rngCalls,
  states:played.result.states.map(s=>({state:s.state,ranking:s.result.map(c=>c.candidate),margins:s.result.map(c=>c.percent)}))};
 assert.equal(row.answers.length,25);assert.equal(row.diagnosis.votes,row.electoral);assert.equal(row.diagnosis.unlocked,row.unlocked);assert(row.resultText.includes(String(row.electoral)));
 checkRuntime();return row;
}
function finish(report){assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);assert.deepEqual(report.missing,[]);report.execution='completed';}
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 if(phase==='ordinary')for(const item of selected){const report=state();report.achievement=item.id;report.name=item.name;report.setup=item.route.scope;report.seeds=seeds;
  const file=path.join(folder,item.id+'.json');if(fs.existsSync(file)){const old=JSON.parse(fs.readFileSync(file,'utf8'));if(old.execution==='completed'&&JSON.stringify(old.runtimeSHA256)===JSON.stringify(runtime)&&JSON.stringify(old.seeds)===JSON.stringify(seeds)){console.log('ALREADY CHECKED',item.id);continue;}}
  try{for(const seed of seeds){const c=await context(b,report);try{const p=await page(c,report),row=await run(p,item.route,seed);report.runs.push(row);console.log('CHECK',item.id,seed,row.electoral,row.unlocked?'UNLOCKED':'NOT UNLOCKED');output(item.id,report);}finally{await c.close()}}
   report.unlocks=report.runs.filter(r=>r.unlocked).length;finish(report);
  }catch(e){report.execution='failed';report.failure=e.stack;throw e}finally{output(item.id,report)}
 }
 if(phase==='destiny-grid'){const report=state();report.achievement='destiny';
  try{const perYear=new Map();for(const r of data.routes.filter(r=>r.achievement==='destiny'&&r.replays?.success>0)){const year=r.scope.split('_')[0],old=perYear.get(year);if(!old||r.replays.success/r.replays.total>old.replays.success/old.replays.total)perYear.set(year,r);}
   assert.equal(perYear.size,7);for(const r of perYear.values())for(const seed of seeds){const c=await context(b,report);try{const p=await page(c,report),row=await run(p,r,seed);report.runs.push(row);console.log('YEAR CHECK',r.scope,seed,row.electoral,row.yearRecorded?'RECORDED':'NOT RECORDED');output('destiny-grid',report);}finally{await c.close()}}
   finish(report);
  }catch(e){report.execution='failed';report.failure=e.stack;throw e}finally{output('destiny-grid',report)}
 }
 if(phase==='counter'){const report=state();report.achievement='what';const c=await context(b,report);
  try{const p=await page(c,report);for(let n=1;n<=100;n++){const row=await run(p,{id:'counter',scope:'2016a_Clinton_Booker',mode:'1',difficulty:.97,achievement:'what'},1776+n,n%2?'zh-CN':'en-US');assert.equal(row.counter,n);if(n===1)assert(row.newUnlocks.includes('why'));if(n<100)assert(!row.unlocked);report.runs.push(row);if(n%10===0)console.log('COUNTER',n,row.counter,row.unlocked);output('what',report)}
   assert(report.runs.at(-1).unlocked);await p.reload();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('achievements')).tsatrolling),100);finish(report);
  }catch(e){report.execution='failed';report.failure=e.stack;throw e}finally{output('what',report);await c.close()}
 }
 if(phase==='special')for(const aid of ['yourchance','stillAlive']){const report=state();report.achievement=aid;
  try{for(const seed of seeds.slice(0,3)){const c=await context(b,report);try{const p=await page(c,report),row=await run(p,{id:'special',scope:'1968_Wallace_LeMay',mode:'1',difficulty:.97,achievement:aid,bigshot:true,...(aid==='stillAlive'?{cheatMultiplier:41}:{})},seed);report.runs.push(row);assert(row.unlocked);console.log('SPECIAL',aid,seed,row.electoral,'UNLOCKED')}finally{await c.close()}}finish(report);
  }catch(e){report.execution='failed';report.failure=e.stack;throw e}finally{output(aid,report)}
 }
 if(phase==='destiny-cumulative'){const report=state();report.achievement='destiny';const cases=[['destiny-2020-Bass-community',1],['destiny-destiny2016-community',4],['destiny-2012_Obama_Biden-2-0.97-search',10],['destiny-2000_Gore_Graham-2-0.97-search',8],['destiny-1988-Jackson-community',1],['destiny-destiny1976-community',1],['destiny-1964_Johnson_Humphrey-2-0.97-search',29]];
  try{for(const lang of ['zh-CN','en-US']){const c=await context(b,report);try{const p=await page(c,report);for(const [id,seed]of cases){const r=routes.find(r=>r.id===id),row=await run(p,r,seed,lang,true);report.runs.push(row);assert(row.yearRecorded,id);console.log('CUMULATIVE',lang,id,row.electoral,row.yearRecorded);output('destiny',report)}assert(report.runs.at(-1).unlocked)}finally{await c.close()}}
   const zh=report.runs.filter(r=>r.language==='zh-CN').map(({language,resultText,diagnosis,...r})=>r),en=report.runs.filter(r=>r.language==='en-US').map(({language,resultText,diagnosis,...r})=>r);assert.deepEqual(zh,en);finish(report);
  }catch(e){report.execution='failed';report.failure=e.stack;throw e}finally{output('destiny',report)}
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
