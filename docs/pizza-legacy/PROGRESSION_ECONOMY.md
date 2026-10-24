# Cat Pizza Tycoon v4 — progression & economy

Validation method: an automated player bot that drives the real game code (same movement speed 2.64 tiles/s, same pathfinding, same purchases and upgrades, no shortcuts) was run 3 times from a fresh save. Times below are the 3-run average. The bot never hesitates or explores, so a first-time human player is expected to take roughly 10–25 % longer (≈ 40–45 min); that human figure is an estimate, not a measurement.

## Phase plan vs. measured (bot)
| Phase | Design target | Key unlocks | Bot reached it at |
|---|---|---|---|
| 1 | 0–5 min | register, oven, first table, bin, first upgrade, task system | tutorial done ≈ 0:47 |
| 2 | 5–10 min | 2nd table, Cat Cola recipe, Cozy Pizzeria renovation, ingredients, Pepperoni | renovation ≈ 4:15 |
| 3 | 10–20 min | first worker (cashier), 3rd table, 2nd oven, more customers, new dining hall, family tables | cashier ≈ 8:04, dining hall ≈ 12:30 |
| 4 | 20–30 min | Berry Cake + Vegetarian recipes, decorations, kitchen helper, automation, waiter, VIP booth | veggie ≈ 15:40, waiter ≈ 22:00 |
| 5 | 30–40 min | bigger kitchen, Deluxe + Seafood pizzas, second floor, grand opening milestone | second floor ≈ 32:20, milestone ≈ 36:47 |

## Every objective (unlock condition, cost, income, time to afford, impact, reward, next)
| # | Objective | Unlock condition | Cost | Avg. start | Time to complete | Income when started (coins/min) | Impact | Reward | Next objective |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Buy a cash register | Start | 30 | 0:02 | 0:03 | 0 | Opens sales | — | Buy a pizza oven |
| 2 | Buy a pizza oven | Complete: Buy a cash register | 40 | 0:05 | 0:05 | 0 | New/extra production | — | Take the pizza |
| 3 | Take the pizza | Complete: Buy a pizza oven | — | 0:10 | 0:02 | 0 | Tutorial step | — | Take the pizza to the register |
| 4 | Take the pizza to the register | Complete: Take the pizza | — | 0:12 | 0:02 | 0 | Tutorial step | — | Stand at the cash register |
| 5 | Stand at the cash register | Complete: Take the pizza to the register | — | 0:14 | 0:01 | 0 | Tutorial step | — | Buy a table |
| 6 | Buy a table | Complete: Stand at the cash register | 20 | 0:15 | 0:04 | 0 | +2 seats | — | Collect the money |
| 7 | Collect the money | Complete: Buy a table | — | 0:19 | 0:01 | 35 | Tutorial step | — | Buy a trash bin |
| 8 | Buy a trash bin | Complete: Collect the money | 5 | 0:20 | 0:03 | 33 | Clears dirty tables | — | Put the dirty plate in the bin |
| 9 | Put the dirty plate in the bin | Complete: Buy a trash bin | — | 0:23 | 0:20 | 28 | Tutorial step | — | Upgrade the kitchen |
| 10 | Upgrade the kitchen | Complete: Put the dirty plate in the bin | — | 0:44 | 0:05 | 43 | Tutorial step | — | Serve 5 customers |
| 11 | Serve 5 customers | Complete: Upgrade the kitchen | — | 0:48 | 0:21 | 39 | Practice / served | 30 | Unlock a new table |
| 12 | Unlock a new table | Complete: Serve 5 customers | 60 | 1:09 | 0:05 | 51 | +2 seats | 20 | New recipe: Cat Cola |
| 13 | New recipe: Cat Cola | Complete: Unlock a new table | 90 | 1:14 | 0:25 | 48 | New/extra production | 30 | Cook 10 pizzas |
| 14 | Cook 10 pizzas | Complete: New recipe: Cat Cola | — | 1:39 | 1:15 | 58 | Practice / cooked_pizza | 40 | Collect 100 coins |
| 15 | Collect 100 coins | Complete: Cook 10 pizzas | — | 2:54 | 1:21 | 55 | Practice / collected | 40 | Renovate into a Cozy Pizzeria |
| 16 | Renovate into a Cozy Pizzeria | Complete: Collect 100 coins | 300 | 4:15 | 0:05 | 77 | Cozy Pizzeria visuals, walls | 50 | Build the ingredient storage |
| 17 | Build the ingredient storage | Complete: Renovate into a Cozy Pizzeria | 150 | 4:20 | 0:26 | 74 | New/extra production | 40 | New recipe: Pepperoni |
| 18 | New recipe: Pepperoni | Complete: Build the ingredient storage | 180 | 4:46 | 1:08 | 74 | New/extra production | 50 | Bring ingredients to the prep table |
| 19 | Bring ingredients to the prep table | Complete: New recipe: Pepperoni | — | 5:55 | 0:14 | 70 | Practice / loaded | 30 | Upgrade ingredient storage |
| 20 | Upgrade ingredient storage | Complete: Bring ingredients to the prep table | 80 | 6:09 | 0:04 | 74 | Pantry holds more | 40 | Open the manager office |
| 21 | Open the manager office | Complete: Upgrade ingredient storage | 250 | 6:13 | 1:51 | 69 | Unlocks chef speed/carry upgrades | 50 | Hire the first worker |
| 22 | Hire the first worker | Complete: Open the manager office | 260 | 8:04 | 1:36 | 48 | Automation | 60 | Unlock a third table |
| 23 | Unlock a third table | Complete: Hire the first worker | 150 | 9:40 | 0:31 | 93 | +2 seats | 40 | Build a second pizza oven |
| 24 | Build a second pizza oven | Complete: Unlock a third table | 240 | 10:11 | 1:13 | 150 | New/extra production | 50 | Attract more customers |
| 25 | Attract more customers | Complete: Build a second pizza oven | 100 | 11:24 | 0:15 | 127 | Customers arrive faster | 50 | Serve 15 customers |
| 26 | Serve 15 customers | Complete: Attract more customers | — | 11:39 | 0:51 | 131 | Practice / served | 80 | Expand: new dining hall |
| 27 | Expand: new dining hall | Complete: Serve 15 customers | 500 | 12:29 | 0:47 | 167 | New restaurant area | 80 | Add a family table |
| 28 | Add a family table | Complete: Expand: new dining hall | 190 | 13:16 | 0:52 | 164 | +4 seats | 50 | New recipe: Berry Cake |
| 29 | New recipe: Berry Cake | Complete: Add a family table | 340 | 14:08 | 1:34 | 148 | New/extra production | 80 | New recipe: Vegetarian pizza |
| 30 | New recipe: Vegetarian pizza | Complete: New recipe: Berry Cake | 320 | 15:42 | 1:44 | 147 | New/extra production | 80 | Decorate the new hall |
| 31 | Decorate the new hall | Complete: New recipe: Vegetarian pizza | — | 17:26 | 1:32 | 86 | Practice / decor | 100 | Hire a kitchen helper to restock |
| 32 | Hire a kitchen helper to restock | Complete: Decorate the new hall | 520 | 18:59 | 2:04 | 83 | Automation | 80 | Automate restocking |
| 33 | Automate restocking | Complete: Hire a kitchen helper to restock | 120 | 21:03 | 0:15 | 91 | Pantry restocks faster | 80 | Upgrade kitchen speed to Lv 3 |
| 34 | Upgrade kitchen speed to Lv 3 | Complete: Automate restocking | 0+60+140 | 21:18 | 0:21 | 296 | All stations cook faster | 80 | Add another family table |
| 35 | Add another family table | Complete: Upgrade kitchen speed to Lv 3 | 240 | 21:38 | 0:22 | 280 | +4 seats | 60 | Hire a waiter |
| 36 | Hire a waiter | Complete: Add another family table | 600 | 22:01 | 1:51 | 293 | Automation | 100 | Set up the VIP booth |
| 37 | Set up the VIP booth | Complete: Hire a waiter | 420 | 23:52 | 0:47 | 151 | VIP orders (×1.6) | 80 | Serve a special customer |
| 38 | Serve a special customer | Complete: Set up the VIP booth | — | 24:39 | 0:43 | 315 | Practice / vip | 150 | Unlock the fourth hall table |
| 39 | Unlock the fourth hall table | Complete: Serve a special customer | 220 | 25:23 | 0:06 | 326 | +2 seats | 60 | Expand the kitchen |
| 40 | Expand the kitchen | Complete: Unlock the fourth hall table | 720 | 25:29 | 1:17 | 323 | New restaurant area | 120 | Premium recipe: Deluxe pizza |
| 41 | Premium recipe: Deluxe pizza | Complete: Expand the kitchen | 820 | 26:46 | 2:07 | 252 | New/extra production | 150 | New recipe: Seafood pizza |
| 42 | New recipe: Seafood pizza | Complete: Premium recipe: Deluxe pizza | 560 | 28:53 | 1:07 | 229 | New/extra production | 120 | Bake 5 Deluxe pizzas |
| 43 | Bake 5 Deluxe pizzas | Complete: New recipe: Seafood pizza | — | 29:59 | 2:22 | 704 | Practice / cooked_special | 120 | Build the second floor |
| 44 | Build the second floor | Complete: Bake 5 Deluxe pizzas | 950 | 32:21 | 1:31 | 0 | New restaurant area | 150 | Prepare the grand opening |
| 45 | Prepare the grand opening | Complete: Build the second floor | 300 | 33:52 | 1:41 | 206 | Starts the grand opening | — | Grand opening: serve 10 customers |
| 46 | Grand opening: serve 10 customers | Complete: Prepare the grand opening | — | 35:33 | 1:14 | 247 | Practice / served | 500 | Restaurant complete! Keep growing |

Bot finish times: 36:47, 36:53, 36:40. Longest single objective: 2:22.

## Economy configuration (from `src/00_config.js`)
### Food & customer spending

| Item | Price (coins) | Made at | Time / item | Needs ingredients |
|---|---|---|---|---|
| Margherita | 5 | oven | 2.4s | no |
| Cat Cola | 4 | drink | 2.2s | no |
| Pepperoni | 9 | prep | 3.6s | 1 crate → 2 dishes |
| Berry Cake | 12 | dessert | 4.2s | 1 crate → 2 dishes |
| Vegetarian | 10 | veggie | 3.8s | 1 crate → 2 dishes |
| Seafood | 16 | seafood | 4.8s | 1 crate → 1 dishes |
| Deluxe | 22 | special | 5.5s | 1 crate → 1 dishes |

Restaurant PRICE upgrade adds +1 coin per 5 coins of base price per level; each decoration adds +5% to every sale; VIP orders pay ×1.6.

### Stations (capacity / speed)

| Station | Base capacity | +per CAPACITY level | Base interval | Speed scaling |
|---|---|---|---|---|
| oven | 4 | +2 | 2.4s | ×0.78 per SPEED lvl |
| drink | 5 | +2 | 2.2s | ×0.78 per SPEED lvl |
| prep | 4 | +1 | 3.6s | ×0.78 per SPEED lvl |
| dessert | 4 | +1 | 4.2s | ×0.78 per SPEED lvl |
| veggie | 4 | +1 | 3.8s | ×0.78 per SPEED lvl |
| seafood | 3 | +1 | 4.8s | ×0.78 per SPEED lvl |
| special | 3 | +1 | 5.5s | ×0.78 per SPEED lvl |
| pantry | 6 | +3 per STORAGE lvl | 3.2s | ×0.7 per SUPPLIER lvl |

### Upgrade costs (level 1 → max)

| Panel | Upgrade | Costs | Effect |
|---|---|---|---|
| KITCHEN | SPEED | 0 / 60 / 140 / 260 / 420 | All stations cook faster |
| KITCHEN | CAPACITY | 0 / 60 / 140 / 260 / 420 | Stations hold more food |
| KITCHEN | STORAGE | 80 / 160 / 280 / 420 | Pantry holds more |
| KITCHEN | SUPPLIER | 120 / 240 / 400 | Pantry restocks faster |
| MANAGER | SPEED | 60 / 120 / 200 / 320 / 480 | Chef walks faster |
| MANAGER | CARRY | 50 / 100 / 170 / 260 / 380 | Chef carries 2 more |
| RESTAURANT | PRICE | 120 / 220 / 360 / 550 / 800 | Every dish sells for more |
| RESTAURANT | CUSTOMERS | 100 / 180 / 300 / 460 / 700 | Customers arrive faster |

### Purchases (stations, tables, workers, expansions)

| Spot | Cost | Unlocked by task | Kind |
|---|---|---|---|
| Cash register | 30 | t_register | register |
| Pizza oven | 40 | t_oven | station |
| Table | 20 | t_table | table |
| Trash bin | 5 | t_bin | bin |
| Table | 60 | t_table2 | table |
| Drink machine | 90 | t_drink | station |
| Cozy Pizzeria | 300 | t_renovate | stage |
| Ingredient storage | 150 | t_pantry | station |
| Prep table | 180 | t_prep | station |
| Manager office | 250 | t_office | office |
| Cashier cat | 260 | t_hire1 | hire — cashier |
| Table | 150 | t_table3 | table |
| Pizza oven | 240 | t_oven2 | station |
| New dining hall | 500 | t_expand1 | zone |
| Table | 190 | t_table5 | table4p |
| Trash bin (optional) | 20 | t_table5 | bin |
| Dessert counter | 340 | t_dessert | station |
| Veggie prep table | 320 | t_veggie | station |
| Planter | 60 | t_decor | decor |
| Menu board | 80 | t_decor | decor |
| Big plant | 100 | t_decor | decor |
| Kitchen helper | 520 | t_hire2 | hire — helper |
| Table | 240 | t_table6 | table4p |
| Waiter cat | 600 | t_hire3 | hire — waiter |
| VIP sofa booth | 420 | t_vip | vip |
| Table | 220 | t_table4 | table |
| Bigger kitchen | 720 | t_expand2 | zone |
| Seafood counter | 560 | t_seafood | station |
| Deluxe oven | 820 | t_special | station |
| Pizza oven (optional) | 300 | t_special | station |
| Second floor | 950 | t_upper | zone |
| Table (optional) | 250 | t_ribbon | table |
| Table (optional) | 300 | t_ribbon | table4p |
| Grand opening | 300 | t_ribbon | event |

Player: base speed 2.64 tiles/s (was 3.30, −20%), +0.32000000000000006 per manager SPEED level; carry 4 + 1 per 2 player levels (max +4) + 2 per manager CARRY level.

Secondary ("bonus") objectives rotate under the main task after the tutorial: serve 3 in a row (15), collect 60 coins (10), bake 8 dishes (12), clear 3 plates (10), serve 5 in a row (25). A customer leaving angry resets the streak.

Rebalance notes vs. v3: two new recipes (Vegetarian 10 coins, Seafood 16 coins) raised mid-game income by roughly 25 %, which pushed the v3 run down to 25–31 min. Mid/late purchase prices were raised 15–25 % (e.g. new dining hall 400→500, waiter 500→600, second floor 800→950) to return to a ≈ 37 min bot run. Tutorial prices are unchanged.
