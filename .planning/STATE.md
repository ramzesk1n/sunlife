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

3. ✅ **Формы**
   - Маска российского номера телефона в ContactForm и PartnershipPopupForm
   - Datepicker с `min={today}` в ContactForm

4. ✅ **Мобильная анимация ExperienceSteps**
   - Упрощена мобильная анимация "Почему мамы выбирают нас?"
   - Убран пустой скролл, карточки видны все

5. ✅ **Деплой выполнен**
   - Загружен `dist.zip` и обновлённые изображения на сервер
   - Сайт обновлён: sunlife-photo.ru

### Текущие проблемы
- ⚠️ **Cache headers** — nginx отдаёт `max-age=86400` (1 день) вместо 1 года
- ⚠️ **Forced reflow от GSAP** — ScrollTrigger вызывает reflow (~115ms)
- ⚠️ **Critical request chains** — lazy chunks создают цепочки запросов

### Открытые задачи (todo)

#### Критичные (до запуска)
- [ ] todo-004: Деплой на Vercel + кастомный домен

#### Важные (рекомендуется)
- [ ] todo-005: Яндекс.Метрика / Google Analytics
- [ ] todo-008: Schema.org JSON-LD разметка
- [ ] todo-009: Core Web Vitals оптимизация (в процессе)
- [ ] todo-010: UX-полировка (toast, skeleton, back-to-top)

#### Средние (после запуска)
- [ ] todo-011: Актуализация политики конфиденциальности
- [ ] todo-012: Доступность (a11y)
- [ ] todo-014: Страница благодарности (/thank-you)

#### Низкие (после стабилизации)
- [ ] todo-013: CI/CD, мониторинг, автодеплой
- [ ] PWA, мультиязычность

### Технический долг
- Tailwind v4 sourcemap warning (некритично)
- PHP backend работает только на hostiman (не на Vercel)
- nginx конфиг нужно обновить для cache headers и SPA fallback

### Следующий шаг
1. Проверить Lighthouse после последних оптимизаций
2. Настроить cache headers на hostiman (или перейти на CDN)
3. Рассмотреть замену GSAP ScrollTrigger на Intersection Observer
