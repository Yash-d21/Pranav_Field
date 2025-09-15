# PHP/MySQL Backend Setup Instructions

## Overview
The Field Maintenance Tracker has been migrated from Supabase to use a PHP/MySQL backend. This guide will help you set up the local development environment.

## Prerequisites
- XAMPP (or WAMP/LAMP) installed on your system
- Web browser
- Code editor

## Setup Steps

### 1. Install XAMPP
1. Download XAMPP from https://www.apachefriends.org/
2. Install XAMPP with Apache and MySQL components
3. Start Apache and MySQL services from the XAMPP Control Panel

### 2. Database Setup
1. Open phpMyAdmin in your browser: `http://localhost/phpmyadmin`
2. Click on "SQL" tab
3. Copy and paste the contents of `/database/schema.sql` into the SQL editor
4. Click "Go" to execute the SQL script
5. This will create:
   - Database: `field_maintenance`
   - All required tables with proper relationships
   - Default admin user (email: admin@fieldmaintenance.com, password: admin123)

### 3. PHP Files Setup
1. Copy the entire `/php` folder to your XAMPP htdocs directory:
   - Windows: `C:\xampp\htdocs\field-maintenance\php\`
   - macOS: `/Applications/XAMPP/htdocs/field-maintenance/php/`
   - Linux: `/opt/lampp/htdocs/field-maintenance/php/`

2. Ensure the PHP files have proper permissions (Linux/macOS):
   ```bash
   chmod 755 /opt/lampp/htdocs/field-maintenance/php/
   chmod 644 /opt/lampp/htdocs/field-maintenance/php/*.php
   ```

### 4. Configure API URL
1. Open `/services/PhpApiService.ts`
2. Update the `baseUrl` in the constructor:
   ```typescript
   this.baseUrl = 'http://localhost/field-maintenance/php';
   ```
   - Change `field-maintenance` to match your folder name in htdocs

### 5. Test the Setup
1. Start your React development server
2. Open the application in your browser
3. You should see "PHP API Connected" in the header
4. Try logging in with:
   - **Admin**: admin@fieldmaintenance.com / admin123
   - **User**: user@fieldmaintenance.com / admin123
   - Or use the demo login buttons

## API Endpoints

The PHP backend provides the following endpoints:

### Authentication (`auth.php`)
- `POST` - Login user
- `POST` - Logout user  
- `POST` - Check session

### Records (`records.php`)
- `POST` - Create new maintenance record
- `GET` - Get all records (admin dashboard)

### Users (`users.php`) - Admin Only
- `GET` - Get all users
- `POST` - Create new user
- `PUT` - Update user
- `DELETE` - Delete user

## Database Structure

### Tables Created:
- `users` - User accounts and authentication
- `punch_in_records` - Daily punch-in entries
- `corrective_maintenance_records` - Corrective maintenance tasks
- `preventive_maintenance_records` - Preventive maintenance tasks
- `change_request_records` - Change request records
- `gp_live_check_records` - GP live check entries
- `patroller_records` - Patroller task records

## Security Features
- Password hashing using PHP's `password_hash()`
- Session-based authentication
- CORS headers for API security
- SQL injection prevention using prepared statements
- Role-based access control

## Troubleshooting

### Common Issues:

1. **"PHP API Disconnected" error**
   - Ensure Apache is running in XAMPP
   - Check that PHP files are in the correct htdocs folder
   - Verify the API URL in PhpApiService.ts

2. **Database connection errors**
   - Ensure MySQL is running in XAMPP
   - Check database credentials in `config.php`
   - Verify the database was created properly

3. **Login failures**
   - Check that the schema.sql was executed completely
   - Verify default users were inserted
   - Check browser console for error messages

4. **CORS errors**
   - Ensure `setCORSHeaders()` is called in PHP files
   - Check that credentials are included in fetch requests

### Development Tips:
- Check Apache error logs: `xampp/apache/logs/error.log`
- Use browser developer tools to monitor network requests
- Check PHP errors in the browser console
- Test API endpoints directly using tools like Postman

## Production Deployment
For production deployment:
1. Upload PHP files to your web hosting
2. Create MySQL database on your hosting provider
3. Import the schema.sql file
4. Update the API URL in PhpApiService.ts to your live domain
5. Configure proper SSL certificates for HTTPS

## Next Steps
Once the setup is complete, you can:
- Create user accounts through the application
- Submit maintenance forms
- View admin dashboard with all records
- Manage users through the admin interface