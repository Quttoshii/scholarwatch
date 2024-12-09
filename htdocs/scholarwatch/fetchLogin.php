<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); // Allow requests from React app's origin
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Specify allowed request methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Specify allowed headers
header("Content-Type: application/json");

include 'includes/db.php';

// Read JSON input data
$data = json_decode(file_get_contents("php://input"), true);

try {
    if (isset($data['email']) && isset($data['password'])) {
        $email = $data['email'];
        $password = $data['password'];

        $response = [];

        // Prepare and execute query to fetch user details
        $stmt = $pdo->prepare("SELECT userType, userID, password FROM user WHERE Email = :email");
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
            } else {
                $response['error'] = "invalid_password"; // Incorrect password
            }
        } else {
            $response['error'] = "invalid_email"; // Invalid email
        }

        echo json_encode($response);
    } else {
        echo json_encode(["error" => "Invalid input"]); // Missing email or password
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]); // Database error
}
