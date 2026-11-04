const fs = require('fs');
const content = fs.readFileSync('src/content/maps/mapsConfig.js', 'utf8');

// match top level keys inside MAPS_CONFIG
const lines = content.split('\n');
const mapKeys = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/^\s{2}"([a-zA-Z0-9_]+)":\s*\{/);
  if (m) {
    mapKeys.push(m[1]);
  }
}
console.log('Top-level map keys:', mapKeys);
