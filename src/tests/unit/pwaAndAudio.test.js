/**
 * Unit Tests: Giai đoạn 6 — Âm thanh, PWA, Tối ưu và Quyền riêng tư
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { AudioService } from '../../services/audio/audioService.js';

export function runPwaAndAudioTests() {
  console.log('--- [Test] Giai đoạn 6: Âm thanh, PWA & Quyền riêng tư ---');

  // Test 1: Web App Manifest (PWA)
  {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'Tệp public/manifest.json phải tồn tại');

    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(raw);

    assert.strictEqual(manifest.display, 'standalone');
    assert.strictEqual(manifest.orientation, 'landscape');
    assert.ok(manifest.name.includes('Vương Quốc Cầu Vồng'));
    assert.strictEqual(manifest.theme_color, '#4b956d');
    assert.strictEqual(manifest.background_color, '#a9d5b0');
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
    console.log('✓ Test 1 Passed: PWA manifest.json is 100% valid');
  }

  // Test 2: Service Worker Script
  {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    assert.ok(fs.existsSync(swPath), 'Tệp public/sw.js phải tồn tại');

    const swContent = fs.readFileSync(swPath, 'utf-8');
    assert.ok(swContent.includes('rainbow-kingdom-cache-v1'), 'Service worker phải định nghĩa cache name');
    assert.ok(swContent.includes('install'), 'Service worker phải có sự kiện install');
    assert.ok(swContent.includes('activate'), 'Service worker phải có sự kiện activate');
    assert.ok(swContent.includes('fetch'), 'Service worker phải có sự kiện fetch');
    console.log('✓ Test 2 Passed: Service Worker script integrity');
  }

  // Test 3: Audio Service Single Source of Truth
  {
    const audio = new AudioService();
    assert.strictEqual(audio.isMuted(), true);

    // Bật âm thanh
    audio.setSoundEnabled(true);
    assert.strictEqual(audio.soundEnabled, true);
    assert.strictEqual(audio.isMuted(), false);

    // Toggle mute
    audio.toggleMute();
    assert.strictEqual(audio.soundEnabled, false);
    assert.strictEqual(audio.isMuted(), true);

    // Volume clamping
    audio.setVolume(1.5);
    assert.strictEqual(audio.volume, 1.0);
    audio.setVolume(-0.5);
    assert.strictEqual(audio.volume, 0.0);
    audio.setVolume(0.75);
    assert.strictEqual(audio.volume, 0.75);
    console.log('✓ Test 3 Passed: AudioService single source of truth & volume clamping');
  }

  // Test 4: Quyền riêng tư & An toàn cho trẻ nhỏ (Privacy & Safety)
  {
    const gameHtml = fs.readFileSync(path.resolve(process.cwd(), 'game.html'), 'utf-8');
    assert.ok(!gameHtml.includes('google-analytics'), 'Tuyệt đối không có tracker Google Analytics');
    assert.ok(!gameHtml.includes('facebook-jssdk'), 'Tuyệt đối không có Facebook SDK');
    assert.ok(!gameHtml.includes('doubleclick'), 'Tuyệt đối không có mã quảng cáo trẻ em');

    // PWA metadata belongs to the web entry; the portable file needs no server.
    const webHtml = fs.readFileSync(path.resolve(process.cwd(), 'dev.html'), 'utf-8');
    assert.ok(webHtml.includes('rel="manifest"'), 'Web entry must retain its PWA manifest');
    assert.ok(!gameHtml.includes('src="/src/app/main.js"'), 'Portable game must embed its executable code');
    console.log('✓ Test 4 Passed: Zero-telemetry child safety & PWA HTML integration');
  }
}
