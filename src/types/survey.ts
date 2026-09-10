export type SyncStatus = 'PENDING_SYNC' | 'SYNCED' | 'FAILED';
export type SurveyCategory = 'Hardware' | 'Projector' | 'AC' | 'Electrical' | 'Furniture' | '';

export type LocationStatus = 'captured' | 'unavailable' | 'denied' | 'timeout' | 'idle' | 'fetching' | 'blocked';

export interface SurveyDraft {
  id: string; // usually a single ID like 'current-draft' for a single active draft
  building: string;
  floor: string;
  room: string;
  category: SurveyCategory;
  rating: number; // 1-5
  defectNotes: string;
  photo: string; // base64 or blob URL
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  locationStatus?: LocationStatus;
  locationCapturedAt?: number;
  updatedAt: number;
  currentStep?: number; // to restore the current step in the multi-step form
}

export interface SurveySubmission {
  id: string;
  building: string;
  floor: string;
  room: string;
  category: SurveyCategory;
  rating: number; // 1-5
  defectNotes: string;
  photo: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  locationStatus?: LocationStatus;
  locationCapturedAt?: number;
  timestamp: number;
  status: SyncStatus;
}
