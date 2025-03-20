<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

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

// Debug: Log request method
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);

// Debug: Log GET parameters
error_log("GET Parameters: " . print_r($_GET, true));

// Check if a file is requested
if (!isset($_GET['file']) || empty($_GET['file'])) {
    http_response_code(400);
    echo json_encode(["error" => "No file specified."]);
    exit;
}

// Sanitize file name
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
