import type { Survey } from '../types/survey';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  /**
   * Synchronizes an array of pending surveys with the backend.
   */
  async syncSurveys(surveys: Survey[]): Promise<{ success: boolean; syncedIds?: string[]; error?: string; status?: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ surveys })
      });

      if (response.ok) { // 2xx
        const data = await response.json();
        return {
          success: true,
          syncedIds: data.syncedIds,
          status: response.status
        };
      }

      // 4xx and 5xx handling
      let errorMsg = `Server responded with status: ${response.status}`;
      try {
        const errData = await response.json();
        if (errData.error) errorMsg = errData.error;
      } catch (e) {
        // Fallback if response is not JSON
      }

      return {
        success: false,
        error: errorMsg,
        status: response.status
      };

    } catch (error: any) {
      console.error('[API Service] Failed to sync surveys:', error);
      return {
        success: false,
        error: error.message || 'Unknown network error'
      };
    }
  }
};
