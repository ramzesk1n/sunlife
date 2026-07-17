---
id: todo-009
created: 2026-07-11
updated: 2026-07-17
status: in-progress
priority: medium
area: performance
---

# Оптимизация Core Web Vitals

## Целевые метрики
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1
- TTFB (Time to First Byte) < 600ms

## Что сделано (2026-07-17)
- [x] hero-image-main.webp preloaded с `fetchpriority="high"`
- [x] Google Fonts self-hosted (`/fonts/`)
- [x] CSS deferred loading
- [x] Lazy-load нижних секций (Benefits, ExperienceSteps, Gallery, Testimonials, FAQ, TeamSlider, Geography)
- [x] Оптимизация изображений фотокниг (30-40 KiB вместо 400-800 KiB)
- [x] Оптимизация логотипа (3.9 KiB вместо 35 KiB)
- [x] Modulepreload только для критичных JS-чанков

## Оставшиеся задачи
- [ ] Оптимизировать hero-image-partnership
- [ ] Добавить srcset для responsive images
- [ ] Уменьшить CLS: width/height для всех изображений
- [ ] Настроить cache headers на nginx (сейчас 1 день)
- [ ] Проверить forced reflow от GSAP ScrollTrigger

## Инструменты
- PageSpeed Insights
- Lighthouse
- Web Vitals Extension
