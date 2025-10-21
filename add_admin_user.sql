-- Add Admin User to Database
-- Run this in Supabase SQL Editor

INSERT INTO users (id, email, name, role)
VALUES (
    '6561e1a7-28fa-4120-b467-22a0de05fd5f',
    'admin@fieldmaintenance.com',
    'System Administrator',
    'admin'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Verify the user was added
SELECT * FROM users WHERE id = '6561e1a7-28fa-4120-b467-22a0de05fd5f';
