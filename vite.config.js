import { defineConfig } from 'vite';
import { resolve, join } from 'path';
import fs from 'fs';

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src, { withFileTypes: true })) {
    const sPath = join(src, item.name);
    const dPath = join(dest, item.name);
    if (item.isDirectory()) {
      copyDirRecursive(sPath, dPath);
    } else {
      fs.copyFileSync(sPath, dPath);
    }
  }
}

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  },
  plugins: [
    {
      name: 'copy-root-assets-on-build',
      closeBundle() {
        const assetsSrc = resolve(__dirname, 'assets');
        const assetsDest = resolve(__dirname, 'dist', 'assets');
        copyDirRecursive(assetsSrc, assetsDest);
        fs.copyFileSync(resolve(__dirname, 'dist', 'dev.html'), resolve(__dirname, 'dist', 'game.html'));
      }
    },
    {
      name: 'rebuild-entry-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            req.url = '/dev.html';
          } else if (req.url === '/game.html') {
            req.url = '/dev.html';
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            req.url = '/game.html';
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        game: resolve(__dirname, 'dev.html')
      }
    }
  }
});
