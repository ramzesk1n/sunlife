# План: Flat-File CMS для САН ЛАЙФ

## Контекст
- Хостинг: hostiman.ru (PHP доступен)
- Пользователь админки: без технических знаний
- CRM заявок: нужна, но позже
- Сайт должен оставаться статическим (100 PSI)

## Архитектура

### Структура
```
public/admin/              ← админка (HTML+CSS+JS, отдельная от React)
  ├── index.html           ← точка входа
  ├── css/
  │   └── admin.css        ← стили админки
  ├── js/
  │   ├── api.js           ← работа с PHP API
  │   ├── editor.js        ← редакторы полей
  │   └── image-upload.js  ← drag-drop загрузка фото
  └── api/                 ← PHP скрипты
      ├── config.php       ← настройки (пароль, пути)
      ├── auth.php         ← простая авторизация (session)
      ├── read.php         ← чтение JSON
      ├── write.php        ← запись JSON
      ├── upload.php       ← загрузка и оптимизация фото
      └── backup.php       ← создание бэкапов

src/content/             ← контент как JSON (вместо TS)
  ├── pricing.json
  ├── faq.json
  ├── faq-partnership.json
  ├── reviews.json
  ├── team.json
  ├── projects.json
  ├── gallery.json
  ├── meta.json
  ├── benefits.json
  ├── steps.json
  └── geography.json

public/images/cms/       ← фото загруженные через админку
  ├── hero/
  ├── gallery/
  ├── team/
  ├── projects/
  └── before-after/
```

### Принцип работы
1. Сайт (Vite + React) читает JSON из `src/content/` при билде
2. Админка (HTML+JS) работает с JSON через PHP API
3. Фото загружаются через PHP (GD/Imagick), оптимизируются, складываются в `public/images/cms/`
4. После изменений в админке: `git commit && push` или FTP upload
5. Сайт пересобирается с новыми данными

---

## Коллекции (JSON схема)

### pricing.json
```json
{
  "packages": [
    {
      "id": "photo-video-book-large",
      "name": "Фото видео + большая фотокнига",
      "price": 7500,
      "currency": "₽",
      "description": "Полный комплект с большой фотокнигой",
      "features": [
        { "text": "Фотосессия (50-60 кадров) + постобработка" }
      ],
      "popular": true
    }
  ]
}
```

### faq.json
```json
{
  "items": [
    {
      "id": "faq-delivery-time",
      "question": "Когда я получу готовые фотографии?",
      "answer": "Цифровые фото через 3 дня..."
    }
  ]
}
```

### team.json
```json
{
  "members": [
    {
      "id": "team-alina",
      "name": "Алина",
      "role": "администратор",
      "photo": {
        "src": "/images/cms/team/alina-400.webp",
        "srcset": "/images/cms/team/alina-400.webp 400w, /images/cms/team/alina-800.webp 800w",
        "sizes": "(max-width: 768px) 100vw, 300px",
        "alt": "Алина - администратор",
        "width": 800,
        "height": 1000
      },
      "order": 1
    }
  ]
}
```

### gallery.json
```json
{
  "images": [
    {
      "id": "gallery-1",
      "title": "Выписка из роддома",
      "alt": "Мама с малышом на выписке",
      "photo": {
        "src": "/images/cms/gallery/photo-1-800.webp",
        "srcset": "...",
        "sizes": "(max-width: 768px) 50vw, 25vw",
        "width": 800,
        "height": 1000
      },
      "page": "home",
      "order": 1
    }
  ]
}
```

---

## PHP API (hostiman.ru)

### auth.php
- Простая HTTP Basic Auth или session-based
- Пароль хранится в `config.php` (bcrypt hash)
- Без базы данных — чисто PHP sessions

### read.php
```php
GET /admin/api/read.php?file=pricing
→ читает src/content/pricing.json
→ возвращает JSON
```

### write.php
```php
POST /admin/api/write.php
Body: { file: "pricing", data: {...} }
→ валидирует JSON
→ создаёт бэкап (pricing.json.2024-01-15.bak)
→ записывает новый файл
→ возвращает success/error
```

### upload.php
```php
POST /admin/api/upload.php
Body: multipart/form-data (file + collection + id)
→ проверяет тип (image/jpeg, image/png, image/webp)
→ проверяет размер (< 10MB)
→ создаёт директорию public/images/cms/{collection}/
→ генерирует имена: {id}-400.webp, {id}-800.webp, {id}-1200.webp, {id}-1600.webp
→ конвертирует в WebP с помощью GD/Imagick
→ возвращает объект photo (src, srcset, sizes, width, height)
```

### backup.php
```php
GET /admin/api/backup.php
→ создаёт zip архив src/content/ + public/images/cms/
→ сохраняет в backups/backup-2024-01-15.zip
→ возвращает ссылку на скачивание
```

---

## Интерфейс админки

### Общие принципы
- Максимально простой, без лишних кнопок
- Мобильная адаптация (редакторы работают с телефона)
- Автосохранение черновиков (localStorage)
- Превью изменений перед публикацией
- Drag-and-drop для фото
- WYSIWYG для текстов (или просто textarea с markdown)

### Страницы

#### 1. Dashboard
- Статистика: количество заявок, фото, страниц
- Быстрые ссылки: Цены, FAQ, Галерея, Команда
- Последние изменения (история)
- Кнопка "Создать бэкап"

#### 2. Редактор цен (/admin/#pricing)
- Таблица с пакетами
- Кнопка "Добавить пакет"
- Поля: Название, Цена, Описание, Популярный (чекбокс)
- Features: список с кнопкой "+"
- Drag-and-drop для сортировки

#### 3. Редактор FAQ (/admin/#faq)
- Две вкладки: "Клиенты" и "Партнёры"
- Список вопросов (аккордеон)
- Кнопка "Добавить вопрос"
- Поля: Вопрос (textarea), Ответ (rich text)

#### 4. Редактор галереи (/admin/#gallery)
- Сетка фото (как в файловом менеджере)
- Drag-and-drop загрузка
- Каждое фото: превью + поля (title, alt, page, order)
- Кнопка "Удалить" с подтверждением
- Drag-and-drop для сортировки

#### 5. Редактор команды (/admin/#team)
- Карточки сотрудников (фото + имя + роль)
- Кнопка "Добавить"
- Поля: Имя, Роль, Фото (upload)

#### 6. Редактор отзывов (/admin/#reviews)
- Список отзывов
- Поля: Автор, Текст, Город, Дата
- Кнопка "Добавить"

#### 7. SEO (/admin/#seo)
- Таблица страниц
- Поля: Title, Description, OG Image (upload)

#### 8. Настройки (/admin/#settings)
- Смена пароля
- Бэкап / Восстановление
- Информация о версии

---

## Фото-пайплайн (PHP)

### Требования к хостингу
- PHP 8.0+
- GD или Imagick (проверить на hostiman.ru)
- `file_uploads = On`
- `upload_max_filesize >= 10M`
- `post_max_size >= 10M`

### Алгоритм
```php
function processImage($uploadedFile, $id, $collection) {
    $sizes = [400, 800, 1200, 1600];
    $outputDir = "../../public/images/cms/{$collection}/";
    
    // Создать директорию если нет
    if (!is_dir($outputDir)) mkdir($outputDir, 0755, true);
    
    // Загрузить оригинал
    $src = imagecreatefromjpeg($uploadedFile) 
        || imagecreatefrompng($uploadedFile) 
        || imagecreatefromwebp($uploadedFile);
    
    $origWidth = imagesx($src);
    $origHeight = imagesy($src);
    
    $result = [
        "src" => "",
        "srcset" => [],
        "sizes" => "(max-width: 768px) 100vw, 50vw",
        "width" => $origWidth,
        "height" => $origHeight,
        "alt" => ""
    ];
    
    foreach ($sizes as $size) {
        if ($origWidth < $size) continue;
        
        $ratio = $size / $origWidth;
        $newWidth = $size;
        $newHeight = intval($origHeight * $ratio);
        
        $dst = imagecreatetruecolor($newWidth, $newHeight);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
        
        $filename = "{$id}-{$size}.webp";
        $filepath = $outputDir . $filename;
        
        imagewebp($dst, $filepath, 85); // качество 85%
        imagedestroy($dst);
        
        $result["srcset"][] = "/images/cms/{$collection}/{$filename} {$size}w";
    }
    
    // Самый маленький как src по умолчанию
    $result["src"] = "/images/cms/{$collection}/{$id}-400.webp";
    $result["srcset"] = implode(", ", $result["srcset"]);
    
    imagedestroy($src);
    
    return $result;
}
```

---

## Билд-пайплайн

### Текущий
```bash
npm run build  # tsc -b && vite build && tsx scripts/prerender.ts
```

### Новый (с JSON контентом)
```bash
# 1. Проверить что JSON валидны
node scripts/validate-json.js

# 2. Сгенерировать TypeScript типы из JSON (опционально)
# или просто импортировать JSON напрямую в Vite

# 3. Билд
npm run build  # Vite умеет импортировать JSON напрямую
```

### Изменения в React
```typescript
// Вместо:
import { pricingPackages } from '../content/pricing';

// Будет:
import pricingData from '../content/pricing.json';
const pricingPackages = pricingData.packages;
```

Vite поддерживает импорт JSON из коробки — просто меняем `.ts` на `.json`.

---

## Безопасность

1. **Авторизация:** HTTP Basic Auth или простая форма с session
2. **CSRF:** токен в сессии, проверяется на каждый POST
3. **XSS:** sanitize всех текстовых полей (strip_tags)
4. **Файлы:** проверка MIME-type, не только расширения
5. **Размер:** лимит 10MB на фото
6. **Бэкап:** автоматический перед каждой записью
7. **Права:** файлы JSON и фото должны быть writable для PHP

---

## Развёртывание на hostiman.ru

### Структура на хостинге
```
public_html/                    ← корень сайта (dist/ билд)
  ├── index.html
  ├── assets/
  ├── images/
  └── admin/                    ← админка (не в билде, отдельная)
      ├── index.html
      ├── css/
      ├── js/
      └── api/                  ← PHP скрипты
          ├── config.php
          ├── auth.php
          ├── read.php
          ├── write.php
          ├── upload.php
          └── backup.php

src/                            ← исходники (не на хостинге, только в git)
  ├── content/                  ← JSON файлы
  │   ├── pricing.json
  │   └── ...
  └── ...

content_backups/                ← бэкапы JSON (автоматические)
  ├── 2024-01-15/
  │   ├── pricing.json
  │   └── ...
  └── ...
```

### Процесс публикации
1. Редактор меняет контент в админке (`public_html/admin/`)
2. PHP записывает JSON в `public_html/admin/content/` (или отдельная папка)
3. Разработчик забирает изменения: `git pull` или `scp` с хостинга
4. Переносит JSON в `src/content/`
5. Билдит: `npm run build`
6. Деплоит: `scp -r dist/* user@hostiman:/public_html/`

**Или автоматизация:**
- GitHub Action на push в main: билд + деплой на хостинг по FTP/SFTP

---

## Этапы реализации

### Этап 1: JSON-контент (1-2 дня)
- [ ] Конвертировать все `src/content/*.ts` → `src/content/*.json`
- [ ] Обновить импорты в React компонентах
- [ ] Проверить билд

### Этап 2: PHP API (2-3 дня)
- [ ] Создать `public/admin/api/config.php`
- [ ] Создать `auth.php` (авторизация)
- [ ] Создать `read.php` (чтение JSON)
- [ ] Создать `write.php` (запись JSON + бэкап)
- [ ] Создать `upload.php` (загрузка + resize + WebP)
- [ ] Создать `backup.php` (zip архив)
- [ ] Проверить на hostiman.ru

### Этап 3: Интерфейс админки (3-4 дня)
- [ ] HTML шаблон (sidebar + content area)
- [ ] CSS стили (мобильная адаптация)
- [ ] JS: API client (fetch обёртка)
- [ ] JS: Редактор цен (таблица)
- [ ] JS: Редактор FAQ (аккордеон)
- [ ] JS: Редактор галереи (grid + drag-drop)
- [ ] JS: Редактор команды (карточки)
- [ ] JS: SEO редактор (таблица)
- [ ] JS: Dashboard (статистика)

### Этап 4: Интеграция (1-2 дня)
- [ ] Скрипт validate-json.js
- [ ] GitHub Action для билда и деплоя
- [ ] Инструкция для редактора (README)
- [ ] Тестирование end-to-end

### Этап 5: CRM (позже)
- [ ] Коллекция `submissions.json` (или SQLite)
- [ ] Страница "Заявки" в админке
- [ ] Фильтры, поиск, статусы
- [ ] Экспорт в CSV

---

## Пример использования (для редактора)

1. Открывает `sunlife-ufa.ru/admin/`
2. Вводит пароль
3. Видит Dashboard → кликает "Цены"
4. Меняет "7500" на "8000" в поле "Цена"
5. Жмёт "Сохранить" → JSON обновлён
6. Переходит в "Галерея"
7. Перетаскивает фото с компьютера
8. Видит превью, заполняет "Название" и "Описание"
9. Жмёт "Загрузить" → фото оптимизировано, WebP созданы
10. Жмёт "Опубликовать" → данные готовы для билда
11. Звонит разработчику: "Обнови сайт"
12. Разработчик: `git pull && npm run build && deploy`

---

## Итог

**Преимущества:**
- Сайт остаётся статическим (100 PSI)
- Админка не грузит сайт (отдельная страница)
- Не нужна база данных
- Работает на любом хостинге с PHP
- Бесплатно
- Простая для не-технических пользователей

**Недостатки:**
- Нужен разработчик для деплоя после изменений (или настроить CI/CD)
- Нет real-time collaborative editing
- Контент в JSON — не так удобен как база для сложных запросов
- CRM заявок требует отдельного решения (SQLite или просто JSON)
