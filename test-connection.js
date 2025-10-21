// Test Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cocywsgybygqitlkxbfy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvY3l3c2d5YnlncWl0bGt4YmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODE1MDcsImV4cCI6MjA3NjQ1NzUwN30.WdQjT2r3IXuV--PVd5dDgajGi3oauoLois6Oex8-sP0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connected successfully!');
    
    // Test login
    console.log('🔐 Testing admin login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@fieldmaintenance.com',
      password: 'admin123'
    });
    
    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      return false;
    }
    
    console.log('✅ Login successful!');
    console.log('User ID:', loginData.user.id);
    
    return true;
  } catch (err) {
    console.log('❌ Test failed:', err.message);
    return false;
  }
}

testConnection();
