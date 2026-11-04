/**
 * CoordinateGuide.js
 * Quản lý cập nhật tọa độ X/Y thời gian thực theo nhân vật và hiển thị ở góc màn hình (Topbar HUD).
 * - Đã xoá các đường trục dóng X/Y và tâm ngắm trên bản đồ theo yêu cầu người dùng để cảnh chơi luôn trong lành, đẹp mắt.
 * - Giữ nguyên hiển thị tọa độ X/Y thời gian thực ở góc màn hình (nút viên thuốc Topbar HUD).
 * - Hỗ trợ phím tắt 'C' hoặc nút bấm HUD để bật/tắt hiển thị tiện lợi.
 */

export class CoordinateGuide {
  constructor(scene, hero) {
    this.scene = scene;
    this.hero = hero;
    this.visible = true; // Mặc định BẬT hiển thị tọa độ ở góc màn hình

    // Đã xoá bỏ hoàn toàn trục dóng X/Y và tâm ngắm trên canvas
    this.axisGraphics = null;
    this.container = null;

    // Lắng nghe phím 'C' để bật/tắt nhanh
    if (scene.input?.keyboard) {
      this.keyC = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
      this.keyC.on('down', () => {
        this.toggle();
      });
    }

    // Lắng nghe sự kiện toggle từ DOM HUD
    this.onToggleCoordsHandler = () => this.toggle();
    window.addEventListener('game:toggle-coords', this.onToggleCoordsHandler);

    this.update();
  }

  update() {
    if (!this.hero?.sprite?.active) {
      return;
    }

    const x = Math.round(this.hero.getX());
    const y = Math.round(this.hero.getY());

    // Cập nhật sự kiện tọa độ thời gian thực cho hiển thị ở góc (Topbar HUD)
    window.dispatchEvent(new CustomEvent('game:coords-updated', {
      detail: { x, y, visible: this.visible }
    }));
  }

  setVisible(visible) {
    this.visible = Boolean(visible);
    this.update();
  }

  toggle() {
    this.visible = !this.visible;
    this.update();
    window.dispatchEvent(new CustomEvent('game:show-toast', {
      detail: { message: this.visible ? '📍 Đã BẬT hiển thị tọa độ X/Y' : '📍 Đã TẮT hiển thị tọa độ X/Y' }
    }));
    return this.visible;
  }

  destroy() {
    window.removeEventListener('game:toggle-coords', this.onToggleCoordsHandler);
    if (this.keyC) this.keyC.removeAllListeners();
    if (this.axisGraphics) {
      this.axisGraphics.destroy();
      this.axisGraphics = null;
    }
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}
