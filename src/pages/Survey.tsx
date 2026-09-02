import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { SurveyForm } from '../components/survey/SurveyForm';
import { SurveyList } from '../components/survey/SurveyList';
import { SyncStatus } from '../components/survey/SyncStatus';
import type { Survey as SurveyType } from '../types/survey';
import { ClipboardList, PlusCircle, AlertTriangle } from 'lucide-react';
import { surveyRepository } from '../db/surveyRepository';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { syncService } from '../services/syncService';

export const Survey: React.FC = () => {
  const [surveys, setSurveys] = useState<SurveyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setError("Could not load surveys from local storage.");
    }
  };

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    loadData().finally(() => setIsLoading(false));
  }, []);

  // Listen for Service Worker background sync triggers
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'TRIGGER_SYNC') {
        console.log('[Survey UI] Received background sync trigger from Service Worker');
        performSync();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', handleMessage);
  }, [surveys]);

  const performSync = async () => {
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

  // Sync logic when coming back online or at app start if pending items exist
  useEffect(() => {
    if (isOnline && (!prevIsOnline.current || surveys.some(s => s.syncStatus === 'pending'))) {
      const pendingSurveys = surveys.filter(s => s.syncStatus === 'pending');
      if (pendingSurveys.length > 0 && !isSyncing) {
        performSync();
      }
    }
    prevIsOnline.current = isOnline;
  }, [isOnline, surveys.length]);

  const handleAddSurvey = async (newSurveyData: Omit<SurveyType, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => {
    const newSurvey: SurveyType = {
      ...newSurveyData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'pending' // Always save as pending first, then trigger sync
    };
    
    try {
      await surveyRepository.addSurvey(newSurvey);
      setSurveys(prev => [newSurvey, ...prev]);
      
      // If online, immediately attempt to sync this new survey
      if (isOnline) {
        performSync();
      }
    } catch (err) {
      console.error("Failed to save survey:", err);
      alert("Failed to save survey locally.");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {!isOnline && (
        <div style={{ 
          backgroundColor: 'var(--warning)', 
          color: '#fff', 
          padding: '1rem', 
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeIn 0.3s'
        }}>
          <AlertTriangle />
          <strong>You are offline.</strong> Your survey will be saved locally.
        </div>
      )}

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <PlusCircle color="var(--primary)" />
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>New Inspection</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Enter Facility Details</CardTitle>
          </CardHeader>
          <CardContent>
            <SurveyForm onSubmit={handleAddSurvey} />
          </CardContent>
        </Card>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ClipboardList color="var(--primary)" />
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Recent Inspections</h2>
        </div>
        
        <SyncStatus 
          surveys={surveys} 
          isSyncing={isSyncing} 
          onSync={performSync}
          syncError={syncError}
        />

        <SurveyList 
          surveys={surveys} 
          isLoading={isLoading} 
          error={error} 
        />
      </section>
    </div>
  );
};
