---
id: todo-001
created: 2026-07-11
status: open
priority: high
area: performance
---

# Снизить размер бандлов до бюджета 60kB gzip

animation chunk: 88kB → target <60kB  
vendor chunk: 71kB → target <60kB

## Подход
- Code-splitting: вынести GSAP в отдельный lazy-loaded чанк
- Tree-shaking: проверить импорты framer-motion (use только нужное)
- Dynamic import для RussiaMap (не критичный для LCP)
- Убрать неиспользуемые иконки/компоненты
