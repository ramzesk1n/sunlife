<?php
/**
 * Sunlife CMS - Multi-user flat-file content management
 * PHP 8.3+ required
 */

// Configuration
const CONTENT_DIR = __DIR__ . '/../../content/';
const IMAGES_DIR = __DIR__ . '/../../images/cms/';
const USERS_FILE = __DIR__ . '/../users.json';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const IMAGE_SIZES = [400, 800, 1200, 1600];

// Permission flags
const PERM_PRICING = 'pricing';
const PERM_FAQ = 'faq';
const PERM_GALLERY = 'gallery';
const PERM_BENEFITS = 'benefits';
const PERM_REVIEWS = 'reviews';
const PERM_STEPS = 'steps';
const PERM_GEOGRAPHY = 'geography';
const PERM_PARTNERSHIP = 'partnership';
const PERM_META = 'meta';
const PERM_USERS = 'users'; // Admin only

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

function getUsers(): array {
    if (!file_exists(USERS_FILE)) {
        return [];
    }
    $content = file_get_contents(USERS_FILE);
    $users = json_decode($content, true);
    return is_array($users) ? $users : [];
}

function saveUsers(array $users): bool {
    $json = json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($json === false) return false;
    return file_put_contents(USERS_FILE, $json, LOCK_EX) !== false;
}

function getCurrentUser(): ?array {
    if (empty($_SESSION['user_id'])) return null;
    $users = getUsers();
    return $users[$_SESSION['user_id']] ?? null;
}

function requireAuth(): void {
    $user = getCurrentUser();
    if (!$user) {
        jsonResponse(['success' => false, 'error' => 'Unauthorized'], 401);
    }
}

function requireAdmin(): void {
    $user = getCurrentUser();
    if (!$user || $user['role'] !== 'admin') {
        jsonResponse(['success' => false, 'error' => 'Admin access required'], 403);
    }
}

function hasPermission(string $permission): bool {
    $user = getCurrentUser();
    if (!$user) return false;
    if ($user['role'] === 'admin') return true;
    return in_array($permission, $user['permissions'] ?? [], true);
}

function requirePermission(string $permission): void {
    if (!hasPermission($permission)) {
        jsonResponse(['success' => false, 'error' => 'Permission denied: ' . $permission], 403);
    }
}

function validateFilename(string $filename): bool {
    return preg_match('/^[a-zA-Z0-9_-]+$/', $filename) === 1;
}

// Image optimization with GD
function optimizeImage(string $sourcePath, string $filename, string $ext): array {
    if (!is_dir(IMAGES_DIR)) {
        mkdir(IMAGES_DIR, 0755, true);
    }

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
            continue;
        }

        $ratio = min($maxSize / $origWidth, $maxSize / $origHeight);
        $newWidth = (int)($origWidth * $ratio);
        $newHeight = (int)($origHeight * $ratio);

        $resized = imagecreatetruecolor($newWidth, $newHeight);

        if ($ext === 'png') {
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
        }

        imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

        $webpPath = IMAGES_DIR . $baseName . '-' . $maxSize . '.webp';
        imagewebp($resized, $webpPath, 85);
        imagedestroy($resized);

        $srcset[] = '/images/cms/' . $baseName . '-' . $maxSize . '.webp ' . $maxSize . 'w';
        $sizes[] = $maxSize;
    }

    $origWebpPath = IMAGES_DIR . $baseName . '-orig.webp';
    imagewebp($source, $origWebpPath, 85);
    $srcset[] = '/images/cms/' . $baseName . '-orig.webp ' . $origWidth . 'w';

    imagedestroy($source);
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
        $login = trim($input['login'] ?? '');
        $password = $input['password'] ?? '';

        if (!$login || !$password) {
            jsonResponse(['success' => false, 'error' => 'Login and password required'], 401);
        }

        $users = getUsers();
        $user = $users[$login] ?? null;

        if (!$user || !password_verify($password, $user['password_hash'])) {
            jsonResponse(['success' => false, 'error' => 'Invalid login or password'], 401);
        }

        $_SESSION['user_id'] = $login;
        $_SESSION['login_time'] = time();

        jsonResponse([
            'success' => true,
            'user' => [
                'login' => $login,
                'name' => $user['name'],
                'role' => $user['role'],
                'permissions' => $user['permissions'] ?? [],
            ],
        ]);
        break;

    case 'logout':
        session_destroy();
        jsonResponse(['success' => true]);
        break;

    case 'check':
        $user = getCurrentUser();
        jsonResponse([
            'success' => true,
            'logged_in' => $user !== null,
            'user' => $user ? [
                'login' => $_SESSION['user_id'],
                'name' => $user['name'],
                'role' => $user['role'],
                'permissions' => $user['permissions'] ?? [],
            ] : null,
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

        // Check permission based on file
        $permissionMap = [
            'pricing' => PERM_PRICING,
            'faq' => PERM_FAQ,
            'gallery' => PERM_GALLERY,
            'benefits' => PERM_BENEFITS,
            'reviews' => PERM_REVIEWS,
            'steps' => PERM_STEPS,
            'geography' => PERM_GEOGRAPHY,
            'partnership' => PERM_PARTNERSHIP,
            'meta' => PERM_META,
        ];

        if (isset($permissionMap[$file])) {
            requirePermission($permissionMap[$file]);
        }

        $path = CONTENT_DIR . $file . '.json';

        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        if ($json === false) {
            jsonResponse(['success' => false, 'error' => 'Invalid JSON data'], 400);
        }

        // Create backup
        if (file_exists($path)) {
            $backupPath = CONTENT_DIR . $file . '-' . date('Y-m-d-His') . '.backup.json';
            copy($path, $backupPath);

            $backups = glob(CONTENT_DIR . $file . '-*.backup.json');
            if (count($backups) > 10) {
                usort($backups, fn($a, $b) => filemtime($a) <=> filemtime($b));
                foreach (array_slice($backups, 0, count($backups) - 10) as $old) {
                    unlink($old);
                }
            }
        }

        if (file_put_contents($path, $json, LOCK_EX) === false) {
            jsonResponse(['success' => false, 'error' => 'Failed to write file'], 500);
        }

        jsonResponse(['success' => true, 'file' => $file]);
        break;

    case 'upload':
        requireAuth();
        requirePermission(PERM_GALLERY);

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
        requirePermission(PERM_GALLERY);

        if (!is_dir(IMAGES_DIR)) {
            jsonResponse(['success' => true, 'images' => []]);
        }

        $images = [];
        $files = glob(IMAGES_DIR . '*.webp');

        foreach ($files as $file) {
            $basename = basename($file);
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

    // === USER MANAGEMENT (Admin only) ===
    case 'users-list':
        requireAdmin();
        $users = getUsers();
        $list = [];
        foreach ($users as $login => $user) {
            $list[] = [
                'login' => $login,
                'name' => $user['name'],
                'role' => $user['role'],
                'permissions' => $user['permissions'] ?? [],
            ];
        }
        jsonResponse(['success' => true, 'users' => $list]);
        break;

    case 'user-create':
        requireAdmin();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $login = trim($input['login'] ?? '');
        $name = trim($input['name'] ?? '');
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'editor';
        $permissions = $input['permissions'] ?? [];

        if (!$login || !$name || !$password) {
            jsonResponse(['success' => false, 'error' => 'Login, name and password required'], 400);
        }

        if (!preg_match('/^[a-zA-Z0-9_-]+$/', $login)) {
            jsonResponse(['success' => false, 'error' => 'Invalid login format'], 400);
        }

        $users = getUsers();
        if (isset($users[$login])) {
            jsonResponse(['success' => false, 'error' => 'User already exists'], 400);
        }

        $users[$login] = [
            'name' => $name,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            'role' => $role,
            'permissions' => $permissions,
        ];

        if (!saveUsers($users)) {
            jsonResponse(['success' => false, 'error' => 'Failed to save user'], 500);
        }

        jsonResponse(['success' => true, 'user' => ['login' => $login, 'name' => $name, 'role' => $role]]);
        break;

    case 'user-update':
        requireAdmin();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $login = trim($input['login'] ?? '');
        $name = trim($input['name'] ?? '');
        $password = $input['password'] ?? null;
        $role = $input['role'] ?? null;
        $permissions = $input['permissions'] ?? null;

        $users = getUsers();
        if (!isset($users[$login])) {
            jsonResponse(['success' => false, 'error' => 'User not found'], 404);
        }

        if ($name) $users[$login]['name'] = $name;
        if ($password) $users[$login]['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
        if ($role) $users[$login]['role'] = $role;
        if ($permissions !== null) $users[$login]['permissions'] = $permissions;

        if (!saveUsers($users)) {
            jsonResponse(['success' => false, 'error' => 'Failed to save user'], 500);
        }

        jsonResponse(['success' => true]);
        break;

    case 'user-delete':
        requireAdmin();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $login = trim($input['login'] ?? '');

        $users = getUsers();
        if (!isset($users[$login])) {
            jsonResponse(['success' => false, 'error' => 'User not found'], 404);
        }

        unset($users[$login]);

        if (!saveUsers($users)) {
            jsonResponse(['success' => false, 'error' => 'Failed to save users'], 500);
        }

        jsonResponse(['success' => true]);
        break;

    default:
        jsonResponse(['success' => false, 'error' => 'Unknown action'], 400);
}
