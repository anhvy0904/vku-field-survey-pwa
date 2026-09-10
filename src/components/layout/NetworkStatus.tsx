import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { Wifi, WifiOff } from 'lucide-react';

export const NetworkStatus: React.FC = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) {
    return (
      <span style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.375rem', 
        backgroundColor: 'rgba(16, 185, 129, 0.1)', 
        color: 'var(--success)', 
        padding: '0.25rem 0.625rem', 
        borderRadius: '2rem',
        fontSize: '0.75rem',
        fontWeight: 600
      }}>
        <Wifi size={14} /> Online
      </span>
    );
  }

  return (
    <span style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.375rem', 
      backgroundColor: 'rgba(239, 68, 68, 0.1)', 
      color: 'var(--danger)', 
      padding: '0.25rem 0.625rem', 
      borderRadius: '2rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }}>
      <WifiOff size={14} /> Offline
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </span>
  );
};
