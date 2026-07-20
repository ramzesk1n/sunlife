<?php
/**
 * Bot configuration - DO NOT COMMIT
 * Copy this file to config.local.php and fill in real values
 */

// Get from @BotFather
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';

// Get by messaging @userinfobot or check bot's updates
const CHAT_ID = 'YOUR_CHAT_ID_HERE';

// Proxy for api.telegram.org (if the host can't reach it directly).
// Examples: 'socks5h://user:pass@host:port' or 'http://user:pass@host:port'
// Empty string = direct connection.
// TG_PROXIES: pool of proxies — every 30 min the handler races a getMe request
// through all of them + direct connection and uses the fastest working one.
// If a proxy stops answering, a throttled email alert goes to NOTIFY_EMAIL.
const TG_PROXY = '';
const TG_PROXIES = [
    // 'socks5h://user:pass@host1:port',
    // 'socks5h://user:pass@host2:port',
    // 'http://user:pass@host3:port',
];

// SMTP for form notifications (empty SMTP_HOST = fallback to PHP mail()).
// For mail.ru use smtp.mail.ru:465 and an APP password
// (mail.ru → Настройки → Безопасность → Пароли для внешних приложений).
const SMTP_HOST = '';
const SMTP_PORT = 465;
const SMTP_USER = '';
const SMTP_PASS = '';

// Form submissions are also emailed to this address
const NOTIFY_EMAIL = '89279611561@mail.ru';
