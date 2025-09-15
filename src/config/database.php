<?php
/**
 * Database Configuration File
 * 
 * Update these credentials to match your MySQL/phpMyAdmin setup
 * This file should be included in all PHP scripts that need database access
 */

// Database Configuration
define('DB_HOST', 'localhost');           // Usually 'localhost' for XAMPP/WAMP
define('DB_NAME', 'field_maintenance');   // Your database name
define('DB_USER', 'root');                // Your MySQL username (usually 'root' for local)
define('DB_PASS', '');                    // Your MySQL password (usually empty for local XAMPP)
define('DB_PORT', 3306);                  // MySQL port (usually 3306)
define('DB_CHARSET', 'utf8mb4');          // Database charset

// Application Configuration
define('APP_NAME', 'Field Maintenance Tracker');
define('SESSION_NAME', 'field_maintenance_session');

// CORS Configuration - Allow specific origins for development
define('CORS_ORIGIN', 'http://localhost:3001'); // Frontend development server

// Error Reporting (set to false in production)
define('DEBUG_MODE', true);

/**
 * Create PDO Database Connection
 * 
 * @return PDO
 * @throws Exception
 */
function getDatabaseConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";port=" . DB_PORT . ";charset=" . DB_CHARSET;
        
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        
        return $pdo;
    } catch (PDOException $e) {
        if (DEBUG_MODE) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        } else {
            throw new Exception("Database connection failed. Please check your configuration.");
        }
    }
}

/**
 * Set CORS Headers
 */
function setCorsHeaders() {
    // Allow multiple origins for development
    $allowed_origins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002'
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $origin);
    } else {
        header("Access-Control-Allow-Origin: " . CORS_ORIGIN);
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json");
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

/**
 * Start session with proper configuration
 */
if (!function_exists('startSession')) {
    function startSession() {
        if (session_status() === PHP_SESSION_NONE) {
            session_name(SESSION_NAME);
            session_start();
        }
    }
}

/**
 * Send JSON response
 * 
 * @param array $data
 * @param int $statusCode
 */
if (!function_exists('sendJsonResponse')) {
    function sendJsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}

/**
 * Log error messages
 * 
 * @param string $message
 */
if (!function_exists('logError')) {
    function logError($message) {
        if (DEBUG_MODE) {
            error_log(date('[Y-m-d H:i:s] ') . $message . PHP_EOL, 3, __DIR__ . '/../logs/error.log');
        }
    }
}

// Create logs directory if it doesn't exist
if (!file_exists(__DIR__ . '/../logs')) {
    mkdir(__DIR__ . '/../logs', 0755, true);
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Get current authenticated user
 */
function getCurrentUser() {
    if (!isAuthenticated()) {
        return null;
    }
    
    try {
        $pdo = getDatabaseConnection();
        $stmt = $pdo->prepare("SELECT id, email, name, role FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log("Error getting current user: " . $e->getMessage());
        return null;
    }
}
?>