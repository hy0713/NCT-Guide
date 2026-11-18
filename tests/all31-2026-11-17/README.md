# All-31 audit records

Executed 2026-11-17. Compiled 2026-11-18. [中文结论](../../ALL_ACHIEVEMENTS_AUDIT_ZH.md) · [English results](../../ALL_ACHIEVEMENTS_AUDIT.md) · [JSON index and hashes](summary.json).

The archived runtime is guide commit `36c5b39`. The 31 achievement reports and additional year-level trials record 290 native-browser games. `adjustment-attempts.json` adds 10 unsuccessful candidate replays, for 300 recorded games. `execution: completed` means the test finished; inspect each run's `unlocked`, `yearRecorded`, `counter` and `diagnosis` for actual results.

- 27 single-game objectives: five fresh contexts each; seeds 1, 3, 42, 1776 and 2026; follow visible live-coach advice with automatic route selection.
- `what.json`: one fresh save, 100 actual 2016a completions, with Chinese/English alternating. Every native counter increment was checked. The 99 pre-threshold games are not failed attempts at an immediate unlock.
- `destiny.json`: one Chinese and one English save complete all seven years using known-success fixtures; the recorded game/RNG results match across languages. These are not independent random samples.
- `destiny-grid.json`: five separate fresh fixtures for each required year. Count `yearRecorded`, not the full seven-year unlock.
- `stillAlive.json` and `yourchance.json`: three fresh fixtures each, using the original BIGSHOT keyboard/menu procedure. Still Alive uses the original multiplier input set to 41.
- `eligibility.json`: copied-setup checks for all 31 objectives; any RNG call throws. These are separate from real game results.
- `integrity.json`: exact commands, exit codes and output for original algorithm/data/text integrity and source-condition checks.
- `adjustment-candidates.json`: two test-only candidates; neither was installed in the production guide. `adjustment-attempts.json` preserves all ten failures and their final-state reasons.

No production RNG, native achievement save or game numeric data was rewritten. Browser contexts are isolated from the player's profile. All non-loopback requests are blocked. The fixture RNG exists only in test pages.

## Re-run without replacing this snapshot

Install the guide into the bilingual game build and use the project's browser-test dependencies. In a separate terminal start `python GAME_DIRECTORY/server.py --port 18081`. Then, from this guide repository:

```powershell
$env:NCT_BASE_URL='http://127.0.0.1:18081'
$env:NCT_AUDIT_DIR='all31-recheck'
node tests/audit-achievement-eligibility.cjs
node tests/audit-all-achievements.cjs GAME_DIRECTORY ordinary
node tests/audit-all-achievements.cjs GAME_DIRECTORY counter
node tests/audit-all-achievements.cjs GAME_DIRECTORY special
node tests/audit-all-achievements.cjs GAME_DIRECTORY destiny-grid
node tests/audit-all-achievements.cjs GAME_DIRECTORY destiny-cumulative
```

These commands use the current runtime and take sustained browser execution. Keep the runtime files unchanged during the run. The counter and cumulative phases retain one fresh context per sequence; the player's save is not used. Stop only the test server afterward.

To replay the rejected candidates, after the commands above:

```powershell
$env:NCT_RELIABILITY_ROUTES=(Resolve-Path tests/all31-2026-11-17/adjustment-candidates.json).Path
$env:NCT_RELIABILITY_IDS='magaa-2020_Trump_Haley-1-0.97-audit-improvement,whatbelt-2016_Trump_Carson-1-0.97-audit-alternative'
$env:NCT_RELIABILITY_SEEDS='1,3,42,1776,2026'
$env:NCT_RELIABILITY_CANDIDATE='1'
$env:NCT_RELIABILITY_REPORT='all31-recheck/adjustment-attempts.json'
node tests/route-reliability.cjs GAME_DIRECTORY
```

`node tools/summarize-all31-audit.cjs GAME_DIRECTORY --check` validates the preserved snapshot, all counts, candidate hashes and generated summaries. It does not run new games. Remove `--check` to regenerate the two summary documents from these archived records.
