-- Field Maintenance Tracking System Database Schema
-- For use with PHPMyAdmin/XAMPP MySQL

CREATE DATABASE IF NOT EXISTS field_maintenance;
USE field_maintenance;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Daily Punch-In records
CREATE TABLE punch_in_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    activity_type VARCHAR(50) DEFAULT 'punch_in',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Corrective Maintenance records
CREATE TABLE corrective_maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    issue TEXT NOT NULL,
    tt_number VARCHAR(100) NOT NULL,
    damage_reason TEXT NOT NULL,
    restoration_possible_as_per_sla BOOLEAN NOT NULL,
    status VARCHAR(100) NOT NULL,
    activity_type VARCHAR(50) DEFAULT 'corrective_maintenance',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Preventive Maintenance records
CREATE TABLE preventive_maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    mandal_name VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    no_of_gps INT NOT NULL,
    otdr_testing_from_location VARCHAR(500) NOT NULL,
    otdr_testing_to_location VARCHAR(500) NOT NULL,
    gp_span_name VARCHAR(255) NOT NULL,
    fiber_tests JSON,
    activity_type VARCHAR(50) DEFAULT 'preventive_maintenance',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Change Request records
CREATE TABLE change_request_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    mandal_name VARCHAR(255) NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    gp_span_name VARCHAR(255) NOT NULL,
    change_request_no VARCHAR(100) NOT NULL,
    reason_for_activity TEXT NOT NULL,
    material_consumed_ofc DECIMAL(10,2) NOT NULL,
    material_consumed_poles INT NOT NULL,
    activity_type VARCHAR(50) DEFAULT 'change_request',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- GP Live Check records
CREATE TABLE gp_live_check_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    mandal VARCHAR(255) NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    gp_name VARCHAR(255) NOT NULL,
    fdms_issue BOOLEAN NOT NULL,
    termination_issue BOOLEAN NOT NULL,
    re_location BOOLEAN NOT NULL,
    fiber_issue BOOLEAN NOT NULL,
    issue_details TEXT,
    rack_installed BOOLEAN NOT NULL,
    router_issue BOOLEAN NOT NULL,
    sfp_module BOOLEAN NOT NULL,
    ups_issue BOOLEAN NOT NULL,
    mcb_issue BOOLEAN NOT NULL,
    trough_raw_power_router BOOLEAN NOT NULL,
    apsfl_power_meter_connection BOOLEAN NOT NULL,
    activity_type VARCHAR(50) DEFAULT 'gp_live_check',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Patroller Task records
CREATE TABLE patroller_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    mandal_name VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    no_of_gps INT NOT NULL,
    gp_span_name VARCHAR(255) NOT NULL,
    sag_location_identified BOOLEAN NOT NULL,
    sag_location_photos JSON,
    clamp_damaged BOOLEAN NOT NULL,
    clamp_damage_photos JSON,
    tension_clamp_count INT NOT NULL,
    suspension_clamp_count INT NOT NULL,
    new_pole_bend_identified BOOLEAN NOT NULL,
    pole_damage BOOLEAN NOT NULL,
    pole_damage_photos JSON,
    pole_bend_new_poles BOOLEAN NOT NULL,
    pole_bend_photos JSON,
    loop_stand_issues BOOLEAN NOT NULL,
    loop_stand_photos JSON,
    tree_cutting_activity BOOLEAN NOT NULL,
    tree_cutting_photos JSON,
    joint_enclosure_problems BOOLEAN NOT NULL,
    joint_enclosure_photos JSON,
    cut_location_identified BOOLEAN NOT NULL,
    cut_location_photos JSON,
    other_activities_description TEXT,
    other_activities_photos JSON,
    activity_type VARCHAR(50) DEFAULT 'patroller_task',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, name, password, role) VALUES 
('admin@fieldmaintenance.com', 'System Administrator', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('user@fieldmaintenance.com', 'Field User', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');