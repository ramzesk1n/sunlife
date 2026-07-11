---
id: todo-009
created: 2026-07-11
status: open
priority: medium
area: performance
---

# Оптимизация Core Web Vitals

## Целевые метрики
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1
- TTFB (Time to First Byte) < 600ms

## Задачи
- [ ] Оптимизировать hero-image-main.jpg (WebP/AVIF, srcset)
- [ ] Оптимизировать hero-image-partership-1600.jpg
- [ ] Добавить preload для критических шрифтов (Montserrat, Manrope)
- [ ] Добавить fetchpriority="high" для hero-изображений
- [ ] Уменьшить CLS: зарезервировать место под изображения (width/height)
- [ ] Проверить и устранить layout shift в карусели отзывов
- [ ] Lazy-load для нижних секций (ниже fold)
- [ ] Preconnect к внешним доменам (если будут CDN)

## Инструменты
- PageSpeed Insights
- Lighthouse
- Web Vitals Extension
