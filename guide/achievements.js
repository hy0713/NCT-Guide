/* Read-only objective coaching. No game predicates, RNG or saves are modified. */
(function(){
 'use strict';
 const data=window.NCTAchievementData;
 let planningKey='',planningCache=null;
 let planner=null,pendingKey='';
 function cancelPlanning(){if(pendingKey&&planner){planner.terminate();planner=null;}pendingKey='';}
 const t=(key,params={})=>NCTI18n.text('guide.achievement_'+key,params);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let selected='';try{selected=localStorage.getItem('nct.guide.achievement')||'';}catch(_){}
 let enabled=true;try{enabled=localStorage.getItem('nct.guide.achievement.enabled')!=='off';}catch(_){}
 let selectedRoute='';try{selectedRoute=localStorage.getItem('nct.guide.route')||'';}catch(_){}
 const rule=id=>data.rules.find(r=>r.id===id);
 const name=r=>NCTI18n.language==='zh-CN'?r.name:r.english;
 function match(r,s){return !!s&&(!r.year||r.year===Number(s.election))&&(!r.years||r.years.includes(Number(s.election)))&&(!r.candidate||s.candidateName.split(' ').at(-1)===r.candidate)&&(!r.mate||s.runningMateName.split(' ').at(-1)===r.mate)&&[...(r.required||[]),...Object.values(r.slots||{})].every(id=>s.answerIds.includes(id));}
 function current(e){return data.scenarios.find(s=>s.election===Number(e.election_id)&&s.candidate===Number(e.candidate_id)&&s.runningMate===Number(e.running_mate_id));}
 function save(){try{return JSON.parse(localStorage.getItem('achievements'))||{};}catch(_){return {};}}
 function status(e,r,ids=[]){
  const s=current(e),answers=e.player_answers||[],stored=save();
  if(!match(r,s))return {kind:'combination',forced:[]};
  if(r.id==='destiny'&&stored.threeosix?.[s.year]&&!stored.achievements?.destiny)return {kind:'recorded',forced:[]};
  const legit=e.bigshot_mode!==true&&(typeof dirtyhacker3==='undefined'||dirtyhacker3==null)&&String(e.game_type_id)!=='3';
  if((r.special?legit:!legit)||(r.bigshot&&!e.bigshot_mode)||(r.maxDifficulty!=null&&e.difficulty_level_multiplier>r.maxDifficulty)||(r.difficulty!=null&&e.difficulty_level_multiplier!==r.difficulty))return {kind:'settings',forced:[]};
  if(e.final_overall_results&&e.player_answers.length>=e.global_parameter_json?.[0]?.fields.question_count&&!stored.achievements?.[r.id])return {kind:'ended',forced:[]};
  for(const [index,id]of Object.entries(r.slots||{})){
   if(answers.length>Number(index)&&answers[index]!==id)return {kind:'missed',forced:[],answer:id};
   if(answers.length===Number(index)&&ids.length&&!ids.includes(id))return {kind:'missed',forced:[],answer:id};
  }
  const pending=(r.required||[]).filter(id=>!answers.includes(id));
  for(const id of pending){const row=e.answers_json.find(a=>a.pk===id);if(row&&answers.some(chosen=>e.answers_json.find(a=>a.pk===chosen)?.fields.question===row.fields.question))return {kind:'missed',forced:[],answer:id};}
  const forced=ids.filter(id=>pending.includes(id)||Object.entries(r.slots||{}).some(([i,a])=>Number(i)===answers.length&&a===id));
  return {kind:stored.achievements?.[r.id]?'unlocked':'open',forced,pending};
 }
 function targets(r,e){return r.targets||[r.target];}
 function cost(r,p,e){
  // For an ordinary win keep the audited smooth competitive-state objective;
  // greedily crossing today's EV threshold can sacrifice later swing states.
  const win=-p.score;
  if(r.goal==='exact')return Math.min(...targets(r,e).map(n=>Math.abs(p.electoral-n)*1000+Math.abs(p.score-n)));
  if(r.goal==='max')return Math.max(0,p.electoral-r.target)*1000+p.score;
  if(r.goal==='min')return Math.max(0,r.target-p.electoral)*1000-p.score;
  if(r.goal==='votes')return -p.popularVotes;
  if(r.goal==='popularLead')return -p.popularLead;
  if(r.goal==='winLosePopular')return win+Math.max(0,p.popularLead+1)/10000;
  if(r.goal==='winPopular')return win+Math.max(0,1-p.popularLead)/10000;
  if(r.goal==='state')return -(p.states.find(s=>s.name===r.state)?.margin??-1)*100000;
  if(r.goal==='florida'){const state=p.states.find(s=>s.name==='Florida');return (state?.topMargin??1)*100000+Math.max(0,p.leaderEV-294)*1000;}
  if(r.lose)return win+r.lose.reduce((sum,n)=>{const state=p.states.find(s=>s.name===n);return sum+Math.max(0,(state?.margin??0)+.0001)*1000000+Math.max(0,(state?.rank??2)-2)*1000;},0);
  return win;
 }
 function suggestions(r){
  return data.scenarios.filter(s=>match(r,s)&&(r.id!=='destiny'||!save().threeosix?.[s.year])).map(s=>{
   const b=s.baseline;let score=0;const comparable=!!b&&(r.special?false:b.mode!=='3')&&(r.maxDifficulty==null||.97<=r.maxDifficulty)&&(r.difficulty==null||r.difficulty===.97);
   if(comparable){if(r.goal==='exact')score=-Math.min(...(r.targets||[r.target]).map(n=>Math.abs(b.ev-n)));else if(r.goal==='max')score=-b.ev;else if(r.goal==='votes'||r.goal==='popularLead')score=b.pv/1000000;else score=b.ev;}
   const verified=(data.routes||[]).filter(x=>x.achievement===r.id&&x.scope===s.scope&&x.replays?.success>0).sort((a,b)=>b.replays.success-a.replays.success)[0];
   return {...s,comparable,rank:score,verified};
  }).sort((a,b)=>Number(!!b.verified)-Number(!!a.verified)||Number(b.comparable)-Number(a.comparable)||b.rank-a.rank||a.scope.localeCompare(b.scope));
 }
 function fingerprint(text){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return(h>>>0).toString(16);}
 function routeInfo(e,r,ids){
  const s=current(e),available=(data.routes||[]).filter(x=>x.achievement===r.id&&x.scope===s?.scope);
  available.sort((a,b)=>Number((b.replays?.success||0)>0)-Number((a.replays?.success||0)>0)||Number(String(e.game_type_id)===b.mode&&e.difficulty_level_multiplier===b.difficulty)-Number(String(e.game_type_id)===a.mode&&e.difficulty_level_multiplier===a.difficulty)||b.mappedQuestions-a.mappedQuestions);
  const route=available.find(x=>x.id===selectedRoute)||available[0];
  if(!route)return null;
  const settings=String(e.game_type_id)===route.mode&&Math.abs(e.difficulty_level_multiplier-route.difficulty)<1e-9;
  const sourceMatches=Object.entries(route.fingerprints||{}).every(([id,hash])=>{const a=e.answers_json.find(a=>a.pk===+id);return a&&fingerprint(a.fields.description)===hash;});
  const deviated=e.player_answers.some(id=>{const a=e.answers_json.find(a=>a.pk===id),allowed=route.answers[a?.fields.question];return allowed&&!allowed.includes(id);});
  const sequence=route.visits.sequence;
  const visitDeviation=sequence&&e.player_visits.some((id,i)=>e.states_json.find(s=>s.pk===id)?.fields.abbr!==sequence[Math.min(i,sequence.length-1)]);
  const active=settings&&sourceMatches&&!deviated&&!visitDeviation;
  const q=e.answers_json.find(a=>a.pk===ids[0])?.fields.question;
  const answer=active?(route.answers[q]||[]).find(id=>ids.includes(id)):undefined;
  return {route,settings,sourceMatches,deviated:!!(deviated||visitDeviation),active,answer};
 }
 function plan(e,forecast,ids){
  if(!enabled)return null;
  const r=rule(selected);if(!r)return null;
  const state=status(e,r,ids),valid=['open','unlocked'].includes(state.kind);
  const route=routeInfo(e,r,ids);
  const planning=valid&&(ids.length?route?.answer===undefined:!route?.active)&&['win','min'].includes(r.goal)&&e.player_answers.length<e.questions_json.length?lookAhead(e,r,ids,forecast):null;
  const answers=valid?[...forecast.answers].sort((a,b)=>Number(state.forced.includes(b.id))-Number(state.forced.includes(a.id))||Number(b.id===route?.answer)-Number(a.id===route?.answer)||(planning?planning.answers[a.id]-planning.answers[b.id]:cost(r,a,e)-cost(r,b,e))||a.index-b.index):forecast.answers;
  const visits=valid?[...forecast.visits].sort((a,b)=>(planning?planning.visits[a.id]-planning.visits[b.id]:cost(r,a.forecast,e)-cost(r,b.forecast,e))||b.ev-a.ev||a.index-b.index):forecast.visits;
  if(valid&&route?.active){const policy=route.route.visits,sequence=policy.sequence;
   if(sequence){const abbr=sequence[Math.min(e.player_visits.length,sequence.length-1)];visits.sort((a,b)=>Number(b.abbr===abbr)-Number(a.abbr===abbr));}
   else{const pool=policy.weakest||policy.lowestShare||[];visits.sort((a,b)=>Number(pool.includes(b.abbr))-Number(pool.includes(a.abbr))||(pool.includes(a.abbr)&&pool.includes(b.abbr)?a.share-b.share:0));}
  }
  return {rule:r,status:state,valid,answers,visits,planning,route,recommendations:suggestions(r).slice(0,3)};
 }
 function lookAhead(e,r,ids,forecast){
  const key=JSON.stringify([r.id,ids,e.player_answers,e.player_visits,e.difficulty_level_multiplier,e.game_type_id,e.candidate_id,e.running_mate_id,e.answers_json,e.questions_json,e.shining_data]);
  if(key===planningKey&&planningCache)return planningCache;
  if(typeof document!=='undefined'){
   if(key===pendingKey)return null;
   cancelPlanning();pendingKey=key;
   if(!planner){planner=new Worker('/localization/guide/planner-worker.js');
    planner.onmessage=event=>{if(event.data.key!==pendingKey)return;pendingKey='';planningKey=event.data.key;planningCache=event.data.planning;NCTGuide.refresh();};
    planner.onerror=()=>{cancelPlanning();};
   }
   const input={...NCTGuide.input(e),questions_json:e.questions_json,answers_json:e.answers_json,election_id:e.election_id,running_mate_id:e.running_mate_id,bigshot_mode:e.bigshot_mode};
   planner.postMessage({key,input,ids,forecast,target:r.id,route:selectedRoute,stored:localStorage.getItem('achievements'),dirty:typeof dirtyhacker3==='undefined'?null:dirtyhacker3});
   return null;
  }
  const prefix=[...e.player_answers],required=[...(r.required||[]),...Object.values(r.slots||{})];
  const groups=e.questions_json.slice(prefix.length).map((q,index)=>{
   let list=e.answers_json.filter(a=>a.fields.question===q.pk).map(a=>a.pk);
   if(index===0&&ids.length)list=list.filter(id=>ids.includes(id));
   const forced=r.slots?.[prefix.length+index]||list.find(id=>required.includes(id));return forced?[forced]:list;
  }).filter(list=>list.length);
  const chosen=groups.map(list=>list[0]);let evaluations=0;
  const score=()=>{evaluations++;return cost(r,NCTGuide.predict(e,[...prefix,...chosen]),e);};let best=score();
  // Bounded coordinate search over the loaded question set. Future visibility
  // and conditional events are assumptions, never executed or auto-selected.
  for(let pass=0;pass<3&&evaluations<220;pass++){let changed=false;
   for(let i=0;i<groups.length&&evaluations<220;i++){let selected=chosen[i],value=best;
    for(const id of groups[i]){if(id===selected)continue;chosen[i]=id;const next=score();if(next<value){value=next;selected=id;}}
    changed||=chosen[i]!==selected;chosen[i]=selected;if(value<best){changed=true;best=value;}
   }if(!changed)break;
  }
  const answers={};for(const id of ids){const copy=[...chosen];copy[0]=id;answers[id]=cost(r,NCTGuide.predict(e,[...prefix,...copy]),e);}
  const visits={};for(const state of forecast.visits)visits[state.id]=cost(r,NCTGuide.predict(e,[...prefix,...chosen],state.id),e);
  planningKey=key;planningCache={answers,visits,evaluations};return planningCache;
 }
 function render(e,p,ids,expanded=new Set()){
  const fold=(id,title,body,open=false)=>`<details data-guide-section="${id}"${open||expanded.has(id)?' open':''}><summary>${esc(title)}</summary>${body}</details>`;
  let html=`<section class="nct-achievements"><div class="nct-achievement-controls"><label><input type="checkbox" id="achievement-enabled"${enabled?' checked':''}> ${esc(t('enabled'))}</label>`;
  if(!enabled)return html+`</div><small>${esc(t('disabled'))}</small></section>`;
  html+=`<label for="achievement-target" class="nct-target-label">${esc(t('choose'))}<select id="achievement-target"><option value="">${esc(t('general'))}</option>`;
  for(const r of data.rules)html+=`<option value="${r.id}"${r.id===selected?' selected':''}>${esc(name(r))}${match(r,current(e))?' ✓':''}</option>`;
  html+='</select></label></div>';
  if(!p)return html+'</section>';
  html+=`<div class="nct-achievement-goal"><strong data-achievement-status="${p.status.kind}">${esc(t(p.status.kind))}</strong><span>${esc(t('goal_'+p.rule.goal,{target:p.rule.target??(p.rule.targets||[]).join('/')}))}</span></div>`;
  if(p.rule.id==='what')html+=`<small>${esc(t('counter',{count:save().tsatrolling||0}))}</small>`;
  if(p.rule.id==='destiny')html+=`<small>${esc(t('years',{years:Object.entries(save().threeosix||{}).filter(([,v])=>v).map(([k])=>k).join(', ')||'—'}))}</small>`;
  if(p.status.forced.length)html+=`<p class="nct-guide-action">${esc(t('required_now'))}</p>`;
  let conditions='',extra='';
  if(p.rule.lose)conditions+=`<p>${esc(t('lose_states',{states:p.rule.lose.map(n=>NCTI18n.term(n)).join(' / ')}))}</p>`;
  if(p.rule.state)conditions+=`<p>${esc(t('win_state',{state:NCTI18n.term(p.rule.state)}))}</p>`;
  if(p.rule.maxDifficulty!=null)conditions+=`<p>${esc(t('difficulty',{value:p.rule.maxDifficulty}))}</p>`;
  if(p.rule.difficulty!=null)conditions+=`<p>${esc(t('exact_difficulty',{value:p.rule.difficulty}))}</p>`;
  const procedure={destiny:'destiny',what:'what',yourchance:'whychance',stillAlive:'stillAlive'}[p.rule.id];
  if(procedure)conditions+=`<p>${esc(t('procedure_'+procedure))}</p>`;
  for(const id of [...Object.values(p.rule.slots||{}),...(p.rule.required||[])]){const row=e.answers_json.find(a=>a.pk===id);conditions+=`<p>${esc(t(e.player_answers.includes(id)?'answer_done':'answer_pending',{id}))}</p>`;if(row)conditions+=`<div class="nct-required-answer">${NCTStory.html('answers_json',row.pk,'description',row.fields.description)}</div>`;}
  if(conditions)extra+=fold('conditions',t('conditions'),conditions,p.status.kind==='settings'||p.status.kind==='missed');
  if(p.route){const info=p.route,r=info.route,stats=r.replays;
   if(!info.sourceMatches)html+=`<p class="nct-guide-action">${esc(t('route_source_changed'))}</p>`;
   else if(!info.settings)html+=`<p class="nct-guide-action">${esc(t('route_settings',{mode:r.mode==='2'?NCTI18n.language==='zh-CN'?'比例分配':'Proportional':NCTI18n.language==='zh-CN'?'默认':'Default',difficulty:r.difficulty}))}</p>`;
   else if(info.deviated)html+=`<small>${esc(t('route_deviated'))}</small>`;
   else if(ids.length&&info.answer===undefined)html+=`<small>${esc(t('route_gap'))}</small>`;
   let routeHTML=`<p>${esc(stats?t(p.rule.id==='destiny'?'route_year_tested':'route_tested',{success:stats.success,total:stats.total}):t('route_unverified'))}</p>`;
   const alternatives=(data.routes||[]).filter(x=>x.achievement===p.rule.id&&x.scope===r.scope);
   if(alternatives.length>1){routeHTML+=`<label for="achievement-route">${esc(t('route_choose'))}</label> <select id="achievement-route">`;for(const[i,x]of alternatives.entries())routeHTML+=`<option value="${esc(x.id)}"${x.id===r.id?' selected':''}>${esc(t(x.origin==='model-search'?'route_model':x.origin==='baseline-replay'?'route_baseline':'route_community'))} · ${esc(t('route_candidate',{index:i+1,success:x.replays?.success??0,total:x.replays?.total??0}))}</option>`;routeHTML+='</select>';}
   if(r.notes?.[NCTI18n.language])routeHTML+=`<p>${esc(r.notes[NCTI18n.language])}</p>`;
   routeHTML+=`<a href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">${esc(t('route_source'))}</a>`;
   extra+=fold('route',t('route_title'),`<div class="nct-community-route">${routeHTML}</div>`);
  }
  let combinations='<ol>';
  for(const v of p.recommendations)combinations+=`<li>${esc(v.year+' · '+NCTStory.term(v.candidateName)+' / '+NCTStory.term(v.runningMateName))}<br><small>${esc(v.verified?t(p.rule.id==='destiny'?'verified_year_pair':'verified_pair',{success:v.verified.replays.success,total:v.verified.replays.total,mode:v.verified.mode,difficulty:v.verified.difficulty,route:''}):v.comparable?t('baseline',{ev:v.baseline.ev}):t('untested'))}</small></li>`;
  extra+=fold('combinations',t('combinations'),combinations+'</ol>',p.status.kind==='combination');
  return html+fold('achievement-details',t('details'),extra,['combination','settings','missed'].includes(p.status.kind))+'</section>';
 }
 window.NCTAchievements={match,status,plan,render,cost,suggestions,routeInfo,cancelPlanning,get planningPending(){return !!pendingKey;},get selectedRoute(){return selectedRoute;},selectRoute(id){cancelPlanning();selectedRoute=(data.routes||[]).some(r=>r.id===id)?id:'';try{localStorage.setItem('nct.guide.route',selectedRoute);}catch(_){}},get enabled(){return enabled;},setEnabled(value){enabled=!!value;if(!enabled)cancelPlanning();try{localStorage.setItem('nct.guide.achievement.enabled',enabled?'on':'off');}catch(_){}},get selected(){return selected;},select(id){if(id!==selected)cancelPlanning();selected=rule(id)?id:'';try{localStorage.setItem('nct.guide.achievement',selected);}catch(_){}}};
})();
