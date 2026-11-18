# NCT-Guide

English · [简体中文](README_ZH.md)

An offline campaign and achievement guide for **The New Campaign Trail**. Read the walkthroughs on GitHub, or install the optional live coach to get advice beside the game.

**All 31 achievements checked (report 2026-11-18):** 300 recorded games. Of 27 single-game objectives tested in five fixtures each, 8 unlocked in all five, 17 had mixed results and 2 unlocked in none. Counter, seven-year cumulative and special procedures were checked separately. [Every result and its evidence](ALL_ACHIEVEMENTS_AUDIT.md).

The follow-up added six routes after separate validation replays. [Improved routes, starting configurations and replay results](STRESS_REPLAY.md).

## Start reading

- **[All 31 native achievements](achievements/README.md)** — exact unlock conditions, tested candidate/running-mate setups and special procedures.
- **34 complete English walkthroughs**, linked from each achievement: original question and answer text, with visits recorded in a successful game.
- [Live coach controls](achievements/LIVE_COACH.md) · [Unlock evidence](achievements/COVERAGE.md) · [How the advice works](guide/README.md) · [Sources](achievements/SOURCES.md).

The existing evidence includes actual native unlocks for **31/31 achievements**, including 100 real 2016a completions and the seven-year cumulative achievement. Original game randomness remains active; a recorded success can require retries in normal play.

## Install and play in English

The plugin uses the bilingual [NCT-Chinese-Version game build](https://github.com/hy0713/NCT-Chinese-Version). **That build preserves the original English game and has an English language switch.** This repository contains the guide, not the game itself.

1. Download and extract the game build above, then download and extract this repository. You do not need Git to play.
2. Install Python 3. Open a terminal in this repository's folder and run:

   ```powershell
   python install.py "D:\Games\NCT-Chinese-Version"
   ```

   On Windows, `py -3` can replace `python` if that is how Python is installed.
3. Double-click **`start.bat` in the game folder**. The game runs through a local HTTP server, normally at `http://localhost:8000/campaign-trail/index.html`. Use the address printed by the launcher if it selects another port.
4. Click **English** at the top of the page. The language choice is saved, and switching languages does not restart your campaign.
5. Start a native scenario and click **Guide (spoilers)**. The guide is off by default.

The supported installation target is this bilingual build. The standalone written walkthroughs describe the pinned original game; this installer expects its localization layer and is not an installer for an arbitrary upstream checkout.

### Achievement coaching

Leave **Enable achievement coaching** checked, then select a **Run objective**. The list shows only achievements for the current year and candidate/running-mate pairing. BIGSHOT achievements appear only in the native special branch. Difficulty requirements remain visible inside each objective. Switching to a pairing where the selected goal is unavailable restores **Win the election**. Open **Requirements, routes and pairings** for tested setups and sources.

For an ordinary campaign, uncheck **Enable achievement coaching**. General election advice stays available. Both switches remember your choice and leave campaign progress intact. Native achievements can still unlock with the coach off.

Only the current recommendation is expanded initially. Other answers, requirements, route sources and forecast data are expandable. Remaining-route planning runs in a background worker.

### Update or uninstall

```powershell
python install.py "D:\Games\NCT-Chinese-Version" --upgrade
```

The installer recognizes published guide versions, backs up replaced files locally, and stops before overwriting unknown personal changes. Playing needs no Node.js, translation service or internet connection after installation.

Updates stamp the entry scripts, styles and background planner with one content version, so refreshing loads the updated guide even when the browser cached an older release.

To uninstall, remove the five `/localization/guide/` script/style references from `campaign-trail/index.html`. The worker is loaded by the guide itself. Original scenario and calculation files are not rewritten by installation.

## How recommendations work

The coach compares answers and visits using an independent copy of the original vote calculator on cloned campaign data. General advice ranks competitive-state gains; achievement objectives add required answers, exact vote targets and state constraints. Where a matching route exists, it supplies the recorded answers and visits.

Forecasts remove random noise for comparison. They are projections, not success probabilities. The plugin does not choose answers for you, change game values or consume the game's random sequence. [Mechanics and supported modes](guide/README.md).

## Evidence and development

- [Achievement coverage](achievements/COVERAGE.md): the existing 613-game snapshot and native unlock records.
- [English edition checks](ENGLISH_EDITION_TEST_REPORT.md): document validation and actual release regression.
- [Compact interface regression](guide/COMPACT_UI_TEST_REPORT_ZH.md): background planning, layout and eight additional actual games; report in Chinese.
- [Cache refresh regression](guide/CACHE_REFRESH_TEST_REPORT_ZH.md): real Chrome verification, upgrade checks, worker asset versions and two offline unlocks; report in Chinese.
- Earlier campaign regression covered all 105 native pairings in both languages, plus five guide-hidden controls. Historical reports remain in [tests](tests/) and [the original test report](guide/TEST_REPORT_ZH.md).

Regenerate or verify the English walkthroughs against the preserved game snapshot:

```powershell
python tools/build-english-guide.py "D:\Games\NCT-Chinese-Version"
python tools/build-english-guide.py "D:\Games\NCT-Chinese-Version" --check
node tests/english-guide.cjs "D:\Games\NCT-Chinese-Version"
```

The last command needs the game's development dependencies (`npm install` in the game folder). Original-game updates require rebuilding and retesting the predictor; see [maintenance](guide/README.md#maintenance).

[Source and rights notice](NOTICE.md). Native scenarios and achievements only; no community MOD walkthroughs are included.
