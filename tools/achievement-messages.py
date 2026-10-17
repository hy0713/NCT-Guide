import json
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'guide/messages.json'
data=json.loads(p.read_text(encoding='utf8'))
messages={
'enabled':('启用成就引导','Enable achievement coaching'),
'disabled':('成就引导已关闭。下方保留普通胜选建议，不再按成就目标规划；重新开启可恢复之前的目标。','Achievement coaching is off. Advice below uses ordinary victory ranking, with no achievement planning. Re-enable to restore the previous objective.'),
'title':('成就实时引导','Live achievement coach'),
'choose':('本局目标：','Run objective:'),
'general':('常规胜选（选择成就可改为专项引导）','General victory (select an achievement for objective advice)'),
'compatible':('当前组合可尝试：{names}。还需满足模式、难度和回答条件。','Compatible with this pairing: {names}. Mode, difficulty and answers still matter.'),
'none':('没有专属项目；可查看跨年／特殊目标','No dedicated objectives; check general or special objectives'),
'select_hint':('选择一个成就，下面的答案和访问顺序会随目标重排。选择不适用的目标可查看替代总统／搭档。','Select an achievement to rerank answers and visits. Select an incompatible objective to see alternative pairings.'),
'combination':('此年份／总统／搭档不符合目标；请查看下方替代组合。','This year/president/mate does not fit. See alternative pairings below.'),
'settings':('当前模式、难度或 BIG SHOT 状态不符合条件；需要按要求重新开局。','Mode, difficulty or BIG SHOT status does not qualify; restart with the required settings.'),
'missed':('本局已错过必要回答；继续赢选举也不能补回此条件，需要重新开局。','A required answer was missed. Winning later cannot repair it; restart this objective.'),
'recorded':('此年份的306／232已经记账；请改玩尚未记录的年份。','306/232 already recorded for this year; play a missing year instead.'),
'ended':('本局已经结束，存档尚未解锁此项。请核对结局条件和成就优先级，再决定重开或换搭档；当前策略不保证成功。','This run ended without this unlock in the save. Check final conditions and achievement priority before retrying or changing mates; this strategy is not guaranteed.'),
'open':('未发现硬性阻碍，继续按目标推进；不代表必然可达。','No hard blocker found; continue toward the objective. Reachability is not guaranteed.'),
'unlocked':('当前浏览器存档已解锁此成就。','Already unlocked in this browser save.'),
'goal_exact':('目标：本人恰好 {target} 张选举人票；不要盲目追求更多票。','Target: exactly {target} electoral votes. More is not always better.'),
'goal_min':('目标：本人至少 {target} 张选举人票。','Target: at least {target} electoral votes.'),
'goal_max':('目标：本人最多 {target} 张选举人票；本目标需要压低己方结果。','Target: at most {target} electoral votes. Reduce your result for this objective.'),
'goal_win':('目标：获胜，并满足下面列出的附加条件。','Target: win and satisfy all additional conditions below.'),
'goal_finish':('目标：按资格完成整局并进入最终结算，无需保证胜选。','Target: complete a qualifying run and reach final results; victory is not required.'),
'goal_votes':('目标：本人普选票至少 {target} 票；不是固定比例。','Target: at least {target} popular votes, not a fixed percentage.'),
'goal_popularLead':('目标：本人普选票高于主要对手；僵局结局不符合。','Target: beat the main rival in popular votes; a deadlock does not qualify.'),
'goal_winLosePopular':('目标：赢得选举，但普选票低于主要对手。','Target: win the election while losing the popular vote to the main rival.'),
'goal_winPopular':('目标：同时赢得选举与主要对手间的普选票比较。','Target: win both the election and the popular-vote comparison with the main rival.'),
'goal_state':('目标：赢下指定州；不必同时赢得全国选举。','Target: win the specified state; national victory is not required.'),
'goal_florida':('目标：佛州前两名差距小于0.5个百分点，且全国榜首最多294张选举人票。','Target: Florida top-two margin below 0.5 percentage points and national leader at no more than 294 EV.'),
'lose_states':('必须在这些州排第二，不能获胜：{states}。','Finish second, not first, in: {states}.'),
'win_state':('重点目标州：{state}。','Priority target state: {state}.'),
'difficulty':('倍率必须不高于 {value}；普通难度为0.97。','Difficulty multiplier must be at most {value}; Normal is 0.97.'),
'exact_difficulty':('必须使用精确倍率 {value}。','Use exactly difficulty multiplier {value}.'),
'special':('特殊非合规分支：普通公平局不检查此项。BIG SHOT须在进入答题前启用；不要混刷其他普通成就。','Special non-legitimate branch: ordinary fair runs do not check this. Enable BIG SHOT before questions; do not mix with ordinary achievements.'),
'counter':('当前2016a合规通关计数：{count} / 100。','Current qualifying 2016a completions: {count} / 100.'),
'years':('已记录306／232的年份：{years}。每个指定年份分别推进。','Years with a recorded 306/232: {years}. Complete each required year separately.'),
'answer_done':('已完成必要回答 #{id}。','Required answer #{id} completed.'),
'answer_now':('下一步必须选择下面这个回答 #{id}，已放在本题建议首位。','Choose required answer #{id} now; it is ranked first below.'),
'answer_pending':('后续须选择回答 #{id}；出现对应题目时优先选择以下原文。','Answer #{id} is still required. Choose this text when its question appears.'),
'blocked':('此目标当前不能继续推进；下面保留常规胜选建议，不将它冒称本成就路线。可换组合或按原因重开本组合。','This objective is blocked. Advice below is general victory advice, not an achievement route. Change pairing or restart with the corrected setup.'),
'ranking':('专项排序先保必要回答，再按票数／指定州等目标比较当前预测；每次作答与访问后更新。','Objective ranking prioritizes required answers, then current vote/state forecasts. It updates after answers and visits.'),
'planning':('胜选／高票目标还对已载入的剩余题目做有限整局规划，假定后续选项可用；遇到分支会按实际可见选项重算。显示的票数仍是当前局势预测，不是最终保证。','Win/high-EV objectives also use bounded planning over loaded future questions, assuming their options remain available. Branches trigger replanning with visible choices. Displayed votes remain current-state forecasts, not final guarantees.'),
'combinations':('建议优先尝试的总统／搭档组合','Suggested president / running-mate pairings'),
'evidence':('先筛选源码允许的组合，再参考已有单种子普通胜选路线的结果。不是成就成功率；无合规数据时不声称哪个组合最强。','Filter source-compatible pairings first, then consult one-seed ordinary winning-guide results. These are not achievement success rates; no strongest-pairing claim without qualifying data.'),
'baseline':('单种子参考：本人 {ev} 张选举人票；不是已验证的本成就路线。','One-seed reference: {ev} EV for this candidate; not a verified achievement route.'),
'untested':('仅确认组合兼容；缺少此模式／难度的合规成就对照数据。','Pairing compatibility only; no qualifying achievement comparison for this mode/difficulty.'),
'uncertainty':('无波动局部预测不能保证最终达标。精确票数、第二名、普选逆转、随机分支与单局成就优先级须以最终结算和实际存档为准。','Local zero-noise forecasts do not guarantee success. Exact votes, second place, popular-vote inversions, random branches and unlock priority must be confirmed by final results and the actual save.')
}
for key,(zh,en) in messages.items():
 for language,text in [('zh-CN',zh),('en-US',en)]:data[language]['guide.achievement_'+key]=text
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
