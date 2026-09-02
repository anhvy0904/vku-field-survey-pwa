import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ 
  children, 
  className = '',
  style = {}
}) => {
  return (
    <div 
      className={`card ${className}`}
      style={{
        backgroundColor: 'var(--surface-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease',
        ...style
      }}
    >
      <style>{`
        .card:hover {
          box-shadow: var(--shadow-md);
        }
      `}</style>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style = {} }) => (
  <div style={{ padding: '1.25rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border-color)', ...style }} className={className}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style = {} }) => (
  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', ...style }} className={className}>
    {children}
  </h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style = {} }) => (
  <div style={{ padding: '1.25rem', ...style }} className={className}>
    {children}
  </div>
);
