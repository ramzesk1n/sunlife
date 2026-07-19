// Keyboard navigation check: tab through page, log focus visibility
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:/Users/user/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe',
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('https://sunlife-photo.ru/', { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1000));

  console.log('=== Tab order + focus visibility (first 25 tabs) ===');
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().slice(0, 40) || el.getAttribute('aria-label') || '',
        outline: style.outlineStyle + ' ' + style.outlineWidth + ' ' + style.outlineColor,
        boxShadow: style.boxShadow !== 'none' ? style.boxShadow.slice(0, 60) : '',
        visible: rect.width > 0 && rect.height > 0,
      };
    });
    if (info) {
      const hasIndicator = !info.outline.includes('none') || info.boxShadow;
      console.log(`${i + 1}. <${info.tag}> "${info.text}" | focus-style: ${hasIndicator ? 'OK' : 'MISSING'} ${hasIndicator ? '' : '(' + info.outline + ')'}`);
    }
  }

  // Focus trap check in modal
  console.log('\n=== Modal focus test (open contact form) ===');
  const cta = await page.$('header button');
  if (cta) {
    await cta.click();
    await new Promise((r) => setTimeout(r, 800));
    const modalInfo = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return dialog ? 'dialog opened' : 'no dialog';
    });
    console.log(modalInfo);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        const dialog = document.querySelector('[role="dialog"]');
        return {
          tag: el ? el.tagName.toLowerCase() : '?',
          text: el ? ((el.textContent || '').trim().slice(0, 30) || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '') : '',
          insideDialog: dialog && el ? dialog.contains(el) : null,
        };
      });
      console.log(`${i + 1}. <${info.tag}> "${info.text}" insideDialog=${info.insideDialog}`);
    }
  }
  await browser.close();
})();
