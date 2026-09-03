export type SyncStatus = 'PENDING_SYNC' | 'SYNCED' | 'FAILED';
export type SurveyCategory = 'Hardware' | 'Projector' | 'AC' | 'Electrical' | 'Furniture' | '';

export interface SurveyDraft {
  id: string; // usually a single ID like 'current-draft' for a single active draft
  building: string;
  floor: string;
  room: string;
  category: SurveyCategory;
  rating: number; // 1-5
  defectNotes: string;
  photo: string; // base64 or blob URL
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
  timestamp: number;
  status: SyncStatus;
}
