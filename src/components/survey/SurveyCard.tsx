import React from 'react';
import type { SurveySubmission } from '../../types/survey';
import { Card, CardContent } from '../ui/Card';
import { MapPin, Clock, Star } from 'lucide-react';

interface SurveyCardProps {
  survey: SurveySubmission;
}

export const SurveyCard: React.FC<SurveyCardProps> = ({ survey }) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'var(--success)';
    if (rating >= 3) return 'var(--warning)';
    return 'var(--danger)';
  };

  const formattedDate = new Date(survey.timestamp).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <Card className="animate-fade-in" style={{ marginBottom: '1rem' }}>
      <CardContent className="" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem' }}>{survey.category}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <MapPin size={14} />
              <span>{survey.building}, Floor {survey.floor}, {survey.room}</span>
            </div>
          </div>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.375rem',
            padding: '0.25rem 0.625rem', 
            borderRadius: '1rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: 'var(--bg-color)',
            color: getRatingColor(survey.rating),
            border: `1px solid ${getRatingColor(survey.rating)}`
          }}>
            <Star size={14} fill="currentColor" />
            {survey.rating} / 5
          </div>
        </div>

        {survey.defectNotes && (
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text-main)', 
            marginTop: '0.75rem',
            marginBottom: '0.75rem',
            padding: '0.75rem',
            backgroundColor: 'var(--bg-color)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--border-color)'
          }}>
            {survey.defectNotes}
          </p>
        )}
        
        {survey.photo && (
          <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
             <img src={survey.photo} alt="Attached" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={14} />
            <span>{formattedDate}</span>
          </div>
          <div>
            {survey.status === 'PENDING_SYNC' ? 'Sync Pending' : survey.status === 'SYNCED' ? 'Synced' : 'Failed'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
