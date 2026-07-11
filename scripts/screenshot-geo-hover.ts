import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCache');
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/?nocache=' + Date.now(), { waitUntil: 'networkidle2', timeout: 60000 });

  await page.evaluate(() => {
    const el = document.getElementById('geography');
    if (el) el.scrollIntoView({ block: 'center' });
  });
  await new Promise((r) => setTimeout(r, 1500));

  const ufa = await page.$('[data-city="ufa"]');
  if (ufa) {
    const box = await ufa.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await new Promise((r) => setTimeout(r, 800));
      await page.screenshot({ path: 'dist/geo-hover-prod.png', fullPage: false });

      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await new Promise((r) => setTimeout(r, 800));
      await page.screenshot({ path: 'dist/geo-click-prod.png', fullPage: false });

      console.log('hovered and clicked ufa');
    }
  }

  await browser.close();
})();
