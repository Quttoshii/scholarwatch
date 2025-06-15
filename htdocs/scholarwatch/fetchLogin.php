<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization"); 
header("Content-Type: application/json");

include 'includes/db.php';


$data = json_decode(file_get_contents("php://input"), true);

try {
    if (isset($data['email']) && isset($data['password'])) {
        $email = $data['email'];
        $password = $data['password'];

        $response = [];

        // Prepare and execute query to fetch user details
        $stmt = $pdo->prepare("SELECT userType, userID,name, password FROM user WHERE Email = :email");
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $db_password = $user['password'];

            // Verify password
            if ($db_password == $password) {
                // Password correct, return user details
                $response['userType'] = $user['userType'];
                $response['userID'] = $user['userID'];
                $response['userName'] = $user['name'];
            } else {
                $response['error'] = "invalid_password"; 
            }
        } else {
            $response['error'] = "invalid_email";
        }

        echo json_encode($response);
    } else {
        echo json_encode(["error" => "Invalid input"]); 
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]); 
}
