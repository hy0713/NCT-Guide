# Achievement coaching reliability review

2026-11-17. [中文详细报告](ACHIEVEMENT_RELIABILITY_REVIEW_ZH.md)

Following the live advice did not reliably unlock achievements. The old interface used the same recommendation heading for a fixed route, a model forecast and ordinary victory advice. These now have separate visible labels. Provisional recommendations stay hidden while background planning runs. Pairings without a tested route show a tested alternative setup. The fixed-route menu excludes zero-unlock and superseded routes.

**The Flame Berns Bright:** the old Clinton/Sanders route unlocked in six of eight seed fixtures; the two failures had 326 and 342 EV, below the actual 351-EV requirement. A revised answer and Georgia/North Carolina visit allocation unlocked in all eight fixtures, with 357 or 368 EV. Direct candidate replays and actual live-coach replays both passed; repeating the same seeds does not create independent samples. A Chinese/English replay of seed 3 produced the same 357-EV native unlock and game/RNG state.

Use [the revised English walkthrough](achievements/walkthroughs/thebern-2016_Clinton_Sanders-1-0.97-margin-review.md), or update the plugin and choose Clinton/Sanders, Default mode, Normal difficulty and this objective. The old written walkthrough remains marked as superseded.

A separate single-seed check of **27 single-game objectives unlocked 18 and missed 9**. The failures were `magaa`, `nmpr`, `nomalarkey`, `BCitsHard`, `florida2000`, `realdebate`, `Kinder`, `swap` and `whatbelt`. Their route reliability still needs improvement. This update does not claim to have fixed those nine routes. [Actual games, including all failures](tests/all-objective-coach-review-results.json).

Results now show actual votes and outcome, evaluate all 31 original condition expressions without changing game state, and explain unmet requirements such as an EV shortfall, state rank, required answer or popular-vote condition. [UI and condition-parity tests](tests/coach-reliability-ui-results.json), [eight revised coach replays](tests/bern-coach-review-results.json), [bilingual replay](tests/bern-bilingual-review-results.json).

Update with `python install.py GAME_DIRECTORY --upgrade`. Finish the current run before refreshing: a refresh restarts the native game. No original game algorithms, RNG or achievement saves were edited.
