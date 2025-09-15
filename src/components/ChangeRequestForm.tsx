import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RefreshCw, Package, RotateCcw, MapPin, Camera } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { LocationCapture } from './LocationCapture';
import { SimpleCameraCapture } from './SimpleCameraCapture';
import type { User as UserType, ChangeRequestRecord } from '../App';

interface ChangeRequestFormProps {
  currentUser: UserType;
  dataService: any;
}

export function ChangeRequestForm({ currentUser, dataService }: ChangeRequestFormProps) {
  const [formData, setFormData] = useState({
    requestedBy: '',
    location: '',
    changeDescription: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'pending' as 'pending' | 'approved' | 'rejected' | 'completed',
    approvalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string | number) => {
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
    
    if (!formData.requestedBy.trim() || !formData.location.trim() || 
        !formData.changeDescription.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const record: ChangeRequestRecord & { gpsLocation?: any, photos?: string[] } = {
        id: `change_request_${Date.now()}`,
        requestedBy: formData.requestedBy.trim(),
        location: formData.location.trim(),
        changeDescription: formData.changeDescription.trim(),
        priority: formData.priority,
        status: formData.status,
        approvalNotes: formData.approvalNotes.trim(),
        gpsLocation: currentLocation,
        photos: capturedPhotos,
        userId: currentUser.id,
        userEmail: currentUser.email,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toLocaleString(),
        activityType: 'Change Request'
      };

      await dataService.saveRecord('change_request', record);
      
      toast.success('Change request submitted successfully!');
      resetForm();
      
    } catch (error) {
      toast.error('Failed to save change request');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      requestedBy: '',
      location: '',
      changeDescription: '',
      priority: 'medium',
      status: 'pending',
      approvalNotes: ''
    });
    setCurrentLocation(null);
    setCapturedPhotos([]);
  };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0 pb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500 rounded-lg p-2">
            <RefreshCw className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Change Request</CardTitle>
            <p className="text-gray-600">Material consumption tracking</p>
          </div>
        </div>
      </CardHeader>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Change Request Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Change Request Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="requestedBy">Requested By *</Label>
                  <Input
                    id="requestedBy"
                    type="text"
                    placeholder="Enter requester name"
                    value={formData.requestedBy}
                    onChange={(e) => handleInputChange('requestedBy', e.target.value)}
                    required
                  />
                </div>

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

              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="changeDescription">Change Description *</Label>
              <Textarea
                id="changeDescription"
                placeholder="Describe the requested change in detail"
                value={formData.changeDescription}
                onChange={(e) => handleInputChange('changeDescription', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approvalNotes">Approval Notes (Admin Only)</Label>
              <Textarea
                id="approvalNotes"
                placeholder="Add approval notes if applicable"
                value={formData.approvalNotes}
                onChange={(e) => handleInputChange('approvalNotes', e.target.value)}
                rows={3}
              />
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
                  Change Photos
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
                    <p className="text-sm text-green-600">Photos will be included with your change request</p>
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

            {/* Change Request Summary */}
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3">Change Request Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Requested By:</span> 
                    <span className="ml-2">{formData.requestedBy || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span> 
                    <span className="ml-2">{formData.location || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Priority:</span> 
                    <span className="ml-2 capitalize">{formData.priority || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span> 
                    <span className="ml-2 capitalize">{formData.status || 'Not specified'}</span>
                  </div>
                </div>
                {formData.changeDescription && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-gray-500">Change Description:</span>
                    <p className="mt-1 text-sm">{formData.changeDescription}</p>
                  </div>
                )}
                {formData.approvalNotes && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-gray-500">Approval Notes:</span>
                    <p className="mt-1 text-sm">{formData.approvalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>


            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : 'Submit Change Request'}
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