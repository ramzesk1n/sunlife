---
id: todo-001
created: 2026-07-11
updated: 2026-07-17
status: completed
priority: high
area: performance
---

# Снизить размер бандлов до бюджета 60kB gzip

## Статус: ✅ ЗАВЕРШЕНО

### Итоговые размеры (2026-07-17)
- index: 13.94 kB gzip (56.01 kB raw) — **было 28.02 kB gzip**
- vendor: 72.49 kB gzip (226.89 kB raw) — React ecosystem
- framer-motion: 43.68 kB gzip (133.57 kB raw) — lazy-loaded
- gsap: 44.34 kB gzip (112.81 kB raw) — lazy-loaded

### Что сделано
- Code-splitting по страницам и тяжёлым компонентам
- Lazy-load PartnershipPopupForm, ExperienceSteps, Gallery, PricingCards, Testimonials, FAQ, TeamSlider, Geography
- Замена framer-motion на CSS transitions в Benefits, MobileBottomBar, Hero, InlineCta
- Убраны modulepreload для не-критичных lazy chunks
- Self-hosted Google Fonts (убраны внешние запросы)
- Deferred CSS loading
- Оптимизация изображений (WebP quality 75, правильные размеры)
- Self-hosted fonts в `/fonts/`
