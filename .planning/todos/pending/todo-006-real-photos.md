---
id: todo-006
created: 2026-07-11
updated: 2026-07-14
status: in-progress
priority: high
area: content
---

# Заменить placeholder-фото на реальные

## Статус: 🔄 В ПРОЦЕССЕ

### Что сделано
- ✅ **PartnershipTeam**: 10 сотрудников с реальными фото, загружены через админку
- ✅ **PartnershipBeforeAfter**: 3×3 фото ремонта в каждом слое
- ✅ **PartnershipTestimonial**: 8 отзывов врачей + фото министра
- ✅ **PartnershipExamples**: 8 роддомов загружены в админку, но JSON потерян

### Текущая проблема
- ⚠️ **PartnershipExamples**: Фото загружены в `/images/cms/` на сервере, но `partnership.json` был перезаписан пустым при деплое
- Причина: `dist/content/` перезаписывал серверный `content/` при деплое
- **Исправлено**: `dist/content/` теперь исключается из билда

### Что нужно сделать
1. Перезагрузить фото для 8 роддомов через админку
2. Убедиться что `partnership.json` на сервере содержит `examples` с `photos`

### Остальные placeholder
- [ ] Gallery (главная): 8 placeholder изображений
- [ ] Hero: уже заменён на hero-image-main.jpg
- [ ] PartnershipGallery (проекты): 8 placeholder проектов
