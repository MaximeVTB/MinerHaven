// src/ui/hud.js
import { ORES, ORES_BY_ID } from '../data/ores.js';
import { GEAR } from '../data/gear.js?v=20260827-9';
import { LAYERS, LAYERS_BY_ID } from '../data/layers.js';
import { PICKAXES, PICKAXES_BY_ID } from '../data/pickaxes.js?v=20260827-9';
import { RECIPES } from '../data/recipes.js';
import { getRecipeStatus } from '../core/progression.js';
import { getAutoMiningIntervalSeconds } from '../core/state.js';

export function updateHud(state) {
  const pickaxe = PICKAXES_BY_ID[state.currentPickaxeId];
  document.getElementById('hud-pickaxe').textContent = pickaxe.name;
  document.getElementById('hud-pattern').textContent = pickaxe.description;
  document.getElementById('hud-money').textContent = `$${state.money.toLocaleString()}`;
  const layer = LAYERS_BY_ID[state.currentLayerId];
  document.getElementById('hud-layer').textContent = layer.name;
  document.getElementById('hud-depth').textContent = `${layer.depthRange[0].toLocaleString()}m - ${layer.depthRange[1].toLocaleString()}m`;
  document.getElementById('stage-layer').textContent = layer.name;
  document.getElementById('stage-pickaxe').textContent = pickaxe.name;
  document.getElementById('stage-pattern').textContent = pickaxe.abilities?.length ? `1 block strike · ${pickaxe.abilities.length} proc${pickaxe.abilities.length === 1 ? '' : 's'}` : '1 block strike';
  document.getElementById('hud-luck').textContent = `x${state.luckMultiplier.toFixed(2)}`;
  document.getElementById('hud-session').textContent = state.blocksMinedSession.toLocaleString();
  document.getElementById('hud-lifetime').textContent = state.blocksMinedLifetime.toLocaleString();
  document.getElementById('hud-auto').textContent = state.autoMiningEnabled ? `ON · 1 block / ${getAutoMiningIntervalSeconds(state).toFixed(1)}s` : 'OFF';
}

export function renderOreLog(state, viewedLayerId = state.currentLayerId) {
  const list = document.getElementById('ore-log');
  list.innerHTML = '';
  const layer = LAYERS_BY_ID[viewedLayerId] || LAYERS_BY_ID[state.currentLayerId];
  const layerOres = layer.oreIds.map((oreId) => ORES_BY_ID[oreId]);
  const discoveredCount = layerOres.filter((ore) => state.discovered[ore.id]).length;
  document.getElementById('ore-log-layer').textContent = layer.name;
  document.getElementById('ore-log-depth').textContent = `${layer.depthRange[0].toLocaleString()}m - ${layer.depthRange[1].toLocaleString()}m`;
  document.getElementById('ore-log-progress').textContent = `${discoveredCount}/${layerOres.length}`;

  for (const ore of layerOres) {
    const found = !!state.discovered[ore.id];
    const owned = state.inventory[ore.id] || 0;
    const row = document.createElement('div');
    row.className = 'ore-row' + (found ? '' : ' ore-row--unknown') + (layer.id === state.currentLayerId ? ' ore-row--active-layer' : '');
    row.style.setProperty('--ore-color', ore.color);
    row.innerHTML = `
      <span class="ore-swatch"></span>
      <span class="ore-name">${found || state.debugMode ? ore.name : '???'}</span>
      <span class="ore-odds mono">1 in ${ore.oddsOneIn.toLocaleString()}</span>
      <span class="ore-owned mono">${owned}</span>
    `;
    list.appendChild(row);
  }
}

export function pushToast(ore, firstFind) {
  const feed = document.getElementById('toast-feed');
  const toast = document.createElement('div');
  toast.className = 'toast' + (ore.rarity === 'common' ? ' toast--quiet' : '');
  toast.style.setProperty('--ore-color', ore.color);
  toast.innerHTML = `
    <strong>${firstFind ? 'First discovery — ' : ''}${ore.name}</strong>
    <span class="mono">1 in ${ore.oddsOneIn.toLocaleString()}</span>
  `;
  feed.prepend(toast);
  setTimeout(() => toast.classList.add('toast--out'), 3200);
  setTimeout(() => toast.remove(), 3700);
  while (feed.children.length > 6) feed.removeChild(feed.lastChild);
}

export function pushMessage(message, tone = 'var(--mineral)') {
  const feed = document.getElementById('toast-feed');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.setProperty('--ore-color', tone);
  toast.innerHTML = `<strong>${message}</strong>`;
  feed.prepend(toast);
  setTimeout(() => toast.classList.add('toast--out'), 2600);
  setTimeout(() => toast.remove(), 3100);
}

function costText(recipe, state) {
  const materials = Object.entries(recipe.cost)
    .map(([oreId, amount]) => `${ORES.find((ore) => ore.id === oreId).name} ${state.inventory[oreId] || 0}/${amount}`)
    .join(' · ');
  return `$${recipe.moneyCost.toLocaleString()} · ${materials}`;
}

function itemTitle(item) {
  return `<strong>${item.name} <b class="tier-badge">tier ${item.tier}</b></strong>`;
}

function procText(item) {
  if (!item.abilities?.length) return '';
  return `<small class="mono">${item.abilities.map((ability) => `${ability.name}: 1 in ${Math.round(1 / ability.procChance)}`).join(' · ')}</small>`;
}

function recipeHelp(recipe) {
  const materials = Object.entries(recipe.cost).map(([oreId, amount]) => {
    const ore = ORES_BY_ID[oreId];
    const locations = LAYERS.filter((layer) => layer.oreIds.includes(oreId)).map((layer) => layer.name).join(' · ');
    return `<li><strong>${ore.name} x${amount}</strong><span>${locations || 'No known layer'}</span></li>`;
  }).join('');
  return `<section id="recipe-help-${recipe.id}" class="recipe-help" hidden>
    <span class="label">material locations</span>
    <ul>${materials}</ul>
  </section>`;
}

function recipeActions(recipe, buttonText, disabled) {
  return `<div class="recipe-actions">
    <button class="recipe-help-button" data-action="toggle-recipe-help" data-id="${recipe.id}" aria-label="Show material locations for this recipe" aria-expanded="false" title="Material locations">?</button>
    <button class="btn" data-action="craft" data-id="${recipe.id}" ${disabled ? 'disabled' : ''}>${buttonText}</button>
  </div>`;
}

function recipeRows(state, resultType) {
  return RECIPES.filter((recipe) => recipe.resultType === resultType).map((recipe) => {
    const result = resultType === 'pickaxe'
      ? PICKAXES_BY_ID[recipe.resultId]
      : GEAR.find((gear) => gear.id === recipe.resultId);
    const owned = (resultType === 'pickaxe' ? state.ownedPickaxeIds : state.ownedGearIds).includes(recipe.resultId);
    const { canCraft } = getRecipeStatus(state, recipe);
    return `<article class="operation-row recipe-row">
      <div>${itemTitle(result)}<span>${result.description}</span>${procText(result)}<small class="mono">${costText(recipe, state)}</small></div>
      ${recipeActions(recipe, owned ? 'crafted' : 'craft', owned || !canCraft)}
      ${recipeHelp(recipe)}</article>`;
  }).join('');
}

function autoMiningSpeedRecipeRow(state) {
  const nextRecipe = RECIPES.find((recipe) => recipe.resultType === 'autoMiningSpeed'
    && recipe.upgradeLevel === state.autoMiningSpeedUpgradeLevel + 1);
  const currentInterval = getAutoMiningIntervalSeconds(state).toFixed(1);
  if (!nextRecipe) {
    return `<article class="operation-row"><div><strong>Auto-Miner Calibration</strong><span>Maximum unattended mining speed reached.</span><small class="mono">1.0 seconds per block</small></div><button class="btn" disabled>maxed</button></article>`;
  }
  const { canCraft } = getRecipeStatus(state, nextRecipe);
  return `<article class="operation-row recipe-row">
    <div><strong>Auto-Miner Calibration ${nextRecipe.upgradeLevel}</strong><span>Reduce the mining interval from ${currentInterval}s to ${nextRecipe.intervalSeconds.toFixed(1)}s.</span><small class="mono">${costText(nextRecipe, state)}</small></div>
    ${recipeActions(nextRecipe, 'craft', !canCraft)}
    ${recipeHelp(nextRecipe)}</article>`;
}

export function renderWorkshop(state, panel) {
  const title = document.getElementById('workshop-title');
  const content = document.getElementById('workshop-content');
  const labels = { operations: 'Operations', blacksmith: 'Blacksmith', gear: 'Gear Shop', autoMiner: 'Auto Miner', inventory: 'Inventory & Ore Exchange', loadout: 'Loadout', layers: 'Layer Descent' };
  title.textContent = labels[panel];
  const menuBack = panel === 'operations' ? '' : '<button class="panel-back" data-panel="operations">&larr; all operations</button>';

  if (panel === 'operations') {
    content.innerHTML = `<p class="panel-intro">Choose a station to manage your expedition.</p>
      <div class="operation-menu-grid">
        <button class="operation-tile" data-panel="blacksmith"><small>Forge</small><strong>Blacksmith</strong><span>Craft stronger pickaxes.</span></button>
        <button class="operation-tile" data-panel="gear"><small>Outfit</small><strong>Gear Shop</strong><span>Build luck equipment.</span></button>
        <button class="operation-tile" data-panel="inventory"><small>Exchange</small><strong>Inventory</strong><span>Sell ore and inspect reserves.</span></button>
        <button class="operation-tile" data-panel="loadout"><small>Rig</small><strong>Loadout</strong><span>Equip your tools and gear.</span></button>
        <button class="operation-tile" data-panel="layers"><small>Descent</small><strong>Layers</strong><span>Pay for deeper quarry access.</span></button>
        <button class="operation-tile operation-tile--auto" data-panel="autoMiner"><small>Background</small><strong>Auto Miner</strong><span>${state.autoMiningEnabled ? `Online: one single block every ${getAutoMiningIntervalSeconds(state).toFixed(1)} seconds.` : 'Offline: slow, single-block unattended mining.'}</span><b>manage</b></button>
      </div>
      <section class="save-station">
        <span class="label">save station</span>
        <div class="save-actions"><button class="btn btn--ghost" data-action="export-save">export save</button><button class="btn btn--ghost" data-action="import-save">import save</button><button class="btn btn--danger" data-action="reset-game">reset</button></div>
        <textarea id="save-io" placeholder="paste save JSON here, or export your current save"></textarea>
      </section>`;
    return;
  }

  if (panel === 'blacksmith') {
    content.innerHTML = `${menuBack}<p class="panel-intro">Forge tools with ore reserves and cash.</p>${recipeRows(state, 'pickaxe')}`;
    return;
  }
  if (panel === 'gear') {
    content.innerHTML = `${menuBack}<p class="panel-intro">Craft passive equipment, then equip it from your loadout.</p>${recipeRows(state, 'gear')}`;
    return;
  }
  if (panel === 'autoMiner') {
    const interval = getAutoMiningIntervalSeconds(state).toFixed(1);
    content.innerHTML = `${menuBack}<p class="panel-intro">Mine one single block every ${interval} seconds while the Auto Miner is online.</p>
      ${autoMiningSpeedRecipeRow(state)}
      <div class="panel-actions"><button class="btn" data-action="toggle-auto">${state.autoMiningEnabled ? 'turn off' : 'turn on'}</button></div>`;
    return;
  }
  if (panel === 'inventory') {
    const ownedOres = ORES.filter((ore) => (state.inventory[ore.id] || 0) > 0);
    content.innerHTML = `${menuBack}<p class="panel-intro">Ore is both a crafting reserve and a commodity. Prices follow rarity.</p>
      <div class="inventory-summary"><span>${ownedOres.length} material types</span><span class="mono">$${state.money.toLocaleString()} on hand</span></div>
      <div class="inventory-list">${ownedOres.length ? ownedOres.map((ore) => `<article class="operation-row ore-inventory" style="--ore-color: ${ore.color}">
        <div><strong><i class="ore-swatch"></i>${ore.name} <b class="mono">x${state.inventory[ore.id]}</b></strong><span>${ore.rarity} · $${ore.value.toLocaleString()} each</span></div>
        <div class="row-actions"><button class="btn btn--ghost" data-action="sell-one" data-id="${ore.id}">sell 1</button><button class="btn" data-action="sell-all" data-id="${ore.id}">sell all</button></div>
      </article>`).join('') : '<p class="empty-state">Mine blocks to build your ore reserve.</p>'}</div>`;
    return;
  }
  if (panel === 'loadout') {
    const pickaxes = PICKAXES.filter((pickaxe) => state.ownedPickaxeIds.includes(pickaxe.id));
    const gear = GEAR.filter((item) => state.ownedGearIds.includes(item.id));
    const equippedGearByArm = state.equippedGearByArm || { left: null, right: null };
    const leftGear = GEAR.find((item) => item.id === equippedGearByArm.left);
    const rightGear = GEAR.find((item) => item.id === equippedGearByArm.right);
    content.innerHTML = `${menuBack}<p class="panel-intro">Every pickaxe strikes one block, then rolls its listed proc abilities. Equip at most one gear item on each arm.</p>
      <h3>Pickaxes</h3>${pickaxes.map((pickaxe) => `<article class="operation-row"><div>${itemTitle(pickaxe)}<span>${pickaxe.description}</span>${procText(pickaxe)}</div><button class="btn" data-action="equip-pickaxe" data-id="${pickaxe.id}" ${state.currentPickaxeId === pickaxe.id ? 'disabled' : ''}>${state.currentPickaxeId === pickaxe.id ? 'equipped' : 'equip'}</button></article>`).join('')}
      <h3>Arms</h3><p class="panel-intro">Left: ${leftGear?.name || 'empty'} · Right: ${rightGear?.name || 'empty'}</p>
      <h3>Gear</h3>${gear.length ? gear.map((item) => { const equippedArm = Object.entries(equippedGearByArm).find(([, gearId]) => gearId === item.id)?.[0]; return `<article class="operation-row"><div>${itemTitle(item)}<span>${item.description}</span><small>${item.category} gear · ${equippedArm ? `${equippedArm} arm` : 'not equipped'}</small></div><button class="btn ${equippedArm ? 'btn--ghost' : ''}" data-action="${equippedArm ? 'unequip-gear' : 'equip-gear'}" data-id="${item.id}">${equippedArm ? 'unequip' : 'equip'}</button></article>`; }).join('') : '<p class="empty-state">Craft gear at the Gear Shop.</p>'}`;
    return;
  }
  content.innerHTML = `${menuBack}<p class="panel-intro">Descent fees are paid per trip. The Stone Layer is always free.</p>${LAYERS.map((layer) => `<article class="operation-row"><div><strong>${layer.name}</strong><span class="mono">${layer.depthRange[0].toLocaleString()}m - ${layer.depthRange[1].toLocaleString()}m</span><small>${layer.oreIds.length} ores · ${layer.travelCost ? `$${layer.travelCost.toLocaleString()} descent` : 'free descent'}</small></div><button class="btn" data-action="switch-layer" data-id="${layer.id}" ${state.currentLayerId === layer.id || state.money < layer.travelCost ? 'disabled' : ''}>${state.currentLayerId === layer.id ? 'mining' : 'descend'}</button></article>`).join('')}`;
}
