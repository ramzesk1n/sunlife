import puppeteer from 'puppeteer';
import path from 'path';

const BASE_URL = 'http://localhost:4173';
const outDir = path.resolve(process.cwd(), 'dist');

async function capture() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  await page.goto(`${BASE_URL}/partnership/?nocache=${Date.now()}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'partnership-page.png'), fullPage: true });

  await browser.close();
  console.log('Screenshot saved');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
