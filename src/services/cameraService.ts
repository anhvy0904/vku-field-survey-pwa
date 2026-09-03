import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export const cameraService = {
  /**
   * Returns a base64 encoded string or undefined if cancelled/error.
   */
  async takePhoto(): Promise<string | undefined> {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await Camera.getPhoto({
          quality: 60,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera,
          width: 1024 // resize to avoid huge DB records
        });
        
        return `data:image/${image.format};base64,${image.base64String}`;
      } catch (e: any) {
        // User cancelled or permission denied
        console.error('[Camera Service] Native camera error:', e.message);
        return undefined;
      }
    } else {
      console.warn('[Camera Service] Not on native platform, fallback expected in UI.');
      return undefined;
    }
  }
};
