/* Offline coordinate search over copies of captured original inputs.
 * This is a route candidate generator, never proof of reachability/success. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const game=path.resolve(process.argv[2]||'.'),root=path.resolve(__dirname,'..');
const dataFile=path.join(root,'achievements/community-routes.json'),data=JSON.parse(fs.readFileSync(dataFile,'utf8'));
const sandbox={window:null,document:{addEventListener(){}},addEventListener(){},localStorage:{getItem(){return null;}},NCTI18n:{text:k=>k}};sandbox.window=sandbox;vm.createContext(sandbox);
for(const f of ['model.js','achievement-data.js','achievements.js','guide.js'])vm.runInContext(fs.readFileSync(path.join(root,'guide',f),'utf8'),sandbox);
const engine=sandbox.NCTAchievements,rules=sandbox.NCTAchievementData.rules;
const missing=[['karmic','2012_Obama_Clinton',1,.97],['master','2000_Gore_Graham',1,.97],['swap','2000_Gore_Graham',1,.97],['florida2000','2000_Bush_Cheney',1,.97],['Commoner','1896_Bryan_Teller',1,.97],['ratio','1968_Humphrey_Harris',1,.97],['Rainbow','1988_Dukakis_Jackson',1,.97],['California','1916_Hughes_Fairbanks',1,.97],['georgenixon','1968_Nixon_Agnew',1,.97],['BCitsEasy','1960_Kennedy_Humphrey',1,1.33],['whatbelt','2016_Clinton_Kaine',2,.9],['why','2016a_Clinton_Booker',1,.97],['what','2016a_Clinton_Booker',1,.97],['destiny','2012_Obama_Biden',2,.97],['destiny','2000_Gore_Graham',2,.97],['destiny','1964_Johnson_Humphrey',2,.97]];
const cases=[...missing,...data.routes.filter(r=>!['raiders','moscow','Dewey'].includes(r.achievement)).map(r=>[r.achievement,r.scope,+r.mode,r.difficulty])];
const report=process.env.NCT_SEARCH_RESUME&&fs.existsSync(path.join(root,'achievements/route-search-report.json'))?JSON.parse(fs.readFileSync(path.join(root,'achievements/route-search-report.json'),'utf8')):{method:'Coordinate search of answer IDs and all future visits using the zero-noise original formula on independent copies; no game edits or RNG calls. Generated candidates require real browser replays.',candidates:[]};
const seen=new Set(),filter=process.env.NCT_SEARCH_TARGETS?.split(','),scopeFilter=process.env.NCT_SEARCH_SCOPES?.split(',');
for(const [achievement,scope,mode,difficulty]of cases){
 const key=achievement+'-'+scope+'-'+mode+'-'+difficulty,suffix=process.env.NCT_SEARCH_SUFFIX||'search';if(seen.has(key)||filter&&!filter.includes(achievement)||scopeFilter&&!scopeFilter.includes(scope))continue;seen.add(key);
 if(process.env.NCT_SEARCH_RESUME&&data.routes.some(r=>r.id===key+'-'+suffix))continue;
 const inputPath=path.join(game,'.test-artifacts/route-inputs',scope+'-'+mode+'-'+difficulty+'.json');if(!fs.existsSync(inputPath))continue;
 const e=JSON.parse(fs.readFileSync(inputPath,'utf8')),r=rules.find(r=>r.id===achievement);
 const options=data.routes.filter(r=>r.achievement===achievement&&r.scope===scope&&+r.mode===mode&&r.difficulty===difficulty);
 const base=process.env.NCT_SEARCH_BASELINE?options.find(r=>r.origin==='baseline-replay')||options[0]:options[0];
 const required=[...(r.required||[]),...Object.values(r.slots||{})];
 const groups=e.questions_json.map((q,i)=>{let options=e.answers_json.filter(a=>a.fields.question===q.pk).map(a=>a.pk);const forced=r.slots?.[i]||options.find(id=>required.includes(id));return forced?[forced]:options;});
 const chosen=groups.map((ids,i)=>(base?.answers[e.questions_json[i].pk]||[]).find(id=>ids.includes(id))||ids[0]);
 if(process.env.NCT_SEARCH_RANDOM_START){let seed=Number(process.env.NCT_SEARCH_RANDOM_START);for(let i=0;i<chosen.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;chosen[i]=groups[i][seed%groups[i].length];}}
 const visitCount=['1896','1860','1844'].some(y=>scope.startsWith(y+'_'))?0:12;
 const visitable=e.states_json.filter(s=>s.fields.electoral_votes>0&&s.fields.abbr?.length===2);
 const visits=Array.from({length:visitCount},(_,i)=>visitable.find(s=>s.fields.abbr===base?.visits.sequence?.[i])?.pk||visitable[0].pk);
 let evaluations=0,best=Infinity,summary;
 function objective(p,input){const margin=Number(process.env.NCT_SEARCH_MARGIN||0);let value=engine.cost(r,p,input)+(r.lose&&margin?r.lose.reduce((n,name)=>n+Math.max(0,(p.states.find(s=>s.name===name)?.margin||0)+margin)*1000000,0):0);if(process.env.NCT_SEARCH_DISCRETE&&r.lose){value-=p.electoral*1000;for(const name of r.lose)if(p.states.find(s=>s.name===name)?.rank!==2)value+=10000000;}return value;}
 function evaluate(){evaluations++;const input={...e,player_visits:visits};const p=sandbox.NCTGuide.predict(input,chosen);return {p,cost:objective(p,input)};}
 let trial=evaluate();best=trial.cost;summary=trial.p;
 for(let pass=0;pass<4;pass++){let changed=false;
  for(let i=0;i<groups.length;i++){let selected=chosen[i];for(const id of groups[i]){chosen[i]=id;const t=evaluate();if(t.cost<best){best=t.cost;selected=id;summary=t.p;changed=true;}}chosen[i]=selected;}
  // Search visit allocations against the complete planned answer sequence.
  const cache=new Map(),counts=Object.fromEntries(e.states_json.map(s=>[s.pk,visits.filter(id=>id===s.pk).length]));
  const keys=['candidate_id','opponents_list','answer_score_global_json','global_parameter_json','difficulty_level_multiplier','candidate_issue_score_json','candidate_state_multiplier_json','states_json','running_mate_issue_score_json','answer_score_issue_json','answer_score_state_json','running_mate_state_id','game_type_id','state_issue_score_json','primary_states'];
  function stateRow(id,count){const key=id+':'+count;if(!cache.has(key)){const input=Object.fromEntries(keys.map(k=>[k,e[k]]));input.player_answers=[...chosen];input.player_visits=Array(count).fill(id);input.shining_data={visit_multiplier:e.shining_data?.visit_multiplier??1};input.states_json=e.states_json.filter(s=>s.pk===id);for(const k of ['candidate_state_multiplier_json','state_issue_score_json','answer_score_state_json'])input[k]=e[k].filter(r=>r.fields.state===id);cache.set(key,sandbox.NCTGuideModel.project(input)[0]);}return cache.get(key);}
  let rows=e.states_json.map(s=>stateRow(s.pk,counts[s.pk]));
  // State visits affect only the visited state. Cache the unchanged original
  // state projection by visit count, then merge before computing the objective.
  for(let i=0;i<visits.length;i++){const old=visits[i];let selected=old,selectedRows=rows;
   for(const state of visitable){const id=state.pk;if(id===old)continue;evaluations++;
    const next=rows.map(row=>row.state===old?stateRow(old,counts[old]-1):row.state===id?stateRow(id,counts[id]+1):row);
    const p=sandbox.NCTGuide.summary(e,next),cost=objective(p,e);
    if(cost<best){best=cost;selected=id;summary=p;selectedRows=next;changed=true;}
   }
   if(selected!==old){counts[old]--;counts[selected]++;visits[i]=selected;rows=selectedRows;}
  }
  assert.deepStrictEqual(JSON.parse(JSON.stringify(sandbox.NCTGuide.summary(e,rows))),JSON.parse(JSON.stringify(evaluate().p)),'Cached visit projection equals full original formula');
  if(!changed)break;
 }
 const route={id:key+'-'+suffix,achievement,scope,source:'https://github.com/newcampaigntrail/newcampaigntrail.github.io/blob/d6655ef6ad80ab9a8fe5510d0fd43874e57dacbf/static/js/campaign_trail.js',origin:'model-search',answers:Object.fromEntries(e.questions_json.map((q,i)=>[q.pk,[chosen[i]]])),visits:{sequence:visits.map(id=>e.states_json.find(s=>s.pk===id).fields.abbr)},difficulty,mode:String(mode),verification:'unverified',notes:{'zh-CN':'本项目按源码进行离线整局搜索生成的候选路线；未经实际解锁验证时不能称作成功攻略。','en-US':'Candidate generated by offline full-game source-model search; not a success guide until an actual unlock is verified.'}};
 if(base)route.basedOn=base.source;
 const index=data.routes.findIndex(x=>x.id===route.id);if(index<0)data.routes.push(route);else data.routes[index]=route;
 report.candidates.push({id:route.id,evaluations,predictedEV:summary.electoral,predictedPV:summary.popularVotes,cost:best});
 fs.writeFileSync(dataFile,JSON.stringify(data,null,2)+'\n');fs.writeFileSync(path.join(root,'achievements/route-search-report.json'),JSON.stringify(report,null,2)+'\n');console.log(achievement,scope,'predicted',summary.electoral,'evals',evaluations);
}
