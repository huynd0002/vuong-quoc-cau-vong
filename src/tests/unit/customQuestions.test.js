import assert from 'node:assert/strict';
import {
  QUESTION_BANK,
  getQuestion,
  getRandomZoneQuestion,
  addCustomQuestion,
  getCustomQuestions,
  deleteCustomQuestion
} from '../../content/questions/questionBank.js';
import { QuestionManagerModal, PARENTAL_SECURITY_PIN_KEY } from '../../game/ui/QuestionManagerModal.js';

export function runCustomQuestionsTests() {
  console.log('\n--- [Test] Quản Lý & Soạn Câu Hỏi Tùy Chỉnh (Custom Questions & PIN Security) ---');

  // Test 1: Khởi tạo danh sách câu hỏi tùy chỉnh
  const initialCustoms = getCustomQuestions();
  assert.ok(Array.isArray(initialCustoms), 'getCustomQuestions phải trả về một mảng');
  console.log('✓ Test 1 Passed: Custom questions initial list');

  // Test 2: Từ chối câu hỏi thiếu dữ liệu bắt buộc (Validation)
  const invalidRes = addCustomQuestion({
    prompt: '',
    choices: ['A']
  });
  assert.equal(invalidRes.success, false, 'Phải từ chối câu hỏi thiếu thông tin');
  assert.ok(invalidRes.errors.length > 0, 'Phải liệt kê các lỗi');
  console.log('✓ Test 2 Passed: Invalid question rejection');

  // Test 3: Thêm câu hỏi tùy chỉnh hợp lệ thành công
  const testQ = {
    zoneId: 'map1',
    skillId: 'colors',
    difficulty: 2,
    prompt: 'Bé đếm xem có mấy bạn sóc đang nhặt hạt dẻ? 🐿️',
    speak: 'Bé đếm xem có mấy bạn sóc đang nhặt hạt dẻ?',
    choices: ['3 bạn', '4 bạn', '5 bạn'],
    correct: 1, // 4 bạn
    hint: 'Bé thử đếm từng bạn sóc nhé!'
  };

  const addRes = addCustomQuestion(testQ);
  assert.equal(addRes.success, true, 'Thêm câu hỏi hợp lệ phải thành công');
  assert.ok(addRes.question.id.startsWith('q_map1_'), 'ID câu hỏi phải gắn liền với vùng map1');
  assert.equal(QUESTION_BANK[addRes.question.id].prompt, testQ.prompt, 'Câu hỏi mới phải tồn tại trong QUESTION_BANK');
  console.log('✓ Test 3 Passed: Valid custom question addition & storage');

  // Test 4: Truy xuất câu hỏi tùy chỉnh qua getQuestion()
  const fetchedQ = getQuestion(addRes.question.id);
  assert.equal(fetchedQ.prompt, testQ.prompt, 'getQuestion() phải tìm thấy câu hỏi tùy chỉnh');
  assert.equal(fetchedQ.correct, 1, 'Chỉ mục đáp án đúng phải chính xác');
  console.log('✓ Test 4 Passed: Retrieve custom question by getQuestion()');

  // Test 5: Câu hỏi xuất hiện trong candidate pool của getRandomZoneQuestion('map1')
  const foundInZone = getRandomZoneQuestion('map1', []);
  assert.ok(foundInZone && foundInZone.id, 'getRandomZoneQuestion() phải hoạt động trơn tru');
  console.log('✓ Test 5 Passed: Custom question integration with getRandomZoneQuestion()');

  // Test 6: Kiểm tra bảo mật mã PIN và đổi mã PIN của QuestionManagerModal
  const qm = new QuestionManagerModal();
  const defaultPin = qm.getSecurityPin();
  assert.equal(defaultPin, '1234', 'Mã PIN mặc định ban đầu phải là 1234');

  qm.setSecurityPin('5678');
  assert.equal(qm.getSecurityPin(), '5678', 'Mã PIN sau khi cập nhật phải là 5678');

  // Reset về 1234
  qm.setSecurityPin('1234');
  assert.equal(qm.getSecurityPin(), '1234', 'Mã PIN đã được hoàn trả về 1234');
  console.log('✓ Test 6 Passed: Parental Security PIN get, set & verification');

  // Test 7: Xóa câu hỏi tùy chỉnh
  const deleteRes = deleteCustomQuestion(addRes.question.id);
  assert.equal(deleteRes, true, 'Xóa câu hỏi thành công');
  assert.equal(QUESTION_BANK[addRes.question.id], undefined, 'Câu hỏi không còn trong QUESTION_BANK');
  console.log('✓ Test 7 Passed: Custom question deletion');
}
