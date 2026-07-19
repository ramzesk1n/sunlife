// axe-core a11y audit: mobile viewport, live site
const puppeteer = require('puppeteer');

const PAGES = ['/', '/price', '/galery', '/partnership', '/contacts'];
const BASE = process.argv[2] || 'https://sunlife-photo.ru';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:/Users/user/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe',
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });

  for (const route of PAGES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js' });
    const results = await page.evaluate(async () => {
      const res = await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      });
      return res.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        example: v.nodes[0] ? v.nodes[0].target.join(' ') : '',
        help: v.help,
      }));
    });
    console.log('\n=== ' + route + ' ===');
    if (results.length === 0) console.log('no violations');
    for (const v of results) {
      console.log(`[${v.impact}] ${v.id} (${v.nodes}x) — ${v.help}`);
      console.log('   ', v.example.slice(0, 120));
    }
  }
  await browser.close();
})();
