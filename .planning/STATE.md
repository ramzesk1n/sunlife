# САН ЛАЙФ - Состояние проекта

## Активная сессия: 2026-07-19

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
- ⚠️ **Cache headers** — nginx отдаёт `max-age=86400` (1 день) вместо 1 года
- ⚠️ **Forced reflow от GSAP** — ScrollTrigger вызывает reflow (~115ms)
- ⚠️ **Critical request chains** — lazy chunks создают цепочки запросов

### Открытые задачи (todo)

#### Критичные (до запуска)
- [ ] todo-004: Деплой на Vercel + кастомный домен

#### Важные (рекомендуется)
- [x] todo-008: Schema.org JSON-LD разметка ✅
- [ ] todo-005: Яндекс.Метрика / Google Analytics
- [ ] todo-009: Core Web Vitals оптимизация (в процессе)
- [x] todo-010: UX-полировка (toast, skeleton, back-to-top) ✅

#### Средние (после запуска)
- [ ] todo-011: Актуализация политики конфиденциальности
- [ ] todo-012: Доступность (a11y)
- [ ] todo-014: Страница благодарности (/thank-you) + 404

#### Низкие (после стабилизации)
- [ ] todo-013: CI/CD, мониторинг, автодеплой
- [ ] PWA, мультиязычность

### Технический долг
- Tailwind v4 sourcemap warning (некритично)
- PHP backend работает только на hostiman (не на Vercel)
- nginx конфиг нужно обновить для cache headers и SPA fallback

### Следующий шаг
1. Задеплоить текущий `dist.zip` на `sunlife-photo.ru` вручную.
2. Проверить сайт после деплоя (toast, back-to-top, skeleton, JSON-LD).
3. Выбрать следующий todo: todo-014 (404 + thank-you), todo-011 (privacy policy) или todo-005 (analytics).
