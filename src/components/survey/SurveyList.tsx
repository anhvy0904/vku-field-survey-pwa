import React from 'react';
import type { SurveySubmission } from '../../types/survey';
import { SurveyCard } from './SurveyCard';
import { ClipboardList, Loader2, AlertCircle } from 'lucide-react';

interface SurveyListProps {
  surveys: SurveySubmission[];
  isLoading?: boolean;
  error?: string | null;
  onDelete?: (id: string) => void;
}

export const SurveyList: React.FC<SurveyListProps> = ({ surveys, isLoading = false, error = null, onDelete }) => {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
        <Loader2 size={32} style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem', color: 'var(--primary)' }} />
        <p>Loading surveys...</p>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: 'var(--danger)', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.8 }} />
        <h3 style={{ marginBottom: '0.5rem' }}>Failed to load</h3>
        <p style={{ opacity: 0.8 }}>{error}</p>
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', color: 'var(--text-muted)', textAlign: 'center', backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
        <ClipboardList size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No surveys yet</h3>
        <p style={{ maxWidth: '250px' }}>Submit your first facility inspection to see it here.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {surveys.map(survey => (
        <SurveyCard key={survey.id} survey={survey} onDelete={onDelete} />
      ))}
    </div>
  );
};
