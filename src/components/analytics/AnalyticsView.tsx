import React from 'react';
import { useJobContext } from '../../context/JobContext';
import { TrendingUp } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { applications } = useJobContext();

  const total = applications.length;
  const responses = applications.filter((a) => !['Applied', 'Saved'].includes(a.status)).length;
  const interviews = applications.filter((a) =>
    ['Interview', 'Final Interview', 'Offer', 'Accepted'].includes(a.status)
  ).length;
  const offers = applications.filter((a) => ['Offer', 'Accepted'].includes(a.status)).length;
  const accepted = applications.filter((a) => a.status === 'Accepted').length;

  const responseRate = total > 0 ? Math.round((responses / total) * 100) : 0;
  const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;
  const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

  const funnelData = [
    { stage: 'Applications', count: total, color: '#0B84C6' },
    {
      stage: 'Screening',
      count: applications.filter((a) =>
        ['Screening', 'Assessment', 'Interview', 'Final Interview', 'Offer', 'Accepted'].includes(a.status)
      ).length,
      color: '#0B84C6',
    },
    {
      stage: 'Assessment',
      count: applications.filter((a) =>
        ['Assessment', 'Interview', 'Final Interview', 'Offer', 'Accepted'].includes(a.status)
      ).length,
      color: '#F59E0B',
    },
    { stage: 'Interview', count: interviews, color: '#F59E0B' },
    { stage: 'Offer', count: offers, color: '#16A34A' },
    { stage: 'Accepted', count: accepted, color: '#16A34A' },
  ];

  const overviewCards = [
    { label: 'Response Rate', value: `${responseRate}%`, sub: `${responses} of ${total} responded`, color: 'var(--primary)' },
    { label: 'Interview Rate', value: `${interviewRate}%`, sub: `${interviews} interview invitations`, color: 'var(--accent)' },
    { label: 'Offer Rate', value: `${offerRate}%`, sub: `${offers} job offerings`, color: 'var(--primary)' },
    { label: 'Acceptance Rate', value: `${acceptanceRate}%`, sub: `${accepted} accepted positions`, color: 'var(--success)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {overviewCards.map((card) => (
          <div key={card.label} className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
              }}
            >
              {card.label}
            </span>
            <div
              style={{
                fontSize: '1.875rem',
                fontWeight: 900,
                color: card.color,
                marginTop: '0.25rem',
                lineHeight: 1,
              }}
            >
              {card.value}
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h4
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: 0,
            }}
          >
            <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary)' }} />
            Recruitment Funnel
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Conversion stages from total submitted applications to accepted job offers
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: '40rem', margin: '0 auto' }}>
          {funnelData.map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.stage}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span>{item.stage}</span>
                  <span>{item.count} ({pct}%)</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--surface-hover)',
                    borderRadius: '999px',
                    height: '0.875rem',
                    overflow: 'hidden',
                    padding: '0.125rem',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '999px',
                      backgroundColor: item.color,
                      width: `${Math.max(pct, 3)}%`,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
