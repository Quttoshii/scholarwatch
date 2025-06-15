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

                $lectureId = $pdo->lastInsertId();

                // Get the graph ID for the course
                $stmt = $pdo->prepare("SELECT GraphID FROM KnowledgeGraph WHERE CourseID = ?");
                $stmt->execute([$courseID]);
                $graph = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($graph) {
                    // Get the last node in the graph
                    $stmt = $pdo->prepare("
                        SELECT NodeID, PositionX, PositionY 
                        FROM KnowledgeNode 
                        WHERE GraphID = ? 
                        ORDER BY NodeID DESC 
                        LIMIT 1
                    ");
                    $stmt->execute([$graph['GraphID']]);
                    $lastNode = $stmt->fetch(PDO::FETCH_ASSOC);

                    // Calculate position for new node (slightly to the right of last node)
                    $newX = $lastNode ? $lastNode['PositionX'] + 150 : 100;
                    $newY = $lastNode ? $lastNode['PositionY'] : 100;

                    // Create a new node for the lecture
                    $stmt = $pdo->prepare("
                        INSERT INTO KnowledgeNode (
                            GraphID, 
                            LectureID, 
                            Name, 
                            Type, 
                            Description, 
                            PositionX, 
                            PositionY, 
                            Status
                        ) VALUES (?, ?, ?, 'LECTURE', ?, ?, ?, 'LOCKED')
                    ");
                    $stmt->execute([
                        $graph['GraphID'],
                        $lectureId,
                        pathinfo($file['name'], PATHINFO_FILENAME),
                        "Lecture: " . pathinfo($file['name'], PATHINFO_FILENAME),
                        $newX,
                        $newY
                    ]);

                    $newNodeId = $pdo->lastInsertId();

                    // If there was a last node, create an edge from it to the new node
                    if ($lastNode) {
                        $stmt = $pdo->prepare("
                            INSERT INTO KnowledgeEdge (
                                GraphID, 
                                SourceNodeID, 
                                TargetNodeID, 
                                Type, 
                                Weight
                            ) VALUES (?, ?, ?, 'PREREQUISITE', 1.0)
                        ");
                        $stmt->execute([
                            $graph['GraphID'],
                            $lastNode['NodeID'],
                            $newNodeId
                        ]);
                    }
                }

                echo json_encode([
                    "success" => true, 
                    "message" => "Lecture uploaded successfully and added to knowledge graph"
                ]);
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
