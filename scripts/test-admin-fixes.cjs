/**
 * Sunlife CMS admin panel — verification of the 2026-07-21 fixes.
 * Run from project root: node scripts/test-admin-fixes.cjs
 * Requires: php -S 127.0.0.1:8000 -t public running, puppeteer-core, local Chrome.
 * Pollutes public/content/*.json and public/images/cms on purpose (snapshot restore afterwards).
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BASE = 'http://127.0.0.1:8000';
const API = BASE + '/admin/api/index.php';
const CHROME = 'C:/Users/user/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe';
const TMP_DIR = path.join(__dirname, '.tmp-admin-fix');
const CMS_DIR = path.join(__dirname, '..', 'public', 'images', 'cms');

const results = [];
const consoleErrors = [];
const pageErrors = [];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function record(id, name, pass, facts) {
  results.push({ id, name, pass });
  const label = pass === true ? 'PASS' : pass === false ? 'FAIL' : String(pass);
  console.log(`\n[${label}] ${id}. ${name}`);
  console.log('   ' + facts);
}

// ---------- minimal PNG encoder ----------
const crcTable = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function makePng(w, h, rgb) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    const row = y * (1 + w * 3);
    for (let x = 0; x < w; x++) {
      raw[row + 1 + x * 3] = rgb[0];
      raw[row + 2 + x * 3] = rgb[1];
      raw[row + 3 + x * 3] = rgb[2];
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- helpers ----------
async function apiRaw(action, { method = 'GET', cookie, json, formData } = {}) {
  const headers = {};
  if (cookie) headers['Cookie'] = cookie;
  let body;
  if (json !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(json); }
  if (formData !== undefined) body = formData;
  const res = await fetch(API + '?action=' + action, { method, headers, body });
  let data = null;
  try { data = await res.json(); } catch { /* non-json */ }
  return { status: res.status, data };
}
async function apiLogin(login, password) {
  const t0 = Date.now();
  const res = await fetch(API + '?action=login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });
  const data = await res.json();
  const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
  const cookie = (sc || []).filter(Boolean).map(c => c.split(';')[0]).join('; ');
  return { status: res.status, data, cookie, ms: Date.now() - t0 };
}
async function waitRender(page, timeout = 20000) {
  await sleep(400);
  await page.waitForFunction(() => {
    const c = document.getElementById('editorContainer');
    return c && !c.querySelector('.loading');
  }, { timeout });
  await sleep(300);
}
async function gotoSection(page, section) {
  await page.evaluate((s) => document.querySelector(`a[data-section="${s}"]`).click(), section);
  await waitRender(page);
}
async function clickButtonByText(page, text, index = 0) {
  return page.evaluate(({ t, i }) => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes(t));
    if (!btns[i]) return false;
    btns[i].click();
    return true;
  }, { t: text, i: index });
}
function cmsOrigFiles() {
  try { return fs.readdirSync(CMS_DIR).filter(f => f.endsWith('-orig.webp')); } catch { return []; }
}

(async () => {
  const ping = await fetch(BASE + '/admin/').catch(() => null);
  if (!ping || ping.status !== 200) {
    console.error('SERVER NOT REACHABLE — aborting.');
    process.exit(2);
  }
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const p1 = path.join(TMP_DIR, 'fix-one.png');
  const p2 = path.join(TMP_DIR, 'fix-two.png');
  fs.writeFileSync(p1, makePng(320, 240, [10, 160, 10]));
  fs.writeFileSync(p2, makePng(480, 360, [160, 10, 160]));

  // ---------- API-level checks ----------
  // 9. Login delay on wrong password
  const bad = await apiLogin('testadmin', 'wrong-password');
  record(9, 'Login: wrong password → 401 + ~1s delay', bad.status === 401 && bad.ms >= 900,
    `status=${bad.status}, ms=${bad.ms}`);

  const adminLogin = await apiLogin('testadmin', 'Test1234!');
  const adminCookie = adminLogin.cookie;
  const editorLogin = await apiLogin('testeditor', 'Test1234!');
  const editorCookie = editorLogin.cookie;
  if (!adminLogin.data?.success || !editorLogin.data?.success) {
    console.error('LOGIN FAILED — aborting'); process.exit(2);
  }

  // 12. users-list works on users.php storage
  const ul = await apiRaw('users-list', { cookie: adminCookie });
  const logins = (ul.data?.users || []).map(u => u.login);
  record(12, 'users-list works on users.php storage', ul.status === 200 && logins.includes('testadmin') && logins.includes('ramzes'),
    `status=${ul.status}, users=[${logins.join(', ')}]`);

  // 7. Editor permission boundaries
  const siteData = await apiRaw('get&file=site', { cookie: editorCookie });
  const rSite = await apiRaw('save', { method: 'POST', cookie: editorCookie, json: { file: 'site', data: siteData.data } });
  const galData = await apiRaw('get&file=gallery', { cookie: editorCookie });
  const rGal = await apiRaw('save', { method: 'POST', cookie: editorCookie, json: { file: 'gallery', data: galData.data?.data } });
  record(7, 'Editor: save site → 403 (was 200), save gallery → 200', rSite.status === 403 && rGal.status === 200,
    `site=${rSite.status} (${rSite.data?.error}), gallery=${rGal.status}`);

  // 8. user-delete protections
  const rSelf = await apiRaw('user-delete', { method: 'POST', cookie: adminCookie, json: { login: 'testadmin' } });
  const rMk = await apiRaw('user-create', { method: 'POST', cookie: adminCookie, json: { login: 'tmpadmin', name: 'Tmp', password: 'Tmp12345', role: 'admin', permissions: [] } });
  const rDel = await apiRaw('user-delete', { method: 'POST', cookie: adminCookie, json: { login: 'tmpadmin' } });
  record(8, 'user-delete: self → 400, other admin (not last) → 200', rSelf.status === 400 && rDel.status === 200,
    `self=${rSelf.status} (${rSelf.data?.error}), create tmp=${rMk.status}, delete tmp=${rDel.status}`);

  // ---------- Browser checks ----------
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--window-size=1440,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  // Deterministic confirm()/alert() handling (CDP dialog accept races in headless)
  await page.evaluateOnNewDocument(() => { window.confirm = () => true; window.alert = () => {}; });
  page.on('dialog', d => { d.accept().catch(() => {}); });
  page.on('pageerror', e => pageErrors.push(String(e).slice(0, 200)));
  page.on('console', m => {
    if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 250));
  });

  // login via UI
  await page.goto(BASE + '/admin/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.type('#login', 'testadmin');
  await page.type('#password', 'Test1234!');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => null),
    page.evaluate(() => document.querySelector('#loginForm button[type=submit]').click()),
  ]);
  await sleep(600);

  // 1+2. Benefits add/delete + unsaved-edit preservation
  await gotoSection(page, 'benefits');
  const count0 = await page.$$eval('.benefit-title', els => els.length);
  await page.$eval('.benefit-title', el => { el.value = 'ПРОВЕРКА-НЕ-СТЕРЕТЬ'; });
  const added = await clickButtonByText(page, '+ Добавить преимущество');
  await waitRender(page);
  const count1 = await page.$$eval('.benefit-title', els => els.length);
  const firstVal = await page.$eval('.benefit-title', el => el.value);
  // delete last
  const delBtns = await page.$$('button.btn-danger');
  await delBtns[delBtns.length - 1].evaluate(b => b.click());
  await waitRender(page);
  const count2 = await page.$$eval('.benefit-title', els => els.length);
  await clickButtonByText(page, 'Сохранить преимущества');
  await sleep(1500);
  await gotoSection(page, 'home');
  await gotoSection(page, 'benefits');
  const count3 = await page.$$eval('.benefit-title', els => els.length);
  const firstVal2 = await page.$eval('.benefit-title', el => el.value);
  const benApi = await apiRaw('get&file=benefits', { cookie: adminCookie });
  record(1, 'Benefits add/delete apply immediately', added && count1 === count0 + 1 && count2 === count0 && count3 === count0,
    `start=${count0}, afterAdd=${count1}, afterDelete=${count2}, afterSaveRevisit=${count3}`);
  record(2, 'Unsaved edit survives add + persists after save', firstVal === 'ПРОВЕРКА-НЕ-СТЕРЕТЬ' && firstVal2 === 'ПРОВЕРКА-НЕ-СТЕРЕТЬ' && benApi.data?.data?.benefits?.[0]?.title === 'ПРОВЕРКА-НЕ-СТЕРЕТЬ',
    `afterAdd="${firstVal}", afterRevisit="${firstVal2}", api="${benApi.data?.data?.benefits?.[0]?.title}"`);

  // 3+4. Gallery upload persists, delete persists + removes files
  const g0 = (await apiRaw('get&file=gallery', { cookie: adminCookie })).data?.data?.images?.length ?? -1;
  await gotoSection(page, 'gallery');
  const upInput = await page.$('input#galleryUpload');
  await upInput.uploadFile(p1, p2);
  let g1 = g0;
  for (let i = 0; i < 30 && g1 !== g0 + 2; i++) {
    await sleep(1000);
    g1 = (await apiRaw('get&file=gallery', { cookie: adminCookie })).data?.data?.images?.length ?? g1;
  }
  const galAfterUp = (await apiRaw('get&file=gallery', { cookie: adminCookie })).data?.data;
  const newImgs = (galAfterUp?.images || []).slice(-2);
  const newOk = newImgs.length === 2 && newImgs.every(im => /\/images\/cms\/.+-orig\.webp/.test(im.src) && Number.isFinite(im.width) && Number.isFinite(im.height));
  record(3, 'Gallery upload persists to gallery.json', g1 === g0 + 2 && newOk,
    `images ${g0} → ${g1}; new items: ${JSON.stringify(newImgs.map(i => i.src))}`);

  // delete last image (one of the just-uploaded) — derive its file prefix from API
  const lastSrc = (galAfterUp?.images || []).slice(-1)[0]?.src || '';
  const deletedPrefix = lastSrc.split('/').pop().replace(/-orig\.webp$/, '');
  await gotoSection(page, 'gallery');
  const delCards = await page.$$('.image-card button.btn-danger');
  await delCards[delCards.length - 1].evaluate(b => b.click());
  let g2 = g1;
  for (let i = 0; i < 30 && g2 !== g1 - 1; i++) {
    await sleep(1000);
    g2 = (await apiRaw('get&file=gallery', { cookie: adminCookie })).data?.data?.images?.length ?? g2;
  }
  const filesAfterDel = cmsOrigFiles();
  const orphans = deletedPrefix ? filesAfterDel.filter(f => f.startsWith(deletedPrefix)) : ['?'];
  record(4, 'Gallery delete persists + files removed from disk', g2 === g1 - 1 && deletedPrefix && orphans.length === 0,
    `images ${g1} → ${g2}; deletedPrefix=${deletedPrefix}; leftover variants=${orphans.length}`);

  // 5. FAQ add
  await gotoSection(page, 'faq');
  const fq0 = await page.$$eval('.faq-q[data-cat="customer"]', els => els.length);
  await clickButtonByText(page, '+ Добавить вопрос', 0);
  await waitRender(page);
  const fq1 = await page.$$eval('.faq-q[data-cat="customer"]', els => els.length);
  record(5, 'FAQ add applies immediately', fq1 === fq0 + 1, `customer questions ${fq0} → ${fq1}`);

  // 6. Partnership: unsaved title survives upload to another project
  await gotoSection(page, 'partnership');
  const p0 = (await apiRaw('get&file=partnership', { cookie: adminCookie })).data?.data;
  const photos1Before = p0?.projects?.[1]?.photos?.length ?? -1;
  await page.$eval('.project-title', el => { el.value = 'ПРОВЕРКА-TITLE'; });
  const projInput = await page.$('input[data-project-upload="1"]');
  await projInput.uploadFile(p1);
  let p1d = null;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    p1d = (await apiRaw('get&file=partnership', { cookie: adminCookie })).data?.data;
    if (p1d?.projects?.[1]?.photos?.length === photos1Before + 1) break;
  }
  record(6, 'Unsaved project title survives upload to another project; photo saved',
    p1d?.projects?.[0]?.title === 'ПРОВЕРКА-TITLE' && p1d?.projects?.[1]?.photos?.length === photos1Before + 1,
    `projects[0].title="${p1d?.projects?.[0]?.title}", projects[1].photos ${photos1Before} → ${p1d?.projects?.[1]?.photos?.length}`);

  // 10. XSS escaping in gallery render
  const galNow = (await apiRaw('get&file=gallery', { cookie: adminCookie })).data?.data;
  const galBackup = JSON.parse(JSON.stringify(galNow));
  galNow.images.push({ src: '/images/cms/nonexist" onerror="window.__xss=1 x="', alt: 'alt" onerror="window.__xss=2 x="', width: 1, height: 1 });
  await apiRaw('save', { method: 'POST', cookie: adminCookie, json: { file: 'gallery', data: galNow } });
  await gotoSection(page, 'gallery');
  await sleep(1500);
  const xssState = await page.evaluate(() => ({
    marker: window.__xss ?? null,
    imgsWithOnerror: Array.from(document.querySelectorAll('img')).filter(im => im.hasAttribute('onerror')).length,
  }));
  await apiRaw('save', { method: 'POST', cookie: adminCookie, json: { file: 'gallery', data: galBackup } });
  record(10, 'XSS via img src/alt is escaped', xssState.marker === null && xssState.imgsWithOnerror === 0,
    `window.__xss=${xssState.marker}, imgs with onerror attr=${xssState.imgsWithOnerror}`);

  // 11. All sections render, no pageerrors, no favicon 404
  const sections = ['shared', 'home', 'benefits', 'gallery', 'faq', 'reviews', 'partnership', 'contacts', 'meta', 'users'];
  const sectionFails = [];
  const errSnapshot = consoleErrors.length;
  for (const s of sections) {
    try {
      await gotoSection(page, s);
      const loading = await page.$('#editorContainer .loading');
      if (loading) sectionFails.push(s + ':stuck-loading');
    } catch (e) {
      sectionFails.push(s + ':' + String(e).slice(0, 60));
    }
  }
  const faviconErrs = consoleErrors.filter(t => t.includes('favicon'));
  const newErrs = consoleErrors.slice(errSnapshot).filter(t => !t.includes('/images/cms/') && !t.includes('404'));
  record(11, 'All sections render; no pageerrors; no favicon 404',
    sectionFails.length === 0 && pageErrors.length === 0 && faviconErrs.length === 0 && newErrs.length === 0,
    `fails=[${sectionFails.join(', ')}], pageerrors=${pageErrors.length}, faviconErrs=${faviconErrs.length}, otherNewConsoleErrs=${newErrs.length}`);

  await browser.close();
  fs.rmSync(TMP_DIR, { recursive: true, force: true });

  console.log('\n===== SUMMARY =====');
  const failed = results.filter(r => r.pass !== true);
  console.log(`total=${results.length}, failed=${failed.length}`);
  if (consoleErrors.length) console.log('console errors seen (all):', consoleErrors.length);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
