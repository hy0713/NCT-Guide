/* Pure copied setups: every objective's pairing and settings gates. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'tests',process.env.NCT_AUDIT_DIR||'all31-2026-11-17');fs.mkdirSync(folder,{recursive:true});
const store={},box={window:null,localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v},NCTI18n:{text:k=>k,language:'zh-CN'}};box.window=box;vm.createContext(box);
for(const f of ['achievement-data.js','achievements.js'])vm.runInContext(fs.readFileSync(path.join(root,'guide',f),'utf8'),box);
vm.runInContext('Math.random=()=>{throw Error("Eligibility consumed RNG")}',box);
const data=box.NCTAchievementData,engine=box.NCTAchievements,rows=[];
for(const r of data.rules){const s=data.scenarios.find(s=>engine.match(r,s));assert(s,r.id+' pairing');
 const e={election_id:s.election,candidate_id:s.candidate,running_mate_id:s.runningMate,game_type_id:'1',bigshot_mode:!!r.special,difficulty_level_multiplier:r.difficulty??Math.min(.97,r.maxDifficulty??.97),player_answers:[],player_visits:[],answers_json:s.answerIds.map(pk=>({pk,fields:{question:pk}}))};
 const before=JSON.stringify(e);assert(engine.available(e).some(x=>x.id===r.id));assert.equal(engine.status(e,r).kind,'open');
 assert.equal(engine.status({...e,candidate_id:-1},r).kind,'combination');assert(!engine.available({...e,candidate_id:-1}).some(x=>x.id===r.id));
 if(!r.special){assert(!engine.available({...e,game_type_id:'3'}).some(x=>x.id===r.id));assert(!engine.available({...e,bigshot_mode:true}).some(x=>x.id===r.id));}
 else assert(!engine.available({...e,bigshot_mode:false}).some(x=>x.id===r.id));
 if(r.maxDifficulty!=null)assert.equal(engine.status({...e,difficulty_level_multiplier:r.maxDifficulty+.01},r).kind,'settings');
 if(r.difficulty!=null)assert.equal(engine.status({...e,difficulty_level_multiplier:r.difficulty-.01},r).kind,'settings');
 for(const id of r.required||[]){const changed=JSON.parse(JSON.stringify(e)),row=changed.answers_json.find(a=>a.pk===id);changed.answers_json.push({pk:-2,fields:{question:row.fields.question}});changed.player_answers=[-2];assert.equal(engine.status(changed,r).kind,'missed');}
 for(const [index,id]of Object.entries(r.slots||{})){const changed=JSON.parse(JSON.stringify(e));changed.player_answers=Array(+index+1).fill(-2);assert.equal(engine.status(changed,r).kind,'missed');}
 engine.select(r.id);assert.equal(engine.plan({...e,candidate_id:-1},{},[]),null);assert.equal(engine.selected,'');assert.equal(JSON.stringify(e),before);
 rows.push({id:r.id,scope:s.scope,positiveEligibility:true,wrongPairingHidden:true,settingsChecked:true,mandatoryAnswersChecked:true,gameUnchanged:true});
}
assert.equal(rows.length,31);fs.writeFileSync(path.join(folder,'eligibility.json'),JSON.stringify({date:new Date().toISOString(),execution:'completed',method:'Copied setup tests, not natural unlocks',rng:'Any call throws',rows},null,2)+'\n');console.log('PASS eligibility, settings, required answers, state/RNG preservation for all 31 objectives');
