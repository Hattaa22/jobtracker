import React from 'react';
import { useJobContext } from '../../context/JobContext';
import { Briefcase, Activity, CalendarCheck, Award, CheckCircle, XCircle } from 'lucide-react';

export const StatsCards: React.FC = () => {
  const { applications } = useJobContext();

  const total = applications.length;
  const activeStatuses = ['Applied', 'Screening', 'Assessment', 'Interview', 'Final Interview'];
  const activeCount = applications.filter((a) => activeStatuses.includes(a.status)).length;
  const interviewCount = applications.filter((a) =>
    ['Interview', 'Final Interview'].includes(a.status)
  ).length;
  const offerCount = applications.filter((a) => a.status === 'Offer').length;
  const acceptedCount = applications.filter((a) => a.status === 'Accepted').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;
  const responseRate =
    total > 0
      ? Math.round(
          ((total - applications.filter((a) => a.status === 'Applied' || a.status === 'Saved').length) /
            total) *
            100
        )
      : 0;

  const stats = [
    {
      label: 'Total',
      value: total,
      sub: 'Recorded jobs',
      icon: Briefcase,
      color: 'var(--primary)',
      iconBg: 'var(--primary-soft)',
    },
    {
      label: 'Active',
      value: activeCount,
      sub: 'In progress',
      icon: Activity,
      color: 'var(--primary)',
      iconBg: 'var(--primary-soft)',
    },
    {
      label: 'Interviews',
      value: interviewCount,
      sub: 'Scheduled / Completed',
      icon: CalendarCheck,
      color: 'var(--accent)',
      iconBg: 'var(--accent-soft)',
    },
    {
      label: 'Offers',
      value: offerCount,
      sub: 'Pending response',
      icon: Award,
      color: 'var(--primary)',
      iconBg: 'var(--primary-soft)',
    },
    {
      label: 'Accepted',
      value: acceptedCount,
      sub: 'Hired!',
      icon: CheckCircle,
      color: 'var(--success)',
      iconBg: 'var(--success-soft)',
    },
    {
      label: 'Rejected',
      value: rejectedCount,
      sub: 'Closed processes',
      icon: XCircle,
      color: 'var(--pending)',
      iconBg: 'var(--pending-soft)',
    },
    {
      label: 'Response %',
      value: `${responseRate}%`,
      sub: 'Conversion rate',
      icon: Activity,
      color: 'var(--accent)',
      iconBg: 'var(--accent-soft)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '0.75rem',
      }}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="card"
            style={{
              padding: '1rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                }}
              >
                {stat.label}
              </span>
              <div
                style={{
                  backgroundColor: stat.iconBg,
                  borderRadius: '0.5rem',
                  padding: '0.3rem',
                  display: 'flex',
                }}
              >
                <Icon style={{ width: '0.875rem', height: '0.875rem', color: stat.color }} />
              </div>
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                color: stat.color,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {stat.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
};

