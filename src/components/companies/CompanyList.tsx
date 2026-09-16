import React from 'react';
import { useJobContext } from '../../context/JobContext';
import { MapPin } from 'lucide-react';

export const CompanyList: React.FC = () => {
  const { companies, applications } = useJobContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div
        className="card"
        style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
            Applied Companies ({companies.length})
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            Track all target organizations and your application history
          </p>
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {companies.map((company) => {
          const compApps = applications.filter((a) => a.companyId === company.id);
          const activeApps = compApps.filter((a) =>
            ['Applied', 'Screening', 'Assessment', 'Interview', 'Final Interview'].includes(a.status)
          );
          const lastApp = compApps.sort((a, b) =>
            b.applicationDate.localeCompare(a.applicationDate)
          )[0];

          return (
            <div
              key={company.id}
              className="card card-hover"
              style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                    fontSize: '1rem',
                    flexShrink: 0,
                  }}
                >
                  {company.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
                    {company.name}
                  </h4>
                  {company.location && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginTop: '0.125rem',
                      }}
                    >
                      <MapPin style={{ width: '0.75rem', height: '0.75rem' }} />
                      {company.location}
                    </p>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border)',
                  fontSize: '0.75rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block' }}>
                    Total Applied
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {compApps.length} positions
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block' }}>
                    Active Stage
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {activeApps.length} active
                  </span>
                </div>
              </div>

              {lastApp && (
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', paddingTop: '0.25rem' }}>
                  Last Applied:{' '}
                  <strong style={{ color: 'var(--text-secondary)' }}>{lastApp.applicationDate}</strong>
                  {' '}({lastApp.position})
                </div>
              )}
            </div>
          );
        })}
      </div>

      {companies.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
          }}
        >
          No companies recorded yet. Add applications to see companies here.
        </div>
      )}
    </div>
  );
};
