export type SurveyCondition = 'Good' | 'Needs Repair' | 'Broken';
export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface Survey {
  id: string;
  building: string;
  room: string;
  facilityType: string;
  condition: SurveyCondition;
  description: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
}
