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

## Deploy Preview

Каждый `git push` в `main`/`develop` и каждый Pull Request автоматически деплоится в **Cloudflare Pages**:

- Preview URL: `https://sunlife-preview.pages.dev`
- Workflow: `.github/workflows/preview.yml`

### Как это работает

1. Push в ветку → GitHub Actions запускает `npm ci` + `npm run build`
2. После билда создаётся `dist/php/send-form.json` — заглушка для формы (PHP не работает на Cloudflare Pages)
3. Папка `dist/` деплоится в Cloudflare Pages
4. В PR автоматически добавляется комментарий со ссылкой на preview

## Secrets

Добавьте в Settings → Secrets and variables → Actions:

| Secret | Описание | Как получить |
|--------|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | Токен для деплоя в Cloudflare Pages | [Cloudflare Dashboard](https://dash.cloudflare.com) → My Profile → API Tokens → Create Token → Use template "Cloudflare Pages" |
| `CLOUDFLARE_ACCOUNT_ID` | ID вашего аккаунта Cloudflare | [Cloudflare Dashboard](https://dash.cloudflare.com) — в правом нижнем углу страницы |

## PHP Backend

- Файл `php/send-form.php` — обработчик формы обратной связи
- **В preview (Cloudflare Pages):** форма возвращает JSON-заглушку `{"status":"preview","message":"Form disabled in preview environment"}`
- **В production (shared-хостинг):** `php/send-form.php` копируется отдельно, не через Vite-билд
- См. `.github/workflows/production.yml` — workflow для ручного запуска, готовый к добавлению SFTP-деплоя

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
