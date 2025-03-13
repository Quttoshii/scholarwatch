<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);


header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


header("Content-Type: application/json");


error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);

include 'includes/db.php';


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    error_log("Received POST data: " . print_r($_POST, true));
    error_log("Received FILES data: " . print_r($_FILES, true));

    
    if (
        isset($_FILES['lecture_file']) && 
        isset($_POST['lecture_name']) && 
        isset($_POST['num_pages'])
    ) {
        $file = $_FILES['lecture_file'];
        $numPages = intval($_POST['num_pages']);
        $lectureName = preg_replace('/[^a-zA-Z0-9-_]/', '_', $_POST['lecture_name']);

        $sessionID = 1;
        $courseID = 1;

        $startTimestamp = isset($_POST['startTimestamp']) ? $_POST['startTimestamp'] : date('Y-m-d H:i:s'); 

        $uploadDir = 'lectures' . DIRECTORY_SEPARATOR;
        $filePath = $uploadDir . $lectureName . '.pdf';

        

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            try {
               
                $stmt = $pdo->prepare("INSERT INTO lecture (SessionID, CourseID, lectureName, directoryPath, slideCount, StartTimestamp) 
                            VALUES (:sessionID, :courseID, :lectureName, :directoryPath, :slideCount, :startTimestamp)");
                $stmt->execute([
                'sessionID' => $sessionID,
                'courseID' => $courseID,
                'lectureName' => $lectureName,
                'directoryPath' => $filePath,
                'slideCount' => $numPages,
                'startTimestamp' => $startTimestamp
                ]);

                echo json_encode(["success" => true, "message" => "Lecture uploaded successfully"]);
            } catch (PDOException $e) {
                echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Failed to move the uploaded file"]);
        }
    } else {
        // Debug: Log which data is missing
        $missingData = [];
        if (!isset($_FILES['lecture_file'])) $missingData[] = 'lecture_file';
        if (!isset($_POST['lecture_name'])) $missingData[] = 'lecture_name';
        if (!isset($_POST['num_pages'])) $missingData[] = 'num_pages';
        
        echo json_encode([
            "success" => false, 
            "message" => "Missing required data: " . implode(', ', $missingData)
        ]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method: " . $_SERVER['REQUEST_METHOD']]);
}
?>