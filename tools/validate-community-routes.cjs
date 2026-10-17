/* Parse literal original data without executing scenario scripts. */
const fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),game=path.resolve(process.argv[2]||'.');
const {babel}=require(path.join(game,'tests/runtime.cjs'));
const data=JSON.parse(fs.readFileSync(path.join(root,'achievements/community-routes.json'),'utf8'));
const catalogue=JSON.parse(fs.readFileSync(path.join(game,'localization/stories/catalogue.json'),'utf8'));
function literal(n){
 if(['StringLiteral','NumericLiteral','BooleanLiteral'].includes(n?.type))return n.value;
 if(n?.type==='NullLiteral')return null;
 if(n?.type==='UnaryExpression'&&n.operator==='-')return -literal(n.argument);
 if(n?.type==='ArrayExpression')return n.elements.map(literal);
 if(n?.type==='ObjectExpression')return Object.fromEntries(n.properties.map(p=>{assert(p.type==='ObjectProperty'&&!p.computed);return[p.key.name??p.key.value,literal(p.value)];}));
 throw Error('Nonliteral scenario data: '+n?.type);
}
function readScenario(scope){
 const s=catalogue.scenarios.find(s=>s.scope===scope);assert(s,scope);
 const source=fs.readFileSync(path.join(game,s.file),'utf8'),arrays={};
 assert.equal(crypto.createHash('sha256').update(source).digest('hex'),s.sourceSha256,'Original snapshot mismatch: '+scope);
 function walk(n){if(!n||typeof n!=='object')return;
  if(n.type==='AssignmentExpression'&&n.left.type==='MemberExpression'){
   const key=n.left.property.name??n.left.property.value,r=n.right;
   if(r.type==='CallExpression'&&r.callee.object?.name==='JSON'&&r.callee.property?.name==='parse'&&r.arguments[0]?.type==='StringLiteral'){const v=JSON.parse(r.arguments[0].value);if(Array.isArray(v))arrays[key]=v;}
   else if(r.type==='ArrayExpression'&&/_json$/.test(key))arrays[key]=literal(r);
  }
  for(const[k,v]of Object.entries(n))if(!['loc','extra','comments'].includes(k)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}
 }
 for(const m of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi))if(m[1].trim())walk(babel.babelParse(m[1],s.file,false));
 return {scenario:s,arrays};
}
function fingerprint(text){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return(h>>>0).toString(16);}
function run(){const ids=new Set(),results=[];
 for(const r of data.routes){
  assert(!ids.has(r.id),'Duplicate route '+r.id);ids.add(r.id);assert(/^https:\/\//.test(r.source));
  const {scenario:s,arrays:e}=readScenario(r.scope),questions=e.questions_json,answers=e.answers_json;
  for(const[q,list]of Object.entries(r.answers)){
   assert(questions.some(row=>row.pk===+q),r.id+' unknown question '+q);
   assert(list.length,r.id+' empty answer list');
   for(const id of list)assert(answers.some(a=>a.pk===id&&a.fields.question===+q),r.id+' wrong answer/question '+id+'/'+q);
  }
  for(const abbr of [...(r.visits.sequence||[]),...(r.visits.weakest||[]),...(r.visits.lowestShare||[])])assert(e.states_json.some(s=>s.fields.abbr===abbr),r.id+' unknown state '+abbr);
  r.sourceSHA256=s.sourceSha256;
  r.fingerprints=Object.fromEntries(answers.filter(a=>(r.answers[a.fields.question]||[]).includes(a.pk)).map(a=>[a.pk,fingerprint(a.fields.description)]));
  r.mappedQuestions=Object.keys(r.answers).length;r.totalQuestions=questions.length;
  r.unmappedQuestions=questions.filter(q=>!r.answers[q.pk]).map(q=>q.pk);
  results.push({id:r.id,scope:r.scope,source:r.source,mapped:r.mappedQuestions,total:r.totalQuestions,unmapped:r.unmappedQuestions});
 }
 fs.writeFileSync(path.join(root,'achievements/community-routes.json'),JSON.stringify(data,null,2)+'\n');
 fs.writeFileSync(path.join(root,'achievements/route-validation.json'),JSON.stringify({status:'passed',checks:'Original snapshot SHA256, unique route IDs, question/answer associations, state abbreviations and source-text fingerprints',routes:results},null,2)+'\n');
 console.log('PASS',results.length,'routes;',results.reduce((s,r)=>s+r.mapped,0),'question mappings');
}
if(require.main===module)run();module.exports={readScenario,fingerprint};
