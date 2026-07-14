---
id: todo-001
created: 2026-07-11
updated: 2026-07-14
status: in-progress
priority: high
area: performance
---

# Снизить размер бандлов до бюджета 60kB gzip

## Статус: 🔄 В ПРОЦЕССЕ

### Текущие размеры (2026-07-14)
- vendor: 71.34 kB gzip (222.99 kB raw) — **ЦЕЛЬ: <60kB**
- framer-motion: 43.68 kB gzip (133.57 kB raw)
- gsap: 44.34 kB gzip (112.81 kB raw)
- index: 28.02 kB gzip (112.56 kB raw)

### Что сделано
- Code-splitting по страницам (partnership, price, privacy отдельные чанки)
- manualChunks: vendor, framer-motion, gsap отдельно
- CSS minify через lightningcss
- sourcemap disabled для production

### Что нужно сделать
- [ ] Lazy-load GSAP (только на страницах где используется)
- [ ] Lazy-load Framer Motion (только на страницах где используется)
- [ ] Tree-shake неиспользуемые иконки
- [ ] Проверить дублирование кода между чанками
