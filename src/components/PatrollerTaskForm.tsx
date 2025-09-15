import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { MapPin, RotateCcw, Camera } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { LocationCapture } from './LocationCapture';
import { SimpleCameraCapture } from './SimpleCameraCapture';
import type { User as UserType, PatrollerRecord } from '../App';

interface PatrollerTaskFormProps {
  currentUser: UserType;
  dataService: any;
}

export function PatrollerTaskForm({ currentUser, dataService }: PatrollerTaskFormProps) {
  const [formData, setFormData] = useState({
    location: '',
    taskDescription: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    assignedTo: '',
    dueDate: '',
    completionNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
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
    
    if (!formData.location.trim() || !formData.taskDescription.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const record: PatrollerRecord & { gpsLocation?: any, photos?: string[] } = {
        id: `patroller_${Date.now()}`,
        location: formData.location.trim(),
        taskDescription: formData.taskDescription.trim(),
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo.trim(),
        dueDate: formData.dueDate.trim(),
        completionNotes: formData.completionNotes.trim(),
        gpsLocation: currentLocation,
        photos: capturedPhotos,
        userId: currentUser.id,
        userEmail: currentUser.email,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toLocaleString(),
        activityType: 'Patroller Task'
      };

      await dataService.saveRecord('patroller_task', record);
      
      toast.success('Patroller task submitted successfully!');
      resetForm();
      
    } catch (error) {
      toast.error('Failed to save patroller task');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      location: '',
      taskDescription: '',
      priority: 'medium',
      status: 'pending',
      assignedTo: '',
      dueDate: '',
      completionNotes: ''
    });
    
    setCurrentLocation(null);
    setCapturedPhotos([]);
  };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0 pb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-500 rounded-lg p-2">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Patroller Task</CardTitle>
            <p className="text-gray-600">Task management and field reporting</p>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Information */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    placeholder="Enter assignee name"
                    value={formData.assignedTo}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskDescription">Task Description *</Label>
                <Textarea
                  id="taskDescription"
                  placeholder="Describe the task in detail"
                  value={formData.taskDescription}
                  onChange={(e) => handleInputChange('taskDescription', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  />
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
            </div>
          </CardContent>
        </Card>

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
              Task Photos
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
                <p className="text-sm text-green-600">Photos will be included with your task report</p>
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

        {/* Task Summary */}
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-3">Task Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Location:</span> 
                <span className="ml-2">{formData.location || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500">Assigned To:</span> 
                <span className="ml-2">{formData.assignedTo || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500">Priority:</span> 
                <span className="ml-2 capitalize">{formData.priority || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span> 
                <span className="ml-2 capitalize">{formData.status || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500">Due Date:</span> 
                <span className="ml-2">{formData.dueDate || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500">Photos:</span> 
                <span className="ml-2">{capturedPhotos.length}</span>
              </div>
            </div>
            {formData.taskDescription && (
              <div className="mt-3 pt-3 border-t">
                <span className="text-gray-500">Task Description:</span>
                <p className="mt-1 text-sm">{formData.taskDescription}</p>
              </div>
            )}
            {formData.completionNotes && (
              <div className="mt-3 pt-3 border-t">
                <span className="text-gray-500">Completion Notes:</span>
                <p className="mt-1 text-sm">{formData.completionNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Submitting...' : 'Submit Task'}
          </Button>
          <Button type="button" variant="outline" onClick={resetForm}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}