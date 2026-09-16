import React from 'react';
import { useJobContext } from '../../context/JobContext';
import { Calendar, Video, ExternalLink, Bell } from 'lucide-react';

export const UpcomingEvents: React.FC = () => {
  const { interviews, applications } = useJobContext();
  const sortedInterviews = [...interviews].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h4
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            margin: 0,
          }}
        >
          <Bell style={{ width: '1rem', height: '1rem', color: 'var(--primary)' }} />
          Upcoming Interviews &amp; Tests
        </h4>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--primary)',
            backgroundColor: 'var(--primary-soft)',
            padding: '0.2rem 0.625rem',
            borderRadius: '999px',
            border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
          }}
        >
          {sortedInterviews.length} Scheduled
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sortedInterviews.length > 0 ? (
          sortedInterviews.map((item) => {
            const app = applications.find((a) => a.id === item.applicationId);
            return (
              <div
                key={item.id}
                style={{
                  padding: '0.875rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'var(--primary-soft)',
                  border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span style={{ color: 'var(--primary-dark)' }}>{item.type}</span>
                  <span
                    style={{
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Calendar style={{ width: '0.75rem', height: '0.75rem' }} />
                    {item.date} • {item.time} WIB
                  </span>
                </div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {app ? app.companyName : 'Target Company'} — {app ? app.position : ''}
                </p>
                {item.meetingUrl && (
                  <a
                    href={item.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      fontSize: '0.6875rem',
                    }}
                  >
                    <Video style={{ width: '0.875rem', height: '0.875rem' }} />
                    Join Meeting Link <ExternalLink style={{ width: '0.75rem', height: '0.75rem' }} />
                  </a>
                )}
              </div>
            );
          })
        ) : (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '1rem 0',
            }}
          >
            No upcoming interviews or tests.
          </p>
        )}
      </div>
    </div>
  );
};
