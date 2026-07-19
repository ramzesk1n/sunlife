#!/bin/bash
# build-and-zip.sh - Build project and create dist.zip for upload
# Usage: ./build-and-zip.sh
#
# ВАЖНО: dist.zip должен иметь ПЛОСКУЮ структуру — файлы и папки лежат
# в корне архива (index.html, assets/, api/ и т.д.), БЕЗ обёрточной папки dist/.
# Иначе при распаковке на сервере создаётся dist/dist/ и файлы не заменяются.

cd "$(dirname "$0")"

echo "=== Building Sunlife ==="
npm run build

if [ $? -ne 0 ]; then
    echo "ERROR: Build failed!"
    exit 1
fi

echo "=== Creating dist.zip (flat structure, no dist/ wrapper) ==="
# Исключаем: admin/, fonts/, content/ и подпапки images/ (gallery, slider,
# reviews, cms — уже на сервере). Файлы в корне images/ включаем (иконки,
# логотип, hero) — иначе новые ассеты вроде images/max.svg не доедут.
# zip на Windows отсутствует, поэтому используем Python.
python - <<'EOF'
import os, zipfile

EXCLUDE_DIRS = {'admin', 'fonts', 'content'}

with zipfile.ZipFile('dist.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk('dist'):
        rel = os.path.relpath(root, 'dist')
        parts = [] if rel == '.' else rel.split(os.sep)
        if parts and parts[0] in EXCLUDE_DIRS:
            dirs[:] = []
            continue
        if len(parts) > 1 and parts[0] == 'images':
            dirs[:] = []
            continue
        for f in files:
            full = os.path.join(root, f)
            # Путь внутри архива БЕЗ префикса dist/
            z.write(full, os.path.relpath(full, 'dist'))

print('dist.zip created')
EOF

echo "=== Done ==="
echo "Upload dist.zip to server (same folder as deploy.php)"
echo "Then open: https://sunlife-photo.ru/deploy.php?key=sunlife2025deploy"
