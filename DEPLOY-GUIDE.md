# Полный гайд по деплою Sunlife CMS на hostiman.ru

## Что мы деплоим

```
┌─────────────────────────────────────────────────────────────┐
│  САЙТ (статика)          +  АДМИНКА (PHP)                  │
│  dist/                   +  public/admin/                   │
│  HTML + CSS + JS         +  PHP API + HTML интерфейс       │
│  (JSON встроен в JS)     +  (редактирует JSON файлы)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  public/content/  │
                    │  *.json файлы   │
                    └─────────────────┘
```

## Шаг 1. Подготовка к деплою (делаем на компьютере)

### 1.1 Собрать проект

```bash
# Заходим в папку проекта
cd /f/VIBECODING/SUNLIFE/sunlife

# Собираем production билд
npm run build
```

**Что происходит:**
1. `sync-content` — копирует `public/content/*.json` → `src/content/`
2. `tsc` — проверяет TypeScript на ошибки
3. `vite build` — собирает HTML/CSS/JS, встраивает JSON в JS-бандл
4. `prerender` — создаёт статические HTML для всех 5 страниц

**Результат:** папка `dist/` с готовым сайтом.

### 1.2 Проверить, что всё собралось

```bash
# Должно быть 5 HTML файлов + assets + admin
ls dist/
# → index.html, price/index.html, galery/index.html, partnership/index.html, privacy/index.html
# → assets/ (CSS, JS)
# → admin/ (PHP API + HTML + CSS + JS)
# → content/ (JSON файлы для админки)
# → images/ (фото, логотипы)
```

---

## Шаг 2. Загрузка на хостинг (hostiman.ru)

### 2.1 Подключение к FTP

Hostiman даёт доступ по FTP. Данные для подключения берём в панели управления:
- **Сервер:** `ftp.ваш-сайт.ru` или IP из панели
- **Логин:** ваш логин хостинга
- **Пароль:** ваш пароль хостинга
- **Порт:** 21

**Программы для FTP:**
- FileZilla (бесплатная)
- WinSCP
- Total Commander

### 2.2 Что куда загружать

```
ВАШ КОМПЬЮТЕР (папка dist/)
│
├── index.html              ──▶  /public_html/index.html
├── price/index.html        ──▶  /public_html/price/index.html
├── galery/index.html       ──▶  /public_html/galery/index.html
├── partnership/index.html  ──▶  /public_html/partnership/index.html
├── privacy/index.html      ──▶  /public_html/privacy/index.html
│
├── assets/                 ──▶  /public_html/assets/
│   ├── index-*.css
│   ├── index-*.js
│   ├── vendor-*.js
│   └── animation-*.js
│
├── images/                 ──▶  /public_html/images/
│   ├── sunlife_logo.png
│   ├── hero-image-main.jpg
│   └── ...
│
├── admin/                  ──▶  /public_html/admin/
│   ├── index.html          (страница входа)
│   ├── dashboard.html      (панель управления)
│   ├── css/admin.css       (стили админки)
│   ├── js/admin.js         (логика админки)
│   └── api/index.php       (PHP API)
│
└── content/                ──▶  /public_html/content/
    ├── pricing.json
    ├── faq.json
    ├── gallery.json
    ├── benefits.json
    ├── reviews.json
    ├── steps.json
    ├── geography.json
    ├── partnership.json
    └── meta.json
```

### 2.3 Пошаговая загрузка через FileZilla

1. **Открываем FileZilla**
2. **Вводим данные подключения** (вверху):
   - Хост: `ftp.ваш-сайт.ru`
   - Имя пользователя: `логин`
   - Пароль: `пароль`
   - Порт: `21`
3. **Жмём "Быстрое соединение"**
4. **Слева** (ваш компьютер): открываем `F:\VIBECODING\SUNLIFE\sunlife\dist\`
5. **Справа** (сервер): открываем `/public_html/`
6. **Перетаскиваем всё** из `dist/` в `/public_html/`
7. **Ждём завершения** (может занять 5-10 минут)

### 2.4 Проверка прав на папки (ВАЖНО!)

Админка должна иметь право записывать файлы. Проверяем/ставим права 755:

```bash
# Это делается через панель хостинга (ISPmanager/cPanel)
# или через FTP-клиент (правый клик → права доступа)

/public_html/content/     → 755 (чтение+запись)
/public_html/images/       → 755
/public_html/images/cms/  → 755 (создаётся автоматически)
```

---

## Шаг 3. Проверка работы

### 3.1 Сайт

Открываем в браузере:
```
https://sunlife-ufa.ru/
```

**Должно быть:**
- ✅ Сайт загружается мгновенно (без "Загрузка...")
- ✅ Все цены, FAQ, отзывы видны
- ✅ Переходы между страницами работают
- ✅ Нет ошибок в консоли (F12 → Console)

### 3.2 Админка

Открываем:
```
https://sunlife-ufa.ru/admin/
```

**Должно быть:**
- ✅ Форма входа с заголовком "САН ЛАЙФ CMS"
- ✅ Вход с паролем `sunlife2025`
- ✅ После входа — панель с меню слева
- ✅ Редактор цен, FAQ, галереи и т.д.

### 3.3 Тест редактирования

1. **Входим в админку**
2. **Выбираем "Цены"**
3. **Меняем название первого пакета** (например, добавляем "ТЕСТ" в конец)
4. **Жмём "Сохранить изменения"**
5. **Проверяем** — должно появиться сообщение "Сохранено!"
6. **Открываем сайт** в другой вкладке
7. **Обновляем (F5)** — изменения НЕ видны (это нормально!)

---

## Шаг 4. Публикация изменений (самый важный шаг!)

### Почему изменения не видны сразу?

```
Админка редактирует:    public/content/pricing.json
Сайт показывает:        JS-бандл (куда JSON встроен при BUILD)
```

Чтобы увидеть изменения → нужно **пересобрать и перезалить**.

### 4.1 Полный цикл публикации

```bash
# === ШАГ 1: Получить изменения с хостинга ===
# (если админка уже что-то поменяла на сервере)

# Скачиваем public/content/*.json с хостинга через FTP
# и заменяем ими файлы в проекте на компьютере:
#   F:\VIBECODING\SUNLIFE\sunlife\public\content\*.json

# === ШАГ 2: Синхронизировать ===
cd /f/VIBECODING/SUNLIFE/sunlife
npm run sync-content
# → копирует public/content/*.json → src/content/*.json

# === ШАГ 3: Собрать ===
npm run build
# → создаёт dist/ со встроенными JSON

# === ШАГ 4: Загрузить на хостинг ===
# Через FileZilla: удалить старый dist/ на сервере,
# загрузить новый dist/ целиком
```

### 4.2 Автоматизация через git (рекомендуется)

**Настройка (один раз):**

```bash
# На хостинге (через SSH, если hostiman даёт):
cd ~/sunlife-ufa.ru/public_html/content/
git init
git add .
git commit -m "initial content"

# На компьютере — добавляем remote:
cd /f/VIBECODING/SUNLIFE/sunlife
git remote add hosting ssh://user@hostiman.ru:~/sunlife-ufa.ru/public_html/content/
```

**Публикация изменений:**

```bash
# 1. Получить изменения с хостинга
git pull hosting main

# 2. Скопировать в src/ для сборки
npm run sync-content

# 3. Собрать
npm run build

# 4. Загрузить dist/ на хостинг (FTP)
```

---

## Шаг 5. Смена пароля админки (обязательно!)

Сейчас пароль `sunlife2025` — это временный. Нужно сменить.

### 5.1 Генерируем новый hash

```bash
# На компьютере, где есть PHP:
php -r "echo password_hash('ВАШ_НОВЫЙ_ПАРОЛЬ', PASSWORD_DEFAULT);"

# Пример вывода:
# $2y$10$HFN.GgT3bW9Odd9V2PYPY.NBlUy7bqqGqUibrR9KIpSpj4eW/OpdK
```

### 5.2 Меняем в файле

Открываем `public/admin/api/index.php` (на компьютере), ищем строку:
```php
const ADMIN_PASSWORD_HASH = '$2y$10$lau2uexqlaDNcuzBTmoVq...';
```

Меняем на новый hash.

### 5.3 Загружаем обновлённый файл на хостинг

```
public/admin/api/index.php  →  /public_html/admin/api/index.php
```

---

## Шаг 6. Резервное копирование

Админка автоматически создаёт бэкапы при каждом сохранении:

```
public/content/pricing.json
public/content/pricing-2025-07-11-143052.backup.json
public/content/pricing-2025-07-11-143120.backup.json
...
```

Хранится 10 последних бэкапов. Если что-то сломалось — скачайте бэкап и переименуйте в оригинал.

---

## Частые проблемы

### Проблема: "Сохранить" не работает, ошибка 401
**Решение:** Сессия PHP истекла. Обновите страницу админки (F5), войдите заново.

### Проблема: "Failed to write file"
**Решение:** Нет прав на запись. Проверьте права папки `content/` — должно быть 755.

### Проблема: Изменения в админке не видны на сайте
**Решение:** Это нормально! Нужно пересобрать проект (`npm run build`) и перезалить `dist/`.

### Проблема: Белый экран в админке
**Решение:** Проверьте, что PHP 8.3 включен в панели хостинга. Проверьте консоль браузера (F12).

---

## Итоговый чеклист деплоя

- [ ] `npm run build` прошёл без ошибок
- [ ] `dist/` содержит `admin/`, `content/`, `images/`, `assets/`, HTML файлы
- [ ] Загружено на хостинг в `/public_html/`
- [ ] Права на `content/` — 755
- [ ] Сайт открывается и работает
- [ ] Админка открывается, вход работает
- [ ] Редактирование + сохранение работает
- [ ] Пароль изменён с `sunlife2025` на свой
- [ ] Бэкапы создаются автоматически
