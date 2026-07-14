---
id: todo-007
created: 2026-07-11
updated: 2026-07-14
status: completed
priority: high
area: frontend
---

# Добавить защиту форм от спама и ботов

## Статус: ✅ ВЫПОЛНЕНО

### Что сделано
- ✅ **Honeypot**: скрытое поле `website`, боты заполняют — форма отклоняется
- ✅ **Rate limiting**: `.rate_limit.json`, 5 запросов/15 минут с одного IP
- ✅ **JSON input validation**: проверка структуры входных данных
- ✅ **Telegram Bot API**: отправка через bot token, не через открытый endpoint

### Осталось
- [ ] reCAPTCHA v3 (низкий приоритет, текущая защита уже эффективна)
