---
id: todo-016
created: 2026-07-15
updated: 2026-07-15
status: completed
priority: high
area: frontend
---

# Страница 404 + robots.txt + .htaccess + telegram.me

## Статус: ✅ ВЫПОЛНЕНО

### Что сделано
- `src/pages/NotFoundPage.tsx` — красивая страница 404 с анимациями
  - Большая цифра 404, заголовок, описание, кнопки на главную и контакты
  - Ссылки на галерею и цены
- `robots.txt` — разрешение всем ботам, ссылка на sitemap
- `.htaccess` — SPA fallback, gzip, кэширование, защита файлов
- `nginx-spa.conf` — конфиг для nginx с `try_files`
- Все ссылки `t.me` заменены на `telegram.me` (4 файла)

### Результат
404 страница работает на localhost. На сервере нужно обновить nginx конфиг.

### Осталось
- [ ] Применить nginx конфиг на сервере (через поддержку hostiman)
- [ ] Деплой `deploy-v3.zip` на сервер
