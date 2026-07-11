import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 60000 });

  const el = await page.$('#geography');
  if (el) {
    const box = await el.boundingBox();
    if (box) {
      await page.screenshot({ path: 'dist/geo-test.png', clip: box });
      console.log('Geo section size:', box);
    }
  } else {
    console.log('No geography section');
  }

  await browser.close();
})();
