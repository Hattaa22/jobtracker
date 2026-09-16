import React from 'react';
import { useJobContext } from '../../context/JobContext';
import type { ApplicationStatus, Application } from '../../types';
import { StatusBadge } from '../common/Badge';
import { MapPin, ExternalLink } from 'lucide-react';

interface ApplicationKanbanProps {
  onSelectApplication: (app: Application) => void;
}

const KANBAN_COLUMNS: ApplicationStatus[] = [
  'Saved', 'Applied', 'Screening', 'Assessment', 'Interview', 'Offer', 'Accepted', 'Rejected',
];

export const ApplicationKanban: React.FC<ApplicationKanbanProps> = ({ onSelectApplication }) => {
  const { applications, updateApplicationStatus } = useJobContext();

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData('text/plain', appId);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain');
    if (appId) updateApplicationStatus(appId, targetStatus, `Dragged to ${targetStatus}`);
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1.5rem', paddingTop: '0.5rem' }}>
      {KANBAN_COLUMNS.map((colStatus) => {
        const columnApps = applications.filter((a) => a.status === colStatus);
        return (
          <div
            key={colStatus}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, colStatus)}
            style={{
              width: '17rem',
              flexShrink: 0,
              backgroundColor: 'var(--background)',
              borderRadius: '1rem',
              padding: '0.75rem',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '75vh',
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border)',
                marginBottom: '0.75rem',
              }}
            >
              <StatusBadge status={colStatus} size="sm" showDot={true} />
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--surface-hover)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '999px',
                }}
              >
                {columnApps.length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {columnApps.map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, app.id)}
                  onClick={() => onSelectApplication(app)}
                  style={{
                    padding: '0.875rem',
                    backgroundColor: 'var(--surface)',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'grab',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 40%, transparent)';
                    e.currentTarget.style.boxShadow = 'var(--shadow)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                      {app.position}
                    </h4>
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <ExternalLink style={{ width: '0.75rem', height: '0.75rem' }} />
                      </a>
                    )}
                  </div>

                  <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0 }}>
                    <span
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '0.375rem',
                        backgroundColor: 'var(--primary-soft)',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '0.6875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {app.companyName.charAt(0)}
                    </span>
                    {app.companyName}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--border)',
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin style={{ width: '0.75rem', height: '0.75rem' }} /> {app.location}
                    </span>
                    <span
                      style={{
                        padding: '0.1rem 0.375rem',
                        borderRadius: '0.375rem',
                        backgroundColor: 'var(--surface-hover)',
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {app.source}
                    </span>
                  </div>
                </div>
              ))}

              {columnApps.length === 0 && (
                <div
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    border: '2px dashed var(--border)',
                    borderRadius: '0.75rem',
                  }}
                >
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Drag &amp; Drop applications here
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
