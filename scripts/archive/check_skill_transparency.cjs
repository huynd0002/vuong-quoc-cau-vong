const fs = require('fs');
const { PNG } = require('pngjs');

const skillFiles = [
  'assets/monsters/boss_dragon/dragon_fireball_proj.png',
  'assets/monsters/boss_dragon/dragon_fire_impact.png',
  'assets/monsters/map1/mushroom_proj.png',
  'assets/monsters/map1/mushroom_impact.png',
  'assets/monsters/map1/bee_proj.png',
  'assets/monsters/map1/bee_impact.png',
  'assets/monsters/map1/ladybug_proj.png',
  'assets/monsters/map1/ladybug_impact.png',
  'assets/monsters/map2/mon_crab_proj.png',
  'assets/monsters/map2/mon_crab_impact.png',
  'assets/monsters/map2/mon_starfish_proj.png',
  'assets/monsters/map2/mon_starfish_impact.png',
  'assets/monsters/map2/mon_emerald_crab_proj.png',
  'assets/monsters/map2/mon_emerald_crab_impact.png',
  'assets/monsters/map2/boss_crab_king_proj.png',
  'assets/monsters/map2/boss_crab_king_impact.png',
  'assets/monsters/map3/crystal_sprout_proj.png',
  'assets/monsters/map3/crystal_sprout_impact.png',
  'assets/monsters/map3/crystal_moth_proj.png',
  'assets/monsters/map3/crystal_moth_impact.png',
  'assets/monsters/map3/crystal_bat_proj.png',
  'assets/monsters/map3/crystal_bat_impact.png',
  'assets/monsters/map3/boss_crystal_dragon_proj.png',
  'assets/monsters/map3/boss_crystal_dragon_impact.png'
];

for (const file of skillFiles) {
  if (!fs.existsSync(file)) {
    console.log(file, 'NOT FOUND');
    continue;
  }
  const data = fs.readFileSync(file);
  const png = PNG.sync.read(data);
  let opaqueCount = 0;
  let transparentCount = 0;
  let cornerAlphas = [];
  
  // check 4 corners
  const corners = [
    0, // top-left
    (png.width - 1) * 4, // top-right
    ((png.height - 1) * png.width) * 4, // bottom-left
    ((png.height - 1) * png.width + (png.width - 1)) * 4 // bottom-right
  ];
  corners.forEach(idx => {
    cornerAlphas.push({
      r: png.data[idx],
      g: png.data[idx+1],
      b: png.data[idx+2],
      a: png.data[idx+3]
    });
  });

  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] === 0) transparentCount++;
    else if (png.data[i + 3] === 255) opaqueCount++;
  }

  const isCornerOpaque = cornerAlphas.some(c => c.a > 30);
  console.log(file, `w:${png.width} h:${png.height}`, `trans:${transparentCount}`, `opaque:${opaqueCount}`, isCornerOpaque ? '⚠️ CORNER OPAQUE!' : 'OK transparent corners', JSON.stringify(cornerAlphas[0]));
}
