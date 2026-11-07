import fs from 'fs';

let content = fs.readFileSync('src/game/ui/BattleArenaModal.js', 'utf8');

const targetSnippet = `    let defeatOverlay = document.getElementById('arena-defeat-overlay');
    if (!defeatOverlay) {
      defeatOverlay = document.createElement('div');
      defeatOverlay.id = 'arena-defeat-overlay';
      defeatOverlay.className = 'arena-defeat-overlay';
      defeatOverlay.innerHTML = \`
        <div class="arena-defeat-card">
          <div class="defeat-badge">💔 THỬ THÁCH CHƯA VƯỢT QUA</div>
          <div class="defeat-avatar-wrap">
            <span class="defeat-icon">🐾</span>
          </div>
          <h2 class="defeat-title">BẠN ĐÃ BỊ THUA!</h2>
          <p class="defeat-desc">
            Bé đã hết trái tim rồi! Đừng buồn nhé, các bạn thú cưng đang đợi bé về Nông Trại nghỉ ngơi đó.
          </p>
          <div class="defeat-heal-notice">
            <span class="heal-pill">❤️ Hồi lại 1 Tim</span>
            <span class="heal-hint">🍳 Bé nhớ vào Bếp ăn thêm món ngon để lên lại đủ 3 Tim nhé!</span>
          </div>
          <div class="defeat-buttons">
            <button class="modal-cta-button defeat-return-cta" id="btn-defeat-return-farm" type="button">
              🏡 Về Nông Trại Nuôi Thú ✨
            </button>
          </div>
        </div>
      \`;
      document.body.appendChild(defeatOverlay);
    }`;

const replacementSnippet = `    let defeatOverlay = document.getElementById('arena-defeat-overlay');
    if (!defeatOverlay) {
      defeatOverlay = document.createElement('div');
      defeatOverlay.id = 'arena-defeat-overlay';
      defeatOverlay.className = 'arena-defeat-overlay';
      document.body.appendChild(defeatOverlay);
    }
    // Cập nhật giao diện Pop-up Hồi Sinh Kỳ Diệu (v3.7.1)
    defeatOverlay.innerHTML = \`
      <div class="arena-defeat-card">
        <div class="defeat-badge">✨ HỒI SINH KỲ DIỆU ✨</div>
        <div class="defeat-avatar-wrap">
          <span class="defeat-icon">🌟</span>
        </div>
        <h2 class="defeat-title">HỒI SINH NHÂN VẬT</h2>
        <p class="defeat-desc">
          Bé đã hết trái tim rồi! Chạm vào nút Hồi Sinh bên dưới để dịch chuyển về Nông Trại Thú Cưng nghỉ ngơi và hồi phục năng lượng nhé!
        </p>
        <div class="defeat-heal-notice">
          <span class="heal-pill">❤️ Hồi Sinh với 1 Tim</span>
          <span class="heal-hint">🍳 Bé nhớ vào Bếp ăn thêm món ngon để lên lại đủ 3 Tim nhé!</span>
        </div>
        <div class="defeat-buttons">
          <button class="modal-cta-button defeat-return-cta" id="btn-defeat-return-farm" type="button">
            🌟 HỒI SINH & VỀ NÔNG TRẠI 🐾
          </button>
        </div>
      </div>
    \`;`;

const targetReturn = `    const handleReturn = () => {
      defeatOverlay.style.display = 'none';
      defeatOverlay.setAttribute('hidden', 'true');
      this.closeArena();

      // Đưa nhân vật quay về maps Nuôi thú (map_pet_farm)
      if (typeof window !== 'undefined' && typeof window.__travelToZone === 'function') {
        window.__travelToZone('map_pet_farm');
      } else {
        window.dispatchEvent(new CustomEvent('game:portal-warp-start', {
          detail: { targetMapId: 'map_pet_farm' }
        }));
      }
    };`;

const replacementReturn = `    const handleReturn = () => {
      defeatOverlay.style.display = 'none';
      defeatOverlay.setAttribute('hidden', 'true');
      this.closeArena();

      // Đặt cờ kích hoạt hiệu ứng Hồi Sinh Beam (spawn/respawn-beam) khi vào map Nuôi thú
      if (typeof window !== 'undefined') {
        window.__triggerRespawnBeam = true;
      }

      // Đưa nhân vật quay về maps Nuôi thú (map_pet_farm)
      if (typeof window !== 'undefined' && typeof window.__travelToZone === 'function') {
        window.__travelToZone('map_pet_farm');
      } else {
        window.dispatchEvent(new CustomEvent('game:portal-warp-start', {
          detail: { targetMapId: 'map_pet_farm' }
        }));
      }
    };`;

const normalize = s => s.replace(/\r\n/g, '\n');
const isCrlf = content.includes('\r\n');
let norm = normalize(content);

norm = norm.replace(normalize(targetSnippet), normalize(replacementSnippet));
norm = norm.replace(normalize(targetReturn), normalize(replacementReturn));

if (isCrlf) norm = norm.replace(/\n/g, '\r\n');
fs.writeFileSync('src/game/ui/BattleArenaModal.js', norm, 'utf8');
console.log('BattleArenaModal.js updated for revival popup!');
