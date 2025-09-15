-- Field Maintenance Tracker Database Schema
-- Run this SQL script in phpMyAdmin to create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS field_maintenance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE field_maintenance;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, name, password, role) VALUES 
('admin@fieldmaintenance.com', 'System Administrator', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- Punch In Records table
CREATE TABLE IF NOT EXISTS punch_in_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp)
);

-- Corrective Maintenance Records table
CREATE TABLE IF NOT EXISTS corrective_maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    issue TEXT NOT NULL,
    tt_number VARCHAR(100) NOT NULL,
    damage_reason TEXT NOT NULL,
    restoration_possible_as_per_sla BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    timestamp DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_status (status)
);

-- Preventive Maintenance Records table
CREATE TABLE IF NOT EXISTS preventive_maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    mandal_name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    no_of_gps INT NOT NULL DEFAULT 0,
    otdr_testing_from_location TEXT NOT NULL,
    otdr_testing_to_location TEXT NOT NULL,
    gp_span_name VARCHAR(255) NOT NULL,
    fiber_tests JSON, -- Store fiber test data as JSON
    timestamp DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_mandal (mandal_name)
);

-- Change Request Records table
CREATE TABLE IF NOT EXISTS change_request_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    mandal_name VARCHAR(255) NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    gp_span_name VARCHAR(255) NOT NULL,
    change_request_no VARCHAR(100) NOT NULL,
    reason_for_activity TEXT NOT NULL,
    material_consumed_ofc DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    material_consumed_poles INT NOT NULL DEFAULT 0,
    timestamp DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_change_request_no (change_request_no)
);

-- GP Live Check Records table
CREATE TABLE IF NOT EXISTS gp_live_check_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    mandal VARCHAR(255) NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    gp_name VARCHAR(255) NOT NULL,
    fdms_issue BOOLEAN NOT NULL DEFAULT FALSE,
    termination_issue BOOLEAN NOT NULL DEFAULT FALSE,
    re_location BOOLEAN NOT NULL DEFAULT FALSE,
    fiber_issue BOOLEAN NOT NULL DEFAULT FALSE,
    issue_details TEXT,
    rack_installed BOOLEAN NOT NULL DEFAULT FALSE,
    router_issue BOOLEAN NOT NULL DEFAULT FALSE,
    sfp_module BOOLEAN NOT NULL DEFAULT FALSE,
    ups_issue BOOLEAN NOT NULL DEFAULT FALSE,
    mcb_issue BOOLEAN NOT NULL DEFAULT FALSE,
    trough_raw_power_router BOOLEAN NOT NULL DEFAULT FALSE,
    apsfl_power_meter_connection BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_mandal (mandal)
);

-- Patroller Task Records table
CREATE TABLE IF NOT EXISTS patroller_task_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    mandal_name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    no_of_gps INT NOT NULL DEFAULT 0,
    gp_span_name VARCHAR(255) NOT NULL,
    sag_location_identified BOOLEAN NOT NULL DEFAULT FALSE,
    sag_location_photos JSON, -- Store photo data as JSON
    clamp_damaged BOOLEAN NOT NULL DEFAULT FALSE,
    clamp_damage_photos JSON,
    tension_clamp_count INT NOT NULL DEFAULT 0,
    suspension_clamp_count INT NOT NULL DEFAULT 0,
    new_pole_bend_identified BOOLEAN NOT NULL DEFAULT FALSE,
    pole_damage BOOLEAN NOT NULL DEFAULT FALSE,
    pole_damage_photos JSON,
    pole_bend_new_poles BOOLEAN NOT NULL DEFAULT FALSE,
    pole_bend_photos JSON,
    loop_stand_issues BOOLEAN NOT NULL DEFAULT FALSE,
    loop_stand_photos JSON,
    tree_cutting_activity BOOLEAN NOT NULL DEFAULT FALSE,
    tree_cutting_photos JSON,
    joint_enclosure_problems BOOLEAN NOT NULL DEFAULT FALSE,
    joint_enclosure_photos JSON,
    cut_location_identified BOOLEAN NOT NULL DEFAULT FALSE,
    cut_location_photos JSON,
    other_activities_description TEXT,
    other_activities_photos JSON,
    timestamp DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_mandal (mandal_name)
);

-- Activity Log table for audit trail
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);