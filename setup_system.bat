@echo off
echo ========================================
echo Field Maintenance Tracking System Setup
echo ========================================
echo.

echo Checking if XAMPP is installed...
if not exist "C:\xampp\xampp-control.exe" (
    echo ERROR: XAMPP not found at C:\xampp\
    echo Please install XAMPP first from https://www.apachefriends.org/
    pause
    exit /b 1
)

echo XAMPP found! Starting services...
echo.

echo Starting Apache service...
net start "Apache2.4" 2>nul
if %errorlevel% neq 0 (
    echo Starting Apache via XAMPP Control Panel...
    start "" "C:\xampp\xampp-control.exe"
    echo Please start Apache manually in the XAMPP Control Panel
    echo Press any key when Apache is running...
    pause >nul
)

echo Starting MySQL service...
net start "mysql" 2>nul
if %errorlevel% neq 0 (
    echo Starting MySQL via XAMPP Control Panel...
    start "" "C:\xampp\xampp-control.exe"
    echo Please start MySQL manually in the XAMPP Control Panel
    echo Press any key when MySQL is running...
    pause >nul
)

echo.
echo Checking if project files are in correct location...
if not exist "C:\xampp\htdocs\field-maintenance\config\database.php" (
    echo ERROR: Project files not found at C:\xampp\htdocs\field-maintenance\
    echo Please copy the project files to the correct location first
    pause
    exit /b 1
)

echo Project files found!
echo.

echo Testing database connection...
curl -s "http://localhost/field-maintenance/php/test_connection.php" >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Could not test database connection
    echo Please ensure:
    echo 1. Apache and MySQL are running
    echo 2. Database has been created (run create_database.sql in phpMyAdmin)
    echo 3. Project files are in C:\xampp\htdocs\field-maintenance\
    echo.
    echo Opening phpMyAdmin for database setup...
    start "" "http://localhost/phpmyadmin"
    echo.
    echo Please run the SQL script from database/create_database.sql
    echo Press any key when database is ready...
    pause >nul
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo System URLs:
echo - Main Application: http://localhost/field-maintenance/
echo - Database Admin: http://localhost/phpmyadmin
echo - Connection Test: http://localhost/field-maintenance/php/test_connection.php
echo.
echo Default Login:
echo - Admin: admin@fieldmaintenance.com / admin123
echo - User: user@fieldmaintenance.com / user123
echo.
echo IMPORTANT: Change default passwords after first login!
echo.
echo Opening the application...
start "" "http://localhost/field-maintenance/"

echo.
echo Press any key to exit...
pause >nul
