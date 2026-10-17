/* Optional native-campaign advice. Pure forecasts; never answer or visit for the player. */
(function(){
 'use strict';
 let enabled=false,panel,scheduled=false,last='',result=null;
 let cachedKey='',cachedResult=null;
 const modelKeys=['candidate_id','opponents_list','player_answers','player_visits','answer_score_global_json','global_parameter_json','difficulty_level_multiplier','candidate_issue_score_json','candidate_state_multiplier_json','states_json','running_mate_issue_score_json','answer_score_issue_json','answer_score_state_json','running_mate_state_id','game_type_id','state_issue_score_json','primary_states'];
 function modelInput(e){return {...Object.fromEntries(modelKeys.map(k=>[k,e[k]])),shining_data:{visit_multiplier:e.shining_data?.visit_multiplier??1}};}
 try{enabled=localStorage.getItem('nct.guide')==='on';}catch(_){}
 const t=(key,p={})=>NCTI18n.text('guide.'+key,p);
 const h=(key,p={})=>NCTI18n.html('guide.'+key,p);
 const signed=n=>(n>=0?'+':'')+n.toFixed(2);
 const native=()=>typeof window.modded==='undefined'||!window.modded;
 function place(){
  if(!panel||panel.hidden)return;
  panel.style.left='0px';
  const scale=panel.getBoundingClientRect().width/panel.offsetWidth||1;
  const width=Math.min(1000*scale,innerWidth-24);
  panel.style.width=width/scale+'px';panel.style.maxWidth='none';
  const r=panel.getBoundingClientRect();panel.style.left=((innerWidth-width)/2-r.left)/scale+'px';
 }
 function summary(e,rows){
  let electoral=0,score=0,popular=0,total=0;const totals={},evTotals={};
  const states=rows.map(row=>{
   const state=e.states_json.find(s=>s.pk===row.state),own=row.result.find(c=>c.candidate===e.candidate_id);
   if(!state||!own||!Number.isFinite(own.percent))throw Error('Incomplete forecast');
   const rival=Math.max(...row.result.filter(c=>c.candidate!==e.candidate_id).map(c=>c.percent));
   const margin=own.percent-rival,ev=state.fields.electoral_votes;
   electoral+=own.electoral_votes;
   // A smooth closeness-weighted objective, not a calibrated win probability.
   score+=String(e.game_type_id)==='2'||!state.fields.winner_take_all_flg?ev*own.percent:ev/(1+Math.exp(-margin/0.02));
   popular+=own.votes;total+=row.result.reduce((s,c)=>s+c.votes,0);
   for(const c of row.result){totals[c.candidate]=(totals[c.candidate]||0)+c.votes;evTotals[c.candidate]=(evTotals[c.candidate]||0)+c.electoral_votes;}
   const ranked=[...row.result].sort((a,b)=>b.percent-a.percent);
   return {id:row.state,name:state.fields.name,abbr:state.fields.abbr,ev,margin,share:own.percent,rank:ranked.findIndex(c=>c.candidate===e.candidate_id)+1,topMargin:ranked[0].percent-ranked[1].percent};
  });
  return {electoral,score,popular:popular/total,popularVotes:popular,popularLead:popular-Math.max(...Object.entries(totals).filter(([id])=>Number(id)!==e.candidate_id).map(([,n])=>n)),leaderEV:Math.max(...Object.values(evTotals)),states};
 }
 function analyze(e,ids){
  e=modelInput(e);
  const key=JSON.stringify([e,ids]);if(key===cachedKey&&cachedResult)return cachedResult;
  const baseRows=NCTGuideModel.project(e),base=summary(e,baseRows);
  const project=(answer,visit)=>{
   const copy={...e,player_answers:[...e.player_answers],player_visits:[...e.player_visits]};
   if(answer!==undefined)copy.player_answers.push(answer);
   if(visit!==undefined){
    copy.player_visits.push(visit);
    // A visit affects just this state. Evaluate that state with the original
    // formula, then merge into the unchanged national zero-noise projection.
    copy.states_json=e.states_json.filter(s=>s.pk===visit);
    for(const key of ['candidate_state_multiplier_json','state_issue_score_json','answer_score_state_json'])copy[key]=e[key].filter(r=>r.fields.state===visit);
    const row=NCTGuideModel.project(copy)[0];
    return summary(e,baseRows.map(r=>r.state===visit?row:r));
   }
   return summary(copy,NCTGuideModel.project(copy));
  };
  const answers=ids.map((id,index)=>({id,index,...project(id)}));
  const compare=(a,b)=>b.score-a.score||b.popular-a.popular||a.index-b.index;
  answers.sort(compare);
  const visits=base.states.map((s,index)=>{
   const after=project(undefined,s.id),next=after.states.find(r=>r.id===s.id);
   return {...s,index,score:after.score-base.score,gain:next.margin-s.margin,forecast:after};
  }).sort((a,b)=>b.score-a.score||b.ev-a.ev||a.index-b.index);
  cachedKey=key;cachedResult={base,answers,visits};return cachedResult;
 }
 function render(){
  const toggle=document.getElementById('guide-toggle');if(toggle){toggle.textContent=t(enabled?'hide':'show');toggle.setAttribute('aria-pressed',String(enabled));}
  if(!panel)return;
  const e=window.campaignTrail_temp;
  const ids=[...document.querySelectorAll('.game_answers')].map(n=>Number(n.value));
  const visiting=!!document.querySelector('.visit_text');
  const active=enabled&&native()&&e?.questions_json&&(ids.length||visiting||document.getElementById('overall_results_button'))&&!document.getElementById('feedback_window')&&!document.getElementById('ok_button');
  panel.hidden=!active;if(!active){last='';result=null;return;}place();
  const fingerprint=JSON.stringify([NCTI18n.language,NCTStory.active,ids,visiting,NCTAchievements.enabled,NCTAchievements.selected,NCTAchievements.selectedRoute,e.bigshot_mode,e.final_outcome,localStorage.getItem('achievements'),modelInput(e)]);
  if(fingerprint===last)return;last=fingerprint;
  try{
   result=analyze(e,ids);
   const achievement=NCTAchievements.plan(e,result,ids);
   const answers=achievement?.answers||result.answers,visits=achievement?.visits||result.visits;
   const base=result.base;
   const total=e.states_json.reduce((s,r)=>s+r.fields.electoral_votes,0),target=Math.floor(total/2)+1;
   let html=`<h3>${h('title')}</h3><p>${h('limits')}</p><p>${h('baseline',{votes:base.electoral,target,popular:(base.popular*100).toFixed(2)})}</p>`;
   html+=NCTAchievements.render(e,achievement,ids);
   if(String(e.game_type_id)==='3')html+=`<p>${h('advanced')}</p>`;
   if(e.primary_states)html+=`<p>${h('locked')}</p>`;
   html+=`<p>${h('method')}</p>`;
   if(result.answers.length){
    html+=`<h4>${h('answers')}</h4><ol class="nct-guide-answers">`;
   for(const [rank,a]of answers.entries()){
     const row=e.answers_json.find(r=>r.pk===a.id);
     html+=`<li data-guide-answer="${a.id}"><strong>${h(rank===0?'recommended':'alternative',{position:a.index+1})}</strong><div>${NCTStory.html('answers_json',row.pk,'description',row.fields.description)}</div><small>${h('effect',{votes:a.electoral,score:signed(a.score-base.score),popular:signed((a.popular-base.popular)*100)})}</small></li>`;
    }html+='</ol>';
   }
   const hasVisits=e.election_json.find(r=>Number(r.pk)===Number(e.election_id))?.fields.has_visits===1;
   html+=`<h4>${h('visits')}</h4>`;
   if(hasVisits){html+=`<p>${h(visiting?'visit_now':'visit_later')}</p><div class="nct-guide-table"><table><thead><tr><th>${h('state')}</th><th>${h('ev')}</th><th>${h('margin')}</th><th>${h('visit_effect')}</th></tr></thead><tbody>`;
   for(const s of visits.slice(0,5))html+=`<tr data-guide-state="${s.id}"><td>${NCTI18n.termHtml(s.name)}</td><td>${s.ev}</td><td>${signed(s.margin*100)}</td><td>${h('gain',{margin:signed(s.gain*100),score:signed(s.score)})}</td></tr>`;
   html+='</tbody></table></div>';
   }else html+=`<p>${h('no_visits')}</p>`;
   html+=`<p>${h('history')}</p><details><summary>${h('technical')}</summary><p>${h('formula')}</p><p>${h('future')}</p></details>`;
   panel.innerHTML=html;
  }catch(error){result=null;panel.innerHTML=`<h3>${h('title')}</h3><p>${h('unavailable')}</p>`;console.warn('Guide forecast unavailable',error);}
 }
 function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;render();});}
 function setEnabled(value){enabled=!!value;try{localStorage.setItem('nct.guide',enabled?'on':'off');}catch(_){}last='';render();}
 function predict(e,answers,visit){const input=modelInput(e);input.player_answers=[...answers];input.player_visits=[...input.player_visits];if(visit!==undefined)input.player_visits.push(visit);return summary(input,NCTGuideModel.project(input));}
 window.NCTGuide={analyze,summary,predict,render,setEnabled,get enabled(){return enabled;},get result(){return result;}};
 document.addEventListener('DOMContentLoaded',()=>{
  const controls=document.getElementById('language-controls'),button=document.createElement('button');button.id='guide-toggle';button.type='button';button.setAttribute('aria-controls','nct-guide-panel');button.addEventListener('click',event=>{event.stopPropagation();setEnabled(!enabled);});controls.append(button);
  panel=document.createElement('aside');panel.id='nct-guide-panel';panel.className='nct-guide-panel';panel.hidden=true;panel.setAttribute('aria-label',t('title'));document.getElementById('game_window').after(panel);
  panel.addEventListener('change',event=>{if(['achievement-target','achievement-enabled','achievement-route'].includes(event.target.id)){if(event.target.id==='achievement-enabled')NCTAchievements.setEnabled(event.target.checked);else if(event.target.id==='achievement-route')NCTAchievements.selectRoute(event.target.value);else NCTAchievements.select(event.target.value);const id=event.target.id;last='';render();document.getElementById(id)?.focus();}});
  // Keep native button activation and focus navigation, but contain keys here:
  // original body/document shortcuts can submit answers, consume RNG or trigger
  // the spacebar anti-cheat ending while a visit confirmation is open.
  for(const element of [controls,panel])for(const type of ['keydown','keyup'])element.addEventListener(type,event=>event.stopPropagation());
  // Observe renderer structure, not text substitution. The guide lives outside
  // the observed game window and never edits its nodes or input handlers.
  const observer=new MutationObserver(schedule);observer.observe(document.getElementById('game_window'),{childList:true,subtree:true});render();
  new MutationObserver(place).observe(document.documentElement,{attributes:true,attributeFilter:['style']});
 });
 document.addEventListener('nct:languagechange',()=>{last='';if(panel)panel.setAttribute('aria-label',t('title'));render();});
 window.addEventListener('resize',()=>{place();requestAnimationFrame(place);});
})();
