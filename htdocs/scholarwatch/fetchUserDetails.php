<?php

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:3000"); 
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); 
    header("Access-Control-Allow-Headers: Content-Type, Authorization"); 
    http_response_code(200); 
    exit; 
}


header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json"); 

include 'includes/db.php'; 


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