import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ClipboardList, Home, PlusCircle, Cloud, Settings, MapPin } from 'lucide-react';
import { NetworkStatus } from './NetworkStatus';

export const AppShell: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/survey/new', label: 'New', icon: PlusCircle },
    { path: '/surveys', label: 'History', icon: ClipboardList },
    { path: '/sync', label: 'Sync', icon: Cloud },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="app-container">
      {/* Sidebar for Desktop / Bottom Nav for Mobile */}
      <nav className="bottom-nav">
        {/* Desktop Title Header in Sidebar */}
        <div className="hidden-mobile" style={{ padding: '1rem', marginBottom: '1rem', display: 'none' }}>
           <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
             <MapPin size={24} /> VKU Survey
           </h1>
        </div>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={24} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          backgroundColor: 'var(--surface-color)', 
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <MapPin size={24} />
            <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>VKU Field Survey</h1>
          </div>
          <div>
            <NetworkStatus />
          </div>
        </header>

        <main className="app-main animate-fade-in">
          <div className="container" style={{ padding: 0 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
