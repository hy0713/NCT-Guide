/* Background planning shares the same read-only model as the visible guide. */
self.window=self;
let stored=null;
self.localStorage={getItem:key=>key==='achievements'?stored:null,setItem(){}};
self.NCTI18n={text:key=>key};
importScripts('model.js','achievement-data.js','achievements.js','guide.js');
self.onmessage=({data})=>{
 stored=data.stored;self.dirtyhacker3=data.dirty;
 NCTAchievements.select(data.target);NCTAchievements.selectRoute(data.route);
 const planning=NCTAchievements.plan(data.input,data.forecast,data.ids)?.planning||null;
 self.postMessage({key:data.key,planning});
};
