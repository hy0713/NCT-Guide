/* Read-only objective coaching. No game predicates, RNG or saves are modified. */
(function(){
 'use strict';
 const data=window.NCTAchievementData;
 let planningKey='',planningCache=null;
 const t=(key,params={})=>NCTI18n.text('guide.achievement_'+key,params);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let selected='';try{selected=localStorage.getItem('nct.guide.achievement')||'';}catch(_){}
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
   return {...s,comparable,rank:score};
  }).sort((a,b)=>Number(b.comparable)-Number(a.comparable)||b.rank-a.rank||a.scope.localeCompare(b.scope));
 }
 function plan(e,forecast,ids){
  const r=rule(selected);if(!r)return null;
  const state=status(e,r,ids),valid=['open','unlocked'].includes(state.kind);
  const planning=valid&&['win','min'].includes(r.goal)&&e.player_answers.length<e.questions_json.length?lookAhead(e,r,ids,forecast):null;
  const answers=valid?[...forecast.answers].sort((a,b)=>Number(state.forced.includes(b.id))-Number(state.forced.includes(a.id))||(planning?planning.answers[a.id]-planning.answers[b.id]:cost(r,a,e)-cost(r,b,e))||a.index-b.index):forecast.answers;
  const visits=valid?[...forecast.visits].sort((a,b)=>(planning?planning.visits[a.id]-planning.visits[b.id]:cost(r,a.forecast,e)-cost(r,b.forecast,e))||b.ev-a.ev||a.index-b.index):forecast.visits;
  return {rule:r,status:state,valid,answers,visits,planning,recommendations:suggestions(r).slice(0,3)};
 }
 function lookAhead(e,r,ids,forecast){
  const key=JSON.stringify([r.id,ids,e.player_answers,e.player_visits,e.difficulty_level_multiplier,e.game_type_id,e.candidate_id,e.running_mate_id,e.answers_json,e.questions_json,e.shining_data]);
  if(key===planningKey&&planningCache)return planningCache;
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
 function render(e,p,ids){
  const compatible=data.rules.filter(r=>match(r,current(e)));
  let html=`<section class="nct-achievements"><h4>${esc(t('title'))}</h4><label for="achievement-target">${esc(t('choose'))}</label> <select id="achievement-target"><option value="">${esc(t('general'))}</option>`;
  for(const r of data.rules)html+=`<option value="${r.id}"${r.id===selected?' selected':''}>${esc(name(r))}${match(r,current(e))?' ✓':''}</option>`;
  html+=`</select><p>${esc(t('compatible',{names:compatible.map(name).join(' / ')||t('none')}))}</p>`;
  if(!p)return html+`<p>${esc(t('select_hint'))}</p></section>`;
  html+=`<strong data-achievement-status="${p.status.kind}">${esc(t(p.status.kind))}</strong><p>${esc(t('goal_'+p.rule.goal,{target:p.rule.target??(p.rule.targets||[]).join('/')}))}</p>`;
  if(p.rule.lose)html+=`<p>${esc(t('lose_states',{states:p.rule.lose.map(n=>NCTI18n.term(n)).join(' / ')}))}</p>`;
  if(p.rule.state)html+=`<p>${esc(t('win_state',{state:NCTI18n.term(p.rule.state)}))}</p>`;
  if(p.rule.maxDifficulty!=null)html+=`<p>${esc(t('difficulty',{value:p.rule.maxDifficulty}))}</p>`;
  if(p.rule.difficulty!=null)html+=`<p>${esc(t('exact_difficulty',{value:p.rule.difficulty}))}</p>`;
  if(p.rule.special)html+=`<p>${esc(t('special'))}</p>`;
  if(p.rule.id==='what')html+=`<p>${esc(t('counter',{count:save().tsatrolling||0}))}</p>`;
  if(p.rule.id==='destiny')html+=`<p>${esc(t('years',{years:Object.entries(save().threeosix||{}).filter(([,v])=>v).map(([k])=>k).join(', ')||'—'}))}</p>`;
  const required=[...Object.values(p.rule.slots||{}),...(p.rule.required||[])];
  for(const id of required){const row=e.answers_json.find(a=>a.pk===id),done=e.player_answers.includes(id);html+=`<p>${esc(t(done?'answer_done':p.status.forced.includes(id)?'answer_now':'answer_pending',{id}))}</p>`;if(row)html+=`<div class="nct-required-answer">${NCTStory.html('answers_json',row.pk,'description',row.fields.description)}</div>`;}
  if(!p.valid)html+=`<p>${esc(t('blocked'))}</p>`;
  html+=`<p>${esc(t('ranking'))}</p>`;
  if(p.planning)html+=`<p>${esc(t('planning'))}</p>`;
  html+=`<details${p.valid?'':' open'}><summary>${esc(t('combinations'))}</summary><p>${esc(t('evidence'))}</p><ol>`;
  for(const s of p.recommendations)html+=`<li>${esc(s.year+' · '+NCTStory.term(s.candidateName)+' / '+NCTStory.term(s.runningMateName))}<br><small>${esc(s.comparable?t('baseline',{ev:s.baseline.ev}):t('untested'))}</small></li>`;
  return html+`</ol></details><p>${esc(t('uncertainty'))}</p></section>`;
 }
 window.NCTAchievements={match,status,plan,render,cost,suggestions,get selected(){return selected;},select(id){selected=rule(id)?id:'';try{localStorage.setItem('nct.guide.achievement',selected);}catch(_){}}};
})();
