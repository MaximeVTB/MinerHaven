// src/data/gear.js
//
// A miner may equip up to two gear pieces: one on each arm. Luck effects
// stack multiplicatively; power effects roll separately on a manual strike.

export const GEAR = [
  {
    id: 'lucky_charm',
    category: 'luck',
    name: 'Lucky Charm',
    tier: 1,
    luckMultiplier: 1.25,
    description: '+25% luck, multiplicative.',
    obtainable: true,
  },
  {
    id: 'prospectors_lens',
    category: 'luck',
    name: "Prospector's Lens",
    tier: 2,
    luckMultiplier: 1.5,
    description: '+50% luck, multiplicative.',
    obtainable: true,
  },
  {
    id: 'miners_lamp',
    category: 'luck',
    name: "Miner's Lamp",
    tier: 3,
    luckMultiplier: 1.18,
    description: '+18% luck in dark strata.',
    obtainable: true,
  },
  {
    id: 'fortune_band',
    category: 'luck',
    name: 'Fortune Band',
    tier: 4,
    luckMultiplier: 1.75,
    description: '+75% luck, multiplicative.',
    obtainable: true,
  },
  {
    id: 'celestial_compass',
    category: 'luck',
    name: 'Celestial Compass',
    tier: 6,
    luckMultiplier: 2.25,
    description: '+125% luck, multiplicative.',
    obtainable: true,
  },
  {
    id: 'seismic_primer',
    category: 'power',
    name: 'Seismic Primer',
    tier: 4,
    blockEffect: 'adjacent',
    procChance: 0.18,
    description: '18% chance to mine one extra adjacent block per strike.',
    obtainable: true,
  },
  {
    id: 'rift_igniter',
    category: 'power',
    name: 'Rift Igniter',
    tier: 7,
    blockEffect: 'burst',
    procChance: 0.1,
    description: '10% chance to add a 3x3 burst to each strike.',
    obtainable: true,
  },
];

export const GEAR_BY_ID = Object.fromEntries(GEAR.map(g => [g.id, g]));
