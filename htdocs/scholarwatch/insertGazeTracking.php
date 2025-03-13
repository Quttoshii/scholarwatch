<?php
// Allow requests from any origin (or specify 'http://localhost:3000' for more security)
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization"); 
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'includes/db.php'; // Ensure this file is correct

// Read and decode JSON data
$data = json_decode(file_get_contents("php://input"), true);

// Debugging log
file_put_contents("debug_log.txt", "Raw Input: " . file_get_contents("php://input") . "\nDecoded Data: " . print_r($data, true), FILE_APPEND);

// Hardcoded session ID
$sessionID = "12345"; // Change this value as needed

// Validate required fields
if (empty($data['FocusTime']) || empty($data['UnfocusTime'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields", "received_data" => $data]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO GazeTracking (SessionID, FocusTime, UnfocusTime, CreatedAt) 
        VALUES (?, ?, ?, NOW())
    ");

    $stmt->execute([
        $sessionID, // Use hardcoded session ID
        $data['FocusTime'],
        $data['UnfocusTime']
    ]);

    echo json_encode(["success" => true, "message" => "Data inserted successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
}
?>