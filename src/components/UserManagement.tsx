import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Users, Shield, UserCheck, RefreshCw, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SupabaseService } from '../services/SupabaseService';

interface UserManagementProps {
  dataService: SupabaseService;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: string;
  created_at?: string;
}

export function UserManagement({ dataService }: UserManagementProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await dataService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;

    try {
      await dataService.updateUserRole(selectedUser.id, newRole);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, role: newRole }
          : user
      ));
      
      setSelectedUser(null);
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handlePasswordReset = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to reset the password for ${userName}?`)) {
      return;
    }

    try {
      const result = await dataService.resetUserPassword(userId);
      toast.success(`Password reset successfully! New password: ${result.newPassword}`, {
        duration: 10000, // Show for 10 seconds
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-red-500' : 'bg-blue-500';
  };

  const getStats = () => {
    const adminCount = users.filter(user => user.role === 'admin').length;
    const userCount = users.filter(user => user.role === 'user').length;
    return { adminCount, userCount, totalCount: users.length };
  };

  const formatDate = (user: UserData) => {
    const dateStr = user.createdAt || user.created_at || '';
    if (!dateStr) return 'Unknown';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader className="px-0 pb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-500 rounded-lg p-2">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">User Management</CardTitle>
            <p className="text-gray-600">Manage user accounts and roles</p>
          </div>
        </div>
      </CardHeader>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold">{stats.totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 rounded-full p-2">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Administrators</p>
                <p className="text-2xl font-semibold">{stats.adminCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Regular Users</p>
                <p className="text-2xl font-semibold">{stats.userCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Users ({users.length})</CardTitle>
            <Button onClick={loadUsers} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleColor(user.role)} text-white`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(user)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewRole(user.role);
                                }}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Manage
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Manage User: {selectedUser?.name}</DialogTitle>
                              <DialogDescription>
                                Update user role and manage account settings
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Current Role</label>
                                    <p className="text-sm text-gray-600">
                                      <Badge className={`${getRoleColor(selectedUser.role)} text-white`}>
                                        {selectedUser.role}
                                      </Badge>
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Change Role</label>
                                    <Select value={newRole} onValueChange={(value: 'admin' | 'user') => setNewRole(value)}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Administrator</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="flex gap-3 pt-4">
                                  <Button 
                                    onClick={handleRoleUpdate}
                                    disabled={newRole === selectedUser.role}
                                    className="flex-1"
                                  >
                                    Update Role
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setSelectedUser(null)}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePasswordReset(user.id, user.name)}
                          className="text-orange-600 border-orange-600 hover:bg-orange-50"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Reset Password
                        </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-blue-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-800">User Management Information</h4>
              <div className="text-sm text-blue-600 mt-2 space-y-1">
                <p>• <strong>Admin users</strong> can access the admin dashboard and manage all data</p>
                <p>• <strong>Regular users</strong> can only access and submit maintenance forms</p>
                <p>• New accounts with emails containing "admin" automatically get admin privileges</p>
                <p>• Role changes take effect immediately upon saving</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}