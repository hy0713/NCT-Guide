# English edition verification

Date: 2026-10-19. This release adds English documentation and walkthroughs, preserves the Chinese documentation, and changes the installer's completion message to English. Guide runtime files and game calculation data are unchanged.

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

## Additional browser smoke: not completed

The new `tests/english-edition.cjs` smoke test was attempted against a temporary local server. Chrome launch timed out after 180 seconds before a game page opened. The bounded retry and process diagnostics were not executed because the automatic approval service reported model capacity exhaustion. No new completed games or unlocks are claimed for this release.

The test now has a 30-second browser-launch limit and writes a result report even if launch fails. It can be rerun with the local game server on port 18081:

```powershell
node tests/english-edition.cjs E:/nct
```

[Browser attempt record](tests/english-edition-results.json)

## Existing actual gameplay evidence

The English walkthroughs reuse earlier actual native-game records: the 613-game coverage snapshot, successful bilingual achievement replays, the 100-game 2016a counter and the two same-save seven-year sequences. Eight additional compact-interface regression games were recorded later. These are existing evidence, not additional games run during document generation.

The runtime is unchanged, but the new release smoke did not complete. The historical records verify the documented successful games; they do not guarantee the same outcome under every random sequence. [Coverage and original reports](achievements/COVERAGE.md).
