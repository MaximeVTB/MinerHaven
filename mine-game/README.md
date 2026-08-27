# Deep Rubble — Natura Mining

Click a block to mine it instantly, roll against the active Natura layer's ore
table, and collect the result. Sell excess ore for cash, reserve materials for
crafting, upgrade pickaxe patterns, equip luck gear, and pay descent fees to
move through all nine world-one strata. No cooldowns or durability: progression
is about more rolls per action, never faster individual actions.

## Running it

Browsers block ES module `import`s over `file://` for security reasons, so
opening `index.html` directly won't load the scripts. Serve the folder
instead — any of these work:

- VS Code: install the "Live Server" extension, right-click `index.html` →
  "Open with Live Server"
- Node installed: `npx serve .` from this folder, then open the printed URL
- Python installed: `python3 -m http.server`, then visit `localhost:8000`

## Folder structure

```
mine-game/
├── index.html              # shell: HUD, canvas, ore log panel
├── css/
│   └── style.css           # all visual design
└── src/
    ├── main.js             # wires everything together, DOM event listeners
    ├── data/                # pure config — no logic. Add content here only.
    │   ├── ores.js
    │   ├── pickaxes.js
    │   ├── gear.js          # craftable luck equipment
    │   ├── layers.js
    │   └── recipes.js       # tool and gear crafting costs
    ├── core/                # game logic, zero DOM/canvas references
    │   ├── rng.js            # seedable PRNG (mulberry32)
    │   ├── state.js          # state shape + localStorage save/load
    │   └── mining.js         # AoE pattern resolution + ore rolls
    ├── render/
    │   └── gridRenderer.js  # canvas draw, particles, screen shake
    └── ui/
        └── hud.js            # DOM updates: stats, ore log, toasts
```

`core/` never touches the DOM or canvas, so `rollOre()` and `mineBlock()`
can be unit-tested by importing them directly with a fixed seed — no
browser needed.

## Debug mode

Click the **debug** button (top right) to reveal true names/odds for
undiscovered ores in the ore log. From the browser console:

```js
MineGame.forceOre('starcore')   // next successful roll on your next click is a Star Core
MineGame.state                  // inspect live game state
```

## Progression

- **Inventory & Ore Exchange** shows every held ore, its sale price, and its
  count. Prices increase with rarity.
- **Blacksmith** crafts pickaxes from cash plus material reserves. Pickaxes
  unlock 3x3, tunnel, and 5x5 mining patterns.
- **Gear Shop** crafts luck gear. Equipped gear multiplies luck across slots.
- **Layer Descent** contains Stone through Inner Core. Stone is free; each
  deeper trip costs cash and loads its own complete ore pool.
- **Save migration** retains existing saves and maps the old Surface Quarry to
  the Stone Layer while adding wallet and equipment fields.
