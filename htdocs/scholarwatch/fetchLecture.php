<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
header("Content-Type: application/json");

include 'includes/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['userID'])) {
    $userID = $data['userID'];

    try {
        // Fetch lecture records for the specific user
        $stmt = $pdo->prepare("SELECT 
                                    lecture.lectureName, 
                                    lecture.slideCount,
                                    lecture.DirectoryPath,
                                    lecture.StartTimestamp,
                                    lecture.lectureID
                                FROM 
                                    lecture
                                INNER JOIN course 
                                    ON lecture.CourseID = course.CourseID
                                INNER JOIN user 
                                    ON course.teacherID = user.UserID
                                WHERE 
                                    course.TeacherID = :userID
                                ORDER BY lecture.StartTimestamp DESC");
        

        $stmt->execute(['userID' => $userID]);
        $lectures = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $lectures]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Missing userID"]);
}
?>
