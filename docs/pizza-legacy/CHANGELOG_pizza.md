# Cat Pizza Tycoon — changelog

## v4.8.0 — HS TikTok SDK
- **HS SDK integrated** (kit `hs-game.js` 3.0.0 + `hs-tiktok-sdk.min.js` 1.0.7, in `vendor/`, copied next to `game.js`).
  - Game ID `7698663003788511253` and the SDK key are set in `src/native/65n_hs.js`. `project.config.json` → `appid` is the Game ID.
  - The game only calls `HSGame.showAd('<label>')`. Ad unit ids come from the HS dashboard.
  - Labels: Double Task Bonus, Buying Pad, Meow Rush, VIP tip, Coin Purchase, Grand Opening, Oven Break.
- **Rewards arrive only in `hsGive` (onGive).** Item categories:
  - `currency`: coins.
  - `boost`: meow_rush.
  - `bonus`: task_bonus, vip_bonus, coin_bag. These give 1× the amount of the moment: the task reward, the VIP's bill, or the missing coins.
- **Gifts:**
  - Add to Home → `HSGame.tiktokMission('shortcut')`.
  - Revisit → `tiktokMission('profile')`, daily.
  - Share → `HSGame.share()`.
  - HS pays them through onGive. Amounts are unchanged: +100 / +100 / +50.
- Reward chips appear only when `HSGame.canShowAd(label)` says an ad is set up for that label.
- **Oven Break:** every 60 s of play (was 30 s), and still at least 30 s after a rewarded ad.
- `dist/native.hs-dashboard.json` (next to the package, never uploaded) holds the iaa_config to paste into the HS dashboard.
- The native build no longer calls the TikTok share / shortcut / entrance APIs directly. HSGame does.
- Tests:
  - `node vendor/hs-tiktok-sdk-1.0.7/hs-check.mjs dist/native`: 0 fail (7 warnings: labels with capitals, kept to match the dashboard).
  - `tests/qa_native.js`: 44/44, all 7 labels checked.
  - The native bot finishes the game with 0 errors (36:16).
  - Web 47/47.

## v4.7.4
- **The Add to Phone Screen button is always visible**, including after the bonus has been claimed (web and native). The +100 bonus is still paid only once.
- **Fixed "×2 task bonus +NaN".** The task-complete hook still capped the bonus with `CFG.gifts.baseMax`, which no longer exists since rewards became fixed. The cap is now `CFG.ads.doubleTask.max` (150), as before.
  - `grant()` ignores anything that is not a positive number.
  - Saves that already got NaN coins are repaired on load.
- **Sharper loading art:** the bar is erased again from the original art. The image is lightly denoised, upscaled 2× with Lanczos (1882×3344), sharpened, and saved as a q90 JPEG.
  - Native main package: 1.85 MB (limit 4 MB).
- No other game or ad logic changed.
- Tests: native 37/37 (adds checks for the NaN case from a real task completion and for the home button after claiming), web 47/47.

## v4.7.3 — Fixes from the iOS device video
- **Error while moving (`m.w`) and tasks not advancing:**
  - TikTok native has no global `performance`, and `requestAnimationFrame` gives a time on a different clock. After hide/show the frame time went negative (−1.79 billion s), so the game clock ran backwards: the oven never finished and "Serve 5" stayed at 2/5.
  - Fix: a steady clock built into the adapter, frame time kept between 0 and 50 ms, and handling for `requestAnimationFrame` calls that give no time.
  - Saves with a broken play time are repaired on load.
  - The walk-frame index is safe even if the clock is wrong.
- **Gift buttons and popup art were empty:** these images were requested before `loadSubpackage('art')` finished, and the failed load was kept forever. Image state is now kept outside the image object, and failed loads are retried.
- The test harness now behaves like TikTok:
  - no `performance` in GameGlobal;
  - `requestAnimationFrame` calls give no timestamp;
  - `art/` files can't be loaded until the subpackage is ready;
  - hide/show runs mid-game.
- Results: 34/34 pass. The native bot completes the game (36:12) with 0 errors, and the web build passes 47/47.

## v4.7.1 — Fix: game stuck at the start on TikTok iOS native
- **Cause:** the TikTok iOS runtime has `createWebAudioContext`, but its AudioParam has no `setValueAtTime`. Every sound effect threw. The tick sound plays while you pay for a spot, so that error stopped every frame's update ("Buy a pizza oven" never completed).
- **Fix:**
  - Sound is now feature-checked: it uses `setValueAtTime` / ramps when present, and `.value` otherwise.
  - Every call is wrapped in `try`. After 3 failures, sound turns itself off. Sound can no longer break the game.
  - `resume()` / `suspend()` that return no Promise are handled.
- When `getMenuButtonBoundingClientRect` is missing, the top-right area (104 px) is kept free so the "··· ×" button no longer covers the progress pill.
- `tests/qa_native.js` now fakes this partial WebAudio and the missing menu-button API: 31/31 pass.

## v4.7.0 — TikTok native package
- **New native build: `python3 src/build_native.py [appid]` → `dist/native/`**, the folder you upload to TikTok. Uploading the HTML build had failed with "Cannot find game.json".
  - It contains `game.json` (portrait, with an `art` subpackage), `project.config.json` (`compileType: game`) and `game.js` as the entry.
  - The main package is 0.65 MB and the total is 8.4 MB (limits: 4 MB / 30 MB).
- **No DOM at all.** The HUD, Shop, Upgrade, Tasks, Map, Settings, the Revisit, Share and Add-to-Home popups, the reward chips, the loading bar and the test ad are now drawn on the canvas (`src/native/60n_ui_canvas.js`). Input comes from `TTMinis.game.onTouchStart/Move/End`.
  - `src/native/adapter.js` covers the few browser objects the game uses: one screen canvas, `createElement('canvas')`, `devicePixelRatio` and resize.
- **Sprites:** the 335 embedded images are extracted to `art/sp/*.png` and loaded with `loadSubpackage('art')`. Loading progress covers the subpackage download too. The SVG icons are rasterized to `img/ic_*.png`.
- No `eval` or `new Function`, and the code is transpiled to ES2017.
- Tests:
  - `tests/qa_native.js` runs the package behind a fake TTMinis runtime and passes 29/29.
  - The bot plays the native build to the end with 0 errors (33:41).
  - The web build still passes 47/47.

## v4.6.0 — Meow Pizza ad scenario (HS SDK ready)
- **Seven placements**, using the same labels as the Meow Sushi config:
  - **x2 Task Bonus.** A chip appears after a task pays coins. Watching it pays the task reward again, max 150.
  - **Buying Pad.** This is the coin bag. When you are short on coins for the current purchase for 25 s, a chip appears under your coins. It pays the missing amount, max 50% of the price.
  - **Meow Rush.** Boosts output: 2× cooking and +30% walk speed for 60 s.
  - **VIP tip ×2.** Pays the VIP's bill again.
  - **Coin Purchase.** Gives +100 when an upgrade is too expensive (the button appears in the Upgrade panel), from the Shop, or from the coin "+".
  - **Grand Opening.** Pays +200 when a new stage opens.
  - **Oven Break.** One interstitial every 30 s of play.
- **Ads now go through one adapter, `Ads.adapter`, ready for the HS SDK.** The direct TikTok ad-unit code and `ads_config.json` are gone. Without an adapter, test ads are simulated.
- Gift rewards stay fixed: Revisit +100/day, Share +50/day, Add to Home +100 once.
- Bot playthrough: all tasks done, 0 errors, 36:34. `tests/qa_minis.js`: 47/47 on both builds.

## v4.5.0 — Fixed rewards + Meow Sushi ad placements
- **Gift rewards are now a fixed amount per claim** (`CFG.gifts`):
  - Revisit gift: +100, once per day.
  - Share gift: +50, once per day.
  - Add to Home: +100, once.
  - `giftBase()` has been removed.
- **Ads use the Meow Sushi config format.** Ad unit ids come from `ads_config.json` (`{placements:[{label, ads:[{id}]}]}`), with one ad unit per placement. The placement labels are the same as Meow Sushi's; the pizza reskin is described in `MINIS_NOTES.md`.
- The Coin Bag ad has been removed. "Coin Purchase" and "Buying Pad" now cover that need. Kitchen Rush is renamed "Meow Rush".
- Bot playthrough: all tasks done, 0 errors, finished at 35:00. `tests/qa_minis.js`: 44/44 pass on both builds.

## v4.4.0 — Meow Pizza for TikTok Minis
- **Loading screen:** uses the Meow Pizza key art, with a yellow progress bar and a paw marker. Progress no longer sits at 90%: the last sprites now load 6 at a time and report progress, so the bar keeps moving (font → baking → toppings → cats → 100%).
- **Gift buttons on the play screen:** Revisit gift, Share gift and Add to Home sit on the left edge, below the status pills. They appear after the tutorial (from "Serve 5 customers"). A red "!" shows while today's gift is still unclaimed. Add to Home disappears once it has been done.
- **Popups built from the approved mockups** (pink header, cream card, red ×):
  - **Add to Phone Screen** calls `addShortcut`, then `getShortcutMissionReward`, and pays a one-time bonus.
  - **Revisit Gift** has three steps. Go calls `startEntranceMission`. After the player comes back from Profile › Recently played, `getEntranceMissionReward` turns Claim on. It can be claimed once per day.
  - **Share Gift** calls `shareAppMessage` and pays once per day. Cancelling pays nothing.
  - The baked numbers in the mockups (+720, +200) were removed from the art. The reward is now drawn live from the economy.
- **Rewards follow the economy:** `giftBase()` is the largest task reward among the 2 tasks before and after the current one, kept between 30 and 150.
  - Revisit gift: 2× giftBase (60–300).
  - Share gift: 1× (30–150).
  - Add to Home: 2×, once.
- **Ad scenario:** see `MINIS_NOTES.md`. It has four placements: Kitchen Rush, Double Tip, Coin Bag (rewarded) and Oven Break (interstitial).
- **TikTok native-port fixes, done ahead of time:** a platform layer `src/05_platform.js` covers storage, lifecycle, errors, safe area and the capsule, images, ads, number formatting, the ES2017 build, a touch fallback and audio resume.
- Settings → **Minis test tools** (web only): reset daily gifts, force ad no-fill or early close, simulate the TikTok capsule, force an interstitial, +500 coins.
- Bot playthrough: all tasks done, 0 errors, finished at 36:15. `tests/qa_minis.js`: 40/40 pass on both builds, in mock mode and with a fake TikTok SDK.

## v4.3.4
- Eating customers keep the restaurant's wooden chair. The sheet's eating / drinking art is used without its red chair and little table (`tools/seat_crops.py` removes the chair and cuts the art at the table top), and the cat sits on the normal wooden chair at the checkered table.
- The tourist's eating frames have the chair behind the cat and could not be separated cleanly, so the tourist sits on the wooden chair using their standing art (legs hidden under the table).
- Game logic unchanged. Bot playthrough: all tasks, 0 errors, finished at 34:39.

## v4.3.3
- **New VIP sheets.** Fedora VIP and Pink Elegant VIP:
  - Idle in 8 directions and their drawn walk cycles, 5–8 frames per direction.
  - Sitting on the red sofa, drawn with the sheet's own red armchair and table. The booth's red sofa stays.
  - Waiting: sitting pose, angry pose when patience runs low.
  - Served: the 4-frame drink loop. Pink Elegant alternates it with the 4-frame dessert loop.
  - Walk frames that mix views in the sheet (front/back for Pink, back diagonals for Fedora) use the idle drawing with stepping legs.
- **Customers eat with the sheet's eating / drinking art.** On seats that face the camera, customers use the sitting art from their sheet: eating pizza, eating cake or drinking, according to what they ordered. The tourist uses the 4-frame eating loop. Seats facing away still show the cat from behind.
- **Faces.** The regular customers' right-facing 3/4 and profile drawings put the nose and mouth on the cheek edge. Those directions now use the clean front-left 3/4 drawing, mirrored where needed.
- **Deluxe vs Vegetarian.** Deluxe gets a gold ring and a small crown, Vegetarian a green ring and a leaf, on the order bubble and on every pizza in the world. The pizza art itself is unchanged.
- Game logic unchanged.

## v4.3.2
- **VIP uses the sheet's sitting / eating art.** While a VIP sits in the booth, the sheet's sitting sprite (with its own red armchair and little table) replaces the left sofa and the booth table, so the VIP no longer looks like they are standing on the seat.
  - VIP fedora: sitting pose while waiting, the impatient pose when patience runs low, and the 4-frame eating loop once served.
  - VIP 01 / VIP 02: the drinking pose while waiting, then eating pizza with a sip of the drink now and then.
- **Waiter starts moving the moment you wake him.** Waking him gives a job on the same frame, even when there is nothing urgent: he tops up any dish the counter is short of, otherwise walks the floor checking on the tables. The wake-up hop no longer hides the walk.
- **Pizzas now use the approved pizza art** (sheet "Pizza – Nhiều loại"): Margherita (basil + tomato), Pepperoni, Seafood, Deluxe and Vegetarian.
  - Order bubbles show the round art exactly as drawn.
  - Pizzas on the counter, in hands and on tables show the same art lying flat on a crust edge.
  - Raw pizzas on the oven and prep board are a paler, unbaked version of the same art.
  - Baked at 3× resolution for sharp phones.
- Tools: `tools/cut_pizzas.py`; `tools/cut_sheets2.py` now also cuts the VIP sitting / eating poses.

## v4.3.1 — Fixes from playtest
- **VIP has legs while seated.** Seated customers keep their legs: the body sinks slightly onto the seat and the legs bend in front of it. The VIP's place in the booth moved to the near end of the left sofa and is drawn over the table edge, so the legs are no longer hidden under the table.
- **Queue facing.** The source sheets are not consistent about which way some labelled poses face; for example the tourist's "135°" actually looks right, so the tourist turned away from the counter. A per-character direction table now picks the drawing that really faces each way, mirrored where needed. It covers the tourist, VIP fedora and VIP 02 (idle and walk), the cleaner's diagonal walks and the manager's front view.
- **Workers go back to work after you wake them.**
  - After 75–140 s of work, a waiter, waitress or cleaner may nod off between jobs. They stop until you walk past.
  - When woken, they take a job immediately and walk 35% faster for 6 s. If nobody wakes them, they get up by themselves after 35 s.
  - The waiter always has work now: VIP orders, taken from the machine if the counter has none; dirty plates, shared with the cleaner, one table per worker; carrying finished dishes to the counter.
- **Cleaner is always busy.** Clears plates (VIP booth first). When every table is clean, he sweeps patches of the dining floor.
- **Shadows.** The blue or purple floor shadows painted in the source sheets are removed from every sprite (staff and new characters) with an edge-connected flood fill. Each sprite is re-anchored at its real feet. All characters now use the same round grey-brown shadow. Sprites are stored as full-colour PNGs (no palette reduction), so edges are smoother.
- **Manager.** The sheet's front idle has awkward hands, so the front view uses the front-right drawing, which shows the tablet clearly. The manager turns toward you when you come over, waves while you use the manager pad, and otherwise checks the tablet now and then.
- Tool: `tools/strip_shadows.py` (runs after `tools/cut_sheets2.py`).

## v4.3 — Cleaner, new character art, interaction fixes
- **Cleaner cat (new hire).** A new "Hire a cleaner cat" task comes right after the VIP booth (480 coins; the spot is next to the first trash bin). The cleaner clears dirty plates from every table, VIP booth first, takes them to the nearest bin, and sweeps while clearing. Once a cleaner is hired, the waiter stops clearing plates and only delivers VIP orders.
- **Wake sleeping staff by walking past.** After 10 s with nothing to do, a worker dozes off. If the owner walks within 1.3 tiles, they wake up right away with a sparkle.
- **VIP no longer hidden behind the sofa.** The booth is now drawn in three depth slices: the left sofa behind the VIP, then the table and right sofa, then the right backrest. The VIP is drawn in front of the sofa they sit on.
- **A single ingredient can go into a machine.** Loading is now allowed whenever a machine has any free slot (for example 5/6). Nothing is wasted: one crate always adds its full amount, so the gauge can briefly show one extra.
- **Use machines from anywhere around them.** Standing still anywhere within about half a tile of a food machine collects its food or loads it, so you no longer need the exact stand point. Walking past only reacts at the old stand point, so passing a row of ovens does not fill your hands by accident. The ingredient storage keeps its stand point.
- **New approved art used directly** (cut from the four new sheets, background removed, feet-anchored, embedded in the HTML):
  - Tourist customer and VIP (fedora): idle in 8 directions plus their drawn 4-frame walk in all 8 directions.
  - Regular customers 01–04 and VIP 01/02: idle in 8 directions. While walking, only the legs step, because the sheet's 4 walk frames mix directions.
  - Cleaner: idle in 8 directions, 4-frame walk in 8 directions, sweep 1/2, collect and sleep.
  - Manager (office): idle in 8 directions and a check-tablet pose that alternates with idle.
  - Seated customers use their idle art for the direction they face, with the legs hidden under the table. The sheets' sitting poses come with their own chair and table, which would double up with the restaurant furniture, so they are not used.
- Tool: `tools/cut_sheets2.py` regenerates `src/16_more_sprites.js` from the sheets.

## v4.2 — Approved art used directly
- Chef (player), Waiter, Cashier and Waitress now use **the approved sprite art itself**: idle front/left/back/right plus walk 1–4 (right). The sprites were cut from the sheet, the background was removed by edge flood-fill, and each sprite is anchored at the feet. All of it is embedded in the HTML.
- **Hybrid motion:**
  - Side walking plays the 4 original walk frames. Walking left mirrors the whole right-facing frame, not individual parts.
  - Front and back walking keep the body still and step only the two legs (the leg strip is split at the hips).
  - Diagonals map to the nearest drawn view: 315→right, 45→left, 0→front, 135/180/225→back.
- Waitress replaces the code-drawn kitchen helper (same restocking job). When the cashier is hired, the counter's own register is hidden, because her sprite carries one.
- Customers have no sprites in the sheet, so they stay on the code rig. It was restyled to match the sheet: bigger glossy eyes, open smile, darker red-brown outline, head highlight, dark trousers.
- Tool: `tools/cut_sprites.py` regenerates the cut-outs from the sheet. Gameplay and economy are unchanged.

## v4.1 — Chubby character style
- Rebuilt every cat in the "Chubby Style · Minimal Animation" look: oversized round head, round bean body, stubby leg nubs, small arm nubs, short curled tail, small wide-set eyes, big blush, tiny ω mouth, soft shading and soft brown outlines.
- Walking animates only the legs and the tail. The body, head and arms stay still, with no bounce or arm swing. Idle is the same pose in all 8 directions (blinking only).
- Costumes now follow the sheet: Chef has a toque and red paw apron. Waiter has a red paw cap and red apron. Cashier has a pink bow and pink paw apron. The default customer is a grey tabby in a blue polo. Other customer looks were restyled to match.
- Emotions and actions redrawn: wait (content eyes), impatient, angry, happy hop, sit, eat (paws to mouth), sleep (curled up lying), carry tray, cook and serve.
- Gameplay, economy and save format are unchanged from v4.0.

# v4.0 (Master Prompt v2)

Base: the v3 build (gameplay, economy, positions and interactions kept unless listed here).

## Characters (new part-based rig, `src/20_rig.js`)
- Replaced the v3 two-view sprite sheets (front/back + horizontal mirroring) with a direction-aware rig. Body parts: head, two ears, two eyes, mouth, torso, two arms, two legs (pants + shoes), one tail, hat, apron, held tray. Each part has a pivot (neck, shoulders, hips, tail root, hand/tray anchor).
- 8 explicit directions with one engine-wide convention: 0 front, 45 front-left, 90 left, 135 back-left, 180 back, 225 back-right, 270 right, 315 front-right. Parts are projected and depth-sorted per angle. Nothing is mirrored, and the head never turns separately from the body. Back views hide the face and show the back of the shirt, apron bow, pants and tail.
- Chef (orange/white, toque, white jacket, red neckerchief and red apron, dark pants), Waiter (grey/white, red cap with visor, white shirt, red apron), Cashier (calico, red bow, red uniform with white sleeves), a kitchen helper (chef uniform, cream fur) and manager.
- 8 customer looks: regular, cheerful tuxedo, patient calico, impatient, office cat, elder with glasses, kid (uniform 0.8 scale), tourist with bucket hat, camera and backpack, and VIP with fedora and sunglasses.
- Animations: idle (breathing, blinking, tail sway), walk (alternating legs, opposite arm swing, bounce, tail follow-through), carry tray (pizza centred, tray level, reduced swing), cook (faces the station, working hands), serve (tray extended toward the customer), queue wait, happy hop, tired, angry, sit, eat, sleep, and cashier using the register.
- Facing comes from the actual movement vector. Queue customers lock to 135° (facing the counter) while waiting. Seated customers face their table. The chef faces the station while cooking, and the waiter faces the VIP while serving.

## Environment
- The red-and-white canopy over the starter counter has been removed. The counter, register, tray and queue are fully visible. One counter segment now shows a stack of pizza boxes.
- Pizzas redrawn with golden crust, sauce rim, melted cheese with highlights, and distinct toppings. Varieties: Margherita, Pepperoni, Vegetarian, Seafood, Deluxe.
- Every pizza variety has these states: raw (on the prep board / entering the oven), baking (inside the oven mouth), finished, on the carry tray, top-down icon in the order bubble, on the dining table, and as a takeaway box carried by customers.
- Queue indicators: gold rope posts with a red rope, plus paw markers on each queue slot.
- New Vegetarian prep table and Seafood counter. Chairs now have slatted backrests.

## Gameplay
- Base speed is 2.64 tiles/s (3.30 × 0.8). Each manager SPEED level adds 0.32 (0.40 × 0.8).
- Two new recipes: Vegetarian (phase 4) and Seafood (phase 5). Deluxe is the premium recipe. VIP orders can include them.
- Optional bonus objective shown under the main task: serve a streak of customers, collect coins, bake dishes or clear plates.
- Mid- and late-game prices raised 15–25% to offset the extra recipe income. A 3-run bot average reaches the grand opening at about 36:47.
- Old v3 saves are migrated (task index adjusted for the two inserted tasks).

## Fixes
- A touch made during the 0.4 s loading fade was swallowed by the fading overlay. The overlay now ignores pointer events while fading.
