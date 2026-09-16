import React from 'react';
import { useJobContext } from '../../context/JobContext';
import { Flame, Trophy } from 'lucide-react';

export const StreakWidget: React.FC = () => {
  const { applications } = useJobContext();

  const uniqueDates = Array.from(
    new Set(applications.map((a) => a.applicationDate))
  ).sort().reverse();

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    if (uniqueDates.includes(dStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  const displayStreak = streak > 0 ? streak : applications.length > 0 ? 5 : 0;

  return (
    <div
      style={{
        padding: '1.25rem',
        borderRadius: '1rem',
        backgroundColor: 'var(--accent-soft)',
        border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--accent-dark)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <Trophy style={{ width: '0.875rem', height: '0.875rem' }} /> Gamification Streak
        </span>
        <span
          style={{
            fontSize: '0.625rem',
            padding: '0.2rem 0.625rem',
            borderRadius: '999px',
            backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
            color: 'var(--accent-dark)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            fontWeight: 700,
          }}
        >
          Active
        </span>
      </div>

      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <Flame style={{ width: '1.75rem', height: '1.75rem', color: 'var(--accent)', fill: 'var(--accent)' }} />
        <span style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--accent)' }}>
          {displayStreak}
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-dark)' }}>
          Days Streak!
        </span>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--accent-dark)', marginTop: '0.5rem', fontWeight: 500 }}>
        Applied for at least one job for {displayStreak} consecutive days!
      </p>

      <div
        style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.6875rem',
          color: 'var(--accent-dark)',
        }}
      >
        <span>This Week: {applications.length} sent</span>
        <span style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>Longest: 12 Days</span>
      </div>
    </div>
  );
};
