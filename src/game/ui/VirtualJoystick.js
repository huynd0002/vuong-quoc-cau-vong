/**
 * VirtualJoystick.js
 * Cần điều khiển ảo (Virtual On-Screen Thumbstick) cho máy tính bảng & cảm ứng
 * Thiết kế 3D kẹo ngọt thân thiện cho bé 5-6 tuổi, phản hồi mượt mà 8 hướng 360 độ.
 */

export class VirtualJoystick {
  /**
   * @param {Object} options
   * @param {HTMLElement} [options.container] - Khung chứa DOM (mặc định .scene-stage)
   * @param {Function} [options.onMove] - Callback khi cần gạt di chuyển ({ x, y, force })
   * @param {number} [options.radius=44] - Bán kính gạt tối đa (px)
   * @param {number} [options.deadzone=8] - Vùng chết tâm điểm (px)
   */
  constructor(options = {}) {
    this.container = options.container || (typeof document !== 'undefined' && typeof document.querySelector === 'function' ? (document.querySelector('.scene-stage') || document.body) : null);
    this.onMove = options.onMove || (() => {});
    this.radius = options.radius || 44;
    this.deadzone = options.deadzone || 8;

    this.activePointerId = null;
    this.baseCenter = { x: 0, y: 0 };
    this.vector = { x: 0, y: 0 };
    this.force = 0;
    this.enabled = true;
    this.visible = true;

    this._boundOnPointerDown = this.onPointerDown.bind(this);
    this._boundOnPointerMove = this.onPointerMove.bind(this);
    this._boundOnPointerUp = this.onPointerUp.bind(this);

    this.initDOM();
    this.bindEvents();
    this.initModalObserver();
  }

  initDOM() {
    // Tìm phần tử đã có sẵn hoặc tự tạo mới
    let zone = document.getElementById('virtual-joystick-zone');
    if (!zone) {
      zone = document.createElement('div');
      zone.id = 'virtual-joystick-zone';
      zone.className = 'virtual-joystick-zone';
      zone.setAttribute('role', 'region');
      zone.setAttribute('aria-label', 'Cần điều khiển ảo cho bé');

      zone.innerHTML = `
        <div class="virtual-joystick-base" id="virtual-joystick-base">
          <div class="vj-arrow vj-up" aria-hidden="true">▲</div>
          <div class="vj-arrow vj-down" aria-hidden="true">▼</div>
          <div class="vj-arrow vj-left" aria-hidden="true">◀</div>
          <div class="vj-arrow vj-right" aria-hidden="true">▶</div>
          <div class="vj-center-guide" aria-hidden="true"></div>
          <div class="virtual-joystick-knob" id="virtual-joystick-knob">
            <span class="vj-knob-gem" aria-hidden="true">🐾</span>
          </div>
        </div>
      `;

      if (this.container) {
        this.container.appendChild(zone);
      }
    }

    this.zoneEl = zone;
    this.baseEl = document.getElementById('virtual-joystick-base');
    this.knobEl = document.getElementById('virtual-joystick-knob');
  }

  bindEvents() {
    if (!this.baseEl) return;

    this.baseEl.addEventListener('pointerdown', this._boundOnPointerDown, { passive: false });
    this.baseEl.addEventListener('pointermove', this._boundOnPointerMove, { passive: false });
    this.baseEl.addEventListener('pointerup', this._boundOnPointerUp, { passive: false });
    this.baseEl.addEventListener('pointercancel', this._boundOnPointerUp, { passive: false });

    // Tối ưu iPad/Touch: Lắng nghe pointerup/touchend toàn cục trên window
    // Tránh tình trạng buông tay ngoài vòng tròn base làm kẹt cần gạt hoặc chặn tap-to-move
    window.addEventListener('pointerup', this._boundOnPointerUp, { passive: false });
    window.addEventListener('pointercancel', this._boundOnPointerUp, { passive: false });
    this._boundWindowTouchEnd = () => {
      if (this.activePointerId !== null) this.reset();
    };
    window.addEventListener('touchend', this._boundWindowTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this._boundWindowTouchEnd, { passive: true });

    // Đảm bảo không bị kẹt khi thả tay ngoài màn hình hoặc mất focus
    window.addEventListener('blur', () => this.reset());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.reset();
    });
  }

  initModalObserver() {
    // Tự động reset cần gạt khi xuất hiện modal hoặc chiến đấu
    if (typeof MutationObserver !== 'undefined' && this.container) {
      const observer = new MutationObserver(() => {
        if (!this.zoneEl) return;
        const computedStyle = window.getComputedStyle(this.zoneEl);
        if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
          if (this.vector.x !== 0 || this.vector.y !== 0) {
            this.reset();
          }
        }
      });
      observer.observe(this.container, { attributes: true, subtree: true, attributeFilter: ['hidden', 'class', 'style'] });
      this.modalObserver = observer;
    }
  }

  onPointerDown(e) {
    if (!this.enabled) return;
    e.preventDefault();
    e.stopPropagation();

    this.activePointerId = e.pointerId;
    try {
      this.baseEl.setPointerCapture(e.pointerId);
    } catch (_) {}

    this.baseEl.classList.add('active', 'dragging');
    this.knobEl.classList.remove('spring-back');

    this.calculateBaseCenter();
    this.updateStickPosition(e.clientX, e.clientY);
  }

  onPointerMove(e) {
    if (this.activePointerId === null || e.pointerId !== this.activePointerId) return;
    e.preventDefault();
    e.stopPropagation();

    this.updateStickPosition(e.clientX, e.clientY);
  }

  onPointerUp(e) {
    if (this.activePointerId === null || (e && e.pointerId !== this.activePointerId)) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      try {
        this.baseEl.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    this.reset();
  }

  calculateBaseCenter() {
    if (!this.baseEl) return;
    const rect = this.baseEl.getBoundingClientRect();
    this.baseCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  updateStickPosition(clientX, clientY) {
    const dx = clientX - this.baseCenter.x;
    const dy = clientY - this.baseCenter.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.deadzone) {
      this.vector = { x: 0, y: 0 };
      this.force = 0;
      this.knobEl.style.transform = 'translate3d(0px, 0px, 0)';
      this.onMove({ x: 0, y: 0, force: 0 });
      return;
    }

    const clampedDist = Math.min(dist, this.radius);
    const force = clampedDist / this.radius;
    const normX = dx / dist;
    const normY = dy / dist;

    const knobX = normX * clampedDist;
    const knobY = normY * clampedDist;

    this.vector = {
      x: normX * force,
      y: normY * force
    };
    this.force = force;

    this.knobEl.style.transform = `translate3d(${knobX}px, ${knobY}px, 0)`;
    this.onMove({ x: this.vector.x, y: this.vector.y, force: this.force });
  }

  reset() {
    this.activePointerId = null;
    this.vector = { x: 0, y: 0 };
    this.force = 0;

    if (this.baseEl) {
      this.baseEl.classList.remove('active', 'dragging');
    }

    if (this.knobEl) {
      this.knobEl.classList.add('spring-back');
      this.knobEl.style.transform = 'translate3d(0px, 0px, 0)';
    }

    this.onMove({ x: 0, y: 0, force: 0 });
  }

  setVisible(visible) {
    this.visible = !!visible;
    if (this.zoneEl) {
      this.zoneEl.classList.toggle('hidden', !this.visible);
    }
    if (!this.visible) {
      this.reset();
    }
  }

  toggle() {
    this.setVisible(!this.visible);
    return this.visible;
  }

  destroy() {
    this.reset();
    if (this.modalObserver) {
      this.modalObserver.disconnect();
    }
    window.removeEventListener('pointerup', this._boundOnPointerUp);
    window.removeEventListener('pointercancel', this._boundOnPointerUp);
    if (this._boundWindowTouchEnd) {
      window.removeEventListener('touchend', this._boundWindowTouchEnd);
      window.removeEventListener('touchcancel', this._boundWindowTouchEnd);
    }
    if (this.baseEl) {
      this.baseEl.removeEventListener('pointerdown', this._boundOnPointerDown);
      this.baseEl.removeEventListener('pointermove', this._boundOnPointerMove);
      this.baseEl.removeEventListener('pointerup', this._boundOnPointerUp);
      this.baseEl.removeEventListener('pointercancel', this._boundOnPointerUp);
    }
  }
}
