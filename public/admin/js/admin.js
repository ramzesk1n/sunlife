/**
 * Sunlife CMS Admin Dashboard v2
 * Restructured: shared blocks, per-page content, photo management
 */

const API_BASE = 'api/index.php';

// ===== Menu Structure =====
const MENU_STRUCTURE = [
  {
    id: 'shared',
    icon: '🧩',
    label: 'Общие блоки',
    perm: 'shared',
    description: 'Цены, география, меню, футер, формы'
  },
  {
    id: 'home',
    icon: '🏠',
    label: 'Главная страница',
    perm: 'shared',
    description: 'Hero, шаги, отзывы'
  },
  {
    id: 'benefits',
    icon: '✨',
    label: 'Преимущества',
    perm: 'benefits',
    description: 'Преимущества на главной'
  },
  {
    id: 'gallery',
    icon: '🖼️',
    label: 'Галерея',
    perm: 'gallery',
    description: 'Фото галерея'
  },
  {
    id: 'faq',
    icon: '❓',
    label: 'FAQ',
    perm: 'faq',
    description: 'Вопросы по страницам'
  },
  {
    id: 'reviews',
    icon: '💬',
    label: 'Отзывы',
    perm: 'reviews',
    description: 'Отзывы по страницам'
  },
  {
    id: 'partnership',
    icon: '🤝',
    label: 'Партнёрство',
    perm: 'partnership',
    description: 'О нас, предложения, цены, команда, проекты'
  },
  {
    id: 'contacts',
    icon: '📇',
    label: 'Контакты',
    perm: 'contacts',
    description: 'Адрес, телефон, карта, SEO'
  },
  {
    id: 'meta',
    icon: '🔍',
    label: 'SEO / Мета',
    perm: 'meta',
    description: 'Title, description, OG-теги'
  },
  {
    id: 'users',
    icon: '👥',
    label: 'Пользователи',
    perm: 'users',
    description: 'Управление доступом'
  }
];

// ===== Permissions =====
const ALL_PERMISSIONS = ['pricing', 'faq', 'gallery', 'benefits', 'reviews', 'steps', 'geography', 'partnership', 'meta', 'users', 'shared', 'contacts'];

// ===== State =====
let currentUser = null;
let currentData = {};
let currentSection = '';

// ===== Toast =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// ===== API =====
async function api(action, method = 'GET', body = null) {
  const url = `${API_BASE}?action=${action}`;
  const options = { method, credentials: 'same-origin' };
  if (body && method !== 'GET') {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  return res.json();
}
async function apiFormData(action, formData) {
  const res = await fetch(`${API_BASE}?action=${action}`, {
    method: 'POST',
    credentials: 'same-origin',
    body: formData,
  });
  return res.json();
}

// ===== Auth =====
async function checkAuth() {
  const data = await api('check');
  if (!data.logged_in) {
    window.location.href = 'index.html';
    return false;
  }
  currentUser = data.user;
  return true;
}
function hasPermission(perm) {
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  return currentUser.permissions.includes(perm);
}
function requirePermission(perm) {
  if (!hasPermission(perm)) {
    showToast('Нет доступа к этому разделу', 'error');
    return false;
  }
  return true;
}

// ===== Menu =====
function buildMenu() {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;
  nav.innerHTML = '';
  
  MENU_STRUCTURE.forEach(item => {
    if (!hasPermission(item.perm)) return;
    
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.dataset.section = item.id;
    a.innerHTML = `<span class="icon">${item.icon}</span> ${item.label}`;
    a.title = item.description;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.sidebar-nav a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      loadSection(item.id);
    });
    li.appendChild(a);
    nav.appendChild(li);
  });
}

// ===== Section Loader =====
async function loadSection(section) {
  if (!requirePermission(MENU_STRUCTURE.find(m => m.id === section)?.perm || section)) return;
  
  currentSection = section;
  const container = document.getElementById('editorContainer');
  if (!container) return;
  
  container.innerHTML = '<p class="loading"><span class="spinner"></span> Загрузка...</p>';
  
  const titleEl = document.getElementById('pageTitle');
  const menuItem = MENU_STRUCTURE.find(m => m.id === section);
  if (titleEl && menuItem) titleEl.textContent = menuItem.label;

  switch (section) {
    case 'shared':
      await loadSharedBlocks(container);
      break;
    case 'home':
      await loadHomePage(container);
      break;
    case 'faq':
      await loadFAQPage(container);
      break;
    case 'reviews':
      await loadReviewsPage(container);
      break;
    case 'partnership':
      await loadPartnershipPage(container);
      break;
    case 'benefits':
      await loadBenefitsPage(container);
      break;
    case 'gallery':
      await loadGalleryPage(container);
      break;
    case 'contacts':
      await loadContactsPage(container);
      break;
    case 'meta':
      await loadMetaPage(container);
      break;
    case 'users':
      await loadUsersPage(container);
      break;
    default:
      container.innerHTML = '<p class="loading">Выберите раздел в меню</p>';
  }
}

// ===== SHARED BLOCKS (pricing, geography, menu, footer, forms) =====
async function loadSharedBlocks(container) {
  // Load pricing + geography
  const [pricing, geography] = await Promise.all([
    api('get&file=pricing'),
    api('get&file=geography')
  ]);
  
  let html = '<div class="section-group">';
  
  // Pricing
  html += `<div class="card"><div class="card-header"><h3>💰 Цены (используются на Главной и Партнёрстве)</h3></div>`;
  if (pricing.success) {
    currentData.pricing = pricing.data;
    html += renderPricingTable(pricing.data.packages || []);
    html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveSharedPricing()">💾 Сохранить цены</button></div>`;
  }
  html += '</div>';
  
  // Geography
  html += `<div class="card" style="margin-top:1rem"><div class="card-header"><h3>🗺 География (используется на Главной и Контактах)</h3></div>`;
  if (geography.success) {
    currentData.geography = geography.data;
    html += renderGeographyEditor(geography.data);
    html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveSharedGeography()">💾 Сохранить географию</button></div>`;
  }
  html += '</div>';
  
  // Footer / Menu / Forms placeholders
  html += `<div class="card" style="margin-top:1rem"><div class="card-header"><h3>📌 Меню, футер, формы</h3></div>`;
  html += `<p class="text-text-muted">Эти элементы редактируются в коде. Для изменения обратитесь к разработчику.</p>`;
  html += `<ul class="info-list"><li><strong>Телефон:</strong> +7 (927) 936-36-06</li><li><strong>Email:</strong> через форму обратной связи</li><li><strong>Соцсети:</strong> WhatsApp, Telegram, VK</li></ul>`;
  html += '</div>';
  
  html += '</div>';
  container.innerHTML = html;
}

function renderPricingTable(packages) {
  let html = '<div class="table-container"><table><thead><tr><th>Название</th><th>Цена</th><th>Описание</th><th>Популярный</th><th>Действия</th></tr></thead><tbody>';
  packages.forEach((pkg, i) => {
    html += `<tr>
      <td><input type="text" class="shared-pkg-name" data-idx="${i}" value="${escapeHtml(pkg.name)}"></td>
      <td><input type="number" class="shared-pkg-price" data-idx="${i}" value="${pkg.price}" style="width:6rem"></td>
      <td><input type="text" class="shared-pkg-desc" data-idx="${i}" value="${escapeHtml(pkg.description)}"></td>
      <td><input type="checkbox" class="shared-pkg-popular" data-idx="${i}" ${pkg.popular ? 'checked' : ''}></td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteSharedPackage(${i})">🗑</button></td>
    </tr>
    <tr><td colspan="5"><div class="form-group"><label>Особенности:</label><textarea class="shared-pkg-features" data-idx="${i}" rows="2">${(pkg.features || []).map(f => f.text).join('\n')}</textarea></div>${pkg.note ? `<div class="form-group"><label>Примечание:</label><input type="text" class="shared-pkg-note" data-idx="${i}" value="${escapeHtml(pkg.note)}"></div>` : ''}</td></tr>`;
  });
  html += '</tbody></table></div>';
  html += `<button class="btn btn-secondary btn-sm mt-1" onclick="addSharedPackage()">+ Добавить пакет</button>`;
  return html;
}

function renderGeographyEditor(data) {
  let html = `<div class="form-group"><label>Текст о географии</label><textarea id="sharedGeoText" rows="3">${escapeHtml(data.geographyText || '')}</textarea></div>`;
  html += '<h4 class="mb-1">Города</h4>';
  (data.cities || []).forEach((c, i) => {
    html += `<div class="form-row" style="margin-bottom:0.5rem"><div class="form-group"><input type="text" class="shared-city-name" data-idx="${i}" value="${escapeHtml(c.name)}" placeholder="Город"></div><div class="form-group"><input type="text" class="shared-city-region" data-idx="${i}" value="${escapeHtml(c.region || '')}" placeholder="Регион (опц.)"></div><div><button class="btn btn-danger btn-sm" onclick="deleteSharedCity(${i})">🗑</button></div></div>`;
  });
  html += `<button class="btn btn-secondary btn-sm mb-2" onclick="addSharedCity()">+ Добавить город</button>`;
  return html;
}

// Shared block actions
function addSharedPackage() {
  currentData.pricing.packages.push({ id: 'pkg-' + Date.now(), name: 'Новый пакет', price: 0, currency: '₽', description: '', features: [{ text: '' }] });
  loadSection('shared');
}
function deleteSharedPackage(idx) {
  if (!confirm('Удалить пакет?')) return;
  currentData.pricing.packages.splice(idx, 1);
  loadSection('shared');
}
function addSharedCity() {
  currentData.geography.cities.push({ name: 'Новый город' });
  loadSection('shared');
}
function deleteSharedCity(idx) {
  currentData.geography.cities.splice(idx, 1);
  loadSection('shared');
}
async function saveSharedPricing() {
  const packages = [];
  document.querySelectorAll('.shared-pkg-name').forEach((input, i) => {
    const idx = parseInt(input.dataset.idx);
    const pkg = currentData.pricing.packages[idx];
    pkg.name = input.value;
    pkg.price = parseInt(document.querySelector(`.shared-pkg-price[data-idx="${idx}"]`).value) || 0;
    pkg.description = document.querySelector(`.shared-pkg-desc[data-idx="${idx}"]`).value;
    pkg.popular = document.querySelector(`.shared-pkg-popular[data-idx="${idx}"]`).checked;
    const featuresText = document.querySelector(`.shared-pkg-features[data-idx="${idx}"]`).value;
    pkg.features = featuresText.split('\n').filter(t => t.trim()).map(text => ({ text: text.trim() }));
    const noteInput = document.querySelector(`.shared-pkg-note[data-idx="${idx}"]`);
    if (noteInput) pkg.note = noteInput.value;
    packages.push(pkg);
  });
  currentData.pricing.packages = packages;
  await api('save', 'POST', { file: 'pricing', data: currentData.pricing });
  showToast('Цены сохранены!', 'success');
}
async function saveSharedGeography() {
  currentData.geography.geographyText = document.getElementById('sharedGeoText').value;
  const cities = [];
  document.querySelectorAll('.shared-city-name').forEach(input => {
    const idx = parseInt(input.dataset.idx);
    const city = { name: input.value };
    const region = document.querySelector(`.shared-city-region[data-idx="${idx}"]`).value;
    if (region) city.region = region;
    cities.push(city);
  });
  currentData.geography.cities = cities;
  await api('save', 'POST', { file: 'geography', data: currentData.geography });
  showToast('География сохранена!', 'success');
}

// ===== HOME PAGE =====
async function loadHomePage(container) {
  const [steps, reviews] = await Promise.all([
    api('get&file=steps'),
    api('get&file=reviews')
  ]);
  
  let html = '<div class="section-group">';
  
  // Steps
  html += `<div class="card"><div class="card-header"><h3>👶 Почему выбирают нас</h3></div>`;
  if (steps.success) {
    currentData.steps = steps.data;
    html += renderStepsEditor(steps.data);
    html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveHomeSteps()">💾 Сохранить шаги</button></div>`;
  }
  html += '</div>';
  
  // Reviews (home page subset)
  html += `<div class="card" style="margin-top:1rem"><div class="card-header"><h3>💬 Отзывы на главной</h3></div>`;
  if (reviews.success) {
    currentData.reviews = reviews.data;
    html += renderReviewsEditor(reviews.data.reviews || [], 'home');
    html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveHomeReviews()">💾 Сохранить отзывы</button></div>`;
  }
  html += '</div>';
  
  html += '</div>';
  container.innerHTML = html;
}

// ===== BENEFITS PAGE (standalone) =====
async function loadBenefitsPage(container) {
  const benefits = await api('get&file=benefits');
  if (!benefits.success) {
    container.innerHTML = '<p class="error">Ошибка загрузки преимуществ</p>';
    return;
  }
  currentData.benefits = benefits.data;
  
  let html = '<div class="section-group">';
  html += `<div class="card"><div class="card-header"><h3>⭐ Преимущества</h3></div>`;
  html += renderBenefitsEditor(benefits.data.benefits || []);
  html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveHomeBenefits()">💾 Сохранить преимущества</button></div>`;
  html += '</div></div>';
  container.innerHTML = html;
}

// ===== GALLERY PAGE (standalone) =====
async function loadGalleryPage(container) {
  const gallery = await api('get&file=gallery');
  if (!gallery.success) {
    container.innerHTML = '<p class="error">Ошибка загрузки галереи</p>';
    return;
  }
  currentData.gallery = gallery.data;
  
  let html = '<div class="section-group">';
  html += `<div class="card"><div class="card-header"><h3>📷 Галерея</h3></div>`;
  html += renderGalleryEditor(gallery.data, 'gallery');
  html += '</div></div>';
  container.innerHTML = html;
}

// ===== FAQ PAGE =====
async function loadFAQPage(container) {
  const faq = await api('get&file=faq');
  if (!faq.success) {
    container.innerHTML = '<p class="error">Ошибка загрузки FAQ</p>';
    return;
  }
  currentData.faq = faq.data;
  
  let html = '<div class="section-group">';
  html += `<div class="card"><div class="card-header"><h3>❓ FAQ — Главная страница (клиенты)</h3></div>`;
  html += renderFAQList(faq.data.categories?.customer || [], 'customer');
  html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveFAQCategory('customer')">💾 Сохранить FAQ клиентов</button></div>`;
  html += '</div>';
  
  html += `<div class="card" style="margin-top:1rem"><div class="card-header"><h3>❓ FAQ — Партнёрство</h3></div>`;
  html += renderFAQList(faq.data.categories?.partnership || [], 'partnership');
  html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveFAQCategory('partnership')">💾 Сохранить FAQ партнёров</button></div>`;
  html += '</div>';
  html += '</div>';
  
  container.innerHTML = html;
}

// ===== REVIEWS PAGE =====
async function loadReviewsPage(container) {
  const reviews = await api('get&file=reviews');
  if (!reviews.success) {
    container.innerHTML = '<p class="error">Ошибка загрузки отзывов</p>';
    return;
  }
  currentData.reviews = reviews.data;
  
  let html = '<div class="section-group">';
  html += `<div class="card"><div class="card-header"><h3>💬 Все отзывы</h3><button class="btn btn-primary btn-sm" onclick="addReview()">+ Добавить отзыв</button></div>`;
  html += renderReviewsEditor(reviews.data.reviews || [], 'all');
  html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveAllReviews()">💾 Сохранить все отзывы</button></div>`;
  html += '</div></div>';
  
  container.innerHTML = html;
}

// ===== PARTNERSHIP PAGE =====
async function loadPartnershipPage(container) {
  const partnership = await api('get&file=partnership');
  if (!partnership.success) {
    container.innerHTML = '<p class="error">Ошибка загрузки партнёрства</p>';
    return;
  }
  currentData.partnership = partnership.data;
  
  let html = '<div class="section-group">';
  
  // About
  html += `<div class="card"><div class="card-header"><h3>🏢 О нас</h3></div>`;
  html += renderPartnershipAbout(partnership.data.about || []);
  html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="savePartnershipAbout()">💾 Сохранить</button></div>`;
  html += '</div>';
  
  // Offers
  html += `<div class="card" style="margin-top:1rem"><div class="card-header"><h3>🎁 Предложения</h3></div>`;
  html += renderPartnershipOffers(partnership.data.offers || []);
  html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="savePartnershipOffers()">💾 Сохранить</button></div>`;
  html += '</div>';
  
  // Prices (shared with home but can override)
  html += `<div class="card" style="margin-top:1rem"><div class="card-header"><h3>💰 Цены партнёрства</h3></div>`;
  html += renderPartnershipPrices(partnership.data.prices || []);
  html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="savePartnershipPrices()">💾 Сохранить</button></div>`;
  html += '</div>';
  
  // Team (with photos)
  html += `<div class="card" style="margin-top:1rem"><div class="card-header"><h3>👥 Команда</h3></div>`;
  html += renderPartnershipTeam(partnership.data.team || []);
  html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="savePartnershipTeam()">💾 Сохранить</button></div>`;
  html += '</div>';
  
  // Projects (with photos)
  html += `<div class="card" style="margin-top:1rem"><div class="card-header"><h3>📁 Портфолио проектов</h3></div>`;
  html += renderPartnershipProjects(partnership.data.projects || []);
  html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="savePartnershipProjects()">💾 Сохранить</button></div>`;
  html += '</div>';
  
  html += '</div>';
  container.innerHTML = html;
}

// ===== CONTACTS PAGE =====
async function loadContactsPage(container) {
  const geography = await api('get&file=geography');
  if (geography.success) currentData.geography = geography.data;
  
  let html = '<div class="section-group">';
  
  html += `<div class="card"><div class="card-header"><h3>📇 Контакты</h3></div>`;
  
  html += `<div class="form-group"><label>Телефон</label><input type="text" id="contactPhone" value="+7 (927) 936-36-06" readonly style="background:var(--cream-2)"></div>`;
  html += `<p class="text-text-muted text-sm">Телефон меняется в коде. Сообщите разработчику.</p>`;
  
  html += `<div class="form-group"><label>Города (из общей географии)</label>`;
  html += `<div class="city-tags">${(currentData.geography?.cities || []).map(c => `<span class="city-tag">${escapeHtml(c.name)}${c.region ? ` <small>(${escapeHtml(c.region)})</small>` : ''}</span>`).join('')}</div>`;
  html += `</div>`;
  
  html += `<div class="form-group"><label>Текст о географии</label><textarea id="contactsGeoText" rows="3">${escapeHtml(currentData.geography?.geographyText || '')}</textarea></div>`;
  html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveContactsGeo()">💾 Сохранить текст</button></div>`;
  
  // SEO for contacts
  html += `<div class="card" style="margin-top:1rem"><div class="card-header"><h3>🔍 SEO для страницы контактов</h3></div>`;
  html += `<div class="form-group"><label>Title</label><input type="text" id="contactsTitle" value="Контакты | фотослужба САН ЛАЙФ"></div>`;
  html += `<div class="form-group"><label>Description</label><textarea id="contactsDesc" rows="2">Фотослужба САН ЛАЙФ. Телефон: +7 (927) 936-36-06. Работаем в Уфе, Стерлитамаке, Кумертау, Салавате, Нижнем Новгороде, Иркутске, Орске.</textarea></div>`;
  html += `<div class="form-group"><label>H1 заголовок</label><input type="text" id="contactsH1" value="Свяжитесь с нами"></div>`;
  html += `<div class="form-group"><label>Текст страницы</label><textarea id="contactsText" rows="4">Мы всегда рады новым клиентам и партнёрам. Звоните или пишите — ответим на все вопросы о фотосъёмке выписки из роддома.</textarea></div>`;
  html += `<p class="text-text-muted text-sm">💡 SEO-совет: на странице контактов должны быть: телефон (кликабельный), адрес, часы работы, карта, ссылки на соцсети. Это повышает доверие поисковиков.</p>`;
  html += `</div>`;
  
  html += '</div>';
  html += '</div>';
  container.innerHTML = html;
}

async function saveContactsGeo() {
  if (!currentData.geography) return;
  currentData.geography.geographyText = document.getElementById('contactsGeoText').value;
  await api('save', 'POST', { file: 'geography', data: currentData.geography });
  showToast('Сохранено!', 'success');
}

// ===== META / SEO =====
async function loadMetaPage(container) {
  const meta = await api('get&file=meta');
  if (!meta.success) {
    container.innerHTML = '<p class="error">Ошибка загрузки SEO</p>';
    return;
  }
  currentData.meta = meta.data;
  
  let html = '<div class="section-group">';
  html += `<div class="card"><div class="card-header"><h3>🔍 SEO — Основные настройки</h3></div>`;
  html += `<div class="form-group"><label>Название сайта</label><input type="text" id="metaSiteName" value="${escapeHtml(meta.data.siteMeta?.siteName || '')}"></div>`;
  html += `<div class="form-group"><label>URL сайта</label><input type="text" id="metaBaseUrl" value="${escapeHtml(meta.data.siteMeta?.baseUrl || '')}"></div>`;
  html += `</div>`;
  
  (meta.data.pages || []).forEach((page, i) => {
    html += `<div class="card" style="margin-top:1rem"><div class="card-header"><h3>Страница: ${escapeHtml(page.path)}</h3></div>`;
    html += `<div class="form-row"><div class="form-group"><label>Title</label><input type="text" class="meta-title" data-idx="${i}" value="${escapeHtml(page.title)}"></div><div class="form-group"><label>OG Title</label><input type="text" class="meta-ogtitle" data-idx="${i}" value="${escapeHtml(page.ogTitle)}"></div></div>`;
    html += `<div class="form-group"><label>Description</label><textarea class="meta-desc" data-idx="${i}" rows="2">${escapeHtml(page.description)}</textarea></div>`;
    html += `<div class="form-group"><label>OG Description</label><textarea class="meta-ogdesc" data-idx="${i}" rows="2">${escapeHtml(page.ogDescription)}</textarea></div>`;
    html += `<div class="form-row"><div class="form-group"><label>OG Image</label><input type="text" class="meta-ogimg" data-idx="${i}" value="${escapeHtml(page.ogImage)}"></div><div class="form-group"><label>Canonical</label><input type="text" class="meta-canonical" data-idx="${i}" value="${escapeHtml(page.canonical)}"></div></div>`;
    html += `</div>`;
  });
  html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveMeta()">💾 Сохранить SEO</button></div>`;
  html += '</div>';
  container.innerHTML = html;
}

async function saveMeta() {
  currentData.meta.siteMeta = {
    siteName: document.getElementById('metaSiteName').value,
    baseUrl: document.getElementById('metaBaseUrl').value,
    defaultOgImage: currentData.meta.siteMeta?.defaultOgImage || '/images/og-default.jpg'
  };
  const pages = [];
  document.querySelectorAll('.meta-title').forEach((el, i) => {
    pages.push({ path: currentData.meta.pages[i].path, title: el.value, description: document.querySelectorAll('.meta-desc')[i].value, ogTitle: document.querySelectorAll('.meta-ogtitle')[i].value, ogDescription: document.querySelectorAll('.meta-ogdesc')[i].value, ogImage: document.querySelectorAll('.meta-ogimg')[i].value, canonical: document.querySelectorAll('.meta-canonical')[i].value });
  });
  currentData.meta.pages = pages;
  await api('save', 'POST', { file: 'meta', data: currentData.meta });
  showToast('SEO сохранено!', 'success');
}

// ===== USERS PAGE =====
async function loadUsersPage(container) {
  container.innerHTML = '<p class="loading"><span class="spinner"></span> Загрузка пользователей...</p>';
  const res = await api('users-list');
  if (!res.success) {
    container.innerHTML = `<p class="error">Ошибка: ${res.error}</p>`;
    return;
  }
  renderUsersList(container, res.users || []);
}

function renderUsersList(container, users) {
  const allPerms = ALL_PERMISSIONS;
  
  let html = `<div class="card"><div class="card-header"><h3>👥 Пользователи</h3><button class="btn btn-primary btn-sm" onclick="showCreateUserForm()">+ Добавить</button></div>`;
  html += `<div class="table-container"><table><thead><tr><th>Логин</th><th>Имя</th><th>Роль</th><th>Права</th><th>Действия</th></tr></thead><tbody>`;
  users.forEach(u => {
    const permsText = u.role === 'admin' ? 'все' : (u.permissions?.join(', ') || 'нет');
    html += `<tr><td><strong>${escapeHtml(u.login)}</strong></td><td>${escapeHtml(u.name)}</td><td><span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-editor'}">${u.role === 'admin' ? 'Админ' : 'Редактор'}</span></td><td><small>${escapeHtml(permsText)}</small></td><td><button class="btn btn-secondary btn-sm" onclick="editUser('${escapeHtml(u.login)}')">✏️</button> <button class="btn btn-danger btn-sm" onclick="deleteUser('${escapeHtml(u.login)}')">🗑</button></td></tr>`;
  });
  html += `</tbody></table></div></div>`;
  
  // Create form
  html += `<div id="createUserForm" class="card hidden" style="margin-top:1rem"><div class="card-header"><h3>Новый пользователь</h3></div>`;
  html += `<div class="form-group"><label>Логин</label><input type="text" id="newUserLogin" placeholder="latin_letters"></div>`;
  html += `<div class="form-group"><label>Имя</label><input type="text" id="newUserName" placeholder="Имя"></div>`;
  html += `<div class="form-group"><label>Пароль</label><input type="password" id="newUserPassword" placeholder="Минимум 6 символов"></div>`;
  html += `<div class="form-group"><label>Роль</label><select id="newUserRole"><option value="editor">Редактор</option><option value="admin">Администратор</option></select></div>`;
  html += `<div class="form-group" id="permissionsGroup"><label>Права</label><div class="checkbox-grid">${allPerms.map(p => `<label class="checkbox-label"><input type="checkbox" class="perm-checkbox" value="${p}" checked> ${permLabel(p)}</label>`).join('')}</div></div>`;
  html += `<div class="flex gap-1"><button class="btn btn-secondary" onclick="hideCreateUserForm()">Отмена</button><button class="btn btn-primary" onclick="createUser()">Создать</button></div>`;
  html += `</div>`;
  
  container.innerHTML = html;
  
  setTimeout(() => {
    const roleSelect = document.getElementById('newUserRole');
    if (roleSelect) {
      roleSelect.addEventListener('change', () => {
        document.getElementById('permissionsGroup').classList.toggle('hidden', roleSelect.value === 'admin');
      });
    }
  }, 0);
}

function permLabel(perm) {
  const labels = { pricing: 'Цены', faq: 'FAQ', gallery: 'Галерея', benefits: 'Преимущества', reviews: 'Отзывы', steps: 'Почему мы', geography: 'География', partnership: 'Партнёрство', meta: 'SEO', users: 'Пользователи', shared: 'Общие блоки', contacts: 'Контакты' };
  return labels[perm] || perm;
}

function showCreateUserForm() { document.getElementById('createUserForm').classList.remove('hidden'); }
function hideCreateUserForm() { document.getElementById('createUserForm').classList.add('hidden'); }

async function createUser() {
  const login = document.getElementById('newUserLogin').value.trim();
  const name = document.getElementById('newUserName').value.trim();
  const password = document.getElementById('newUserPassword').value;
  const role = document.getElementById('newUserRole').value;
  const permissions = role === 'admin' ? ALL_PERMISSIONS : Array.from(document.querySelectorAll('.perm-checkbox:checked')).map(cb => cb.value);
  
  if (!login || !name || !password) { showToast('Заполните все поля', 'error'); return; }
  if (password.length < 6) { showToast('Пароль минимум 6 символов', 'error'); return; }
  
  const res = await api('user-create', 'POST', { login, name, password, role, permissions });
  if (res.success) { showToast('Пользователь создан!', 'success'); hideCreateUserForm(); loadUsersPage(document.getElementById('editorContainer')); }
  else { showToast(res.error || 'Ошибка', 'error'); }
}

async function deleteUser(login) {
  if (!confirm(`Удалить ${login}?`)) return;
  const res = await api('user-delete', 'POST', { login });
  if (res.success) { showToast('Удалён', 'success'); loadUsersPage(document.getElementById('editorContainer')); }
  else { showToast(res.error || 'Ошибка', 'error'); }
}

async function editUser(login) {
  const newName = prompt('Новое имя:');
  if (!newName) return;
  const newPassword = prompt('Новый пароль (пусто = не менять):');
  const res = await api('user-update', 'POST', { login, name: newName, password: newPassword || undefined });
  if (res.success) { showToast('Обновлён', 'success'); loadUsersPage(document.getElementById('editorContainer')); }
  else { showToast(res.error || 'Ошибка', 'error'); }
}

// ===== PHOTO MANAGEMENT =====
function renderPhotoUploader(id, onUpload, multiple = true) {
  return `
    <div class="upload-zone" onclick="document.getElementById('${id}').click()">
      <p>📁 Нажмите или перетащите фото</p>
      <p style="font-size:0.75rem;color:var(--text-light)">JPG, PNG, GIF → WebP (400/800/1200/1600px)</p>
      <input type="file" id="${id}" accept="image/*" ${multiple ? 'multiple' : ''} onchange="${onUpload}(event)">
    </div>
  `;
}

async function handlePhotoUpload(event, collection, type = 'gallery') {
  const files = event.target.files;
  if (!files.length) return;
  
  for (const file of files) {
    const formData = new FormData();
    formData.append('image', file);
    showToast(`Загрузка ${file.name}...`, 'info');
    
    const res = await apiFormData('upload', formData);
    if (res.success) {
      const newItem = {
        src: res.image.src,
        alt: file.name.replace(/\.[^.]+$/, ''),
        width: res.image.width,
        height: res.image.height,
      };
      if (type === 'project') {
        newItem.id = 'proj-' + Date.now();
        newItem.title = file.name.replace(/\.[^.]+$/, '');
      } else if (type === 'team') {
        newItem.id = 'team-' + Date.now();
        newItem.name = '';
        newItem.role = '';
      }
      collection.push(newItem);
      showToast(`${file.name} ✓`, 'success');
    } else {
      showToast(res.error || 'Ошибка', 'error');
    }
  }
  loadSection(currentSection);
}

// ===== COLLECTION EDITORS (Benefits, Steps, Reviews, etc.) =====
function renderBenefitsEditor(benefits) {
  let html = '';
  benefits.forEach((b, i) => {
    html += `<div class="form-row collection-item" style="margin-bottom:1rem;padding:1rem;border:1px solid var(--border);border-radius:var(--radius)">
      <div class="form-group"><label>Заголовок</label><input type="text" class="benefit-title" data-idx="${i}" value="${escapeHtml(b.title)}"></div>
      <div class="form-group"><label>Иконка</label><select class="benefit-icon" data-idx="${i}"><option value="camera" ${b.icon === 'camera' ? 'selected' : ''}>📷 Камера</option><option value="tag" ${b.icon === 'tag' ? 'selected' : ''}>🏷️ Ценник</option><option value="truck" ${b.icon === 'truck' ? 'selected' : ''}>🚚 Доставка</option><option value="clock" ${b.icon === 'clock' ? 'selected' : ''}>⏰ Часы</option></select></div>
      <div class="form-group" style="flex:2"><label>Описание</label><textarea class="benefit-desc" data-idx="${i}" rows="2">${escapeHtml(b.description)}</textarea></div>
      <div style="display:flex;align-items:flex-end"><button class="btn btn-danger btn-sm" onclick="deleteBenefit(${i})">🗑</button></div>
    </div>`;
  });
  html += `<button class="btn btn-secondary btn-sm" onclick="addBenefit()">+ Добавить преимущество</button>`;
  return html;
}

function renderStepsEditor(data) {
  let html = `<div class="form-group"><label>Вводный текст</label><textarea id="stepsIntro" rows="2">${escapeHtml(data.introText || '')}</textarea></div>`;
  (data.steps || []).forEach((s, i) => {
    html += `<div class="form-row collection-item" style="margin-bottom:1rem;padding:1rem;border:1px solid var(--border);border-radius:var(--radius)">
      <div class="form-group"><label>Заголовок</label><input type="text" class="step-title" data-idx="${i}" value="${escapeHtml(s.title)}"></div>
      <div class="form-group"><label>Статистика</label><input type="text" class="step-stat" data-idx="${i}" value="${escapeHtml(s.stat || '')}"></div>
      <div class="form-group" style="flex:2"><label>Описание</label><textarea class="step-desc" data-idx="${i}" rows="2">${escapeHtml(s.description)}</textarea></div>
      <div style="display:flex;align-items:flex-end"><button class="btn btn-danger btn-sm" onclick="deleteStep(${i})">🗑</button></div>
    </div>`;
  });
  html += `<button class="btn btn-secondary btn-sm" onclick="addStep()">+ Добавить шаг</button>`;
  return html;
}

function renderReviewsEditor(reviews, context) {
  let html = '';
  reviews.forEach((r, i) => {
    html += `<div class="form-row collection-item" style="margin-bottom:1rem;padding:1rem;border:1px solid var(--border);border-radius:var(--radius)">
      <div class="form-group"><label>Автор</label><input type="text" class="review-author" data-idx="${i}" value="${escapeHtml(r.author)}"></div>
      <div class="form-group"><label>Город</label><input type="text" class="review-city" data-idx="${i}" value="${escapeHtml(r.city || '')}"></div>
      <div class="form-group"><label>Дата</label><input type="text" class="review-date" data-idx="${i}" value="${escapeHtml(r.date || '')}"></div>
      <div class="form-group" style="flex:2"><label>Текст отзыва</label><textarea class="review-text" data-idx="${i}" rows="3">${escapeHtml(r.text)}</textarea></div>
      <div style="display:flex;align-items:flex-end"><button class="btn btn-danger btn-sm" onclick="deleteReview(${i})">🗑</button></div>
    </div>`;
  });
  html += `<button class="btn btn-secondary btn-sm" onclick="addReview()">+ Добавить отзыв</button>`;
  return html;
}

function renderGalleryEditor(data, context) {
  const images = data.images || [];
  let html = renderPhotoUploader('galleryUpload', 'handleGalleryUpload', true);
  html += '<div class="image-grid" style="margin-top:1rem">';
  images.forEach((img, i) => {
    html += `<div class="image-card">
      <img src="${img.src}" alt="${escapeHtml(img.alt)}" loading="lazy">
      <div class="image-info">
        <input type="text" class="gallery-alt" data-idx="${i}" value="${escapeHtml(img.alt)}" placeholder="SEO alt описание">
      </div>
      <div class="image-actions"><button class="btn btn-danger btn-sm" onclick="deleteGalleryImage(${i})">🗑</button></div>
    </div>`;
  });
  html += '</div>';
  html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveGallery('${context}')">💾 Сохранить галерею</button></div>`;
  return html;
}

// ===== PARTNERSHIP COLLECTIONS =====
function renderPartnershipAbout(items) {
  let html = '';
  items.forEach((item, i) => {
    html += `<div class="form-row collection-item"><div class="form-group"><input type="text" class="about-num" data-idx="${i}" value="${escapeHtml(item.number)}" placeholder="№"></div><div class="form-group" style="flex:3"><input type="text" class="about-text" data-idx="${i}" value="${escapeHtml(item.text)}" placeholder="Текст"></div><div><button class="btn btn-danger btn-sm" onclick="deleteAboutItem(${i})">🗑</button></div></div>`;
  });
  html += `<button class="btn btn-secondary btn-sm" onclick="addAboutItem()">+ Добавить</button>`;
  return html;
}

function renderPartnershipOffers(items) {
  let html = '';
  items.forEach((item, i) => {
    html += `<div class="collection-item" style="margin-bottom:1rem;padding:1rem;border:1px solid var(--border);border-radius:var(--radius)">
      <div class="form-row"><div class="form-group"><input type="text" class="offer-num" data-idx="${i}" value="${escapeHtml(item.number)}" placeholder="№"></div><div class="form-group" style="flex:2"><input type="text" class="offer-title" data-idx="${i}" value="${escapeHtml(item.title)}" placeholder="Заголовок"></div><div><button class="btn btn-danger btn-sm" onclick="deleteOfferItem(${i})">🗑</button></div></div>
      <div class="form-group"><textarea class="offer-desc" data-idx="${i}" rows="2" placeholder="Описание">${escapeHtml(item.description)}</textarea></div>
    </div>`;
  });
  html += `<button class="btn btn-secondary btn-sm" onclick="addOfferItem()">+ Добавить</button>`;
  return html;
}

function renderPartnershipPrices(items) {
  let html = '';
  items.forEach((item, i) => {
    html += `<div class="form-row collection-item"><div class="form-group" style="flex:2"><input type="text" class="price-title" data-idx="${i}" value="${escapeHtml(item.title)}" placeholder="Название"></div><div class="form-group"><input type="text" class="price-value" data-idx="${i}" value="${escapeHtml(item.price)}" placeholder="Цена"></div><div><button class="btn btn-danger btn-sm" onclick="deletePriceItem(${i})">🗑</button></div></div>`;
  });
  html += `<button class="btn btn-secondary btn-sm" onclick="addPriceItem()">+ Добавить</button>`;
  return html;
}

function renderPartnershipTeam(items) {
  let html = renderPhotoUploader('teamUpload', 'handleTeamUpload', true);
  html += '<div class="image-grid" style="margin-top:1rem">';
  items.forEach((item, i) => {
    html += `<div class="image-card">
      <img src="${item.src}" alt="${escapeHtml(item.name)}" loading="lazy">
      <div class="image-info">
        <input type="text" class="team-name" data-idx="${i}" value="${escapeHtml(item.name)}" placeholder="Имя">
        <input type="text" class="team-role" data-idx="${i}" value="${escapeHtml(item.role)}" placeholder="Роль" style="margin-top:0.25rem">
      </div>
      <div class="image-actions"><button class="btn btn-danger btn-sm" onclick="deleteTeamItem(${i})">🗑</button></div>
    </div>`;
  });
  html += '</div>';
  return html;
}

function renderPartnershipProjects(items) {
  let html = renderPhotoUploader('projectUpload', 'handleProjectUpload', true);
  html += '<div class="image-grid" style="margin-top:1rem">';
  items.forEach((item, i) => {
    html += `<div class="image-card">
      <img src="${item.src}" alt="${escapeHtml(item.alt)}" loading="lazy">
      <div class="image-info">
        <input type="text" class="project-title" data-idx="${i}" value="${escapeHtml(item.title)}" placeholder="Заголовок проекта">
        <input type="text" class="project-alt" data-idx="${i}" value="${escapeHtml(item.alt)}" placeholder="SEO alt описание" style="margin-top:0.25rem">
      </div>
      <div class="image-actions"><button class="btn btn-danger btn-sm" onclick="deleteProjectItem(${i})">🗑</button></div>
    </div>`;
  });
  html += '</div>';
  return html;
}

// ===== SAVE ACTIONS =====
async function saveHomeBenefits() {
  const benefits = [];
  document.querySelectorAll('.benefit-title').forEach((input, i) => {
    benefits.push({ id: currentData.benefits.benefits[i]?.id || 'benefit-' + Date.now(), title: input.value, description: document.querySelectorAll('.benefit-desc')[i].value, icon: document.querySelectorAll('.benefit-icon')[i].value });
  });
  currentData.benefits.benefits = benefits;
  await api('save', 'POST', { file: 'benefits', data: currentData.benefits });
  showToast('Преимущества сохранены!', 'success');
}

async function saveHomeSteps() {
  currentData.steps.introText = document.getElementById('stepsIntro').value;
  const steps = [];
  document.querySelectorAll('.step-title').forEach((input, i) => {
    steps.push({ id: currentData.steps.steps[i]?.id || 'step-' + Date.now(), title: input.value, description: document.querySelectorAll('.step-desc')[i].value, image: currentData.steps.steps[i]?.image || '/images/about-1.avif', stat: document.querySelectorAll('.step-stat')[i].value || undefined });
  });
  currentData.steps.steps = steps;
  await api('save', 'POST', { file: 'steps', data: currentData.steps });
  showToast('Шаги сохранены!', 'success');
}

async function saveHomeReviews() {
  const reviews = [];
  document.querySelectorAll('.review-author').forEach((input, i) => {
    reviews.push({ id: currentData.reviews.reviews[i]?.id || 'review-' + Date.now(), author: input.value, text: document.querySelectorAll('.review-text')[i].value, city: document.querySelectorAll('.review-city')[i].value || undefined, date: document.querySelectorAll('.review-date')[i].value || undefined });
  });
  currentData.reviews.reviews = reviews;
  await api('save', 'POST', { file: 'reviews', data: currentData.reviews });
  showToast('Отзывы сохранены!', 'success');
}

async function saveAllReviews() {
  await saveHomeReviews();
}

async function saveFAQCategory(category) {
  const items = [];
  document.querySelectorAll(`.faq-q[data-cat="${category}"]`).forEach((q, i) => {
    const idx = q.dataset.idx;
    items.push({ id: currentData.faq.categories[category][idx]?.id || 'faq-' + Date.now(), question: q.value, answer: document.querySelector(`.faq-a[data-cat="${category}"][data-idx="${idx}"]`).value });
  });
  currentData.faq.categories[category] = items;
  await api('save', 'POST', { file: 'faq', data: currentData.faq });
  showToast(`FAQ ${category === 'customer' ? 'клиентов' : 'партнёров'} сохранён!`, 'success');
}

async function saveGallery(context) {
  document.querySelectorAll('.gallery-alt').forEach(input => {
    const idx = parseInt(input.dataset.idx);
    currentData.gallery.images[idx].alt = input.value;
  });
  await api('save', 'POST', { file: 'gallery', data: currentData.gallery });
  showToast('Галерея сохранена!', 'success');
}

async function savePartnershipAbout() {
  const about = [];
  document.querySelectorAll('.about-num').forEach((el, i) => {
    about.push({ id: currentData.partnership.about[i]?.id || 'about-' + Date.now(), number: el.value, text: document.querySelectorAll('.about-text')[i].value });
  });
  currentData.partnership.about = about;
  await api('save', 'POST', { file: 'partnership', data: currentData.partnership });
  showToast('Сохранено!', 'success');
}

async function savePartnershipOffers() {
  const offers = [];
  document.querySelectorAll('.offer-num').forEach((el, i) => {
    offers.push({ id: currentData.partnership.offers[i]?.id || 'offer-' + Date.now(), number: el.value, title: document.querySelectorAll('.offer-title')[i].value, description: document.querySelectorAll('.offer-desc')[i].value });
  });
  currentData.partnership.offers = offers;
  await api('save', 'POST', { file: 'partnership', data: currentData.partnership });
  showToast('Сохранено!', 'success');
}

async function savePartnershipPrices() {
  const prices = [];
  document.querySelectorAll('.price-title').forEach((el, i) => {
    prices.push({ id: currentData.partnership.prices[i]?.id || 'price-' + Date.now(), title: el.value, price: document.querySelectorAll('.price-value')[i].value });
  });
  currentData.partnership.prices = prices;
  await api('save', 'POST', { file: 'partnership', data: currentData.partnership });
  showToast('Сохранено!', 'success');
}

async function savePartnershipTeam() {
  const team = [];
  document.querySelectorAll('.team-name').forEach((el, i) => {
    team.push({ id: currentData.partnership.team[i]?.id || 'team-' + Date.now(), name: el.value, role: document.querySelectorAll('.team-role')[i].value, src: currentData.partnership.team[i]?.src || '/images/placeholder-team-1.jpg' });
  });
  currentData.partnership.team = team;
  await api('save', 'POST', { file: 'partnership', data: currentData.partnership });
  showToast('Сохранено!', 'success');
}

async function savePartnershipProjects() {
  const projects = [];
  document.querySelectorAll('.project-title').forEach((el, i) => {
    projects.push({ id: currentData.partnership.projects[i]?.id || 'proj-' + Date.now(), title: el.value, alt: document.querySelectorAll('.project-alt')[i].value, src: currentData.partnership.projects[i]?.src || '/images/placeholder-1.jpg' });
  });
  currentData.partnership.projects = projects;
  await api('save', 'POST', { file: 'partnership', data: currentData.partnership });
  showToast('Сохранено!', 'success');
}

// ===== ADD/DELETE ACTIONS =====
function addBenefit() { currentData.benefits.benefits.push({ id: 'benefit-' + Date.now(), title: '', description: '', icon: 'camera' }); loadSection('benefits'); }
function deleteBenefit(i) { if (!confirm('Удалить?')) return; currentData.benefits.benefits.splice(i, 1); loadSection('benefits'); }
function addStep() { currentData.steps.steps.push({ id: 'step-' + Date.now(), title: '', description: '', image: '/images/about-1.avif' }); loadSection('home'); }
function deleteStep(i) { if (!confirm('Удалить?')) return; currentData.steps.steps.splice(i, 1); loadSection('home'); }
function addReview() { currentData.reviews.reviews.push({ id: 'review-' + Date.now(), author: '', text: '' }); loadSection(currentSection === 'home' ? 'home' : 'reviews'); }
function deleteReview(i) { if (!confirm('Удалить?')) return; currentData.reviews.reviews.splice(i, 1); loadSection(currentSection); }
function addAboutItem() { currentData.partnership.about.push({ id: 'about-' + Date.now(), number: '', text: '' }); loadSection('partnership'); }
function deleteAboutItem(i) { if (!confirm('Удалить?')) return; currentData.partnership.about.splice(i, 1); loadSection('partnership'); }
function addOfferItem() { currentData.partnership.offers.push({ id: 'offer-' + Date.now(), number: '', title: '', description: '' }); loadSection('partnership'); }
function deleteOfferItem(i) { if (!confirm('Удалить?')) return; currentData.partnership.offers.splice(i, 1); loadSection('partnership'); }
function addPriceItem() { currentData.partnership.prices.push({ id: 'price-' + Date.now(), title: '', price: '' }); loadSection('partnership'); }
function deletePriceItem(i) { if (!confirm('Удалить?')) return; currentData.partnership.prices.splice(i, 1); loadSection('partnership'); }
function addTeamItem() { currentData.partnership.team.push({ id: 'team-' + Date.now(), name: '', role: '', src: '/images/placeholder-team-1.jpg' }); loadSection('partnership'); }
function deleteTeamItem(i) { if (!confirm('Удалить?')) return; currentData.partnership.team.splice(i, 1); loadSection('partnership'); }
function addProjectItem() { currentData.partnership.projects.push({ id: 'proj-' + Date.now(), title: '', alt: '', src: '/images/placeholder-1.jpg' }); loadSection('partnership'); }
function deleteProjectItem(i) { if (!confirm('Удалить?')) return; currentData.partnership.projects.splice(i, 1); loadSection('partnership'); }
function deleteGalleryImage(i) { if (!confirm('Удалить фото?')) return; currentData.gallery.images.splice(i, 1); loadSection(currentSection); }

// ===== PHOTO UPLOAD HANDLERS =====
async function handleGalleryUpload(event) {
  await handlePhotoUpload(event, currentData.gallery.images, 'gallery');
}
async function handleTeamUpload(event) {
  await handlePhotoUpload(event, currentData.partnership.team, 'team');
}
async function handleProjectUpload(event) {
  await handlePhotoUpload(event, currentData.partnership.projects, 'project');
}

// ===== FAQ LIST RENDERER =====
function renderFAQList(items, category) {
  let html = `<button class="btn btn-secondary btn-sm mb-1" onclick="addFAQItem('${category}')">+ Добавить вопрос</button>`;
  items.forEach((item, i) => {
    html += `<div class="accordion-item open" data-cat="${category}" data-idx="${i}">
      <div class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
        <h4>${escapeHtml(item.question || 'Вопрос #' + (i + 1))}</h4>
        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteFAQItem('${category}', ${i})">🗑</button>
      </div>
      <div class="accordion-body">
        <div class="form-group"><label>Вопрос</label><input type="text" class="faq-q" data-cat="${category}" data-idx="${i}" value="${escapeHtml(item.question)}"></div>
        <div class="form-group"><label>Ответ</label><textarea class="faq-a" data-cat="${category}" data-idx="${i}" rows="4">${escapeHtml(item.answer)}</textarea></div>
      </div>
    </div>`;
  });
  return html;
}

function addFAQItem(category) {
  currentData.faq.categories = currentData.faq.categories || { customer: [], partnership: [] };
  currentData.faq.categories[category].push({ id: 'faq-' + Date.now(), question: 'Новый вопрос', answer: 'Ответ...' });
  loadSection('faq');
}
function deleteFAQItem(category, i) {
  if (!confirm('Удалить?')) return;
  currentData.faq.categories[category].splice(i, 1);
  loadSection('faq');
}

// ===== UTILITY =====
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

async function logout() {
  await api('logout');
  window.location.href = 'index.html';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('editorContainer')) {
    const ok = await checkAuth();
    if (!ok) return;
    
    const userNameEl = document.getElementById('userName');
    if (userNameEl && currentUser) {
      userNameEl.textContent = currentUser.name + (currentUser.role === 'admin' ? ' (Админ)' : ' (Редактор)');
    }
    
    buildMenu();
    
    const firstItem = MENU_STRUCTURE.find(item => hasPermission(item.perm));
    if (firstItem) {
      loadSection(firstItem.id);
      setTimeout(() => {
        const link = document.querySelector(`[data-section="${firstItem.id}"]`);
        if (link) link.classList.add('active');
      }, 0);
    }
  }
});
