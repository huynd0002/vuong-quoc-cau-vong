import { audioService } from '../services/audio/audioService.js';

// Keep the child's everyday actions visible and secondary tools together.
const toolbar = document.querySelector('.top-actions');
if (toolbar) {
  const more = document.createElement('details');
  more.className = 'toolbar-more';
  more.innerHTML = '<summary aria-label="Mở thêm công cụ">☰<span>Thêm</span></summary><div class="toolbar-more-panel" aria-label="Công cụ khác"></div>';
  const panel = more.querySelector('.toolbar-more-panel');
  for (const id of ['btn-select-character', 'btn-open-maze', 'btn-manage-questions', 'btn-toggle-coords']) {
    const button = document.getElementById(id);
    if (button) panel.append(button);
  }

  // Điều khiển Âm lượng, Nhạc nền & Hiệu ứng (SFX) trong menu Thêm
  const audioBox = document.createElement('div');
  audioBox.className = 'toolbar-audio-controls';
  audioBox.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:8px 10px;border-top:1px solid rgba(148,163,184,0.28);margin-top:4px;';
  const initVol = Math.round((audioService.volume ?? 0.8) * 100);
  audioBox.innerHTML = `
    <label style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:800;color:#1e293b;">
      <span>🔊 Âm lượng</span>
      <span id="menu-volume-val">${initVol}%</span>
    </label>
    <input id="menu-volume-slider" type="range" min="0" max="100" value="${initVol}" style="width:100%;accent-color:#ec4899;cursor:pointer;" aria-label="Tăng giảm âm lượng" />
    <div style="display:flex;gap:6px;">
      <button type="button" id="btn-toggle-bgm" class="stat-pill clickable-pill audio-ctrl-btn" style="flex:1;justify-content:center;font-size:12px;">🎵 Nhạc nền: Bật</button>
      <button type="button" id="btn-toggle-sfx" class="stat-pill clickable-pill audio-ctrl-btn" style="flex:1;justify-content:center;font-size:12px;">✨ SFX: Bật</button>
    </div>
  `;
  panel.append(audioBox);

  const volSlider = audioBox.querySelector('#menu-volume-slider');
  const volVal = audioBox.querySelector('#menu-volume-val');
  const btnBgm = audioBox.querySelector('#btn-toggle-bgm');
  const btnSfx = audioBox.querySelector('#btn-toggle-sfx');

  volSlider?.addEventListener('input', (e) => {
    const pct = Number(e.target.value);
    if (volVal) volVal.textContent = `${pct}%`;
    audioService.setVolume(pct / 100);
    if (pct > 0 && !audioService.soundEnabled) {
      audioService.setSoundEnabled(true);
    }
  });

  btnBgm?.addEventListener('click', () => {
    const next = audioService.setBgmEnabled(!audioService.bgmEnabled);
    btnBgm.textContent = next ? '🎵 Nhạc nền: Bật' : '🔇 Nhạc nền: Tắt';
  });

  btnSfx?.addEventListener('click', () => {
    const next = audioService.setSfxEnabled(!audioService.sfxEnabled);
    btnSfx.textContent = next ? '✨ SFX: Bật' : '🔇 SFX: Tắt';
  });

  toolbar.append(more);
  const close = () => { more.open = false; };
  panel.addEventListener('click', e => {
    if (e.target.closest('button:not(.audio-ctrl-btn)')) close();
  });
  document.addEventListener('click', e => { if (!more.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && more.open) { close(); more.querySelector('summary').focus(); } });
}
