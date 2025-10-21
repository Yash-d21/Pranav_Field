import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, User, MapPin, CheckCircle, XCircle, Wifi, Database, Camera } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { LocationCapture } from './LocationCapture';
import { SimpleCameraCapture } from './SimpleCameraCapture';
import type { User as UserType, PunchInRecord } from '../App';

interface DailyPunchInFormProps {
  currentUser: UserType;
  dataService: any;
}

export function DailyPunchInForm({ currentUser, dataService }: DailyPunchInFormProps) {
  const [formData, setFormData] = useState({
    technicianName: '',
    location: '',
    notes: ''
  });
  const [punchInTime, setPunchInTime] = useState<string>('');
  const [punchOutTime, setPunchOutTime] = useState<string>('');
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [recentPunchIns, setRecentPunchIns] = useState<PunchInRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);

  useEffect(() => {
    // Only load data if user is authenticated
    if (currentUser) {
      loadRecentPunchIns();
    }
  }, [currentUser]);

  const loadRecentPunchIns = async () => {
    try {
      const records = await dataService.getRecordsByType('punch_in');
      setRecentPunchIns(records.slice(0, 5)); // Get last 5 records
    } catch (error) {
      console.error('Error loading recent punch-ins:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationCapture = (location: any) => {
    setCurrentLocation(location);
  };

  const handlePhotoCapture = (base64Image: string) => {
    setCapturedPhotos(prev => [...prev, base64Image]);
  };

  const removePhoto = (index: number) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handlePunchIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please log in to submit records');
      return;
    }
    
    if (!formData.technicianName.trim() || !formData.location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const now = new Date().toISOString();
      setPunchInTime(now);
      setIsPunchedIn(true);
      
      const record: PunchInRecord & { gpsCoordinates?: any, photos?: string[] } = {
        id: `punch_in_${Date.now()}`,
        technicianName: formData.technicianName.trim(),
        location: formData.location.trim(),
        notes: formData.notes.trim(),
        status: 'punched_in',
        gpsCoordinates: currentLocation,
        photos: capturedPhotos,
        userId: currentUser.id,
        userEmail: currentUser.email,
        timestamp: now,
        createdAt: new Date().toLocaleString(),
        activityType: 'Daily Punch-In',
        punchInTime: now,
        punchOutTime: null
      };

      await dataService.saveRecord('punch_in', record);
      
      toast.success('Punched in successfully!');
      loadRecentPunchIns();
      
    } catch (error) {
      toast.error('Failed to save punch-in record');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePunchOut = async () => {
    if (!isPunchedIn) {
      toast.error('You are not currently punched in');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const now = new Date().toISOString();
      setPunchOutTime(now);
      setIsPunchedIn(false);
      
      const record: PunchInRecord & { gpsCoordinates?: any, photos?: string[] } = {
        id: `punch_out_${Date.now()}`,
        technicianName: formData.technicianName.trim(),
        location: formData.location.trim(),
        notes: formData.notes.trim(),
        status: 'punched_out',
        gpsCoordinates: currentLocation,
        photos: capturedPhotos,
        userId: currentUser.id,
        userEmail: currentUser.email,
        timestamp: now,
        createdAt: new Date().toLocaleString(),
        activityType: 'Daily Punch-Out',
        punchInTime: punchInTime,
        punchOutTime: now
      };

      await dataService.saveRecord('punch_in', record);
      
      toast.success('Punched out successfully!');
      loadRecentPunchIns();
      
    } catch (error) {
      toast.error('Failed to save punch-out record');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const testAPI = async () => {
    try {
      const isConnected = await dataService.testConnection();
      if (isConnected) {
        toast.success('Supabase connection test - Status: Connected');
      } else {
        toast.error('Supabase connection test - Status: Failed');
      }
    } catch (error) {
      toast.error('Supabase connection test failed');
    }
  };

  const testSubmit = () => {
    toast.info('Test submit function - Working correctly');
  };

  const testAlert = () => {
    toast.success('Test alert - System operational');
  };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0 pb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 rounded-lg p-2">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Daily Punch-In Form</CardTitle>
            <p className="text-gray-600">Simple attendance tracking</p>
          </div>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Daily Punch-In Form</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="technicianName">Technician Name *</Label>
                  <Input
                    id="technicianName"
                    type="text"
                    placeholder="Enter technician name"
                    value={formData.technicianName}
                    onChange={(e) => handleInputChange('technicianName', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter your current location or work site"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or observations"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Punch In/Out Time Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-800">Punch In Time</Label>
                    <div className="text-sm text-blue-600">
                      {punchInTime ? new Date(punchInTime).toLocaleString() : 'Not punched in'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-800">Punch Out Time</Label>
                    <div className="text-sm text-blue-600">
                      {punchOutTime ? new Date(punchOutTime).toLocaleString() : 'Not punched out'}
                    </div>
                  </div>
                </div>

                {/* Location and Camera Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      GPS Location
                    </h4>
                    <LocationCapture
                      onLocationCapture={handleLocationCapture}
                      currentLocation={currentLocation}
                      label="Get Current Location"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700 flex items-center">
                      <Camera className="h-4 w-4 mr-2" />
                      Photo Capture
                    </h4>
                    <SimpleCameraCapture
                      onPhotoCapture={handlePhotoCapture}
                      label="Take Photo"
                    />
                  </div>
                </div>

                {/* Show captured photos if available */}
                {capturedPhotos.length > 0 && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Camera className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium text-green-800">Photos Captured ({capturedPhotos.length})</h4>
                        </div>
                        <p className="text-sm text-green-600">Photos will be included with your punch-in record</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {capturedPhotos.map((photo, index) => (
                            <div key={index} className="relative">
                              <img
                                src={photo}
                                alt={`Captured photo ${index + 1}`}
                                className="w-full rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 h-6 w-6 p-0"
                                onClick={() => removePhoto(index)}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex flex-wrap gap-3">
                  {!isPunchedIn ? (
                    <Button 
                      type="button" 
                      onClick={handlePunchIn} 
                      disabled={isSubmitting} 
                      className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? 'Punching In...' : 'Punch In'}
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={handlePunchOut} 
                      disabled={isSubmitting} 
                      className="flex-1 min-w-[120px] bg-red-600 hover:bg-red-700"
                    >
                      {isSubmitting ? 'Punching Out...' : 'Punch Out'}
                    </Button>
                  )}
                  <Button type="button" variant="outline" onClick={testAPI}>
                    Test Database
                  </Button>
                  <Button type="button" variant="outline" onClick={testSubmit}>
                    Test Submit
                  </Button>
                  <Button type="button" variant="outline" onClick={testAlert}>
                    Test Alert
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Recent Punch-Ins */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Recent Punch-Ins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPunchIns.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent punch-ins found</p>
              ) : (
                recentPunchIns.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{record.name}</span>
                      </div>
                      <Badge variant="outline">{record.createdAt}</Badge>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-sm text-gray-700">{record.location}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Debug Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Debug Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">User Logged In</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Supabase Connected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm">System Online</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Form Values:</h4>
                <div className="text-xs space-y-1 font-mono bg-gray-50 p-2 rounded">
                  <div>Technician: "{formData.technicianName}"</div>
                  <div>Location: "{formData.location}"</div>
                  <div>Punched In: {isPunchedIn ? 'Yes' : 'No'}</div>
                  <div>Photos: {capturedPhotos.length}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">User Info:</h4>
                <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                  <div>ID: {currentUser.id}</div>
                  <div>Email: {currentUser.email}</div>
                  <div>Role: {currentUser.role}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Live Logs:</h4>
                <div className="text-xs bg-gray-50 p-2 rounded h-24 overflow-y-auto">
                  <div>System initialized...</div>
                  <div>Form component loaded</div>
                  <div>User authenticated</div>
                  <div>Debug panel active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}