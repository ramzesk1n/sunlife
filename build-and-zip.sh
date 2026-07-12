#!/bin/bash
# build-and-zip.sh - Build project and create dist.zip for upload
# Usage: ./build-and-zip.sh

cd "$(dirname "$0")"

echo "=== Building Sunlife ==="
npm run build

if [ $? -ne 0 ]; then
    echo "ERROR: Build failed!"
    exit 1
fi

echo "=== Creating dist.zip ==="
cd dist
zip -r ../dist.zip .
cd ..

echo "=== Done ==="
echo "Upload dist.zip to server (same folder as deploy.php)"
echo "Then open: https://sunlife-photo.ru/deploy.php?key=sunlife2025deploy"
