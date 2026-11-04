import fs from 'node:fs';

const normalize = s => s.replace(/\r\n/g, '\n');

// 1. Patch index.html & dev.html
for (const file of ['index.html', 'dev.html']) {
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const isCRLF = html.includes('\r\n');
  let norm = normalize(html);

  // Replace hero name tag
  norm = norm.replace(
    '<span class="arena-name-tag">✨ Bé Sâu Dũng Cảm</span>',
    '<span class="arena-name-tag" id="arena-hero-name">Bé Sam Kuromi</span>'
  );

  // Remove arena monster shadow
  norm = norm.replace(
    '<div class="arena-ground-shadow monster-ground-shadow" id="arena-monster-shadow" aria-hidden="true"></div>',
    '<!-- Monster shadow removed per user request -->'
  );

  fs.writeFileSync(file, isCRLF ? norm.replace(/\n/g, '\r\n') : norm, 'utf8');
  console.log(`Updated ${file}`);
}

// 2. Patch BattleArenaModal.js
let js = fs.readFileSync('src/game/ui/BattleArenaModal.js', 'utf8');
const isCRLFJs = js.includes('\r\n');
let normJs = normalize(js);

// Update getHeroSkinAssets name
normJs = normJs.replace("name: 'Bé Sâu Hiệp Sĩ'", "name: 'Bé Sam Kuromi'");
normJs = normJs.replace("name: 'Bé Sâu'", "name: 'Bé Sâu Dũng Cảm'");

// In openArena, update heroNameTag
const oldOpenCode = `    if (this.arenaHeroImg) {
      this.arenaHeroImg.src = this.getHeroSkinAssets().idleRight;
      this.arenaHeroImg.style.transform = 'none'; // Bé Sâu nhìn sang phải
    }`;

const newOpenCode = `    const heroAssets = this.getHeroSkinAssets();
    if (this.arenaHeroImg) {
      this.arenaHeroImg.src = heroAssets.idleRight;
      this.arenaHeroImg.style.transform = 'none';
    }
    const heroNameTag = document.getElementById('arena-hero-name') || this.arenaHeroBox?.querySelector('.arena-name-tag');
    if (heroNameTag) {
      heroNameTag.textContent = heroAssets.name;
    }`;

if (normJs.includes(oldOpenCode)) {
  normJs = normJs.replace(oldOpenCode, newOpenCode);
  console.log('Updated BattleArenaModal.js openArena logic');
}

fs.writeFileSync('src/game/ui/BattleArenaModal.js', isCRLFJs ? normJs.replace(/\n/g, '\r\n') : normJs, 'utf8');
console.log('Updated BattleArenaModal.js');
