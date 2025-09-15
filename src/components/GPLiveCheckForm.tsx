import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { CheckSquare, AlertTriangle, CheckCircle, XCircle, RotateCcw, MapPin, Camera } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { LocationCapture } from './LocationCapture';
import { SimpleCameraCapture } from './SimpleCameraCapture';
import type { User as UserType, GPLiveCheckRecord } from '../App';

interface GPLiveCheckFormProps {
  currentUser: UserType;
  dataService: any;
}

export function GPLiveCheckForm({ currentUser, dataService }: GPLiveCheckFormProps) {
  const [formData, setFormData] = useState({
    location: '',
    gpName: '',
    checkType: 'connectivity' as 'connectivity' | 'power' | 'equipment' | 'fiber',
    checkResult: 'pass' as 'pass' | 'fail' | 'warning',
    issuesFound: '',
    resolutionNotes: '',
    status: 'completed' as 'pending' | 'in_progress' | 'completed' | 'failed'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string | boolean) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.location.trim() || !formData.gpName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const record: GPLiveCheckRecord & { gpsLocation?: any, photos?: string[] } = {
        id: `gp_live_check_${Date.now()}`,
        location: formData.location.trim(),
        gpName: formData.gpName.trim(),
        checkType: formData.checkType,
        checkResult: formData.checkResult,
        issuesFound: formData.issuesFound.trim(),
        resolutionNotes: formData.resolutionNotes.trim(),
        status: formData.status,
        gpsLocation: currentLocation,
        photos: capturedPhotos,
        userId: currentUser.id,
        userEmail: currentUser.email,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toLocaleString(),
        activityType: 'GP Live Check'
      };

      await dataService.saveRecord('gp_live_check', record);
      
      toast.success('GP Live Check submitted successfully!');
      resetForm();
      
    } catch (error) {
      toast.error('Failed to save GP Live Check');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      location: '',
      gpName: '',
      checkType: 'connectivity',
      checkResult: 'pass',
      issuesFound: '',
      resolutionNotes: '',
      status: 'completed'
    });
    setCurrentLocation(null);
    setCapturedPhotos([]);
  };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0 pb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500 rounded-lg p-2">
            <CheckSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">GP Live Check</CardTitle>
            <p className="text-gray-600">Equipment verification with multiple checkboxes</p>
          </div>
        </div>
      </CardHeader>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gpName">GP Name *</Label>
                <Input
                  id="gpName"
                  type="text"
                  placeholder="Enter GP name"
                  value={formData.gpName}
                  onChange={(e) => handleInputChange('gpName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="checkType">Check Type</Label>
                <Select value={formData.checkType} onValueChange={(value) => handleInputChange('checkType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select check type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="connectivity">Connectivity</SelectItem>
                    <SelectItem value="power">Power</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="fiber">Fiber</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkResult">Check Result</Label>
                <Select value={formData.checkResult} onValueChange={(value) => handleInputChange('checkResult', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuesFound">Issues Found</Label>
              <Textarea
                id="issuesFound"
                placeholder="Describe any issues found during the check"
                value={formData.issuesFound}
                onChange={(e) => handleInputChange('issuesFound', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolutionNotes">Resolution Notes</Label>
              <Textarea
                id="resolutionNotes"
                placeholder="Add resolution notes if applicable"
                value={formData.resolutionNotes}
                onChange={(e) => handleInputChange('resolutionNotes', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
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
                  Check Photos
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
                    <p className="text-sm text-green-600">Photos will be included with your check report</p>
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

            {/* Check Summary */}
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3">Check Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Location:</span> 
                    <span className="ml-2">{formData.location || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">GP Name:</span> 
                    <span className="ml-2">{formData.gpName || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Check Type:</span> 
                    <span className="ml-2 capitalize">{formData.checkType || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Result:</span> 
                    <span className="ml-2 capitalize">{formData.checkResult || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span> 
                    <span className="ml-2 capitalize">{formData.status || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Photos:</span> 
                    <span className="ml-2">{capturedPhotos.length}</span>
                  </div>
                </div>
                {formData.issuesFound && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-gray-500">Issues Found:</span>
                    <p className="mt-1 text-sm">{formData.issuesFound}</p>
                  </div>
                )}
                {formData.resolutionNotes && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-gray-500">Resolution Notes:</span>
                    <p className="mt-1 text-sm">{formData.resolutionNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>


            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : 'Submit GP Live Check'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}