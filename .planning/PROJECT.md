# САН ЛАЙФ — Проект

## Описание
Сайт фотослужбы «САН ЛАЙФ» — профессиональная фотосъёмка выписки из роддома. Лендинг + подстраницы (цены, портфолио, партнёрство, контакты, политика).

## Стек
- Vite 8 + React 19 + TypeScript strict
- Tailwind CSS v4
- Framer Motion + GSAP (анимации)
- React Router (SPA роутинг)
- Prerender (6 маршрутов: /, /price, /partnership, /privacy, /galery, /contacts)

## Дизайн
- Gold/cream палитра
- Шрифты: Onest (headings 300), DM Sans (body), Source Serif 4 (decor)
- Стеклянный эффект (glassmorphism)
- Без px-единиц (rem/vh/vw/%)

## Структура
```
src/
  components/     — React-компоненты секций
  content/        — Текстовый контент (TS + JSON sync)
  pages/          — Страницы (PrivacyPage, ContactsPage, GalleryPage)
  index.css       — Tailwind v4 theme
public/
  images/         — Ассеты (slider 19 фото, gallery 397 фото, reviews 9 аватарок)
  admin/          — Flat-file CMS (PHP API)
  api/            — Backend handlers (send-form.php)
  content/        — JSON данные (синхронизируются с src/content/)
scripts/
  prerender.ts    — SSR для 6 маршрутов
  convert-to-webp.cjs — WebP конвертация фото
  process-gallery.cjs — Генерация gallery-portfolio.json
```

## Хостинг
- **Production**: hostiman.ru (PHP 8.3.30, SSH port 8228, login s273478)
- **Домен**: sunlife-photo.ru
- **Деплой**: `deploy-final.zip` через FileZilla + ручная замена assets/
- **Важно**: `dist/content/` исключается из билда — серверные данные не перезаписываются

## Админ-панель
- URL: `/admin/dashboard.html`
- API: `/admin/api/index.php`
- Загрузка фото: `/admin/api/index.php?action=upload`
- Данные: `public/content/*.json`

## Формы
- **ContactForm** (главная, цены): имя, телефон, роддом, дата, пакет → Telegram Bot
- **PartnershipPopupForm** (партнёрство): ФИО, телефон, email, клиника, объём, сообщение → Telegram Bot
- **Защита**: honeypot + rate limit (60 сек)

## Контакты проекта
- Телефон: +7 (927) 936-36-06
- Email: hello@sunlife-ufa.ru
- Соцсети: WhatsApp, Telegram, Max, VK
- Оператор: ИП Чанышев Тагир Амирович
- ИНН: 027812301688, ОГРН: 313028000070599

## Ссылки
- Репозиторий: github.com:ramzesk1n/sunlife
- Домен: sunlife-photo.ru
