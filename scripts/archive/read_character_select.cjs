const fs = require('fs');
const content = fs.readFileSync('src/game/ui/CharacterSelectModal.js', 'utf8');
const lines = content.split('\n');
console.log('--- CharacterSelectModal.js ---');
console.log(lines.slice(0, 100).join('\n'));
