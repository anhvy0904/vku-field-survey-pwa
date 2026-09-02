import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ClipboardList, Home, MapPin } from 'lucide-react';
import { NetworkStatus } from './NetworkStatus';

export const AppShell: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/survey', label: 'New Survey', icon: ClipboardList },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ 
        backgroundColor: 'var(--primary)', 
        color: 'white',
        padding: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: 'var(--shadow-md)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={24} />
            <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>VKU Field Survey</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <NetworkStatus />
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem 1rem' }} className="animate-fade-in">
        <div className="container" style={{ padding: 0 }}>
          <Outlet />
        </div>
      </main>

      <footer style={{ 
        backgroundColor: 'var(--surface-color)', 
        borderTop: '1px solid var(--border-color)',
        padding: '1rem',
        marginTop: 'auto'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: 0 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: isActive ? 600 : 400
                }}
              >
                <Icon size={24} style={{ marginBottom: '0.25rem' }} />
                <span style={{ fontSize: '0.75rem' }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
