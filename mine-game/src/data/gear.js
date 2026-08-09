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
    luckMultiplier: 1.25,
    description: '+25% luck, multiplicative.',
    obtainable: true,
  },
  {
    id: 'prospectors_lens',
    slot: 'luck',
    name: "Prospector's Lens",
    luckMultiplier: 1.5,
    description: '+50% luck, multiplicative.',
    obtainable: true,
  },
  {
    id: 'miners_lamp',
    slot: 'utility',
    name: "Miner's Lamp",
    luckMultiplier: 1.18,
    description: '+18% luck in dark strata.',
    obtainable: true,
  },
];

export const GEAR_BY_ID = Object.fromEntries(GEAR.map(g => [g.id, g]));
