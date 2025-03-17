<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

include 'includes/db.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Read and decode JSON data
$data = json_decode(file_get_contents("php://input"), true);

// Debugging log
file_put_contents("debug_log.txt", "Raw Input: " . file_get_contents("php://input") . "\nDecoded Data: " . print_r($data, true), FILE_APPEND);

// Hardcoded Session ID
$sessionID = "HARDCODED_SESSION_123";

// Validate required fields
if (!isset($data['FocusTime']) || !isset($data['UnfocusTime'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields", "received_data" => $data]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO GazeTracking (SessionID, FocusTime, UnfocusTime, CreatedAt) 
        VALUES (?, ?, ?, NOW())
    ");

    $stmt->execute([
        $sessionID,  // Always use the hardcoded session ID
        $data['FocusTime'],
        $data['UnfocusTime']
    ]);

    echo json_encode(["success" => true, "message" => "Data inserted successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}
?>
