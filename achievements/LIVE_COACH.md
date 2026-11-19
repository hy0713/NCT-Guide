# Live achievement coach

[Install](../README.md) · [Achievement walkthroughs](README.md) · [简体中文](LIVE_COACH_ZH.md)

## During a campaign

1. Choose **English** at the top of the game page.
2. Start your chosen year, candidate and running mate. Set the mode and difficulty listed in the achievement walkthrough.
3. Turn on **Guide (spoilers)** and leave **Enable achievement coaching** checked.
4. Select the achievement under **Run objective**. Check whether the heading says **Follow the fixed answer route**, **Model forecast**, or **Ordinary victory advice**, then match the displayed answer text and visit.

The recommendation follows the current question, even when option order changes. Match the answer text; a static “A/B/C” sequence will not work reliably. You still make every choice in the game.

The objective list contains only achievements for the current year and candidate/running-mate pairing. Native special-branch achievements appear only in that branch. Switching to an incompatible pairing resets the objective to **Win the election**. Difficulty requirements remain visible rather than removing an objective from the list.

Open **Requirements, routes and pairings** for required answers, progress, the route selector and its source, or other tested setups for the same achievement. Pairings with actual unlock evidence are listed first; a compatible but untested pairing is labeled separately.

## Switches and compact layout

- **Guide (spoilers) / Hide guide:** show or hide all campaign advice.
- **Enable achievement coaching:** turn achievement-specific advice on or off while keeping ordinary campaign advice available.
- **Run objective → Win the election:** use the ordinary victory objective.
- **Other answers and projections:** compare the remaining visible choices.
- **Forecast data and method:** inspect projected electoral votes, popular votes and calculation details.

Switches persist locally. They do not reset the election or prevent a native achievement from unlocking. Wait for background planning to finish before following its recommendation; provisional advice stays hidden while it runs.

## Routes and live advice

A route is matched by scenario, running mate, mode, difficulty, question and answer IDs, and fingerprints of the original English text. After a different answer or visit, the coach looks for another tested route that fits the choices already made. If there is no match, it uses the current campaign to plan the next step.

Visit advice is limited to clickable places on the native map. Death Swap and A Rainbow Coalition warn when a choice could cause an earlier achievement to take priority. [Improved routes and replay results](../ACHIEVEMENT_OPTIMIZER.md)

Some community routes omit questions. For those questions the coach computes a recommendation rather than inventing a source answer. The English written walkthrough records the actual answer taken in its successful replay and labels such gaps.

Route labels distinguish community routes, source-model candidates and ordinary-guide replay routes. **Unlocked** is read from the native achievement save after the game, not inferred from a projected victory.

Only routes with an actual unlock record appear in the fixed-route selector. Results show actual votes and unmet native requirements. [Latest reliability review and remaining failures](../ACHIEVEMENT_RELIABILITY_REVIEW.md).

## Cumulative and special achievements

**Destiny Arrives All the Same:** the coach lists recorded years. Complete all seven required years with exactly 232 or 306 own electors. Use the same browser profile and exact server address, including the port.

**WHY?!?!?!?!:** the panel displays the saved 2016a completion counter. Reach 100 eligible finished games; a win is unnecessary.

**Still Alive / NOW'S YOUR CHANCE TO BE A:** follow the [native BIGSHOT procedures](README.md#stillalive). These use the game's separate cheat-achievement branch. Ordinary achievements require BIGSHOT to be off.

For an exact-vote or narrow-margin target, check the final result and saved unlock. The native game contains randomness and awards at most one new achievement through its priority chain per game.

## Offline use and saves

The guide, route data and English messages are local files. Source links are for further reading; opening them is optional. The game and coach work without them.

Browser storage belongs to an origin: `localhost:8000`, `localhost:8001` and `127.0.0.1:8000` have different saves. Keep your usual address for cumulative achievements. [Coverage and replay evidence](COVERAGE.md).
