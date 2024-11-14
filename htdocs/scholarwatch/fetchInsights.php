<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); // Allow requests from React app's origin
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Specify allowed request methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Specify allowed headers
header("Content-Type: application/json");
include 'includes/db.php';

try {
    $response = [];

    // Retrieve total enrolled students
    $stmt = $pdo->query("SELECT COUNT(*) as total_students FROM user WHERE UserType = 'Student'");
    $response['total_students'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_students'];

    // Retrieve total uploaded lectures
    $stmt = $pdo->query("SELECT COUNT(*) as total_lectures FROM content");
    $response['total_lectures'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_lectures'];

    // Retrieve invalidation count (number of invalid quizzes)
    $stmt = $pdo->query("SELECT COUNT(*) as invalidations FROM quiz WHERE is_invalid = 1");
    $response['invalidation_count'] = $stmt->fetch(PDO::FETCH_ASSOC)['invalidations'];

    // Retrieve average attention and emotion times
    $stmt = $pdo->query("SELECT SUM(awake_time) as awake_time, SUM(drowsy_time) as drowsy_time FROM attention");
    $emotions = $stmt->fetch(PDO::FETCH_ASSOC);
    $response['emotions'] = [
        'awake_time' => $emotions['awake_time'],
        'drowsy_time' => $emotions['drowsy_time']
    ];

    $stmt = $pdo->query("SELECT SUM(focused_time) as focused_time, SUM(unfocused_time) as unfocused_time FROM attention");
    $attention = $stmt->fetch(PDO::FETCH_ASSOC);
    $response['attention'] = [
        'focused_time' => $attention['focused_time'],
        'unfocused_time' => $attention['unfocused_time']
    ];

    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}