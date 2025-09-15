import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MapPin, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

interface LocationCaptureProps {
  onLocationCapture: (location: LocationData) => void;
  currentLocation?: LocationData | null;
  label?: string;
  className?: string;
}

export function LocationCapture({ 
  onLocationCapture, 
  currentLocation, 
  label = "Get Location", 
  className = "" 
}: LocationCaptureProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
          }
        );
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };

      onLocationCapture(locationData);
      toast.success('Location captured successfully');

    } catch (error: any) {
      console.error('Location error:', error);
      
      let errorMessage = 'Failed to get location';
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please allow location permissions.';
      } else if (error.code === 2) {
        errorMessage = 'Location not available. Please try again.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Location copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy location');
    }
  };

  const formatLocation = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={getCurrentLocation}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Getting Location...
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4 mr-2" />
            {label}
          </>
        )}
      </Button>

      {currentLocation && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Location Captured</span>
                </div>
                
                <div className="space-y-1 text-xs text-green-700">
                  <div>
                    <span className="font-medium">Coordinates:</span> {formatLocation(currentLocation.latitude, currentLocation.longitude)}
                  </div>
                  {currentLocation.accuracy && (
                    <div>
                      <span className="font-medium">Accuracy:</span> ±{currentLocation.accuracy.toFixed(0)}m
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Time:</span> {new Date(currentLocation.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(formatLocation(currentLocation.latitude, currentLocation.longitude))}
                className="ml-2"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}