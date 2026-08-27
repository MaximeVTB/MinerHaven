import { ORE_IDS_BY_LAYER } from './ores.js';

export const LAYERS = [
  { id: 'stone', name: 'Stone Layer', depthRange: [0, 999], travelCost: 0, theme: { rock: '#4a4d52', rockDeep: '#23252a', vein: '#adb5bd' } },
  { id: 'basalt', name: 'Basalt Layer', depthRange: [1000, 1999], travelCost: 250, theme: { rock: '#363b42', rockDeep: '#191c22', vein: '#65a5d0' } },
  { id: 'granite', name: 'Granite Layer', depthRange: [2000, 2999], travelCost: 900, theme: { rock: '#665b58', rockDeep: '#302a2a', vein: '#7bbc70' } },
  { id: 'diorite', name: 'Diorite Layer', depthRange: [3000, 3999], travelCost: 2400, theme: { rock: '#a19c90', rockDeep: '#4f4d48', vein: '#d9e0e8' } },
  { id: 'obsidian', name: 'Obsidian Layer', depthRange: [4000, 4999], travelCost: 5200, theme: { rock: '#302647', rockDeep: '#171222', vein: '#bb70db' } },
  { id: 'marble', name: 'Marble Layer', depthRange: [5000, 5999], travelCost: 10000, theme: { rock: '#b5a6a2', rockDeep: '#584c4d', vein: '#f3c4b9' } },
  { id: 'mantle', name: 'Mantle Layer', depthRange: [6000, 6999], travelCost: 18000, theme: { rock: '#873d2d', rockDeep: '#3b1a19', vein: '#f2a24c' } },
  { id: 'outer_core', name: 'Outer Core', depthRange: [7000, 7499], travelCost: 30000, theme: { rock: '#9c351d', rockDeep: '#46130e', vein: '#ffca55' } },
  { id: 'inner_core', name: 'Inner Core', depthRange: [7500, 7999], travelCost: 48000, theme: { rock: '#b92e20', rockDeep: '#530c09', vein: '#fff0a1' } },
].map((layer) => ({ ...layer, oreIds: ORE_IDS_BY_LAYER[layer.id], unlockCondition: null }));

export const LAYERS_BY_ID = Object.fromEntries(LAYERS.map((layer) => [layer.id, layer]));