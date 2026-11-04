import assert from 'node:assert';
import { VirtualJoystick } from '../../game/ui/VirtualJoystick.js';

export function runVirtualJoystickTests() {
  console.log('\n--- [Test] Cần Điều Khiển Ảo (Virtual Joystick Cho Máy Tính Bảng) ---');

  // Giả lập môi trường DOM tối giản cho Node.js unit test
  const fakeElement = (id = '') => ({
    id,
    className: '',
    style: {},
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) this._classes.delete(c);
          else this._classes.add(c);
        } else if (force) {
          this._classes.add(c);
        } else {
          this._classes.delete(c);
        }
      }
    },
    setAttribute() {},
    getAttribute() { return null; },
    addEventListener() {},
    removeEventListener() {},
    getBoundingClientRect() {
      return { left: 20, top: 500, width: 140, height: 140 };
    },
    setPointerCapture() {},
    releasePointerCapture() {}
  });

  const origDocument = global.document;
  const origWindow = global.window;

  const mockBase = fakeElement('virtual-joystick-base');
  const mockKnob = fakeElement('virtual-joystick-knob');
  const mockZone = fakeElement('virtual-joystick-zone');

  global.document = {
    querySelector(sel) { return mockZone; },
    getElementById(id) {
      if (id === 'virtual-joystick-base') return mockBase;
      if (id === 'virtual-joystick-knob') return mockKnob;
      if (id === 'virtual-joystick-zone') return mockZone;
      return null;
    },
    createElement() { return fakeElement(); },
    addEventListener() {},
    removeEventListener() {}
  };

  global.window = {
    addEventListener() {},
    removeEventListener() {},
    getComputedStyle() { return { display: 'flex', visibility: 'visible' }; }
  };

  try {
    let lastMoveData = null;
    const joystick = new VirtualJoystick({
      radius: 44,
      deadzone: 8,
      onMove: (data) => {
        lastMoveData = data;
      }
    });

    // Test 1: Khởi tạo chính xác
    assert.strictEqual(joystick.radius, 44, 'Radius phải là 44px');
    assert.strictEqual(joystick.deadzone, 8, 'Deadzone phải là 8px');
    assert.strictEqual(joystick.enabled, true, 'Joystick phải được bật mặc định');
    console.log('✓ Test 1 Passed: Khởi tạo VirtualJoystick với cấu hình chuẩn');

    // Test 2: Deadzone filtering (khoảng cách nhỏ < deadzone -> vector = (0, 0))
    joystick.baseCenter = { x: 90, y: 570 };
    joystick.updateStickPosition(93, 572); // dist = hypot(3, 2) ~ 3.6 < 8
    assert.strictEqual(joystick.vector.x, 0, 'X trong deadzone phải bằng 0');
    assert.strictEqual(joystick.vector.y, 0, 'Y trong deadzone phải bằng 0');
    assert.strictEqual(joystick.force, 0, 'Force trong deadzone phải bằng 0');
    console.log('✓ Test 2 Passed: Lọc Deadzone chống rung lắc ngón tay bé');

    // Test 3: Di chuyển sang phải (dx = 30, dy = 0)
    joystick.updateStickPosition(120, 570); // dx = +30, dy = 0 -> dist = 30
    assert.strictEqual(lastMoveData.y, 0, 'Di chuyển ngang Y phải là 0');
    assert.ok(lastMoveData.x > 0.6 && lastMoveData.x < 0.7, `X phải chuẩn hóa theo force (30/44 ~ 0.68), thực tế: ${lastMoveData.x}`);
    console.log('✓ Test 3 Passed: Tính toán vector di chuyển mượt mà sang phải');

    // Test 4: Giới hạn bán kính gạt tối đa (Clamping ở bán kính radius = 44)
    joystick.updateStickPosition(90, 670); // dx = 0, dy = +100 -> dist = 100 > 44
    assert.strictEqual(joystick.force, 1, 'Force tối đa phải bằng 1 khi vượt quá bán kính');
    assert.strictEqual(joystick.vector.x, 0, 'X phải bằng 0 khi gạt thẳng xuống');
    assert.strictEqual(joystick.vector.y, 1, 'Y phải đạt tối đa 1.0 khi gạt thẳng xuống');
    console.log('✓ Test 4 Passed: Giới hạn bán kính kẹp chặt tối đa force = 1.0');

    // Test 5: Reset hồi tâm (Spring-back) về vị trí (0, 0)
    joystick.reset();
    assert.strictEqual(joystick.vector.x, 0, 'Sau khi reset X phải về 0');
    assert.strictEqual(joystick.vector.y, 0, 'Sau khi reset Y phải về 0');
    assert.strictEqual(joystick.force, 0, 'Sau khi reset Force phải về 0');
    assert.strictEqual(lastMoveData.x, 0, 'Callback onMove phải nhận vector 0 khi thả tay');
    console.log('✓ Test 5 Passed: Cơ chế hồi tâm tự động khi buông tay (Spring Back)');

    // Test 6: Bật / Tắt hiển thị (Toggle & setVisible)
    joystick.setVisible(false);
    assert.strictEqual(joystick.visible, false, 'setVisible(false) cập nhật trạng thái');
    assert.ok(mockZone.classList.contains('hidden'), 'Phải gắn class hidden khi ẩn');
    joystick.toggle();
    assert.strictEqual(joystick.visible, true, 'toggle() đảo lại trạng thái sang true');
    console.log('✓ Test 6 Passed: Bật / Tắt hiển thị cần gạt linh hoạt');

    joystick.destroy();
    console.log('✓ Test 7 Passed: Dọn dẹp tài nguyên (destroy) an toàn');

  } finally {
    global.document = origDocument;
    global.window = origWindow;
  }
}
