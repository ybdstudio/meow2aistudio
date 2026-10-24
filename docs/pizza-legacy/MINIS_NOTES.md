# Meow Pizza — TikTok Minis notes (v4.4)


## HS TikTok SDK (native)
- Keys are in `src/native/65n_hs.js`: Game ID 7698663003788511253 and the SDK key (sk_live…), which is public by design. The TikTok **Client Secret** is never in the game; it goes only in the HS dashboard.
- Each ad moment calls `HSGame.showAd(label)` with the exact dashboard label:

| Label | Moment | Reward (via onGive) |
|---|---|---|
| Double Task Bonus | "×2 task bonus" chip after a task pays | task_bonus ×1 = that task's reward again (max 150) |
| Buying Pad | coin-bag chip when short on coins for a purchase for 25 s | coin_bag ×1 = the shortfall (max 50% of the price) |
| Meow Rush | MEOW RUSH button / Shop | meow_rush = 2× kitchen speed for 60 s |
| VIP tip | "VIP tip ×2" chip after a VIP pays | vip_bonus ×1 = that VIP's bill again |
| Coin Purchase | Shop "Bag of coins", ▶+100 on unaffordable upgrades | coins 100 |
| Grand Opening | after each new stage opens, and after the grand opening | coins 200 |
| Oven Break | interstitial every 60 s of play (≥ 30 s after a rewarded ad) | — |

- **Gifts:**
  - share → `HSGame.share`, coins 50 daily.
  - tiktok_shortcut → coins 100, once.
  - tiktok_profile → coins 100, daily.
- **Dashboard:** paste `iaa_config` from `dist/native.hs-dashboard.json` into HS → Ads Config → Edit raw JSON. If the dashboard already has `rewards` for these labels with other item names, this build can't give them (onGive refuses unknown items and nothing is lost), so use these item names.
- **Check:** `node vendor/hs-tiktok-sdk-1.0.7/hs-check.mjs dist/native`.

## Native package (upload this, not the HTML)
1. Run `python3 src/build_native.py <appid>` to produce `dist/native/`. Pass the appid of the game from the Developer Portal. You can also leave it out and fill `project.config.json → appid` by hand.
2. In `dist/native`, run `ttmg dev` (you will be asked for the Client Key once), test on a real phone, then press **Upload** in DevTool.
3. The HS SDK is already integrated (see above). `hs-game.js` and `hs-tiktok-sdk.min.js` must stay next to `game.js`.

Package layout:
- `game.js`: adapter + game + canvas UI.
- `img/`: loading screen and icons.
- `art/`: subpackage with the sprites, popup art and its own `game.js` entry.
- `game.json`, `project.config.json`.

## Before upload (HTML build)
1. Plug in the HS SDK by setting `Ads.adapter` in `src/05_platform.js`. A global `window.MeowPizzaAds` with the same shape also works:
   ```js
   Ads.adapter = {
     rewarded(label)     { /* show the HS rewarded ad; resolve true when watched to the end, false when closed early; reject when there is no ad */ },
     interstitial(label) { /* show the HS interstitial; resolve when it closes */ },
   };
   ```
   `label` is one of: Double Task Bonus, Buying Pad, Meow Rush, VIP tip, Coin Purchase, Grand Opening, Inter1. Map each label to its ad unit inside the adapter.
2. `python3 src/build.py` → `dist/minis/index.html` (ES2017), plus the icons.

## Ad scenario (`CFG.ads`)
| Label | In game | Type | Trigger | Reward | Limit |
|---|---|---|---|---|---|
| Double Task Bonus | "×2 task bonus +N" chip above the task card | rewarded | 10 s after a task pays coins (≥ 30) | the task reward again (max 150) | 60 s cooldown |
| Buying Pad | coin-bag chip under the coins | rewarded | the current task is a purchase and you have been short on coins for 25 s | the missing coins, max 50 % of the price | 150 s cooldown |
| Meow Rush | MEOW RUSH ×2 button / Shop | rewarded | player taps it | 2× cooking speed, +30 % walk, 60 s | 120 s after it ends |
| VIP tip | "VIP tip ×2 +N" chip | rewarded | after a VIP pays | that VIP's bill again | 60 s cooldown |
| Coin Purchase | ▶+100 on unaffordable upgrades, Shop "Bag of coins" | rewarded | not enough coins | +100 | 180 s cooldown |
| Grand Opening | "Grand opening +200" chip | rewarded | a new stage opens (Cozy Pizzeria, dining hall, second floor) and the grand opening event | +200 | once per opening |
| Inter1 | "Oven break" | interstitial | every 30 s of play, from "Serve 5 customers" | — | only at a safe moment: no popup, no ad, not paused, ≥ 30 s after a rewarded ad; silent on errors |

Rewarded ads pay only on a full watch. The game world freezes and audio pauses during every ad.

## Engagement gifts (fixed, `CFG.gifts`)
- Revisit gift: +100, once per day.
- Share gift: +50, once per day.
- Add to Home: +100, once.

## Native-port issues fixed in this build
| Issue on TikTok native runtime | Fix |
|---|---|
| `localStorage` not guaranteed | `PF.store` → `getStorageSync`/`setStorageSync`, then localStorage, then memory |
| no `visibilitychange` | `PF.onHide/onShow` (TTMinis.game.onHide/onShow + DOM fallback): save, pause, release input, resume audio |
| `window.onerror` not delivered | `TTMinis.game.onError` |
| safe-area env() = 0, capsule (… ×) covers top-right HUD | `getWindowInfo().safeArea` + `getMenuButtonBoundingClientRect` → CSS vars `--sat --sab --capw --capb` |
| AudioContext suspended after ads/background (iOS) | suspend on pause, resume on show/touch, no sfx while paused |
| ad instance reuse / errors | one instance per type, listeners once, 12 s show timeout, retry via load(), 11003 → recreate, 30001 → toast |
| `toLocaleString`/Intl missing | `fmtNum()` |
| `??` / `?.` on old JS cores | Minis build is transpiled to ES2017 |
| `new Image` | `PF.createImage()` (TTMinis.game.createImage when present) |
| no PointerEvent | touch-event joystick fallback |
| loading bar stuck at 90 % | parallel sprite decode with progress |

## Native build notes
- The DOM HUD (60_ui.js / 65_minis_ui.js) is used only by the HTML build. The native build uses `src/native/60n_ui_canvas.js` instead. Any UI change has to be made in both.
- Fredoka is not bundled, so the native build uses the system rounded font.
