<?php
/**
 * Sunlife CMS - Simple flat-file content management
 * PHP 8.3+ required
 */

// Configuration
const ADMIN_PASSWORD_HASH = '$2y$10$lau2uexqlaDNcuzBTmoVq.ANSchvxVZiXqNOvbGM.aPo2yPJEyT0G'; // default: 'sunlife2025' - CHANGE THIS!
const CONTENT_DIR = __DIR__ . '/../../content/';
const IMAGES_DIR = __DIR__ . '/../../images/cms/';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const IMAGE_SIZES = [400, 800, 1200, 1600];

session_start();

// CORS headers for API
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Helper functions
function jsonResponse(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function requireAuth(): void {
    if (empty($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        jsonResponse(['success' => false, 'error' => 'Unauthorized'], 401);
    }
}

function validateFilename(string $filename): bool {
    return preg_match('/^[a-zA-Z0-9_-]+$/', $filename) === 1;
}

function sanitizeJsonInput(string $json): ?array {
    $data = json_decode($json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }
    return $data;
}

// Image optimization with GD
function optimizeImage(string $sourcePath, string $filename, string $ext): array {
    $results = [];
    
    // Create images directory if not exists
    if (!is_dir(IMAGES_DIR)) {
        mkdir(IMAGES_DIR, 0755, true);
    }
    
    // Load source image
    $source = match(strtolower($ext)) {
        'jpg', 'jpeg' => imagecreatefromjpeg($sourcePath),
        'png' => imagecreatefrompng($sourcePath),
        'gif' => imagecreatefromgif($sourcePath),
        'webp' => imagecreatefromwebp($sourcePath),
        default => null,
    };
    
    if (!$source) {
        return ['error' => 'Failed to load image'];
    }
    
    $origWidth = imagesx($source);
    $origHeight = imagesy($source);
    $baseName = pathinfo($filename, PATHINFO_FILENAME);
    
    $srcset = [];
    $sizes = [];
    
    foreach (IMAGE_SIZES as $maxSize) {
        if ($origWidth <= $maxSize && $origHeight <= $maxSize) {
            // Skip if original is smaller than target
            continue;
        }
        
        // Calculate new dimensions maintaining aspect ratio
        $ratio = min($maxSize / $origWidth, $maxSize / $origHeight);
        $newWidth = (int)($origWidth * $ratio);
        $newHeight = (int)($origHeight * $ratio);
        
        // Create resized image
        $resized = imagecreatetruecolor($newWidth, $newHeight);
        
        // Preserve transparency for PNG
        if ($ext === 'png') {
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
        }
        
        imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
        
        // Save as WebP
        $webpPath = IMAGES_DIR . $baseName . '-' . $maxSize . '.webp';
        imagewebp($resized, $webpPath, 85);
        imagedestroy($resized);
        
        $srcset[] = '/images/cms/' . $baseName . '-' . $maxSize . '.webp ' . $maxSize . 'w';
        $sizes[] = $maxSize;
    }
    
    // Save original size as WebP too
    $origWebpPath = IMAGES_DIR . $baseName . '-orig.webp';
    imagewebp($source, $origWebpPath, 85);
    $srcset[] = '/images/cms/' . $baseName . '-orig.webp ' . $origWidth . 'w';
    
    imagedestroy($source);
    
    // Clean up original uploaded file
    unlink($sourcePath);
    
    return [
        'success' => true,
        'src' => '/images/cms/' . $baseName . '-orig.webp',
        'srcset' => implode(', ', $srcset),
        'sizes' => implode(', ', array_map(fn($s) => '(max-width: ' . ($s + 100) . 'px) ' . $s . 'px', $sizes)) . ' 100vw',
        'width' => $origWidth,
        'height' => $origHeight,
    ];
}

// Router
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $password = $input['password'] ?? '';
        
        if (password_verify($password, ADMIN_PASSWORD_HASH)) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_login_time'] = time();
            jsonResponse(['success' => true]);
        }
        
        jsonResponse(['success' => false, 'error' => 'Invalid password'], 401);
        break;
        
    case 'logout':
        session_destroy();
        jsonResponse(['success' => true]);
        break;
        
    case 'check':
        jsonResponse([
            'success' => true,
            'logged_in' => !empty($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true,
        ]);
        break;
        
    case 'get':
        requireAuth();
        $file = $_GET['file'] ?? '';
        
        if (!validateFilename($file)) {
            jsonResponse(['success' => false, 'error' => 'Invalid filename'], 400);
        }
        
        $path = CONTENT_DIR . $file . '.json';
        if (!file_exists($path)) {
            jsonResponse(['success' => false, 'error' => 'File not found'], 404);
        }
        
        $content = file_get_contents($path);
        $data = json_decode($content, true);
        
        jsonResponse([
            'success' => true,
            'file' => $file,
            'data' => $data,
        ]);
        break;
        
    case 'save':
        requireAuth();
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $file = $input['file'] ?? '';
        $data = $input['data'] ?? null;
        
        if (!validateFilename($file)) {
            jsonResponse(['success' => false, 'error' => 'Invalid filename'], 400);
        }
        
        if ($data === null) {
            jsonResponse(['success' => false, 'error' => 'No data provided'], 400);
        }
        
        $path = CONTENT_DIR . $file . '.json';
        
        // Validate JSON
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        if ($json === false) {
            jsonResponse(['success' => false, 'error' => 'Invalid JSON data'], 400);
        }
        
        // Create backup
        if (file_exists($path)) {
            $backupPath = CONTENT_DIR . $file . '-' . date('Y-m-d-His') . '.backup.json';
            copy($path, $backupPath);
            
            // Keep only last 10 backups
            $backups = glob(CONTENT_DIR . $file . '-*.backup.json');
            if (count($backups) > 10) {
                usort($backups, fn($a, $b) => filemtime($a) <=> filemtime($b));
                foreach (array_slice($backups, 0, count($backups) - 10) as $old) {
                    unlink($old);
                }
            }
        }
        
        // Write file
        if (file_put_contents($path, $json, LOCK_EX) === false) {
            jsonResponse(['success' => false, 'error' => 'Failed to write file'], 500);
        }
        
        jsonResponse(['success' => true, 'file' => $file]);
        break;
        
    case 'upload':
        requireAuth();
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
        }
        
        if (!isset($_FILES['image'])) {
            jsonResponse(['success' => false, 'error' => 'No image uploaded'], 400);
        }
        
        $file = $_FILES['image'];
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            jsonResponse(['success' => false, 'error' => 'Upload failed: ' . $file['error']], 400);
        }
        
        if ($file['size'] > MAX_FILE_SIZE) {
            jsonResponse(['success' => false, 'error' => 'File too large (max 10MB)'], 400);
        }
        
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ALLOWED_EXTENSIONS, true)) {
            jsonResponse(['success' => false, 'error' => 'Invalid file type. Allowed: ' . implode(', ', ALLOWED_EXTENSIONS)], 400);
        }
        
        // Generate unique filename
        $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '', pathinfo($file['name'], PATHINFO_FILENAME));
        $uniqueName = $baseName . '-' . uniqid();
        $tmpPath = $file['tmp_name'];
        
        $result = optimizeImage($tmpPath, $uniqueName, $ext);
        
        if (isset($result['error'])) {
            jsonResponse(['success' => false, 'error' => $result['error']], 500);
        }
        
        jsonResponse([
            'success' => true,
            'image' => $result,
        ]);
        break;
        
    case 'list-images':
        requireAuth();
        
        if (!is_dir(IMAGES_DIR)) {
            jsonResponse(['success' => true, 'images' => []]);
        }
        
        $images = [];
        $files = glob(IMAGES_DIR . '*.webp');
        
        foreach ($files as $file) {
            $basename = basename($file);
            // Only include original sizes, not resized variants
            if (str_contains($basename, '-orig.webp')) {
                $images[] = [
                    'filename' => $basename,
                    'url' => '/images/cms/' . $basename,
                    'size' => filesize($file),
                    'modified' => date('Y-m-d H:i:s', filemtime($file)),
                ];
            }
        }
        
        jsonResponse(['success' => true, 'images' => $images]);
        break;
        
    case 'list-backups':
        requireAuth();
        $file = $_GET['file'] ?? '';
        
        if (!validateFilename($file)) {
            jsonResponse(['success' => false, 'error' => 'Invalid filename'], 400);
        }
        
        $pattern = CONTENT_DIR . $file . '-*.backup.json';
        $backups = glob($pattern);
        
        $list = [];
        foreach ($backups as $backup) {
            $list[] = [
                'filename' => basename($backup),
                'date' => date('Y-m-d H:i:s', filemtime($backup)),
                'size' => filesize($backup),
            ];
        }
        
        usort($list, fn($a, $b) => strcmp($b['date'], $a['date']));
        
        jsonResponse(['success' => true, 'backups' => $list]);
        break;
        
    default:
        jsonResponse(['success' => false, 'error' => 'Unknown action'], 400);
}
