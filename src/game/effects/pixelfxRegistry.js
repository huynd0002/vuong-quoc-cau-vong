import vfxTapRippleUrl from '../../../assets/vfx/vfx_tap_ripple.png?url';
import vfxCollectBurstUrl from '../../../assets/vfx/vfx_collect_burst.png?url';
import vfxQuestCompleteUrl from '../../../assets/vfx/vfx_quest_complete.png?url';
import vfxConfettiUrl from '../../../assets/vfx/vfx_confetti.png?url';
import vfxFireworkBurstUrl from '../../../assets/vfx/vfx_firework_burst.png?url';
import vfxHitSparkUrl from '../../../assets/vfx/vfx_hit_spark.png?url';
import vfxCritHitUrl from '../../../assets/vfx/vfx_crit_hit.png?url';
import vfxPoofUrl from '../../../assets/vfx/vfx_poof.png?url';
import vfxPortalWarpUrl from '../../../assets/vfx/vfx_portal_warp.png?url';
import vfxStarIrisUrl from '../../../assets/vfx/vfx_star_iris.png?url';

export const PIXELFX_SHEETS = {
  vfx_tap_ripple: { url: vfxTapRippleUrl, frameWidth: 136, frameHeight: 52, frames: 36, columns: 4, fps: 18 },
  vfx_collect_burst: { url: vfxCollectBurstUrl, frameWidth: 112, frameHeight: 108, frames: 28, columns: 6, fps: 20 },
  vfx_quest_complete: { url: vfxQuestCompleteUrl, frameWidth: 204, frameHeight: 92, frames: 48, columns: 5, fps: 18 },
  vfx_confetti: { url: vfxConfettiUrl, frameWidth: 200, frameHeight: 140, frames: 55, columns: 7, fps: 16 },
  vfx_firework_burst: { url: vfxFireworkBurstUrl, frameWidth: 240, frameHeight: 248, frames: 51, columns: 8, fps: 14 },
  vfx_hit_spark: { url: vfxHitSparkUrl, frameWidth: 136, frameHeight: 80, frames: 13, columns: 3, fps: 24 },
  vfx_crit_hit: { url: vfxCritHitUrl, frameWidth: 216, frameHeight: 136, frames: 19, columns: 4, fps: 20 },
  vfx_poof: { url: vfxPoofUrl, frameWidth: 112, frameHeight: 92, frames: 33, columns: 6, fps: 20 },
  vfx_portal_warp: { url: vfxPortalWarpUrl, frameWidth: 152, frameHeight: 116, frames: 38, columns: 6, fps: 16 },
  vfx_star_iris: { url: vfxStarIrisUrl, frameWidth: 320, frameHeight: 180, frames: 41, columns: 5, fps: 18 }
};

const _loadedSheetCache = new Map();

export function preloadSheetImage(key) {
  const spec = PIXELFX_SHEETS[key];
  if (!spec || typeof Image === 'undefined') return Promise.resolve(null);
  const existing = _loadedSheetCache.get(key);
  if (existing) {
    if (existing.complete && existing.naturalWidth > 0) return Promise.resolve(existing);
    return new Promise((resolve) => {
      existing.addEventListener('load', () => resolve(existing), { once: true });
      existing.addEventListener('error', () => resolve(null), { once: true });
    });
  }
  const img = new Image();
  img.decoding = 'async';
  img.src = spec.url;
  _loadedSheetCache.set(key, img);
  return new Promise((resolve) => {
    if (img.complete && img.naturalWidth > 0) return resolve(img);
    img.addEventListener('load', () => resolve(img), { once: true });
    img.addEventListener('error', () => resolve(null), { once: true });
  });
}

/**
 * Vẽ 1 frame của PixelFX spritesheet lên Canvas 2D bằng drawImage phần cứng (cực nhẹ).
 */
export function drawPixelFxFrame(ctx, key, img, frameIdx, dx, dy, dw, dh) {
  const spec = PIXELFX_SHEETS[key];
  if (!ctx || !spec || !img || !img.complete || img.naturalWidth <= 0) return;
  const clamped = Math.max(0, Math.min(spec.frames - 1, frameIdx | 0));
  const col = clamped % spec.columns;
  const row = Math.floor(clamped / spec.columns);
  const sx = col * spec.frameWidth;
  const sy = row * spec.frameHeight;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, sx, sy, spec.frameWidth, spec.frameHeight, dx, dy, dw, dh);
}
