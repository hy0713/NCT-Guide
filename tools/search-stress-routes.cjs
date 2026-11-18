/* Offline route search. The sampled vote calculator lives only in this tool. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const game=path.resolve(process.argv[2]),output=path.resolve(process.argv[3]);
const captures=path.join(game,'.test-artifacts/route-inputs');
const box={window:{}};
for(const file of ['model.js','achievement-data.js'])vm.runInNewContext(fs.readFileSync(path.join(root,'guide',file),'utf8'),box);
const {rules,scenarios}=box.window.NCTAchievementData;
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'achievements/community-routes.json'),'utf8')).routes;
const source='https://github.com/newcampaigntrail/newcampaigntrail.github.io/blob/d6655ef6ad80ab9a8fe5510d0fd43874e57dacbf/static/js/campaign_trail.js';

function random(seed){return ()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)+.5)/4294967296;}
function normal(next){return Math.sqrt(-2*Math.log(next()))*Math.cos(2*Math.PI*next());}
const sigmoid=x=>1/(1+Math.exp(-x));
const square=x=>x*Math.abs(x);
const fields=(e,key)=>e[key].map(row=>row.fields);

function buildModel(e,seed){
 const candidates=[e.candidate_id,...e.opponents_list],ns=e.states_json.length,nc=candidates.length;
 const cells=ns*nc,p=e.global_parameter_json[0].fields,proportional=String(e.game_type_id)==='2';
 const ids=new Map(candidates.map((id,i)=>[id,i])),states=new Map(e.states_json.map((s,i)=>[s.pk,i]));
 const scoreByCandidate=candidates.map(id=>new Map(fields(e,'candidate_issue_score_json').filter(row=>row.candidate===id).reverse().map(row=>[row.issue,row.issue_score])));
 const topics=[...scoreByCandidate[0].keys()].reverse(),mate=new Map(fields(e,'running_mate_issue_score_json').map(row=>[row.issue,row.issue_score]));
 const stateIssues=Array.from({length:ns},()=>new Map());
 for(const row of fields(e,'state_issue_score_json'))if(!stateIssues[states.get(row.state)].has(row.issue))stateIssues[states.get(row.state)].set(row.issue,row);
 const issueTable=e.states_json.map((_,s)=>topics.map(topic=>stateIssues[s].get(topic)||{state_issue_score:0,weight:1}));
 const issueValue=(values,s)=>values.reduce((total,value,i)=>total+p.vote_variable-Math.abs((value-square(issueTable[s][i].state_issue_score))*issueTable[s][i].weight),0);
 const staticIssues=new Float64Array(cells),base=new Float64Array(cells);
 for(let s=0;s<ns;s++)for(let c=1;c<nc;c++)staticIssues[s*nc+c]=issueValue([...scoreByCandidate[c].values()].reverse().map(square),s);
 for(const row of fields(e,'candidate_state_multiplier_json'))if(ids.has(row.candidate)&&states.has(row.state))base[states.get(row.state)*nc+ids.get(row.candidate)]=row.state_multiplier;
 const effects=new Map(e.answers_json.map(({pk})=>[pk,{global:new Map(),state:[],issue:[]}])) ;
 for(const row of fields(e,'answer_score_global_json'))if(row.candidate===e.candidate_id&&ids.has(row.affected_candidate)&&effects.has(row.answer)){
  const g=effects.get(row.answer).global,c=ids.get(row.affected_candidate);if(!g.has(c))g.set(c,row.global_multiplier);
 }
 for(const row of fields(e,'answer_score_state_json'))if(row.candidate===e.candidate_id&&ids.has(row.affected_candidate)&&states.has(row.state)&&effects.has(row.answer))effects.get(row.answer).state.push([states.get(row.state)*nc+ids.get(row.affected_candidate),row.state_multiplier]);
 for(const row of fields(e,'answer_score_issue_json'))if(topics.includes(row.issue)&&effects.has(row.answer))effects.get(row.answer).issue.push([topics.indexOf(row.issue),row.issue_score*row.issue_importance,row.issue_importance]);
 const next=random(seed);
 const stress=Array.from({length:15},(_,i)=>({
  global:candidates.map(()=>i?1+normal(next)*p.global_variance:1),
  local:base.map(()=>i?1+normal(next)*p.global_variance:1),
  turnout:e.states_json.map(s=>Math.floor(s.fields.popular_votes*(i?.95+.1*next():1)))
 }));
 const mateState=states.get(Number(e.running_mate_state_id)),visitMultiplier=e.shining_data?.visit_multiplier??1;
 function prepare(answers){
  const global=new Float64Array(nc),state=new Float64Array(cells);
  const weights=topics.map(()=>p.candidate_issue_weight+p.running_mate_issue_weight);
  const scores=topics.map(topic=>scoreByCandidate[0].get(topic)*p.candidate_issue_weight+mate.get(topic)*p.running_mate_issue_weight);
  for(const answer of answers){const effect=effects.get(answer);
   for(const [c,v]of effect.global)global[c]+=v;
   for(const [at,v]of effect.state)state[at]+=v;
   for(const [at,v,w]of effect.issue){scores[at]+=v;weights[at]+=w;}
  }
  for(let c=0;c<nc;c++)global[c]=(c===0?Math.max(.6,1+global[c])*e.difficulty_level_multiplier:1+global[c]);
  const ownStances=scores.map((value,i)=>square(value/weights[i]));
  const issues=staticIssues.slice();for(let s=0;s<ns;s++)issues[s*nc]=issueValue(ownStances,s);
  return {global,state,issues};
 }
 function simulate(prepared,visits,draw){
  const electoral=new Int16Array(nc),popular=new Float64Array(nc),margins=new Float64Array(ns),shares=new Float64Array(ns),ranks=new Uint8Array(ns),scores=new Float64Array(nc);
  let smooth=0;
  for(let s=0;s<ns;s++){
   const state=e.states_json[s].fields,ev=state.electoral_votes;
   let total=0,winner=0,rival=-Infinity,second=0,rank=1;
   for(let c=0;c<nc;c++){
    const at=s*nc+c,multiplier=base[at]*prepared.global[c]*draw.global[c]*draw.local[at];
    const bonus=c===0?Number(s===mateState)*.004*multiplier+visits[s]*.005*Math.max(.1,multiplier)*visitMultiplier:0;
    const value=scores[c]=Math.max(0,prepared.issues[at]*(multiplier+prepared.state[at]+bonus));
    total+=value;if(value>=scores[winner])winner=c;if(c&&value>=rival){rival=value;second=c;}
   }
   if(!total)throw Error('Could not project '+state.abbr);
   const margin=margins[s]=(scores[0]-rival)/total;shares[s]=scores[0]/total;
   let allocated=0,voteTotal=0,winnerVotes=0;
   for(let c=0;c<nc;c++){
    const share=scores[c]/total,votes=Math.floor(share*draw.turnout[s]);
    popular[c]+=votes;voteTotal+=votes;if(c===winner)winnerVotes=votes;
    if(c&&scores[c]>=scores[0])rank++;
    if(proportional){const count=Math.floor(share*ev);electoral[c]+=count;allocated+=count;}
   }
   if(proportional)electoral[winner]+=ev-allocated;
   else if(state.winner_take_all_flg)electoral[winner]+=ev;
   else{
    if(winner!==0){second=0;for(let c=1;c<nc;c++)if(c!==winner&&scores[c]>=scores[second])second=c;}
    const first=Math.ceil(winnerVotes/voteTotal*ev*1.25);electoral[winner]+=first;electoral[second]+=ev-first;
   }
   ranks[s]=rank;smooth+=ev*sigmoid(margin/.017);
  }
  return {ev:electoral[0],pv:popular[0],lead:popular[0]-Math.max(...popular.slice(1)),margins,shares,ranks,smooth};
 }
 return {prepare,simulate,stress};
}

function objective(rule,result,e){
 const majority=e.election_json.find(r=>Number(r.pk)===Number(e.election_id)).fields.winning_electoral_vote_number;
 if(rule.lose){
  const unwanted=rule.lose.map(name=>e.states_json.findIndex(row=>row.fields.name===name));
  const losses=unwanted.filter(s=>result.ranks[s]===2).length;
  const rankMargins=unwanted.reduce((sum,s)=>sum+sigmoid(-result.margins[s]/.012),0);
  return 28*Number(result.ev>=majority&&losses===unwanted.length)+.65*Math.min(result.ev-majority+12,22)+3.5*losses+4*rankMargins+.016*result.smooth;
 }
 if(rule.goal==='exact'){
  const delta=Math.min(...(rule.targets||[rule.target]).map(n=>Math.abs(result.ev-n)));
  return delta===0?10:-Math.log1p(delta)*2;
 }
 if(rule.goal==='winPopular')return 38*Number(result.ev>=majority&&result.lead>0)+.17*Math.min(result.ev-majority+15,38)+Math.min(20,result.lead/85000)+.01*result.smooth;
 if(rule.goal==='win'||rule.goal==='min'){
  const threshold=rule.target??majority;
  return 27*Number(result.ev>=threshold)+.7*Math.min(result.ev-threshold,25)+.13*result.smooth;
 }
 throw Error('Unsupported search goal '+rule.goal);
}

function search(rule,scenario,e,mode,difficulty,seed){
 const model=buildModel(e,seed),stateIndex=new Map(e.states_json.map((row,i)=>[row.fields.abbr,i]));
 const groups=e.questions_json.map((q,i)=>{
  const choices=e.answers_json.filter(a=>a.fields.question===q.pk).map(a=>a.pk);
  const forced=rule.slots?.[i]??choices.find(id=>rule.required?.includes(id));
  if(forced)assert(choices.includes(forced));return forced?[forced]:choices;
 });
 const visitables=e.states_json.map((row,i)=>row.fields.electoral_votes>0&&row.fields.abbr?.length===2?i:-1).filter(i=>i>=0);
 const existing=catalogue.filter(r=>r.achievement===rule.id&&r.scope===scenario.scope&&r.mode===mode&&r.difficulty===difficulty);
 const base=existing.filter(r=>!r.supersededBy).sort((a,b)=>(b.replays?.success||0)-(a.replays?.success||0))[0];
 const anchor=groups.map((group,i)=>base?.answers[e.questions_json[i].pk]?.find(id=>group.includes(id))??group[0]);
 const baselineVisits=new Uint8Array(e.states_json.length);
 for(const abbr of base?.visits.sequence||[])baselineVisits[stateIndex.get(abbr)]++;
 const visitCount=scenario.year<1900?0:12;
 while(baselineVisits.reduce((a,b)=>a+b,0)<visitCount)baselineVisits[visitables[0]]++;
 const exact=rule.goal==='exact',next=random(1291),winners=[];
 const value=(prepared,visits)=>model.stress.reduce((sum,s)=>sum+objective(rule,model.simulate(prepared,visits,s),e),0)/model.stress.length;
 for(let restart=0;restart<(exact?10:6);restart++){
  const answers=restart>1&&winners.length?[...winners[0].answers]:[...anchor];
  const visits=restart>1&&winners.length?winners[0].visits.slice():baselineVisits.slice();
  if(restart)for(let i=0;i<answers.length;i++)if(next()<(restart===1?1:.24))answers[i]=groups[i][Math.floor(next()*groups[i].length)];
  if(restart)for(let i=0;i<visits.length;i++)if(visits[i]&&next()<.45){const n=visits[i];visits[i]=0;visits[visitables[Math.floor(next()*visitables.length)]]+=n;}
  let current=model.prepare(answers),cost=value(current,visits);
  for(let pass=0;pass<4;pass++){
   let changed=false;
   for(const i of Array.from(groups.keys()).sort(()=>next()-.5)){
    let winner=answers[i];
    for(const id of groups[i])if(id!==winner){answers[i]=id;const prep=model.prepare(answers),score=value(prep,visits);if(score>cost+1e-8){winner=id;cost=score;current=prep;changed=true;}}
    answers[i]=winner;
   }
   for(const from of visitables.filter(i=>visits[i])){
    for(let j=0,n=visits[from];j<n&&visits[from];j++){
     let winner=from;visits[from]--;
     for(const to of visitables){visits[to]++;const score=value(current,visits);visits[to]--;if(score>cost+1e-8){winner=to;cost=score;changed=true;}}
     visits[winner]++;if(winner===from)break;
    }
   }
   if(!changed)break;
  }
  winners.push({answers,visits,cost});winners.sort((a,b)=>b.cost-a.cost);
 }
 const best=winners[0],prepared=model.prepare(best.answers),zero=model.simulate(prepared,best.visits,model.stress[0]);
 const indexes=Array.from(best.visits).flatMap((n,i)=>Array(n).fill(i));
 const projected=box.window.NCTGuideModel.project({...e,player_answers:best.answers,player_visits:indexes.map(i=>e.states_json[i].pk)});
 const actual=projected.flatMap(row=>row.result.filter(c=>c.candidate===e.candidate_id));
 assert.equal(zero.ev,actual.reduce((n,c)=>n+c.electoral_votes,0),scenario.scope+' vote parity');
 for(const [i,state]of e.states_json.entries()){
  const own=projected.find(row=>row.state===state.pk).result.find(c=>c.candidate===e.candidate_id);
  assert(Math.abs(zero.shares[i]-own.percent)<1e-10,`${scenario.scope} ${state.fields.abbr} share parity: ${zero.shares[i]} / ${own.percent}`);
 }
 assert.equal(zero.pv,actual.reduce((n,c)=>n+c.votes,0),scenario.scope+' popular vote parity');
 const mapped=Object.fromEntries(e.questions_json.map((q,i)=>[q.pk,[best.answers[i]]]));
 const suffix=seed===90817?'v1':String(seed);
 return {id:`${rule.id}-${scenario.scope}-${mode}-${difficulty}-stress-${suffix}`,achievement:rule.id,scope:scenario.scope,source,origin:'model-search',answers:mapped,visits:{sequence:indexes.map(i=>e.states_json[i].fields.abbr)},difficulty,mode,search:{score:best.cost,zeroEV:zero.ev,zeroPV:zero.pv,simulationSeed:seed}};
}

const config=JSON.parse(fs.readFileSync(process.argv[4],'utf8'));
const routes=[];
for(const [id,scope,mode,difficulty,seed=90817] of config){
 const input=path.join(captures,`${scope}-${mode}-${difficulty}.json`);
 const e=JSON.parse(fs.readFileSync(input,'utf8'));
 assert(!e.primary_states,'Locked-state snapshot is unsupported by this search');
 const route=search(rules.find(r=>r.id===id),scenarios.find(s=>s.scope===scope),e,String(mode),difficulty,seed);
 routes.push(route);fs.writeFileSync(output,JSON.stringify({routes},null,2)+'\n');
 console.log(route.id,route.search);
}
