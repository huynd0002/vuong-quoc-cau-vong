import { describe, it } from 'node:test';
import assert from 'node:assert';
import { audioService } from '../../services/audio/audioService.js';

describe('Kiểm thử Giọng đọc TTS & Làm sạch văn bản phát âm cho Bé (cleanTextForSpeech)', () => {
  it('1. Giữ nguyên dấu hỏi ? ở câu hỏi thông thường, không biến thành "mấy"', () => {
    const raw = 'Bông hoa hướng dương có màu gì vậy bé?';
    const clean = audioService.cleanTextForSpeech(raw);
    assert.strictEqual(clean, 'Bông hoa hướng dương có màu gì vậy bé?');
    assert.ok(!clean.includes('mấy'), 'Không được chèn chữ "mấy" vào câu hỏi thông thường');
  });

  it('2. Phép toán có dấu hỏi kết quả: biến (= ? hoặc bằng ?) thành "bằng mấy?"', () => {
    const raw1 = '3 + 2 = ?';
    const clean1 = audioService.cleanTextForSpeech(raw1);
    assert.strictEqual(clean1, '3 cộng 2 bằng mấy?');

    const raw2 = 'Bé tính xem: 8 - 3 bằng ?';
    const clean2 = audioService.cleanTextForSpeech(raw2);
    assert.strictEqual(clean2, 'Bé tính xem: 8 trừ 3 bằng mấy?');
  });

  it('3. Khoảng số có dấu gạch ngang: biến thành "đến" thay vì "trừ"', () => {
    const raw = 'Trò chơi học tập bổ ích dành cho bé 5-6 tuổi!';
    const clean = audioService.cleanTextForSpeech(raw);
    assert.ok(clean.includes('5 đến 6 tuổi'), `Cụm từ phải là "5 đến 6 tuổi", thực tế là: ${clean}`);
    assert.ok(!clean.includes('5 trừ 6'), 'Không được đọc thành "5 trừ 6"');
  });

  it('4. Chuẩn hóa số lượng x và phân số tỉ lệ', () => {
    const raw1 = 'Bé cần câu Cá Rô Đồng x 2 để hoàn thành món canh!';
    const clean1 = audioService.cleanTextForSpeech(raw1);
    assert.ok(clean1.includes('Cá Rô Đồng 2 phần'));

    const raw2 = 'Bé đã tìm được 1/2 cặp thẻ bài giống nhau!';
    const clean2 = audioService.cleanTextForSpeech(raw2);
    assert.ok(clean2.includes('1 trên 2 cặp thẻ'));
  });

  it('5. Lọc sạch toàn bộ Emoji, biểu tượng và HTML tags', () => {
    const raw = '✨ <b>Chúc mừng Bé!</b> 🦁 Sư tử đã về đích an toàn! 🌸🎉';
    const clean = audioService.cleanTextForSpeech(raw);
    assert.strictEqual(clean, 'Chúc mừng Bé! Sư tử đã về đích an toàn!');
  });

  it('6. AudioService.speak phải tự động lọc text qua cleanTextForSpeech', (t) => {
    let capturedText = null;
    const fakeSynth = {
      paused: false,
      cancel: () => {},
      resume: () => {},
      getVoices: () => [{ lang: 'vi-VN', name: 'Vietnamese Voice' }],
      speak: (utterance) => {
        capturedText = utterance.text;
      }
    };

    // Mock SpeechSynthesisUtterance trong Node.js nếu chưa có
    const originalUtterance = global.SpeechSynthesisUtterance;
    global.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };

    const originalSoundEnabled = audioService.soundEnabled;
    const originalSynth = audioService.speechSynth;
    audioService.soundEnabled = true;
    audioService.speechSynth = fakeSynth;

    audioService.speak('🃏 Bé hãy lật tìm 2 thẻ hình con vật giống nhau nhé! ✨');

    // Chờ 100ms cho timeout bên trong speak
    return new Promise((resolve) => {
      setTimeout(() => {
        audioService.soundEnabled = originalSoundEnabled;
        audioService.speechSynth = originalSynth;
        global.SpeechSynthesisUtterance = originalUtterance;
        assert.ok(capturedText, 'Đã gửi utterance');
        assert.strictEqual(capturedText, 'Bé hãy lật tìm 2 thẻ hình con vật giống nhau nhé!');
        assert.ok(!capturedText.includes('🃏') && !capturedText.includes('✨'), 'Lọc sạch emoji trước khi speak');
        resolve();
      }, 100);
    });
  });
});
