import { chromium } from 'playwright';
import fs from 'node:fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const res = await page.evaluate(async () => {
  function load(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });
  }
  // Check hero_upgrade_idle.png
  const imgIdle = await load('/assets/hero/sau_upgrade/hero_upgrade_idle.png');
  const imgIdleSheet = await load('/assets/hero/sau_upgrade/hero_upgrade_idle_sheet.png');
  const imgWalkSheet = await load('/assets/hero/sau_upgrade/hero_upgrade_walk_sheet.png');

  return {
    idle: { w: imgIdle.width, h: imgIdle.height },
    idleSheet: { w: imgIdleSheet.width, h: imgIdleSheet.height },
    walkSheet: { w: imgWalkSheet.width, h: imgWalkSheet.height }
  };
});

console.log(res);
await browser.close();
