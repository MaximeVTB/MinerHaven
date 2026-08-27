// src/data/pickaxes.js
// Every pickaxe mines one block normally. Its abilities are independently
// rolled procs, so higher tiers create occasional powerful mining moments.

export const PICKAXES = [
  {
    id: 'starter',
    name: 'Starter Pickaxe',
    tier: 1,
    description: 'Mines exactly 1 block per click. Everyone starts here.',
    canBreakBedrock: false,
    obtainable: true,
  },
  {
    id: 'prospector_3x3',
    name: "Prospector's Pick",
    tier: 2,
    description: '1x1 strike. Survey Pulse can uncover a lucky 3x3 vein.',
    abilities: [
      { name: 'Survey Pulse', procChance: 1 / 6, pattern: 'square', size: 3, luckMultiplier: 1.25 },
    ],
    canBreakBedrock: false,
    obtainable: true,
  },
  {
    id: 'driller',
    name: 'Driller',
    tier: 3,
    description: '1x1 strike. Bore Line can drill a six-block tunnel.',
    abilities: [
      { name: 'Bore Line', procChance: 1 / 8, pattern: 'tunnel', depth: 6 },
    ],
    canBreakBedrock: false,
    obtainable: true,
  },
  {
    id: 'seismic_charge',
    name: 'Seismic Charge Pick',
    tier: 5,
    description: '1x1 strike. Shockwave can detonate a 5x5 blast.',
    abilities: [
      { name: 'Shockwave', procChance: 1 / 16, pattern: 'square', size: 5, luckMultiplier: 1.15 },
    ],
    canBreakBedrock: true,
    obtainable: true,
  },
  {
    id: 'vein_cutter',
    name: 'Vein Cutter',
    tier: 4,
    description: '1x1 strike. Vein Split can carve a ten-block tunnel.',
    abilities: [
      { name: 'Vein Split', procChance: 1 / 10, pattern: 'tunnel', depth: 10, luckMultiplier: 1.2 },
    ],
    canBreakBedrock: false,
    obtainable: true,
  },
  {
    id: 'mantle_auger',
    name: 'Mantle Auger',
    tier: 5,
    description: '1x1 strike. Can proc Deep Drill or a lucky Core Burst.',
    abilities: [
      { name: 'Deep Drill', procChance: 1 / 12, pattern: 'tunnel', depth: 14 },
      { name: 'Core Burst', procChance: 1 / 30, pattern: 'square', size: 3, luckMultiplier: 1.75 },
    ],
    canBreakBedrock: true,
    obtainable: true,
  },
  {
    id: 'rift_hammer',
    name: 'Rift Hammer',
    tier: 6,
    description: '1x1 strike. Rift Break can shatter a 7x7 area.',
    abilities: [
      { name: 'Rift Break', procChance: 1 / 20, pattern: 'square', size: 7, luckMultiplier: 1.35 },
      { name: 'Vein Echo', procChance: 1 / 12, pattern: 'cross', radius: 2 },
    ],
    canBreakBedrock: true,
    obtainable: true,
  },
  {
    id: 'singularity_borer',
    name: 'Singularity Borer',
    tier: 7,
    description: '1x1 strike. Can trigger an 9x9 Implosion or lucky Gravity Well.',
    abilities: [
      { name: 'Implosion', procChance: 1 / 25, pattern: 'square', size: 9, luckMultiplier: 1.5 },
      { name: 'Gravity Well', procChance: 1 / 10, pattern: 'square', size: 3, luckMultiplier: 2 },
    ],
    canBreakBedrock: true,
    obtainable: true,
  },
];

export const PICKAXES_BY_ID = Object.fromEntries(PICKAXES.map(p => [p.id, p]));
