/**
 * GroundShadow.js
 * Quản lý bóng đổ chân thực (Soft Radial Contact Shadow & Ambient Occlusion)
 * cho Nhân vật (Hero), Thú cưng (Pet) và Quái vật (Monster).
 *
 * Tính năng chính:
 * 1. Thay thế hình bầu dục vector thô cứng (Phaser add.ellipse) bằng kết cấu Radial Gradient đa lớp mờ viền (feathered edge).
 * 2. Tông màu trung tính Midnight Obsidian (rgba(10, 16, 26, ...)) tự nhiên hòa trộn hoàn hảo trên mọi mặt phẳng bản đồ (cỏ, cát, sỏi đá, pha lê tím, rừng kẹo hồng).
 * 3. Tỷ lệ dẹp 2.2:1 chuẩn góc nhìn 2.5D top-down của game RPG.
 * 4. Tự động đồng bộ độ sâu (Dynamic Depth Sorting) theo trục Y, đảm bảo bóng luôn nằm ngay dưới chân nhân vật.
 * 5. Loại bỏ bóng không cần thiết (Xoá bóng quái vật bay như Ong Vàng, xoá bóng khi quái vật được giải cứu) theo đúng yêu cầu người dùng.
 */

export const SHADOW_TEXTURE_KEY = 'fx_soft_ground_shadow';

/**
 * Khởi tạo kết cấu bóng đổ mờ viền tự nhiên trong Phaser Textures Cache
 */
export function ensureGroundShadowTexture(scene) {
  if (!scene || !scene.textures) return SHADOW_TEXTURE_KEY;
  if (scene.textures.exists(SHADOW_TEXTURE_KEY)) return SHADOW_TEXTURE_KEY;

  // Tạo canvas 128x64 sắc nét với bộ đệm mờ viền
  const canvas = scene.textures.createCanvas(SHADOW_TEXTURE_KEY, 128, 64);
  const ctx = canvas.context;

  ctx.clearRect(0, 0, 128, 64);
  ctx.save();
  ctx.translate(64, 32);
  ctx.scale(1.0, 0.46); // Tỉ lệ bầu dục dẹp 2.17:1 chuẩn tiếp xúc mặt đất

  // Gradient tỏa tròn đa tầng tạo hiệu ứng tiếp đất (Contact Ambient Occlusion)
  // Lõi tối trung tâm lan tỏa mờ dần ra ngoài, không để lại bất kỳ ranh giới sắc nhọn nào
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 58);
  grad.addColorStop(0.00, 'rgba(10, 16, 26, 0.55)'); // Tâm bóng đậm nhất dưới lòng bàn chân
  grad.addColorStop(0.28, 'rgba(10, 16, 26, 0.38)'); // Vùng bóng lõi
  grad.addColorStop(0.58, 'rgba(10, 16, 26, 0.16)'); // Vùng bóng mờ chuyển tiếp (penumbra)
  grad.addColorStop(0.85, 'rgba(10, 16, 26, 0.04)'); // Viền ngoài tan biến
  grad.addColorStop(1.00, 'rgba(10, 16, 26, 0.00)'); // Hoàn toàn trong suốt

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  canvas.refresh();
  return SHADOW_TEXTURE_KEY;
}

/**
 * Tạo mới một đối tượng bóng đổ mềm mại cho thực thể
 */
export function createGroundShadow(scene, x, y, width, height, alpha = 0.72) {
  ensureGroundShadowTexture(scene);
  const shadow = scene.add.image(x, y, SHADOW_TEXTURE_KEY);
  shadow.setDisplaySize(width, height);
  shadow.setAlpha(alpha);
  shadow.setOrigin(0.5, 0.5);
  shadow.setDepth(Math.max(1, Math.floor(y - 15)));
  return shadow;
}

/**
 * Kiểm tra xem quái vật có phải dạng bay hay không (để xoá bóng không cần thiết)
 */
export function isFlyingMonster(textureKey = '') {
  if (!textureKey) return false;
  const key = textureKey.toLowerCase();
  return key.includes('bee') || key.includes('ong') || key.includes('fly');
}
