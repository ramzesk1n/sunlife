# САН ЛАЙФ - Состояние проекта

## Активная сессия: 2026-07-16

### Что сделано сегодня (2026-07-16)

1. ✅ **Исправлена галерея на `/partnership`**
   - Удалены битые `placeholder-X.jpg` из `partnership.json` (проекты)
   - Сохранены реальные фото в «Примерах работ» (8 роддомов × 5 фото)
   - `PartnershipGallery` и `PartnershipExamples` теперь фильтруют placeholder/invalid URL

2. ✅ **Обновлена админка**
   - Backend endpoint `delete-image` удаляет оригинал + все ресайзы
   - Upload разрешён для редакторов с правом `partnership`
   - `deleteProjectPhoto` / `deleteExamplePhoto` сохраняют JSON и чистят диск

3. ✅ **Деплой выполнен**
   - Загружен `deploy-final.zip` на сервер через SCP
   - Распакован и применён в `/var/www/s273478/data/www/sunlife-photo.ru/`
   - Сайт обновлён, 404 от placeholder пропали

4. ✅ **Репозиторий приведён в порядок**
   - `.gitignore` дополнен: `deploy-minimal/`, `deploy-*.zip`, `dist.zip`, `public/images/cms/`
   - Удалены из индекса generated-артефакты

### Текущие проблемы
- ⚠️ **404 не работает на сервере** — nginx отдаёт статический 404 вместо React Router
- ⚠️ **.htaccess может не работать** — если nginx не проксирует на Apache

### Архивы на сервере
| Файл | Размер | Статус |
|------|--------|--------|
| `deploy-final.zip` | 573 KB | ✅ Использован для деплоя, удалён с сервера |

### Открытые задачи (todo)

#### Критичные (до запуска)
- [ ] todo-001: Bundle size: vendor 71kB gzip → оптимизировать
- [ ] todo-004: Деплой на Vercel + кастомный домен

#### Важные (рекомендуется)
- [ ] todo-005: Яндекс.Метрика / Google Analytics
- [ ] todo-008: Schema.org JSON-LD разметка
- [ ] todo-009: Core Web Vitals оптимизация
- [ ] todo-010: UX-полировка (toast, skeleton, back-to-top)

#### Средние (после запуска)
- [ ] todo-011: Актуализация политики конфиденциальности
- [ ] todo-012: Доступность (a11y)
- [ ] todo-014: Страница благодарности (/thank-you)

#### Низкие (после стабилизации)
- [ ] todo-013: CI/CD, мониторинг, автодеплой
- [ ] PWA, мультиязычность

### Технический долг
- Tailwind v4 sourcemap warning (некритично)
- PHP backend работает только на hostiman (не на Vercel)
- nginx конфиг нужно обновить для SPA fallback

### Следующий шаг
1. Написать в поддержку hostiman про `try_files $uri $uri/ /index.html;`
2. Проверить 404 на сайте
