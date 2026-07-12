#!/bin/bash
# sync-from-server.sh - Download content JSON from production server
# Usage: ./sync-from-server.sh user@sunlife-photo.ru /var/www/html

SERVER=${1:-user@sunlife-photo.ru}
REMOTE_PATH=${2:-/var/www/html}

echo "Syncing content from $SERVER:$REMOTE_PATH/content/ ..."

# Download content JSON files
scp "$SERVER:$REMOTE_PATH/content/*.json" public/content/ 2>/dev/null || {
  echo "ERROR: Cannot connect to server. Please check SSH access or download manually."
  echo ""
  echo "Manual steps:"
  echo "1. Download these files from server: $SERVER:$REMOTE_PATH/content/*.json"
  echo "2. Place them in: $(pwd)/public/content/"
  echo "3. Run: npm run sync-content && npm run build"
  exit 1
}

# Copy to src for build
cp public/content/*.json src/content/

echo "Content synced! Now build:"
echo "  npm run build"
