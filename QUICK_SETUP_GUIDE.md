# Quick Setup Guide - Field Maintenance Tracking System

## 🚀 5-Minute Setup for Company IT Team

### Prerequisites Checklist
- [ ] Windows computer with admin access
- [ ] Internet connection for downloads
- [ ] At least 4GB free disk space

---

## Step 1: Install XAMPP (2 minutes)

1. **Download XAMPP**:
   - Go to: https://www.apachefriends.org/download.html
   - Click "Download" for Windows version
   - Run the downloaded file as Administrator

2. **Install XAMPP**:
   - Click "Next" through the installer
   - Select Apache and MySQL (default)
   - Click "Install"
   - Click "Finish" when done

---

## Step 2: Install the System (2 minutes)

1. **Extract Project Files**:
   - Extract the project folder to: `C:\xampp\htdocs\field-maintenance\`
   - Make sure you see folders like `php`, `config`, `src` inside

2. **Start XAMPP**:
   - Open XAMPP Control Panel
   - Click "Start" next to Apache
   - Click "Start" next to MySQL
   - Both should turn green

---

## Step 3: Setup Database (1 minute)

1. **Open phpMyAdmin**:
   - Go to: http://localhost/phpmyadmin
   - Click "SQL" tab at the top

2. **Create Database**:
   - Copy ALL content from `database/create_database.sql`
   - Paste into the SQL box
   - Click "Go"
   - You should see "Query executed successfully"

---

## Step 4: Test the System

1. **Test Database**:
   - Go to: http://localhost/field-maintenance/php/test_connection.php
   - Should show success message with database info

2. **Test Application**:
   - Go to: http://localhost/field-maintenance/
   - Should see login page
   - Login with: `admin@fieldmaintenance.com` / `admin123`

---

## ✅ You're Done!

The system is now ready for use. See the full `COMPANY_INSTRUCTION_MANUAL.md` for detailed user guides and troubleshooting.

### Default Login
- **Admin**: admin@fieldmaintenance.com / admin123
- **User**: user@fieldmaintenance.com / user123

### Next Steps
1. Change default passwords
2. Create user accounts for field workers
3. Train users on the system
4. Set up regular backups

---

## 🆘 Need Help?

**Quick Fixes**:
- **Can't access system**: Check XAMPP is running (green lights)
- **Database error**: Re-run the SQL script in phpMyAdmin
- **Login issues**: Clear browser cache and try again

**Full Support**: See `COMPANY_INSTRUCTION_MANUAL.md` for complete troubleshooting guide.
