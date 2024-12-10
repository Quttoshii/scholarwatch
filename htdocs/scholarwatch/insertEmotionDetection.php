<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); // Allow requests from React app's origin
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Specify allowed request methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Specify allowed headers
header("Content-Type: application/json");
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['awake_time']) && isset($data['drowsy_time'])) {
    $awake_time = $data['awake_time'];
    $drowsy_time = $data['drowsy_time'];

    try {
        $stmt = $pdo->prepare("INSERT INTO attention (awake_time, drowsy_time) VALUES (:awake_time, :drowsy_time)");
        $stmt->execute(['awake_time' => $awake_time, 'drowsy_time' => $drowsy_time]);
        echo json_encode(["success" => true, "message" => "Values added successfully"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
}