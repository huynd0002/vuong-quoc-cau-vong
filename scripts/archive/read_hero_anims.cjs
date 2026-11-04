const fs = require('fs');
const heroContent = fs.readFileSync('src/game/entities/Hero.js', 'utf8');
const lines = heroContent.split('\n');
console.log('--- Hero.js texture/anim methods ---');
console.log(lines.slice(90, 220).join('\n'));
