-- Field Maintenance Tracking System Database Schema
-- For use with Supabase PostgreSQL

-- Enable Row Level Security by default
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES REVOKE ALL ON TABLES FROM PUBLIC;

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Daily Punch-In records
CREATE TABLE IF NOT EXISTS public.punch_in_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    activity_type VARCHAR(50) DEFAULT 'punch_in',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.punch_in_records ENABLE ROW LEVEL SECURITY;

-- Corrective Maintenance records
CREATE TABLE IF NOT EXISTS public.corrective_maintenance_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    issue TEXT NOT NULL,
    tt_number VARCHAR(100) NOT NULL,
    damage_reason TEXT NOT NULL,
    restoration_possible_as_per_sla BOOLEAN NOT NULL,
    status VARCHAR(100) NOT NULL,
    activity_type VARCHAR(50) DEFAULT 'corrective_maintenance',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.corrective_maintenance_records ENABLE ROW LEVEL SECURITY;

-- Preventive Maintenance records
CREATE TABLE IF NOT EXISTS public.preventive_maintenance_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    mandal_name VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    no_of_gps INTEGER NOT NULL,
    otdr_testing_from_location VARCHAR(500) NOT NULL,
    otdr_testing_to_location VARCHAR(500) NOT NULL,
    gp_span_name VARCHAR(255) NOT NULL,
    fiber_tests JSONB,
    activity_type VARCHAR(50) DEFAULT 'preventive_maintenance',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.preventive_maintenance_records ENABLE ROW LEVEL SECURITY;

-- Change Request records
CREATE TABLE IF NOT EXISTS public.change_request_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    mandal_name VARCHAR(255) NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    gp_span_name VARCHAR(255) NOT NULL,
    change_request_no VARCHAR(100) NOT NULL,
    reason_for_activity TEXT NOT NULL,
    material_consumed_ofc DECIMAL(10,2) NOT NULL,
    material_consumed_poles INTEGER NOT NULL,
    activity_type VARCHAR(50) DEFAULT 'change_request',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.change_request_records ENABLE ROW LEVEL SECURITY;

-- GP Live Check records
CREATE TABLE IF NOT EXISTS public.gp_live_check_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.gp_live_check_records ENABLE ROW LEVEL SECURITY;

-- Patroller Task records
CREATE TABLE IF NOT EXISTS public.patroller_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    mandal_name VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    ring_name VARCHAR(255) NOT NULL,
    no_of_gps INTEGER NOT NULL,
    gp_span_name VARCHAR(255) NOT NULL,
    sag_location_identified BOOLEAN NOT NULL,
    sag_location_photos JSONB,
    clamp_damaged BOOLEAN NOT NULL,
    clamp_damage_photos JSONB,
    tension_clamp_count INTEGER NOT NULL,
    suspension_clamp_count INTEGER NOT NULL,
    new_pole_bend_identified BOOLEAN NOT NULL,
    pole_damage BOOLEAN NOT NULL,
    pole_damage_photos JSONB,
    pole_bend_new_poles BOOLEAN NOT NULL,
    pole_bend_photos JSONB,
    loop_stand_issues BOOLEAN NOT NULL,
    loop_stand_photos JSONB,
    tree_cutting_activity BOOLEAN NOT NULL,
    tree_cutting_photos JSONB,
    joint_enclosure_problems BOOLEAN NOT NULL,
    joint_enclosure_photos JSONB,
    cut_location_identified BOOLEAN NOT NULL,
    cut_location_photos JSONB,
    other_activities_description TEXT,
    other_activities_photos JSONB,
    activity_type VARCHAR(50) DEFAULT 'patroller_task',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.patroller_records ENABLE ROW LEVEL SECURITY;

-- Insert default admin user (password: admin123)
-- Note: In production, passwords should be properly hashed
INSERT INTO public.users (email, name, password, role) VALUES 
('admin@fieldmaintenance.com', 'System Administrator', 'admin123', 'admin'),
('user@fieldmaintenance.com', 'Field User', 'user123', 'user')
ON CONFLICT (email) DO NOTHING;

-- Create RLS policies that allow all operations for now
-- In production, you'd want more restrictive policies

-- Users policies
CREATE POLICY "Allow all operations on users" ON public.users
    FOR ALL USING (true);

-- Punch in records policies
CREATE POLICY "Allow all operations on punch_in_records" ON public.punch_in_records
    FOR ALL USING (true);

-- Corrective maintenance records policies
CREATE POLICY "Allow all operations on corrective_maintenance_records" ON public.corrective_maintenance_records
    FOR ALL USING (true);

-- Preventive maintenance records policies
CREATE POLICY "Allow all operations on preventive_maintenance_records" ON public.preventive_maintenance_records
    FOR ALL USING (true);

-- Change request records policies
CREATE POLICY "Allow all operations on change_request_records" ON public.change_request_records
    FOR ALL USING (true);

-- GP live check records policies
CREATE POLICY "Allow all operations on gp_live_check_records" ON public.gp_live_check_records
    FOR ALL USING (true);

-- Patroller records policies
CREATE POLICY "Allow all operations on patroller_records" ON public.patroller_records
    FOR ALL USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_punch_in_records_user_id ON public.punch_in_records(user_id);
CREATE INDEX IF NOT EXISTS idx_punch_in_records_created_at ON public.punch_in_records(created_at);

CREATE INDEX IF NOT EXISTS idx_corrective_maintenance_records_user_id ON public.corrective_maintenance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_corrective_maintenance_records_created_at ON public.corrective_maintenance_records(created_at);

CREATE INDEX IF NOT EXISTS idx_preventive_maintenance_records_user_id ON public.preventive_maintenance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_preventive_maintenance_records_created_at ON public.preventive_maintenance_records(created_at);

CREATE INDEX IF NOT EXISTS idx_change_request_records_user_id ON public.change_request_records(user_id);
CREATE INDEX IF NOT EXISTS idx_change_request_records_created_at ON public.change_request_records(created_at);

CREATE INDEX IF NOT EXISTS idx_gp_live_check_records_user_id ON public.gp_live_check_records(user_id);
CREATE INDEX IF NOT EXISTS idx_gp_live_check_records_created_at ON public.gp_live_check_records(created_at);

CREATE INDEX IF NOT EXISTS idx_patroller_records_user_id ON public.patroller_records(user_id);
CREATE INDEX IF NOT EXISTS idx_patroller_records_created_at ON public.patroller_records(created_at);