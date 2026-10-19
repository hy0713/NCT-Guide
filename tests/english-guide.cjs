/* Validate written routes against the original literal scenario arrays, not just catalogue text. */
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),game=path.resolve(process.argv[2]||'.');
const {readScenario}=require('../tools/validate-community-routes.cjs');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const manifest=read('achievements/english-walkthroughs.json');
const editorial=read('achievements/english-editorial.json');
const routes=new Map(read('achievements/community-routes.json').routes.map(r=>[r.id,r]));
assert.equal(Object.keys(editorial).length,31);assert.equal(manifest.walkthroughs.length,34);
const seen=new Set(),cache=new Map();let answers=0,visits=0,gaps=0,localLinks=0;
for(const w of manifest.walkthroughs){
 assert(!seen.has(w.route));seen.add(w.route);
 if(!cache.has(w.scope))cache.set(w.scope,readScenario(w.scope));
 const {scenario,arrays}=cache.get(w.scope),md=fs.readFileSync(path.join(root,w.page),'utf8');
 assert.equal(w.scenarioSHA256,scenario.sourceSha256);
 const qs=new Set();let questionNo=0,visitNo=0;
 for(const s of w.steps){
  if(s.type==='answer'){
   const q=arrays.questions_json.filter(q=>q.pk===s.question);
   const a=arrays.answers_json.filter(a=>a.pk===s.id&&a.fields.question===s.question);
   assert.equal(q.length,1,w.route+' question '+s.question);assert.equal(a.length,1,w.route+' answer '+s.id);
   assert(!qs.has(s.question));qs.add(s.question);
   assert(md.includes(q[0].fields.description));assert(md.includes('**Choose:** '+a[0].fields.description));
   assert(md.includes(`Question ID ${s.question}; answer ID ${s.id}.`));questionNo++;answers++;
   if(!(routes.get(w.route).answers[s.question]||[]).includes(s.id)){gaps++;assert(md.includes('gap in the source route'));}
  }else{
   assert.equal(s.type,'visit');const st=arrays.states_json.find(x=>x.pk===s.id);assert(st);assert.equal(st.fields.abbr,s.abbr);
   visitNo++;visits++;assert(md.includes(`**Visit ${visitNo}: ${s.abbr}.**`));
  }
 }
 assert.equal(questionNo,25);assert.equal((md.match(/^### Question \d+/gm)||[]).length,25);
 assert(md.includes(`(${routes.get(w.route).source})`));
}
const files=['README.md','README_ZH.md','NOTICE.md','guide/README.md','achievements/README.md','achievements/LIVE_COACH.md','achievements/COVERAGE.md','achievements/SOURCES.md','ENGLISH_EDITION_TEST_REPORT.md',...manifest.walkthroughs.map(w=>w.page)];
for(const f of files){
 const content=fs.readFileSync(path.join(root,f),'utf8');
 for(const m of content.matchAll(/\[[^\]\n]*\]\(([^)\s]+)\)/g)){
  const url=m[1];if(/^https?:/.test(url))continue;
  const [filename,anchor]=url.split('#');const target=filename?path.resolve(path.dirname(path.join(root,f)),decodeURIComponent(filename)):path.join(root,f);
  assert(target.startsWith(root+path.sep),f+' link escapes repository');assert(fs.existsSync(target),f+' broken link '+url);localLinks++;
  if(anchor&&target.endsWith('achievements/README.md'))assert(fs.readFileSync(target,'utf8').includes(`id="${anchor}"`),f+' missing anchor '+url);
 }
 if(!f.endsWith('_ZH.md')&&f!=='NOTICE.md'){
  // Language navigation labels may contain Chinese; English guide prose must not.
  const prose=content.replace(/\[[^\]]*[\u3400-\u9fff][^\]]*\]\([^)]+\)/g,'');
  assert(!/[\u3400-\u9fff]/.test(prose),f+' unexpected Chinese prose');
 }
}
const ui=read('guide/messages.json');assert.deepEqual(Object.keys(ui['en-US']).sort(),Object.keys(ui['zh-CN']).sort());
for(const[k,v]of Object.entries(ui['en-US']))assert(v.trim()&&!/[\u3400-\u9fff]/.test(v),'Missing English guide UI '+k);
const result={status:'passed',achievements:31,walkthroughs:seen.size,originalEnglishAnswers:answers,recordedVisits:visits,sourceRouteGapsExplicitlyLabeled:gaps,scenarioArraysChecked:cache.size,localLinksChecked:localLinks,englishUIKeys:Object.keys(ui['en-US']).length,checks:['Original literal question/answer associations','Original English text','State ID and abbreviation','25 distinct questions per walkthrough','Source links and local document links','English prose and UI coverage']};
fs.writeFileSync(path.join(root,'tests/english-guide-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
