import type { SurveySubmission } from '../types/survey';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  /**
   * Synchronizes a single pending survey with the backend.
   */
  async syncSurvey(survey: SurveySubmission): Promise<{ success: boolean; error?: string; status?: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ surveys: [survey] })
      });

      if (response.ok) { // 2xx
        return {
          success: true,
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
      console.error('[API Service] Failed to sync survey:', error);
      return {
        success: false,
        error: error.message || 'Unknown network error'
      };
    }
  }
};
