# Sources and route provenance

[Achievements](README.md) · [Unlock evidence](COVERAGE.md) · [简体中文 source audit](WEB_RESEARCH_ZH.md)

## Native game snapshot

Unlock conditions are audited against the original [campaign_trail.js at commit d6655ef](https://github.com/newcampaigntrail/newcampaigntrail.github.io/blob/d6655ef6ad80ab9a8fe5510d0fd43874e57dacbf/static/js/campaign_trail.js). Each achievement entry links the relevant source line. The [source audit](source-audit.json) records the exact predicates and source SHA-256.

English questions and answers come from the preserved original scenario files. The generator checks those files against their recorded SHA-256 values. The [walkthrough manifest](english-walkthroughs.json) identifies each scenario, route, replay report and recorded answer/visit sequence.

## Community and project routes

Every walkthrough links its route source. The [route catalogue](community-routes.json) retains community links, answer IDs, visit strategies, mapping gaps, original-text fingerprints and replay evidence.

- **Community route:** answers mapped from a community guide to the current original scenario. Corrections and visit adaptations are recorded with the route.
- **Source-model search:** candidate route developed with the independent game predictor, followed by actual native-game replay.
- **Ordinary-guide replay:** choices taken by the ordinary live coach and then tested against the native achievement condition.

The written English walkthrough is a complete *recorded successful game*. Where its source route omitted an answer, the page identifies the live coach's recorded choice. It does not attribute that answer to the community author.

Important adaptations include Clinton/Kaine's six Florida plus six New Hampshire visits for **I'm Still Standing**, Dole/Massachusetts for **A Kinder, Gentler Landslide**, and the Connally route for **Hubert Horatio'd**. Their pages retain the references and project-specific changes.

## Evidence

The native game's saved unlock is the criterion for achievement coverage. A high electoral projection, a community screenshot or winning the election alone does not establish an unlock. Replay seeds are isolated test fixtures, excluded from the playing plugin. English pages reuse recorded evidence and do not inflate game counts.

[Source and rights notice](../NOTICE.md) · [Full original community research log](WEB_RESEARCH_ZH.md) (Chinese).
