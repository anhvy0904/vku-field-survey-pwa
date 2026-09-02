import React from 'react';
import type { Survey } from '../../types/survey';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface SyncStatusProps {
  surveys: Survey[];
  isSyncing: boolean;
  onSync: () => void;
  syncError?: string | null;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ surveys, isSyncing, onSync, syncError }) => {
  const isOnline = useNetworkStatus();
  
  const pendingCount = surveys.filter(s => s.syncStatus === 'pending').length;
  const syncedCount = surveys.filter(s => s.syncStatus === 'synced').length;
  
  const lastSyncTimeStr = localStorage.getItem('lastSyncTime');
  const lastSyncTime = lastSyncTimeStr ? new Date(parseInt(lastSyncTimeStr)).toLocaleTimeString() : 'Never';

  if (pendingCount === 0 && !syncError) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        <span>{syncedCount} items synced.</span>
        <span>Last sync: {lastSyncTime}</span>
      </div>
    );
  }

  if (isOnline) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '0.75rem', 
        padding: '1rem', 
        backgroundColor: syncError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
        color: syncError ? 'var(--danger)' : '#2563eb', 
        borderRadius: 'var(--radius-md)',
        marginBottom: '1rem',
        fontSize: '0.875rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {syncError ? <AlertCircle size={18} /> : <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />}
            <span>
              {isSyncing 
                ? `Syncing ${pendingCount} survey${pendingCount !== 1 ? 's' : ''}...` 
                : `${pendingCount} survey${pendingCount !== 1 ? 's' : ''} prepared for sync.`}
            </span>
          </div>
          
          <Button 
            variant="outline" 
            onClick={onSync} 
            disabled={isSyncing || pendingCount === 0}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            Sync Now
          </Button>
        </div>

        {syncError && (
          <div style={{ fontSize: '0.75rem', marginTop: '-0.25rem' }}>
            <strong>Error:</strong> {syncError}
          </div>
        )}
        
        <style>{`
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '1rem', 
      backgroundColor: 'var(--surface-color)', 
      color: 'var(--warning)', 
      border: '1px solid var(--warning)',
      borderRadius: 'var(--radius-md)',
      marginBottom: '1rem',
      fontSize: '0.875rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CloudOff size={18} />
        <span>{pendingCount} survey{pendingCount !== 1 ? 's' : ''} waiting to sync when online</span>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {syncedCount} Synced
      </div>
    </div>
  );
};
