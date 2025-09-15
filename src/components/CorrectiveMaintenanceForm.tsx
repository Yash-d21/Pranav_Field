import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Wrench, MapPin, FileText, AlertTriangle, Camera } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { LocationCapture } from './LocationCapture';
import { SimpleCameraCapture } from './SimpleCameraCapture';
import type { User as UserType, CorrectiveMaintenanceRecord } from '../App';

interface CorrectiveMaintenanceFormProps {
  currentUser: UserType;
  dataService: any;
}

export function CorrectiveMaintenanceForm({ currentUser, dataService }: CorrectiveMaintenanceFormProps) {
  const [formData, setFormData] = useState({
    presentLocation: '',
    ttNumber: '',
    gpName: '',
    distanceFromPOP: '',
    reasonForDamage: '',
    restorationPossibility: false,
    otdrTestResults: '',
    materialConsumption: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    completionNotes: ''
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
    
    if (!formData.presentLocation.trim() || !formData.ttNumber.trim() || !formData.gpName.trim() || !formData.reasonForDamage.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (capturedPhotos.length === 0) {
      toast.error('Please capture at least one photo of the damage');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const record: CorrectiveMaintenanceRecord & { gpsLocation?: any, photos?: string[] } = {
        id: `corrective_${Date.now()}`,
        presentLocation: formData.presentLocation.trim(),
        ttNumber: formData.ttNumber.trim(),
        gpName: formData.gpName.trim(),
        distanceFromPOP: formData.distanceFromPOP ? parseFloat(formData.distanceFromPOP) : null,
        reasonForDamage: formData.reasonForDamage.trim(),
        restorationPossibility: formData.restorationPossibility,
        otdrTestResults: formData.otdrTestResults.trim(),
        materialConsumption: formData.materialConsumption.trim(),
        priority: formData.priority,
        status: formData.status,
        completionNotes: formData.completionNotes.trim(),
        gpsLocation: currentLocation,
        photos: capturedPhotos,
        userId: currentUser.id,
        userEmail: currentUser.email,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toLocaleString(),
        activityType: 'Corrective Maintenance'
      };

      await dataService.saveRecord('corrective_maintenance', record);
      
      toast.success('Corrective maintenance record submitted successfully!');
      setFormData({
        presentLocation: '',
        ttNumber: '',
        gpName: '',
        distanceFromPOP: '',
        reasonForDamage: '',
        restorationPossibility: false,
        otdrTestResults: '',
        materialConsumption: '',
        priority: 'medium',
        status: 'pending',
        completionNotes: ''
      });
      setCurrentLocation(null);
      setCapturedPhotos([]);
      
    } catch (error) {
      toast.error('Failed to save corrective maintenance record');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0 pb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-red-500 rounded-lg p-2">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Corrective Maintenance</CardTitle>
            <p className="text-gray-600">Issue resolution with TT numbers</p>
          </div>
        </div>
      </CardHeader>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="presentLocation">Present Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="presentLocation"
                    type="text"
                    placeholder="Enter present location"
                    value={formData.presentLocation}
                    onChange={(e) => handleInputChange('presentLocation', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ttNumber">TT Number (Equipment ID) *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="ttNumber"
                    type="text"
                    placeholder="Enter equipment ID"
                    value={formData.ttNumber}
                    onChange={(e) => handleInputChange('ttNumber', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="space-y-2">
                <Label htmlFor="distanceFromPOP">Distance from POP (km)</Label>
                <Input
                  id="distanceFromPOP"
                  type="number"
                  placeholder="Enter distance in km"
                  value={formData.distanceFromPOP}
                  onChange={(e) => handleInputChange('distanceFromPOP', e.target.value)}
                  step="0.1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reasonForDamage">Reason for Damage *</Label>
              <Textarea
                id="reasonForDamage"
                placeholder="Describe the reason for damage in detail"
                value={formData.reasonForDamage}
                onChange={(e) => handleInputChange('reasonForDamage', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="restorationPossibility"
                checked={formData.restorationPossibility}
                onCheckedChange={(checked) => handleInputChange('restorationPossibility', checked as boolean)}
              />
              <Label htmlFor="restorationPossibility" className="text-sm">
                Restoration Possibility
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="otdrTestResults">OTDR Test Results</Label>
                <Input
                  id="otdrTestResults"
                  type="text"
                  placeholder="Enter OTDR test results"
                  value={formData.otdrTestResults}
                  onChange={(e) => handleInputChange('otdrTestResults', e.target.value)}
                />
              </div>

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialConsumption">Material Consumption</Label>
              <Textarea
                id="materialConsumption"
                placeholder="Describe materials consumed during repair"
                value={formData.materialConsumption}
                onChange={(e) => handleInputChange('materialConsumption', e.target.value)}
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
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
                  Cut Location Photos (Required)
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

      {/* Debug Info */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">User ID:</span> {currentUser.id}
            </div>
            <div>
              <span className="text-gray-500">User Email:</span> {currentUser.email}
            </div>
            <div>
              <span className="text-gray-500">Form Status:</span> 
              <span className="ml-1 text-green-600">Ready</span>
            </div>
            <div>
              <span className="text-gray-500">Activity Type:</span> Corrective Maintenance
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
            <div className="font-medium mb-1">Current Form Values:</div>
            <div>Location: "{formData.presentLocation || 'Not specified'}"</div>
            <div>TT Number: "{formData.ttNumber || 'Not specified'}"</div>
            <div>GP Name: "{formData.gpName || 'Not specified'}"</div>
            <div>Reason: "{formData.reasonForDamage ? (formData.reasonForDamage.length > 50 ? formData.reasonForDamage.substring(0, 50) + '...' : formData.reasonForDamage) : 'Not specified'}"</div>
            <div>Restoration Possible: {formData.restorationPossibility ? 'Yes' : 'No'}</div>
            <div>Priority: "{formData.priority || 'Not specified'}"</div>
            <div>Status: "{formData.status || 'Not specified'}"</div>
            <div>Photos: {capturedPhotos.length}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}