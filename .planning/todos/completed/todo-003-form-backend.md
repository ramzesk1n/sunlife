---
id: todo-003
created: 2026-07-11
updated: 2026-07-14
status: completed
priority: high
area: backend
---

# Настроить отправку форм обратней связи

## Статус: ✅ ВЫПОЛНЕНО

### Что сделано
- PHP handler `public/api/send-form.php` с rate limiting, honeypot, Telegram Bot API
- Конфигурация через `config.local.php` / `config.example.php`
- ContactForm: реальная отправка через fetch, loading states, error handling
- Rate limit: 5 запросов/15 минут с одного IP
- Honeypot: скрытое поле `website`

### Результат
Форма отправляет данные в Telegram чат администратора.

### Осталось
- [ ] reCAPTCHA v3 (низкий приоритет, honeypot + rate limit уже защищают)
