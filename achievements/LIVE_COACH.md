# Live achievement coach

[Install](../README.md) · [Achievement walkthroughs](README.md) · [简体中文](LIVE_COACH_ZH.md)

## During a campaign

1. Choose **English** at the top of the game page.
2. Start your chosen year, candidate and running mate. Set the mode and difficulty listed in the achievement walkthrough.
3. Turn on **Guide (spoilers)** and leave **Enable achievement coaching** checked.
4. Select the achievement under **Run objective**. Follow **Choose next** and the recommended visit when a visit becomes available.

The recommendation follows the current question, even when option order changes. Match the answer text; a static “A/B/C” sequence will not work reliably. You still make every choice in the game.

Open **Requirements, routes and pairings** for required answers, progress, the route selector and its source, or alternative pairings. If your combination cannot attempt the selected achievement, this section opens to show suitable configurations. Pairings with actual unlock evidence are listed first; a compatible but untested pairing is labeled separately.

## Switches and compact layout

- **Guide (spoilers) / Hide guide:** show or hide all campaign advice.
- **Enable achievement coaching:** turn achievement-specific advice on or off while keeping ordinary campaign advice available.
- **Run objective → Win the election:** use the ordinary victory objective.
- **Other answers and projections:** compare the remaining visible choices.
- **Forecast data and method:** inspect projected electoral votes, popular votes and calculation details.

Switches persist locally. They do not reset the election or prevent a native achievement from unlocking. Remaining-route optimization runs in the background, so you can keep playing while it finishes.

## Routes and live advice

A route is matched by scenario, running mate, mode, difficulty, question/answer IDs and original English fingerprints. The coach checks previous answers and visits. A setting mismatch, changed scenario or departure from the route switches the panel to current-state advice and explains the change.

Some community routes omit questions. For those questions the coach computes a recommendation rather than inventing a source answer. The English written walkthrough records the actual answer taken in its successful replay and labels such gaps.

Route labels distinguish community routes, source-model candidates and ordinary-guide replay routes. **Unlocked** is read from the native achievement save after the game, not inferred from a projected victory.

## Cumulative and special achievements

**Destiny Arrives All the Same:** the coach lists recorded years. Complete all seven required years with exactly 232 or 306 own electors. Use the same browser profile and exact server address, including the port.

**WHY?!?!?!?!:** the panel displays the saved 2016a completion counter. Reach 100 eligible finished games; a win is unnecessary.

**Still Alive / NOW'S YOUR CHANCE TO BE A:** follow the [native BIGSHOT procedures](README.md#stillalive). These use the game's separate cheat-achievement branch. Ordinary achievements require BIGSHOT to be off.

For an exact-vote or narrow-margin target, check the final result and saved unlock. The native game contains randomness and awards at most one new achievement through its priority chain per game.

## Offline use and saves

The guide, route data and English messages are local files. Source links are for further reading; opening them is optional. The game and coach work without them.

Browser storage belongs to an origin: `localhost:8000`, `localhost:8001` and `127.0.0.1:8000` have different saves. Keep your usual address for cumulative achievements. [Coverage and replay evidence](COVERAGE.md).
