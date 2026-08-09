export const RECIPES = [
  { id: 'craft_prospector_3x3', resultType: 'pickaxe', resultId: 'prospector_3x3', moneyCost: 300, cost: { stone: 30, copper: 18, iron: 8 } },
  { id: 'craft_driller', resultType: 'pickaxe', resultId: 'driller', moneyCost: 2500, cost: { iron: 35, cobalt: 12, silver: 8, uranium: 2 } },
  { id: 'craft_seismic_charge', resultType: 'pickaxe', resultId: 'seismic_charge', moneyCost: 15000, cost: { obsidian: 30, gold: 15, black_diamond: 5, core_fragment: 3 } },
  { id: 'craft_lucky_charm', resultType: 'gear', resultId: 'lucky_charm', moneyCost: 450, cost: { quartz: 25, agate: 10, amber: 8 } },
  { id: 'craft_prospectors_lens', resultType: 'gear', resultId: 'prospectors_lens', moneyCost: 3500, cost: { emerald: 8, tanzanite: 5, silver: 15 } },
  { id: 'craft_miners_lamp', resultType: 'gear', resultId: 'miners_lamp', moneyCost: 8000, cost: { gold: 15, iridium: 5, sunstone: 6 } },
];

export const RECIPES_BY_ID = Object.fromEntries(RECIPES.map((recipe) => [recipe.id, recipe]));