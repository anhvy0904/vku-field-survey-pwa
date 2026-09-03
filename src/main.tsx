import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register the Service Worker for PWA offline capabilities
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[Service Worker] Registered successfully with scope:', registration.scope);
          
          // Register Background Sync if supported
          if ('sync' in registration) {
            // @ts-ignore - TS doesn't fully support SyncManager yet
            registration.sync.register('sync-surveys')
              .then(() => console.log('[Service Worker] Background Sync registered'))
              .catch((err: any) => console.warn('[Service Worker] Background Sync registration failed:', err));
          }
        })
        .catch((error) => {
          console.error('[Service Worker] Registration failed:', error);
        });
    });
  } else {
    // Development mode: unregister any existing service worker to prevent Vite HMR interference
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
        console.log('[Service Worker] Unregistered in development mode to fix Vite HMR');
      }
    });
  }
}
