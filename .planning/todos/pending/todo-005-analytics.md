---
id: todo-005
created: 2026-07-11
status: open
priority: medium
area: analytics
---

# Подключить аналитику (Яндекс.Метрика / Google Analytics)

## Блокер
Ждёт cookie-согласия пользователя. Скрипты аналитики должны загружаться только после accept в CookieBanner.

## Интеграция
- Проверять getStoredConsent() перед загрузкой скриптов
- Яндекс.Метрика — счётчик + цели (заявка, просмотр цен)
- Google Analytics 4 — аналогично
