<?php
$host = 'localhost:3306';
$db = 'scholarwatch';  // Database name
$user = 'new';     // Database username
$pass = 'root';     // Database password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "successfully connected to db!\n";
} catch (PDOException $e) {
    die("Could not connect to the database $db :" . $e->getMessage());
}