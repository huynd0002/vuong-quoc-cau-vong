#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { loadEffect, renderFrames, spriteSheet, save } from '../pixelfx-repo/tools/lib/fxlib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIRS = [
  path.join(ROOT, 'assets/vfx'),
  path.join(ROOT, 'public/assets/vfx')
];

const CURATED_EFFECTS = [
  { id: 'water/ripples', outKey: 'vfx_tap_ripple', fps: 18 },
  { id: 'pickups/collect-burst', outKey: 'vfx_collect_burst', fps: 20 },
  { id: 'ui/quest-complete', outKey: 'vfx_quest_complete', fps: 18 },
  { id: 'ui/confetti', outKey: 'vfx_confetti', fps: 16 },
  { id: 'explosions/firework-burst', outKey: 'vfx_firework_burst', fps: 14 },
  { id: 'impacts/hit-spark', outKey: 'vfx_hit_spark', fps: 24 },
  { id: 'impacts/crit-hit', outKey: 'vfx_crit_hit', fps: 20 },
  { id: 'spawn/poof', outKey: 'vfx_poof', fps: 20 },
  { id: 'ui/level-up', outKey: 'vfx_level_up', fps: 16 },
  { id: 'arcane/portal', outKey: 'vfx_portal_warp', fps: 16 },
  { id: 'transitions/star-iris', outKey: 'vfx_star_iris', fps: 18 }
];

for (const dir of OUT_DIRS) {
  mkdirSync(dir, { recursive: true });
}

const summary = [];
for (const item of CURATED_EFFECTS) {
  const fx = await loadEffect(item.id);
  const rendered = renderFrames(fx, { bg: 'none', actor: false, fps: item.fps });
  const sheet = spriteSheet(fx, rendered, item.outKey);
  const jsonText = JSON.stringify(sheet.json, null, 2);

  for (const dir of OUT_DIRS) {
    save(path.join(dir, `${item.outKey}.png`), sheet.png);
    save(path.join(dir, `${item.outKey}.json`), jsonText);
  }

  const meta = sheet.json.meta.pixelfx;
  const rows = Math.ceil(meta.frames / meta.columns);
  summary.push({
    key: item.outKey,
    id: item.id,
    frameWidth: meta.frameSize[0],
    frameHeight: meta.frameSize[1],
    frames: meta.frames,
    columns: meta.columns,
    rows,
    texSize: `${sheet.json.meta.size.w}x${sheet.json.meta.size.h}`,
    fps: meta.fps,
    pngKB: Math.round(sheet.png.length / 1024)
  });
}

console.table(summary);
