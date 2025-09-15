<?php
/**
 * Load database configuration from config file
 * This file now uses the centralized database configuration
 */
require_once __DIR__ . '/../config/database.php';

// Create database connection using centralized config
function getDBConnection() {
    return getDatabaseConnection();
}

// CORS headers for API requests - avoid redeclaration
if (!function_exists('setCORSHeaders')) {
    function setCORSHeaders() {
        setCorsHeaders(); // Use the centralized CORS function
    }
}

// Start session if not already started - function already defined in database.php

// Authentication functions are already defined in database.php

// JSON response function is already defined in database.php
?>