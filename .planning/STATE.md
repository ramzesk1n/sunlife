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
