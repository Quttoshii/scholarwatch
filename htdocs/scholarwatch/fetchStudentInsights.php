<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

include 'includes/db.php';

try {
    $pdo->query("USE scholarwatch");

    // Assume a single student user for demonstration.
    // In a real scenario, you might get UserID from session or query parameter.
    $studentUserID = 1;

    $response = [];

    // Fetch all courses
    $stmt = $pdo->query("SELECT CourseID, Name FROM course");
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Total students (all students), adjust if you want per-course logic
    $stmt = $pdo->query("SELECT COUNT(*) as total_students FROM user WHERE UserType='Student'");
    $total_students = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total_students'];

    $response['studentName'] = 'John Doe'; // Static for now
    $response['courses'] = [];

    foreach ($courses as $course) {
        $courseID = $course['CourseID'];

        // 1. Total Lectures
        $stmt = $pdo->prepare("SELECT COUNT(*) as total_lectures FROM lecture WHERE CourseID = :courseID");
        $stmt->execute(['courseID' => $courseID]);
        $total_lectures = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total_lectures'];

        // 2. Viewed Lectures by this student:
        // A viewed lecture is defined as having any activity record with FocusTime > 0 for that lecture by the student.
        $stmt = $pdo->prepare("
            SELECT COUNT(DISTINCT l.LectureID) as viewed_count
            FROM activity a
            JOIN session s ON a.SessionID = s.SessionID
            JOIN lecture l ON s.SessionID = l.SessionID
            WHERE s.CourseID = :courseID
              AND a.UserID = :userID
              AND a.FocusTime > 0
        ");
        $stmt->execute(['courseID' => $courseID, 'userID' => $studentUserID]);
        $viewed_lectures = (int)$stmt->fetch(PDO::FETCH_ASSOC)['viewed_count'];
        $not_viewed_lectures = $total_lectures - $viewed_lectures;

        // 3. Quiz Scores:
        // Retrieve all quizquestions for quizzes in this course answered by this student.
        // We'll lump all scores into one array for now. If you want multiple quizzes separately,
        // you can structure differently or pick the first N quizzes.
        $stmt = $pdo->prepare("
            SELECT qq.IsCorrect
            FROM quizquestion qq
            JOIN quiz q ON qq.QuizID = q.QuizID
            JOIN session se ON q.SessionID = se.SessionID
            WHERE se.CourseID = :courseID
              AND qq.StudentAnswer IS NOT NULL
              AND qq.UserID = :userID
        ");
        $stmt->execute(['courseID' => $courseID, 'userID' => $studentUserID]);
        $quizScores = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if ($row['IsCorrect'] == 1) {
                $quizScores[] = rand(85, 100); // Higher scores for correct
            } else {
                $quizScores[] = rand(50, 75); // Lower scores for incorrect
            }
        }
        // If no quiz attempts, provide an empty array or some default:
        if (empty($quizScores)) {
            // Let's provide a default array or leave it empty
            $quizScores = [];
        }

        // 4. Attendance:
        // total_sessions in that course:
        $stmt = $pdo->prepare("SELECT COUNT(*) as session_count FROM session WHERE CourseID = :courseID");
        $stmt->execute(['courseID' => $courseID]);
        $total_sessions = (int)$stmt->fetch(PDO::FETCH_ASSOC)['session_count'];

        // present_count for this student:
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as present_count
            FROM attendance a
            JOIN session s ON a.SessionID = s.SessionID
            WHERE s.CourseID = :courseID
              AND a.UserID = :userID
              AND a.IsPresent = 1
        ");
        $stmt->execute(['courseID' => $courseID, 'userID' => $studentUserID]);
        $present_count = (int)$stmt->fetch(PDO::FETCH_ASSOC)['present_count'];

        $attendance_percent = $total_sessions > 0 ? round(($present_count / $total_sessions) * 100) . "%" : "0%";

        // 5. Attention (focused/unfocused time):
        $stmt = $pdo->prepare("
            SELECT SUM(a.FocusTime) as focused_time, SUM(a.UnfocusTime) as unfocused_time
            FROM activity a
            JOIN session s ON a.SessionID = s.SessionID
            WHERE s.CourseID = :courseID
              AND a.UserID = :userID
        ");
        $stmt->execute(['courseID' => $courseID, 'userID' => $studentUserID]);
        $attData = $stmt->fetch(PDO::FETCH_ASSOC);
        $attention = [
            'focused_time' => (float)$attData['focused_time'] ?? 0,
            'unfocused_time' => (float)$attData['unfocused_time'] ?? 0,
        ];

        // Return the course-specific data
        $response['courses'][] = [
            'CourseID' => $courseID,
            'Name' => $course['Name'],
            'totalLectures' => $total_lectures,
            'viewedLectures' => $viewed_lectures,
            'notViewedLectures' => $not_viewed_lectures,
            'quizScores' => $quizScores,
            'totalStudents' => $total_students,
            'attendance' => $attendance_percent,
            'attention' => $attention,
        ];
    }

    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
