# САН ЛАЙФ - Состояние проекта

## Активная сессия: 2026-07-21

### Что сделано сегодня (2026-07-21)

1. ✅ **Полный аудит админ-панели + исправления** (статический анализ + puppeteer-прогон на локальном php -S, 16 сценариев до фиксов, 12/12 PASS после)
   - **CRITICAL: утечка хэшей паролей** — `/admin/users.json` на проде отдавался публично (HTTP 200, nginx отдаёт статику мимо Apache/.htaccess). Хранилище переведено на `users.php` (PHP-файл, возвращает массив; при веб-доступе исполняется и ничего не отдаёт) с авто-миграцией из `users.json` при первом обращении. `users.php` в .gitignore.
   - **HIGH: add/delete элементов затирались** — обработчики мутировали `currentData` и тут же перезагружали раздел с сервера (подтверждено прогоном: 4→4 вместо 5). Фикс: `loadSection(section, fromState)` + sync-хелперы DOM→currentData перед мутацией; несохранённые правки больше не теряются.
   - **HIGH: загрузка/удаление фото галереи не сохранялись** — `handlePhotoUpload`/`deleteGalleryImage` не вызывали save (файлы-сироты в images/cms). Теперь сохраняют + delete-image чистит файлы с диска.
   - **HIGH: эскалация привилегий** — editor мог перезаписать `site.json`/`gallery-portfolio.json`/любой файл вне `permissionMap` (подтверждено: 200). Теперь default-deny: файлы вне мапы — только admin.
   - **MEDIUM: stored-XSS в админке** — `img.src` и features в textarea без escape → `escapeHtml` во всех рендерах (галерея, команда, проекты, примеры, pricing).
   - **MEDIUM: user-delete** — можно было удалить себя/последнего админа → блокировки (400) добавлены.
   - **MEDIUM: сессии/заголовки** — `session_regenerate_id` после логина, явные cookie-параметры (Secure при HTTPS, HttpOnly, SameSite=Lax), `sleep(1)` на неверный пароль, убран `Access-Control-Allow-Origin: *`.
   - **LOW**: невалидная строка `sizes` в upload-ответе (склейка без запятой), пустой baseName при кириллическом имени файла (→ `img`), favicon 404 в админке (добавлен `<link rel="icon">`).
   - **Мёртвый код в admin.js**: убраны 4 неиспользуемых параметра, мёртвая ветка `type==='team'`, мёртвый `uploadAttr`, отладочные `console.log`. Остальные ~49 «unused» oxlint — ложные (функции вызываются из inline onclick): зарегистрированы явно через `Object.assign(window, {...})` → **0 warnings, 0 errors**.
   - **Данные**: `meta.json` baseUrl `sunlife-ufa.ru` → `sunlife-photo.ru` (тянулся в canonical/OG/schema.org через `src/lib/schema.ts`).
   - Тестовые скрипты: `scripts/test-admin.cjs` (первичный аудит, 16 сценариев), `scripts/test-admin-fixes.cjs` (регресс фиксов, 12 сценариев).

2. **Требуется действие пользователя на проде** (см. human_actions в HANDOFF.json):
   - Залить `public/admin/*` (api/index.php, js/admin.js, index.html, dashboard.html) на сервер в `/admin/`
   - После первого входа в админку **удалить `/admin/users.json` с сервера** (миграция в users.php произойдёт автоматически)
   - **Сменить пароли** ramzes/tagir (хэши были публично доступны + в git-истории — считать скомпрометированными)
   - Рекомендовано: `git rm --cached public/admin/users.json` (убрать из трекинга)

### Замеченное вне скоупа (не трогали)
- `src/content/meta.ts` — неиспользуемый дубль меты (сайт берёт meta.json), внутри тоже старый домен
- `src/pages/PrivacyPage.tsx` — упоминания sunlife-ufa.ru в тексте (к todo-011)
- 20 старых `partnership-*.backup.json` в `public/content/` (до ротации бэкапов) — кандидаты на чистку
- Нет UI восстановления из бэкапов (есть только API list-backups) — фича-запрос
- `users-list` анониму отдаёт 403 вместо 401 — косметика

## Предыдущая сессия: 2026-07-20

### Что сделано сегодня (2026-07-20)

1. ✅ **Формы: доставка в Telegram работает**
   - Пользователь создал `api/config.local.php` на сервере (была опечатка `const_HOST` — 500, нашли и починили)
   - Два бага прокси-пула: фатал в очистке curl_multi (карта хендлов → `spl_object_id`), TLS-инспекция прокси (self-signed cert → отключена проверка для проксированных запросов)
   - Локальный боевой тест: `{"channels":{"telegram":true}}` — сообщение дошло до чата, заявки с сайта подтверждены пользователем
   - Креды: прокси HTTP `198.64.244.136:59100` (проверен), CHAT_ID `-5177755679`, BOT_TOKEN выдан (рекомендован /revoke после настройки — засветился в переписке)
   - Осталось: `SMTP_PASS` (пароль приложения mail.ru) — email-канал пока не работает

2. ✅ **Контентные правки**
   - Сроки: «от 7 до 10 дней» → «от 10 до 14 дней» (benefits), FAQ: цифровые 10-14 / печатные 7-10, /terms: 10-14 рабочих дней
   - «Почему мамы выбирают нас»: «свыше 2000» → «свыше 10 000 выписок», «Опыт 5+ лет» → «Опыт фотографа от 3 до 5 лет», «500+ сессий» + индивидуальный подход, «обработка за 3 дня» → «за 10-14 дней»
   - Рахматуллин перенесён в слайдер «Отзывы партнёров» (первой карточкой); отдельный блок министра + фотосетка минздрава удалены
   - Адрес «ул. Ленина, 70» убран полностью: карточка и реквизиты на /contacts, Яндекс-карта, streetAddress/postalCode/geo из schema.org

3. ✅ **Карта: Сыктывкар + секция на /partnership**
   - Сыктывкар (Республика Коми) на карту: точка в SVG (430×545), `data-region="komi"` контуру, CITY_LABELS, geography.json
   - Cache-bust: `/images/russia-map.svg?v=2026-07-20` — nginx кэширует статику 24ч, из-за этого город «не появлялся» у пользователя
   - «Инвестиции: от визуализации к реальности» → «Ремонт помещений»
   - На /partnership после «Ремонт помещений» (перед прейскурантом) — секция карты «Карта филиалов фотослужбы Сан Лайф»; Geography теперь принимает `title`/`subtitle` пропсами

4. ✅ **Контент-правки 2 + Ньюборн-секция**
   - Шаг 2 главной: заголовок «Индивидуальный подход», исходный текст сохранён
   - /partnership порядок секций: … → Прейскурант → Примеры работ → FAQ → «Участие в социальных проектах» (бывш. «Портфолио партнёрских проектов») → «Наши сотрудники — часть вашей экосистемы» (вниз)
   - Новый компонент `NewbornPhotos` (5 фото, сетка 2/3/5, лупа, общий Lightbox): подсекция «Фотосессия Ньюборн в палате роддома» в «Примерах работ» на /partnership + секция после тарифов на /price
   - Порядок фото: Евгений, Ромашка, Макар, Сашенька, Варвара

### Технические заметки
- Периодические падения prerender — зомби-процессы chrome блокируют puppeteer; лечится `taskkill //F //IM chrome.exe`

5. ✅ **Security review (скилл getsentry/security-review, 4 зоны + live-пробы)**
   - CRITICAL: `admin/users.json` с bcrypt-хешами был публичен (live 200 + открытый репо). Код уже мигрирован на users.php (другой чат); **users.json удалён из репо** (`9fb81a0`). Осталось сервер-сайд: удалить файл с сервера, сменить все пароли, репо → private
   - Прод крутил старый admin API — задеплоен свежий `public/admin/` (сессии с флагами, RBAC-фикс, без CORS *)
   - Код-трек исправлен: flock в rate-limit формы (race condition), JSON-LD escape `<` (stored XSS через CMS), contactMethod whitelist, trim-safety полей, validatePhone по цифрам, escape pkg.price в admin.js, TTL сессии 8ч, login lockout (5 фейлов → 15 мин), `.htaccess` Require all denied (Apache 2.4 + fallback 2.2), robots Disallow /admin, deploy.php ключ из `api/config.local.php` (`DEPLOY_KEY`)
   - Ждёт пользователя: новый `DEPLOY_KEY` в config.local.php, nginx deny для *.json (тикет в поддержку), HTTPS-редирект, удаление deploy.php после деплоев, ротация паролей админки

## Предыдущая сессия: 2026-07-19

### Что сделано сегодня (2026-07-19)

1. ✅ **Контакты обновлены**
   - Telegram → `telegram.me/roddomaphoto`
   - Email → `89279611561@mail.ru` (в т.ч. в PrivacyPage, ContactsPage, site.json)
   - Max: иконка `public/images/max.svg` + ссылки в site.json, Header, Footer, MobileBottomBar, InlineCta, ContactsPage
   - Заявки с форм дублируются на email (`NOTIFY_EMAIL` в send-form.php)
   - Тултипы на иконках соцсетей в Header/Footer (только десктоп)
   - Max добавлен в выбор способа связи в ContactForm и PartnershipPopupForm

2. ✅ **Новые страницы**
   - `/terms` — Пользовательское соглашение (10 секций, реквизиты ИП)
   - `/sitemap` — HTML-карта сайта
   - `public/sitemap.xml` — XML-карта (8 URL, домен sunlife-photo.ru)
   - Роуты + meta.json + prerender (8 маршрутов) + breadcrumbs

3. ✅ **Правило деплоя**
   - dist.zip — ПЛОСКАЯ структура (без папки-обёртки dist/)
   - build-and-zip.sh переписан на Python-упаковку
   - Правило записано в DEPLOY-GUIDE.md, PROJECT.md, .continue-here.md

4. ✅ **Футер: юридические ссылки**
   - «Политика конфиденциальности», «Пользовательское соглашение», «Карта сайта» вынесены из колонки «Навигация» в нижнюю полосу футера
   - Расположены в одну строку (flex, wrap на мобильных), `text-sm` без капса, над строкой копирайта
   - «Студия дизайна Рамзеса Мифтахова» — ссылка на https://ramzes-it.ru/

5. ✅ **Performance + a11y аудит (Lighthouse) и quick wins**
   - Аудит главной: mobile perf 25, a11y 86 → после правок: perf 45, **a11y 100**, TBT 2390→320 ms
   - CLS-фикс: width/height всем контентным img, aspect-ratio контейнерам Hero/PartnershipHero
   - `<main>` на всех страницах, aria-label логотипам, h4→h3 в футере
   - Точки-пагинации 8px → 32px (shrink-0), визуал сохранён
   - Контраст: текст/ссылки → gold-dark, твёрдые кнопки → bg-gold-dark (hover gold-darker), токен `--gold-primary-80` = #936d28 (заголовки стали темнее!)
   - Скиллы установлены: vercel-react-best-practices, typescript-react-reviewer, pagespeed-insights
   - Осталось: LCP ~6s, GSAP reflow/lazy-load (todo-009), проверка CLS на live после деплоя

6. ✅ **todo-009 (часть 1): GSAP убран с критического пути**
   - Hero: GSAP-параллакс → rAF scroll-handler (transform), gsap теперь lazy вместе с ExperienceSteps
   - ExperienceSteps: `ScrollTrigger.config({ ignoreMobileResize: true })`
   - Метрики (mobile, локально): perf 25→54, bootup 2.7→1.1s, TBT 2390→250ms, FCP 3.5→1.9s, SpeedIndex 5.6→2.6s
   - Осталось: LCP-элемент = текст cookie-баннера (задержать показ после load), framer-motion eager chunk (manualChunks), проверка на live

7. ✅ **todo-009 (часть 2): LCP + framer-motion chunk**
   - CookieBanner: показ после `window.load` + 1.5s — LCP-элемент теперь h1 hero, а не баннер
   - vite.config: manualChunks → `codeSplitting.groups` (rolldown API) — shared-зависимости больше не тянут framer-motion/gsap в критпуть
   - framer-motion (133KB/44KB gzip) теперь lazy; vendor 227→190KB
   - Live-аудит подтвердил a11y 100 после деплоя; live TBT/TTFB упирается в хостинг (cache headers на nginx — отдельная задача)

8. ✅ **todo-014: Thank-you (автоскрытие) + 404**
   - Новый компонент `ThankYouNote`: галочка + «Спасибо! Ваша заявка получена!», показывается 3 сек и плавно исчезает (не отдельная страница)
   - Интегрирован в ContactForm и PartnershipPopupForm (заменил статичные success-блоки; success-toast убран, error-toast оставлен)
   - 404 обёрнута в Header/Footer/MobileBottomBar, отступы под фиксированную шапку

9. ✅ **Код-ревью (typescript-react-reviewer skill) + фиксы**
   - Ревью 4 параллельными агентами по чек-листу скилла, ~30 находок
   - CRITICAL: в обеих формах были перепутаны обработчики — поле имени использовало телефонную маску, телефон был без маски; `min={today}` стоял на поле имени вместо даты (баг был на проде!)
   - HIGH (21 пункт): ErrorBoundary вокруг Routes, убран key=pathname (remount при навигации), meta для 404, cleanup таймеров (Hero/Toast), AbortController в fetch форм и RussiaMap, единая проверка success в PartnershipPopupForm, marquee offset в useRef (TeamSlider/PartnershipTeam — прыжки при hover), derived state в Lightbox, GalleryPage useMemo+observer, типизация any (Testimonials/PartnershipGallery/Examples), getTodayDate локальная дата (был UTC-сдвиг), Esc+overflow-lock в ContactForm-модалке
   - Мёртвый код: удалены FloatingCallBubble, PartnershipTestimonials, footerRef; в Footer иконка «Позвонить» больше не whatsapp.svg (новый phone.svg); SearchAction убран из schema.org (поиск не реализован)

10. ✅ **todo-012: a11y-аудит (axe-core + клавиатура)**
   - axe-core (WCAG 2.0/2.1 AA, mobile viewport, 5 страниц): были — nested-interactive (#russia-map), scrollable-region-focusable (BookCarousel), color-contrast (/price, /galery, /contacts)
   - Исправлено: svg role img→group, BookCarousel tabIndex+role=region, цены и примечания → gold-dark/gold-darker, бейджи без opacity-70, text-light→text-muted в Contacts
   - Итог: **0 нарушений на всех 5 страницах**
   - Клавиатура: 25 табов с видимым фокусом, модалка держит фокус внутри (focus trap ок)
   - key={idx} → стабильные ключи (img.src/extra) в Gallery, BookCarousel, PartnershipTestimonial, PartnershipPricing
   - Скрипты: `scripts/audit-a11y.cjs` (axe по страницам), `scripts/audit-keyboard.cjs` (таб-ордер + фокус)

11. ✅ **Надёжная доставка заявок + антиспам**
   - Критично: email отправлялся только ПОСЛЕ Telegram — при блокировке api.telegram.org заявки терялись с 500. Каналы теперь независимы: success если доставил хотя бы один, в JSON `channels: {telegram, email}`
   - Telegram: поддержка `TG_PROXY` (socks5h/http, DNS на стороне прокси) с фолбэком на прямое соединение
   - Email: PHPMailer (v6.10, 3 файла в `public/api/lib/phpmailer/`) через SMTP (`smtp.mail.ru:465`), фолбэк на `mail()` если SMTP не настроен
   - Антиспам (было: honeypot + 60с rate limit): + time-trap (форма быстрее 3с = спам, `startedAt` с фронта), + дневной лимит 10/IP, + санити-чеки (имя 2-60 с буквами, запрет URL в name/hospital, длины полей, валидация email)
   - Ждёт креды от пользователя: прокси для TG + пароль приложения mail.ru → в серверный `api/config.local.php` (в .gitignore, не коммитится)
   - Пул прокси: `TG_PROXIES` (массив) — раз в 30 мин гонка `getMe` через curl_multi по всем прокси + напрямую, побеждает самый быстрый рабочий; результат кэшируется в `.proxy_cache.json`. При падении прокси — email-алерт на NOTIFY_EMAIL (троттлинг 1 письмо/6ч на прокси), при полном падении TG — отдельный алерт

## Предыдущая сессия: 2026-07-17

### Что сделано сегодня (2026-07-17)

1. ✅ **Performance оптимизация**
   - Code-splitting: index.js 308K → 56K (-82%)
   - Lazy-load тяжёлых компонентов и страниц
   - Lazy-load PartnershipPopupForm в Header/MobileBottomBar/InlineCta
   - Замена framer-motion на CSS в Benefits, MobileBottomBar, Hero, InlineCta
   - Self-hosted Google Fonts в `/fonts/`
   - Deferred CSS loading
   - Modulepreload только для критичных JS (runtime/vendor/index)
   - Hero image preloaded с `fetchpriority="high"`

2. ✅ **Оптимизация изображений**
   - Пережаты фотокниги (`fotokniga_1-5.webp`) 400-800K → 30-40K
   - Уменьшен логотип 150×150 → 64×64, 35K → 3.9K
   - Пережаты фото врачей/партнёров
   - Галерея оптимизирована: 87 MB → 36 MB (1600px, WebP q75)
   - Удалены неиспользуемые JPG/PNG-оригиналы (~50 MB)

3. ✅ **Формы**
   - Маска российского номера телефона в ContactForm и PartnershipPopupForm
   - Datepicker с `min={today}` в ContactForm
   - Toast-уведомления об успешной/ошибочной отправке

4. ✅ **Мобильная анимация ExperienceSteps**
   - Упрощена мобильная анимация "Почему мамы выбирают нас?"
   - Убран пустой скролл, карточки видны все

5. ✅ **UX-полировка (todo-010)**
   - Toast-уведомления (success/error)
   - Skeleton-заглушки для lazy-секций
   - Back-to-top кнопка

6. ✅ **Schema.org JSON-LD (todo-008)**
   - Organization
   - LocalBusiness (адрес, телефон, часы)
   - Service — только на главной
   - FAQPage — только на главной
   - BreadcrumbList — для каждой страницы
   - WebSite + SearchAction

7. ✅ **Подготовка к деплою**
   - `dist.zip` собран (~488 KB, без gallery)
   - Все изменения запушены на GitHub

### Текущие проблемы
- ⚠️ **Cache headers** — nginx отдаёт `max-age=86400` (1 день) вместо 1 года; нехэшированные файлы (russia-map.svg) отстают у пользователей на сутки. Решение: отключить «обработку статики nginx» в панели hostiman (тогда сработает .htaccess) или тикет в поддержку с `nginx-spa.conf`
- ⚠️ **SMTP_PASS не задан** — email-канал заявок не работает, пока в `api/config.local.php` не вписан пароль приложения mail.ru
- ⚠️ **BOT_TOKEN засветился** в переписке — рекомендован перевыпуск (/revoke у @BotFather)

### Открытые задачи (todo)

#### Критичные (до запуска)
- [ ] todo-004: Деплой на Vercel + кастомный домен

#### Важные (рекомендуется)
- [x] todo-008: Schema.org JSON-LD разметка ✅
- [ ] todo-005: Яндекс.Метрика / Google Analytics (нужен ID счётчика)
- [ ] todo-009: Core Web Vitals оптимизация (в процессе, live perf 23→83)
- [x] todo-010: UX-полировка (toast, skeleton, back-to-top) ✅

#### Средние (после запуска)
- [ ] todo-011: Актуализация политики конфиденциальности
- [x] todo-012: Доступность (a11y) ✅ (axe: 0 нарушений, клавиатура ок)
- [x] todo-014: Thank-you (автоскрытие) + 404 ✅

#### Низкие (после стабилизации)
- [ ] todo-013: CI/CD, мониторинг, автодеплой
- [ ] PWA, мультиязычность

### Технический долг
- Tailwind v4 sourcemap warning (некритично)
- PHP backend работает только на hostiman (не на Vercel)
- nginx конфиг нужно обновить для cache headers и SPA fallback
- Старые backup-файлы контента (`src/content/*backup.json`, ~25 шт) — кандидаты на чистку

### Следующий шаг
1. Задеплоить свежий `dist.zip` → `deploy.php?key=sunlife2025deploy` (в нём: фиксы форм, контент, Сыктывкар, карта на /partnership, cache-bust карты).
2. Вписать `SMTP_PASS` в `api/config.local.php` на сервере → проверить приход копии на почту.
3. После деплоя: Ctrl+F5, проверить формы (заявка в TG + почта), Сыктывкар на карте, секцию карты на /partnership.
4. Дальше по бэклогу: todo-011 (privacy), todo-005 (Метрика — нужен ID), cache headers через панель hostiman.
