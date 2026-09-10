import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Settings as SettingsIcon, Database, HardDrive, Smartphone, Camera, MapPin } from 'lucide-react';
import { useSurveyContext } from '../context/SurveyContext';

export const Settings: React.FC = () => {
  const { surveys } = useSurveyContext();
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number, quota: number } | null>(null);
  const [permissions, setPermissions] = useState({
    camera: 'unknown',
    geolocation: 'unknown'
  });

  useEffect(() => {
    // Check Storage
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        if (estimate.usage !== undefined && estimate.quota !== undefined) {
          setStorageEstimate({ usage: estimate.usage, quota: estimate.quota });
        }
      });
    }

    // Check Permissions (browser API)
    const checkPerms = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          // @ts-ignore - camera isn't in all TS lib typings for PermissionName
          const cam = await navigator.permissions.query({ name: 'camera' as any }).catch(() => ({ state: 'unknown' }));
          const geo = await navigator.permissions.query({ name: 'geolocation' }).catch(() => ({ state: 'unknown' }));
          
          setPermissions({
            camera: cam.state,
            geolocation: geo.state
          });
        }
      } catch (e) {
        console.log("Permissions API not fully supported", e);
      }
    };
    checkPerms();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <SettingsIcon color="var(--primary)" />
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Settings</h2>
      </div>

      <section>
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HardDrive size={18} /> Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Local Database Usage</span>
              <span style={{ fontWeight: 600 }}>
                {storageEstimate ? `${formatBytes(storageEstimate.usage)} / ${formatBytes(storageEstimate.quota)}` : 'Calculating...'}
              </span>
            </div>
            {storageEstimate && (
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: 'var(--primary)', 
                  width: `${Math.min(100, (storageEstimate.usage / storageEstimate.quota) * 100)}%` 
                }} />
              </div>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Photos and drafts are stored locally using IndexedDB.
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} /> Application Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Surveys</span>
              <span style={{ fontWeight: 600 }}>{surveys.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Pending Uploads</span>
              <span style={{ fontWeight: 600, color: 'var(--warning)' }}>
                {surveys.filter(s => s.status === 'PENDING_SYNC').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Smartphone size={18} /> Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={16} /> Camera
              </span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{permissions.camera}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} /> Location
              </span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{permissions.geolocation}</span>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>VKU Field Survey PWA</p>
        <p>Version 1.0.0</p>
      </div>
    </div>
  );
};
