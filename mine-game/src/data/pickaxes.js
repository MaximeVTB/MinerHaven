// src/data/pickaxes.js
//
// `pattern` determines which cells around the click get mined.
// Only 'starter' is obtainable in this MVP — the rest exist to prove the
// mining engine (core/mining.js) needs ZERO changes when Phase 2 adds real
// crafting/unlocks. Flip `obtainable` to true once a pickaxe is craftable.

export const PICKAXES = [
  {
    id: 'starter',
    name: 'Starter Pickaxe',
    tier: 1,
    pattern: 'single',
    description: 'Mines exactly 1 block per click. Everyone starts here.',
    canBreakBedrock: false,
    obtainable: true,
  },
  {
    id: 'prospector_3x3',
    name: "Prospector's Pick",
    tier: 2,
    pattern: 'square',
    size: 3,
    description: 'Mines a 3x3 area centered on the clicked block.',
    canBreakBedrock: false,
    obtainable: true,
  },
  {
    id: 'driller',
    name: 'Driller',
    tier: 3,
    pattern: 'tunnel',
    depth: 6,
    description: 'Punches a straight tunnel 6 blocks deep from the click.',
    canBreakBedrock: false,
    obtainable: true,
  },
  {
    id: 'seismic_charge',
    name: 'Seismic Charge Pick',
    tier: 5,
    pattern: 'square',
    size: 5,
    description: 'Detonates a 5x5 blast radius. Loud. Effective.',
    canBreakBedrock: true,
    obtainable: true,
  },
];

export const PICKAXES_BY_ID = Object.fromEntries(PICKAXES.map(p => [p.id, p]));
