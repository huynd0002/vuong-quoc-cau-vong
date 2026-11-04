import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const brainDir = 'C:/Users/Admin/.gemini/antigravity/brain/b4d73263-dfb7-48f9-a7e6-9542f5c3bba5';
const outputDir = path.resolve('./assets/monsters/map4');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Output dir ready:', outputDir);
