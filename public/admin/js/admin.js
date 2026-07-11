/**
 * Sunlife CMS Admin Dashboard - Multi-user with permissions
 * Vanilla JS - no build step required
 */

const API_BASE = 'api/index.php';

// Permission to menu item mapping
const MENU_ITEMS = [
  { id: 'pricing', icon: '💰', label: 'Цены', perm: 'pricing' },
  { id: 'faq', icon: '❓', label: 'FAQ', perm: 'faq' },
  { id: 'gallery', icon: '📷', label: 'Галерея', perm: 'gallery' },
  { id: 'benefits', icon: '⭐', label: 'Преимущества', perm: 'benefits' },
  { id: 'reviews', icon: '💬', label: 'Отзывы', perm: 'reviews' },
  { id: 'steps', icon: '👶', label: 'Почему мы', perm: 'steps' },
  { id: 'geography', icon: '🗺', label: 'География', perm: 'geography' },
  { id: 'partnership', icon: '🤝', label: 'Партнёрство', perm: 'partnership' },
  { id: 'meta', icon: '🔍', label: 'SEO', perm: 'meta' },
  { id: 'users', icon: '👥', label: 'Пользователи', perm: 'users' },
];

let currentUser = null;
let currentData = {};
let currentFile = '';

// ===== Toast Notifications =====
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

// ===== API Helpers =====
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

// ===== Build Menu =====
function buildMenu() {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;
  
  nav.innerHTML = '';
  
  MENU_ITEMS.forEach(item => {
    if (!hasPermission(item.perm)) return;
    
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.dataset.file = item.id;
    a.innerHTML = `<span class="icon">${item.icon}</span> ${item.label}`;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.sidebar-nav a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      loadContent(item.id);
    });
    li.appendChild(a);
    nav.appendChild(li);
  });
}

// ===== Content Loading =====
async function loadContent(file) {
  if (!requirePermission(file)) return;
  
  currentFile = file;
  const data = await api(`get&file=${file}`);
  if (data.success) {
    currentData = data.data;
    renderEditor(file, data.data);
  } else {
    showToast(data.error || 'Ошибка загрузки', 'error');
  }
}

async function saveContent(file, data) {
  if (!requirePermission(file)) return false;
  
  const res = await api('save', 'POST', { file, data });
  if (res.success) {
    showToast('Сохранено!', 'success');
  } else {
    showToast(res.error || 'Ошибка сохранения', 'error');
  }
  return res.success;
}

// ===== Editor Rendering =====
function renderEditor(file, data) {
  const container = document.getElementById('editorContainer');
  if (!container) return;

  switch (file) {
    case 'pricing': renderPricingEditor(container, data); break;
    case 'faq': renderFAQEditor(container, data); break;
    case 'gallery': renderGalleryEditor(container, data); break;
    case 'benefits': renderBenefitsEditor(container, data); break;
    case 'reviews': renderReviewsEditor(container, data); break;
    case 'steps': renderStepsEditor(container, data); break;
    case 'geography': renderGeographyEditor(container, data); break;
    case 'partnership': renderPartnershipEditor(container, data); break;
    case 'meta': renderMetaEditor(container, data); break;
    case 'users': renderUsersEditor(container); break;
    default: container.innerHTML = '<p class="loading">Выберите раздел в меню</p>';
  }
}

// ===== Pricing Editor =====
function renderPricingEditor(container, data) {
  const packages = data.packages || [];
  let html = `
    <div class="card">
      <div class="card-header">
        <h3>Цены и пакеты</h3>
        <button class="btn btn-primary btn-sm" onclick="addPackage()">+ Добавить пакет</button>
      </div>
      <div class="table-container">
        <table>
          <thead><tr><th>Название</th><th>Цена</th><th>Описание</th><th>Популярный</th><th>Действия</th></tr></thead>
          <tbody>
  `;
  packages.forEach((pkg, i) => {
    html += `
      <tr>
        <td><input type="text" class="pkg-name" data-idx="${i}" value="${escapeHtml(pkg.name)}" placeholder="Название"></td>
        <td><input type="number" class="pkg-price" data-idx="${i}" value="${pkg.price}" style="width:6rem"></td>
        <td><input type="text" class="pkg-desc" data-idx="${i}" value="${escapeHtml(pkg.description)}" placeholder="Описание"></td>
        <td><input type="checkbox" class="pkg-popular" data-idx="${i}" ${pkg.popular ? 'checked' : ''}></td>
        <td><button class="btn btn-danger btn-sm" onclick="deletePackage(${i})">Удалить</button></td>
      </tr>
      <tr><td colspan="5">
        <div class="form-group"><label>Особенности (одна на строку):</label><textarea class="pkg-features" data-idx="${i}" rows="3">${pkg.features.map(f => f.text).join('\n')}</textarea></div>
        ${pkg.note ? `<div class="form-group"><label>Примечание:</label><input type="text" class="pkg-note" data-idx="${i}" value="${escapeHtml(pkg.note)}"></div>` : ''}
      </td></tr>
    `;
  });
  html += `</tbody></table></div><div class="mt-2 text-right"><button class="btn btn-primary" onclick="savePricing()">Сохранить изменения</button></div></div>`;
  container.innerHTML = html;
}

function addPackage() {
  currentData.packages = currentData.packages || [];
  currentData.packages.push({ id: 'new-package-' + Date.now(), name: 'Новый пакет', price: 0, currency: '₽', description: '', features: [{ text: '' }] });
  renderPricingEditor(document.getElementById('editorContainer'), currentData);
}
function deletePackage(idx) {
  if (!confirm('Удалить этот пакет?')) return;
  currentData.packages.splice(idx, 1);
  renderPricingEditor(document.getElementById('editorContainer'), currentData);
}
function savePricing() {
  document.querySelectorAll('.pkg-name').forEach(input => {
    const idx = parseInt(input.dataset.idx);
    const pkg = currentData.packages[idx];
    pkg.name = input.value;
    pkg.price = parseInt(document.querySelector(`.pkg-price[data-idx="${idx}"]`).value) || 0;
    pkg.description = document.querySelector(`.pkg-desc[data-idx="${idx}"]`).value;
    pkg.popular = document.querySelector(`.pkg-popular[data-idx="${idx}"]`).checked;
    const featuresText = document.querySelector(`.pkg-features[data-idx="${idx}"]`).value;
    pkg.features = featuresText.split('\n').filter(t => t.trim()).map(text => ({ text: text.trim() }));
    const noteInput = document.querySelector(`.pkg-note[data-idx="${idx}"]`);
    if (noteInput) pkg.note = noteInput.value;
  });
  saveContent('pricing', currentData);
}

// ===== FAQ Editor =====
function renderFAQEditor(container, data) {
  const categories = data.categories || { customer: [], partnership: [] };
  let html = `
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('customer')">Клиенты</button>
      <button class="tab-btn" onclick="switchTab('partnership')">Партнёры</button>
    </div>
    <div id="faqCustomer" class="tab-panel active">${renderFAQList(categories.customer || [], 'customer')}</div>
    <div id="faqPartnership" class="tab-panel">${renderFAQList(categories.partnership || [], 'partnership')}</div>
    <div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveFAQ()">Сохранить изменения</button></div>
  `;
  container.innerHTML = html;
}

function renderFAQList(items, category) {
  let html = `<button class="btn btn-secondary btn-sm mb-1" onclick="addFAQ('${category}')">+ Добавить вопрос</button>`;
  items.forEach((item, i) => {
    html += `
      <div class="accordion-item open" data-cat="${category}" data-idx="${i}">
        <div class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
          <h4>Вопрос #${i + 1}</h4>
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteFAQ('${category}', ${i})">Удалить</button>
        </div>
        <div class="accordion-body">
          <div class="form-group"><label>Вопрос</label><input type="text" class="faq-q" data-cat="${category}" data-idx="${i}" value="${escapeHtml(item.question)}"></div>
          <div class="form-group"><label>Ответ</label><textarea class="faq-a" data-cat="${category}" data-idx="${i}" rows="4">${escapeHtml(item.answer)}</textarea></div>
        </div>
      </div>`;
  });
  return html;
}

function switchTab(cat) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById(cat === 'customer' ? 'faqCustomer' : 'faqPartnership').classList.add('active');
}
function addFAQ(category) {
  currentData.categories = currentData.categories || { customer: [], partnership: [] };
  currentData.categories[category].push({ id: 'faq-' + Date.now(), question: 'Новый вопрос', answer: 'Ответ на вопрос...' });
  renderFAQEditor(document.getElementById('editorContainer'), currentData);
}
function deleteFAQ(category, idx) {
  if (!confirm('Удалить этот вопрос?')) return;
  currentData.categories[category].splice(idx, 1);
  renderFAQEditor(document.getElementById('editorContainer'), currentData);
}
function saveFAQ() {
  ['customer', 'partnership'].forEach(cat => {
    const items = [];
    document.querySelectorAll(`.faq-q[data-cat="${cat}"]`).forEach(q => {
      const idx = q.dataset.idx;
      items.push({ id: currentData.categories[cat][idx]?.id || 'faq-' + Date.now() + '-' + idx, question: q.value, answer: document.querySelector(`.faq-a[data-cat="${cat}"][data-idx="${idx}"]`).value });
    });
    currentData.categories[cat] = items;
  });
  saveContent('faq', currentData);
}

// ===== Gallery Editor =====
function renderGalleryEditor(container, data) {
  const images = data.images || [];
  let html = `
    <div class="card">
      <div class="card-header"><h3>Галерея</h3></div>
      <div class="upload-zone" onclick="document.getElementById('galleryUpload').click()">
        <p>📁 Перетащите фото сюда или нажмите для выбора</p>
        <p style="font-size:0.8rem;color:var(--text-light)">JPG, PNG, GIF до 10MB. Автоматически создаются WebP в 4 размерах.</p>
        <input type="file" id="galleryUpload" accept="image/*" multiple onchange="handleGalleryUpload(event)">
      </div>
      <div class="image-grid" id="galleryGrid">
  `;
  images.forEach((img, i) => {
    html += `
      <div class="image-card">
        <img src="${img.src}" alt="${escapeHtml(img.alt)}" loading="lazy">
        <div class="image-info"><input type="text" class="gallery-alt" data-idx="${i}" value="${escapeHtml(img.alt)}" placeholder="Описание (SEO)" style="width:100%;font-size:0.75rem;padding:0.25rem"></div>
        <div class="image-actions"><button class="btn btn-danger btn-sm" onclick="deleteGalleryImage(${i})">✕</button></div>
      </div>`;
  });
  html += `</div><div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveGallery()">Сохранить изменения</button></div></div>`;
  container.innerHTML = html;
}

async function handleGalleryUpload(e) {
  const files = e.target.files;
  if (!files.length) return;
  for (const file of files) {
    const formData = new FormData();
    formData.append('image', file);
    showToast(`Загрузка ${file.name}...`, 'info');
    const res = await apiFormData('upload', formData);
    if (res.success) {
      currentData.images = currentData.images || [];
      currentData.images.push({ src: res.image.src, alt: file.name.replace(/\.[^.]+$/, ''), width: res.image.width, height: res.image.height });
      showToast(`${file.name} загружен!`, 'success');
    } else {
      showToast(res.error || 'Ошибка загрузки', 'error');
    }
  }
  renderGalleryEditor(document.getElementById('editorContainer'), currentData);
}
function deleteGalleryImage(idx) {
  if (!confirm('Удалить фото из галереи?')) return;
  currentData.images.splice(idx, 1);
  renderGalleryEditor(document.getElementById('editorContainer'), currentData);
}
function saveGallery() {
  document.querySelectorAll('.gallery-alt').forEach(input => {
    const idx = parseInt(input.dataset.idx);
    currentData.images[idx].alt = input.value;
  });
  saveContent('gallery', currentData);
}

// ===== Benefits Editor =====
function renderBenefitsEditor(container, data) {
  const benefits = data.benefits || [];
  let html = `<div class="card"><div class="card-header"><h3>Преимущества</h3><button class="btn btn-primary btn-sm" onclick="addBenefit()">+ Добавить</button></div>`;
  benefits.forEach((b, i) => {
    html += `
      <div class="form-row" style="margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border)">
        <div class="form-group"><label>Заголовок</label><input type="text" class="benefit-title" data-idx="${i}" value="${escapeHtml(b.title)}"></div>
        <div class="form-group"><label>Иконка</label><select class="benefit-icon" data-idx="${i}"><option value="camera" ${b.icon === 'camera' ? 'selected' : ''}>Камера</option><option value="tag" ${b.icon === 'tag' ? 'selected' : ''}>Ценник</option><option value="truck" ${b.icon === 'truck' ? 'selected' : ''}>Доставка</option><option value="clock" ${b.icon === 'clock' ? 'selected' : ''}>Часы</option></select></div>
        <div class="form-group" style="flex:2"><label>Описание</label><textarea class="benefit-desc" data-idx="${i}" rows="2">${escapeHtml(b.description)}</textarea></div>
        <div style="display:flex;align-items:flex-end"><button class="btn btn-danger btn-sm" onclick="deleteBenefit(${i})">Удалить</button></div>
      </div>`;
  });
  html += `<div class="text-right"><button class="btn btn-primary" onclick="saveBenefits()">Сохранить изменения</button></div></div>`;
  container.innerHTML = html;
}
function addBenefit() { currentData.benefits.push({ id: 'benefit-' + Date.now(), title: '', description: '', icon: 'camera' }); renderBenefitsEditor(document.getElementById('editorContainer'), currentData); }
function deleteBenefit(idx) { if (!confirm('Удалить?')) return; currentData.benefits.splice(idx, 1); renderBenefitsEditor(document.getElementById('editorContainer'), currentData); }
function saveBenefits() {
  const benefits = [];
  document.querySelectorAll('.benefit-title').forEach(input => {
    const idx = input.dataset.idx;
    benefits.push({ id: currentData.benefits[idx]?.id || 'benefit-' + Date.now() + '-' + idx, title: input.value, description: document.querySelector(`.benefit-desc[data-idx="${idx}"]`).value, icon: document.querySelector(`.benefit-icon[data-idx="${idx}"]`).value });
  });
  currentData.benefits = benefits;
  saveContent('benefits', currentData);
}

// ===== Reviews Editor =====
function renderReviewsEditor(container, data) {
  const reviews = data.reviews || [];
  let html = `<div class="card"><div class="card-header"><h3>Отзывы</h3><button class="btn btn-primary btn-sm" onclick="addReview()">+ Добавить отзыв</button></div>`;
  reviews.forEach((r, i) => {
    html += `
      <div class="form-row" style="margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border)">
        <div class="form-group"><label>Автор</label><input type="text" class="review-author" data-idx="${i}" value="${escapeHtml(r.author)}"></div>
        <div class="form-group"><label>Город (опц.)</label><input type="text" class="review-city" data-idx="${i}" value="${escapeHtml(r.city || '')}"></div>
        <div class="form-group"><label>Дата (опц.)</label><input type="text" class="review-date" data-idx="${i}" value="${escapeHtml(r.date || '')}"></div>
        <div class="form-group" style="flex:2"><label>Текст</label><textarea class="review-text" data-idx="${i}" rows="3">${escapeHtml(r.text)}</textarea></div>
        <div style="display:flex;align-items:flex-end"><button class="btn btn-danger btn-sm" onclick="deleteReview(${i})">Удалить</button></div>
      </div>`;
  });
  html += `<div class="text-right"><button class="btn btn-primary" onclick="saveReviews()">Сохранить изменения</button></div></div>`;
  container.innerHTML = html;
}
function addReview() { currentData.reviews.push({ id: 'review-' + Date.now(), author: '', text: '' }); renderReviewsEditor(document.getElementById('editorContainer'), currentData); }
function deleteReview(idx) { if (!confirm('Удалить отзыв?')) return; currentData.reviews.splice(idx, 1); renderReviewsEditor(document.getElementById('editorContainer'), currentData); }
function saveReviews() {
  const reviews = [];
  document.querySelectorAll('.review-author').forEach(input => {
    const idx = input.dataset.idx;
    reviews.push({ id: currentData.reviews[idx]?.id || 'review-' + Date.now() + '-' + idx, author: input.value, text: document.querySelector(`.review-text[data-idx="${idx}"]`).value, city: document.querySelector(`.review-city[data-idx="${idx}"]`).value || undefined, date: document.querySelector(`.review-date[data-idx="${idx}"]`).value || undefined });
  });
  currentData.reviews = reviews;
  saveContent('reviews', currentData);
}

// ===== Steps Editor =====
function renderStepsEditor(container, data) {
  let html = `<div class="card"><div class="card-header"><h3>Почему выбирают нас</h3></div><div class="form-group"><label>Вводный текст</label><textarea id="stepsIntro" rows="2">${escapeHtml(data.introText || '')}</textarea></div>`;
  (data.steps || []).forEach((s, i) => {
    html += `
      <div class="form-row" style="margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border)">
        <div class="form-group"><label>Заголовок</label><input type="text" class="step-title" data-idx="${i}" value="${escapeHtml(s.title)}"></div>
        <div class="form-group"><label>Статистика</label><input type="text" class="step-stat" data-idx="${i}" value="${escapeHtml(s.stat || '')}"></div>
        <div class="form-group" style="flex:2"><label>Описание</label><textarea class="step-desc" data-idx="${i}" rows="2">${escapeHtml(s.description)}</textarea></div>
      </div>`;
  });
  html += `<div class="text-right"><button class="btn btn-primary" onclick="saveSteps()">Сохранить изменения</button></div></div>`;
  container.innerHTML = html;
}
function saveSteps() {
  currentData.introText = document.getElementById('stepsIntro').value;
  const steps = [];
  document.querySelectorAll('.step-title').forEach(input => {
    const idx = input.dataset.idx;
    steps.push({ id: currentData.steps[idx]?.id || 'step-' + Date.now() + '-' + idx, title: input.value, description: document.querySelector(`.step-desc[data-idx="${idx}"]`).value, image: currentData.steps[idx]?.image || '/images/about-1.avif', stat: document.querySelector(`.step-stat[data-idx="${idx}"]`).value || undefined });
  });
  currentData.steps = steps;
  saveContent('steps', currentData);
}

// ===== Geography Editor =====
function renderGeographyEditor(container, data) {
  let html = `<div class="card"><div class="card-header"><h3>География</h3></div><div class="form-group"><label>Текст о географии</label><textarea id="geoText" rows="3">${escapeHtml(data.geographyText || '')}</textarea></div><h4 class="mb-1">Города</h4>`;
  (data.cities || []).forEach((c, i) => {
    html += `
      <div class="form-row" style="margin-bottom:0.5rem">
        <div class="form-group"><input type="text" class="city-name" data-idx="${i}" value="${escapeHtml(c.name)}" placeholder="Город"></div>
        <div class="form-group"><input type="text" class="city-region" data-idx="${i}" value="${escapeHtml(c.region || '')}" placeholder="Регион (опц.)"></div>
        <div><button class="btn btn-danger btn-sm" onclick="deleteCity(${i})">Удалить</button></div>
      </div>`;
  });
  html += `<button class="btn btn-secondary btn-sm mb-2" onclick="addCity()">+ Добавить город</button><div class="text-right"><button class="btn btn-primary" onclick="saveGeography()">Сохранить изменения</button></div></div>`;
  container.innerHTML = html;
}
function addCity() { currentData.cities.push({ name: 'Новый город' }); renderGeographyEditor(document.getElementById('editorContainer'), currentData); }
function deleteCity(idx) { currentData.cities.splice(idx, 1); renderGeographyEditor(document.getElementById('editorContainer'), currentData); }
function saveGeography() {
  currentData.geographyText = document.getElementById('geoText').value;
  const cities = [];
  document.querySelectorAll('.city-name').forEach(input => {
    const idx = input.dataset.idx;
    const city = { name: input.value };
    const region = document.querySelector(`.city-region[data-idx="${idx}"]`).value;
    if (region) city.region = region;
    cities.push(city);
  });
  currentData.cities = cities;
  saveContent('geography', currentData);
}

// ===== Partnership Editor =====
function renderPartnershipEditor(container, data) {
  let html = `
    <div class="tabs">
      <button class="tab-btn active" onclick="switchPartnershipTab('about')">О нас</button>
      <button class="tab-btn" onclick="switchPartnershipTab('offers')">Предложения</button>
      <button class="tab-btn" onclick="switchPartnershipTab('prices')">Цены</button>
      <button class="tab-btn" onclick="switchPartnershipTab('team')">Команда</button>
    </div>
    <div id="partnershipAbout" class="tab-panel active">${renderPartnershipAbout(data.about || [])}</div>
    <div id="partnershipOffers" class="tab-panel">${renderPartnershipOffers(data.offers || [])}</div>
    <div id="partnershipPrices" class="tab-panel">${renderPartnershipPrices(data.prices || [])}</div>
    <div id="partnershipTeam" class="tab-panel">${renderPartnershipTeam(data.team || [])}</div>
    <div class="mt-2 text-right"><button class="btn btn-primary" onclick="savePartnership()">Сохранить изменения</button></div>
  `;
  container.innerHTML = html;
}

function renderPartnershipAbout(items) {
  let html = '<button class="btn btn-secondary btn-sm mb-1" onclick="addAboutItem()">+ Добавить</button>';
  items.forEach((item, i) => {
    html += `<div class="form-row" style="margin-bottom:0.75rem"><div class="form-group"><input type="text" class="about-num" data-idx="${i}" value="${escapeHtml(item.number)}" placeholder="№"></div><div class="form-group" style="flex:3"><input type="text" class="about-text" data-idx="${i}" value="${escapeHtml(item.text)}" placeholder="Текст"></div><div><button class="btn btn-danger btn-sm" onclick="deleteAboutItem(${i})">Удалить</button></div></div>`;
  });
  return html;
}
function renderPartnershipOffers(items) {
  let html = '<button class="btn btn-secondary btn-sm mb-1" onclick="addOfferItem()">+ Добавить</button>';
  items.forEach((item, i) => {
    html += `<div style="margin-bottom:1rem;padding:1rem;border:1px solid var(--border);border-radius:var(--radius-sm)"><div class="form-row"><div class="form-group"><input type="text" class="offer-num" data-idx="${i}" value="${escapeHtml(item.number)}" placeholder="№"></div><div class="form-group" style="flex:2"><input type="text" class="offer-title" data-idx="${i}" value="${escapeHtml(item.title)}" placeholder="Заголовок"></div><div><button class="btn btn-danger btn-sm" onclick="deleteOfferItem(${i})">Удалить</button></div></div><div class="form-group"><textarea class="offer-desc" data-idx="${i}" rows="2" placeholder="Описание">${escapeHtml(item.description)}</textarea></div></div>`;
  });
  return html;
}
function renderPartnershipPrices(items) {
  let html = '<button class="btn btn-secondary btn-sm mb-1" onclick="addPriceItem()">+ Добавить</button>';
  items.forEach((item, i) => {
    html += `<div class="form-row" style="margin-bottom:0.75rem"><div class="form-group" style="flex:2"><input type="text" class="price-title" data-idx="${i}" value="${escapeHtml(item.title)}" placeholder="Название"></div><div class="form-group"><input type="text" class="price-value" data-idx="${i}" value="${escapeHtml(item.price)}" placeholder="Цена"></div><div><button class="btn btn-danger btn-sm" onclick="deletePriceItem(${i})">Удалить</button></div></div>`;
  });
  return html;
}
function renderPartnershipTeam(items) {
  let html = '<button class="btn btn-secondary btn-sm mb-1" onclick="addTeamItem()">+ Добавить</button>';
  items.forEach((item, i) => {
    html += `<div class="form-row" style="margin-bottom:0.75rem"><div class="form-group"><input type="text" class="team-name" data-idx="${i}" value="${escapeHtml(item.name)}" placeholder="Имя"></div><div class="form-group"><input type="text" class="team-role" data-idx="${i}" value="${escapeHtml(item.role)}" placeholder="Роль"></div><div><button class="btn btn-danger btn-sm" onclick="deleteTeamItem(${i})">Удалить</button></div></div>`;
  });
  return html;
}

function switchPartnershipTab(tab) {
  document.querySelectorAll('#editorContainer .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#editorContainer .tab-panel').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('partnership' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
}
function addAboutItem() { currentData.about.push({ id: 'about-' + Date.now(), number: '', text: '' }); renderPartnershipEditor(document.getElementById('editorContainer'), currentData); }
function deleteAboutItem(i) { currentData.about.splice(i, 1); renderPartnershipEditor(document.getElementById('editorContainer'), currentData); }
function addOfferItem() { currentData.offers.push({ id: 'offer-' + Date.now(), number: '', title: '', description: '' }); renderPartnershipEditor(document.getElementById('editorContainer'), currentData); }
function deleteOfferItem(i) { currentData.offers.splice(i, 1); renderPartnershipEditor(document.getElementById('editorContainer'), currentData); }
function addPriceItem() { currentData.prices.push({ id: 'price-' + Date.now(), title: '', price: '' }); renderPartnershipEditor(document.getElementById('editorContainer'), currentData); }
function deletePriceItem(i) { currentData.prices.splice(i, 1); renderPartnershipEditor(document.getElementById('editorContainer'), currentData); }
function addTeamItem() { currentData.team.push({ id: 'team-' + Date.now(), name: '', role: '', src: '/images/placeholder-team-1.jpg' }); renderPartnershipEditor(document.getElementById('editorContainer'), currentData); }
function deleteTeamItem(i) { currentData.team.splice(i, 1); renderPartnershipEditor(document.getElementById('editorContainer'), currentData); }
function savePartnership() {
  const about = [];
  document.querySelectorAll('.about-num').forEach((el, i) => {
    about.push({ id: currentData.about[i]?.id || 'about-' + Date.now(), number: el.value, text: document.querySelectorAll('.about-text')[i].value });
  });
  currentData.about = about;
  const offers = [];
  document.querySelectorAll('.offer-num').forEach((el, i) => {
    offers.push({ id: currentData.offers[i]?.id || 'offer-' + Date.now(), number: el.value, title: document.querySelectorAll('.offer-title')[i].value, description: document.querySelectorAll('.offer-desc')[i].value });
  });
  currentData.offers = offers;
  const prices = [];
  document.querySelectorAll('.price-title').forEach((el, i) => {
    prices.push({ id: currentData.prices[i]?.id || 'price-' + Date.now(), title: el.value, price: document.querySelectorAll('.price-value')[i].value });
  });
  currentData.prices = prices;
  const team = [];
  document.querySelectorAll('.team-name').forEach((el, i) => {
    team.push({ id: currentData.team[i]?.id || 'team-' + Date.now(), name: el.value, role: document.querySelectorAll('.team-role')[i].value, src: currentData.team[i]?.src || '/images/placeholder-team-1.jpg' });
  });
  currentData.team = team;
  saveContent('partnership', currentData);
}

// ===== Meta / SEO Editor =====
function renderMetaEditor(container, data) {
  let html = `<div class="card"><div class="card-header"><h3>SEO — Основные настройки</h3></div><div class="form-group"><label>Название сайта</label><input type="text" id="siteName" value="${escapeHtml(data.siteMeta?.siteName || '')}"></div><div class="form-group"><label>URL сайта</label><input type="text" id="baseUrl" value="${escapeHtml(data.siteMeta?.baseUrl || '')}"></div></div>`;
  (data.pages || []).forEach((page, i) => {
    html += `<div class="card" style="margin-top:1rem"><div class="card-header"><h3>Страница: ${escapeHtml(page.path)}</h3></div><div class="form-row"><div class="form-group"><label>Title</label><input type="text" class="page-title" data-idx="${i}" value="${escapeHtml(page.title)}"></div><div class="form-group"><label>OG Title</label><input type="text" class="page-ogtitle" data-idx="${i}" value="${escapeHtml(page.ogTitle)}"></div></div><div class="form-group"><label>Description</label><textarea class="page-desc" data-idx="${i}" rows="2">${escapeHtml(page.description)}</textarea></div><div class="form-group"><label>OG Description</label><textarea class="page-ogdesc" data-idx="${i}" rows="2">${escapeHtml(page.ogDescription)}</textarea></div><div class="form-row"><div class="form-group"><label>OG Image</label><input type="text" class="page-ogimg" data-idx="${i}" value="${escapeHtml(page.ogImage)}"></div><div class="form-group"><label>Canonical</label><input type="text" class="page-canonical" data-idx="${i}" value="${escapeHtml(page.canonical)}"></div></div></div>`;
  });
  html += `<div class="mt-2 text-right"><button class="btn btn-primary" onclick="saveMeta()">Сохранить изменения</button></div>`;
  container.innerHTML = html;
}
function saveMeta() {
  currentData.siteMeta = { siteName: document.getElementById('siteName').value, baseUrl: document.getElementById('baseUrl').value, defaultOgImage: currentData.siteMeta?.defaultOgImage || '/images/og-default.jpg' };
  const pages = [];
  document.querySelectorAll('.page-title').forEach((el, i) => {
    pages.push({ path: currentData.pages[i].path, title: el.value, description: document.querySelectorAll('.page-desc')[i].value, ogTitle: document.querySelectorAll('.page-ogtitle')[i].value, ogDescription: document.querySelectorAll('.page-ogdesc')[i].value, ogImage: document.querySelectorAll('.page-ogimg')[i].value, canonical: document.querySelectorAll('.page-canonical')[i].value });
  });
  currentData.pages = pages;
  saveContent('meta', currentData);
}

// ===== Users Management (Admin only) =====
async function renderUsersEditor(container) {
  container.innerHTML = '<p class="loading"><span class="spinner"></span> Загрузка пользователей...</p>';
  const res = await api('users-list');
  if (!res.success) {
    container.innerHTML = `<p class="error">Ошибка: ${res.error}</p>`;
    return;
  }

  const users = res.users || [];
  const allPerms = ['pricing', 'faq', 'gallery', 'benefits', 'reviews', 'steps', 'geography', 'partnership', 'meta', 'users'];

  let html = `
    <div class="card">
      <div class="card-header">
        <h3>Пользователи</h3>
        <button class="btn btn-primary btn-sm" onclick="showCreateUserForm()">+ Добавить пользователя</button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr><th>Логин</th><th>Имя</th><th>Роль</th><th>Права</th><th>Действия</th></tr>
          </thead>
          <tbody>
  `;

  users.forEach(u => {
    const permsText = u.permissions?.join(', ') || 'все';
    html += `
      <tr>
        <td><strong>${escapeHtml(u.login)}</strong></td>
        <td>${escapeHtml(u.name)}</td>
        <td><span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-editor'}">${u.role === 'admin' ? 'Админ' : 'Редактор'}</span></td>
        <td><small>${escapeHtml(permsText)}</small></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="editUser('${escapeHtml(u.login)}')">Изменить</button>
          <button class="btn btn-danger btn-sm" onclick="deleteUser('${escapeHtml(u.login)}')">Удалить</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table></div></div>`;

  // Create user form (hidden by default)
  html += `
    <div id="createUserForm" class="card hidden" style="margin-top:1rem">
      <div class="card-header"><h3>Новый пользователь</h3></div>
      <div class="form-group"><label>Логин</label><input type="text" id="newUserLogin" placeholder="latin_letters"></div>
      <div class="form-group"><label>Имя</label><input type="text" id="newUserName" placeholder="Имя пользователя"></div>
      <div class="form-group"><label>Пароль</label><input type="password" id="newUserPassword" placeholder="Минимум 6 символов"></div>
      <div class="form-group"><label>Роль</label>
        <select id="newUserRole">
          <option value="editor">Редактор (ограниченные права)</option>
          <option value="admin">Администратор (полный доступ)</option>
        </select>
      </div>
      <div class="form-group" id="permissionsGroup">
        <label>Права доступа</label>
        <div class="checkbox-grid">
          ${allPerms.map(p => `<label class="checkbox-label"><input type="checkbox" class="perm-checkbox" value="${p}" checked> ${permLabel(p)}</label>`).join('')}
        </div>
      </div>
      <div class="flex gap-1">
        <button class="btn btn-secondary" onclick="hideCreateUserForm()">Отмена</button>
        <button class="btn btn-primary" onclick="createUser()">Создать</button>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Role change listener
  setTimeout(() => {
    const roleSelect = document.getElementById('newUserRole');
    if (roleSelect) {
      roleSelect.addEventListener('change', () => {
        const permGroup = document.getElementById('permissionsGroup');
        if (roleSelect.value === 'admin') {
          permGroup.classList.add('hidden');
        } else {
          permGroup.classList.remove('hidden');
        }
      });
    }
  }, 0);
}

function permLabel(perm) {
  const labels = { pricing: 'Цены', faq: 'FAQ', gallery: 'Галерея', benefits: 'Преимущества', reviews: 'Отзывы', steps: 'Почему мы', geography: 'География', partnership: 'Партнёрство', meta: 'SEO', users: 'Пользователи' };
  return labels[perm] || perm;
}

function showCreateUserForm() {
  document.getElementById('createUserForm').classList.remove('hidden');
}
function hideCreateUserForm() {
  document.getElementById('createUserForm').classList.add('hidden');
}

async function createUser() {
  const login = document.getElementById('newUserLogin').value.trim();
  const name = document.getElementById('newUserName').value.trim();
  const password = document.getElementById('newUserPassword').value;
  const role = document.getElementById('newUserRole').value;
  const permissions = role === 'admin'
    ? ['pricing', 'faq', 'gallery', 'benefits', 'reviews', 'steps', 'geography', 'partnership', 'meta', 'users']
    : Array.from(document.querySelectorAll('.perm-checkbox:checked')).map(cb => cb.value);

  if (!login || !name || !password) {
    showToast('Заполните все поля', 'error');
    return;
  }
  if (password.length < 6) {
    showToast('Пароль минимум 6 символов', 'error');
    return;
  }

  const res = await api('user-create', 'POST', { login, name, password, role, permissions });
  if (res.success) {
    showToast('Пользователь создан!', 'success');
    hideCreateUserForm();
    renderUsersEditor(document.getElementById('editorContainer'));
  } else {
    showToast(res.error || 'Ошибка создания', 'error');
  }
}

async function deleteUser(login) {
  if (!confirm(`Удалить пользователя ${login}?`)) return;
  const res = await api('user-delete', 'POST', { login });
  if (res.success) {
    showToast('Пользователь удалён', 'success');
    renderUsersEditor(document.getElementById('editorContainer'));
  } else {
    showToast(res.error || 'Ошибка удаления', 'error');
  }
}

async function editUser(login) {
  // Simple prompt-based edit for now
  const newName = prompt('Новое имя:');
  if (!newName) return;
  const newPassword = prompt('Новый пароль (оставьте пустым, чтобы не менять):');
  const res = await api('user-update', 'POST', { login, name: newName, password: newPassword || undefined });
  if (res.success) {
    showToast('Пользователь обновлён', 'success');
    renderUsersEditor(document.getElementById('editorContainer'));
  } else {
    showToast(res.error || 'Ошибка обновления', 'error');
  }
}

// ===== Utility =====
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

async function logout() {
  await api('logout');
  window.location.href = 'index.html';
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('editorContainer')) {
    const ok = await checkAuth();
    if (!ok) return;

    // Show user name
    const userNameEl = document.getElementById('userName');
    if (userNameEl && currentUser) {
      userNameEl.textContent = currentUser.name + (currentUser.role === 'admin' ? ' (Админ)' : ' (Редактор)');
    }

    // Build menu based on permissions
    buildMenu();

    // Load first available section
    const firstItem = MENU_ITEMS.find(item => hasPermission(item.perm));
    if (firstItem) {
      loadContent(firstItem.id);
      // Highlight in menu
      setTimeout(() => {
        const link = document.querySelector(`[data-file="${firstItem.id}"]`);
        if (link) link.classList.add('active');
      }, 0);
    }
  }
});
