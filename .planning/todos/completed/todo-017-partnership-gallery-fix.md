---
id: todo-017
created: 2026-07-16
updated: 2026-07-16
status: completed
priority: high
area: frontend, cms, deploy
---

# Исправление галереи на /partnership

## Статус: ✅ ВЫПОЛНЕНО

### Что сделано
- Удалены битые `placeholder-X.jpg` из `partnership.json` (проекты).
- Сохранены реальные фото в разделе «Примеры работ» (8 роддомов × 5 фото).
- `PartnershipGallery` и `PartnershipExamples` теперь фильтруют placeholder/invalid URL и скрывают пустые карточки.
- Admin: добавлен backend endpoint `delete-image` (удаляет оригинал + ресайзы), upload разрешён для `partnership`-редакторов.
- `deleteProjectPhoto` / `deleteExamplePhoto` теперь сохраняют JSON и удаляют файл с диска.
- Проект пересобран и задеплоен на `sunlife-photo.ru` через SSH (`ruvip68.hostiman.ru:8228`).

### Результат
- На `/partnership/` обложки проектов и примеры работ отображаются корректно.
- В консоли больше нет 404 от `placeholder-X.jpg`.

### Зафиксировано
- В `.gitignore` добавлены deploy-артефакты и `public/images/cms/`.
- Удалены из репозитория tracked-артефакты: `deploy-minimal/`, `deploy-v*.zip`, `dist.zip`.
