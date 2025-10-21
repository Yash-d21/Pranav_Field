import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, RefreshCw, ExternalLink, Server, Database, Globe } from 'lucide-react';
import { SupabaseService } from '../services/SupabaseService';

interface DiagnosticStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: string;
  action?: () => Promise<void>;
}

export function SetupDiagnostic() {
  const [steps, setSteps] = useState<DiagnosticStep[]>([
    {
      id: 'supabase',
      name: 'Supabase Connection',
      status: 'pending',
      message: 'Testing Supabase connectivity...'
    },
    {
      id: 'database',
      name: 'Database Tables',
      status: 'pending',
      message: 'Verifying database schema...'
    },
    {
      id: 'auth',
      name: 'Authentication System',
      status: 'pending',
      message: 'Testing Supabase Auth...'
    },
    {
      id: 'admin',
      name: 'Admin User',
      status: 'pending',
      message: 'Checking admin user setup...'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [apiService] = useState(() => SupabaseService.getInstance());
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');

  const updateStep = (id: string, updates: Partial<DiagnosticStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    
    // Reset all steps
    setSteps(prev => prev.map(step => ({ 
      ...step, 
      status: 'pending' as const,
      message: undefined,
      details: undefined
    })));

    // Step 1: Test Supabase connection
    updateStep('supabase', { status: 'running', message: 'Testing Supabase connectivity...' });
    
    try {
      const connectionSuccess = await apiService.testConnection();
      if (connectionSuccess) {
        setSupabaseUrl('https://cocywsgybygqitlkxbfy.supabase.co');
        updateStep('supabase', { 
          status: 'success', 
          message: 'Supabase is connected',
          details: 'Database and API are accessible'
        });
      } else {
        updateStep('supabase', { 
          status: 'error', 
          message: 'Supabase connection failed',
          details: 'Check your internet connection and Supabase project status'
        });
      }
    } catch (error) {
      updateStep('supabase', { 
        status: 'error', 
        message: 'Supabase connection error',
        details: 'Could not connect to Supabase. Check your API keys.'
      });
    }

    // Step 2: Test database tables
    updateStep('database', { status: 'running', message: 'Checking database schema...' });
    
    try {
      // Try to get users to test if tables exist
      const users = await apiService.getAllUsers();
      updateStep('database', { 
        status: 'success', 
        message: 'Database tables are ready',
        details: `Found ${users.length} users in database`
      });
    } catch (error) {
      updateStep('database', { 
        status: 'error', 
        message: 'Database schema issue',
        details: 'Please run the supabase_schema.sql script in your Supabase dashboard'
      });
    }

    // Step 3: Test authentication
    updateStep('auth', { status: 'running', message: 'Testing Supabase Auth...' });
    
    try {
      const session = await apiService.checkSession();
      if (session) {
        updateStep('auth', { 
          status: 'success', 
          message: 'Authentication system ready',
          details: `Logged in as: ${session.email}`
        });
      } else {
        updateStep('auth', { 
          status: 'success', 
          message: 'Authentication system ready',
          details: 'Ready for user login'
        });
      }
    } catch (error) {
      updateStep('auth', { 
        status: 'error', 
        message: 'Authentication test failed',
        details: 'Supabase Auth is not properly configured'
      });
    }

    // Step 4: Check admin user
    updateStep('admin', { status: 'running', message: 'Checking admin user...' });
    
    try {
      const users = await apiService.getAllUsers();
      const adminUser = users.find(user => user.role === 'admin');
      
      if (adminUser) {
        updateStep('admin', { 
          status: 'success', 
          message: 'Admin user found',
          details: `Admin: ${adminUser.email} (${adminUser.name})`
        });
      } else {
        updateStep('admin', { 
          status: 'error', 
          message: 'Admin user not found',
          details: 'Please add admin user to the users table using the SQL script'
        });
      }
    } catch (error) {
      updateStep('admin', { 
        status: 'error', 
        message: 'Could not check admin user',
        details: 'Database connection issue'
      });
    }

    setIsRunning(false);
  };

  // Run diagnostics on component mount
  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: DiagnosticStep['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Testing</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const allSuccess = steps.every(step => step.status === 'success');
  const hasErrors = steps.some(step => step.status === 'error');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-6 w-6" />
            <span>System Setup Diagnostic</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Status */}
          {allSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ All systems are ready! You can now use the Field Maintenance Tracker.
              </AlertDescription>
            </Alert>
          )}

          {hasErrors && !isRunning && (
            <Alert className="border-orange-200 bg-orange-50">
              <XCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                ⚠️ Some issues were detected. Please follow the setup instructions below.
              </AlertDescription>
            </Alert>
          )}

          {/* Diagnostic Steps */}
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{step.name}</h4>
                    {getStatusBadge(step.status)}
                  </div>
                  {step.message && (
                    <p className="text-sm text-gray-600 mt-1">{step.message}</p>
                  )}
                  {step.details && (
                    <p className="text-xs text-gray-500 mt-1">{step.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Run Diagnostics</span>
            </Button>

            <Button variant="outline" asChild>
              <a href="https://supabase.com/dashboard/project/cocywsgybygqitlkxbfy" target="_blank" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Supabase Dashboard</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>

            <Button variant="outline" asChild>
              <a href="https://supabase.com/dashboard/project/cocywsgybygqitlkxbfy/sql" target="_blank" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>SQL Editor</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>

            <Button variant="outline" asChild>
              <a href="/DEPLOYMENT_GUIDE.md" target="_blank" className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Setup Guide</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          {/* Quick Setup Instructions */}
          {hasErrors && (
            <div className="mt-6 p-4 border-l-4 border-blue-500 bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-2">Quick Setup Steps:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Go to your <a href="https://supabase.com/dashboard/project/cocywsgybygqitlkxbfy" target="_blank" className="underline">Supabase Dashboard</a></li>
                <li>Open SQL Editor and run the <code>supabase_schema.sql</code> script</li>
                <li>Create an admin user in Authentication → Users</li>
                <li>Add the admin user to the users table with role 'admin'</li>
                <li>Run diagnostics again to verify everything is working</li>
              </ol>
            </div>
          )}

          {/* Supabase URL */}
          {supabaseUrl && (
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <p className="text-sm">
                <strong>Supabase Project:</strong> <code className="bg-white px-2 py-1 rounded">{supabaseUrl}</code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}