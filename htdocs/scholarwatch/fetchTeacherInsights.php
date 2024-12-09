<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); // Adjust as needed
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

include 'includes/db.php';

try {
    $pdo->query("USE scholarwatch");

    $response = [];

    // Fetch all courses
    $stmt = $pdo->query("SELECT CourseID, Name FROM course");
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total students globally (or adapt this per course if you have enrollment info)
    $stmt = $pdo->query("SELECT COUNT(*) as total_students FROM user WHERE UserType = 'Student'");
    $total_students = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total_students'];
    $response['all_students'] = $total_students; // global count

    // Prepare response array
    $response['courses'] = [];

    foreach ($courses as $course) {
        $courseID = $course['CourseID'];

        // Total uploaded lectures for this course
        $stmt = $pdo->prepare("SELECT COUNT(*) as total_lectures FROM lecture WHERE CourseID = :courseID");
        $stmt->execute(['courseID' => $courseID]);
        $total_lectures = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total_lectures'];

        // Invalidation count for quizzes in this course
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as invalidations 
            FROM quiz q
            JOIN session s ON q.SessionID = s.SessionID
            WHERE s.CourseID = :courseID AND q.is_invalid = 1
        ");
        $stmt->execute(['courseID' => $courseID]);
        $invalidation_count = (int)$stmt->fetch(PDO::FETCH_ASSOC)['invalidations'];

        // Emotions & Attention
        $stmt = $pdo->prepare("
            SELECT 
                SUM(a.AwakeTime) as awake_time,
                SUM(a.DrowsyTime) as drowsy_time,
                SUM(a.FocusTime) as focused_time,
                SUM(a.UnfocusTime) as unfocused_time
            FROM activity a
            JOIN session se ON a.SessionID = se.SessionID
            WHERE se.CourseID = :courseID
        ");
        $stmt->execute(['courseID' => $courseID]);
        $activityData = $stmt->fetch(PDO::FETCH_ASSOC);
        $emotions = [
            'awake_time' => (float)$activityData['awake_time'] ?? 0,
            'drowsy_time' => (float)$activityData['drowsy_time'] ?? 0,
        ];
        $attention = [
            'focused_time' => (float)$activityData['focused_time'] ?? 0,
            'unfocused_time' => (float)$activityData['unfocused_time'] ?? 0,
        ];

        // Attendance data
        $stmt = $pdo->prepare("
            SELECT a.Date, a.IsPresent, COUNT(*) as count
            FROM attendance a
            JOIN session s ON a.SessionID = s.SessionID
            WHERE s.CourseID = :courseID
            GROUP BY a.Date, a.IsPresent
        ");
        $stmt->execute(['courseID' => $courseID]);
        $attendance = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $date = $row['Date'];
            if (!isset($attendance[$date])) {
                $attendance[$date] = ['present' => 0, 'absent' => 0];
            }
            if ($row['IsPresent'] == 1) {
                $attendance[$date]['present'] += (int)$row['count'];
            } else {
                $attendance[$date]['absent'] += (int)$row['count'];
            }
        }

        // Quiz data (box plot)
        $stmt = $pdo->prepare("
            SELECT qq.QuizID, qq.IsCorrect
            FROM quizquestion qq
            JOIN quiz q ON qq.QuizID = q.QuizID
            JOIN session s ON q.SessionID = s.SessionID
            WHERE s.CourseID = :courseID
        ");
        $stmt->execute(['courseID' => $courseID]);
        $quizScores = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $qId = $row['QuizID'];
            if (!isset($quizScores[$qId])) $quizScores[$qId] = [];
            if ($row['IsCorrect'] == 1) {
                $quizScores[$qId][] = rand(70, 100);
            } else {
                $quizScores[$qId][] = rand(50, 69);
            }
        }

        // Slides data (average focus per slide)
        $stmt = $pdo->prepare("
            SELECT sl.SlideNumber, AVG(sl.FocusDuration) as avg_focus
            FROM slide sl
            JOIN lecture l ON sl.LectureID = l.LectureID
            WHERE l.CourseID = :courseID
            GROUP BY sl.SlideNumber
            ORDER BY sl.SlideNumber
        ");
        $stmt->execute(['courseID' => $courseID]);
        $slides = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $slides[] = (float)$row['avg_focus'];
        }

        // Lecture engagement over time (sum of FocusTime by date)
        $stmt = $pdo->prepare("
            SELECT DATE(a.Timestamp) as day, SUM(a.FocusTime) as total_focus
            FROM activity a
            JOIN session s ON a.SessionID = s.SessionID
            WHERE s.CourseID = :courseID
            GROUP BY DATE(a.Timestamp)
            ORDER BY day
        ");
        $stmt->execute(['courseID' => $courseID]);
        $lectureEngagement = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $lectureEngagement[] = [
                'date' => $row['day'],
                'time' => (float)$row['total_focus']
            ];
        }

        $response['courses'][] = [
            'CourseID' => $courseID,
            'Name' => $course['Name'],
            'total_students' => $total_students,
            'total_lectures' => $total_lectures,
            'invalidation_count' => $invalidation_count,
            'emotions' => $emotions,
            'attention' => $attention,
            'attendance' => $attendance,
            'quiz_data' => $quizScores,
            'slides' => $slides,
            'lectureEngagement' => $lectureEngagement
        ];
    }

    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode([
        "error" => $e->getMessage(),
        "line" => $e->getLine(),
        "file" => $e->getFile()
    ]);
}
