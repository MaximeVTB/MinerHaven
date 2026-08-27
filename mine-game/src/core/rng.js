// src/core/rng.js
//
// Seedable PRNG (mulberry32) — deterministic and fast. Same seed always
// produces the same run, which is what lets the RNG/mining math be
// unit-tested without touching the canvas or DOM at all.

export function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
