const fs = require('fs');
const content = fs.readFileSync('src/services/save/saveAdapter.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('stars') || l.includes('updatePlayer') || l.includes('addStars')) {
    console.log(i + 1, l);
  }
});
