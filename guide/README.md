# Campaign advice: mechanics and maintenance

[Install](../README.md) · [Achievements](../achievements/README.md) · [简体中文](README_ZH.md)

## What the game fixes in advance

The original `campaign_trail.js` calculation and question handlers determine these effects:

- Answer data specifies national multipliers, state multipliers and issue positions. An answer may also benefit an opponent, so a positive modifier for your candidate alone does not establish the best choice.
- Issue alignment combines the candidate, running mate and previous answers with each state's issue positions and weights.
- One additional visit contributes `0.005 × max(0.1, base state multiplier) × visit multiplier` within the original formula. It does not directly add 0.5 percentage points to the displayed vote share. Running-mate home-state effects are also included.
- The native normal-random generator affects support; displayed polls have additional noise, and popular-vote turnout varies.
- Electoral allocation follows the game's own rules. In its Proportional mode, candidate shares are rounded down and remaining electors go to the state leader. Its simplified allocations are not a district-level simulation of real election law.

This makes answer effects predictable enough to compare, while final results still depend on the campaign state and randomness.

## General campaign advice

`model.js` contains calculation functions extracted from the original source at build time. The guide clones campaign inputs, sets the predictor's own normal-random terms to zero and uses the midpoint turnout factor. The original game calculator and random sequence remain separate.

Each visible answer is appended to the cloned answer history and compared across states. In winner-take-all states, ranking uses a competitive-state index:

```text
sum(state EV / (1 + exp(-margin over strongest opponent / 0.02)))
```

Proportional and other split-allocation states use electoral votes weighted by vote share. Popular-vote improvement breaks ties. The `0.02` scale smooths the ranking around close races; it is a guide parameter, not measured game volatility or extra electoral votes.

Visit advice compares the marginal effect of one additional visit in every state and lists the strongest options. Defending a narrow lead may be more valuable than visiting a state where you trail badly.

## Achievement objectives

Achievement coaching layers native eligibility, required answers, exact totals and state constraints over the campaign analysis. Matching recorded routes take precedence for their mapped questions; otherwise the coach uses current-state forecasts and, for supported objectives, bounded planning over loaded future questions. Background planning runs in a Web Worker and is refreshed as the actual campaign advances.

The guide preserves original historical wording in English. Strategy rankings describe game effects; historical context and source notes are a separate reading aid. The English edition does not translate the Chinese build's full historical annotation collection.

## Modes and historical thresholds

All 105 native candidate/running-mate pairings use the same analyzer. Community MODs are excluded. Advanced Campaign mode includes currently applied bonuses and visit multipliers, but future fundraising, advertising, lobbying, time allocation and opponent actions are not forecast.

Use the majority threshold shown for the scenario. For example, 1916 requires 266 electoral votes and 1960 requires 269. The original game's simplified state allocation, including Proportional mode, remains authoritative for its own achievements. The guide does not substitute modern real-world rules.

## Maintenance

Runtime files:

| File | Role |
| --- | --- |
| `model.js` | Generated independent vote calculator, with original source hashes |
| `guide.js` / `guide.css` | Optional panel, current answer/visit comparisons and compact layout |
| `achievements.js` | Objective checks, route matching and planning |
| `planner-worker.js` | Background remaining-route planning |
| `achievement-data.js` | Generated native rules, eligible pairings and routes |
| `messages.json` | English and Simplified Chinese guide interface strings |

After an original-game algorithm update, run `node tools/build-guide.cjs` in the game directory and synchronize the generated `localization/guide/model.js`. Preserve the protected source baselines and rerun the model and actual-game checks. Rebuilding only the English documents does not regenerate game algorithms.

The installer merges guide messages into the bilingual game's language packs and adds five script/style references. `--upgrade` recognizes published file hashes and earlier message values; unknown customizations stop installation before writes. Use `--dev-tools` to copy supported development scripts; ordinary playing needs only Python and a browser.

English achievement prose is maintained in `achievements/english-editorial.json`. `tools/build-english-guide.py` combines that prose with original English scenario text and recorded successful traces. Generated walkthroughs preserve question IDs, answer IDs and visits, and link their source and replay report. `--check` compares generated bytes without changing files.

## Verification

The earlier model regression checked 1,890 visit comparisons. Campaign UI regression completed all 105 pairings once per language, plus five guide-hidden controls. The achievement coverage snapshot contains 613 actual games and all 31 native unlocks. Later compact-layout checks added eight actual games, background-worker equivalence and zoom/mobile layout checks.

These are recorded test sets, rather than success-rate estimates. Current document checks and release playthroughs are listed in the [English edition report](../ENGLISH_EDITION_TEST_REPORT.md); complete machine-readable results remain in [tests](../tests/).
