import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { SurveyForm } from '../components/survey/SurveyForm';
import { useSurveyContext } from '../context/SurveyContext';
import { PlusCircle } from 'lucide-react';
import { draftRepository } from '../db/draftRepository';

export const NewSurvey: React.FC = () => {
  const { handleAddSurvey } = useSurveyContext();
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const checkDraft = async () => {
      const draft = await draftRepository.getDraft('current-draft');
      if (draft && draft.building) {
        setHasDraft(true);
      }
    };
    checkDraft();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <PlusCircle color="var(--primary)" />
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>New Inspection</h2>
        </div>
        
        <Card>
          <CardContent style={{ paddingTop: '1.5rem' }}>
            {hasDraft && (
              <div style={{ 
                backgroundColor: 'var(--surface-secondary)', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                borderLeft: '4px solid var(--primary)'
              }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>Draft Available</p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>You have an unfinished inspection draft. The form below has been automatically populated.</p>
              </div>
            )}
            
            <SurveyForm onSubmit={async (data) => {
              await handleAddSurvey(data);
              // Clear draft after successful queueing
              await draftRepository.deleteDraft('current-draft');
              setHasDraft(false);
              // Provide visual feedback (e.g. redirect or toast). For now we just reset.
              alert("Inspection saved successfully!");
            }} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
