<?php
require_once 'config.php';

setCORSHeaders();
startSession();

if (!isAuthenticated()) {
    sendJsonResponse(['error' => 'Unauthorized'], 401);
}

$user = getCurrentUser();
if ($user['role'] !== 'admin') {
    sendJsonResponse(['error' => 'Admin access required'], 403);
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        getAllUsers();
        break;
    case 'POST':
        createUser($input);
        break;
    case 'PUT':
        updateUser($input);
        break;
    case 'DELETE':
        deleteUser($input);
        break;
    case 'PATCH':
        if (isset($input['action']) && $input['action'] === 'reset_password') {
            resetUserPassword($input);
        } else {
            sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}

function getAllUsers() {
    $pdo = getDatabaseConnection();
    $stmt = $pdo->query("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC");
    $users = $stmt->fetchAll();
    
    sendJsonResponse(['users' => $users]);
}

function createUser($data) {
    if (!isset($data['email']) || !isset($data['name']) || !isset($data['password'])) {
        sendJsonResponse(['error' => 'Email, name, and password required'], 400);
    }

    $pdo = getDatabaseConnection();
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        sendJsonResponse(['error' => 'Email already exists'], 400);
    }
    
    $userId = generateUUID();
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    $role = isset($data['role']) ? $data['role'] : 'user';
    
    $stmt = $pdo->prepare("INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $data['email'], $data['name'], $hashedPassword, $role]);
    
    sendJsonResponse(['success' => true, 'id' => $userId]);
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

function updateUser($data) {
    if (!isset($data['id'])) {
        sendJsonResponse(['error' => 'User ID required'], 400);
    }

    $pdo = getDatabaseConnection();
    
    // Build update query dynamically
    $updateFields = [];
    $updateValues = [];
    
    if (isset($data['name'])) {
        $updateFields[] = "name = ?";
        $updateValues[] = $data['name'];
    }
    
    if (isset($data['email'])) {
        $updateFields[] = "email = ?";
        $updateValues[] = $data['email'];
    }
    
    if (isset($data['role'])) {
        $updateFields[] = "role = ?";
        $updateValues[] = $data['role'];
    }
    
    if (isset($data['password']) && !empty($data['password'])) {
        $updateFields[] = "password_hash = ?";
        $updateValues[] = password_hash($data['password'], PASSWORD_DEFAULT);
    }
    
    if (empty($updateFields)) {
        sendJsonResponse(['error' => 'No fields to update'], 400);
    }
    
    $updateValues[] = $data['id'];
    
    $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($updateValues);
    
    sendJsonResponse(['success' => true]);
}

function deleteUser($data) {
    if (!isset($data['id'])) {
        sendJsonResponse(['error' => 'User ID required'], 400);
    }

    $pdo = getDatabaseConnection();
    
    // Prevent deletion of current user
    $currentUser = getCurrentUser();
    if ($data['id'] == $currentUser['id']) {
        sendJsonResponse(['error' => 'Cannot delete current user'], 400);
    }
    
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$data['id']]);
    
    sendJsonResponse(['success' => true]);
}

function resetUserPassword($data) {
    if (!isset($data['id'])) {
        sendJsonResponse(['error' => 'User ID required'], 400);
    }

    $pdo = getDatabaseConnection();
    
    // Generate a new random password
    $newPassword = generateRandomPassword();
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update the user's password
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $result = $stmt->execute([$hashedPassword, $data['id']]);
    
    if ($result) {
        sendJsonResponse([
            'success' => true, 
            'message' => 'Password reset successfully',
            'newPassword' => $newPassword
        ]);
    } else {
        sendJsonResponse(['error' => 'Failed to reset password'], 500);
    }
}

function generateRandomPassword($length = 8) {
    $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    $password = '';
    $charactersLength = strlen($characters);
    
    for ($i = 0; $i < $length; $i++) {
        $password .= $characters[rand(0, $charactersLength - 1)];
    }
    
    return $password;
}
?>