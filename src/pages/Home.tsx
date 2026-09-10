import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ClipboardList, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useSurveyContext } from '../context/SurveyContext';

export const Home: React.FC = () => {
  const { surveys, isSyncing } = useSurveyContext();

  const pendingCount = surveys.filter(s => s.status === 'PENDING_SYNC').length;
  const syncedCount = surveys.filter(s => s.status === 'SYNCED').length;
  const failedCount = surveys.filter(s => s.status === 'FAILED').length;
  
  // Get latest 5 surveys
  const recentSurveys = [...surveys].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header CTA */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isSyncing ? 'Synchronizing data...' : 'All systems ready'}
          </p>
        </div>
        <Link to="/survey/new">
          <Button>
            <PlusIcon /> <span className="hidden-mobile" style={{ marginLeft: '0.5rem' }}>New Inspection</span>
          </Button>
        </Link>
      </section>

      {/* Summary Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        <Card>
          <CardContent style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <ClipboardList size={28} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{surveys.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Surveys</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Clock size={28} color="var(--warning)" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{pendingCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending Sync</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <CheckCircle2 size={28} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{syncedCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Synced</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <AlertCircle size={28} color={failedCount > 0 ? "var(--danger)" : "var(--text-muted)"} style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: failedCount > 0 ? 'var(--danger)' : 'inherit' }}>{failedCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Errors</div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Activity */}
      <section>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Activity</h3>
        
        {recentSurveys.length === 0 ? (
          <Card>
            <CardContent style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ClipboardList size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <p>No inspections yet.</p>
              <Link to="/survey/new" style={{ display: 'inline-block', marginTop: '1rem' }}>
                <Button variant="secondary">Start first inspection</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentSurveys.map(survey => (
              <Card key={survey.id}>
                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{survey.building} - {survey.room}</h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                      <span>{new Date(survey.timestamp).toLocaleString()}</span>
                      <span>{survey.photo ? '1 Photo' : 'No Photo'}</span>
                      {survey.latitude && <span>GPS ✓</span>}
                    </div>
                  </div>
                  <div>
                    {survey.status === 'SYNCED' && <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem' }}>SYNCED</span>}
                    {survey.status === 'PENDING_SYNC' && <span style={{ color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '1rem' }}>PENDING</span>}
                    {survey.status === 'FAILED' && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '1rem' }}>FAILED</span>}
                  </div>
                </div>
              </Card>
            ))}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/surveys" style={{ fontSize: '0.875rem', fontWeight: 600 }}>View all history →</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
