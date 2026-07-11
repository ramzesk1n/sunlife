---
id: todo-003
created: 2026-07-11
status: open
priority: high
area: backend
---

# Настроить отправку форм обратной связи

Сейчас форма только имитирует отправку (setStatus('success')).

## Варианты
1. Vercel Edge Functions — serverless handler для формы
2. Formspree — сторонний сервис, быстрая интеграция
3. Telegram Bot — отправка заявок в чат

## Требования
- Отправка имени, телефона, роддома, даты
- Уведомление в WhatsApp/Telegram
- Сохранение согласия на обработку ПДн
