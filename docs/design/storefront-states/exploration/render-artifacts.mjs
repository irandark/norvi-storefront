import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ headless: true });
const variants = ['a', 'b'];
const artifacts = ['overview', 'matrix', 'interactions'];
const viewports = [
  ['desktop', 1440, 1000],
  ['mobile', 375, 812],
];

for (const variant of variants) {
  const output = resolve(here, `variant-${variant}`);
  await mkdir(output, { recursive: true });
  for (const artifact of artifacts) {
    for (const [viewport, width, height] of viewports) {
      const page = await browser.newPage({ viewport: { width, height } });
      const url = new URL(`file://${resolve(here, 'prototype.html')}`);
      url.searchParams.set('variant', variant);
      url.searchParams.set('artifact', artifact);
      await page.goto(url.href);
      await page.screenshot({
        path: resolve(output, `${viewport}-${artifact}.png`),
        fullPage: false,
      });
      await page.close();
    }
  }
}

await browser.close();
