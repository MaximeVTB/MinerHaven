// src/core/mining.js
import { ORES_BY_ID } from '../data/ores.js';
import { PICKAXES_BY_ID } from '../data/pickaxes.js';
import { LAYERS_BY_ID } from '../data/layers.js';

function inBounds(grid, x, y) {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
}

// Cells affected by a pickaxe's pattern, centered on (cx, cy).
// This is the whole "more blocks per action, not a faster action" idea —
// every pattern still resolves in one click.
export function getAffectedCells(pickaxe, cx, cy, grid) {
  const cells = [];
  if (pickaxe.pattern === 'single') {
    cells.push([cx, cy]);
  } else if (pickaxe.pattern === 'square') {
    const r = Math.floor(pickaxe.size / 2);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) cells.push([cx + dx, cy + dy]);
    }
  } else if (pickaxe.pattern === 'tunnel') {
    for (let i = 0; i < pickaxe.depth; i++) cells.push([cx, cy + i]);
  } else {
    cells.push([cx, cy]);
  }
  return cells.filter(([x, y]) => inBounds(grid, x, y));
}

// Independent-probability roll, rarest ore checked first. Rubble sits last
// with oddsOneIn: 1, so it always succeeds if nothing rarer hit — every
// block guarantees *something*, but never crowds out a rare result.
export function rollOre(state, layer) {
  const luck = state.luckMultiplier || 1;
  const pool = layer.oreIds
    .map((id) => ORES_BY_ID[id])
    .sort((a, b) => b.oddsOneIn - a.oddsOneIn);

  if (state.debugMode && state._forcedOreId) {
    const forced = ORES_BY_ID[state._forcedOreId];
    state._forcedOreId = null;
    return forced;
  }

  for (const ore of pool) {
    const chance = Math.min(1, (1 / ore.oddsOneIn) * luck);
    if (state.rng() < chance) return ore;
  }
  return null; // only reachable if a layer's pool is missing a guaranteed filler ore
}

export function mineBlock(state, cx, cy, pickaxeId = state.currentPickaxeId) {
  const layer = LAYERS_BY_ID[state.currentLayerId];
  const pickaxe = PICKAXES_BY_ID[pickaxeId];
  const cells = getAffectedCells(pickaxe, cx, cy, state.grid);
  const results = [];

  for (const [x, y] of cells) {
    const cell = state.grid[y][x];
    if (cell.broken) continue;
    cell.broken = true;
    state.blocksMinedSession++;
    state.blocksMinedLifetime++;

    const ore = rollOre(state, layer);
    if (ore) {
      state.inventory[ore.id] = (state.inventory[ore.id] || 0) + 1;
      const firstFind = !state.discovered[ore.id];
      if (firstFind) state.discovered[ore.id] = Date.now();
      if (state.pinnedOreId) state.pinnedRollsSession++;
      results.push({ x, y, ore, firstFind });
    }
  }

  // Quarry "resets" once fully cleared so play continues indefinitely —
  // stands in for proper re-generation until Phase 3 layers exist.
  if (state.grid.every((row) => row.every((c) => c.broken))) {
    for (const row of state.grid) for (const c of row) c.broken = false;
  }

  return results;
}
