import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Settings, User, Lock, UserPlus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SupabaseService } from '../services/SupabaseService';
import type { User } from '../App';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dataService] = useState(() => SupabaseService.getInstance());
  const [systemInitialized, setSystemInitialized] = useState(false);

  // Initialize Supabase API on component mount
  useEffect(() => {
    const initializeAPI = async () => {
      try {
        const ready = await dataService.testConnection();
        if (ready) {
          console.log('Supabase API initialized successfully');
          setSystemInitialized(true);
        } else {
          toast.error('Failed to initialize Supabase API');
          setSystemInitialized(false);
        }
      } catch (error) {
        console.error('API initialization failed:', error);
        toast.error('API initialization failed');
        setSystemInitialized(false);
      }
    };

    initializeAPI();
  }, [dataService]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const user = await dataService.authenticateUser(email, password);
      if (user) {
        onLogin(user);
        toast.success('Signed in successfully');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error(error instanceof Error ? error.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !signUpName) return;

    setIsLoading(true);
    try {
      const user = await dataService.signUp({
        email,
        password,
        name: signUpName,
        role: 'user'
      });
      
      if (user) {
        onLogin(user);
        toast.success('Account created successfully!');
        // Clear form
        setEmail('');
        setPassword('');
        setSignUpName('');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(error instanceof Error ? error.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'user') => {
    setIsLoading(true);
    try {
      const demoCredentials = {
        admin: { email: 'admin@fieldmaintenance.com', password: 'admin123' },
        user: { email: 'user@fieldmaintenance.com', password: 'admin123' }
      };
      
      const { email: demoEmail, password: demoPassword } = demoCredentials[role];
      
      try {
        // Try to login first
        const user = await dataService.authenticateUser(demoEmail, demoPassword);
        onLogin(user);
        toast.success(`Demo ${role} login successful`);
      } catch (loginError) {
        // If login fails, try to create the demo account first
        try {
          await dataService.createUser({
            email: demoEmail,
            password: demoPassword,
            name: role === 'admin' ? 'Demo Admin' : 'Demo Technician',
            role
          });
          
          // Then login
          const user = await dataService.authenticateUser(demoEmail, demoPassword);
          onLogin(user);
          toast.success(`Demo ${role} account created and logged in`);
        } catch (createError) {
          console.error('Demo account creation failed:', createError);
          toast.error(`Demo ${role} login failed`);
        }
      }
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error(`Demo ${role} login failed`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 rounded-full p-3">
              <Settings className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Field Maintenance Tracker</CardTitle>
          <p className="text-gray-600">Browser-based maintenance tracking system</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or try demo accounts</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
            >
              Demo Admin Login
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => handleDemoLogin('user')}
              disabled={isLoading}
            >
              Demo Technician Login
            </Button>
          </div>
          
          <div className="text-xs text-center text-gray-500 space-y-1">
            <p><strong>Browser-based Storage:</strong> Data stored locally in your browser</p>
            <p><strong>Pre-loaded Demo Accounts:</strong></p>
            <p><strong>Admin:</strong> admin@fieldservice.com / admin123</p>
            <p><strong>User:</strong> technician@fieldservice.com / tech123</p>
            <p className="text-blue-600 mt-2">Emails containing "admin" get admin privileges</p>
            <p className="text-green-600">Ready to use - no server setup required!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}