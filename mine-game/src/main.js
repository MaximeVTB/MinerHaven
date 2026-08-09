// src/main.js
import { createNewState, attachRng, loadState, saveState, exportStateJSON, importStateJSON } from './core/state.js';
import { mineBlock } from './core/mining.js';
import { craftRecipe, equipGear, equipPickaxe, sellOre, switchLayer } from './core/progression.js';
import { LAYERS, LAYERS_BY_ID } from './data/layers.js';
import { renderGrid, pixelToCell, gridToPixel, spawnParticles, triggerShake } from './render/gridRenderer.js';
import { updateHud, renderOreLog, renderWorkshop, pushMessage, pushToast } from './ui/hud.js';

let state = loadState() || attachRng(createNewState());
let layer = LAYERS_BY_ID[state.currentLayerId];
let activePanel = null;
let oreLogLayerId = state.currentLayerId;
const AUTO_MINING_INTERVAL_MS = 6000;
let autoMiningTimer = null;

const canvas = document.getElementById('mine-canvas');
const ctx = canvas.getContext('2d');

function sizeCanvasToGrid() {
  const { width, height } = gridToPixel(state.grid[0].length, state.grid.length);
  canvas.width = width;
  canvas.height = height;
}
sizeCanvasToGrid();

function resolveMining(x, y, automated = false) {
  if (!automated && state.autoMiningEnabled) scheduleAutoMining();
  const results = mineBlock(state, x, y, automated ? 'starter' : undefined);
  if (results.length) {
    triggerShake(results.length);
    for (const r of results) {
      spawnParticles(r.x, r.y, r.ore.color, r.ore.rarity === 'common' ? 6 : 16);
      if (!automated || r.firstFind) pushToast(r.ore, r.firstFind);
    }
  }
  updateHud(state);
  renderOreLog(state, oreLogLayerId);
  saveState(state);
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const canvasX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const canvasY = (e.clientY - rect.top) * (canvas.height / rect.height);
  const { x, y } = pixelToCell(canvasX, canvasY);
  if (y < 0 || y >= state.grid.length || x < 0 || x >= state.grid[0].length) return;
  resolveMining(x, y);
});

function mineNextAutoCell() {
  if (!state.autoMiningEnabled) return;
  for (let y = 0; y < state.grid.length; y++) {
    for (let x = 0; x < state.grid[y].length; x++) {
      if (!state.grid[y][x].broken) {
        resolveMining(x, y, true);
        return;
      }
    }
  }
}

function scheduleAutoMining() {
  clearTimeout(autoMiningTimer);
  if (!state.autoMiningEnabled) return;
  autoMiningTimer = setTimeout(() => {
    mineNextAutoCell();
    scheduleAutoMining();
  }, AUTO_MINING_INTERVAL_MS);
}

document.getElementById('debug-toggle').addEventListener('click', () => {
  state.debugMode = !state.debugMode;
  document.body.classList.toggle('debug-on', state.debugMode);
  renderOreLog(state, oreLogLayerId);
});

function navigateOreLog(direction) {
  const currentIndex = LAYERS.findIndex((entry) => entry.id === oreLogLayerId);
  const nextIndex = (currentIndex + direction + LAYERS.length) % LAYERS.length;
  oreLogLayerId = LAYERS[nextIndex].id;
  renderOreLog(state, oreLogLayerId);
}

document.getElementById('ore-log-prev').addEventListener('click', () => navigateOreLog(-1));
document.getElementById('ore-log-next').addEventListener('click', () => navigateOreLog(1));

const atlasDialog = document.getElementById('atlas-dialog');
document.getElementById('atlas-open').addEventListener('click', () => atlasDialog.showModal());
document.getElementById('atlas-close').addEventListener('click', () => atlasDialog.close());
atlasDialog.addEventListener('click', (event) => {
  if (event.target === atlasDialog) atlasDialog.close();
});

const workshopDialog = document.getElementById('workshop-dialog');

document.querySelectorAll('[data-panel]').forEach((button) => {
  button.addEventListener('click', () => {
    activePanel = button.dataset.panel;
    renderWorkshop(state, activePanel);
    workshopDialog.showModal();
  });
});

document.getElementById('workshop-close').addEventListener('click', () => workshopDialog.close());

workshopDialog.addEventListener('click', (event) => {
  if (event.target === workshopDialog) workshopDialog.close();
});

document.getElementById('workshop-content').addEventListener('click', (event) => {
  const panelButton = event.target.closest('[data-panel]');
  if (panelButton) {
    activePanel = panelButton.dataset.panel;
    renderWorkshop(state, activePanel);
    return;
  }
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const { action, id } = button.dataset;
  if (action === 'export-save') {
    const saveIo = document.getElementById('save-io');
    saveIo.value = exportStateJSON(state);
    saveIo.select();
    return;
  }
  if (action === 'import-save') {
    const saveIo = document.getElementById('save-io');
    try {
      state = importStateJSON(saveIo.value);
      layer = LAYERS_BY_ID[state.currentLayerId];
      oreLogLayerId = state.currentLayerId;
      sizeCanvasToGrid();
      updateHud(state);
      renderOreLog(state, oreLogLayerId);
      renderWorkshop(state, activePanel);
      saveState(state);
      scheduleAutoMining();
      pushMessage('Save imported.');
    } catch (error) {
      pushMessage('That save data is not valid JSON.', 'var(--danger)');
    }
    return;
  }
  if (action === 'reset-game') {
    if (!confirm('Reset all progress? This cannot be undone.')) return;
    state = attachRng(createNewState());
    layer = LAYERS_BY_ID[state.currentLayerId];
    oreLogLayerId = state.currentLayerId;
    saveState(state);
    updateHud(state);
    renderOreLog(state, oreLogLayerId);
    renderWorkshop(state, activePanel);
    scheduleAutoMining();
    pushMessage('Progress reset.');
    return;
  }
  if (action === 'toggle-auto') {
    state.autoMiningEnabled = !state.autoMiningEnabled;
    updateHud(state);
    renderWorkshop(state, activePanel);
    saveState(state);
    scheduleAutoMining();
    pushMessage(state.autoMiningEnabled ? 'Auto Miner online: 1 single block every 6 seconds.' : 'Auto Miner offline.');
    return;
  }
  let result;
  if (action === 'craft') result = craftRecipe(state, id);
  if (action === 'sell-one') result = sellOre(state, id, 1);
  if (action === 'sell-all') result = sellOre(state, id, state.inventory[id]);
  if (action === 'equip-pickaxe') result = equipPickaxe(state, id);
  if (action === 'equip-gear') result = equipGear(state, id);
  if (action === 'switch-layer') {
    result = switchLayer(state, id);
    if (result.ok) {
      layer = LAYERS_BY_ID[state.currentLayerId];
      oreLogLayerId = state.currentLayerId;
    }
  }
  if (!result) return;
  pushMessage(result.earned ? `${result.message} +$${result.earned.toLocaleString()}` : result.message, result.ok ? 'var(--mineral)' : 'var(--danger)');
  updateHud(state);
  renderOreLog(state, oreLogLayerId);
  renderWorkshop(state, activePanel);
  saveState(state);
});

// Debug helper reachable from the browser console:
//   MineGame.forceOre('starcore')  -> next successful roll is a Star Core
window.MineGame = {
  get state() { return state; },
  forceOre(id) { state._forcedOreId = id; },
};

function loop() {
  renderGrid(ctx, state, layer);
  requestAnimationFrame(loop);
}

updateHud(state);
renderOreLog(state, oreLogLayerId);
scheduleAutoMining();
loop();
