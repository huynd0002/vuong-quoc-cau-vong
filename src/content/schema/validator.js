/**
 * Content Schema Validator
 * Xác thực dữ liệu câu hỏi (Question) và bản đồ (Map) trước khi tải vào game.
 * Từ chối mọi dữ liệu thiếu trường bắt buộc, sai kiểu hoặc tham chiếu không hợp lệ.
 */

export function validateQuestion(question) {
  const errors = [];

  if (!question || typeof question !== 'object') {
    return { valid: false, errors: ['Question phải là một object'] };
  }

  // 1. Kiểm tra id
  if (!question.id || typeof question.id !== 'string' || question.id.trim() === '') {
    errors.push('Trường "id" là bắt buộc và phải là chuỗi không rỗng');
  }

  // 2. Kiểm tra skillId
  if (!question.skillId || typeof question.skillId !== 'string') {
    errors.push('Trường "skillId" là bắt buộc và phải là chuỗi xác định kỹ năng');
  }

  // 3. Kiểm tra difficulty (1-5)
  if (typeof question.difficulty !== 'number' || question.difficulty < 1 || question.difficulty > 5) {
    errors.push('Trường "difficulty" phải là số trong khoảng từ 1 đến 5');
  }

  // 4. Kiểm tra prompt
  if (!question.prompt || typeof question.prompt !== 'string' || question.prompt.trim() === '') {
    errors.push('Trường "prompt" là bắt buộc và phải là chuỗi câu hỏi hiển thị');
  }

  // 5. Kiểm tra speak (giọng đọc tiếng Việt)
  if (!question.speak || typeof question.speak !== 'string' || question.speak.trim() === '') {
    errors.push('Trường "speak" là bắt buộc và phải là chuỗi lời đọc tiếng Việt');
  }

  // 6. Kiểm tra choices
  if (!Array.isArray(question.choices) || question.choices.length < 2) {
    errors.push('Trường "choices" phải là mảng chứa ít nhất 2 đáp án');
  } else {
    for (let i = 0; i < question.choices.length; i++) {
      if (typeof question.choices[i] !== 'string' || question.choices[i].trim() === '') {
        errors.push(`Đáp án tại vị trí ${i} không được rỗng`);
      }
    }
  }

  // 7. Kiểm tra correct
  if (
    typeof question.correct !== 'number' ||
    !Number.isInteger(question.correct) ||
    !Array.isArray(question.choices) ||
    question.correct < 0 ||
    question.correct >= question.choices.length
  ) {
    errors.push('Trường "correct" phải là số nguyên chỉ mục hợp lệ trong danh sách choices');
  }

  // 8. Kiểm tra hint
  if (!question.hint || typeof question.hint !== 'string') {
    errors.push('Trường "hint" là bắt buộc để hỗ trợ trẻ khi cần gợi ý');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateMap(mapConfig) {
  const errors = [];

  if (!mapConfig || typeof mapConfig !== 'object') {
    return { valid: false, errors: ['MapConfig phải là một object'] };
  }

  if (!mapConfig.id || typeof mapConfig.id !== 'string') {
    errors.push('Trường "id" của Map là bắt buộc');
  }

  if (!mapConfig.name || typeof mapConfig.name !== 'string') {
    errors.push('Trường "name" của Map là bắt buộc');
  }

  if (typeof mapConfig.order !== 'number' || mapConfig.order < 1 || mapConfig.order > 6) {
    errors.push('Trường "order" của Map phải là số từ 1 đến 6');
  }

  if (!mapConfig.objective || typeof mapConfig.objective !== 'string') {
    errors.push('Trường "objective" của Map là bắt buộc');
  }

  if (!Array.isArray(mapConfig.encounters) || mapConfig.encounters.length === 0) {
    errors.push('Map phải có ít nhất 1 encounter (thử thách)');
  } else {
    mapConfig.encounters.forEach((enc, idx) => {
      if (!enc.id || typeof enc.id !== 'string') {
        errors.push(`Encounter index ${idx} thiếu "id"`);
      }
      if (typeof enc.x !== 'number' || typeof enc.y !== 'number') {
        errors.push(`Encounter "${enc.id || idx}" thiếu tọa độ x, y hợp lệ`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateQuestionBank(bank) {
  const report = { total: 0, valid: 0, invalid: 0, errors: {} };
  if (!bank || typeof bank !== 'object') {
    return { ...report, generalError: 'Ngân hàng câu hỏi không hợp lệ' };
  }

  const questions = Array.isArray(bank) ? bank : Object.values(bank);
  report.total = questions.length;

  for (const q of questions) {
    const res = validateQuestion(q);
    if (res.valid) {
      report.valid += 1;
    } else {
      report.invalid += 1;
      report.errors[q.id || 'unknown'] = res.errors;
    }
  }

  return report;
}
