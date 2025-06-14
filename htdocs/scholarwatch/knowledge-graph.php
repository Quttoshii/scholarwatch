<?php
require_once 'cors.php';
require_once 'db_connect.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? 'get';

switch ($action) {
    case 'get':
        getKnowledgeGraph();
        break;
    case 'updateNodePosition':
        updateNodePosition();
        break;
    case 'addNode':
        addNode();
        break;
    case 'updateNode':
        updateNode();
        break;
    case 'deleteNode':
        deleteNode();
        break;
    case 'addEdge':
        addEdge();
        break;
    case 'deleteEdge':
        deleteEdge();
        break;
    case 'updateNodeStatus':
        updateNodeStatus();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function getKnowledgeGraph() {
    global $conn;
    $courseId = $_GET['courseId'] ?? null;
    $studentId = $_GET['studentId'] ?? null;
    if (!$courseId) {
        echo json_encode(['success' => false, 'message' => 'Course ID is required']);
        return;
    }

    try {
        // Get graph ID for the course
        $stmt = $conn->prepare("SELECT GraphID FROM KnowledgeGraph WHERE CourseID = ?");
        $stmt->bind_param("i", $courseId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $stmt = $conn->prepare("INSERT INTO KnowledgeGraph (CourseID, Name, Description) VALUES (?, 'Course Knowledge Graph', 'Knowledge graph for course')");
            $stmt->bind_param("i", $courseId);
            $stmt->execute();
            $graphId = $conn->insert_id;
        } else {
            $row = $result->fetch_assoc();
            $graphId = $row['GraphID'];
        }

        // Get nodes
        $stmt = $conn->prepare("
            SELECT 
                NodeID, 
                Name, 
                Type, 
                Description, 
                PositionX, 
                PositionY, 
                LectureID
            FROM KnowledgeNode
            WHERE GraphID = ?
        ");
        $stmt->bind_param("i", $graphId);
        $stmt->execute();
        $nodes = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        // Get edges
        $stmt = $conn->prepare("
            SELECT EdgeID, SourceNodeID, TargetNodeID, Type, Weight
            FROM KnowledgeEdge
            WHERE GraphID = ?
        ");
        $stmt->bind_param("i", $graphId);
        $stmt->execute();
        $edges = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        // For each node, get the student's status
        $formattedNodes = array_map(function($node) use ($conn, $studentId) {
            $status = 'LOCKED';
            if ($studentId) {
                $stmt2 = $conn->prepare("SELECT Status FROM StudentLectureStatus WHERE StudentID = ? AND NodeID = ?");
                $stmt2->bind_param("ii", $studentId, $node['NodeID']);
                $stmt2->execute();
                $result2 = $stmt2->get_result();
                if ($row2 = $result2->fetch_assoc()) {
                    $status = $row2['Status'];
                }
            } else {
                // fallback to global node status if no studentId
                $stmt2 = $conn->prepare("SELECT Status FROM KnowledgeNode WHERE NodeID = ?");
                $stmt2->bind_param("i", $node['NodeID']);
                $stmt2->execute();
                $result2 = $stmt2->get_result();
                if ($row2 = $result2->fetch_assoc()) {
                    $status = $row2['Status'];
                }
            }
            return [
                'id' => (string)$node['NodeID'],
                'type' => $node['Type'],
                'position' => [
                    'x' => (float)$node['PositionX'],
                    'y' => (float)$node['PositionY']
                ],
                'data' => [
                    'label' => $node['Name'],
                    'description' => $node['Description'],
                    'lectureId' => $node['LectureID'],
                    'status' => $status
                ]
            ];
        }, $nodes);

        // Format edges for ReactFlow
        $formattedEdges = array_map(function($edge) {
            return [
                'id' => (string)$edge['EdgeID'],
                'source' => (string)$edge['SourceNodeID'],
                'target' => (string)$edge['TargetNodeID'],
                'type' => $edge['Type'],
                'weight' => (float)$edge['Weight']
            ];
        }, $edges);

        echo json_encode([
            'success' => true,
            'nodes' => $formattedNodes,
            'edges' => $formattedEdges
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Error retrieving knowledge graph: ' . $e->getMessage()
        ]);
    }
}

function updateNodePosition() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['nodeId']) || !isset($data['x']) || !isset($data['y'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }

    try {
        $stmt = $conn->prepare("UPDATE KnowledgeNode SET PositionX = ?, PositionY = ? WHERE NodeID = ?");
        $stmt->bind_param("ddi", $data['x'], $data['y'], $data['nodeId']);
        $stmt->execute();
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function addNode() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['graphId']) || !isset($data['name']) || !isset($data['type'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }

    try {
        $status = $data['status'] ?? 'LOCKED';
        $stmt = $conn->prepare("
            INSERT INTO KnowledgeNode (GraphID, Name, Type, Description, PositionX, PositionY, LectureID, Status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param(
            "isssddis",
            $data['graphId'],
            $data['name'],
            $data['type'],
            $data['description'] ?? '',
            $data['x'] ?? 0,
            $data['y'] ?? 0,
            $data['lectureId'] ?? null,
            $status
        );
        $stmt->execute();
        
        $nodeId = $conn->insert_id;
        echo json_encode(['success' => true, 'nodeId' => $nodeId]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function updateNode() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['nodeId']) || !isset($data['name'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }

    try {
        $status = $data['status'] ?? null;
        if ($status !== null) {
            $stmt = $conn->prepare("
                UPDATE KnowledgeNode 
                SET Name = ?, Description = ?, Type = ?, LectureID = ?, Status = ?
                WHERE NodeID = ?
            ");
            $stmt->bind_param(
                "sssisi",
                $data['name'],
                $data['description'] ?? '',
                $data['type'],
                $data['lectureId'] ?? null,
                $status,
                $data['nodeId']
            );
        } else {
            $stmt = $conn->prepare("
                UPDATE KnowledgeNode 
                SET Name = ?, Description = ?, Type = ?, LectureID = ?
                WHERE NodeID = ?
            ");
            $stmt->bind_param(
                "sssii",
                $data['name'],
                $data['description'] ?? '',
                $data['type'],
                $data['lectureId'] ?? null,
                $data['nodeId']
            );
        }
        $stmt->execute();
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function deleteNode() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['nodeId'])) {
        echo json_encode(['success' => false, 'message' => 'Node ID is required']);
        return;
    }

    try {
        // Start transaction
        $conn->begin_transaction();

        // Delete connected edges first
        $stmt = $conn->prepare("DELETE FROM KnowledgeEdge WHERE SourceNodeID = ? OR TargetNodeID = ?");
        $stmt->bind_param("ii", $data['nodeId'], $data['nodeId']);
        $stmt->execute();

        // Delete the node
        $stmt = $conn->prepare("DELETE FROM KnowledgeNode WHERE NodeID = ?");
        $stmt->bind_param("i", $data['nodeId']);
        $stmt->execute();

        // Commit transaction
        $conn->commit();
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        // Rollback on error
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function addEdge() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['graphId']) || !isset($data['sourceId']) || !isset($data['targetId'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }

    try {
        $stmt = $conn->prepare("
            INSERT INTO KnowledgeEdge (GraphID, SourceNodeID, TargetNodeID, Type, Weight)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->bind_param(
            "iiisd",
            $data['graphId'],
            $data['sourceId'],
            $data['targetId'],
            $data['type'] ?? 'PREREQUISITE',
            $data['weight'] ?? 1.0
        );
        $stmt->execute();
        
        $edgeId = $conn->insert_id;
        echo json_encode(['success' => true, 'edgeId' => $edgeId]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function deleteEdge() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['edgeId'])) {
        echo json_encode(['success' => false, 'message' => 'Edge ID is required']);
        return;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM KnowledgeEdge WHERE EdgeID = ?");
        $stmt->bind_param("i", $data['edgeId']);
        $stmt->execute();
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function updateNodeStatus() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);
    $studentId = $data['studentId'] ?? null;
    // Validate required fields
    if (!isset($data['nodeId']) || !isset($data['status'])) {
        echo json_encode([
            'success' => false, 
            'message' => 'Missing required fields: nodeId and status are required'
        ]);
        return;
    }
    $validStatuses = ['LOCKED', 'UNLOCKED', 'COMPLETED'];
    if (!in_array($data['status'], $validStatuses)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid status value. Must be one of: ' . implode(', ', $validStatuses)
        ]);
        return;
    }
    try {
        $conn->begin_transaction();
        if ($studentId) {
            // Update or insert the student's status for this node
            $stmt = $conn->prepare("INSERT INTO StudentLectureStatus (StudentID, NodeID, Status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Status = ?");
            $stmt->bind_param("iiss", $studentId, $data['nodeId'], $data['status'], $data['status']);
            $stmt->execute();
            if ($stmt->affected_rows === 0) {
                throw new Exception('Node not found or no changes made');
            }
            // If marking as COMPLETED, unlock children if all prerequisites are completed
            if ($data['status'] === 'COMPLETED') {
                // Get all child nodes
                $stmt2 = $conn->prepare("SELECT TargetNodeID FROM KnowledgeEdge WHERE SourceNodeID = ?");
                $stmt2->bind_param("i", $data['nodeId']);
                $stmt2->execute();
                $result2 = $stmt2->get_result();
                while ($row2 = $result2->fetch_assoc()) {
                    $childId = $row2['TargetNodeID'];
                    // Get all prerequisites for this child
                    $stmt3 = $conn->prepare("SELECT SourceNodeID FROM KnowledgeEdge WHERE TargetNodeID = ?");
                    $stmt3->bind_param("i", $childId);
                    $stmt3->execute();
                    $result3 = $stmt3->get_result();
                    $allCompleted = true;
                    while ($row3 = $result3->fetch_assoc()) {
                        $prereqId = $row3['SourceNodeID'];
                        $stmt4 = $conn->prepare("SELECT Status FROM StudentLectureStatus WHERE StudentID = ? AND NodeID = ?");
                        $stmt4->bind_param("ii", $studentId, $prereqId);
                        $stmt4->execute();
                        $result4 = $stmt4->get_result();
                        $row4 = $result4->fetch_assoc();
                        if (!$row4 || $row4['Status'] !== 'COMPLETED') {
                            $allCompleted = false;
                            break;
                        }
                    }
                    if ($allCompleted) {
                        // Unlock this child node for the student
                        $stmt5 = $conn->prepare("INSERT INTO StudentLectureStatus (StudentID, NodeID, Status) VALUES (?, ?, 'UNLOCKED') ON DUPLICATE KEY UPDATE Status = 'UNLOCKED'");
                        $stmt5->bind_param("ii", $studentId, $childId);
                        $stmt5->execute();
                    }
                }
            }
        } else {
            // Fallback: update global node status (for admin/teacher)
            $stmt = $conn->prepare("UPDATE KnowledgeNode SET Status = ? WHERE NodeID = ?");
            $stmt->bind_param("si", $data['status'], $data['nodeId']);
            $stmt->execute();
            if ($stmt->affected_rows === 0) {
                throw new Exception('Node not found or no changes made');
            }
        }
        $conn->commit();
        echo json_encode([
            'success' => true,
            'message' => 'Node status updated successfully',
            'nodeId' => $data['nodeId'],
            'status' => $data['status']
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Error updating node status: ' . $e->getMessage()
        ]);
    }
}
?> 