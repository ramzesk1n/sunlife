# САН ЛАЙФ - Состояние проекта

## Активная сессия: 2026-07-17

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
