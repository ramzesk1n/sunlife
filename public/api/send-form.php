<?php
/**
 * Form handler - sends to Telegram Bot
 * POST /api/send-form.php
 */

// CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Config - load from local config file
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
} else {
    require_once __DIR__ . '/config.example.php';
}

const RATE_LIMIT_FILE = __DIR__ . '/../.rate_limit.json';
const RATE_LIMIT_SECONDS = 60;

// Rate limiting
function checkRateLimit(): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $now = time();
    
    $data = [];
    if (file_exists(RATE_LIMIT_FILE)) {
        $content = file_get_contents(RATE_LIMIT_FILE);
        $data = json_decode($content, true) ?: [];
    }
    
    foreach ($data as $key => $timestamp) {
        if ($now - $timestamp > RATE_LIMIT_SECONDS * 2) {
            unset($data[$key]);
        }
    }
    
    if (isset($data[$ip]) && ($now - $data[$ip]) < RATE_LIMIT_SECONDS) {
        return false;
    }
    
    $data[$ip] = $now;
    file_put_contents(RATE_LIMIT_FILE, json_encode($data));
    
    return true;
}

// Honeypot check - works with both JSON and form data
function checkHoneypot(array $input): bool {
    return empty($input['website'] ?? '');
}

// Validate phone
function validatePhone(string $phone): bool {
    $cleaned = preg_replace('/[^\d+]/', '', $phone);
    return strlen($cleaned) >= 10 && strlen($cleaned) <= 15;
}

// Main handler
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

if (!checkRateLimit()) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Слишком много запросов. Попробуйте через минуту.']);
    exit;
}

// Parse input (JSON or form data)
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

if (!checkHoneypot($input)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Spam detected']);
    exit;
}

$name = trim($input['name'] ?? '');
$phone = trim($input['phone'] ?? '');
$contactMethod = $input['contactMethod'] ?? 'phone';
$hospital = trim($input['hospital'] ?? '');
$date = trim($input['date'] ?? '');
$package = trim($input['package'] ?? '');
$email = trim($input['email'] ?? '');
$volume = trim($input['volume'] ?? '');
$messageText = trim($input['message'] ?? '');
$formType = $input['formType'] ?? 'contact';
$consent = filter_var($input['consent'] ?? false, FILTER_VALIDATE_BOOLEAN);

// Validation
$errors = [];
if (empty($name) || strlen($name) < 2) {
    $errors[] = 'Имя должно быть не менее 2 символов';
}
if (empty($phone) || !validatePhone($phone)) {
    $errors[] = 'Введите корректный номер телефона';
}
if (!$consent) {
    $errors[] = 'Необходимо согласие на обработку данных';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// Format message
$methodLabels = ['telegram' => 'Telegram', 'whatsapp' => 'WhatsApp', 'phone' => 'Телефон'];

if ($formType === 'partnership') {
    $message = "🤝 <b>Новая заявка на партнёрство</b>\n\n";
    $message .= "👤 <b>ФИО:</b> " . htmlspecialchars($name) . "\n";
    $message .= "📞 <b>Телефон:</b> " . htmlspecialchars($phone) . "\n";
    if (!empty($email)) {
        $message .= "📧 <b>Email:</b> " . htmlspecialchars($email) . "\n";
    }
    $message .= "💬 <b>Способ связи:</b> " . ($methodLabels[$contactMethod] ?? $contactMethod) . "\n";
    if (!empty($hospital)) {
        $message .= "🏥 <b>Клиника:</b> " . htmlspecialchars($hospital) . "\n";
    }
    if (!empty($volume)) {
        $message .= "📊 <b>Объём:</b> " . htmlspecialchars($volume) . "\n";
    }
    if (!empty($messageText)) {
        $message .= "📝 <b>Сообщение:</b> " . htmlspecialchars($messageText) . "\n";
    }
} else {
    $message = "🔔 <b>Новая заявка с сайта САН ЛАЙФ</b>\n\n";
    $message .= "👤 <b>Имя:</b> " . htmlspecialchars($name) . "\n";
    $message .= "📞 <b>Телефон:</b> " . htmlspecialchars($phone) . "\n";
    $message .= "💬 <b>Способ связи:</b> " . ($methodLabels[$contactMethod] ?? $contactMethod) . "\n";

    if (!empty($hospital)) {
        $message .= "🏥 <b>Роддом:</b> " . htmlspecialchars($hospital) . "\n";
    }
    if (!empty($date)) {
        $message .= "📅 <b>Дата выписки:</b> " . htmlspecialchars($date) . "\n";
    }
    if (!empty($package)) {
        $message .= "📦 <b>Пакет:</b> " . htmlspecialchars($package) . "\n";
    }
}

$message .= "\n🕐 <i>" . date('d.m.Y H:i:s') . "</i>\n";
$message .= "🌐 <i>sunlife-photo.ru</i>";

// Send to Telegram
$telegramUrl = "https://api.telegram.org/bot" . BOT_TOKEN . "/sendMessage";
$postData = [
    'chat_id' => CHAT_ID,
    'text' => $message,
    'parse_mode' => 'HTML',
    'disable_web_page_preview' => true
];

$ch = curl_init($telegramUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError || $httpCode !== 200) {
    error_log('Telegram error: ' . ($curlError ?: "HTTP $httpCode"));
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Ошибка отправки. Попробуйте позже.']);
    exit;
}

$tgResponse = json_decode($response, true);
if (!$tgResponse['ok']) {
    error_log('Telegram API: ' . ($tgResponse['description'] ?? 'Unknown'));
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Ошибка отправки. Попробуйте позже.']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.'
]);
