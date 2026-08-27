import { GEAR_BY_ID } from '../data/gear.js?v=20260827-9';
import { LAYERS_BY_ID } from '../data/layers.js';
import { ORES_BY_ID } from '../data/ores.js';
import { PICKAXES_BY_ID } from '../data/pickaxes.js';
import { RECIPES_BY_ID } from '../data/recipes.js';
import { AUTO_MINING_MAX_SPEED_UPGRADES, createGrid, getAutoMiningIntervalSeconds } from './state.js';

export function getRecipeStatus(state, recipe) {
  const missing = Object.entries(recipe.cost).filter(([oreId, amount]) => (state.inventory[oreId] || 0) < amount);
  const isNextAutoMiningUpgrade = recipe.resultType !== 'autoMiningSpeed'
    || recipe.upgradeLevel === state.autoMiningSpeedUpgradeLevel + 1;
  return { canCraft: state.money >= recipe.moneyCost && missing.length === 0 && isNextAutoMiningUpgrade, missing };
}

export function craftRecipe(state, recipeId) {
  const recipe = RECIPES_BY_ID[recipeId];
  if (!recipe) return { ok: false, message: 'Unknown recipe.' };
  if (recipe.resultType === 'autoMiningSpeed') {
    if (state.autoMiningSpeedUpgradeLevel >= AUTO_MINING_MAX_SPEED_UPGRADES) return { ok: false, message: 'Auto Miner is already at maximum speed.' };
    if (recipe.upgradeLevel !== state.autoMiningSpeedUpgradeLevel + 1) return { ok: false, message: 'Craft the next calibration first.' };
  }
  const owned = recipe.resultType === 'pickaxe' ? state.ownedPickaxeIds : state.ownedGearIds;
  if (recipe.resultType !== 'autoMiningSpeed' && owned.includes(recipe.resultId)) return { ok: false, message: 'Already crafted.' };
  const status = getRecipeStatus(state, recipe);
  if (!status.canCraft) return { ok: false, message: 'Missing cash or materials.' };

  state.money -= recipe.moneyCost;
  for (const [oreId, amount] of Object.entries(recipe.cost)) state.inventory[oreId] -= amount;
  if (recipe.resultType === 'autoMiningSpeed') {
    state.autoMiningSpeedUpgradeLevel = recipe.upgradeLevel;
    return { ok: true, message: `Auto Miner calibrated to ${getAutoMiningIntervalSeconds(state).toFixed(1)} seconds.` };
  }
  owned.push(recipe.resultId);
  return { ok: true, message: 'Crafted.' };
}

export function sellOre(state, oreId, amount) {
  const ore = ORES_BY_ID[oreId];
  const available = state.inventory[oreId] || 0;
  const quantity = Math.min(Math.max(0, Math.floor(amount)), available);
  if (!ore || !ore.tradeable || quantity === 0) return { ok: false, message: 'Nothing to sell.' };
  const earned = ore.value * quantity;
  state.inventory[oreId] -= quantity;
  state.money += earned;
  return { ok: true, earned, message: `Sold ${quantity} ${ore.name}.` };
}

export function switchLayer(state, layerId) {
  const layer = LAYERS_BY_ID[layerId];
  if (!layer) return { ok: false, message: 'Unknown layer.' };
  if (state.currentLayerId === layerId) return { ok: false, message: 'Already mining here.' };
  if (state.money < layer.travelCost) return { ok: false, message: 'Not enough money for descent.' };
  state.money -= layer.travelCost;
  state.currentLayerId = layerId;
  state.grid = createGrid();
  return { ok: true, message: `Arrived in ${layer.name}.` };
}

export function equipPickaxe(state, pickaxeId) {
  if (!PICKAXES_BY_ID[pickaxeId] || !state.ownedPickaxeIds.includes(pickaxeId)) return { ok: false, message: 'Pickaxe not owned.' };
  state.currentPickaxeId = pickaxeId;
  return { ok: true, message: 'Pickaxe equipped.' };
}

export function equipGear(state, gearId) {
  const gear = GEAR_BY_ID[gearId];
  if (!gear || !state.ownedGearIds.includes(gearId)) return { ok: false, message: 'Gear not owned.' };
  const equippedGearByArm = state.equippedGearByArm || (state.equippedGearByArm = { left: null, right: null });
  if (Object.values(equippedGearByArm).includes(gearId)) return { ok: false, message: 'That gear is already equipped.' };
  const availableArm = Object.entries(equippedGearByArm).find(([, equippedGearId]) => !equippedGearId)?.[0];
  if (!availableArm) return { ok: false, message: 'Both arms are occupied. Unequip a gear before equipping another.' };
  equippedGearByArm[availableArm] = gearId;
  recalculateLuck(state);
  return { ok: true, message: `${gear.name} equipped on your ${availableArm} arm.` };
}

export function unequipGear(state, gearId) {
  const equippedGearByArm = state.equippedGearByArm || {};
  const equippedArm = Object.entries(equippedGearByArm).find(([, equippedGearId]) => equippedGearId === gearId)?.[0];
  if (!equippedArm) return { ok: false, message: 'That gear is not equipped.' };
  equippedGearByArm[equippedArm] = null;
  recalculateLuck(state);
  return { ok: true, message: `${GEAR_BY_ID[gearId].name} unequipped from your ${equippedArm} arm.` };
}

export function recalculateLuck(state) {
  state.luckMultiplier = Object.values(state.equippedGearByArm || {})
    .map((gearId) => GEAR_BY_ID[gearId])
    .filter(Boolean)
    .reduce((luck, gear) => luck * (gear.luckMultiplier || 1), 1);
}