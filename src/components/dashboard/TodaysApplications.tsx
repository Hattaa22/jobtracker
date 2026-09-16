import React from 'react';
import { useJobContext } from '../../context/JobContext';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const TodaysApplications: React.FC = () => {
  const { applications } = useJobContext();
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysList = applications.filter((app) => app.applicationDate === todayStr);

  return (
    <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Clock style={{ width: '0.75rem', height: '0.75rem' }} /> Today's Tracker
          </span>
          <h4 style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0.125rem 0 0 0' }}>
            Today — {todayStr}
          </h4>
        </div>
        <span
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary)',
            border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        >
          {todaysList.length} Applied
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
        {todaysList.length > 0 ? (
          todaysList.map((app) => (
            <div
              key={app.id}
              style={{
                padding: '0.75rem',
                borderRadius: '0.75rem',
                backgroundColor: 'var(--surface-hover)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <CheckCircle2 style={{ width: '1rem', height: '1rem', color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{app.position}</h5>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0 }}>{app.companyName}</p>
                </div>
              </div>
              <span
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                }}
              >
                {app.source}
              </span>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              border: '2px dashed var(--border)',
              borderRadius: '0.75rem',
              backgroundColor: 'var(--surface-hover)',
            }}
          >
            <Sparkles style={{ width: '1.5rem', height: '1.5rem', color: 'var(--primary)', margin: '0 auto 0.25rem', opacity: 0.6 }} />
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
              No applications sent today yet
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Click "I Just Applied" to track your progress!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
