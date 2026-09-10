import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { surveyRepository } from '../db/surveyRepository';
import { syncService } from '../services/syncService';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import type { SurveySubmission, SurveyDraft } from '../types/survey';

interface SurveyContextProps {
  surveys: SurveySubmission[];
  isLoading: boolean;
  isSyncing: boolean;
  syncError: string | null;
  performSync: () => Promise<void>;
  handleAddSurvey: (draftData: Omit<SurveyDraft, 'id' | 'updatedAt' | 'currentStep'>) => Promise<void>;
  handleDeleteSurvey: (id: string) => Promise<void>;
}

const SurveyContext = createContext<SurveyContextProps | undefined>(undefined);

export const SurveyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [surveys, setSurveys] = useState<SurveySubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const isOnline = useNetworkStatus();
  const prevIsOnline = useRef(isOnline);

  const loadData = async () => {
    try {
      const data = await surveyRepository.getAllSurveys();
      setSurveys(data);
    } catch (err) {
      console.error("Failed to load surveys:", err);
    }
  };

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    loadData().finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const performSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncError(null);
    const result = await syncService.syncAll();
    
    if (!result.success) {
      setSyncError(result.error || 'Failed to sync surveys');
    }
    
    // Always reload data after sync attempt to reflect changes
    await loadData();
    setIsSyncing(false);
  };

  // Listen for Service Worker background sync triggers
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'TRIGGER_SYNC') {
        console.log('[SurveyContext] Received background sync trigger from Service Worker');
        performSync();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', handleMessage);
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && (!prevIsOnline.current || surveys.some(s => s.status === 'PENDING_SYNC'))) {
      const pendingSurveys = surveys.filter(s => s.status === 'PENDING_SYNC');
      if (pendingSurveys.length > 0 && !isSyncing) {
        performSync();
      }
    }
    prevIsOnline.current = isOnline;
  }, [isOnline, surveys, isSyncing]);

  const handleAddSurvey = async (draftData: Omit<SurveyDraft, 'id' | 'updatedAt' | 'currentStep'>) => {
    const newSurvey: SurveySubmission = {
      ...draftData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      status: 'PENDING_SYNC'
    };
    
    try {
      await surveyRepository.enqueueSurvey(newSurvey);
      setSurveys(prev => [newSurvey, ...prev]);
      
      // If online, immediately attempt to sync this new survey
      if (isOnline) {
        performSync();
      } else {
        // Register Background Sync if supported
        if (import.meta.env.PROD && 'serviceWorker' in navigator && 'SyncManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            // @ts-ignore
            await registration.sync.register('survey-sync');
            console.log('[SurveyContext] Background Sync registered: survey-sync');
          } catch (syncErr) {
            console.error('[SurveyContext] Background Sync registration failed:', syncErr);
          }
        }
      }
    } catch (err) {
      console.error("Failed to save survey:", err);
      throw err;
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    try {
      await surveyRepository.deleteSubmission(id);
      setSurveys(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete survey:", err);
      throw err;
    }
  };

  return (
    <SurveyContext.Provider value={{
      surveys,
      isLoading,
      isSyncing,
      syncError,
      performSync,
      handleAddSurvey,
      handleDeleteSurvey
    }}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurveyContext = () => {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error('useSurveyContext must be used within a SurveyProvider');
  }
  return context;
};
