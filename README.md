# Sun Life — фотослужба выписки из роддома

Перенос лендинга с Webflow на собственный стек: Vite + React + TypeScript + Tailwind CSS.

## Стек

- **Vite 5** + React 19 + TypeScript (strict)
- **Tailwind CSS v4** — JIT, кастомная палитра
- **Framer Motion** — UI-анимации
- **GSAP + ScrollTrigger** — скролл-сцены
- **React Router v7** — SPA-роутинг (4 страницы)
- **vite-plugin-prerender** — SEO-статика для 4 роутов

## Страницы

| Путь | Содержимое |
|------|-----------|
| `/` | Home — все секции |
| `/price` | Тарифы + FAQ + форма |
| `/galery` | Галерея + форма |
| `/partnership` | Партнёрство + форма |

## Деплой на Vercel

Рекомендуется через **Vercel Git Integration**:

1. Открой [vercel.com/new](https://vercel.com/new)
2. Импортируй репозиторий `ramzesk1n/sunlife`
3. Vercel автоматически:
   - Деплоит на каждый `git push`
   - Создаёт preview для Pull Requests
   - Деплоит production на push в `main`

### Настройки (если нужно)

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm ci`

## PHP Backend

- Файл `php/send-form.php` — обработчик формы обратной связи
- **На Vercel:** PHP не выполняется. Форма возвращает JSON-заглушку.
- **В production (shared-хостинг):** `php/send-form.php` копируется отдельно, не через Vite-билд.

## Локальная разработка

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

Создаёт `dist/` со статикой + prerender для 4 роутов.

## Правила проекта

- Контент только из `src/content/*.ts`, не хардкодить в JSX
- GSAP-сцены через `IntersectionObserver` (ленивая инициализация)
- Обязательно `prefers-reduced-motion: reduce`
- Cleanup GSAP в `useEffect` return
- Изображения: AVIF/WebP, `width/height` обязательны
