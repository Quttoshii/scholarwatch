<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
header("Content-Type: application/json");


include 'includes/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!empty($_FILES['lecture_file']) && isset($_POST['num_pages']) && isset($_POST['lecture_name'])) {
        $file = $_FILES['lecture_file'];
        $numPages = intval($_POST['num_pages']); // Get the number of pages from the request
        $lectureName = preg_replace('/[^a-zA-Z0-9-_]/', '_', $_POST['lecture_name']); // Sanitize lecture name

        $sessionID = 1;
        $courseID = 1;

        // $startTimestamp = isset($_POST['startTimestamp']) ? $_POST['startTimestamp'] : date('Y-m-d H:i:s'); // Use current time if not provided


        $uploadDir = 'lectures' . DIRECTORY_SEPARATOR . $lectureName . DIRECTORY_SEPARATOR;
        $filePath = $uploadDir . basename($file['name']);

        // Ensure the lecture directory exists
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Move the uploaded file
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            try {
                // Save the lecture name, file path, and number of pages in the database
                $stmt = $pdo->prepare("INSERT INTO lectures (SessionID, CourseID, lectureName, directoryPath, slideCount) 
                                        VALUES (:sessionID, :courseID, :lectureName, :directoryPath, :slideCount)");
                $stmt->execute([
                    'sessionID' => $sessionID,
                    'courseID' => $courseID,
                    'lectureName' => $lectureName,
                    'directoryPath' => $filePath,
                    'slideCount' => $numPages
                ]);

                echo json_encode(["success" => true, "message" => "Lecture uploaded successfully"]);
            } catch (PDOException $e) {
                echo json_encode(["success" => false, "error" => $e->getMessage()]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Failed to move the uploaded file"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Invalid input"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>
