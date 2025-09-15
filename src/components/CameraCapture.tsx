import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Camera, X, MapPin, Clock, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Photo } from '../App';

interface CameraCaptureProps {
  onPhotoCapture: (photos: Photo[]) => void;
  maxPhotos?: number;
  label?: string;
  required?: boolean;
}

export function CameraCapture({ onPhotoCapture, maxPhotos = 5, label = "Capture Photos", required = false }: CameraCaptureProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCurrentPosition = (): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          resolve({ lat: 0, lng: 0 }); // Default coordinates
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data as base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);

    // Get GPS coordinates
    const coordinates = await getCurrentPosition();

    const newPhoto: Photo = {
      photoId: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      lat: coordinates.lat,
      lng: coordinates.lng,
      base64Image
    };

    const updatedPhotos = [...photos, newPhoto];
    setPhotos(updatedPhotos);
    onPhotoCapture(updatedPhotos);

    toast.success('Photo captured successfully');

    // Stop camera if we've reached max photos
    if (updatedPhotos.length >= maxPhotos) {
      stopCamera();
    }
  }, [photos, onPhotoCapture, maxPhotos]);

  const removePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => photo.photoId !== photoId);
    setPhotos(updatedPhotos);
    onPhotoCapture(updatedPhotos);
  };

  const formatCoordinates = (lat: number, lng: number) => {
    if (lat === 0 && lng === 0) return 'Location not available';
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="h-5 w-5" />
          <span className="font-medium">{label}</span>
          {required && <span className="text-red-500">*</span>}
        </div>
        <Badge variant="outline">
          {photos.length}/{maxPhotos} photos
        </Badge>
      </div>

      {/* Camera Controls */}
      <div className="flex gap-2">
        {!isCapturing ? (
          <Button 
            type="button" 
            variant="outline" 
            onClick={startCamera}
            disabled={photos.length >= maxPhotos}
          >
            <Camera className="h-4 w-4 mr-2" />
            Start Camera
          </Button>
        ) : (
          <>
            <Button type="button" onClick={capturePhoto}>
              <Camera className="h-4 w-4 mr-2" />
              Capture Photo
            </Button>
            <Button type="button" variant="outline" onClick={stopCamera}>
              <X className="h-4 w-4 mr-2" />
              Stop Camera
            </Button>
          </>
        )}
      </div>

      {/* Camera View */}
      {isCapturing && (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto rounded-lg"
              />
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                LIVE
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Captured Photos */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Captured Photos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {photos.map((photo) => (
              <Card key={photo.photoId} className="border-2">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={photo.base64Image}
                        alt="Captured photo"
                        className="w-full h-40 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removePhoto(photo.photoId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span>{new Date(photo.timestamp).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-3 w-3 text-gray-500 mt-0.5" />
                        <span className="break-all">
                          {formatCoordinates(photo.lat || 0, photo.lng || 0)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">GPS Tagged</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}