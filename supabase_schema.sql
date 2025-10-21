-- Field Maintenance Tracker - Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data, admins can read all
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can update their own data, admins can update all
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can insert users
CREATE POLICY "Only admins can insert users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete users
CREATE POLICY "Only admins can delete users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Punch In Records table
CREATE TABLE IF NOT EXISTS punch_in_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE punch_in_records ENABLE ROW LEVEL SECURITY;

-- Users can read their own records, admins can read all
CREATE POLICY "Users can read own punch records" ON punch_in_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all punch records" ON punch_in_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can insert their own records
CREATE POLICY "Users can insert own punch records" ON punch_in_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Corrective Maintenance Records table
CREATE TABLE IF NOT EXISTS corrective_maintenance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    issue TEXT NOT NULL,
    tt_number VARCHAR(100) NOT NULL,
    damage_reason TEXT NOT NULL,
    restoration_possible_as_per_sla BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE corrective_maintenance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own corrective records" ON corrective_maintenance_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all corrective records" ON corrective_maintenance_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert own corrective records" ON corrective_maintenance_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Preventive Maintenance Records table
CREATE TABLE IF NOT EXISTS preventive_maintenance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    mandal_name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    no_of_gps INTEGER NOT NULL DEFAULT 0,
    otdr_testing_from_location TEXT NOT NULL,
    otdr_testing_to_location TEXT NOT NULL,
    gp_span_name VARCHAR(255) NOT NULL,
    fiber_tests JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE preventive_maintenance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preventive records" ON preventive_maintenance_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all preventive records" ON preventive_maintenance_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert own preventive records" ON preventive_maintenance_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Change Request Records table
CREATE TABLE IF NOT EXISTS change_request_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    mandal_name VARCHAR(255) NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    gp_span_name VARCHAR(255) NOT NULL,
    change_request_no VARCHAR(100) NOT NULL,
    reason_for_activity TEXT NOT NULL,
    material_consumed_ofc DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    material_consumed_poles INTEGER NOT NULL DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE change_request_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own change request records" ON change_request_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all change request records" ON change_request_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert own change request records" ON change_request_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- GP Live Check Records table
CREATE TABLE IF NOT EXISTS gp_live_check_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE gp_live_check_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own gp live check records" ON gp_live_check_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all gp live check records" ON gp_live_check_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert own gp live check records" ON gp_live_check_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Patroller Task Records table
CREATE TABLE IF NOT EXISTS patroller_task_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    mandal_name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    no_of_gps INTEGER NOT NULL DEFAULT 0,
    gp_span_name VARCHAR(255) NOT NULL,
    sag_location_identified BOOLEAN NOT NULL DEFAULT FALSE,
    sag_location_photos JSONB,
    clamp_damaged BOOLEAN NOT NULL DEFAULT FALSE,
    clamp_damage_photos JSONB,
    tension_clamp_count INTEGER NOT NULL DEFAULT 0,
    suspension_clamp_count INTEGER NOT NULL DEFAULT 0,
    new_pole_bend_identified BOOLEAN NOT NULL DEFAULT FALSE,
    pole_damage BOOLEAN NOT NULL DEFAULT FALSE,
    pole_damage_photos JSONB,
    pole_bend_new_poles BOOLEAN NOT NULL DEFAULT FALSE,
    pole_bend_photos JSONB,
    loop_stand_issues BOOLEAN NOT NULL DEFAULT FALSE,
    loop_stand_photos JSONB,
    tree_cutting_activity BOOLEAN NOT NULL DEFAULT FALSE,
    tree_cutting_photos JSONB,
    joint_enclosure_problems BOOLEAN NOT NULL DEFAULT FALSE,
    joint_enclosure_photos JSONB,
    cut_location_identified BOOLEAN NOT NULL DEFAULT FALSE,
    cut_location_photos JSONB,
    other_activities_description TEXT,
    other_activities_photos JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE patroller_task_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own patroller records" ON patroller_task_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all patroller records" ON patroller_task_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can insert own patroller records" ON patroller_task_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activity Log table for audit trail
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read activity logs
CREATE POLICY "Only admins can read activity logs" ON activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert default admin user
-- Note: You'll need to create this user through Supabase Auth first
-- Then update the users table with the admin role

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_punch_in_user_id ON punch_in_records(user_id);
CREATE INDEX IF NOT EXISTS idx_punch_in_timestamp ON punch_in_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_corrective_user_id ON corrective_maintenance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_corrective_timestamp ON corrective_maintenance_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_preventive_user_id ON preventive_maintenance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_preventive_timestamp ON preventive_maintenance_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_change_request_user_id ON change_request_records(user_id);
CREATE INDEX IF NOT EXISTS idx_change_request_timestamp ON change_request_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_gp_live_check_user_id ON gp_live_check_records(user_id);
CREATE INDEX IF NOT EXISTS idx_gp_live_check_timestamp ON gp_live_check_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_patroller_user_id ON patroller_task_records(user_id);
CREATE INDEX IF NOT EXISTS idx_patroller_timestamp ON patroller_task_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
