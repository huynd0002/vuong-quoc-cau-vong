# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

NEW_FISH_SPECIES = '''export const FISH_DIFFICULTY_PROFILES = Object.freeze({
  cloud_fish: {
    requiredHits: 1,
    zoneHeight: 46,
    markerSpeed: 58,
    label: 'Cực Dễ · 1 Lần Canh'
  },
  lotus_fish: {
    requiredHits: 2,
    zoneHeight: 38,
    markerSpeed: 76,
    label: 'Dễ · 2 Lần Canh'
  },
  orange_fish: {
    requiredHits: 3,
    zoneHeight: 30,
    markerSpeed: 98,
    label: 'Khó Vừa · 3 Lần Canh'
  },
  silver_bell_fish: {
    requiredHits: 4,
    zoneHeight: 24,
    markerSpeed: 124,
    label: 'Khó · 4 Lần Canh'
  },
  sun_spot_fish: {
    requiredHits: 5,
    zoneHeight: 18,
    markerSpeed: 148,
    label: 'Rất Khó · 5 Lần Canh'
  },
  rainbow_fish: {
    requiredHits: 5,
    zoneHeight: 14,
    markerSpeed: 176,
    label: 'Thần Thoại · 5 Lần Canh'
  }
});

export const FISH_SPECIES = Object.freeze([
  {
    id: 'cloud_fish',
    name: 'Cá Mây Tròn',
    icon: '🐟',
    color: '#7dd3fc',
    asset: '/assets/fishing/fish_cloud.png',
    swimSheetKey: 'fish_cloud_swim_8dir',
    minWeightG: 100,
    maxWeightG: 300,
    pullStages: 1,
    requiredHits: 1,
    requiredPullSteps: 3,
    pullStepsLabel: '1 Nhịp Kéo (Cực Dễ)',
    zoneHeight: 46,
    markerSpeed: 58,
    sweepDurationMs: 2400,
    greenZoneRatio: 0.46,
    fakeNibblesMin: 1,
    fakeNibblesMax: 1,
    splashChance: 0.15,
    splashDurationMs: 1100,
    preferredBaits: ['bait_lotus', 'bait_crunchy'],
    preferredDock: 'lotus_dock',
    temperament: 'Chậm rãi, hiền lành, chỉ cần 1 nhịp canh chuẩn là vọt lên bờ.',
    hint: 'Thích Mồi Lá Tập ở Bến Sen',
    voiceIntro: 'Cá Mây Tròn bụ bẫm như đám mây nhỏ trên bầu trời!'
  },
  {
    id: 'lotus_fish',
    name: 'Cá Lá Sen',
    icon: '🐠',
    color: '#34d399',
    asset: '/assets/fishing/fish_lotus.png',
    swimSheetKey: 'fish_pond_swim_8dir',
    minWeightG: 250,
    maxWeightG: 600,
    pullStages: 2,
    requiredHits: 2,
    requiredPullSteps: 4,
    pullStepsLabel: '2 Nhịp Kéo (Dễ)',
    zoneHeight: 38,
    markerSpeed: 76,
    sweepDurationMs: 2250,
    greenZoneRatio: 0.38,
    fakeNibblesMin: 1,
    fakeNibblesMax: 2,
    splashChance: 0.25,
    splashDurationMs: 1200,
    preferredBaits: ['bait_lotus', 'bait_crunchy'],
    preferredDock: 'lotus_dock',
    temperament: 'Bơi quanh lá sen, cần 2 lần canh nhịp nhàng để bắt.',
    hint: 'Thích Mồi Lá Tập hoặc Mồi Hạt Giòn ở Bến Sen',
    voiceIntro: 'Cá Lá Sen có chiếc vây hồng xinh như cánh hoa sen!'
  },
  {
    id: 'orange_fish',
    name: 'Cá Cam Lém Lỉnh',
    icon: '🍊',
    color: '#fb923c',
    asset: '/assets/fishing/fish_orange.png',
    swimSheetKey: 'fish_orange_swim_8dir',
    minWeightG: 300,
    maxWeightG: 700,
    pullStages: 3,
    requiredHits: 3,
    requiredPullSteps: 5,
    pullStepsLabel: '3 Nhịp Kéo (Khó Vừa)',
    zoneHeight: 30,
    markerSpeed: 98,
    sweepDurationMs: 2150,
    greenZoneRatio: 0.30,
    fakeNibblesMin: 2,
    fakeNibblesMax: 3,
    splashChance: 0.35,
    splashDurationMs: 1250,
    preferredBaits: ['bait_crunchy'],
    preferredDock: 'sunny_dock',
    temperament: 'Hay rỉa thử và đảo hướng, cần 3 lần canh dứt khoát.',
    hint: 'Thích Mồi Hạt Giòn ở Bến Nắng',
    voiceIntro: 'Cá Cam Lém Lỉnh tinh nghịch, hay chạm nhẹ phao thử tài kiên nhẫn của bé!'
  },
  {
    id: 'silver_bell_fish',
    name: 'Cá Chuông Bạc',
    icon: '🔔',
    color: '#93c5fd',
    asset: '/assets/fishing/fish_silver_bell.png',
    swimSheetKey: 'fish_cloud_swim_8dir',
    minWeightG: 400,
    maxWeightG: 900,
    pullStages: 4,
    requiredHits: 4,
    requiredPullSteps: 6,
    pullStepsLabel: '4 Nhịp Kéo (Khó)',
    zoneHeight: 24,
    markerSpeed: 124,
    sweepDurationMs: 2050,
    greenZoneRatio: 0.24,
    fakeNibblesMin: 1,
    fakeNibblesMax: 2,
    splashChance: 0.40,
    splashDurationMs: 1300,
    preferredBaits: ['bait_crunchy', 'bait_sweet_cake'],
    preferredDock: 'lotus_dock',
    temperament: 'Quẫy nước ngân vang như tiếng chuông, cần 4 lần canh vững vàng.',
    hint: 'Thích Mồi Hạt Giòn hoặc Mồi Bánh Thơm',
    voiceIntro: 'Cá Chuông Bạc lấp lánh ánh bạc, chiếc đuôi khẽ rung như chuông nhỏ!'
  },
  {
    id: 'sun_spot_fish',
    name: 'Cá Đốm Nắng',
    icon: '☀️',
    color: '#fbbf24',
    asset: '/assets/fishing/fish_sun_spot.png',
    swimSheetKey: 'fish_orange_swim_8dir',
    minWeightG: 700,
    maxWeightG: 1400,
    pullStages: 5,
    requiredHits: 5,
    requiredPullSteps: 7,
    pullStepsLabel: '5 Nhịp Kéo (Rất Khó)',
    zoneHeight: 18,
    markerSpeed: 148,
    sweepDurationMs: 2100,
    greenZoneRatio: 0.18,
    fakeNibblesMin: 2,
    fakeNibblesMax: 3,
    splashChance: 0.45,
    splashDurationMs: 1350,
    preferredBaits: ['bait_sweet_cake'],
    preferredDock: 'sunny_dock',
    temperament: 'Thân hình to tròn khỏe khoắn, cần 5 lần canh dứt khoát kiên trì.',
    hint: 'Thích Mồi Bánh Thơm ở Bến Nắng',
    voiceIntro: 'Chà! Cá Đốm Nắng to tròn ấm áp như tia nắng mùa hè!'
  },
  {
    id: 'rainbow_fish',
    name: 'Cá Cầu Vồng',
    icon: '🌈',
    color: '#c084fc',
    asset: '/assets/fishing/fish_rainbow.png',
    swimSheetKey: 'fish_pond_swim_8dir',
    minWeightG: 1000,
    maxWeightG: 2000,
    pullStages: 5,
    requiredHits: 5,
    requiredPullSteps: 8,
    pullStepsLabel: '5 Nhịp Kéo (Thần Thoại)',
    zoneHeight: 14,
    markerSpeed: 176,
    sweepDurationMs: 1950,
    greenZoneRatio: 0.14,
    fakeNibblesMin: 2,
    fakeNibblesMax: 4,
    splashChance: 0.55,
    splashDurationMs: 1500,
    preferredBaits: ['bait_sweet_cake'],
    preferredDock: 'lotus_dock',
    temperament: 'Cá thần thoại 7 sắc tuyệt đẹp, cần 5 lần canh đỉnh cao với điểm canh siêu nhỏ và tốc độ nhanh.',
    hint: 'Rất quý hiếm! Dùng Mồi Bánh Thơm và Cần Cầu Vồng / Rồng Thần',
    voiceIntro: 'Ôi kì diệu quá! Cá Cầu Vồng thần thoại lung linh bảy sắc đang cắn câu!'
  }
]);'''

with open('src/content/fishing/fishingData.js', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = 'export const FISH_SPECIES = Object.freeze(['
end_marker = ']);\n\n/**\n * Bảng trọng số xuất hiện'
if end_marker not in content:
    end_marker = ']);\r\n\r\n/**\r\n * Bảng trọng số xuất hiện'

idx_start = content.find(start_marker)
idx_end = content.find(end_marker)

if idx_start == -1 or idx_end == -1:
    print(f"ERROR: could not locate markers: start={idx_start}, end={idx_end}")
    sys.exit(1)

new_content = content[:idx_start] + NEW_FISH_SPECIES + content[idx_end + 3:]

with open('src/content/fishing/fishingData.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("fishingData.js updated successfully with FISH_DIFFICULTY_PROFILES and per-fish hits, zoneHeight, markerSpeed!")
