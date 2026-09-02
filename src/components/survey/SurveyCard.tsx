import React from 'react';
import type { Survey } from '../../types/survey';
import { Card, CardContent } from '../ui/Card';
import { MapPin, Info, Clock, AlertTriangle, CheckCircle, WifiOff } from 'lucide-react';

interface SurveyCardProps {
  survey: Survey;
}

export const SurveyCard: React.FC<SurveyCardProps> = ({ survey }) => {
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Good': return 'var(--success)';
      case 'Needs Repair': return 'var(--warning)';
      case 'Broken': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'Good': return <CheckCircle size={16} />;
      case 'Needs Repair': return <AlertTriangle size={16} />;
      case 'Broken': return <WifiOff size={16} />; // Using WifiOff as a broken symbol alternative since lucide doesn't have a direct 'broken'
      default: return <Info size={16} />;
    }
  };

  const formattedDate = new Date(survey.createdAt).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <Card className="animate-fade-in" style={{ marginBottom: '1rem' }}>
      <CardContent className="" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem' }}>{survey.facilityType}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <MapPin size={14} />
              <span>{survey.building}, {survey.room}</span>
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
            color: getConditionColor(survey.condition),
            border: `1px solid ${getConditionColor(survey.condition)}`
          }}>
            {getConditionIcon(survey.condition)}
            {survey.condition}
          </div>
        </div>

        {survey.description && (
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
            {survey.description}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={14} />
            <span>{formattedDate}</span>
          </div>
          <div>
            {survey.syncStatus === 'pending' ? 'Sync Pending' : 'Synced'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
