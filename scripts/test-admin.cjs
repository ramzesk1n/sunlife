/**
 * Sunlife CMS admin panel — local test suite (read-only w.r.t. admin code).
 * Run from project root: node scripts/test-admin.cjs
 * Requires: php -S 127.0.0.1:8000 -t public (already running), puppeteer-core, local Chrome.
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BASE = 'http://127.0.0.1:8000';
const API = BASE + '/admin/api/index.php';
const CHROME = 'C:/Users/user/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe';
const TMP_DIR = path.join(__dirname, '.tmp-admin-test');
const CMS_DIR = path.join(__dirname, '..', 'public', 'images', 'cms');
const CONTENT_DIR = path.join(__dirname, '..', 'public', 'content');

const results = [];
const consoleErrors = []; // {tag, kind, text}
const dialogs = []; // {tag, message}
let currentTag = 'init';

function record(id, name, pass, facts) {
  results.push({ id, name, pass, facts });
  const label = pass === true ? 'PASS' : pass === false ? 'FAIL' : String(pass);
  console.log(`\n[${label}] ${id}. ${name}`);
  console.log('   ' + facts);
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit truecolor
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

// ---------- API helpers ----------
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
  const res = await fetch(API + '?action=login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });
  const data = await res.json();
  const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
  const cookie = (sc || []).filter(Boolean).map(c => c.split(';')[0]).join('; ');
  return { status: res.status, data, cookie };
}
function uploadForm(fileBuf, filename, mime) {
  const fd = new FormData();
  fd.append('image', new Blob([fileBuf], { type: mime }), filename);
  return fd;
}

// ---------- browser helpers ----------
async function waitRender(page, timeout = 20000) {
  await sleep(400);
  await page.waitForFunction(() => {
    const c = document.getElementById('editorContainer');
    return c && !c.querySelector('.loading');
  }, { timeout });
  await sleep(200);
}
async function clickButtonByText(page, text) {
  return page.evaluate((t) => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes(t));
    if (!btn) return false;
    btn.click();
    return true;
  }, text);
}
async function gotoSection(page, section) {
  currentTag = 'section:' + section;
  await page.evaluate((s) => document.querySelector(`a[data-section="${s}"]`).click(), section);
  await waitRender(page);
}
function cmsOrigFiles() {
  try { return fs.readdirSync(CMS_DIR).filter(f => f.endsWith('-orig.webp')); } catch { return []; }
}

(async () => {
  // --- preflight ---
  const ping = await fetch(BASE + '/admin/').catch(() => null);
  if (!ping || ping.status !== 200) {
    console.error('SERVER NOT REACHABLE at ' + BASE + '/admin/ — aborting.');
    process.exit(2);
  }
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const png1 = makePng(320, 240, [200, 30, 30]);
  const png2 = makePng(320, 240, [30, 30, 200]);
  const p1 = path.join(TMP_DIR, 'test-one.png');
  const p2 = path.join(TMP_DIR, 'test-two.png');
  fs.writeFileSync(p1, png1);
  fs.writeFileSync(p2, png2);
  fs.writeFileSync(path.join(TMP_DIR, 'evil.php'), '<?php echo "not an image"; ?>');
  fs.writeFileSync(path.join(TMP_DIR, 'fake.png'), 'this is text, not a png');

  // --- API sessions ---
  const adminLogin = await apiLogin('testadmin', 'Test1234!');
  const adminCookie = adminLogin.cookie;
  const editorLogin = await apiLogin('testeditor', 'Test1234!');
  const editorCookie = editorLogin.cookie;
  console.log('API login testadmin:', adminLogin.status, 'success=' + (adminLogin.data && adminLogin.data.success));
  console.log('API login testeditor:', editorLogin.status, 'success=' + (editorLogin.data && editorLogin.data.success));

  // ================= 12. Unauthenticated access =================
  try {
    const r1 = await apiRaw('save', { method: 'POST', json: { file: 'benefits', data: {} } });
    const r2 = await apiRaw('users-list');
    const r3 = await apiRaw('get&file=benefits');
    const r4 = await apiRaw('upload', { method: 'POST', formData: new FormData() });
    const allDenied = [r1, r2, r3, r4].every(r => r.status === 401 || r.status === 403);
    record(12, 'Неавторизованный доступ', allDenied,
      `save=${r1.status} "${r1.data && r1.data.error}"; users-list=${r2.status} "${r2.data && r2.data.error}"; get&file=benefits=${r3.status} "${r3.data && r3.data.error}"; upload(no file)=${r4.status} "${r4.data && r4.data.error}". Ожидалось 401 везде; фактически users-list даёт 403 (requireAdmin возвращает 403 для незалогиненных), остальные 401.`);
  } catch (e) { record(12, 'Неавторизованный доступ', false, 'exception: ' + e.message); }

  // ================= 13. Upload validation (testadmin) =================
  try {
    const evil = await apiRaw('upload', { method: 'POST', cookie: adminCookie, formData: uploadForm(fs.readFileSync(path.join(TMP_DIR, 'evil.php')), 'evil.php', 'application/x-php') });
    const fake = await apiRaw('upload', { method: 'POST', cookie: adminCookie, formData: uploadForm(fs.readFileSync(path.join(TMP_DIR, 'fake.png')), 'fake.png', 'image/png') });
    const good = await apiRaw('upload', { method: 'POST', cookie: adminCookie, formData: uploadForm(png1, 'test-valid.png', 'image/png') });
    const src = good.data && good.data.image && good.data.image.src;
    const pass = evil.status === 400 && /Invalid file type/.test((evil.data && evil.data.error) || '')
      && fake.status === 500 && /Failed to load image/.test((fake.data && fake.data.error) || '')
      && good.status === 200 && good.data && good.data.success && /^\/images\/cms\/.+-orig\.webp$/.test(src || '');
    record(13, 'Upload validation', pass,
      `a) evil.php: ${evil.status} "${evil.data && evil.data.error}"; b) fake.png(txt): ${fake.status} "${fake.data && fake.data.error}"; c) valid png: ${good.status} success=${good.data && good.data.success} src=${src}`);
  } catch (e) { record(13, 'Upload validation', false, 'exception: ' + e.message); }

  // ================= 14. users-list as editor; user-delete nonexistent =================
  try {
    const ul = await apiRaw('users-list', { cookie: editorCookie });
    const del404 = await apiRaw('user-delete', { method: 'POST', cookie: adminCookie, json: { login: 'no-such-user-zzz' } });
    const usersRaw = fs.readFileSync(path.join(__dirname, '..', 'public', 'admin', 'users.json'), 'utf8');
    const pass = ul.status === 403 && del404.status === 404 && usersRaw.includes('"testadmin"');
    record(14, 'users-list editor / user-delete', pass,
      `users-list as editor: ${ul.status} "${ul.data && ul.data.error}" (ожидалось 403); user-delete несуществующего: ${del404.status} "${del404.data && del404.data.error}" (ожидалось 404); testadmin на месте: ${usersRaw.includes('"testadmin"')}. Защиты от self-delete нет: case 'user-delete' (api/index.php:539-561) не сравнивает login с $_SESSION['user_id'] и не проверяет «последний админ».`);
  } catch (e) { record(14, 'users-list editor / user-delete', false, 'exception: ' + e.message); }

  // ================= 11 (API part). Editor permissions =================
  let siteOriginal = null;
  try {
    const saveMeta = await apiRaw('save', { method: 'POST', cookie: editorCookie, json: { file: 'meta', data: { test: 1 } } });
    record('11a', 'Editor: save meta → 403', saveMeta.status === 403,
      `save {file:'meta'} as editor: ${saveMeta.status} "${saveMeta.data && saveMeta.data.error}"`);
    const siteGet = await apiRaw('get&file=site', { cookie: editorCookie });
    siteOriginal = siteGet.data && siteGet.data.data;
    const saveSite = await apiRaw('save', { method: 'POST', cookie: editorCookie, json: { file: 'site', data: { test: 1 } } });
    const restore = await apiRaw('save', { method: 'POST', cookie: editorCookie, json: { file: 'site', data: siteOriginal } });
    const gpGet = await apiRaw('get&file=gallery-portfolio', { cookie: editorCookie });
    const saveGp = await apiRaw('save', { method: 'POST', cookie: editorCookie, json: { file: 'gallery-portfolio', data: gpGet.data && gpGet.data.data } });
    record('11b', 'Editor: save site — эскалация привилегий (гипотеза бага)', saveSite.status === 200 ? 'BUG-CONFIRMED' : true,
      `save {file:'site'} as editor: ${saveSite.status} ${JSON.stringify(saveSite.data)} — 'site' отсутствует в permissionMap (api/index.php:267-277) → editor без прав перезаписал site.json. Восстановление исходного: ${restore.status} success=${restore.data && restore.data.success}. gallery-portfolio (тоже вне permissionMap), save тех же данных: ${saveGp.status} success=${saveGp.data && saveGp.data.success}`);
  } catch (e) {
    record('11b', 'Editor: save site', false, 'exception: ' + e.message);
    if (siteOriginal) await apiRaw('save', { method: 'POST', cookie: adminCookie, json: { file: 'site', data: siteOriginal } });
  }

  // ================= Browser UI tests =================
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1400,900'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    page.on('dialog', d => {
      dialogs.push({ tag: currentTag, message: d.message() });
      try { d.accept().catch(() => { }); } catch { }
    });
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const loc = msg.location && msg.location();
        consoleErrors.push({ tag: currentTag, kind: 'console.error', text: msg.text() + (loc && loc.url ? ' <' + loc.url + '>' : '') });
      }
    });
    page.on('pageerror', err => consoleErrors.push({ tag: currentTag, kind: 'pageerror', text: String(err) }));

    // ---------- 1. Login ----------
    currentTag = 'login';
    await page.goto(BASE + '/admin/index.html', { waitUntil: 'networkidle0' });
    await page.type('#login', 'testadmin');
    await page.type('#password', 'WrongPass999');
    await page.click('button[type=submit]');
    await sleep(1200);
    const errMsg = await page.$eval('#errorMsg', el => el.textContent);
    const stillOnLogin = page.url().includes('index.html');
    await page.evaluate(() => { document.getElementById('login').value = ''; document.getElementById('password').value = ''; });
    await page.type('#login', 'testadmin');
    await page.type('#password', 'Test1234!');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }),
      page.click('button[type=submit]'),
    ]);
    const onDashboard = page.url().includes('dashboard.html');
    await waitRender(page);
    const menuLabels = await page.$$eval('.sidebar-nav a', els => els.map(e => e.textContent.replace(/\s+/g, ' ').trim()));
    const expectedMenu = ['Общие блоки', 'Главная страница', 'Преимущества', 'Галерея', 'FAQ', 'Отзывы', 'Партнёрство', 'Контакты', 'SEO / Мета', 'Пользователи'];
    const menuOk = expectedMenu.every(m => menuLabels.some(l => l.includes(m)));
    record(1, 'Логин', errMsg.length > 0 && stillOnLogin && onDashboard && menuLabels.length === 10 && menuOk,
      `неверный пароль: errorMsg="${errMsg}", остались на index.html=${stillOnLogin}; верный: редирект на dashboard=${onDashboard}; меню (${menuLabels.length}): ${menuLabels.join(' | ')}`);

    // ---------- 2. All sections render ----------
    const sectionMarkers = {
      shared: '.shared-pkg-name', home: '.step-title', benefits: '.benefit-title',
      gallery: '#galleryUpload', faq: '.faq-q', reviews: '.review-author',
      partnership: '.project-title', contacts: '#contactPhone', meta: '.meta-title', users: 'table',
    };
    const secFacts = [];
    let secOk = true;
    for (const s of Object.keys(sectionMarkers)) {
      try {
        await gotoSection(page, s);
        const info = await page.evaluate((marker) => {
          const c = document.getElementById('editorContainer');
          return {
            loading: c.textContent.includes('Загрузка'),
            len: c.innerHTML.length,
            markerCount: document.querySelectorAll(marker).length,
          };
        }, sectionMarkers[s]);
        const errs = consoleErrors.filter(e => e.tag === 'section:' + s).length;
        const ok = !info.loading && info.len > 100 && info.markerCount > 0;
        if (!ok) secOk = false;
        secFacts.push(`${s}: rendered=${!info.loading} marker(${sectionMarkers[s]})=${info.markerCount} consoleErr=${errs}`);
      } catch (e) {
        secOk = false;
        secFacts.push(`${s}: EXCEPTION ${e.message.slice(0, 120)}`);
      }
    }
    record(2, 'Открытие каждого раздела', secOk, secFacts.join('; '));

    // ---------- 3. Add-item benefits (bug hypothesis) ----------
    await gotoSection(page, 'benefits');
    const addBefore = await page.$$eval('.benefit-title', els => els.length);
    await clickButtonByText(page, 'Добавить преимущество');
    await waitRender(page);
    const addAfter = await page.$$eval('.benefit-title', els => els.length);
    record(3, 'Add-item benefits (гипотеза бага)', addAfter === addBefore ? 'BUG-CONFIRMED' : (addAfter === addBefore + 1),
      `countBefore=${addBefore}, после клика «+ Добавить преимущество» countAfter=${addAfter} (ожидалось ${addBefore + 1}). addBenefit() пушит в currentData и вызывает loadSection('benefits') → перезагрузка с сервера затирает новый пункт.`);

    // ---------- 4. Edit + save benefits ----------
    await page.evaluate(() => { document.querySelector('.benefit-title').value = 'ТЕСТОВЫЙ ЗАГОЛОВОК'; });
    await clickButtonByText(page, 'Сохранить преимущества');
    let toast4 = false;
    try { await page.waitForSelector('.toast', { timeout: 5000 }); toast4 = true; } catch { }
    await sleep(800);
    await gotoSection(page, 'gallery');
    await gotoSection(page, 'benefits');
    const savedTitle = await page.$eval('.benefit-title', el => el.value).catch(() => null);
    const apiBen = await apiRaw('get&file=benefits', { cookie: adminCookie });
    const apiTitle = apiBen.data && apiBen.data.data && apiBen.data.data.benefits && apiBen.data.data.benefits[0] && apiBen.data.data.benefits[0].title;
    record(4, 'Edit+save benefits', savedTitle === 'ТЕСТОВЫЙ ЗАГОЛОВОК' && apiTitle === 'ТЕСТОВЫЙ ЗАГОЛОВОК',
      `toast=${toast4}; после перезагрузки раздела первый заголовок="${savedTitle}"; через API benefits[0].title="${apiTitle}"`);

    // ---------- 5. Delete-item benefits (bug hypothesis) ----------
    const delBefore = await page.$$eval('.benefit-title', els => els.length);
    const dlgBefore5 = dialogs.length;
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button[onclick^="deleteBenefit("]'));
      btns[btns.length - 1].click();
    });
    await waitRender(page);
    const delAfter = await page.$$eval('.benefit-title', els => els.length);
    await clickButtonByText(page, 'Сохранить преимущества');
    await sleep(1200);
    await gotoSection(page, 'gallery');
    await gotoSection(page, 'benefits');
    const delAfterSave = await page.$$eval('.benefit-title', els => els.length);
    record(5, 'Delete-item benefits (гипотеза бага)', delAfter === delBefore ? 'BUG-CONFIRMED' : (delAfter === delBefore - 1),
      `countBefore=${delBefore}, confirm показан=${dialogs.length > dlgBefore5}, после удаления последнего countAfter=${delAfter} (ожидалось ${delBefore - 1}), после явного «Сохранить» и перезагрузки раздела=${delAfterSave}. deleteBenefit() splice + loadSection → серверные данные затирают удаление; последующий save сохраняет перезагруженный (полный) список — удаление теряется полностью.`);

    // ---------- 6. Gallery upload (bug hypothesis) ----------
    const gLenBefore = (await apiRaw('get&file=gallery', { cookie: adminCookie })).data.data.images.length;
    const fsBefore = cmsOrigFiles();
    await gotoSection(page, 'gallery');
    currentTag = 'gallery-upload';
    await page.waitForSelector('input#galleryUpload', { timeout: 10000 });
    const upInput = await page.$('input#galleryUpload');
    await upInput.uploadFile(p1, p2);
    await sleep(10000);
    const gLenAfter = (await apiRaw('get&file=gallery', { cookie: adminCookie })).data.data.images.length;
    const fsAfter = cmsOrigFiles();
    const orphans = fsAfter.filter(f => !fsBefore.includes(f));
    record(6, 'Gallery upload (гипотеза бага)', gLenAfter === gLenBefore ? 'BUG-CONFIRMED' : (gLenAfter === gLenBefore + 2),
      `images.length до=${gLenBefore}, после загрузки 2 файлов=${gLenAfter} (ожидалось ${gLenBefore + 2}). handlePhotoUpload пушит в коллекцию, но НЕ вызывает save → gallery.json не меняется. Новые *-orig.webp-сироты в public/images/cms/: ${JSON.stringify(orphans)}`);

    // ---------- 7. Gallery delete (bug hypothesis) ----------
    await gotoSection(page, 'gallery');
    const gdLenBefore = (await apiRaw('get&file=gallery', { cookie: adminCookie })).data.data.images.length;
    const dlgBefore7 = dialogs.length;
    await page.evaluate(() => { document.querySelector('button[onclick^="deleteGalleryImage("]').click(); });
    await waitRender(page);
    const gdLenAfter = (await apiRaw('get&file=gallery', { cookie: adminCookie })).data.data.images.length;
    await clickButtonByText(page, 'Сохранить галерею');
    await sleep(1200);
    const gdLenAfterSave = (await apiRaw('get&file=gallery', { cookie: adminCookie })).data.data.images.length;
    record(7, 'Gallery delete (гипотеза бага)', gdLenAfter === gdLenBefore ? 'BUG-CONFIRMED' : (gdLenAfter === gdLenBefore - 1),
      `images.length до=${gdLenBefore}, confirm показан=${dialogs.length > dlgBefore7}, после удаления первого фото (API)=${gdLenAfter} (ожидалось ${gdLenBefore - 1}), после «Сохранить галерею»=${gdLenAfterSave}. deleteGalleryImage splice + loadSection без save; save сохраняет перезагруженные данные — удаление теряется.`);

    // ---------- 8. Gallery alt save ----------
    await gotoSection(page, 'gallery');
    await page.evaluate(() => { document.querySelector('.gallery-alt').value = 'ТЕСТОВЫЙ ALT ГАЛЕРЕЯ'; });
    await clickButtonByText(page, 'Сохранить галерею');
    await sleep(1200);
    const gAlt = (await apiRaw('get&file=gallery', { cookie: adminCookie })).data.data.images[0].alt;
    record(8, 'Gallery alt save', gAlt === 'ТЕСТОВЫЙ ALT ГАЛЕРЕЯ', `после сохранения images[0].alt="${gAlt}"`);

    // ---------- 9. Partnership project upload (control, should PASS) ----------
    const pBefore = (await apiRaw('get&file=partnership', { cookie: adminCookie })).data.data.projects[0].photos.length;
    await gotoSection(page, 'partnership');
    await page.waitForSelector('input[data-project-upload="0"]', { timeout: 10000 });
    const projInput = await page.$('input[data-project-upload="0"]');
    await projInput.uploadFile(p1);
    await sleep(8000);
    const pAfter = (await apiRaw('get&file=partnership', { cookie: adminCookie })).data.data.projects[0].photos.length;
    record(9, 'Partnership project upload (контрольный)', pAfter === pBefore + 1,
      `projects[0].photos.length до=${pBefore}, после загрузки 1 файла=${pAfter} (handleProjectUploadFromInput вызывает save — ожидался PASS)`);

    // ---------- 10. Backups ----------
    const backupsBefore = fs.readdirSync(CONTENT_DIR).filter(f => /^benefits-.*\.backup\.json$/.test(f));
    await gotoSection(page, 'benefits');
    await clickButtonByText(page, 'Сохранить преимущества');
    await sleep(1600);
    await clickButtonByText(page, 'Сохранить преимущества');
    await sleep(1200);
    const backupsAfter = fs.readdirSync(CONTENT_DIR).filter(f => /^benefits-.*\.backup\.json$/.test(f));
    const newBackups = backupsAfter.filter(f => !backupsBefore.includes(f));
    const lb = await apiRaw('list-backups&file=benefits', { cookie: adminCookie });
    record(10, 'Бэкапы', newBackups.length >= 1 && lb.data && lb.data.success && Array.isArray(lb.data.backups) && lb.data.backups.length > 0,
      `новых benefits-*.backup.json в public/content/: ${newBackups.length} ${JSON.stringify(newBackups)}; list-backups вернул ${lb.data && lb.data.backups && lb.data.backups.length} записей, свежая: ${lb.data && lb.data.backups && lb.data.backups[0] && lb.data.backups[0].filename}`);

    // ---------- 15. Logout ----------
    try {
      currentTag = 'logout';
      await page.evaluate(() => logout());
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => { });
      const urlAfterLogout = page.url();
      const checkAfter = await page.evaluate(async () => {
        const r = await fetch('api/index.php?action=check', { credentials: 'same-origin' });
        return r.json();
      });
      const ctx = await browser.createBrowserContext();
      const anonPage = await ctx.newPage();
      await anonPage.goto(BASE + '/admin/dashboard.html', { waitUntil: 'networkidle0' });
      await sleep(1000);
      const anonUrl = anonPage.url();
      await ctx.close();
      record(15, 'Логаут', urlAfterLogout.includes('index.html') && checkAfter.logged_in === false && anonUrl.includes('index.html'),
        `после logout URL=${urlAfterLogout}; action=check → logged_in=${checkAfter.logged_in}; dashboard.html без сессии → ${anonUrl}`);
    } catch (e) {
      record(15, 'Логаут', false, 'exception: ' + e.message.slice(0, 200));
    }

    // ---------- 11 (UI part). Editor menu ----------
    try {
      currentTag = 'editor-login';
      await page.goto(BASE + '/admin/index.html', { waitUntil: 'domcontentloaded' });
      await sleep(1000);
      await page.evaluate(() => {
        document.getElementById('login').value = 'testeditor';
        document.getElementById('password').value = 'Test1234!';
        document.querySelector('button[type=submit]').click();
      });
      await page.waitForFunction(() => window.location.href.includes('dashboard.html'), { timeout: 15000 });
      await sleep(1500);
      await waitRender(page);
      const edUrl = page.url();
      const edMenu = await page.$$eval('.sidebar-nav a', els => els.map(e => e.textContent.replace(/\s+/g, ' ').trim()));
      record('11-ui', 'Права editor: меню только «Галерея»', edMenu.length === 1 && edMenu[0].includes('Галерея'),
        `URL=${edUrl}; пункты меню testeditor (${edMenu.length}): ${JSON.stringify(edMenu)}`);
    } catch (e) {
      record('11-ui', 'Права editor: меню только «Галерея»', false, 'exception: ' + e.message.slice(0, 200));
    }
  } finally {
    await browser.close();
  }

  // ================= 16. Console errors summary =================
  const byTag = {};
  for (const e of consoleErrors) {
    const key = e.tag;
    byTag[key] = byTag[key] || {};
    const k = `${e.kind}: ${e.text.slice(0, 220)}`;
    byTag[key][k] = (byTag[key][k] || 0) + 1;
  }
  const summary16 = Object.keys(byTag).length === 0 ? 'ошибок нет'
    : Object.entries(byTag).map(([t, m]) => `${t}: ` + Object.entries(m).map(([k, n]) => `[x${n}] ${k}`).join(' || ')).join('\n   ');
  record(16, 'Консольные ошибки (сводка)', consoleErrors.length === 0 ? true : 'INFO', summary16);

  // --- cleanup temp files ---
  try { fs.rmSync(TMP_DIR, { recursive: true, force: true }); } catch { }

  console.log('\n\n===== RAW RESULTS JSON =====');
  console.log(JSON.stringify(results, null, 1));
})().catch(e => {
  console.error('FATAL', e);
  try { fs.rmSync(TMP_DIR, { recursive: true, force: true }); } catch { }
  process.exit(1);
});
