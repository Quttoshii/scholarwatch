<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

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


error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);


error_log("GET Parameters: " . print_r($_GET, true));


if (!isset($_GET['file']) || empty($_GET['file'])) {
    http_response_code(400);
    echo json_encode(["error" => "No file specified."]);
    exit;
}


$filename = basename($_GET['file']); // Prevent path traversal
$filepath = __DIR__ . "/lectures/" . $filename;

// Debug: Log resolved file path
error_log("Resolved path: " . $filepath);

// Check if file exists
if (!file_exists($filepath)) {
    http_response_code(404);
    echo json_encode(["error" => "File not found."]);
    exit;
}

// Send PDF headers
header("Content-Type: application/pdf");
header("Content-Disposition: inline; filename=\"$filename\"");
header("Content-Length: " . filesize($filepath));
readfile($filepath);
exit;
?>
