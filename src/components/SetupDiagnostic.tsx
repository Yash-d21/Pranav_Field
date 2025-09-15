import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, RefreshCw, ExternalLink, Server, Database, Globe } from 'lucide-react';
import { PhpApiService } from '../services/PhpApiService';

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
      id: 'server',
      name: 'Web Server (Apache)',
      status: 'pending',
      message: 'Checking if web server is running...'
    },
    {
      id: 'php',
      name: 'PHP API Endpoint',
      status: 'pending',
      message: 'Testing PHP API connectivity...'
    },
    {
      id: 'database',
      name: 'MySQL Database',
      status: 'pending',
      message: 'Verifying database connection...'
    },
    {
      id: 'auth',
      name: 'Authentication System',
      status: 'pending',
      message: 'Testing authentication endpoints...'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [apiService] = useState(() => PhpApiService.getInstance());
  const [foundApiUrl, setFoundApiUrl] = useState<string>('');

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

    // Step 1: Test web server
    updateStep('server', { status: 'running', message: 'Checking web server...' });
    
    try {
      // Simple fetch to test if we can make HTTP requests
      const response = await fetch('/test', { method: 'HEAD' });
      updateStep('server', { 
        status: 'success', 
        message: 'Web server is accessible',
        details: `Browser can make HTTP requests`
      });
    } catch (error) {
      updateStep('server', { 
        status: 'error', 
        message: 'Web server issues detected',
        details: 'This might be normal if running from file:// protocol'
      });
    }

    // Step 2: Test PHP API
    updateStep('php', { status: 'running', message: 'Testing PHP API endpoints...' });
    
    const connectionSuccess = await apiService.testConnection();
    if (connectionSuccess) {
      setFoundApiUrl(apiService.getBaseUrl());
      updateStep('php', { 
        status: 'success', 
        message: 'PHP API is responding',
        details: `Connected to: ${apiService.getBaseUrl()}`
      });
    } else {
      updateStep('php', { 
        status: 'error', 
        message: 'PHP API not accessible',
        details: 'Make sure XAMPP/WAMP is running with Apache service started'
      });
    }

    // Step 3: Test database (only if PHP API is working)
    updateStep('database', { status: 'running', message: 'Testing database connection...' });
    
    if (connectionSuccess) {
      try {
        // The test_connection.php endpoint tests the database
        const response = await fetch(`${apiService.getBaseUrl()}/test_connection.php`);
        const data = await response.json();
        
        if (data.status === 'success') {
          updateStep('database', { 
            status: 'success', 
            message: 'Database connection successful',
            details: `Database: ${data.database}, Users: ${data.user_count}`
          });
        } else {
          updateStep('database', { 
            status: 'error', 
            message: 'Database connection failed',
            details: data.error || 'Unknown database error'
          });
        }
      } catch (error) {
        updateStep('database', { 
          status: 'error', 
          message: 'Database test failed',
          details: 'Could not test database connection'
        });
      }
    } else {
      updateStep('database', { 
        status: 'error', 
        message: 'Skipped - PHP API not available',
        details: 'Fix PHP API connection first'
      });
    }

    // Step 4: Test authentication
    updateStep('auth', { status: 'running', message: 'Testing authentication...' });
    
    if (connectionSuccess) {
      try {
        const authResponse = await fetch(`${apiService.getBaseUrl()}/auth.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action: 'check_session' })
        });
        
        if (authResponse.ok) {
          updateStep('auth', { 
            status: 'success', 
            message: 'Authentication system ready',
            details: 'Session management is working'
          });
        } else {
          updateStep('auth', { 
            status: 'error', 
            message: 'Authentication endpoint error',
            details: `HTTP ${authResponse.status}: ${authResponse.statusText}`
          });
        }
      } catch (error) {
        updateStep('auth', { 
          status: 'error', 
          message: 'Authentication test failed',
          details: 'Could not reach authentication endpoint'
        });
      }
    } else {
      updateStep('auth', { 
        status: 'error', 
        message: 'Skipped - PHP API not available',
        details: 'Fix PHP API connection first'
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
              <a href="/config/setup.php" target="_blank" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Database Setup</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>

            <Button variant="outline" asChild>
              <a href="http://localhost/phpmyadmin" target="_blank" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>phpMyAdmin</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>

            <Button variant="outline" asChild>
              <a href="/QUICK_START.html" target="_blank" className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Quick Start Guide</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>

          {/* Quick Setup Instructions */}
          {hasErrors && (
            <div className="mt-6 p-4 border-l-4 border-blue-500 bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-2">Quick Setup Steps:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Start XAMPP/WAMP and ensure Apache + MySQL services are running</li>
                <li>Open phpMyAdmin and create the database using <code>/database/create_database.sql</code></li>
                <li>Configure database credentials using the Database Setup tool</li>
                <li>Run diagnostics again to verify everything is working</li>
              </ol>
            </div>
          )}

          {/* Found API URL */}
          {foundApiUrl && (
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <p className="text-sm">
                <strong>API Endpoint:</strong> <code className="bg-white px-2 py-1 rounded">{foundApiUrl}</code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}