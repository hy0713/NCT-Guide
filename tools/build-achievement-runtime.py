"""Compile offline objective rules and observed combination baselines; no game writes."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
GAME=Path(__import__('sys').argv[1])
read=lambda p:json.loads(p.read_text(encoding='utf8'))
audit=read(ROOT/'achievements/source-audit.json');cat=read(GAME/'localization/stories/catalogue.json');en=read(GAME/'localization/en-US.json')
# Runtime objectives describe the original conditions. They do not replace them.
rules={
'destiny':dict(years=[21,20,3,9,15,10,69],goal='exact',targets=[306,232]),
'ridingBiden':dict(year=21,candidate='Biden',goal='min',target=406),
'magaa':dict(year=21,candidate='Trump',goal='min',target=322),
'nmpr':dict(year=21,candidate='Trump',goal='exact',target=269),
'nomalarkey':dict(year=21,candidate='Biden',goal='exact',target=306),
'whatbelt':dict(year=20,goal='win',lose=['Wisconsin','Michigan','Pennsylvania']),
'thebern':dict(year=20,candidate='Clinton',mate='Sanders',goal='min',target=351),
'moscow':dict(year=20,candidate='Trump',mate='Palin',goal='popularLead'),
'why':dict(year=16,goal='finish',maxDifficulty=None),
'what':dict(year=16,goal='finish',maxDifficulty=None,count=100),
'realdebate':dict(year=3,candidate='Obama',goal='win',slots={'0':729,'1':330},required=[168]),
'karmic':dict(year=3,candidate='Obama',mate='Clinton',goal='max',target=4),
'raiders':dict(year=9,candidate='Nader',goal='votes',target=5300000,maxDifficulty=1.33),
'master':dict(year=9,candidate='Gore',goal='win',required=[3326]),
'swap':dict(year=9,candidate='Gore',goal='winLosePopular'),
'florida2000':dict(year=9,goal='florida',maxDifficulty=None),
'tanks':dict(year=15,candidate='Dukakis',goal='win',required=[4439,4484]),
'Rainbow':dict(year=15,candidate='Dukakis',mate='Jackson',goal='win'),
'Kinder':dict(year=15,candidate='Bush',goal='min',target=501),
'georgia':dict(year=10,candidate='Carter',goal='min',target=401,required=[3610,3647]),
'georgenixon':dict(year=4,candidate='Nixon',goal='state',state='Georgia'),
'ratio':dict(year=4,candidate='Humphrey',goal='min',target=431),
'BCitsHard':dict(year=11,candidate='Kennedy',goal='win',maxDifficulty=.9),
'BCitsEasy':dict(year=11,candidate='Kennedy',goal='max',target=99,difficulty=1.33,maxDifficulty=None),
'Vice':dict(year=11,candidate='Nixon',mate='Goldwater',goal='win'),
'dixieDewey':dict(year=12,candidate='Truman',goal='win',slots={'2':3809}),
'Dewey':dict(year=12,candidate='Dewey',goal='winPopular'),
'California':dict(year=14,candidate='Hughes',goal='win',lose=['California']),
'Commoner':dict(year=5,candidate='Bryan',goal='min',target=331),
'stillAlive':dict(year=4,candidate='Wallace',goal='exact',target=535,special=True,maxDifficulty=None),
'yourchance':dict(goal='finish',special=True,bigshot=True,maxDifficulty=None)
}
assert set(rules)=={r['id'] for r in audit['achievements']}
for row in audit['achievements']:
 r=rules[row['id']];r.update(id=row['id'],name=row['name'],english=en['achievement.'+row['id']+'.name'],description=row['menuDescription'])
 if 'maxDifficulty' not in r:r['maxDifficulty']=.97
baselines={s['scope']:s for s in read(GAME/'tests/guide-results.json')['scenarios']}
scenarios=[]
for s in cat['scenarios']:
 b=baselines.get(s['scope']);own=next((r for r in b['overall'] if r['candidate']==s['candidate']),None) if b else None
 scenarios.append({k:s[k] for k in ['scope','year','election','candidate','runningMate','candidateName','runningMateName']}|{'answerIds':sorted({r['location']['pk'] for r in cat['records'] if r['scope']==s['scope'] and r['collection']=='answers_json'}),'baseline':{'ev':own['electoral_votes'],'pv':own['popular_votes'],'outcome':b['outcome'],'mode':str(b.get('mode','1'))} if own else None})
data={'schema':1,'sourceSHA256':audit['sourceSHA256'],'rules':list(rules.values()),'scenarios':scenarios,'evidence':'One seed (1776), original default modes, ordinary winning guide; NOT achievement routes or win probabilities.'}
(ROOT/'guide/achievement-data.js').write_text('/* Generated offline objective data; see tools/build-achievement-runtime.py. */\nwindow.NCTAchievementData='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
print('Built',len(rules),'objectives and',len(scenarios),'combination baselines')
