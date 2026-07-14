# САН ЛАЙФ — Проект

## Описание
Сайт фотослужбы «САН ЛАЙФ» — профессиональная фотосъёмка выписки из роддома. Лендинг + 3 подстраницы (цены, портфолио, партнёрство).

## Стек
- Vite 8 + React 19 + TypeScript strict
- Tailwind CSS v4
- Framer Motion + GSAP (анимации)
- React Router (SPA роутинг)
- Prerender (5 маршрутов: /, /price, /partnership, /privacy, /galery)

## Дизайн
- Gold/cream палитра
- Шрифты: Manrope (body), Montserrat (headings), Cormorant Garamond (serif)
- Стеклянный эффект (glassmorphism)
- Без px-единиц (rem/vh/vw/%)

## Структура
```
src/
  components/     — React-компоненты секций
  content/        — Текстовый контент (TS + JSON sync)
  pages/          — Страницы (PrivacyPage)
  index.css       — Tailwind v4 theme
public/
  images/         — Ассеты (логотип, карта, фото)
  admin/          — Flat-file CMS (PHP API)
  api/            — Backend handlers (send-form.php)
  content/        — JSON данные (синхронизируются с src/content/)
scripts/
  prerender.ts   — SSR для 5 маршрутов
  convert-to-webp.cjs — WebP конвертация фото
```

## Хостинг
- **Production**: hostiman.ru (PHP 8.3.30, SSH port 8228)
- **Домен**: sunlife-photo.ru
- **Деплой**: `dist.zip` через `deploy.php` или `tar.gz` через SSH
- **Важно**: `dist/content/` исключается из билда — серверные данные не перезаписываются

## Админ-панель
- URL: `/admin/dashboard.html`
- API: `/admin/api/index.php`
- Загрузка фото: `/admin/api/index.php?action=upload`
- Данные: `public/content/*.json`

## Контакты проекта
- Телефон: +7 (927) 936-36-06
- Email: hello@sunlife-ufa.ru
- Соцсети: WhatsApp, Telegram, VK
- Оператор: ИП Чанышев Тагир Амирович

## Ссылки
- Репозиторий: github.com:ramzesk1n/sunlife
- Домен: sunlife-photo.ru
