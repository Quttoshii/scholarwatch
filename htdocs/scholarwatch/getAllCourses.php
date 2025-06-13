<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');
require_once 'db_connect.php';

try {
    $stmt = $conn->prepare("
        SELECT c.CourseID, c.Name AS CourseName, u.UserID AS TeacherID, u.Name AS TeacherName
        FROM Course c
        JOIN User u ON c.TeacherID = u.UserID
    ");
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    if (!$stmt->execute()) {
        throw new Exception("Failed to execute statement: " . $stmt->error);
    }
    $result = $stmt->get_result();
    if (!$result) {
        throw new Exception("Failed to get result: " . $stmt->error);
    }
    $courses = [];
    while ($row = $result->fetch_assoc()) {
        $courses[] = $row;
    }
    echo json_encode([
        'success' => true,
        'courses' => $courses
    ]);
} catch (Exception $e) {
    error_log("Error in getAllCourses.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching courses: ' . $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conn)) {
        $conn->close();
    }
}
?> 