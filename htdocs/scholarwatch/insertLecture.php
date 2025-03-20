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
    if (!empty($_FILES['lecture_file']) && isset($_POST['num_pages'])) {
        $file = $_FILES['lecture_file'];
        $numPages = intval($_POST['num_pages']);

        $sessionID = 1;
        $courseID = 1;

        $uploadDir = __DIR__ . '/lectures/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $filePath = $uploadDir . basename($file['name']);

        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            try {
                $stmt = $pdo->prepare("INSERT INTO lecture (SessionID, CourseID, lectureName, directoryPath, slideCount) 
                                        VALUES (:sessionID, :courseID, :lectureName, :directoryPath, :slideCount)");
                $stmt->execute([
                    'sessionID' => $sessionID,
                    'courseID' => $courseID,
                    'lectureName' => pathinfo($file['name'], PATHINFO_FILENAME),
                    'directoryPath' => '/lectures/' . basename($file['name']), // Now prefixed with /lectures/
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
