<?php
// ==========================
// Mail.php – bezpieczny formularz
// ==========================

// Pokazywanie błędów w debugowaniu (wyłącz na produkcji!)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start sesji do limitowania wysyłek
session_start();

// ==========================
// Autoload Composer
// ==========================
$autoloadPath = __DIR__ . '/../../../vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    die("Błąd: brak pliku autoload.php w $autoloadPath");
}
require $autoloadPath;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

// ==========================
// Wczytanie .env
// ==========================
$dotenvPath = __DIR__ . '/../../..'; // katalog z .env (poza public_html)
if (!file_exists($dotenvPath . '/.env')) {
    die("Błąd: brak pliku .env w $dotenvPath");
}
$dotenv = Dotenv::createImmutable($dotenvPath);
$dotenv->load();

// ==========================
// Sprawdzenie metody POST
// ==========================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// ==========================
// Limit wysyłki (co 30 sekund)
// ==========================
if (isset($_SESSION['last_mail']) && time() - $_SESSION['last_mail'] < 30) {
    die("Proszę odczekać chwilę przed kolejnym wysłaniem wiadomości.");
}
$_SESSION['last_mail'] = time();

// ==========================
// Sanitizacja i walidacja danych
// ==========================
$name    = substr(strip_tags(trim($_POST['name'] ?? '')), 0, 100);
$from    = substr(filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL), 0, 150);
$message = substr(trim($_POST['msg'] ?? ''), 0, 2000);

// Walidacja email
if (!filter_var($from, FILTER_VALIDATE_EMAIL)) {
    header('Location: /index.html?mail_status=invalid_email');
    exit;
}

// Ochrona przed header injection
if (preg_match('/[\r\n]/', $name . $from)) {
    die("Błąd: niedozwolone znaki w polach.");
}

// ==========================
// Konfiguracja PHPMailer
// ==========================
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USER'];
    $mail->Password   = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $_ENV['SMTP_PORT'];

    // Dane nadawcy i odbiorcy
    $mail->setFrom($_ENV['FROM_EMAIL'], 'Formularz — the4thone.com');
    $mail->addAddress($_ENV['TO_EMAIL']);
    $mail->addReplyTo($from, $name);

    // Kodowanie UTF-8
    $mail->CharSet  = 'UTF-8';
    $mail->Encoding = 'base64';

    // Treść wiadomości (plain text)
    $mail->isHTML(false);
    $mail->Subject = 'Wiadomość z formularza na stronie the4thone.com';
    $mail->Body    = "Imię: $name\r\nEmail: $from\r\n\r\nWiadomość:\r\n$message";

    $mail->send();

    header('Location: /index.html?mail_status=sent');

} catch (Exception $e) {
    // Logowanie błędów do pliku
    error_log(date('[Y-m-d H:i:s] ') . $mail->ErrorInfo . PHP_EOL, 3, __DIR__ . '/mail_errors.log');
    header('Location: /index.html?mail_status=error');
}
