const fs = require('fs');
const preloadContent = fs.readFileSync('src/game/scenes/PreloadScene.js', 'utf8');
const lines = preloadContent.split('\n');
console.log('--- PreloadScene.js ---');
console.log(lines.slice(0, 100).join('\n'));
