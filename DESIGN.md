# САН ЛАЙФ — Дизайн-система

## Типографика

### Шрифты
| Роль | Шрифт | Вес | Зачем |
|------|-------|-----|-------|
| **Заголовки** | **Onest** | 300/400/500 | Мягкий, с изогнутой «y», отличная кириллица, редкий |
| **Body** | **DM Sans** | 400/500 | Кристальная читаемость, современный геометрический гротеск |
| **Декор / Цены** | **Source Serif 4** | 400/600 italic | Высококачественная кириллица по type.today |

**Почему не Montserrat/Inter/Roboto:**
- Montserrat — 4+ млн сайтов, полное отсутствие индивидуальности
- Inter — слишком нейтрален, не запоминается

### Размеры
| Уровень | Desktop | Tablet | Mobile | Weight |
|---------|---------|--------|--------|--------|
| H1 | 4.0 rem | 2.75 rem | 2.25 rem | 300 |
| H2 | 3.0 rem | 2.0 rem | 1.75 rem | 300 |
| H3 | 2.0 rem | 1.5 rem | 1.375 rem | 400 |
| Body | 1.0 rem | 0.9375 rem | 0.9375 rem | 400 |
| Caption | 0.875 rem | 0.8125 rem | 0.8125 rem | 500 |

### CSS переменные
```css
--font-sans: 'DM Sans', system-ui, sans-serif;
--font-display: 'Onest', 'DM Sans', system-ui, sans-serif;
--font-serif: 'Source Serif 4', Georgia, serif;
```

## Цветовая палитра

| Токен | Значение | Использование |
|-------|----------|---------------|
| gold-primary | #ca8a47 | Основной акцент, заголовки, кнопки |
| gold-secondary | #bfa06c | Вторичный акцент |
| gold-dark | #936d28 | Тёмное золото, hover |
| cream | #fffcf7 | Фон страницы |
| cream-2 | #fffbf3 | Фон секций |
| text-dark | #33302e | Основной текст |
| text-muted | #6b655d | Вторичный текст |

## Компоненты

### Glass (стеклянный эффект)
- Фон: rgba(255, 255, 255, 0.08)
- Бордюр: rgba(255, 255, 255, 0.1)
- Тень: 0 0.5rem 2rem 0 rgba(3, 3, 3, 0.1)

### Card
- Тень: 0 0.125rem 1rem rgba(191, 163, 124, 0.12)
- Радиус: 1rem (rounded-2xl)

## Страницы

| Страница | URL | Описание |
|----------|-----|----------|
| Главная | `/` | Лендинг: Hero, Benefits, Steps, Pricing, Gallery, Testimonials, FAQ, Geography, Team, Footer |
| Услуги | `/price` | Прайс-лист + Geography + FAQ |
| Портфолио | `/galery` | Галерея эмоций (слайдер) |
| Партнёрство | `/partnership` | 8 секций: Hero, About, Offers, Before/After, Testimonials, Team, Gallery, Examples, Pricing, FAQ |
| Контакты | `/contacts` | Телефон, email, адрес, соцсети, карта, реквизиты |
| Политика | `/privacy` | Политика конфиденциальности |

## Анимации
- Framer Motion — входы/выходы секций
- GSAP — сложные timeline-анимации
- Пауза при prefers-reduced-motion
