import fs from 'node:fs';

const files = [
  'package.json',
  'src/app/main.js',
  'public/sw.js',
  'index.html',
  'dev.html',
  'scripts/verify_live_vercel.mjs'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/3\.6\.9/g, '3.7.0');
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Bumped version in ${file} to 3.7.0`);
}
