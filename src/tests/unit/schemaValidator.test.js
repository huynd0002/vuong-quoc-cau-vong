import assert from 'node:assert/strict';
import { validateQuestion, validateMap, validateQuestionBank } from '../../content/schema/validator.js';
import { QUESTION_BANK } from '../../content/questions/questionBank.js';
import { MAPS_CONFIG } from '../../content/maps/mapsConfig.js';

export function runSchemaValidatorTests() {
  console.log('--- [Test] Content Schema Validator ---');

  // Test 1: Câu hỏi hợp lệ
  const validQ = {
    id: 'q_test_1',
    skillId: 'math',
    difficulty: 1,
    prompt: 'Có mấy quả táo?',
    speak: 'Có mấy quả táo?',
    choices: ['1 quả', '2 quả', '3 quả'],
    correct: 0,
    hint: 'Chỉ có 1 quả màu đỏ thôi bé nhé.'
  };
  const res1 = validateQuestion(validQ);
  assert.equal(res1.valid, true, 'Valid question must pass');
  console.log('✓ Test 1 Passed: Valid question schema');

  // Test 2: Từ chối câu hỏi thiếu trường hoặc sai chỉ mục
  const invalidQ = {
    id: 'q_test_invalid',
    skillId: 'math',
    difficulty: 1,
    // Thiếu prompt
    speak: 'Alo alo',
    choices: ['Đáp án 1'], // < 2 choices
    correct: 5 // index out of bounds
    // Thiếu hint
  };
  const res2 = validateQuestion(invalidQ);
  assert.equal(res2.valid, false, 'Invalid question must fail');
  assert.ok(res2.errors.some(e => e.includes('prompt')), 'Must detect missing prompt');
  assert.ok(res2.errors.some(e => e.includes('ít nhất 2 đáp án')), 'Must detect choices < 2');
  assert.ok(res2.errors.some(e => e.includes('correct')), 'Must detect invalid correct index');
  assert.ok(res2.errors.some(e => e.includes('hint')), 'Must detect missing hint');
  console.log('✓ Test 2 Passed: Invalid question rejection with exact errors');

  // Test 3: Bản đồ hợp lệ
  const validMap = {
    id: 'map1',
    name: 'Làng Quê Yên Bình',
    order: 1,
    objective: 'Học màu sắc',
    encounters: [
      { id: 'enc_1', x: 100, y: 200 }
    ]
  };
  const res3 = validateMap(validMap);
  assert.equal(res3.valid, true, 'Valid map must pass');
  console.log('✓ Test 3 Passed: Valid map schema');

  // Test 4: Từ chối bản đồ không có encounters hoặc sai order
  const invalidMap = {
    id: 'map_wrong',
    name: 'Map hỏng',
    order: 99, // out of range 1-6
    objective: 'Hỏng',
    encounters: [] // rỗng
  };
  const res4 = validateMap(invalidMap);
  assert.equal(res4.valid, false, 'Invalid map must fail');
  assert.ok(res4.errors.some(e => e.includes('order')), 'Must detect order out of 1-6 range');
  assert.ok(res4.errors.some(e => e.includes('ít nhất 1 encounter')), 'Must detect empty encounters');
  console.log('✓ Test 4 Passed: Invalid map rejection');

  // Test 5: Xác thực toàn bộ QUESTION_BANK thực tế
  const bankReport = validateQuestionBank(QUESTION_BANK);
  assert.equal(bankReport.invalid, 0, `All questions in bank must be valid (errors: ${JSON.stringify(bankReport.errors)})`);
  assert.ok(bankReport.valid >= 12, 'Must have at least 12 production questions');
  console.log(`✓ Test 5 Passed: All ${bankReport.valid} questions in QUESTION_BANK are 100% valid`);

  // Test 6: Xác thực toàn bộ 6 bản đồ trong MAPS_CONFIG
  const maps = Object.values(MAPS_CONFIG);
  assert.equal(maps.length, 6, 'Must define exactly 6 maps');
  for (const m of maps) {
    const resMap = validateMap(m);
    assert.equal(resMap.valid, true, `Map ${m.id} must be valid: ${resMap.errors.join(', ')}`);
  }
  console.log('✓ Test 6 Passed: All 6 maps in MAPS_CONFIG are 100% valid');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runSchemaValidatorTests();
}
