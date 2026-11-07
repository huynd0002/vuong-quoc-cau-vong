import fs from 'fs';

function replaceInFile(filePath, fromPattern, toStr) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(fromPattern, toStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated version in ${filePath}`);
}

// 1. package.json
replaceInFile('package.json', '"version": "3.7.0"', '"version": "3.7.1"');

// 2. src/app/main.js
replaceInFile('src/app/main.js', "GAME_VERSION = '3.7.0'", "GAME_VERSION = '3.7.1'");

// 3. public/sw.js
replaceInFile('public/sw.js', 'rainbow-kingdom-cache-v3.7.0', 'rainbow-kingdom-cache-v3.7.1');

// 4. index.html
replaceInFile('index.html', /ver 3\.7\.0/g, 'ver 3.7.1');

// 5. dev.html
replaceInFile('dev.html', /ver 3\.7\.0/g, 'ver 3.7.1');

// 6. game.html
replaceInFile('game.html', /ver 3\.6\.4/g, 'ver 3.7.1');

// 7. scripts/verify_live_vercel.mjs
replaceInFile('scripts/verify_live_vercel.mjs', /3\.7\.0/g, '3.7.1');

console.log('Bump to v3.7.1 complete!');
