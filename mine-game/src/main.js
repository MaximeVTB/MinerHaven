// src/main.js
import { createNewState, attachRng, getAutoMiningIntervalSeconds, loadState, saveState, exportStateJSON, importStateJSON } from './core/state.js?v=20260827-9';
import { mineBlock } from './core/mining.js?v=20260827-9';
import { craftRecipe, equipGear, equipPickaxe, sellOre, switchLayer, unequipGear } from './core/progression.js?v=20260827-9';
import { LAYERS, LAYERS_BY_ID } from './data/layers.js';
import { renderGrid, pixelToCell, gridToPixel, spawnParticles, triggerShake } from './render/gridRenderer.js';
import { updateHud, renderOreLog, renderWorkshop, pushMessage, pushToast } from './ui/hud.js?v=20260827-13';

let state = loadState() || attachRng(createNewState());
let layer = LAYERS_BY_ID[state.currentLayerId];
let activePanel = 'operations';
let oreLogLayerId = state.currentLayerId;
let autoMiningTimer = null;

const canvas = document.getElementById('mine-canvas');
const ctx = canvas.getContext('2d');
const menuScene = document.getElementById('menu-scene');
const mineScene = document.getElementById('mine-scene');
const sceneLoader = document.getElementById('scene-loader');
const sceneTip = document.getElementById('scene-tip');
const fullscreenMenuButton = document.getElementById('fullscreen-menu');
const SCENE_TIPS = [
  'Power gear can expand a manual strike.',
  'Luck improves every rare-ore roll.',
  'Auto Miner calibration reaches one second per block.',
  'Different gear slots stack their effects.',
];
let sceneTransitioning = false;

function sizeCanvasToGrid() {
  const { width, height } = gridToPixel(state.grid[0].length, state.grid.length);
  canvas.width = width;
  canvas.height = height;
}
sizeCanvasToGrid();

function resolveMining(x, y, automated = false) {
  if (!automated && state.autoMiningEnabled) scheduleAutoMining();
  const { results, procs } = mineBlock(state, x, y, automated ? 'starter' : undefined, !automated);
  if (results.length) {
    triggerShake(results.length);
    for (const r of results) {
      spawnParticles(r.x, r.y, r.ore.color, r.ore.rarity === 'common' ? 6 : 16);
      if (!automated || r.firstFind) pushToast(r.ore, r.firstFind);
    }
  }
  if (procs.length) pushMessage(`Proc: ${procs.join(' + ')}`);
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
  }, getAutoMiningIntervalSeconds(state) * 1000);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function exitFullscreenMode() {
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch (error) {
      console.info('Could not exit fullscreen mode.', error);
    }
  }
}

function updateFullscreenButton() {
  fullscreenMenuButton.textContent = document.fullscreenElement ? 'exit fullscreen' : 'fullscreen';
}

async function toggleMenuFullscreen() {
  if (document.fullscreenElement) {
    await exitFullscreenMode();
    return;
  }
  try {
    await document.documentElement.requestFullscreen();
  } catch (error) {
    console.info('Fullscreen mode is unavailable.', error);
  }
}

async function transitionScene(targetScene) {
  if (sceneTransitioning) return;
  sceneTransitioning = true;
  sceneTip.textContent = SCENE_TIPS[Math.floor(Math.random() * SCENE_TIPS.length)];
  sceneLoader.hidden = false;
  sceneLoader.classList.add('scene-loader--active');
  sceneLoader.setAttribute('aria-hidden', 'false');

  if (targetScene === 'mine') {
    mineScene.hidden = false;
    menuScene.hidden = true;
    await wait(750);
  } else {
    await wait(750);
    mineScene.hidden = true;
    menuScene.hidden = false;
  }

  sceneLoader.classList.remove('scene-loader--active');
  sceneLoader.setAttribute('aria-hidden', 'true');
  sceneLoader.hidden = true;
  sceneTransitioning = false;
}

document.getElementById('enter-mine').addEventListener('click', () => transitionScene('mine'));
document.getElementById('exit-mine').addEventListener('click', () => transitionScene('menu'));
fullscreenMenuButton.addEventListener('click', toggleMenuFullscreen);
document.addEventListener('fullscreenchange', updateFullscreenButton);

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

const workshopContent = document.getElementById('workshop-content');

function openPanel(panel) {
  activePanel = panel;
  renderWorkshop(state, activePanel);
  document.querySelectorAll('.hud-actions [data-panel]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.panel === activePanel);
  });
}

document.querySelectorAll('.hud-actions [data-panel]').forEach((button) => {
  button.addEventListener('click', () => {
    openPanel(button.dataset.panel);
  });
});

workshopContent.addEventListener('click', (event) => {
  const panelButton = event.target.closest('[data-panel]');
  if (panelButton) {
    openPanel(panelButton.dataset.panel);
    return;
  }
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const { action, id } = button.dataset;
  if (action === 'toggle-recipe-help') {
    const help = document.getElementById(`recipe-help-${id}`);
    if (!help) return;
    help.hidden = !help.hidden;
    button.setAttribute('aria-expanded', String(!help.hidden));
    return;
  }
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
    pushMessage(state.autoMiningEnabled ? `Auto Miner online: 1 single block every ${getAutoMiningIntervalSeconds(state).toFixed(1)} seconds.` : 'Auto Miner offline.');
    return;
  }
  let result;
  if (action === 'craft') result = craftRecipe(state, id);
  if (action === 'sell-one') result = sellOre(state, id, 1);
  if (action === 'sell-all') result = sellOre(state, id, state.inventory[id]);
  if (action === 'equip-pickaxe') result = equipPickaxe(state, id);
  if (action === 'equip-gear') result = equipGear(state, id);
  if (action === 'unequip-gear') result = unequipGear(state, id);
  if (action === 'switch-layer') {
    result = switchLayer(state, id);
    if (result.ok) {
      layer = LAYERS_BY_ID[state.currentLayerId];
      oreLogLayerId = state.currentLayerId;
    }
  }
  if (!result) return;
  if (action === 'craft') scheduleAutoMining();
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
updateFullscreenButton();
openPanel(activePanel);
loop();
