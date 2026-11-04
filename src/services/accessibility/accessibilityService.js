/**
 * Accessibility Service
 * Quản lý các thiết lập trợ năng (Giảm chuyển động, Âm thanh, Điều khiển).
 */

export class AccessibilityService {
  constructor() {
    this.reducedMotion = false;
    this.listeners = new Set();
    this.initMediaQuery();
  }

  initMediaQuery() {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = mediaQuery.matches;
      mediaQuery.addEventListener('change', (e) => {
        this.reducedMotion = e.matches;
        this.notify();
      });
    } catch {
      // Fallback
    }
  }

  isReducedMotion() {
    return this.reducedMotion;
  }

  setReducedMotion(enabled) {
    this.reducedMotion = Boolean(enabled);
    this.notify();
  }

  subscribe(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    }
    return () => {};
  }

  notify() {
    for (const cb of this.listeners) {
      try {
        cb({ reducedMotion: this.reducedMotion });
      } catch (err) {
        console.error('[AccessibilityService] Callback error:', err);
      }
    }
  }
}

export const accessibilityService = new AccessibilityService();
