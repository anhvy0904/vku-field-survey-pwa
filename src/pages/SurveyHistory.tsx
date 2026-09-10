import React, { useState } from 'react';
import { useSurveyContext } from '../context/SurveyContext';
import { SurveyList } from '../components/survey/SurveyList';
import { ClipboardList, Search } from 'lucide-react';

export const SurveyHistory: React.FC = () => {
  const { surveys, isLoading, handleDeleteSurvey } = useSurveyContext();
  const [filter, setFilter] = useState<'ALL' | 'PENDING_SYNC' | 'SYNCED' | 'FAILED'>('ALL');
  const [search, setSearch] = useState('');

  const filteredSurveys = surveys.filter(s => {
    if (filter !== 'ALL' && s.status !== filter) return false;
    if (search && !s.building.toLowerCase().includes(search.toLowerCase()) && !s.room.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ClipboardList color="var(--primary)" />
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Inspection History</h2>
      </div>

      {/* Filters and Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {(['ALL', 'PENDING_SYNC', 'SYNCED', 'FAILED'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                border: 'none',
                backgroundColor: filter === f ? 'var(--primary)' : 'var(--surface-color)',
                color: filter === f ? 'white' : 'var(--text-main)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: filter !== f ? 'var(--shadow-sm)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {f === 'PENDING_SYNC' ? 'Pending' : f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search facility or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* List */}
      <SurveyList 
        surveys={filteredSurveys} 
        isLoading={isLoading} 
        error={null} 
        onDelete={handleDeleteSurvey}
      />
    </div>
  );
};
