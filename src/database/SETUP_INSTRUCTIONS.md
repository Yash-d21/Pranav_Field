# Database Setup Instructions

## Supabase Setup

To fix the database connection errors, you need to run the SQL schema in your Supabase project:

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/pdolrbhainmdoigdhkte/sql

2. **Run the Schema**
   - Copy the contents of `database/supabase_schema.sql`
   - Paste it into the SQL Editor in your Supabase dashboard
   - Click "Run" to execute the script

3. **Verify Tables Created**
   - Go to the Database section in your Supabase dashboard
   - You should see these tables:
     - `users`
     - `punch_in_records`
     - `corrective_maintenance_records`
     - `preventive_maintenance_records`
     - `change_request_records`
     - `gp_live_check_records`
     - `patroller_records`

4. **Test the Connection**
   - After running the schema, refresh your application
   - The Supabase connection status should show "Connected"
   - You should be able to log in with:
     - Email: `admin@fieldmaintenance.com`
     - Password: `admin123`

## What This Fixes

The error you were seeing (`Could not find the table 'public.kv_store_999544d1'`) was because:

1. The old system was trying to use a key-value store table that didn't exist
2. The Edge Functions were outdated and using the wrong approach
3. The application now connects directly to proper relational database tables

## Default Users

The schema creates two default users:
- **Admin**: `admin@fieldmaintenance.com` / `admin123`
- **User**: `user@fieldmaintenance.com` / `user123`

You can modify these or create new users through the User Management interface once logged in as admin.

## Security Note

In production, make sure to:
1. Use proper password hashing
2. Set up more restrictive Row Level Security (RLS) policies
3. Use environment variables for sensitive data