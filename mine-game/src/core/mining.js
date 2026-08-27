// src/core/mining.js
import { ORES_BY_ID } from '../data/ores.js';
import { GEAR_BY_ID } from '../data/gear.js?v=20260827-9';
import { PICKAXES_BY_ID } from '../data/pickaxes.js?v=20260827-9';
import { LAYERS_BY_ID } from '../data/layers.js';

function inBounds(grid, x, y) {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
}

export function getAffectedCells(_pickaxe, cx, cy, grid) {
  return inBounds(grid, cx, cy) ? [[cx, cy]] : [];
}

function getProcCells(ability, cx, cy, grid) {
  const cells = [];
  if (ability.pattern === 'square') {
    const radius = Math.floor(ability.size / 2);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) cells.push([cx + dx, cy + dy]);
    }
  } else if (ability.pattern === 'tunnel') {
    for (let offset = 0; offset < ability.depth; offset++) cells.push([cx, cy + offset]);
  } else if (ability.pattern === 'cross') {
    for (let offset = 1; offset <= ability.radius; offset++) {
      cells.push([cx - offset, cy], [cx + offset, cy], [cx, cy - offset], [cx, cy + offset]);
    }
  }
  return cells.filter(([x, y]) => inBounds(grid, x, y));
}

// Independent-probability roll, rarest ore checked first. Rubble sits last
// with oddsOneIn: 1, so it always succeeds if nothing rarer hit — every
// block guarantees *something*, but never crowds out a rare result.
export function rollOre(state, layer, luckMultiplier = state.luckMultiplier || 1) {
  const pool = layer.oreIds
    .map((id) => ORES_BY_ID[id])
    .sort((a, b) => b.oddsOneIn - a.oddsOneIn);

  if (state.debugMode && state._forcedOreId) {
    const forced = ORES_BY_ID[state._forcedOreId];
    state._forcedOreId = null;
    return forced;
  }

  for (const ore of pool) {
    const chance = Math.min(1, (1 / ore.oddsOneIn) * luckMultiplier);
    if (state.rng() < chance) return ore;
  }
  return null; // only reachable if a layer's pool is missing a guaranteed filler ore
}

function getGearProcCells(state, cx, cy, grid) {
  const cells = [];
  const procs = [];
  for (const gearId of Object.values(state.equippedGearByArm || {})) {
    const gear = GEAR_BY_ID[gearId];
    if (!gear?.procChance || state.rng() >= gear.procChance) continue;
    procs.push(gear.name);
    if (gear.blockEffect === 'adjacent') {
    const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const [dx, dy] = directions[Math.floor(state.rng() * directions.length)];
      cells.push([cx + dx, cy + dy]);
    } else if (gear.blockEffect === 'burst') {
      cells.push(...getProcCells({ pattern: 'square', size: 3 }, cx, cy, grid));
    }
  }
  return { cells: cells.filter(([x, y]) => inBounds(grid, x, y)), procs };
}

export function mineBlock(state, cx, cy, pickaxeId = state.currentPickaxeId, applyProcs = true) {
  const layer = LAYERS_BY_ID[state.currentLayerId];
  const pickaxe = PICKAXES_BY_ID[pickaxeId];
  const pickaxeCells = getAffectedCells(pickaxe, cx, cy, state.grid);
  const cellsByCoordinate = new Map(pickaxeCells.map(([x, y]) => [`${x},${y}`, { x, y, luckMultiplier: 1 }]));
  const procs = [];

  function addProcCells(cells, luckMultiplier = 1) {
    for (const [x, y] of cells) {
      const key = `${x},${y}`;
      if (!cellsByCoordinate.has(key)) cellsByCoordinate.set(key, { x, y, luckMultiplier });
    }
  }

  if (applyProcs) {
    for (const ability of pickaxe.abilities || []) {
      if (state.rng() < ability.procChance) {
        procs.push(ability.name);
        addProcCells(getProcCells(ability, cx, cy, state.grid), ability.luckMultiplier);
      }
    }
    const gearProc = getGearProcCells(state, cx, cy, state.grid);
    addProcCells(gearProc.cells);
    procs.push(...gearProc.procs);
  }

  const results = [];

  for (const { x, y, luckMultiplier } of cellsByCoordinate.values()) {
    const cell = state.grid[y][x];
    if (cell.broken) continue;
    cell.broken = true;
    state.blocksMinedSession++;
    state.blocksMinedLifetime++;

    const ore = rollOre(state, layer, (state.luckMultiplier || 1) * luckMultiplier);
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

  return { results, procs };
}
