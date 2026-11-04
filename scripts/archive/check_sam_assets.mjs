import fs from 'node:fs';

const files = [
  'assets/hero/sau_upgrade/hero_upgrade_idle.png',
  'assets/hero/sau_upgrade/hero_upgrade_idle_sheet.png',
  'assets/hero/sau_upgrade/hero_upgrade_walk_sheet.png',
  'assets/hero/sam/sam_idle.png',
  'assets/hero/sam/sam_idle.webp',
  'assets/hero/sam/sam_attack.webp'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const stat = fs.statSync(f);
    console.log(f, 'exists, size:', stat.size);
  } else {
    console.log(f, 'DOES NOT EXIST');
  }
}
