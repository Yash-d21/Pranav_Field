@echo off
echo ========================================
echo Field Maintenance Tracker Setup
echo ========================================
echo.

echo Checking prerequisites...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available. Please reinstall Node.js
    pause
    exit /b 1
)

echo ✓ Node.js and npm are installed

:: Install dependencies
echo.
echo Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo ✓ Dependencies installed successfully

:: Check for XAMPP/WAMP
echo.
echo Checking for XAMPP/WAMP installation...

set XAMPP_PATH=
set WAMP_PATH=

if exist "C:\xampp\apache\bin\httpd.exe" (
    set XAMPP_PATH=C:\xampp
    echo ✓ XAMPP found at C:\xampp
) else if exist "C:\wamp64\bin\apache\apache2.4.54\bin\httpd.exe" (
    set WAMP_PATH=C:\wamp64
    echo ✓ WAMP found at C:\wamp64
) else (
    echo WARNING: XAMPP or WAMP not found in standard locations
    echo Please ensure you have XAMPP or WAMP installed
)

:: Copy files to web server directory
echo.
echo Setting up web server files...

if defined XAMPP_PATH (
    echo Copying files to XAMPP htdocs...
    if not exist "%XAMPP_PATH%\htdocs\field-maintenance" mkdir "%XAMPP_PATH%\htdocs\field-maintenance"
    xcopy /E /I /Y "src\*" "%XAMPP_PATH%\htdocs\field-maintenance\"
    echo ✓ Files copied to XAMPP
) else if defined WAMP_PATH (
    echo Copying files to WAMP www...
    if not exist "%WAMP_PATH%\www\field-maintenance" mkdir "%WAMP_PATH%\www\field-maintenance"
    xcopy /E /I /Y "src\*" "%WAMP_PATH%\www\field-maintenance\"
    echo ✓ Files copied to WAMP
) else (
    echo Please manually copy the 'src' folder to your web server directory
    echo XAMPP: C:\xampp\htdocs\field-maintenance\
    echo WAMP: C:\wamp64\www\field-maintenance\
)

echo.
echo ========================================
echo Setup Instructions
echo ========================================
echo.
echo 1. Start XAMPP or WAMP
echo    - Open XAMPP Control Panel or WAMP
echo    - Start Apache and MySQL services
echo.
echo 2. Create the database:
echo    - Open http://localhost/phpmyadmin
echo    - Go to SQL tab
echo    - Copy and paste the content from src\database\schema.sql
echo    - Click "Go" to execute
echo.
echo 3. Test the setup:
echo    - Open http://localhost/field-maintenance/php/test_connection.php
echo    - You should see a success message
echo.
echo 4. Start the frontend:
echo    - Run: npm run dev
echo    - Open http://localhost:3000
echo.
echo Default login credentials:
echo - Email: admin@fieldmaintenance.com
echo - Password: admin123
echo.
echo ========================================

pause
