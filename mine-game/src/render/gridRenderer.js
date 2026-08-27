// src/render/gridRenderer.js
const CELL = 48;
const GAP = 3;

let particles = [];
let shake = { t: 0, dur: 0, mag: 0 };

export function gridToPixel(w, h) {
  return { width: w * (CELL + GAP), height: h * (CELL + GAP) };
}

export function pixelToCell(px, py) {
  return { x: Math.floor(px / (CELL + GAP)), y: Math.floor(py / (CELL + GAP)) };
}

// Shake magnitude scales with how many blocks broke in one click —
// a 5x5 blast should feel very different from a single tap.
export function triggerShake(cellsBroken) {
  shake = { t: 0, dur: 10 + cellsBroken * 2, mag: Math.min(14, 2 + cellsBroken) };
}

export function spawnParticles(cx, cy, color, count) {
  const px = cx * (CELL + GAP) + CELL / 2;
  const py = cy * (CELL + GAP) + CELL / 2;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 3;
    particles.push({
      x: px,
      y: py,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 24 + Math.random() * 12,
      maxLife: 36,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function updateParticles() {
  particles = particles.filter((p) => p.life > 0);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12;
    p.life--;
  }
}

export function renderGrid(ctx, state, layer) {
  updateParticles();

  ctx.save();
  if (shake.t < shake.dur) {
    const s = shake.mag * (1 - shake.t / shake.dur);
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    shake.t++;
  }

  ctx.fillStyle = layer.theme.rockDeep;
  ctx.fillRect(-20, -20, ctx.canvas.width + 40, ctx.canvas.height + 40);

  for (let y = 0; y < state.grid.length; y++) {
    for (let x = 0; x < state.grid[0].length; x++) {
      const cell = state.grid[y][x];
      const px = x * (CELL + GAP);
      const py = y * (CELL + GAP);
      ctx.fillStyle = cell.broken ? 'rgba(0,0,0,0.15)' : layer.theme.rock;
      roundRect(ctx, px, py, CELL, CELL, 6);
      ctx.fill();
      if (!cell.broken) {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        roundRect(ctx, px + 1.5, py + 1.5, CELL - 3, CELL - 3, 5);
        ctx.stroke();
      }
    }
  }

  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export const CELL_SIZE = CELL;
export const CELL_GAP = GAP;
