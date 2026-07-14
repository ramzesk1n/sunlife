---
id: todo-015
created: 2026-07-15
updated: 2026-07-15
status: completed
priority: high
area: frontend
---

# Popup форма партнёрства + FloatingCallBubble + Max

## Статус: ✅ ВЫПОЛНЕНО

### Что сделано
- `PartnershipPopupForm` — модальная форма для директоров/клиник
  - Поля: ФИО, телефон, email, объём выписок, способ связи, клиника, сообщение
  - Без поля даты (неактуально для директоров)
  - Honeypot, анимации, success state с авто-закрытием
- `FloatingCallBubble` — плавающий бабл на всех страницах
  - 4 кнопки: Позвонить, WhatsApp, Telegram, Max
  - Max с фиолетово-синим градиентом (SVG-иконка)
  - Появляется после скролла 300px
- PHP backend — поддержка `formType: 'partnership'`
  - Отдельный формат сообщения в Telegram (🤝)
  - Новые поля: email, volume, message
- Главная галерея — восстановлено 19 фото (было 397 по ошибке)
- PricingCards добавлен после Gallery на главной

### Результат
Партнёрская страница имеет popup форму для быстрой заявки. Все страницы имеют floating бабл для связи.

### Осталось
- [ ] URL для Max — сейчас placeholder `https://max.ru`
