-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    CASE 
      WHEN NEW.email ILIKE '%admin%' THEN 'admin'
      ELSE 'user'
    END,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user record when someone signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create RLS policies for users table
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert new users
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete users
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for all record tables
-- Punch-in records
ALTER TABLE punch_in_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own punch-in records" ON public.punch_in_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own punch-in records" ON public.punch_in_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all punch-in records" ON public.punch_in_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Corrective maintenance records
ALTER TABLE corrective_maintenance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own corrective records" ON public.corrective_maintenance_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own corrective records" ON public.corrective_maintenance_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all corrective records" ON public.corrective_maintenance_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Preventive maintenance records
ALTER TABLE preventive_maintenance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own preventive records" ON public.preventive_maintenance_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preventive records" ON public.preventive_maintenance_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all preventive records" ON public.preventive_maintenance_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Change request records
ALTER TABLE change_request_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own change request records" ON public.change_request_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own change request records" ON public.change_request_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all change request records" ON public.change_request_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- GP live check records
ALTER TABLE gp_live_check_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own GP live check records" ON public.gp_live_check_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own GP live check records" ON public.gp_live_check_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all GP live check records" ON public.gp_live_check_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Patroller task records
ALTER TABLE patroller_task_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own patroller records" ON public.patroller_task_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own patroller records" ON public.patroller_task_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all patroller records" ON public.patroller_task_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
