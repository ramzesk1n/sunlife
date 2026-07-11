import puppeteer from 'puppeteer';
import path from 'path';

const BASE_URL = 'http://localhost:4173';
const outDir = path.resolve(process.cwd(), 'dist');

async function capture() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // Cookie banner screenshot
  await page.goto(`${BASE_URL}/?nocache=${Date.now()}`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, 'cookie-banner.png') });

  // Privacy page screenshot
  await page.goto(`${BASE_URL}/privacy?nocache=${Date.now()}`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, 'privacy-page.png'), fullPage: true });

  await browser.close();
  console.log('Screenshots saved');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
