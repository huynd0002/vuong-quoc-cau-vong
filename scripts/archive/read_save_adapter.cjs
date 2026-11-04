const fs = require('fs');
const content = fs.readFileSync('src/services/save/saveAdapter.js', 'utf8');
const lines = content.split('\n');
console.log('--- saveAdapter.js ---');
console.log(lines.slice(0, 80).join('\n'));
