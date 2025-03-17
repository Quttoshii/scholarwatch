<?php
// Handle preflight (OPTIONS) request for CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:3000"); // Allow requests from React app's origin
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Specify allowed request methods
    header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Specify allowed headers
    http_response_code(200); // Send a response with status code 200 (OK)
    exit; // Exit the script after handling preflight request
}

// Allow requests from React app
header("Access-Control-Allow-Origin: http://localhost:3000"); // Allow requests from React app
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Allow specific HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow specific headers
header("Content-Type: application/json"); // Set content type as JSON

include 'includes/db.php'; // Ensure your db.php has the correct PDO setup

// Assume userID is passed via query string like ?userID=123
$userID = isset($_GET['userID']) ? $_GET['userID'] : '';

if (!$userID) {
    echo json_encode(["error" => "No user ID provided"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT UserID, Name, Email, UserType, Status, Gender, Nationality, DOB, MobileNumber FROM user WHERE UserID = :userID");
    $stmt->bindParam(':userID', $userID, PDO::PARAM_STR);
    $stmt->execute();

    $userDetails = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($userDetails) {
        echo json_encode($userDetails);
    } else {
        echo json_encode(["error" => "User not found"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
