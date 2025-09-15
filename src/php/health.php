<?php
/**
 * Simple health check endpoint
 * Tests basic PHP functionality without requiring database
 */

// Set headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Basic health check response
$response = [
    'status' => 'success',
    'message' => 'PHP API is running',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'script_name' => $_SERVER['SCRIPT_NAME']
];

// Test basic PHP functionality
try {
    // Test JSON encoding
    $test_data = ['test' => 'data'];
    $json_test = json_encode($test_data);
    if ($json_test === false) {
        throw new Exception('JSON encoding failed');
    }
    
    // Test file system access
    $temp_file = tempnam(sys_get_temp_dir(), 'health_check');
    if ($temp_file === false) {
        throw new Exception('File system access failed');
    }
    unlink($temp_file);
    
    $response['tests'] = [
        'json_encoding' => 'passed',
        'file_system' => 'passed'
    ];
    
} catch (Exception $e) {
    $response['status'] = 'warning';
    $response['message'] = 'PHP API running with issues';
    $response['error'] = $e->getMessage();
}

// Return response
http_response_code(200);
echo json_encode($response);
exit;
?>