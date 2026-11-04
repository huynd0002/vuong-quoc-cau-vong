import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_DIR = path.resolve('assets/audio');
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const BGM_SOURCES = [
  {
    key: 'bgm_pet_farm',
    url: 'https://raw.githubusercontent.com/SoundSafari/CC0-1.0-Music/main/freepd.com/Happy%20Whistling%20Ukulele.mp3',
    start: 0,
    duration: 45
  },
  {
    key: 'bgm_fishing_pond',
    url: 'https://raw.githubusercontent.com/SoundSafari/CC0-1.0-Music/main/freepd.com/Coy%20Koi.mp3',
    start: 0,
    duration: 40
  },
  {
    key: 'bgm_rainbow_market',
    url: 'https://raw.githubusercontent.com/SoundSafari/CC0-1.0-Music/main/freepd.com/Connecting%20Rainbows.mp3',
    start: 0,
    duration: 42
  },
  {
    key: 'bgm_kitchen',
    url: 'https://raw.githubusercontent.com/SoundSafari/CC0-1.0-Music/main/freepd.com/Brewing%20Potions.mp3',
    start: 0,
    duration: 40
  },
  {
    key: 'bgm_adventure_main',
    url: 'https://raw.githubusercontent.com/SoundSafari/CC0-1.0-Music/main/freepd.com/Magic%20in%20the%20Garden.mp3',
    start: 0,
    duration: 42
  },
  {
    key: 'bgm_battle_boss',
    url: 'https://raw.githubusercontent.com/SoundSafari/CC0-1.0-Music/main/freepd.com/Comic%20Game%20Loop%20-%20Mischief.mp3',
    start: 0,
    duration: 36
  }
];

const SFX_SOURCES = [
  // Coin / buy
  {
    key: 'sfx_coin_buy',
    url: 'https://raw.githubusercontent.com/Boyquotes/kenney-rpg-audio-for-godot/master/addons/kenney%20rpg%20audio/handle_coins.ogg'
  },
  // Bag / cloth
  {
    key: 'sfx_bag_open',
    url: 'https://raw.githubusercontent.com/Boyquotes/kenney-rpg-audio-for-godot/master/addons/kenney%20rpg%20audio/cloth_belt.ogg'
  },
  // Equip / confirmation
  {
    key: 'sfx_equip_accessory',
    url: 'https://raw.githubusercontent.com/Calinou/kenney-interface-sounds/master/addons/kenney_interface_sounds/confirmation_001.wav'
  },
  // Drag drop
  {
    key: 'sfx_drag_drop',
    url: 'https://raw.githubusercontent.com/Boyquotes/kenney-rpg-audio-for-godot/master/addons/kenney%20rpg%20audio/drop_leather.ogg'
  },
  // Card flip
  {
    key: 'sfx_card_flip',
    url: 'https://raw.githubusercontent.com/ismetcabbar9-oss/kenney-audio-assets/master/Audio%20(295%20files)/Casino%20sounds%20(50%20sounds)/cardPlace1.ogg'
  },
  // Water splash (fishing & bath)
  {
    key: 'sfx_bobber_splash',
    url: 'https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/master/40-cc0-water-splash-slime-sfx/splash_01.ogg'
  },
  // Water bubble (fishing bite)
  {
    key: 'sfx_fish_bite',
    url: 'https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/master/40-cc0-water-splash-slime-sfx/bubble_01.ogg'
  },
  // Rod cast swoosh
  {
    key: 'sfx_cast_rod',
    url: 'https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/master/Micro%20Pack%20-%20Organic%20Wooshes/Gentle%20Swish.wav'
  },
  // Pet barking
  {
    key: 'sfx_pet_bark',
    url: 'https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/master/80-CC0-creature-SFX/barking_01.ogg'
  },
  // Cooking sizzle / pot
  {
    key: 'sfx_cooking_sizzle',
    url: 'https://raw.githubusercontent.com/Boyquotes/kenney-rpg-audio-for-godot/master/addons/kenney%20rpg%20audio/metal_pot_1.ogg'
  },
  // Dish complete fanfare
  {
    key: 'sfx_dish_complete',
    url: 'https://raw.githubusercontent.com/ismetcabbar9-oss/kenney-audio-assets/master/Audio%20(295%20files)/Jingle%20sounds%20(85%20sounds)/jingles_PIZZA/jingles_PIZZA01.ogg'
  }
];

async function downloadFile(url, dest) {
  console.log(`Downloading: ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function run() {
  console.log('=== BẮT ĐẦU TẢI & TỐI ƯU HÓA AUDIO CC0 ===');
  const tempDir = path.resolve('temp_audio_dl');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  // 1. Tải và xử lý BGM
  for (const bgm of BGM_SOURCES) {
    const rawPath = path.join(tempDir, `${bgm.key}_raw.mp3`);
    const outPath = path.join(TARGET_DIR, `${bgm.key}.ogg`);
    try {
      await downloadFile(bgm.url, rawPath);
      // Dùng ffmpeg cắt loop chuẩn và nén Vorbis 64k chất lượng cao, dung lượng siêu nhẹ (~300KB)
      // Thêm afade mượt mà ở 1.5s cuối để loop hoàn hảo không bị giật tiếng
      const fadeStart = bgm.duration - 1.5;
      const cmd = `ffmpeg -y -ss ${bgm.start} -t ${bgm.duration} -i "${rawPath}" -c:a libvorbis -b:a 64k -af "afade=t=in:st=0:d=0.5,afade=t=out:st=${fadeStart}:d=1.5" "${outPath}"`;
      execSync(cmd, { stdio: 'pipe' });
      const stats = fs.statSync(outPath);
      console.log(`✓ Đã tạo BGM: ${bgm.key}.ogg (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`Lỗi tải BGM ${bgm.key}:`, err.message);
    }
  }

  // 2. Tải và xử lý SFX
  for (const sfx of SFX_SOURCES) {
    const rawExt = path.extname(sfx.url);
    const rawPath = path.join(tempDir, `${sfx.key}_raw${rawExt}`);
    const outPath = path.join(TARGET_DIR, `${sfx.key}.ogg`);
    try {
      await downloadFile(sfx.url, rawPath);
      const cmd = `ffmpeg -y -i "${rawPath}" -c:a libvorbis -b:a 64k "${outPath}"`;
      execSync(cmd, { stdio: 'pipe' });
      const stats = fs.statSync(outPath);
      console.log(`✓ Đã tạo SFX: ${sfx.key}.ogg (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`Lỗi tải SFX ${sfx.key}:`, err.message);
    }
  }

  // Dọn dẹp temp
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('\n🎉 TẤT CẢ FILE AUDIO ĐÃ ĐƯỢC TẢI VÀ CHUẨN HÓA VÀO assets/audio!');
}

run();
