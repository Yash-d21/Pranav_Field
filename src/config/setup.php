<?php
/**
 * Database Configuration Setup Interface
 * A simple web interface to configure database credentials
 */

$config_file = __DIR__ . '/database.php';
$success_message = '';
$error_message = '';

// Handle form submission
if ($_POST && isset($_POST['update_config'])) {
    $db_host = $_POST['db_host'] ?? 'localhost';
    $db_name = $_POST['db_name'] ?? 'field_maintenance';
    $db_user = $_POST['db_user'] ?? 'root';
    $db_pass = $_POST['db_pass'] ?? '';
    $db_port = $_POST['db_port'] ?? '3306';
    $cors_origin = $_POST['cors_origin'] ?? 'http://localhost:3000';
    
    $config_content = '<?php
/**
 * Database Configuration File
 * 
 * Update these credentials to match your MySQL/phpMyAdmin setup
 * This file should be included in all PHP scripts that need database access
 */

// Database Configuration
define(\'DB_HOST\', \'' . addslashes($db_host) . '\');           // Usually \'localhost\' for XAMPP/WAMP
define(\'DB_NAME\', \'' . addslashes($db_name) . '\');   // Your database name
define(\'DB_USER\', \'' . addslashes($db_user) . '\');                // Your MySQL username (usually \'root\' for local)
define(\'DB_PASS\', \'' . addslashes($db_pass) . '\');                    // Your MySQL password (usually empty for local XAMPP)
define(\'DB_PORT\', ' . intval($db_port) . ');                  // MySQL port (usually 3306)
define(\'DB_CHARSET\', \'utf8mb4\');          // Database charset

// Application Configuration
define(\'APP_NAME\', \'Field Maintenance Tracker\');
define(\'SESSION_NAME\', \'field_maintenance_session\');

// CORS Configuration
define(\'CORS_ORIGIN\', \'' . addslashes($cors_origin) . '\'); // Update this to match your frontend URL

// Error Reporting (set to false in production)
define(\'DEBUG_MODE\', true);

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
    header("Access-Control-Allow-Origin: " . CORS_ORIGIN);
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json");
    
    // Handle preflight requests
    if ($_SERVER[\'REQUEST_METHOD\'] === \'OPTIONS\') {
        http_response_code(200);
        exit();
    }
}

/**
 * Start session with proper configuration
 */
function startSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_name(SESSION_NAME);
        session_start();
    }
}

/**
 * Send JSON response
 * 
 * @param array $data
 * @param int $statusCode
 */
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

/**
 * Log error messages
 * 
 * @param string $message
 */
function logError($message) {
    if (DEBUG_MODE) {
        error_log(date(\'[Y-m-d H:i:s] \') . $message . PHP_EOL, 3, __DIR__ . \'/../logs/error.log\');
    }
}

// Create logs directory if it doesn\'t exist
if (!file_exists(__DIR__ . \'/../logs\')) {
    mkdir(__DIR__ . \'/../logs\', 0755, true);
}
?>';

    if (file_put_contents($config_file, $config_content)) {
        $success_message = 'Configuration updated successfully!';
        
        // Test the connection
        try {
            include $config_file;
            $pdo = getDatabaseConnection();
            $success_message .= ' Database connection test successful.';
        } catch (Exception $e) {
            $error_message = 'Configuration saved but connection test failed: ' . $e->getMessage();
        }
    } else {
        $error_message = 'Failed to write configuration file. Check file permissions.';
    }
}

// Read current configuration
$current_config = [
    'db_host' => 'localhost',
    'db_name' => 'field_maintenance',
    'db_user' => 'root',
    'db_pass' => '',
    'db_port' => '3306',
    'cors_origin' => 'http://localhost:3000'
];

if (file_exists($config_file)) {
    $config_content = file_get_contents($config_file);
    preg_match("/define\('DB_HOST',\s*'([^']*)'\)/", $config_content, $matches);
    if ($matches) $current_config['db_host'] = $matches[1];
    
    preg_match("/define\('DB_NAME',\s*'([^']*)'\)/", $config_content, $matches);
    if ($matches) $current_config['db_name'] = $matches[1];
    
    preg_match("/define\('DB_USER',\s*'([^']*)'\)/", $config_content, $matches);
    if ($matches) $current_config['db_user'] = $matches[1];
    
    preg_match("/define\('DB_PASS',\s*'([^']*)'\)/", $config_content, $matches);
    if ($matches) $current_config['db_pass'] = $matches[1];
    
    preg_match("/define\('DB_PORT',\s*(\d+)\)/", $config_content, $matches);
    if ($matches) $current_config['db_port'] = $matches[1];
    
    preg_match("/define\('CORS_ORIGIN',\s*'([^']*)'\)/", $config_content, $matches);
    if ($matches) $current_config['cors_origin'] = $matches[1];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Field Maintenance Tracker - Database Setup</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .subtitle {
            color: #666;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
        }
        
        input[type="text"], input[type="password"], input[type="number"] {
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input:focus {
            outline: none;
            border-color: #4CAF50;
        }
        
        .btn {
            background: #4CAF50;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #45a049;
        }
        
        .alert {
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .info-box {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .info-box h3 {
            color: #1976d2;
            margin-bottom: 10px;
        }
        
        .help-text {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        
        .test-links {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        
        .test-links a {
            color: #4CAF50;
            text-decoration: none;
            margin: 0 10px;
        }
        
        .test-links a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Field Maintenance Tracker</h1>
        <p class="subtitle">Database Configuration Setup</p>
        
        <?php if ($success_message): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($success_message); ?></div>
        <?php endif; ?>
        
        <?php if ($error_message): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($error_message); ?></div>
        <?php endif; ?>
        
        <div class="info-box">
            <h3>📋 Setup Instructions</h3>
            <p>1. Make sure XAMPP/WAMP is running with Apache and MySQL services</p>
            <p>2. Create the database by running the SQL script from <code>/database/create_database.sql</code> in phpMyAdmin</p>
            <p>3. Configure your database credentials below</p>
            <p>4. Test the connection using the links at the bottom</p>
        </div>
        
        <form method="POST">
            <div class="form-group">
                <label for="db_host">Database Host:</label>
                <input type="text" id="db_host" name="db_host" value="<?php echo htmlspecialchars($current_config['db_host']); ?>" required>
                <div class="help-text">Usually 'localhost' for local development</div>
            </div>
            
            <div class="form-group">
                <label for="db_name">Database Name:</label>
                <input type="text" id="db_name" name="db_name" value="<?php echo htmlspecialchars($current_config['db_name']); ?>" required>
                <div class="help-text">Keep as 'field_maintenance' if you used the provided SQL script</div>
            </div>
            
            <div class="form-group">
                <label for="db_user">Database Username:</label>
                <input type="text" id="db_user" name="db_user" value="<?php echo htmlspecialchars($current_config['db_user']); ?>" required>
                <div class="help-text">Usually 'root' for XAMPP, check WAMP settings</div>
            </div>
            
            <div class="form-group">
                <label for="db_pass">Database Password:</label>
                <input type="password" id="db_pass" name="db_pass" value="<?php echo htmlspecialchars($current_config['db_pass']); ?>">
                <div class="help-text">Usually empty for XAMPP, check WAMP settings</div>
            </div>
            
            <div class="form-group">
                <label for="db_port">Database Port:</label>
                <input type="number" id="db_port" name="db_port" value="<?php echo htmlspecialchars($current_config['db_port']); ?>" required>
                <div class="help-text">Usually 3306 for MySQL</div>
            </div>
            
            <div class="form-group">
                <label for="cors_origin">Frontend URL (CORS):</label>
                <input type="text" id="cors_origin" name="cors_origin" value="<?php echo htmlspecialchars($current_config['cors_origin']); ?>" required>
                <div class="help-text">URL where your React app is running (e.g., http://localhost:3000)</div>
            </div>
            
            <button type="submit" name="update_config" class="btn">💾 Update Configuration</button>
        </form>
        
        <div class="test-links">
            <strong>Test Your Setup:</strong><br>
            <a href="../php/test_connection.php" target="_blank">🔍 Test Database Connection</a>
            <a href="http://localhost/phpmyadmin" target="_blank">🗄️ Open phpMyAdmin</a>
        </div>
    </div>
</body>
</html>