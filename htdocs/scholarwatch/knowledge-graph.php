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
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function getKnowledgeGraph() {
    global $conn;
    
    $courseId = $_GET['courseId'] ?? null;
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
            // Create a new graph if it doesn't exist
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
            SELECT NodeID, Name, Type, Description, PositionX, PositionY, LectureID
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

        // Format nodes for ReactFlow
        $formattedNodes = array_map(function($node) {
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
                    'lectureId' => $node['LectureID']
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
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
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
        $stmt = $conn->prepare("
            INSERT INTO KnowledgeNode (GraphID, Name, Type, Description, PositionX, PositionY, LectureID)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param(
            "isssddi",
            $data['graphId'],
            $data['name'],
            $data['type'],
            $data['description'] ?? '',
            $data['x'] ?? 0,
            $data['y'] ?? 0,
            $data['lectureId'] ?? null
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
?> 