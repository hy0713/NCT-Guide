/* Replay the ordinary guide to collect independent route starting points. */
const fs=require('fs'),path=require('path'),assert=require('assert');
const game=path.resolve(process.argv[2]||'.'),root=path.resolve(__dirname,'..');
const {chromium}=require(path.join(game,'tests/runtime.cjs')),{start,play}=require('../tests/community-routes.cjs');
const catalogue=JSON.parse(fs.readFileSync(path.join(game,'localization/stories/catalogue.json'),'utf8')).scenarios;
const file=path.join(root,'achievements/community-routes.json'),data=JSON.parse(fs.readFileSync(file,'utf8'));
const cases=[['ratio','1968_Humphrey_Connally',.97],['Kinder','1988_Bush_Quayle',.97],['Kinder','1988_Bush_Dole',.97],['BCitsHard','1960_Kennedy_Johnson',.9],['California','1916_Hughes_Fairbanks',.97],['California','1916_Hughes_Burkett',.97],['magaa','2020_Trump_Pence',.97]];
const report={date:new Date().toISOString(),method:'Actual ordinary guide replay, then save choices as route candidates; no target policy or game changes',runs:[],errors:[],external:[]};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 for(const[achievement,scope,difficulty]of cases){const context=await browser.newContext();await context.route('**/*',r=>{const u=new URL(r.request().url());if(['localhost','127.0.0.1'].includes(u.hostname)||['data:','blob:'].includes(u.protocol))return r.continue();report.external.push(u.href);return r.abort();});const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await start(page,{id:'baseline',achievement:'',scope,mode:'1',difficulty},1776,'zh-CN');const snapshot=await page.evaluate(()=>JSON.parse(JSON.stringify(campaignTrail_temp)));
  fs.writeFileSync(path.join(game,'.test-artifacts/route-inputs',scope+'-1-'+difficulty+'.json'),JSON.stringify(snapshot));const p=await play(page),s=catalogue.find(s=>s.scope===scope),own=p.result.overall.find(r=>r.candidate===s.candidate);
  const route={id:achievement+'-'+scope+'-baseline',achievement,scope,source:'https://github.com/newcampaigntrail/newcampaigntrail.github.io/blob/d6655ef6ad80ab9a8fe5510d0fd43874e57dacbf/static/js/campaign_trail.js',origin:'baseline-replay',answers:Object.fromEntries(p.steps.filter(x=>x.type==='answer').map(x=>[x.question,[x.id]])),visits:{sequence:p.steps.filter(x=>x.type==='visit').map(x=>x.abbr)},difficulty,mode:'1',verification:'unverified',notes:{'zh-CN':'从普通胜选攻略实际游玩中提取的候选；满足本成就目标仍需单独检查。','en-US':'Candidate captured from actual ordinary winning advice; achievement conditions need separate verification.'}};
  const index=data.routes.findIndex(r=>r.id===route.id);if(index<0)data.routes.push(route);else data.routes[index]=route;
  report.runs.push({route:route.id,scope,seed:1776,electoral:own.electoral_votes,unlocked:!!p.result.achievements?.achievements?.[achievement],answers:p.result.answers,visits:p.result.visits});console.log(scope,own.electoral_votes,'actual target unlocked',report.runs.at(-1).unlocked);
  fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');fs.writeFileSync(path.join(root,'tests/baseline-route-results.json'),JSON.stringify(report,null,2)+'\n');await context.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);report.status='passed';
}finally{fs.writeFileSync(path.join(root,'tests/baseline-route-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
