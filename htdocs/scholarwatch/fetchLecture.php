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
        // Check user type
        $stmt = $pdo->prepare("SELECT UserType FROM user WHERE UserID = :userID");
        $stmt->execute(['userID' => $userID]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && $user['UserType'] === 'Teacher') {
            // Fetch lectures for teacher
            $stmt = $pdo->prepare("SELECT 
                                        lecture.LectureName, 
                                        lecture.SlideCount,
                                        lecture.DirectoryPath,
                                        lecture.StartTimestamp,
                                        lecture.LectureID
                                    FROM 
                                        lecture
                                    INNER JOIN course 
                                        ON lecture.CourseID = course.CourseID
                                    WHERE 
                                        course.TeacherID = :userID
                                    ORDER BY lecture.StartTimestamp DESC");
            $stmt->execute(['userID' => $userID]);
        } else {
            // Fetch lectures for student based on unlocked/completed status in StudentLectureStatus
            $stmt = $pdo->prepare("SELECT 
                                        l.LectureName, 
                                        l.SlideCount,
                                        l.DirectoryPath,
                                        l.StartTimestamp,
                                        l.LectureID
                                    FROM 
                                        StudentLectureStatus sls
                                    INNER JOIN KnowledgeNode kn ON sls.NodeID = kn.NodeID
                                    INNER JOIN Lecture l ON kn.LectureID = l.LectureID
                                    WHERE 
                                        sls.StudentID = :userID
                                        AND sls.Status IN ('UNLOCKED', 'COMPLETED')
                                    ORDER BY l.StartTimestamp DESC");
            $stmt->execute(['userID' => $userID]);
        }

        $lectures = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $lectures]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Missing userID"]);
}
?>
