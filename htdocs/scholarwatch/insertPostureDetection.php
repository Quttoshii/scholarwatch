<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include __DIR__ . '/includes/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

// Get JSON data from request
$postData = file_get_contents("php://input");
$data = json_decode($postData, true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON data received"]);
    exit;
}

// Validate required fields
$requiredFields = ['SessionID', 'GoodPostureTime', 'SlouchingTime', 'LookingLeftTime', 'LookingRightTime', 'UsingPhoneTime'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field])) {
        echo json_encode(["status" => "error", "message" => "Missing field: $field"]);
        exit;
    }
}

try {
    // Prepare SQL statement
    $stmt = $pdo->prepare("
        INSERT INTO PostureDetection 
        (SessionID, GoodPostureTime, SlouchingTime, LookingLeftTime, LookingRightTime, UsingPhoneTime, CreatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");

    // Execute with user data
    $stmt->execute([
        
        $data['SessionID'],
        $data['GoodPostureTime'],
        $data['SlouchingTime'],
        $data['LookingLeftTime'],
        $data['LookingRightTime'],
        $data['UsingPhoneTime']
    ]);

    // Success response
    echo json_encode(["status" => "success", "message" => "Data inserted successfully"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}

?>
