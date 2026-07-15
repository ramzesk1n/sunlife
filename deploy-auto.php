<?php
/**
 * Auto-deploy script — распаковывает deploy-final.zip и заменяет файлы
 * Открыть: https://sunlife-photo.ru/deploy-auto.php?key=sunlife2025deploy
 */

$secretKey = 'sunlife2025deploy';

if (!isset($_GET['key']) || $_GET['key'] !== $secretKey) {
    http_response_code(403);
    die('Forbidden');
}

$basePath = __DIR__;
$zipFile = $basePath . '/deploy-final.zip';

if (!file_exists($zipFile)) {
    die('ERROR: deploy-final.zip not found. Upload it first.');
}

echo "Starting deploy...\n";

// Backup old assets
$oldAssets = $basePath . '/assets';
if (is_dir($oldAssets)) {
    $backupName = $basePath . '/assets-backup-' . time();
    rename($oldAssets, $backupName);
    echo "Old assets backed up to: " . basename($backupName) . "\n";
}

// Extract zip
$zip = new ZipArchive();
if ($zip->open($zipFile) !== true) {
    die('ERROR: Cannot open deploy-final.zip');
}

$zip->extractTo($basePath);
$zip->close();

echo "Zip extracted.\n";

// Move files from deploy-minimal/ to root (if exists)
$tempDir = $basePath . '/deploy-minimal';
if (is_dir($tempDir)) {
    $items = glob($tempDir . '/*');
    foreach ($items as $item) {
        $name = basename($item);
        $destPath = $basePath . '/' . $name;
        
        if (is_dir($item)) {
            if (is_dir($destPath)) {
                // Remove old directory
                removeDir($destPath);
            }
            rename($item, $destPath);
            echo "Replaced dir: $name\n";
        } else {
            if (file_exists($destPath)) {
                unlink($destPath);
            }
            rename($item, $destPath);
            echo "Replaced file: $name\n";
        }
    }
    rmdir($tempDir);
}

// Update API
$apiSource = $basePath . '/api/send-form.php';
if (file_exists($apiSource)) {
    echo "API updated: send-form.php\n";
}

// Cleanup zip
unlink($zipFile);

echo "\n✅ Deploy completed!\n";
echo "Check: https://sunlife-photo.ru/\n";

function removeDir($dir) {
    $items = glob($dir . '/*');
    foreach ($items as $item) {
        is_dir($item) ? removeDir($item) : unlink($item);
    }
    rmdir($dir);
}
