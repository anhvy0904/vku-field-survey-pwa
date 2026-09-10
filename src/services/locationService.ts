import { Geolocation } from '@capacitor/geolocation';
import type { Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface LocationResult {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  capturedAt?: number;
  locationStatus: 'captured' | 'unavailable' | 'denied' | 'timeout';
}

export const locationService = {
  async getCurrentPosition(): Promise<LocationResult> {
    try {
      // Check permissions first if on native device
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
          const request = await Geolocation.requestPermissions();
          if (request.location !== 'granted') {
            console.warn('[Location Service] Permission denied by user.');
            return { locationStatus: 'denied' };
          }
        }
      }

      // Fetch the location
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
        capturedAt: Date.now(),
        locationStatus: 'captured'
      };
    } catch (error: any) {
      console.error('[Location Service] Error fetching location:', error.message || error);
      
      const errorMessage = (error.message || '').toLowerCase();
      if (errorMessage.includes('denied') || errorMessage.includes('permission')) {
        return { locationStatus: 'denied' };
      } else if (errorMessage.includes('timeout')) {
        return { locationStatus: 'timeout' };
      }
      
      return { locationStatus: 'unavailable' };
    }
  }
};
