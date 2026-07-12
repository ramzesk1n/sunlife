<?php
/**
 * Deploy script - unpacks dist.zip to website root
 * Upload dist.zip to same folder as this script, then open in browser:
 * https://sunlife-photo.ru/deploy.php?key=YOUR_SECRET_KEY
 */

$secretKey = 'sunlife2025deploy'; // Change this!

// Check key
if (!isset($_GET['key']) || $_GET['key'] !== $secretKey) {
    http_response_code(403);
    die('Forbidden');
}

$basePath = __DIR__;
$zipFile = $basePath . '/dist.zip';

if (!file_exists($zipFile)) {
    die('ERROR: dist.zip not found. Upload it first.');
}

$zip = new ZipArchive();
if ($zip->open($zipFile) !== true) {
    die('ERROR: Cannot open dist.zip');
}

// Extract dist/ contents to root
$tempDir = $basePath . '/_deploy_temp_' . time();
$zip->extractTo($tempDir);
$zip->close();

// Find extracted dist folder
$distDir = null;
foreach (glob($tempDir . '/*') as $item) {
    if (is_dir($item) && basename($item) === 'dist') {
        $distDir = $item;
        break;
    }
}

if (!$distDir) {
    // Maybe files are directly in temp, not in dist/ subfolder
    $distDir = $tempDir;
}

// Move files from dist/ to root (overwrite)
function moveFiles($src, $dst) {
    $items = glob($src . '/*');
    foreach ($items as $item) {
        $name = basename($item);
        $destPath = $dst . '/' . $name;
        
        if (is_dir($item)) {
            if (!is_dir($destPath)) {
                mkdir($destPath, 0755, true);
            }
            moveFiles($item, $destPath);
            rmdir($item);
        } else {
            if (file_exists($destPath)) {
                unlink($destPath);
            }
            rename($item, $destPath);
        }
    }
}

moveFiles($distDir, $basePath);

// Cleanup
function removeDir($dir) {
    $items = glob($dir . '/*');
    foreach ($items as $item) {
        is_dir($item) ? removeDir($item) : unlink($item);
    }
    rmdir($dir);
}
removeDir($tempDir);

// Remove zip
unlink($zipFile);

echo "OK: Deployed successfully!";
