// src/ui/hud.js
import { ORES, ORES_BY_ID } from '../data/ores.js';
import { GEAR } from '../data/gear.js';
import { LAYERS, LAYERS_BY_ID } from '../data/layers.js';
import { PICKAXES, PICKAXES_BY_ID } from '../data/pickaxes.js';
import { RECIPES } from '../data/recipes.js';
import { getRecipeStatus } from '../core/progression.js';

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
  document.getElementById('stage-pattern').textContent = pickaxe.pattern === 'single' ? '1 block strike' : pickaxe.pattern === 'tunnel' ? `${pickaxe.depth} block tunnel` : `${pickaxe.size}x${pickaxe.size} strike`;
  document.getElementById('hud-luck').textContent = `x${state.luckMultiplier.toFixed(2)}`;
  document.getElementById('hud-session').textContent = state.blocksMinedSession.toLocaleString();
  document.getElementById('hud-lifetime').textContent = state.blocksMinedLifetime.toLocaleString();
  document.getElementById('hud-auto').textContent = state.autoMiningEnabled ? 'ON · 1 block / 6s' : 'OFF';
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

function recipeRows(state, resultType) {
  return RECIPES.filter((recipe) => recipe.resultType === resultType).map((recipe) => {
    const result = resultType === 'pickaxe'
      ? PICKAXES_BY_ID[recipe.resultId]
      : GEAR.find((gear) => gear.id === recipe.resultId);
    const owned = (resultType === 'pickaxe' ? state.ownedPickaxeIds : state.ownedGearIds).includes(recipe.resultId);
    const { canCraft } = getRecipeStatus(state, recipe);
    return `<article class="operation-row">
      <div><strong>${result.name}</strong><span>${result.description}</span><small class="mono">${costText(recipe, state)}</small></div>
      <button class="btn" data-action="craft" data-id="${recipe.id}" ${owned || !canCraft ? 'disabled' : ''}>${owned ? 'crafted' : 'craft'}</button>
    </article>`;
  }).join('');
}

export function renderWorkshop(state, panel) {
  const title = document.getElementById('workshop-title');
  const content = document.getElementById('workshop-content');
  const labels = { operations: 'Operations', blacksmith: 'Blacksmith', gear: 'Gear Shop', inventory: 'Inventory & Ore Exchange', loadout: 'Loadout', layers: 'Layer Descent' };
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
        <button class="operation-tile operation-tile--auto" data-action="toggle-auto"><small>Background</small><strong>Auto Miner</strong><span>${state.autoMiningEnabled ? 'Online: one single block every 6 seconds.' : 'Offline: slow, single-block unattended mining.'}</span><b>${state.autoMiningEnabled ? 'turn off' : 'turn on'}</b></button>
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
    content.innerHTML = `${menuBack}<p class="panel-intro">Your active tool controls the mining pattern. Gear stacks across different slots.</p>
      <h3>Pickaxes</h3>${pickaxes.map((pickaxe) => `<article class="operation-row"><div><strong>${pickaxe.name}</strong><span>${pickaxe.description}</span></div><button class="btn" data-action="equip-pickaxe" data-id="${pickaxe.id}" ${state.currentPickaxeId === pickaxe.id ? 'disabled' : ''}>${state.currentPickaxeId === pickaxe.id ? 'equipped' : 'equip'}</button></article>`).join('')}
      <h3>Gear</h3>${gear.length ? gear.map((item) => `<article class="operation-row"><div><strong>${item.name}</strong><span>${item.description}</span><small>${item.slot} slot</small></div><button class="btn" data-action="equip-gear" data-id="${item.id}" ${state.equippedGearBySlot[item.slot] === item.id ? 'disabled' : ''}>${state.equippedGearBySlot[item.slot] === item.id ? 'equipped' : 'equip'}</button></article>`).join('') : '<p class="empty-state">Craft gear at the Gear Shop.</p>'}`;
    return;
  }
  content.innerHTML = `${menuBack}<p class="panel-intro">Descent fees are paid per trip. The Stone Layer is always free.</p>${LAYERS.map((layer) => `<article class="operation-row"><div><strong>${layer.name}</strong><span class="mono">${layer.depthRange[0].toLocaleString()}m - ${layer.depthRange[1].toLocaleString()}m</span><small>${layer.oreIds.length} ores · ${layer.travelCost ? `$${layer.travelCost.toLocaleString()} descent` : 'free descent'}</small></div><button class="btn" data-action="switch-layer" data-id="${layer.id}" ${state.currentLayerId === layer.id || state.money < layer.travelCost ? 'disabled' : ''}>${state.currentLayerId === layer.id ? 'mining' : 'descend'}</button></article>`).join('')}`;
}
