import assert from 'node:assert/strict';
import fs from 'node:fs';
import { 
  QUESTION_BANK, 
  getQuestion, 
  getRandomZoneQuestion, 
  shuffleQuestion, 
  sessionQuestionHistory, 
  clearQuestionHistory 
} from '../../content/questions/questionBank.js';

export function runDragSortAndAntiRepeatTests() {
  console.log('--- [Test] Drag Sort & Anti-Repeat Questions & Choices ---');

  // Test 1: q_map1_drag_size có đầy đủ hình ảnh minh họa vector và text rõ ràng
  const q = getQuestion('q_map1_drag_size');
  assert.ok(q, 'q_map1_drag_size must exist');
  assert.equal(q.type, 'drag_sort');
  assert.equal(q.items.length, 3);
  
  q.items.forEach(it => {
    assert.ok(it.image, `Item ${it.id} must have image`);
    assert.ok(it.text, `Item ${it.id} must have text`);
    assert.ok(fs.existsSync('./public' + it.image), `Asset file ${it.image} must exist on disk`);
  });
  console.log('✓ Test 1 Passed: q_map1_drag_size has verified vector images and text labels');

  // Test 2: Chống lặp câu hỏi ngẫu nhiên trong phiên chơi (Session Anti-Repeat)
  clearQuestionHistory();
  const pickedIds = [];
  for (let i = 0; i < 12; i++) {
    const nextQ = getRandomZoneQuestion('map1', pickedIds.slice(-2));
    assert.ok(nextQ, 'Must return question');
    pickedIds.push(nextQ.id);
  }
  
  // Với 28 câu hỏi Map 1, 10 lượt đầu tiên không được trùng lặp
  const first10 = pickedIds.slice(0, 10);
  const uniqueFirst10 = new Set(first10);
  assert.equal(uniqueFirst10.size, 10, '10 first consecutive picks in map1 must be strictly unique');
  console.log('✓ Test 2 Passed: 10 consecutive picks in Zone 1 are 100% unique');

  // Test 3: Trộn đáp án không bị lặp vị trí đáp án đúng liên tiếp (Anti-repeat correct index)
  const sampleQ = {
    id: 'test_sample_q',
    prompt: 'Chọn số đúng',
    choices: ['Số 1', 'Số 2', 'Số 3', 'Số 4'],
    correct: 0
  };

  const correctIndices = [];
  for (let i = 0; i < 20; i++) {
    const shuffled = shuffleQuestion(sampleQ);
    assert.equal(shuffled.choices.length, 4);
    assert.equal(shuffled.choices[shuffled.correct], 'Số 1', 'Correct answer text must match');
    correctIndices.push(shuffled.correct);
  }

  // Đảm bảo không có 3 lần liên tiếp có cùng một vị trí correct index
  let maxConsecutiveSame = 1;
  let currentRun = 1;
  for (let i = 1; i < correctIndices.length; i++) {
    if (correctIndices[i] === correctIndices[i - 1]) {
      currentRun++;
      if (currentRun > maxConsecutiveSame) maxConsecutiveSame = currentRun;
    } else {
      currentRun = 1;
    }
  }
  assert.ok(maxConsecutiveSame <= 2, `Correct answer index should not repeat more than 2 times in a row (was ${maxConsecutiveSame})`);
  console.log('✓ Test 3 Passed: Correct answer index distributes evenly without repetitive positions');

  // Test 4: Toàn bộ các câu hỏi trong ngân hàng không có câu hỏi nào bị trùng đáp án
  for (const [id, qItem] of Object.entries(QUESTION_BANK)) {
    if (Array.isArray(qItem.choices) && qItem.choices.length > 1) {
      const set = new Set(qItem.choices);
      assert.equal(set.size, qItem.choices.length, `Question ${id} has duplicate choices`);
    }
  }
  console.log('✓ Test 4 Passed: 100% of all questions have unique choice sets');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runDragSortAndAntiRepeatTests();
}
