/**
 * Supabase Service for Field Maintenance Tracker
 * Modern cloud-based backend with real-time capabilities
 */

import { supabase, Database } from '../lib/supabase'

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export class SupabaseService {
  private static instance: SupabaseService;

  private constructor() {
    console.log('Supabase Service initialized');
  }

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Test connection to Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        return false;
      }
      
      console.log('✅ Supabase connected successfully');
      return true;
    } catch (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
  }

  /**
   * Authenticate user with email and password
   */
  async authenticateUser(email: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Authentication failed');
      }

      // Get user profile from our users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('User profile not found');
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Check current session
   */
  async checkSession(): Promise<User | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        return null;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        return null;
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role
      };
    } catch (error) {
      console.error('Session check error:', error);
      return null;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Create a new record
   */
  async createRecord(type: string, data: any): Promise<string> {
    try {
      const tableName = this.getTableName(type);
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select('id')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return result.id;
    } catch (error) {
      console.error('Create record error:', error);
      throw error;
    }
  }

  /**
   * Get all records for admin dashboard
   */
  async getAllRecords(): Promise<any[]> {
    try {
      const allRecords = [];

      // Get all record types
      const recordTypes = [
        'punch_in_records',
        'corrective_maintenance_records',
        'preventive_maintenance_records',
        'change_request_records',
        'gp_live_check_records',
        'patroller_task_records'
      ];

      for (const tableName of recordTypes) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
          continue;
        }

        // Add record type to each record
        const recordsWithType = data.map(record => ({
          ...record,
          activityType: this.getActivityType(tableName)
        }));

        allRecords.push(...recordsWithType);
      }

      // Sort by created_at

    } catch (error) {
      console.error('Get all records error:', error);
      throw error;
    }
  }

  /**
   * Get records method for backward compatibility
   */
  async getRecords(): Promise<any[]> {
    return this.getAllRecords();
  }

  /**
   * Save record method for backward compatibility
   */
  async saveRecord(type: string, data: any): Promise<string> {
    return this.createRecord(type, data);
  }

  /**
   * Get records by type
   */
  async getRecordsByType(type: string): Promise<any[]> {
    try {
      const tableName = this.getTableName(type);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Get records by type error:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  /**
   * Sign up a new user
   */
  async signUp(userData: { email: string; name: string; password: string; role?: string }): Promise<User> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role || 'user'
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(userData: { email: string; name: string; password: string; role?: string }): Promise<string> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role || 'user'
        })
        .select('id')
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      return profile.id;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: Partial<{ email: string; name: string; role: string }>): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      // Delete from users table first
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      
      if (authError) {
        console.warn('Auth user deletion failed:', authError.message);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  /**
   * Reset user password
   */
  async resetUserPassword(id: string): Promise<{ newPassword: string }> {
    try {
      const newPassword = Math.random().toString(36).slice(-8);
      
      const { error } = await supabase.auth.admin.updateUserById(id, {
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      return { newPassword };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Cleanup method for compatibility
   */
  cleanup(): void {
    console.log('Supabase Service cleanup called');
  }

  // Helper methods
  private getTableName(type: string): string {
    const typeMap: { [key: string]: string } = {
      'punch_in': 'punch_in_records',
      'corrective_maintenance': 'corrective_maintenance_records',
      'preventive_maintenance': 'preventive_maintenance_records',
      'change_request': 'change_request_records',
      'gp_live_check': 'gp_live_check_records',
      'patroller_task': 'patroller_task_records'
    };
    return typeMap[type] || type;
  }

  private getActivityType(tableName: string): string {
    const typeMap: { [key: string]: string } = {
      'punch_in_records': 'Daily Punch-In',
      'corrective_maintenance_records': 'Corrective Maintenance',
      'preventive_maintenance_records': 'Preventive Maintenance',
      'change_request_records': 'Change Request',
      'gp_live_check_records': 'GP Live Check',
      'patroller_task_records': 'Patroller Task'
    };
    return typeMap[tableName] || tableName;
  }

  // Specific record creation methods for type safety
  async createPunchInRecord(data: any): Promise<string> {
    return this.createRecord('punch_in', data);
  }

  async createCorrectiveMaintenanceRecord(data: any): Promise<string> {
    return this.createRecord('corrective_maintenance', data);
  }

  async createPreventiveMaintenanceRecord(data: any): Promise<string> {
    return this.createRecord('preventive_maintenance', data);
  }

  async createChangeRequestRecord(data: any): Promise<string> {
    return this.createRecord('change_request', data);
  }

  async createGPLiveCheckRecord(data: any): Promise<string> {
    return this.createRecord('gp_live_check', data);
  }

  async createPatrollerRecord(data: any): Promise<string> {
    return this.createRecord('patroller_task', data);
  }
}
