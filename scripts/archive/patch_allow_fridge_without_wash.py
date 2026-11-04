# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Update WorldScene.js
with open('src/game/scenes/WorldScene.js', 'r', encoding='utf-8') as f:
    ws = f.read()

# Only lock cook, not pantry in refreshKitchenLockBadges:
ws = ws.replace(
    ".filter(s => s.type === 'pantry' || s.type === 'cook')",
    ".filter(s => s.type === 'cook')"
)

# Only block cook, allow pantry without washing hands in openKitchenStationInteraction:
old_block = """    if ((st.type === 'cook' || st.type === 'pantry') && !isHandsWashed) {
      const isFridge = st.type === 'pantry';
      if (window.__audioService) {
        window.__audioService.playChime(420, 0.25);
        window.__audioService.speak(isFridge
          ? 'Bé ơi, rửa tay sạch sẽ trước rồi mới mở tủ lạnh nhé!'
          : 'Bé ơi, tay chưa rửa sạch khuẩn! Hãy đến bồn rửa tay trước khi vào bếp nấu ăn nhé!');
      }
      window.dispatchEvent(new CustomEvent('game:show-toast', {
        detail: {
          message: isFridge
            ? '🧼 Rửa tay trước rồi mới mở Tủ Lạnh nhé!'
            : '🧼 Bé hãy rửa tay thật sạch tại bồn rửa trước khi vào Bếp nấu nhé!'
        }
      }));
      this.showHandWashLockBubble?.(st);

      // Hiệu ứng nhấp nháy dẫn hướng đến bồn rửa tay (prep)
      const sinkStation = this.kitchenStationContainers?.find(c => c.data?.type === 'prep');
      if (sinkStation?.aura) {
        this.tweens.add({
          targets: sinkStation.aura,
          scaleX: 1.4,
          scaleY: 1.4,
          alpha: 0.9,
          duration: 300,
          yoyo: true,
          repeat: 3
        });
      }
      return;
    }"""

new_block = """    // Tủ Lạnh vẫn mở được tự do mà không phải rửa tay! Chỉ Bếp Lò nấu ăn mới cần rửa tay sạch.
    if (st.type === 'cook' && !isHandsWashed) {
      if (window.__audioService) {
        window.__audioService.playChime(420, 0.25);
        window.__audioService.speak('Bé ơi, tay chưa rửa sạch khuẩn! Hãy đến bồn rửa tay trước khi vào bếp nấu ăn nhé!');
      }
      window.dispatchEvent(new CustomEvent('game:show-toast', {
        detail: {
          message: '🧼 Bé hãy rửa tay thật sạch tại bồn rửa trước khi vào Bếp nấu nhé!'
        }
      }));
      this.showHandWashLockBubble?.(st);

      // Hiệu ứng nhấp nháy dẫn hướng đến bồn rửa tay (prep)
      const sinkStation = this.kitchenStationContainers?.find(c => c.data?.type === 'prep');
      if (sinkStation?.aura) {
        this.tweens.add({
          targets: sinkStation.aura,
          scaleX: 1.4,
          scaleY: 1.4,
          alpha: 0.9,
          duration: 300,
          yoyo: true,
          repeat: 3
        });
      }
      return;
    }"""

# Normalize \r\n for matching
ws_norm = ws.replace('\r\n', '\n')
if old_block in ws_norm:
    ws_norm = ws_norm.replace(old_block, new_block)
    ws = ws_norm
else:
    print("Warning: old_block in WorldScene.js not found by exact string, checking...")

with open('src/game/scenes/WorldScene.js', 'w', encoding='utf-8') as f:
    f.write(ws)

# 2. Update KitchenModal.js
with open('src/game/ui/KitchenModal.js', 'r', encoding='utf-8') as f:
    km = f.read()

old_km_tab = """    if(['fridge','recipes','bag'].includes(action)) {
      // Cổng vệ sinh: chưa rửa tay thì không mở Tủ Lạnh / Bếp nấu
      const st = this.system.getState();
      if (action !== 'bag' && !st.handsWashed && !st.session) {
        this.audio?.playChime?.(420, .2);
        return this.onWashHands?.();
      }"""

new_km_tab = """    if(['fridge','recipes','bag'].includes(action)) {
      // Cổng vệ sinh: Tủ Lạnh và Túi đồ vẫn mở được tự do mà không phải rửa tay; chỉ Bếp nấu (recipes) mới cần rửa tay
      const st = this.system.getState();
      if (action === 'recipes' && !st.handsWashed && !st.session) {
        this.audio?.playChime?.(420, .2);
        return this.onWashHands?.();
      }"""

km_norm = km.replace('\r\n', '\n')
if old_km_tab in km_norm:
    km_norm = km_norm.replace(old_km_tab, new_km_tab)
    km = km_norm
else:
    print("Warning: old_km_tab in KitchenModal.js not found by exact string")

with open('src/game/ui/KitchenModal.js', 'w', encoding='utf-8') as f:
    f.write(km)

print("Patch applied: Fridge (Tủ Lạnh) is now openable without washing hands!")
