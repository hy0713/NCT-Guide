# English edition verification

Initial English edition: 2026-10-19. That release added English documentation and walkthroughs, preserved the Chinese documentation, and changed the installer's completion message to English without changing the runtime or game calculations.

Latest browser rerun: 2026-11-16, after filtering the objective selector to the current scenario and pairing. Both full English achievement games below passed again. The latest selector and upgrade checks are documented in the [filter regression report](guide/ACHIEVEMENT_FILTER_TEST_REPORT_ZH.md) (Chinese). Game calculations remain unchanged.

## Passed in this release

| Check | Result |
| --- | --- |
| Native achievement coverage in the English index | All 31 IDs match the source audit and runtime rules |
| Complete written walkthroughs | 34: 27 single-game routes and seven Destiny years |
| Original English answer text | 850 answers checked against original literal scenario arrays |
| Answer associations | Each answer belongs to its recorded question; 25 distinct questions per walkthrough |
| Visits | 396 recorded visits checked against original state IDs and abbreviations |
| Original source snapshots | 27 scenario files match the recorded SHA-256 values |
| Replay provenance | Each ordinary walkthrough matches a successful recorded route hash; cumulative routes come from the successful same-save seven-year report |
| Incomplete community route | One missing answer is explicitly labeled as the live coach's recorded choice |
| English interface messages | All 103 guide keys have nonempty English values, matching the Chinese key set |
| Navigation | Local document links and achievement anchors resolve |
| Reproducible document generation | `build-english-guide.py --check` passes |
| Installation | Fresh install, recognized published upgrades, and rejection of unknown code/text customizations pass |
| Runtime isolation | Published runtime files match the already-installed game copy byte for byte; this release changes no runtime file |

[Document check results](tests/english-guide-results.json) · [Installation results](tests/install-routes-results.json)

Commands executed from the repository root, with the game snapshot at `E:/nct`:

```powershell
python tools/build-english-guide.py E:/nct
python tools/build-english-guide.py E:/nct --check
node tests/english-guide.cjs E:/nct
python tests/install-routes.py E:/nct
```

## Additional browser smoke: passed

The resumed `tests/english-edition.cjs` run completed two full English games against the local server, with all non-loopback requests blocked. Both actual native achievement unlocks were read from the saved results:

| Scenario and pairing | Mode / difficulty | Actual result |
| --- | --- | --- |
| 2020 Biden / Demings | Default / Normal (0.97) | 406 electoral votes; The Dark Brandon Rises unlocked; all 25 questions completed |
| 1960 Nixon / Goldwater | Proportional / Normal (0.97) | 269 electoral votes; The Vice With No Vice unlocked; all 25 questions completed |

The latest run verified English recommendation labels, independent achievement coaching on/off, persistence across language changes, the absence of unrelated achievements from the selector, and panel bounds at 390px and 1440px. These UI actions preserved campaign values and the game's random-call count. There were no script errors, missing resources or external requests.

An earlier attempt timed out while launching Chrome, and its retry was blocked by approval-service capacity. Those issues were resolved before the successful run above. The test has a 30-second browser-launch limit and writes a report on failure as well as success. Rerun with the local game server on port 18081:

```powershell
node tests/english-edition.cjs E:/nct
```

[Actual browser results](tests/english-edition-results.json)

## Existing actual gameplay evidence

The English walkthroughs reuse earlier actual native-game records: the 613-game coverage snapshot, successful bilingual achievement replays, the 100-game 2016a counter and the two same-save seven-year sequences. Eight additional compact-interface regression games were recorded later. The two English smoke games above are separate new runs; the historical 613-game snapshot is unchanged.

The selector update changes only guide eligibility display and saved guide targets. These records verify the documented successful games; they do not guarantee the same outcome under every random sequence. [Coverage and original reports](achievements/COVERAGE.md).
