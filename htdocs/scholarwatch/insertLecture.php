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
    if (!empty($_FILES['lecture_file']) && isset($_POST['num_pages']) && isset($_POST['courseID'])) {
        $file = $_FILES['lecture_file'];
        $numPages = intval($_POST['num_pages']);
        $courseID = intval($_POST['courseID']);
        $sessionID = isset($_POST['sessionID']) ? intval($_POST['sessionID']) : 1;

        // Validate that the teacher owns the course
        $stmt = $pdo->prepare("SELECT TeacherID FROM Course WHERE CourseID = :courseID");
        $stmt->execute(['courseID' => $courseID]);
        $course = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$course) {
            echo json_encode(["success" => false, "message" => "Invalid course"]);
            exit;
        }
        // Optionally, check if the teacher is authorized (e.g., via a session or token)
        // For now, we assume the teacher is authorized if the course exists

        $uploadDir = __DIR__ . '/lectures/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $filePath = $uploadDir . basename($file['name']);
        $dbPath = '/lectures/' . basename($file['name']);

        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            try {
                $stmt = $pdo->prepare("INSERT INTO lecture (SessionID, CourseID, lectureName, directoryPath, slideCount) 
                                        VALUES (:sessionID, :courseID, :lectureName, :directoryPath, :slideCount)");
                $stmt->execute([
                    'sessionID' => $sessionID,
                    'courseID' => $courseID,
                    'lectureName' => pathinfo($file['name'], PATHINFO_FILENAME),
                    'directoryPath' => $dbPath,
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
