const fs = require('fs');
const heroContent = fs.readFileSync('src/game/entities/Hero.js', 'utf8');
const lines = heroContent.split('\n');
console.log('--- Hero.js header & skin logic ---');
console.log(lines.slice(0, 100).join('\n'));
