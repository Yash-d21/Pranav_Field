# Field Maintenance Tracking System - Company Instruction Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Installation Guide](#installation-guide)
4. [Configuration](#configuration)
5. [User Guide](#user-guide)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)
8. [Support](#support)

---

## System Overview

The Field Maintenance Tracking System is a comprehensive web-based application designed for field maintenance teams to:

- **Track daily punch-in/out** for field workers
- **Manage corrective maintenance** tasks and repairs
- **Schedule preventive maintenance** activities
- **Process change requests** for equipment or procedures
- **Conduct GP Live checks** for gas pipeline monitoring
- **Handle patroller tasks** and inspections
- **Capture photos and GPS locations** for all activities
- **Generate reports** and manage user accounts

### Key Features
- 📱 **Progressive Web App (PWA)** - Works on mobile devices
- 📸 **Photo capture** with camera integration
- 📍 **GPS location tracking** for all activities
- 👥 **User management** with role-based access
- 📊 **Admin dashboard** for comprehensive oversight
- 🔒 **Secure authentication** system
- 📱 **Offline capability** for field work

---

## Prerequisites

### Software Requirements
1. **Web Server Environment** (Choose one):
   - **XAMPP** (Recommended for Windows)
   - **WAMP** (Alternative for Windows)
   - **MAMP** (For Mac)
   - **LAMP** (For Linux)

2. **Database**:
   - **MySQL** 5.7+ (included with XAMPP/WAMP)

3. **Web Browser**:
   - Chrome, Firefox, Safari, or Edge (latest versions)
   - Mobile browsers for field use

4. **Node.js** (for development):
   - Node.js 16+ and npm

### Hardware Requirements
- **Minimum**: 4GB RAM, 2GB free disk space
- **Recommended**: 8GB RAM, 5GB free disk space
- **Mobile devices**: Android 7+ or iOS 12+

---

## Installation Guide

### Step 1: Download and Install XAMPP

1. **Download XAMPP**:
   - Visit: https://www.apachefriends.org/download.html
   - Download the latest version for your operating system
   - Run the installer as Administrator

2. **Install XAMPP**:
   - Follow the installation wizard
   - Select Apache and MySQL components
   - Note the installation directory (usually `C:\xampp\`)

### Step 2: Install the Field Maintenance System

1. **Extract the project files**:
   - Extract the project folder to: `C:\xampp\htdocs\field-maintenance\`
   - Ensure the folder structure matches the project layout

2. **Start XAMPP services**:
   - Open XAMPP Control Panel
   - Start **Apache** service (click "Start")
   - Start **MySQL** service (click "Start")
   - Both should show green "Running" status

### Step 3: Set Up the Database

1. **Access phpMyAdmin**:
   - Open your web browser
   - Go to: `http://localhost/phpmyadmin`

2. **Create the database**:
   - Click on "SQL" tab
   - Copy the entire content from `database/create_database.sql`
   - Paste it into the SQL editor
   - Click "Go" to execute

3. **Verify database creation**:
   - You should see a new database called `field_maintenance`
   - It should contain 7 tables with proper structure

### Step 4: Configure the System

1. **Update database configuration**:
   - Open `config/database.php`
   - Verify these settings match your XAMPP setup:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'field_maintenance');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   define('DB_PORT', 3306);
   ```

2. **Test the connection**:
   - Go to: `http://localhost/field-maintenance/php/test_connection.php`
   - You should see a success message with database details

### Step 5: Build and Deploy the Frontend

1. **Install dependencies**:
   ```bash
   cd "C:\xampp\htdocs\field-maintenance"
   npm install
   ```

2. **Build the application**:
   ```bash
   npm run build
   ```

3. **Access the application**:
   - Go to: `http://localhost/field-maintenance/`
   - The system should load with the login page

---

## Configuration

### Default Login Credentials

**Administrator Account**:
- Email: `admin@fieldmaintenance.com`
- Password: `admin123`

**Regular User Account**:
- Email: `user@fieldmaintenance.com`
- Password: `user123`

⚠️ **Important**: Change these passwords immediately after first login!

### System Configuration

1. **CORS Settings** (in `config/database.php`):
   ```php
   define('CORS_ORIGIN', 'http://localhost:3000');
   ```

2. **Debug Mode** (for production):
   ```php
   define('DEBUG_MODE', false);
   ```

3. **File Upload Settings**:
   - Photos are stored as base64 in the database
   - Maximum file size: 5MB per image
   - Supported formats: JPG, PNG, GIF

---

## User Guide

### Getting Started

1. **First Login**:
   - Open your web browser
   - Navigate to: `http://localhost/field-maintenance/`
   - Use admin credentials to log in
   - Change the default password immediately

2. **User Management** (Admin only):
   - Go to "User Management" in the admin dashboard
   - Create new user accounts for field workers
   - Assign appropriate roles and permissions

### Daily Operations

#### For Field Workers

1. **Daily Punch In**:
   - Click "Daily Punch In" from the main menu
   - Fill in your details and location
   - Take a selfie for verification
   - Submit the form

2. **Maintenance Tasks**:
   - **Corrective Maintenance**: For repairs and urgent fixes
   - **Preventive Maintenance**: For scheduled maintenance
   - **Change Requests**: For procedure or equipment changes
   - **GP Live Checks**: For gas pipeline monitoring
   - **Patroller Tasks**: For inspection rounds

3. **Photo and Location Capture**:
   - Use the camera button to take photos
   - Allow location access for GPS tracking
   - Photos and locations are automatically attached to forms

#### For Administrators

1. **Dashboard Overview**:
   - View all submitted records
   - Monitor field worker activities
   - Generate reports and analytics

2. **Record Management**:
   - View, edit, or delete any record
   - Filter records by date, user, or type
   - Export data for reporting

3. **User Management**:
   - Create new user accounts
   - Reset passwords
   - Manage user roles and permissions

### Mobile Usage

1. **Install as PWA**:
   - Open the app in Chrome on mobile
   - Tap the "Install" prompt when it appears
   - The app will work like a native mobile app

2. **Offline Capability**:
   - The app works offline for form filling
   - Data syncs when internet connection is restored
   - Photos and GPS data are stored locally until sync

---

## Troubleshooting

### Common Issues and Solutions

#### Database Connection Problems

**Issue**: "Connection failed" error
**Solution**:
1. Ensure MySQL is running in XAMPP
2. Check `config/database.php` settings
3. Verify database exists in phpMyAdmin

**Issue**: "Access denied" error
**Solution**:
1. Check DB_USER and DB_PASS in configuration
2. Verify MySQL user permissions
3. Try resetting MySQL password in XAMPP

#### Application Loading Issues

**Issue**: 404 Not Found errors
**Solution**:
1. Verify files are in correct directory (`C:\xampp\htdocs\field-maintenance\`)
2. Check Apache is running
3. Ensure proper file permissions

**Issue**: CORS errors in browser console
**Solution**:
1. Update CORS_ORIGIN in `config/database.php`
2. Clear browser cache and cookies
3. Check firewall settings

#### Mobile App Issues

**Issue**: Camera not working on mobile
**Solution**:
1. Ensure HTTPS is enabled (required for camera access)
2. Grant camera permissions in browser
3. Use Chrome or Safari for best compatibility

**Issue**: GPS location not working
**Solution**:
1. Allow location access when prompted
2. Check device location services are enabled
3. Ensure GPS is turned on

### Performance Issues

**Issue**: Slow loading times
**Solution**:
1. Check available disk space
2. Optimize database (remove old records)
3. Clear browser cache
4. Check server resources

**Issue**: Large file uploads failing
**Solution**:
1. Reduce photo file sizes
2. Check PHP upload limits
3. Ensure sufficient disk space

---

## Maintenance

### Regular Maintenance Tasks

#### Daily
- Monitor system performance
- Check for error logs
- Verify backup processes

#### Weekly
- Review user activity logs
- Clean up temporary files
- Check disk space usage

#### Monthly
- Update user passwords
- Review and archive old records
- Test backup and restore procedures
- Update system documentation

### Backup Procedures

1. **Database Backup**:
   ```bash
   mysqldump -u root -p field_maintenance > backup_YYYYMMDD.sql
   ```

2. **File Backup**:
   - Copy entire project folder
   - Include configuration files
   - Store in secure location

3. **Automated Backups**:
   - Set up scheduled tasks for daily backups
   - Test restore procedures regularly
   - Keep multiple backup copies

### Security Maintenance

1. **Password Management**:
   - Enforce strong password policies
   - Regular password updates
   - Disable unused accounts

2. **System Updates**:
   - Keep XAMPP updated
   - Update PHP and MySQL versions
   - Monitor security advisories

3. **Access Control**:
   - Review user permissions regularly
   - Remove access for departed employees
   - Audit login activities

---

## Support

### Getting Help

1. **Documentation**:
   - Check this manual first
   - Review setup instructions in `/src/database/`
   - Check troubleshooting section above

2. **System Diagnostics**:
   - Test connection: `http://localhost/field-maintenance/php/test_connection.php`
   - Check database: `http://localhost/phpmyadmin`
   - Review error logs in XAMPP

3. **Common Support Contacts**:
   - IT Administrator: [Your IT Contact]
   - System Developer: [Developer Contact]
   - Database Administrator: [DBA Contact]

### Emergency Procedures

1. **System Down**:
   - Check XAMPP services status
   - Restart Apache and MySQL
   - Check disk space and memory
   - Contact IT support immediately

2. **Data Loss**:
   - Stop all user activities
   - Restore from latest backup
   - Verify data integrity
   - Document the incident

3. **Security Breach**:
   - Change all passwords immediately
   - Disable affected accounts
   - Review access logs
   - Contact security team

### Training Resources

1. **User Training**:
   - Conduct hands-on training sessions
   - Provide user manuals for each role
   - Create video tutorials for common tasks

2. **Administrator Training**:
   - Database management basics
   - User account management
   - Backup and restore procedures
   - Security best practices

---

## Appendix

### File Structure Reference
```
field-maintenance/
├── config/
│   └── database.php          # Database configuration
├── php/
│   ├── auth.php              # Authentication
│   ├── records.php           # Records management
│   └── users.php             # User management
├── database/
│   └── create_database.sql   # Database schema
├── src/
│   ├── components/           # React components
│   ├── services/             # API services
│   └── utils/                # Utility functions
└── build/                    # Production build
```

### Default Database Tables
- `users` - User accounts and authentication
- `punch_in_records` - Daily attendance tracking
- `corrective_maintenance_records` - Repair and fix records
- `preventive_maintenance_records` - Scheduled maintenance
- `change_request_records` - Change requests
- `gp_live_check_records` - Gas pipeline checks
- `patroller_records` - Inspection records

### API Endpoints
- `POST /php/auth.php` - User authentication
- `GET /php/records.php` - Retrieve records
- `POST /php/records.php` - Create new records
- `PUT /php/records.php` - Update records
- `DELETE /php/records.php` - Delete records
- `GET /php/users.php` - User management

---

**Last Updated**: [Current Date]
**Version**: 1.0
**System Version**: Field Maintenance Tracking System v0.1.0

For technical support or questions about this manual, contact your system administrator.
