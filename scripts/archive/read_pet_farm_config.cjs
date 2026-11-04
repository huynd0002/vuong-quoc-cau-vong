const fs = require('fs');
const content = fs.readFileSync('src/content/maps/mapsConfig.js', 'utf8');
const lines = content.split('\n');

const start = lines.findIndex(l => l.includes('"map_pet_farm":'));
const end = lines.findIndex((l, idx) => idx > start && l.match(/^\s{2}"[a-zA-Z0-9_]+":\s*\{/));
console.log('map_pet_farm lines:', start, end);
console.log(lines.slice(start, end !== -1 ? end : start + 120).join('\n'));
