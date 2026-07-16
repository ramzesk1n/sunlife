# Гайд по деплою Sunlife CMS

## Что деплоим

```
dist/        → HTML + CSS + JS (статика сайта)
public/admin → PHP API + HTML интерфейс админки
public/content/*.json → JSON-файлы, которые редактирует админка
```

JSON в продакшене встроен в JS-бандл при сборке, поэтому после изменений в `public/content/*.json` нужно **пересобрать и перезалить**.

## Подготовка

```bash
cd /f/VIBECODING/SUNLIFE/sunlife
```

## 1. Сборка

```bash
npm run sync-content && npm run build
```

Это:
1. Скопирует `public/content/*.json` → `src/content/`
2. Проверит TypeScript
3. Соберёт production-билд в `dist/`
4. Создаст prerender для всех страниц

## 2. Создание архива для деплоя

```bash
# Очистить старую папку
rm -rf deploy-minimal

# Создать структуру
mkdir -p deploy-minimal/admin deploy-minimal/content

# Скопировать собранный сайт (без images — они уже на сервере)
cp -r dist/assets dist/contacts dist/galery dist/partnership dist/price dist/privacy deploy-minimal/
cp dist/index.html dist/robots.txt dist/.htaccess dist/deploy.php dist/favicon.svg dist/icons.svg dist/api deploy-minimal/

# Скопировать админку и контент
cp -r public/admin/* deploy-minimal/admin/
cp -r public/content/* deploy-minimal/content/

# Упаковать
rm -f deploy-final.zip
powershell -Command "Compress-Archive -Path deploy-minimal -DestinationPath deploy-final.zip"
```

> **Важно:** архив создаётся через PowerShell на Windows. Внутри пути сохраняются с `\`, поэтому на сервере распаковывать нужно **только через `7za`**, а не `unzip`.

## 3. Деплой на сервер

### Доступ

```
SSH:  s273478@ruvip68.hostiman.ru:8228
Web root: /var/www/s273478/data/www/sunlife-photo.ru/
```

### Загрузка архива

```bash
pscp -P 8228 deploy-final.zip s273478@ruvip68.hostiman.ru:/var/www/s273478/data/www/sunlife-photo.ru/deploy-final.zip
```

### Распаковка и применение

```bash
plink -ssh -P 8228 s273478@ruvip68.hostiman.ru
```

На сервере:

```bash
cd /var/www/s273478/data/www/sunlife-photo.ru

# Распаковать правильно (7za понимает Windows-пути)
7za x -y deploy-final.zip

# Удалить старые версии заменяемых папок/файлов
rm -rf assets contacts galery partnership price privacy admin content api
rm -f index.html robots.txt .htaccess deploy.php favicon.svg icons.svg

# Переместить новые файлы из deploy-minimal в корень
mv deploy-minimal/* .
mv deploy-minimal/.htaccess .
rmdir deploy-minimal

# Удалить архив
rm -f deploy-final.zip
```

## 4. Проверка

1. Открыть `https://sunlife-photo.ru/partnership/`
2. Обновить страницу с чисткой кеша: `Ctrl + F5`
3. Проверить консоль на 404
4. Проверить админку: `https://sunlife-photo.ru/admin/`

## 5. Если меняли только JSON (быстрый путь)

Если изменения только в `public/content/*.json`:

1. Пересобрать проект (`npm run build`)
2. Загрузить только `content/partnership.json` (или другой файл) в `public_html/content/`
3. **Обновить JS-бандл**, потому что JSON встроен в сборку

Поэтому проще всегда деплоить весь `deploy-final.zip`.

## Важные замечания

- **Не коммитьте** `deploy-minimal/`, `deploy-*.zip`, `dist.zip`, `public/images/cms/` — они в `.gitignore`.
- **Фото галереи** (`images/gallery/`) не входят в архив — они уже на сервере и не менялись.
- **CMS-изображения** (`images/cms/`) создаются админкой на сервере, локально их может не быть.
