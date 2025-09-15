import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Camera, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SimpleCameraProps {
  onPhotoCapture: (base64Image: string) => void;
  label?: string;
  className?: string;
}

export function SimpleCameraCapture({ 
  onPhotoCapture, 
  label = "Take Photo", 
  className = "" 
}: SimpleCameraProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsLoading(true);
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
      toast.success('Camera started successfully');
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Unable to access camera. Please check permissions.');
    } finally {
      setIsLoading(false);
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

    onPhotoCapture(base64Image);
    toast.success('Photo captured successfully');
    
    // Stop camera after capturing
    stopCamera();
  }, [onPhotoCapture]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Camera Controls */}
      <div className="flex gap-2">
        {!isCapturing ? (
          <Button 
            type="button" 
            variant="outline" 
            onClick={startCamera}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting Camera...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                {label}
              </>
            )}
          </Button>
        ) : (
          <>
            <Button type="button" onClick={capturePhoto} className="w-full sm:w-auto">
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
            <Button type="button" variant="outline" onClick={stopCamera}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </>
        )}
      </div>

      {/* Camera View */}
      {isCapturing && (
        <Card className="border-blue-200">
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
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  Position your camera and click "Take Photo" when ready
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}