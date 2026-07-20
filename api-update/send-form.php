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

// Proxy management
const PROXY_CACHE_FILE = __DIR__ . '/../.proxy_cache.json';
const PROXY_CACHE_TTL = 1800;        // re-race proxies every 30 min
const PROXY_CHECK_TIMEOUT = 6;       // getMe race timeout per candidate
const PROXY_NOTIFY_THROTTLE = 21600; // max 1 "proxy down" email per 6h per proxy

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

// === Channel: Telegram (proxy pool with health checks + notifications) ===

// All configured proxies (TG_PROXIES array + legacy TG_PROXY string)
function proxyCandidates(): array {
    $list = [];
    if (defined('TG_PROXIES') && is_array(TG_PROXIES)) {
        $list = TG_PROXIES;
    }
    if (defined('TG_PROXY') && TG_PROXY !== '') {
        array_unshift($list, TG_PROXY);
    }
    return array_values(array_unique(array_filter($list, 'is_string')));
}

function loadProxyCache(): array {
    if (file_exists(PROXY_CACHE_FILE)) {
        $data = json_decode(file_get_contents(PROXY_CACHE_FILE), true);
        if (is_array($data)) {
            return $data + ['checked_at' => 0, 'fails' => []];
        }
    }
    return ['checked_at' => 0, 'fails' => []];
}

function saveProxyCache(array $cache): void {
    file_put_contents(PROXY_CACHE_FILE, json_encode($cache), LOCK_EX);
}

function applyProxy($ch, string $proxy): void {
    if ($proxy === '') {
        return;
    }
    curl_setopt($ch, CURLOPT_PROXY, $proxy);
    if (stripos($proxy, 'socks5') === 0) {
        // socks5h: DNS resolved on the proxy side (bypasses local DNS blocks)
        curl_setopt($ch, CURLOPT_PROXYTYPE, CURLPROXY_SOCKS5_HOSTNAME);
    }
}

// Race a harmless getMe through all proxies + direct connection.
// The first candidate to answer ok=true is the fastest working one.
// Returns ['winner' => string|null ('' = direct, null = all failed), 'failed' => string[]]
function raceProxies(array $candidates, string $getMeUrl): array {
    $all = array_merge($candidates, ['']); // '' = direct
    $mh = curl_multi_init();
    $handles = [];

    foreach ($all as $proxy) {
        $ch = curl_init($getMeUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, PROXY_CHECK_TIMEOUT);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, PROXY_CHECK_TIMEOUT);
        applyProxy($ch, $proxy);
        curl_multi_add_handle($mh, $ch);
        $handles[(int) $ch] = $proxy;
    }

    $winner = null;
    $failed = [];

    do {
        curl_multi_exec($mh, $running);
        if ($running > 0) {
            curl_multi_select($mh, 1.0);
        }
        while ($info = curl_multi_info_read($mh)) {
            $ch = $info['handle'];
            $proxy = $handles[(int) $ch];
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err = curl_error($ch);
            $ok = false;
            if (!$err && $code === 200) {
                $body = json_decode(curl_multi_getcontent($ch), true);
                $ok = !empty($body['ok']);
            }
            if ($ok) {
                // First ok answer = fastest working candidate; abort the rest
                $winner = $proxy;
                break 2;
            }
            $failed[] = $proxy;
        }
    } while ($running > 0);

    foreach ($handles as $ch => $_) {
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
    }
    curl_multi_close($mh);

    // If loop ended without winner, everything not yet finished also counts as failed
    if ($winner === null) {
        foreach ($all as $proxy) {
            if (!in_array($proxy, $failed, true)) {
                $failed[] = $proxy;
            }
        }
    }

    return ['winner' => $winner, 'failed' => $failed];
}

// Record proxy failures and email a throttled notification about each
function recordProxyFailures(array $cache, array $failed, ?string $winner): array {
    $now = time();
    $via = $winner === null ? 'НЕТ рабочих вариантов!' : ($winner === '' ? 'прямое соединение' : $winner);

    foreach ($failed as $proxy) {
        $key = $proxy === '' ? 'direct' : $proxy;
        $prev = $cache['fails'][$key] ?? ['count' => 0, 'last_notify' => 0];
        $prev['count']++;

        if ($now - ($prev['last_notify'] ?? 0) > PROXY_NOTIFY_THROTTLE) {
            sendEmail(
                '⚠️ Прокси Telegram недоступен — sunlife-photo.ru',
                "Вариант не отвечает: {$key}\n\nРабочий вариант сейчас: {$via}\nВремя: " . date('d.m.Y H:i:s') . "\n\nЭто автоматическое уведомление обработчика заявок."
            );
            $prev['last_notify'] = $now;
        }
        $cache['fails'][$key] = $prev;
    }
    return $cache;
}

function telegramSend(string $url, array $postData, string $proxy): bool {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    applyProxy($ch, $proxy);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    $via = $proxy !== '' ? "proxy $proxy" : 'direct';
    if ($curlError || $httpCode !== 200) {
        error_log("Telegram connection ($via): " . ($curlError ?: "HTTP $httpCode"));
        return false;
    }
    $tgResponse = json_decode($response, true);
    if (!empty($tgResponse['ok'])) {
        return true;
    }
    error_log("Telegram API ($via): " . ($tgResponse['description'] ?? 'unknown'));
    return false;
}

function sendTelegram(string $message): bool {
    if (!defined('BOT_TOKEN') || !defined('CHAT_ID') || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
        error_log('Telegram: BOT_TOKEN/CHAT_ID not configured');
        return false;
    }

    $base = 'https://api.telegram.org/bot' . BOT_TOKEN;
    $postData = [
        'chat_id' => CHAT_ID,
        'text' => $message,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => true,
    ];

    $candidates = proxyCandidates();
    $cache = loadProxyCache();
    $now = time();

    // No proxies configured -> just send directly
    if (empty($candidates)) {
        return telegramSend($base . '/sendMessage', $postData, '');
    }

    // Periodic health check: race getMe through all candidates
    $needCheck = ($now - ($cache['checked_at'] ?? 0) > PROXY_CACHE_TTL) || !array_key_exists('winner', $cache);
    if ($needCheck) {
        $race = raceProxies($candidates, $base . '/getMe');
        $cache['winner'] = $race['winner'];
        $cache['checked_at'] = $now;
        $cache = recordProxyFailures($cache, $race['failed'], $race['winner']);
        saveProxyCache($cache);
    }

    // Ordered attempts: cached winner first, then the rest, direct last
    $winner = $cache['winner'] ?? null;
    $attempts = [];
    if ($winner !== null) {
        $attempts[] = $winner;
    }
    foreach ($candidates as $c) {
        if (!in_array($c, $attempts, true)) {
            $attempts[] = $c;
        }
    }
    if (!in_array('', $attempts, true)) {
        $attempts[] = '';
    }

    $rechecked = false;
    $i = 0;
    while ($i < count($attempts)) {
        $proxy = $attempts[$i];

        if (telegramSend($base . '/sendMessage', $postData, $proxy)) {
            // Winner changed? Persist for the next requests
            if ($proxy !== ($cache['winner'] ?? null)) {
                $cache['winner'] = $proxy;
                saveProxyCache($cache);
            }
            return true;
        }

        $cache = recordProxyFailures($cache, [$proxy], $cache['winner'] ?? null);
        saveProxyCache($cache);

        // The cached winner just failed: re-race once and retry with fresh winner
        if (!$rechecked && $proxy === $winner) {
            $rechecked = true;
            $race = raceProxies($candidates, $base . '/getMe');
            $cache['winner'] = $race['winner'];
            $cache['checked_at'] = time();
            $cache = recordProxyFailures($cache, $race['failed'], $race['winner']);
            saveProxyCache($cache);
            if ($race['winner'] !== null && !in_array($race['winner'], $attempts, true)) {
                $attempts[] = $race['winner'];
            } elseif ($race['winner'] !== null) {
                // Move fresh winner next in line
                $attempts = array_merge([$race['winner']], array_values(array_diff($attempts, [$race['winner'], $proxy])));
                $i = 0;
                continue;
            }
        }
        $i++;
    }

    // Everything failed — notify once per throttle window
    $cache = recordProxyFailures($cache, ['all-telegram-down'], null);
    saveProxyCache($cache);
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
