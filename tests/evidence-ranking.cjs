/* Route ordering on copied scenario data. No game session or save is needed. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
let saved=null;
const box={window:null,NCTI18n:{text:key=>key},localStorage:{getItem(key){return key==='achievements'?saved:null;},setItem(){}}};
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

box.NCTAchievementData.routes[0].answers={11:[101],12:[201]};
box.NCTAchievementData.routes[1].answers={11:[102],12:[202]};
const diverted={...state,answers_json:[
 {pk:101,fields:{question:11}},{pk:102,fields:{question:11}},
 {pk:201,fields:{question:12}},{pk:202,fields:{question:12}}
],player_answers:[102]};
const resumed=box.NCTAchievements.routeInfo(diverted,rule,[201,202]);
assert.equal(resumed.route.id,'broader');assert.equal(resumed.answer,202);assert(resumed.resumed);
const offRoute=box.NCTAchievements.routeInfo(diverted,rule,[201]);assert(!offRoute.active);

const swap=rules.find(r=>r.id==='swap'),gore=scenarios.find(s=>s.scope==='2000_Gore_Graham');
const gorun={...state,election_id:gore.election,candidate_id:gore.candidate,running_mate_id:gore.runningMate,
 answers_json:[{pk:3326,fields:{question:42}},{pk:100,fields:{question:42}}]};
box.NCTAchievementData.routes=[
 {...base,achievement:'swap',scope:gore.scope,id:'earlier-award',answers:{42:[3326]},replays:{success:9,total:10}},
 {...base,achievement:'swap',scope:gore.scope,id:'safe',answers:{42:[100]},replays:{success:5,total:10}}
];
assert.equal(box.NCTAchievements.routeInfo(gorun,swap,[3326,100]).answer,100);
assert.deepEqual(Array.from(box.NCTAchievements.status(gorun,swap,[3326,100]).avoid),[3326]);
assert.equal(box.NCTAchievements.status({...gorun,player_answers:[3326]},swap).kind,'priority');
saved=JSON.stringify({achievements:{master:true}});
assert.equal(box.NCTAchievements.routeInfo(gorun,swap,[3326,100]).answer,3326);
assert.equal(box.NCTAchievements.status({...gorun,player_answers:[3326]},swap).kind,'open');
console.log('PASS evidence ranking, setup and manual route selection, compatible continuation, and earlier-award protection');
