// src/data/gear.js
//
// Gear is passive and stacks MULTIPLICATIVELY for luck, never additively —
// this matters a lot once several pieces push toward rare-ore odds.
// Not wired into the UI yet (that's Phase 2), but state.luckMultiplier and
// core/mining.js already consume it correctly, so hooking this up later is
// just a crafting/equip screen — no math to redo.
// Gear is passive and stacks multiplicatively by equipped slot.

export const GEAR = [
  {
    id: 'lucky_charm',
    slot: 'luck',
    name: 'Lucky Charm',
    tier: 1,
    luckMultiplier: 1.25,
    description: '+25% luck, multiplicative.',
    obtainable: true,
  },
  {
    id: 'prospectors_lens',
    slot: 'luck',
    name: "Prospector's Lens",
    tier: 2,
    luckMultiplier: 1.5,
    description: '+50% luck, multiplicative.',
    obtainable: true,
  },
  {
    id: 'miners_lamp',
    slot: 'utility',
    name: "Miner's Lamp",
    tier: 3,
    luckMultiplier: 1.18,
    description: '+18% luck in dark strata.',
    obtainable: true,
  },
  {
    id: 'fortune_band',
    slot: 'luck',
    name: 'Fortune Band',
    tier: 4,
    luckMultiplier: 1.75,
    description: '+75% luck, multiplicative.',
    obtainable: true,
  },
  {
    id: 'celestial_compass',
    slot: 'luck',
    name: 'Celestial Compass',
    tier: 6,
    luckMultiplier: 2.25,
    description: '+125% luck, multiplicative.',
    obtainable: true,
  },
  {
    id: 'seismic_primer',
    slot: 'power',
    name: 'Seismic Primer',
    tier: 4,
    blockEffect: 'adjacent',
    procChance: 0.18,
    description: '18% chance to mine one extra adjacent block per strike.',
    obtainable: true,
  },
  {
    id: 'rift_igniter',
    slot: 'power',
    name: 'Rift Igniter',
    tier: 7,
    blockEffect: 'burst',
    procChance: 0.1,
    description: '10% chance to add a 3x3 burst to each strike.',
    obtainable: true,
  },
];

export const GEAR_BY_ID = Object.fromEntries(GEAR.map(g => [g.id, g]));
