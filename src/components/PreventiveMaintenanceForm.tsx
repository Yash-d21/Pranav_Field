import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Settings, Plus, X, Cable, MapPin, Camera } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { LocationCapture } from './LocationCapture';
import { SimpleCameraCapture } from './SimpleCameraCapture';
import type { User as UserType, PreventiveMaintenanceRecord, FiberTest } from '../App';

interface PreventiveMaintenanceFormProps {
  currentUser: UserType;
  dataService: any;
}

export function PreventiveMaintenanceForm({ currentUser, dataService }: PreventiveMaintenanceFormProps) {
  const [formData, setFormData] = useState({
    location: '',
    equipmentId: '',
    maintenanceType: 'inspection' as 'inspection' | 'cleaning' | 'replacement' | 'testing',
    maintenanceDescription: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    completionNotes: ''
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
    
    if (!formData.location.trim() || !formData.equipmentId.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const record: PreventiveMaintenanceRecord & { gpsLocation?: any, photos?: string[] } = {
        id: `preventive_${Date.now()}`,
        location: formData.location.trim(),
        equipmentId: formData.equipmentId.trim(),
        maintenanceType: formData.maintenanceType,
        maintenanceDescription: formData.maintenanceDescription.trim(),
        priority: formData.priority,
        status: formData.status,
        completionNotes: formData.completionNotes.trim(),
        gpsLocation: currentLocation,
        photos: capturedPhotos,
        userId: currentUser.id,
        userEmail: currentUser.email,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toLocaleString(),
        activityType: 'Preventive Maintenance'
      };

      await dataService.saveRecord('preventive_maintenance', record);
      
      toast.success('Preventive maintenance record submitted successfully!');
      setFormData({
        location: '',
        equipmentId: '',
        maintenanceType: 'inspection',
        maintenanceDescription: '',
        priority: 'medium',
        status: 'pending',
        completionNotes: ''
      });
      setCurrentLocation(null);
      setCapturedPhotos([]);
      
    } catch (error) {
      toast.error('Failed to save preventive maintenance record');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0 pb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-green-500 rounded-lg p-2">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Preventive Maintenance</CardTitle>
            <p className="text-gray-600">Scheduled maintenance with fiber testing</p>
          </div>
        </div>
      </CardHeader>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="equipmentId">Equipment ID *</Label>
                <Input
                  id="equipmentId"
                  type="text"
                  placeholder="Enter equipment ID"
                  value={formData.equipmentId}
                  onChange={(e) => handleInputChange('equipmentId', e.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="maintenanceType">Maintenance Type</Label>
              <Select value={formData.maintenanceType} onValueChange={(value) => handleInputChange('maintenanceType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select maintenance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="replacement">Replacement</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenanceDescription">Maintenance Description</Label>
              <Textarea
                id="maintenanceDescription"
                placeholder="Describe the maintenance work performed"
                value={formData.maintenanceDescription}
                onChange={(e) => handleInputChange('maintenanceDescription', e.target.value)}
                rows={3}
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
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="completionNotes">Completion Notes</Label>
              <Textarea
                id="completionNotes"
                placeholder="Add completion notes if applicable"
                value={formData.completionNotes}
                onChange={(e) => handleInputChange('completionNotes', e.target.value)}
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
                  Maintenance Photos
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
                    <p className="text-sm text-green-600">Photos will be included with your maintenance record</p>
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

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}