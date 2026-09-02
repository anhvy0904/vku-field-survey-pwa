import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ClipboardList, Database, Wifi } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section style={{ textAlign: 'center', padding: '2rem 0' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>VKU Campus Inspector</h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          An offline-first progressive web application for inspecting and surveying facilities across the Vietnam-Korea University campus.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <Link to="/survey">
            <Button>
              <ClipboardList style={{ marginRight: '0.5rem' }} size={20} />
              Start New Survey
            </Button>
          </Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ backgroundColor: 'var(--bg-color)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
                <Wifi size={24} />
              </div>
              <CardTitle>Offline Ready</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p style={{ color: 'var(--text-muted)' }}>
              Continue working even when you lose network connectivity in campus buildings. Data syncs automatically when you're back online.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ backgroundColor: 'var(--bg-color)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--success)' }}>
                <Database size={24} />
              </div>
              <CardTitle>Local Storage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p style={{ color: 'var(--text-muted)' }}>
              Surveys are securely saved to your device's IndexedDB, ensuring no data is lost during your inspection rounds.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ backgroundColor: 'var(--bg-color)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--warning)' }}>
                <ClipboardList size={24} />
              </div>
              <CardTitle>Quick Reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p style={{ color: 'var(--text-muted)' }}>
              Log facility conditions including excellent, good, fair, poor, and critical statuses with detailed notes.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
