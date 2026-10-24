# Meow Burger — changelog

Engine history before Meow Burger (Meow Pizza v4.x) is in `docs/pizza-legacy/CHANGELOG_pizza.md`.

## v1.6.4 — TikTok native release
- The 3 TikTok gift buttons (Revisit, Share, Launch/Home) show on the play screen from the first frame after loading, on web and native.
- Auto play turned off (`CFG.autoPlay:false`): AUTO button hidden, a saved auto setting is ignored. Set it to `true` to bring it back.
- HS SDK:
  - `HSGame.start` is always called; with placeholder credentials login fails, and ads, missions and cloud stay off while the game keeps playing.
  - Cloud save: `HSGame.save(progress)` after every save (debounced). `onLoad` keeps the further progress (higher task, then more coins).
  - Gift amounts in popups come from `HSGame.rewards()` (dashboard), with the old numbers as offline defaults.
  - Every placement is logged with `canShowAd` after start.
- Build: credentials and the dashboard placements export come from `src/native/hs-config.json`. The build fills in the appid, `meow-config.js` and the ad unit IDs, and warns when game labels and dashboard labels differ.
- Placement labels match HS: Double Task Bonus, Buying Pad, Meow Rush, VIP tip, Coin Purchase, Grand Opening, Grill Break.
- Tests: qa_native 44/44, hs-check 0 fail (7 capital-letter label warnings).

## v1.6.3 — Native package with placeholders
- First TikTok Minis native package for Meow Burger, with blank App ID, SDK key and ad unit IDs.
- Credentials moved out of the HS bridge into `meow-config.js` next to `game.js`. Meow Pizza credentials removed.
- Sprites under `art/` are converted from WebP to PNG for the native runtime.
- Visual fixes: player cap tip restored in walk and carry frames, walk cycle anchored at the feet, code-drawn planter, loading screen uses the full art with the loading bar drawn live.

## v1.3 – v1.6 — Layout and art passes
- Kitchen stations redrawn in code against the walls (`src/26_stations_code.js`), storage rack and tables drawn in code.
- Seated customers drawn behind their tables; VIP rug on the floor; balloon arches grounded; trees behind the walls painted before the walls.
- Patio expansion and post-grand-opening goals; navigation grid enlarged for the patio.
- Overhead icons for waiting, angry, cash, trash and sleeping.
- Auto play with ×2 speed (now off by default, see v1.6.4).
- Grill Break interstitial every 45 s of play, starting from the first take-food task.

## v1.2 — First web test build
- Meow Burger reskin of the Meow Pizza engine: chicken is the first station; burger, fries, salad, drinks, chicken burger and deluxe burger follow.
- Approved P1 environment, asset-kit characters (cashier, food runner, cleaner, manager, customers, VIP) and the user's player sheets.
- Full bot run 35:13 with no customers lost.
