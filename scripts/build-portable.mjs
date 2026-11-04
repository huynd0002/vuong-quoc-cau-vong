import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const mime = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg' };
const used = new Set();
async function dataUrl(filename) {
  used.add(path.relative(root, filename));
  const buf = await readFile(filename);
  let mimeType = mime[path.extname(filename)] || 'application/octet-stream';
  if (buf.length >= 8) {
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      mimeType = 'image/png';
    } else if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
      mimeType = 'image/jpeg';
    } else if (buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') {
      mimeType = 'image/webp';
    }
  }
  return `data:${mimeType};base64,${buf.toString('base64')}`;
}
const result = await build({
  absWorkingDir: root, entryPoints: ['src/app/main.js'], bundle: true,
  minify: true, format: 'iife', target: 'es2020', write: false,
  outfile: 'portable.js', legalComments: 'none',
  plugins: [{ name: 'embedded-assets', setup(api) {
    // Dynamic HUD updates and modal templates also contain literal asset URLs.
    // Embed these as well as imported assets; otherwise file:// resolves them
    // against the drive root and the next HUD refresh breaks the image.
    api.onLoad({ filter: /\.js$/ }, async args => {
      if (!args.path.startsWith(path.join(root, 'src'))) return;
      let contents = await readFile(args.path, 'utf8');
      const urls = new Set(contents.match(/(?<![.\w])\/assets\/[a-zA-Z0-9_./-]+\.(?:png|webp|jpg|svg|gif|mp3|wav|ogg)/g) || []);
      for (const url of urls) contents = contents.replaceAll(url, await dataUrl(path.join(root, url)));
      return { contents, loader: 'js', resolveDir: path.dirname(args.path) };
    });
    api.onResolve({ filter: /\.(png|webp|jpg|svg|gif|mp3|wav|ogg)(\?url)?$/ }, args => ({
      path: args.path.startsWith('/assets/') ? path.join(root, args.path) : path.resolve(args.resolveDir, args.path.replace(/\?url$/, '')),
      namespace: 'embedded-asset'
    }));
    api.onLoad({ filter: /.*/, namespace: 'embedded-asset' }, async args => {
      used.add(path.relative(root, args.path));
      return { contents: await readFile(args.path), loader: 'dataurl' };
    });
    api.onLoad({ filter: /\.css$/ }, async args => ({
      contents: (await readFile(args.path, 'utf8')).replace(/@import\s+url\(['"]https:[^\r\n]*?\);/g, ''), loader: 'css', resolveDir: path.dirname(args.path)
    }));
  }}]
});
let html = await readFile(path.join(root, 'dev.html'), 'utf8');
html = html.replace(/\s*<link[^>]+(?:manifest|apple-touch-icon)[^>]*>/g, '');
for (const url of new Set(html.match(/\/assets\/[^"'\s<>]+/g) || [])) {
  html = html.replaceAll(url, await dataUrl(path.join(root, url)));
}
const css = result.outputFiles.find(f => f.path.endsWith('.css'))?.text || '';
const js = result.outputFiles.find(f => f.path.endsWith('.js')).text.replace(/<\/script/gi, '<\\/script');
html = html.replace('</head>', `<style>${css}</style></head>`)
  .replace(/<script type="module" src="\/src\/app\/main.js"><\/script>/, () => `<script>${js}</script>`);
await writeFile(path.join(root, 'game.html'), html);
await writeFile(path.join(root, 'scripts/portable-assets.json'), JSON.stringify([...used].sort(), null, 2) + '\n');
console.log(`game.html: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB; ${used.size} embedded assets. Open directly, no server required.`);
