const fs = require('fs');
const content = fs.readFileSync('src/content/maps/mapsConfig.js', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(789, 1000).join('\n'));
