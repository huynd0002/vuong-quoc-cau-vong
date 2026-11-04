import fs from 'fs';

const content = fs.readFileSync('src/content/maps/mapsConfig.js', 'utf8');
const regex = /"reward":\s*\{[^}]+\}/g;
const matches = content.match(regex);
console.log('Reward blocks count:', matches ? matches.length : 0);
if (matches) {
  const unique = [...new Set(matches)];
  console.log('Unique rewards in mapsConfig:');
  unique.forEach(u => console.log(u));
}
