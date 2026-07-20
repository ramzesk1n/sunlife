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
// Empty string = direct connection (with direct retry after proxy failure).
const TG_PROXY = '';

// SMTP for form notifications (empty SMTP_HOST = fallback to PHP mail()).
// For mail.ru use smtp.mail.ru:465 and an APP password
// (mail.ru → Настройки → Безопасность → Пароли для внешних приложений).
const SMTP_HOST = '';
const SMTP_PORT = 465;
const SMTP_USER = '';
const SMTP_PASS = '';

// Form submissions are also emailed to this address
const NOTIFY_EMAIL = '89279611561@mail.ru';
