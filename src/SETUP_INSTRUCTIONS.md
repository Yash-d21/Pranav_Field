# Field Maintenance Tracker - MySQL Setup Instructions

This guide will help you set up the Field Maintenance Tracker system with MySQL database using XAMPP/WAMP.

## Prerequisites

1. **XAMPP** or **WAMP** installed on your system
2. **phpMyAdmin** (comes with XAMPP/WAMP)
3. **Node.js** and **npm** for the frontend (if running separately)

## Database Setup

### Step 1: Start XAMPP/WAMP
1. Start Apache and MySQL services from XAMPP/WAMP control panel
2. Ensure both services are running (green indicators)

### Step 2: Create Database
1. Open phpMyAdmin in your browser: `http://localhost/phpmyadmin`
2. Go to SQL tab
3. Copy and paste the entire content from `/database/create_database.sql`
4. Click "Go" to execute the SQL script

This will create:
- Database: `field_maintenance`
- All required tables with proper structure
- Default admin user: `admin@fieldmaintenance.com` / `admin123`

### Step 3: Configure Database Connection
Edit the file `/config/database.php` to match your setup:

```php
// Database Configuration - Update these values
define('DB_HOST', 'localhost');           // Usually 'localhost'
define('DB_NAME', 'field_maintenance');   // Database name (keep as is)
define('DB_USER', 'root');                // Your MySQL username
define('DB_PASS', '');                    // Your MySQL password (empty for XAMPP)
define('DB_PORT', 3306);                  // MySQL port
```

For **WAMP** users, you might need to change:
- `DB_USER` to your MySQL username
- `DB_PASS` to your MySQL password

### Step 4: Place PHP Files
1. Copy the entire project folder to your web server directory:
   - **XAMPP**: `C:\\xampp\\htdocs\\field-maintenance\\`
   - **WAMP**: `C:\\wamp64\\www\\field-maintenance\\`

2. Ensure the PHP files are accessible at:
   - `http://localhost/field-maintenance/php/test_connection.php`

### Step 5: Test Database Connection
1. Open your browser
2. Go to: `http://localhost/field-maintenance/php/test_connection.php`
3. You should see a JSON response like:
```json
{
  "status": "success",
  "message": "PHP API and MySQL database are working correctly",
  "database": "field_maintenance",
  "user_count": 1,
  "timestamp": "2024-XX-XX XX:XX:XX"
}
```

## Frontend Configuration

### Update API Base URL
In `/services/PhpApiService.ts`, update the `baseUrl` to match your setup:

```typescript
// For XAMPP
this.baseUrl = 'http://localhost/field-maintenance/php';

// For WAMP
this.baseUrl = 'http://localhost/field-maintenance/php';

// For custom port (if using non-standard port)
this.baseUrl = 'http://localhost:8080/field-maintenance/php';
```

### CORS Configuration
The CORS origin is set in `/config/database.php`:
```php
define('CORS_ORIGIN', 'http://localhost:3000'); // Update for your frontend URL
```

## Default Login Credentials

**Admin User:**
- Email: `admin@fieldmaintenance.com`
- Password: `admin123`

## Troubleshooting

### Database Connection Issues
1. **"Connection failed"**: Ensure MySQL is running in XAMPP/WAMP
2. **"Access denied"**: Check DB_USER and DB_PASS in `/config/database.php`
3. **"Database not found"**: Run the SQL script from `/database/create_database.sql`

### PHP API Issues
1. **404 Not Found**: Check if PHP files are in the correct web directory
2. **CORS Errors**: Update CORS_ORIGIN in `/config/database.php`
3. **Session Issues**: Ensure cookies are enabled in browser

### Common File Paths
- **XAMPP**: `C:\\xampp\\htdocs\\field-maintenance\\`
- **WAMP**: `C:\\wamp64\\www\\field-maintenance\\`
- **Database Config**: `/config/database.php`
- **Test URL**: `http://localhost/field-maintenance/php/test_connection.php`

## File Structure
```
field-maintenance/
├── config/
│   └── database.php          # Database configuration
├── php/
│   ├── auth.php              # Authentication endpoints
│   ├── config.php            # PHP configuration
│   ├── records.php           # Records CRUD operations
│   ├── test_connection.php   # Connection test
│   └── users.php             # User management
├── database/
│   └── create_database.sql   # Database schema
└── services/
    └── PhpApiService.ts      # Frontend API service
```

## Security Notes

1. Change default admin password after first login
2. In production, set `DEBUG_MODE = false` in `/config/database.php`
3. Use strong database passwords
4. Configure proper CORS origins for production

## Features

- ✅ Complete MySQL database backend
- ✅ PHP REST API endpoints
- ✅ Session-based authentication
- ✅ Admin dashboard with all records
- ✅ User management
- ✅ 6 specialized maintenance forms
- ✅ Photo upload support (stored as base64 in JSON)
- ✅ GPS location capture
- ✅ Real-time form validation

## Support

If you encounter issues:
1. Check XAMPP/WAMP services are running
2. Verify database exists in phpMyAdmin
3. Test connection endpoint first
4. Check browser console for errors
5. Review PHP error logs in XAMPP/WAMP logs folder