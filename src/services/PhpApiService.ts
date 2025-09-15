/**
 * PHP API Service for Field Maintenance Tracker
 * Provides MySQL database backend through PHP API
 */

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export class PhpApiService {
  private static instance: PhpApiService;
  private baseUrl: string;

  private constructor() {
    // Auto-detect the correct base URL for PHP API
    this.baseUrl = 'http://localhost/field-maintenance/php';
    console.log('PHP API Service initialized with base URL:', this.baseUrl);
    console.log('PhpApiService version: 2.0 - Updated with saveRecord and getRecordsByType methods');
  }

  /**
   * Auto-detect the correct API URL based on current environment
   */
  private detectApiUrl(): string {
    const currentOrigin = window.location.origin;
    const currentPath = window.location.pathname;
    
    // Common PHP API URL patterns to try
    const possibleUrls = [
      // Same origin (if running from the same server)
      `${currentOrigin}/php`,
      `${currentOrigin}/field-maintenance/php`,
      
      // Standard XAMPP/WAMP patterns
      'http://localhost/field-maintenance/php',
      'http://localhost/php',
      'http://localhost:8080/field-maintenance/php',
      'http://localhost:8080/php',
      'http://127.0.0.1/field-maintenance/php',
      'http://127.0.0.1/php',
      
      // WAMP default ports
      'http://localhost:8000/field-maintenance/php',
      'http://localhost:8000/php',
    ];
    
    // Return the first URL in our list (we'll test it dynamically)
    return possibleUrls[0];
  }

  /**
   * Update the base URL manually
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
    console.log('PHP API base URL updated to:', this.baseUrl);
  }

  /**
   * Get current base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  static getInstance(): PhpApiService {
    if (!PhpApiService.instance) {
      PhpApiService.instance = new PhpApiService();
    }
    return PhpApiService.instance;
  }

  /**
   * Test connection to PHP backend with multiple URL attempts
   */
  async testConnection(): Promise<boolean> {
    const possibleUrls = [
      'http://localhost/field-maintenance/php',
      'http://localhost/php',
      'http://localhost:8000/php',
      'http://localhost:8000/field-maintenance/php',
      'http://localhost:8080/field-maintenance/php',
      'http://localhost:8080/php',
      'http://127.0.0.1/field-maintenance/php',
      'http://127.0.0.1/php',
      // Same origin attempts
      `${window.location.origin}/php`,
      `${window.location.origin}/field-maintenance/php`,
    ];

    console.log('Testing PHP API connection...');
    console.log('Current base URL:', this.baseUrl);
    
    // First try the current base URL
    if (await this.testSingleUrl(this.baseUrl)) {
      console.log('✅ PHP API connected successfully at:', this.baseUrl);
      return true;
    }

    console.log('❌ Initial URL failed, trying alternative URLs...');
    
    // Try each possible URL
    for (const url of possibleUrls) {
      if (url === this.baseUrl) continue; // Skip the one we already tried
      
      console.log(`🔍 Trying: ${url}`);
      if (await this.testSingleUrl(url)) {
        console.log('✅ PHP API found at:', url);
        this.baseUrl = url;
        return true;
      }
    }
    
    console.error('❌ PHP API connection failed. Please check:');
    console.error('1. XAMPP/WAMP is running');
    console.error('2. Apache and MySQL services are started');
    console.error('3. PHP files are in the correct directory');
    console.error('4. Database is created using the SQL script');
    console.error('5. Test the API directly: http://localhost/field-maintenance/php/test_connection.php');
    
    return false;
  }

  /**
   * Test a single URL for API connectivity
   */
  private async testSingleUrl(url: string): Promise<boolean> {
    try {
      console.log(`Testing URL: ${url}`);
      
      // Try the test_connection endpoint directly
      const testResponse = await fetch(`${url}/test_connection.php`, {
        method: 'GET',
        credentials: 'include',
        signal: AbortSignal.timeout(5000)
      });
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log(`✅ API response from ${url}:`, testData);
        return testData.status === 'success';
      } else {
        console.log(`❌ API response failed from ${url}:`, testResponse.status, testResponse.statusText);
        return false;
      }
    } catch (error) {
      console.log(`❌ Network error for ${url}:`, error.message);
      return false;
    }
  }

  /**
   * Authenticate user
   */
  async authenticateUser(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'login',
          email,
          password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      return data.user;
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
      const response = await fetch(`${this.baseUrl}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'check_session' })
      });

      const data = await response.json();
      
      if (response.ok && data.authenticated) {
        return data.user;
      }
      
      return null;
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
      await fetch(`${this.baseUrl}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'logout' })
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Create a new record
   */
  async createRecord(type: string, data: any): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/records.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type,
          ...data
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create record');
      }

      return result.id.toString();
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
      const response = await fetch(`${this.baseUrl}/records.php`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch records');
      }

      return data.records || [];
    } catch (error) {
      console.error('Get all records error:', error);
      throw error;
    }
  }

  /**
   * Get records method for backward compatibility with existing components
   */
  async getRecords(): Promise<any[]> {
    return this.getAllRecords();
  }

  /**
   * Save record method for backward compatibility with existing components
   */
  async saveRecord(type: string, data: any): Promise<string> {
    return this.createRecord(type, data);
  }

  /**
   * Get records by type for forms
   */
  async getRecordsByType(type: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/records.php?type=${type}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch records');
      }

      return data.records || [];
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
      const response = await fetch(`${this.baseUrl}/users.php`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      return data.users || [];
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  /**
   * Sign up a new user (public signup)
   */
  async signUp(userData: { email: string; name: string; password: string; role?: string }): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'signup',
          ...userData
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      if (result.success && result.user) {
        return result.user;
      } else {
        throw new Error('Invalid response from server');
      }
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
      const response = await fetch(`${this.baseUrl}/users.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      return result.id.toString();
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  /**
   * Update user (admin only)
   */
  async updateUser(id: string, userData: Partial<{ email: string; name: string; password: string; role: string }>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id, ...userData })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(id: string, role: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id, role })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  /**
   * Reset user password (admin only)
   */
  async resetUserPassword(id: string): Promise<{ newPassword: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/users.php`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          action: 'reset_password',
          id 
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }

      return { newPassword: result.newPassword };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Cleanup method for compatibility with existing code
   */
  cleanup(): void {
    // No cleanup needed for fetch-based API calls
    console.log('PHP API Service cleanup called');
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