# Test report — v4.3.3
- Full bot playthrough: all 48 tasks, 0 errors, 0 stuck events, finished at 37:43.
- Orientation audit: 72,640 samples, 0 wrong.
- Visual QA:
  - Both VIPs seated in the booth.
  - Customers eating at every seat type.
  - Queue faces.
  - Pizza sprites: 5 types × 3 states, Deluxe/Vegetarian marks.

---

# Test report — v4.3.2
- Full bot playthrough, run twice: all 48 tasks, 0 errors, 0 stuck events. Finished at 36:45 and 39:35.
- `test/wake.js`:
  - A waiter idle-sleeping with nothing to do (no plates, no VIP, counter full) had a job and was walking on the wake-up frame, and had moved 1.71 tiles 0.5 s later.
  - Workers who dozed off mid-shift resumed within 1 s.
- `test/qa_pizza.js`: all 15 pizza sprites (5 types × in-world / raw / order icon) render from the approved art. Checked in game on the counter and in the order bubble.
- VIP booth: all three VIP looks render their sitting art while waiting and eating.
- Orientation audit: 71,267 samples, 0 wrong. Save/reload: pass.

---

# Test report — v4.3.1

Executed on the v4.3.1 build (headless Chromium):
- Full bot playthrough, run twice: all 48 tasks, 0 errors, 0 stuck events. Grand opening at 38:23 and 35:50, finished at 38:51 and 36:28. Workers dozed and were woken 18 times during one run.
- `test/wake.js`, for the waiter and the cleaner:
  - While asleep they moved 0 tiles.
  - Walking past woke them, and each had a job within 1 s and moved about 2.8 tiles.
- `test/diag_workers.js`: over 2 minutes of late game, the waiter alternated plates, food runs and VIP deliveries, and the cleaner was never idle.
- Station proximity, save/reload: pass. Orientation audit: 70,845 samples, 0 wrong.
- Visual QA:
  - All three VIP looks seated in the booth with legs visible.
  - Queue of tourist + cat01–04, all facing the counter.
  - Manager facing the owner.
  - Before/after shadow check on all sprites.

---

# Test report — Cat Pizza Tycoon v4.3

All checks below were run on the v4.3 build in headless Chromium:
- Load: 0 JS errors. 32 staff sprites and 185 new character sprites decoded.
- Full bot playthrough, run twice: all 48 tasks, including the new cleaner hire, with 0 errors and 0 stuck events. Grand opening at 37:59 and 38:59, finished at 38:17 and 40:28 (v4.2 was 36–40 min).
  - A first version that reacted to the machine footprint even while walking slowed the late game to about 58 min, because the owner kept grabbing food from machines he walked past. It was changed so that standing still anywhere near a machine works, and walking past only reacts at the stand point.
- Station proximity (`test/near.js`):
  - Standing still 1.61 tiles from the oven's stand point, but next to the oven, collected 3 pizzas.
  - Walking past the same spot collected 0.
  - Loading one crate into a prep table at 5/6 was accepted.
- Wake-up: a cleaner asleep for 30 s woke up (idle timer reset, sparkle shown) when the owner came within 0.85 tiles.
- Save / reload: pass. Orientation audit: 70,987 samples, 0 wrong facings.
- Visual QA (`deliver/qa_ingame_v4.3.png`):
  - VIP sitting in the booth is drawn in front of the sofa.
  - Customers in every seat type (L/T/R/B chairs and both booth seats).
  - New customer art in the queue.
  - Cleaner sweeping a table and sleeping.
  - Manager in the office.

---

## v4.2

v4.2 re-run, all executed after integrating the approved sprites:
- Load: 0 JS errors. 32 staff sprites decoded and 81 baked assets.
- Touch moved the chef 4.1 tiles. Speed 2.640 / 2.960. Collision, purchase cost and save/reload all pass.
- Orientation audit: 67,554 per-frame samples, 0 wrong facings.
- Full bot playthrough reached the grand opening at 36:08 with 0 errors.
- Visual QA:
  - In-game capture of the chef walking in all 8 directions (4 frames each). Side views play the drawn walk cycle, front/back step only the legs.
  - Cut-out check on a checkerboard: no background left except one stray cable under the cashier's register, which was removed.
  - In-game close-ups of the queue, dining area and counter.

---


v4.1 re-run (chubby rig), all executed after the change:
- Standalone build loads with 0 JS errors. 81/81 manifest entries bake.
- Touch drag moved the chef 4.1 tiles. Speed measured 2.640 tiles/s (base) and 2.960 (manager Lv 1). Collision, exact purchase cost and save/reload all pass.
- Orientation audit: 72,499 per-frame customer samples, 0 wrong facings (queue, seated, walking).
- Full bot playthrough reached the grand opening at 33:51 with 0 errors. Gameplay code is unchanged, so run-to-run variance is expected.
- Visual QA: inspected the regenerated reference sheet (all 8 directions for chef, waiter and cashier, walk frames, carry, serve, cook, emotions, sit/eat, sleep) and an in-game close-up of the queue and dining area. One shading bug (colours overflowing to green) was found and fixed during QA.

---

Original v4.0 report:


All checks below were actually executed in headless Chromium (Playwright) inside a Linux container. **Not performed:** testing on a physical iPhone or real Safari/WebKit (no WebKit engine was available). iPhone was emulated in Chromium (390×844, DPR 3, touch input, iOS Safari user agent).

| # | Check | How | Result |
|---|---|---|---|
| 1 | Game starts, no JS errors | Loaded the standalone HTML. Page-error listener stayed active through every run below | Pass, 0 errors |
| 2 | Assets | Manifest bake report | 81/81 baked. File mode loaded 66 PNGs from the folder, and a deliberately removed file was reported and fell back. Character rigs are drawn live, so they have no PNG files |
| 3 | Touch joystick | CDP touch drag on the canvas | Pass, chef moved 4.1 tiles in the dragged iso direction. This found and fixed a bug where the loading fade swallowed early touches |
| 4 | Movement speed | Measured over 1 s of simulated input | 2.640 tiles/s at base (expected 2.64). 2.960 at manager SPEED Lv 1 (expected 2.96) |
| 5 | Collision | Pushed into the corner and into solids | Pass, stops at body radius (0.32) |
| 6 | Purchases / upgrades | Compared coins before and after | Exact cost deducted (register 30, manager speed 60) |
| 7 | Save / load | Reload page over http | Task, coins and purchases identical after reload |
| 8 | Orientation audit | 70,468 per-frame customer samples over 12 game minutes | 0 queue customers not facing the counter. 0 seated customers facing the wrong way. 0 walkers facing away from their movement |
| 9 | Full progression | 3 bot runs from a fresh save, driving real input, pathfinding and purchases | All 47 tasks completed in order in 3/3 runs. Grand opening at 36:47, 36:53, 36:40. Longest single objective 2:22 |
| 10 | Customer loop | Same runs | Hundreds of customers per run completed enter → queue → order → pay → sit → eat → plate → leave. VIPs served |
| 11 | Workers | Same runs | Cashier, kitchen helper (restocks ingredients and counter) and waiter (VIP delivery, clearing plates) all active |
| 12 | Visual QA | Inspected the character reference sheet (rendered from the game rig) and in-game close-ups at DPR 3 | Checked 8 directions for chef, waiter and cashier, plus walk, carry, serve, cook, queue wait, impatient, angry, happy, sit, eat, tired and sleep. No duplicate heads or tails, pants present in back views, feet grounded, no faces on back views. Starter counter has no canopy. One fix applied during QA: the waiter's cap visor was redrawn as a crescent |
| 13 | Not blank | Centre pixel of canvas after load | Non-empty |

## Known limits
- In pure profile (90°/270°) the far leg and far arm sit almost exactly behind the near ones. That is anatomically correct for this camera, but only one leg reads clearly.
- The 40-minute human estimate comes from the bot plus an assumed 10–25% human overhead. It has not been measured with real players.
