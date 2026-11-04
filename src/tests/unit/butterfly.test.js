if (typeof global.window === 'undefined') {
  global.window = {};
}
if (typeof global.navigator === 'undefined') {
  global.navigator = { userAgent: 'node' };
}

import assert from 'node:assert';
import { DIRECTIONS_8 } from '../../game/entities/Butterfly.js';

export function runButterflyTests() {
  console.log('--- [Test] 8-Direction Butterfly System ---');

  // 1. Verify exactly 8 directions are defined
  assert.strictEqual(DIRECTIONS_8.length, 8, 'Must have exactly 8 flight directions');

  // 2. Verify all direction names
  const expectedDirections = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'];
  const actualDirections = DIRECTIONS_8.map(d => d.name);
  assert.deepStrictEqual(actualDirections, expectedDirections, 'Direction names must match 8 compass points');

  // 3. Verify vectors are normalized (magnitude == 1.0)
  DIRECTIONS_8.forEach(dir => {
    const mag = Math.hypot(dir.vx, dir.vy);
    assert.ok(Math.abs(mag - 1.0) < 0.001, `Direction ${dir.name} vector must be normalized to length 1.0, got ${mag}`);
  });

  // 4. Verify horizontal flipping logic for west-facing directions
  DIRECTIONS_8.forEach(dir => {
    if (dir.vx < -0.01) {
      assert.strictEqual(dir.flipX, true, `West-facing direction ${dir.name} should flipX = true`);
    } else if (dir.vx > 0.01) {
      assert.strictEqual(dir.flipX, false, `East-facing direction ${dir.name} should flipX = false`);
    }
  });

  console.log('✓ Test 1 Passed: Exactly 8 normalized flight directions');
  console.log('✓ Test 2 Passed: Correct directional orientations and flip flags');
}

// If run directly
runButterflyTests();
