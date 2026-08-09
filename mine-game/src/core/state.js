// src/core/state.js
import { mulberry32 } from './rng.js';

const SAVE_KEY = 'minegame_save_v1';
const SAVE_VERSION = 2;
const GRID_W = 14;
const GRID_H = 9;

export function createGrid(w = GRID_W, h = GRID_H) {
  const grid = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) row.push({ broken: false });
    grid.push(row);
  }
  return grid;
}

export function createNewState(seed = Date.now() % 2147483647) {
  return {
    version: SAVE_VERSION,
    seed,
    currentLayerId: 'stone',
    grid: createGrid(),
    currentPickaxeId: 'starter',
    ownedPickaxeIds: ['starter'],
    ownedGearIds: [],
    equippedGearBySlot: {},
    luckMultiplier: 1,
    money: 0,
    inventory: {},
    discovered: {},
    blocksMinedSession: 0,
    blocksMinedLifetime: 0,
    pinnedOreId: null,
    pinnedRollsSession: 0,
    autoMiningEnabled: false,
    debugMode: false,
  };
}

// The rng function itself is never serialized — it gets rebuilt from `seed`
// on load, so save files stay small, human-readable JSON.
export function attachRng(state) {
  state.rng = mulberry32(state.seed);
  return state;
}

export function saveState(state) {
  const { rng, ...serializable } = state;
  localStorage.setItem(SAVE_KEY, JSON.stringify(serializable));
}

export function loadState() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return attachRng(normalizeState(parsed));
  } catch (e) {
    console.warn('Corrupt save, starting fresh.', e);
    return null;
  }
}

export function exportStateJSON(state) {
  const { rng, ...serializable } = state;
  return JSON.stringify(serializable, null, 2);
}

export function importStateJSON(json) {
  const parsed = JSON.parse(json);
  return attachRng(normalizeState(parsed));
}

function normalizeState(state) {
  const defaults = createNewState(state.seed);
  const normalized = { ...defaults, ...state };
  normalized.version = SAVE_VERSION;
  normalized.currentLayerId = state.currentLayerId === 'surface' ? 'stone' : state.currentLayerId || 'stone';
  normalized.ownedPickaxeIds = Array.from(new Set(state.ownedPickaxeIds || [normalized.currentPickaxeId || 'starter']));
  if (!normalized.ownedPickaxeIds.includes('starter')) normalized.ownedPickaxeIds.unshift('starter');
  normalized.ownedGearIds = Array.from(new Set(state.ownedGearIds || []));
  normalized.equippedGearBySlot = state.equippedGearBySlot || {};
  normalized.money = Number.isFinite(state.money) ? Math.max(0, state.money) : 0;
  normalized.inventory = state.inventory || {};
  normalized.discovered = state.discovered || {};
  normalized.autoMiningEnabled = Boolean(state.autoMiningEnabled);
  return normalized;
}
