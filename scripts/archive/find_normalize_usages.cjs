const fs = require('fs');
const content = fs.readFileSync('src/services/save/saveAdapter.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('normalizeCookingState') || l.includes('normalizeFishingState') || l.includes('cooking:') || l.includes('fishing:')) {
    console.log(i + 1, l);
  }
});
