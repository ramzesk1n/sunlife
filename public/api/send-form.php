<?php
/**
 * Form handler - sends to Telegram Bot and email (independent channels)
 * POST /api/send-form.php
 *
 * Channels:
 *   - Telegram: direct or via TG_PROXY (socks5h/http) with direct fallback
 *   - Email: SMTP (PHPMailer) when SMTP_HOST configured, else mail()
 * Success = at least one channel delivered.
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
const DAILY_LIMIT = 10;
const MIN_FILL_MS = 3000; // submissions faster than 3s are bots

// Rate limiting: 60s between submissions + daily cap per IP
function checkRateLimit(): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $now = time();
    $today = date('Y-m-d');

    $data = [];
    if (file_exists(RATE_LIMIT_FILE)) {
        $content = file_get_contents(RATE_LIMIT_FILE);
        $data = json_decode($content, true) ?: [];
    }

    // Cleanup stale entries (older than 24h)
    foreach ($data as $key => $entry) {
        $last = is_array($entry) ? ($entry['last'] ?? 0) : $entry;
        if ($now - $last > 86400) {
            unset($data[$key]);
        }
    }

    $entry = $data[$ip] ?? null;
    // Backward compat: plain timestamp
    if (!is_array($entry)) {
        $entry = ['last' => (int) $entry, 'count' => 0, 'day' => $today];
    }
    if (($entry['day'] ?? '') !== $today) {
        $entry = ['last' => 0, 'count' => 0, 'day' => $today];
    }

    if (($now - $entry['last']) < RATE_LIMIT_SECONDS) {
        return false;
    }
    if ($entry['count'] >= DAILY_LIMIT) {
        return false;
    }

    $entry['last'] = $now;
    $entry['count']++;
    $data[$ip] = $entry;
    file_put_contents(RATE_LIMIT_FILE, json_encode($data), LOCK_EX);

    return true;
}

// Honeypot check - works with both JSON and form data
function checkHoneypot(array $input): bool {
    return empty($input['website'] ?? '');
}

// Time-trap: legit users need a few seconds to fill the form
function checkTimeTrap(array $input): bool {
    $startedAt = (int) ($input['startedAt'] ?? 0);
    if ($startedAt <= 0) {
        return true; // field absent (old cached JS) - skip check
    }
    $elapsed = (int) (microtime(true) * 1000) - $startedAt;
    return $elapsed >= MIN_FILL_MS;
}

// Validate phone
function validatePhone(string $phone): bool {
    $cleaned = preg_replace('/[^\d+]/', '', $phone);
    return strlen($cleaned) >= 10 && strlen($cleaned) <= 15;
}

// Reject URLs in fields where they never belong (typical spam)
function containsUrl(string $value): bool {
    return (bool) preg_match('~https?://|www\.~i', $value);
}

// === Channel: Telegram (proxy with direct fallback) ===

function telegramRequest(string $url, array $postData, string $proxy): array {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    if ($proxy !== '') {
        curl_setopt($ch, CURLOPT_PROXY, $proxy);
        if (stripos($proxy, 'socks5') === 0) {
            // socks5h: DNS resolved on the proxy side (bypasses local DNS blocks)
            curl_setopt($ch, CURLOPT_PROXYTYPE, CURLPROXY_SOCKS5_HOSTNAME);
        }
    }
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    return [$response, $httpCode, $curlError];
}

function sendTelegram(string $message): bool {
    if (!defined('BOT_TOKEN') || !defined('CHAT_ID') || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
        error_log('Telegram: BOT_TOKEN/CHAT_ID not configured');
        return false;
    }

    $url = 'https://api.telegram.org/bot' . BOT_TOKEN . '/sendMessage';
    $postData = [
        'chat_id' => CHAT_ID,
        'text' => $message,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => true,
    ];

    $proxy = defined('TG_PROXY') ? TG_PROXY : '';
    $attempts = $proxy !== '' ? [$proxy, ''] : [''];

    foreach ($attempts as $currentProxy) {
        [$response, $httpCode, $curlError] = telegramRequest($url, $postData, $currentProxy);
        $via = $currentProxy !== '' ? 'via proxy' : 'direct';

        if ($curlError || $httpCode !== 200) {
            error_log("Telegram connection ($via): " . ($curlError ?: "HTTP $httpCode"));
            continue;
        }

        $tgResponse = json_decode($response, true);
        if (!empty($tgResponse['ok'])) {
            return true;
        }
        error_log("Telegram API ($via): " . ($tgResponse['description'] ?? 'unknown'));
    }

    return false;
}

// === Channel: Email (SMTP via PHPMailer, mail() fallback) ===

function sendEmail(string $subject, string $body): bool {
    $to = defined('NOTIFY_EMAIL') ? NOTIFY_EMAIL : '89279611561@mail.ru';

    if (defined('SMTP_HOST') && SMTP_HOST !== '') {
        require_once __DIR__ . '/lib/phpmailer/Exception.php';
        require_once __DIR__ . '/lib/phpmailer/PHPMailer.php';
        require_once __DIR__ . '/lib/phpmailer/SMTP.php';

        try {
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = SMTP_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = SMTP_USER;
            $mail->Password = SMTP_PASS;
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port = defined('SMTP_PORT') ? SMTP_PORT : 465;
            $mail->Timeout = 10;
            $mail->CharSet = 'UTF-8';
            $mail->setFrom(SMTP_USER, 'Сайт САН ЛАЙФ');
            $mail->addAddress($to);
            $mail->Subject = $subject;
            $mail->Body = $body;
            $mail->send();
            return true;
        } catch (Throwable $e) {
            error_log('SMTP error: ' . $e->getMessage());
            return false;
        }
    }

    // Fallback: plain mail()
    $headers = implode("\r\n", [
        'From: noreply@sunlife-photo.ru',
        'Content-Type: text/plain; charset=utf-8',
    ]);
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    if (!@mail($to, $encodedSubject, $body, $headers)) {
        error_log('Mail error: could not send to ' . $to);
        return false;
    }
    return true;
}

// === Main handler ===

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

if (!checkHoneypot($input) || !checkTimeTrap($input)) {
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
if (mb_strlen($name) < 2 || mb_strlen($name) > 60 || !preg_match('/[A-Za-zА-Яа-яЁё]/u', $name)) {
    $errors[] = 'Имя должно быть от 2 до 60 символов и содержать буквы';
}
if (containsUrl($name) || containsUrl($hospital)) {
    $errors[] = 'Ссылки в полях имени и роддома недопустимы';
}
if (empty($phone) || !validatePhone($phone)) {
    $errors[] = 'Введите корректный номер телефона';
}
if (mb_strlen($hospital) > 120 || mb_strlen($volume) > 120) {
    $errors[] = 'Слишком длинное значение поля';
}
if ($email !== '' && (mb_strlen($email) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL))) {
    $errors[] = 'Введите корректный email';
}
if (mb_strlen($messageText) > 2000) {
    $errors[] = 'Слишком длинное сообщение';
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
$methodLabels = ['telegram' => 'Telegram', 'whatsapp' => 'WhatsApp', 'max' => 'Max', 'phone' => 'Телефон'];

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
    $emailSubject = 'Новая заявка на партнёрство — sunlife-photo.ru';
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
    $emailSubject = 'Новая заявка с сайта — sunlife-photo.ru';
}

$message .= "\n🕐 <i>" . date('d.m.Y H:i:s') . "</i>\n";
$message .= "🌐 <i>sunlife-photo.ru</i>";

// Send via both channels independently
$telegramOk = sendTelegram($message);
$emailOk = sendEmail($emailSubject, strip_tags($message));

if (!$telegramOk && !$emailOk) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Ошибка отправки. Попробуйте позже или позвоните нам.']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.',
    'channels' => ['telegram' => $telegramOk, 'email' => $emailOk],
]);
