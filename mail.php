<?php
// Mail.php – bezpieczny formularz (wersja poprawiona)

// Wyłącz wyświetlanie błędów (prod)
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// --------------------
// Bezpieczne cookie dla sesji
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443);
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => $_SERVER['HTTP_HOST'] ?? '',
    'secure'   => $secure,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

// --------------------
// Autoload Composer (nie ujawniamy ścieżek użytkownikowi)
$autoloadPath = __DIR__ . '/../../../vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    error_log('Autoload not found: ' . $autoloadPath);
    http_response_code(500);
    exit;
}
require $autoloadPath;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

// --------------------
// Wczytanie .env (zabezpieczone)
$dotenvPath = __DIR__ . '/../../..';
if (!file_exists($dotenvPath . '/.env')) {
    error_log('.env not found in: ' . $dotenvPath);
    http_response_code(500);
    exit;
}
$dotenv = Dotenv::createImmutable($dotenvPath);
$dotenv->load();

// --------------------
// tylko POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// Wykrycie AJAX (klient oczekuje JSON)
$isAjax = isset($_SERVER['HTTP_ACCEPT'])
    && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

// --------------------
// Prosty honeypot (pole 'website' powinno być puste)
$honeypot = trim($_POST['website'] ?? '');
if ($honeypot !== '') {
    if ($isAjax) {
        http_response_code(400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['status' => 'error', 'message' => 'Invalid submission.']);
    } else {
        header('Location: /index.html?mail_status=error');
    }
    exit;
}

// --------------------
// Rate limit (sesja) – prosty mechanizm
if (isset($_SESSION['last_mail']) && time() - $_SESSION['last_mail'] < 30) {
    if ($isAjax) {
        http_response_code(429);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['status' => 'error', 'message' => 'Too many requests. Please wait.']);
    } else {
        die("Proszę odczekać chwilę przed kolejnym wysłaniem wiadomości.");
    }
    exit;
}
$_SESSION['last_mail'] = time();

// --------------------
// Sanitizacja (UTF-8 safe)
mb_internal_encoding('UTF-8');
$name    = mb_substr(strip_tags(trim($_POST['name'] ?? '')), 0, 100, 'UTF-8');
$from    = substr(filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL), 0, 150);
$message = mb_substr(trim($_POST['message'] ?? ''), 0, 2000, 'UTF-8');

// Walidacja email
if (!filter_var($from, FILTER_VALIDATE_EMAIL)) {
    if ($isAjax) {
        http_response_code(400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['status' => 'error', 'message' => 'Invalid email address.']);
    } else {
        header('Location: /index.html?mail_status=invalid_email');
    }
    exit;
}

// Ochrona przed header injection w polach nagłówkowych
if (preg_match('/[\r\n]/', $name . $from)) {
    http_response_code(400);
    exit;
}

// --------------------
// Sprawdź wymagane zmienne środowiskowe
$requiredEnv = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_PORT', 'FROM_EMAIL', 'TO_EMAIL'];
foreach ($requiredEnv as $key) {
    if (empty($_ENV[$key])) {
        error_log("Missing env var: $key");
        http_response_code(500);
        exit;
    }
}

// --------------------
// Konfiguracja i wysyłka PHPMailer
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USER'];
    $mail->Password   = $_ENV['SMTP_PASS'];
    // Port jako int
    $mail->Port       = (int) ($_ENV['SMTP_PORT'] ?? 587);
    // STARTTLS domyślnie
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

    // Nadawca / odbiorca / reply-to
    $mail->setFrom($_ENV['FROM_EMAIL'], 'Formularz — the4thone.com');
    $mail->addAddress($_ENV['TO_EMAIL']);
    $mail->addReplyTo($from, $name);

    // Kodowanie
    $mail->CharSet  = 'UTF-8';
    $mail->Encoding = 'base64';

    // Treść (plain)
    $mail->isHTML(false);
    $mail->Subject = 'Wiadomość z formularza na stronie the4thone.com';
    $mail->Body    = "Imię: $name\r\nEmail: $from\r\n\r\nWiadomość:\r\n$message";

    $mail->send();

    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['status' => 'sent']);
    } else {
        header('Location: /index.html?mail_status=sent');
    }
    exit;

} catch (Exception $e) {
    // Logujemy pełny błąd tylko po stronie serwera (log poza public_html zalecany)
    error_log(date('[Y-m-d H:i:s] ') . $e->getMessage() . ' | PHPMailer: ' . $mail->ErrorInfo . PHP_EOL, 3, __DIR__ . '/mail_errors.log');

    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8', true, 500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Wystąpił błąd przy wysyłce wiadomości.'
        ]);
    } else {
        header('Location: /index.html?mail_status=error');
    }
    exit;
}
