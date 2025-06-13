<?php
$host = 'localhost';
$db = 'scholarwatch';  // Database name
$user = 'root';     // Database username
$pass = 'root';     // Database password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    //echo "successfully connected to db!\n";
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(["error" => "db_connection_failed", "message" => $e->getMessage()]);
    exit;
}