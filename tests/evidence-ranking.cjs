/* Route ordering on copied scenario data. No game session or save is needed. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const box={window:null,NCTI18n:{text:key=>key},localStorage:{getItem(){return null;},setItem(){}}};
box.window=box;
vm.createContext(box);
for(const name of ['achievement-data.js','achievements.js'])vm.runInContext(fs.readFileSync(path.join(root,'guide',name),'utf8'),box);
const {rules,scenarios}=box.NCTAchievementData;
const rule=rules.find(r=>r.id==='ridingBiden'),scenario=scenarios.find(s=>s.scope==='2020_Biden_Demings');
const state={election_id:scenario.election,candidate_id:scenario.candidate,running_mate_id:scenario.runningMate,game_type_id:'1',difficulty_level_multiplier:.97,answers_json:[],player_answers:[],player_visits:[]};
const base={achievement:rule.id,scope:scenario.scope,mode:'1',difficulty:.97,answers:{},visits:{},mappedQuestions:25};
box.NCTAchievementData.routes=[
 {...base,id:'one-win',replays:{success:1,total:1}},
 {...base,id:'broader',replays:{success:8,total:10}},
 {...base,id:'different-mode',mode:'2',replays:{success:20,total:20}}
];
assert.equal(box.NCTAchievements.routeInfo(state,rule,[]).route.id,'broader');
assert.equal(box.NCTAchievements.routeInfo({...state,game_type_id:'2'},rule,[]).route.id,'different-mode');
box.NCTAchievements.selectRoute('one-win');
assert.equal(box.NCTAchievements.routeInfo(state,rule,[]).route.id,'one-win');
console.log('PASS wider replay evidence outranks 1/1; matching settings and explicit route choice preserved');
