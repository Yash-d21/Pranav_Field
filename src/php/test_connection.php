<?php
// Enhanced test script to verify PHP/MySQL connection
require_once 'config.php';

setCORSHeaders();

$response = [
    'status' => 'error',
    'message' => 'Unknown error',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'checks' => []
];

// Check 1: Basic PHP functionality
try {
    $response['checks']['php'] = [
        'status' => 'success',
        'message' => 'PHP is working correctly',
        'version' => PHP_VERSION
    ];
} catch (Exception $e) {
    $response['checks']['php'] = [
        'status' => 'error',
        'message' => 'PHP error: ' . $e->getMessage()
    ];
}

// Check 2: Configuration file
try {
    if (!defined('DB_HOST')) {
        throw new Exception('Database configuration not loaded');
    }
    
    $response['checks']['config'] = [
        'status' => 'success',
        'message' => 'Configuration loaded successfully',
        'details' => [
            'host' => DB_HOST,
            'database' => DB_NAME,
            'user' => DB_USER,
            'port' => DB_PORT
        ]
    ];
} catch (Exception $e) {
    $response['checks']['config'] = [
        'status' => 'error',
        'message' => 'Configuration error: ' . $e->getMessage()
    ];
    sendJsonResponse($response, 500);
    exit;
}

// Check 3: Database connection
try {
    $pdo = getDatabaseConnection();
    $response['checks']['database'] = [
        'status' => 'success',
        'message' => 'Database connection successful'
    ];
} catch (Exception $e) {
    $response['checks']['database'] = [
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage(),
        'suggestions' => [
            'Check if MySQL service is running in XAMPP/WAMP',
            'Verify database credentials in /config/database.php',
            'Ensure the database exists (run SQL script)',
            'Check MySQL port (usually 3306)'
        ]
    ];
    sendJsonResponse($response, 500);
    exit;
}

// Check 4: Database tables
try {
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    $table_exists = $stmt->fetch();
    
    if (!$table_exists) {
        throw new Exception('Users table does not exist');
    }
    
    $stmt = $pdo->query("SELECT COUNT(*) as user_count FROM users");
    $result = $stmt->fetch();
    
    $response['checks']['tables'] = [
        'status' => 'success',
        'message' => 'Database tables verified',
        'user_count' => $result['user_count']
    ];
} catch (Exception $e) {
    $response['checks']['tables'] = [
        'status' => 'error',
        'message' => 'Database tables error: ' . $e->getMessage(),
        'suggestions' => [
            'Run the SQL script from /database/create_database.sql in phpMyAdmin',
            'Make sure you created the database with all tables',
            'Check if the database name matches your configuration'
        ]
    ];
    sendJsonResponse($response, 500);
    exit;
}

// All checks passed
$response['status'] = 'success';
$response['message'] = 'All systems are working correctly';
$response['database'] = DB_NAME;
$response['user_count'] = $result['user_count'];

sendJsonResponse($response);
?>