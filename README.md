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

## Deploy

Автоматический деплой на **Vercel**:

- **Preview:** на каждый `push` в `main`/`develop` и Pull Request
- **Production:** на `push` в `main` (или ручной запуск `workflow_dispatch`)

### Workflow

| Файл | Триггер | Действие |
|------|---------|----------|
| `.github/workflows/preview.yml` | `push` в `main`/`develop`, `pull_request` | Preview deploy + комментарий в PR |
| `.github/workflows/production.yml` | `push` в `main`, `workflow_dispatch` | Production deploy |

## Secrets

Добавь в Settings → Secrets and variables → Actions:

| Secret | Описание | Как получить |
|--------|----------|-------------|
| `VERCEL_TOKEN` | Токен для деплоя | [Vercel Dashboard](https://vercel.com/account/tokens) → Create Token |
| `VERCEL_ORG_ID` | ID организации/пользователя | `npx vercel link` или в Settings → General |
| `VERCEL_PROJECT_ID` | ID проекта | `npx vercel link` или в Settings → General |

### Быстрый способ получить Org ID и Project ID

```bash
npx vercel@latest link
# Следуй инструкциям, затем:
cat .vercel/project.json
```

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
