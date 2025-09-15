<?php
require_once 'config.php';

setCORSHeaders();
startSession();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'POST':
        if (isset($input['action'])) {
            switch($input['action']) {
                case 'login':
                    login($input);
                    break;
                case 'signup':
                    signup($input);
                    break;
                case 'logout':
                    logout();
                    break;
                case 'check_session':
                    checkSession();
                    break;
                case 'check_email':
                    checkEmailExists($input);
                    break;
                default:
                    sendJsonResponse(['error' => 'Invalid action'], 400);
            }
        } else {
            sendJsonResponse(['error' => 'Action required'], 400);
        }
        break;
    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}

function login($input) {
    if (!isset($input['email']) || !isset($input['password'])) {
        sendJsonResponse(['error' => 'Email and password required'], 400);
    }

    $pdo = getDatabaseConnection();
    $stmt = $pdo->prepare("SELECT id, email, name, password_hash, role FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    $user = $stmt->fetch();

    if ($user && password_verify($input['password'], $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
        
        // Debug: Log session data
        error_log("Login successful for user: " . $user['email']);
        error_log("Session ID: " . session_id());
        error_log("Session data: " . print_r($_SESSION, true));
        
        sendJsonResponse([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role']
            ]
        ]);
    } else {
        error_log("Login failed for email: " . $input['email']);
        sendJsonResponse(['error' => 'Invalid credentials'], 401);
    }
}

function logout() {
    session_destroy();
    sendJsonResponse(['success' => true]);
}

function checkSession() {
    $user = getCurrentUser();
    if ($user) {
        sendJsonResponse([
            'authenticated' => true,
            'user' => $user
        ]);
    } else {
        sendJsonResponse(['authenticated' => false]);
    }
}

function signup($input) {
    if (!isset($input['email']) || !isset($input['name']) || !isset($input['password'])) {
        sendJsonResponse(['error' => 'Email, name, and password required'], 400);
    }

    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        sendJsonResponse(['error' => 'Invalid email format'], 400);
    }

    // Validate password length
    if (strlen($input['password']) < 6) {
        sendJsonResponse(['error' => 'Password must be at least 6 characters'], 400);
    }

    $pdo = getDatabaseConnection();
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    if ($stmt->fetch()) {
        sendJsonResponse(['error' => 'Email already exists'], 400);
    }
    
    // Generate UUID for new user
    $userId = generateUUID();
    $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
    $role = isset($input['role']) ? $input['role'] : 'user';
    
    // Insert new user
    $stmt = $pdo->prepare("INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)");
    $result = $stmt->execute([$userId, $input['email'], $input['name'], $hashedPassword, $role]);
    
    if ($result) {
        // Auto-login the new user
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_email'] = $input['email'];
        $_SESSION['user_role'] = $role;
        
        error_log("Signup successful for user: " . $input['email']);
        error_log("Session ID: " . session_id());
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Account created successfully',
            'user' => [
                'id' => $userId,
                'email' => $input['email'],
                'name' => $input['name'],
                'role' => $role
            ]
        ]);
    } else {
        error_log("Signup failed for email: " . $input['email']);
        sendJsonResponse(['error' => 'Failed to create account'], 500);
    }
}

function checkEmailExists($input) {
    if (!isset($input['email'])) {
        sendJsonResponse(['error' => 'Email required'], 400);
    }

    $pdo = getDatabaseConnection();
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    $exists = $stmt->fetch() !== false;
    
    sendJsonResponse(['exists' => $exists]);
}

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
?>