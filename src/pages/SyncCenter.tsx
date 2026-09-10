import React from 'react';
import { useSurveyContext } from '../context/SurveyContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Cloud, AlertTriangle, CheckCircle2, ServerCrash, RefreshCw } from 'lucide-react';

export const SyncCenter: React.FC = () => {
  const { surveys, isSyncing, syncError, performSync } = useSurveyContext();

  const pendingSurveys = surveys.filter(s => s.status === 'PENDING_SYNC');
  const failedSurveys = surveys.filter(s => s.status === 'FAILED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cloud color="var(--primary)" />
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Sync Queue</h2>
        </div>
        <Button onClick={performSync} disabled={isSyncing || (pendingSurveys.length === 0 && failedSurveys.length === 0)}>
          <RefreshCw size={18} style={{ marginRight: '0.5rem' }} className={isSyncing ? "spin" : ""} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </section>

      {syncError && (
        <div style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <AlertTriangle style={{ marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>Sync Error</p>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>{syncError}</p>
        </div>
      )}

      {pendingSurveys.length === 0 && failedSurveys.length === 0 ? (
        <Card>
          <CardContent style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)' }}>Everything is synchronized</h3>
            <p style={{ margin: 0 }}>There are no inspections waiting to be uploaded.</p>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {failedSurveys.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ServerCrash size={18} /> Failed Submissions ({failedSurveys.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {failedSurveys.map(s => (
                  <Card key={s.id} style={{ borderLeft: '4px solid var(--danger)' }}>
                    <CardContent style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <strong>{s.building} - {s.room}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created: {new Date(s.timestamp).toLocaleString()}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--danger)', marginTop: '0.5rem' }}>Server rejected this submission. Please verify network connection or payload validity.</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {pendingSurveys.length > 0 && (
            <div style={{ marginTop: failedSurveys.length > 0 ? '2rem' : 0 }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--warning)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cloud size={18} /> Pending Uploads ({pendingSurveys.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingSurveys.map(s => (
                  <Card key={s.id} style={{ borderLeft: '4px solid var(--warning)' }}>
                    <CardContent style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{s.building} - {s.room}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created: {new Date(s.timestamp).toLocaleString()}</div>
                        </div>
                        {isSyncing && <RefreshCw size={18} color="var(--primary)" className="spin" />}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};
