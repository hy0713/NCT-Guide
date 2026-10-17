/* Read-only source extraction. Usage: node tools/achievement-audit.cjs GAME */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const game=path.resolve(process.argv[2]||'..'),root=path.resolve(__dirname,'..');
const {babel}=require(path.join(game,'tests/runtime.cjs'));
const source=fs.readFileSync(path.join(game,'static/js/campaign_trail.js'),'utf8');
const names=JSON.parse(fs.readFileSync(path.join(game,'tools/native-achievements.json'),'utf8'));
const ast=babel.babelParse(source,'campaign_trail.js',false),found={};let legitSource;
function walk(n,anc=[]){if(!n||typeof n!=='object')return;
 if(n.type==='IfStatement'&&n.test.type==='Identifier'&&n.test.name==='legitRun')legitSource=source.slice(n.start,n.end);
 if(n.type==='CallExpression'&&n.callee.name==='unlockAchievement'&&names[n.arguments[1]?.value]){
  const id=n.arguments[1].value,gate=anc.slice().reverse().find(a=>a.type==='IfStatement'&&source.slice(a.test.start,a.test.end).includes('run.achievements["'+id+'"]'));
  assert(gate,id);found[id]={id,name:names[id][0],menuDescription:names[id][1],condition:source.slice(gate.test.start,gate.test.end),line:source.slice(0,gate.start).split('\n').length,qualification:['stillAlive','yourchance'].includes(id)?'non-legitimate branch':'legitimate branch'};
 }
 for(const[k,v]of Object.entries(n))if(!['loc','extra','comments'].includes(k)){if(Array.isArray(v))v.forEach(x=>walk(x,[...anc,n]));else if(v&&typeof v==='object')walk(v,[...anc,n]);}
}
walk(ast);assert.equal(Object.keys(found).length,Object.keys(names).length);
const catalogue=JSON.parse(fs.readFileSync(path.join(game,'localization/stories/catalogue.json'),'utf8'));
const required=new Set([729,330,168,3326,4439,4484,3610,3647,3809]);const answers=[];
for(const id of required){
 const records=catalogue.records.filter(r=>r.collection==='answers_json'&&r.field==='description'&&r.location.pk===id);
 assert(records.length,'Answer '+id);
 const groups=new Map();for(const r of records){const zh=JSON.parse(fs.readFileSync(path.join(game,'localization/stories',r.scope+'.zh-CN.json'),'utf8'))[r.key];assert(zh);const key=r.source+'\0'+zh;if(!groups.has(key))groups.set(key,{id,english:r.source,chinese:zh,scopes:[]});groups.get(key).scopes.push(r.scope);}
 answers.push(...groups.values());
}
const output={baseCommit:'d6655ef6ad80ab9a8fe5510d0fd43874e57dacbf',source:'static/js/campaign_trail.js',sourceSHA256:crypto.createHash('sha256').update(source).digest('hex'),qualification:'bigshot_mode != true && dirtyhacker3 == null && game_type_id !== "3"',achievements:Object.values(found),requiredAnswers:answers};
fs.mkdirSync(path.join(root,'achievements'),{recursive:true});fs.writeFileSync(path.join(root,'achievements/source-audit.json'),JSON.stringify(output,null,2)+'\n');
// Synthetic predicate tests evaluate only extracted original conditions; no game
// data or localStorage is edited. These are NOT natural playthrough claims.
const fixtures={
 destiny:{run:{threeosix:Object.fromEntries(['2020','2016','2012','2000','1988','1976','1964'].map(y=>[y,true]))}},
 ridingBiden:{year:21,candidate:'Biden',ev:406},magaa:{year:21,candidate:'Trump',ev:322},nmpr:{year:21,candidate:'Trump',ev:269},nomalarkey:{year:21,candidate:'Biden',ev:306},
 whatbelt:{year:20,ev:270,second:[37,21,49]},thebern:{year:20,candidate:'Clinton',mate:'Sanders',ev:351},moscow:{year:20,candidate:'Trump',mate:'Palin'},
 why:{year:16},what:{year:16,run:{tsatrolling:100}},realdebate:{year:3,answers:[729,330,168]},karmic:{year:3,mate:'Clinton',ev:4},
 raiders:{year:9,candidate:'Nader',pv:5300000,difficulty:1.33},master:{year:9,candidate:'Gore',answers:[3326]},swap:{year:9,candidate:'Gore',opponentPV:20000000},
 florida2000:{year:9,ev:294,gap:.0049},tanks:{year:15,answers:[4439,4484]},Rainbow:{year:15,mate:'Jackson'},Kinder:{year:15,candidate:'Bush',ev:501},georgia:{year:10,answers:[3610,3647],ev:401},
 georgenixon:{year:4,candidate:'Nixon',winner:[8,23]},ratio:{year:4,candidate:'Humphrey',ev:431},BCitsHard:{year:11,candidate:'Kennedy',difficulty:.9},BCitsEasy:{year:11,candidate:'Kennedy',difficulty:1.33,ev:99},Vice:{year:11,mate:'Goldwater'},
 dixieDewey:{year:12,candidate:'Truman',answers:[0,0,3809]},Dewey:{year:12,candidate:'Dewey'},California:{year:14,candidate:'Hughes',second:[3]},Commoner:{year:5,candidate:'Bryan',ev:331},stillAlive:{year:4,candidate:'Wallace',ev:535},yourchance:{bigshot:true}
};
function evaluate(id,f){const e={election_id:f.year||0,candidate_last_name:f.candidate||'',running_mate_last_name:f.mate||'',candidate_id:1,difficulty_level_multiplier:f.difficulty??.97,final_outcome:f.outcome||'win',player_answers:f.answers||[],bigshot_mode:!!f.bigshot,final_overall_results:[{electoral_votes:f.ev??300,popular_votes:f.pv??10000000},{electoral_votes:238,popular_votes:f.opponentPV??9000000}],final_state_results:Array.from({length:51},()=>({result:[{candidate:1,percent:.5},{candidate:2,percent:.48}]}))};
 for(const i of f.second||[])e.final_state_results[i].result[1].candidate=1;
 if(f.winner)e.final_state_results[f.winner[0]].result[0].candidate=f.winner[1];
 if(f.gap!=null)e.final_state_results[8].result[0].percent=.48+f.gap;
 const run={achievements:{},threeosix:{},tsatrolling:0,...f.run};
 return !!new Function('e','campaignTrail_temp','run','n','modded','containsObject','return ('+found[id].condition+');')(e,e,run,0,false,(id,list)=>list.includes(id));
}
const results=[];for(const[id,f]of Object.entries(fixtures)){assert(evaluate(id,f),id+' positive');results.push({id,type:'synthetic positive',passed:true});}
for(const[id,key,value]of [['ridingBiden','ev',405],['magaa','ev',321],['nmpr','ev',270],['nomalarkey','ev',307],['thebern','ev',350],['ratio','ev',430],['raiders','pv',5299999],['raiders','difficulty',1.34],['Kinder','ev',500],['georgia','ev',400],['BCitsHard','difficulty',.95],['BCitsEasy','ev',100],['BCitsEasy','difficulty',1.2],['Commoner','ev',330],['what','run',{tsatrolling:99}],['Dewey','outcome','loss']]){assert(!evaluate(id,{...fixtures[id],[key]:value}),id+' boundary');results.push({id,type:'synthetic negative boundary',passed:true});}
assert(legitSource.includes('if (campaignTrail_temp.election_id == 9)'));
fs.writeFileSync(path.join(root,'achievements/predicate-tests.json'),JSON.stringify({status:'passed',sourceSHA256:output.sourceSHA256,tests:results,limits:'Synthetic isolated predicates; does not prove reachability, actual unlock, else-if priority or a winning route.'},null,2)+'\n');
console.log('PASS',Object.keys(found).length,'native achievements,',results.length,'predicate fixtures,',answers.length,'localized required-answer variants');
