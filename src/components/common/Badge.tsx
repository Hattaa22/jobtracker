import React from 'react';
import type { ApplicationStatus } from '../../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

// All badge colors use max-3-color palette: brand (blue), accent (amber), slate (muted)
const STATUS_MAP: Record<ApplicationStatus, { bg: string; color: string; border: string; dot: string; label: string }> = {
  Saved:             { bg: 'var(--pending-soft)',  color: 'var(--pending)',      border: 'rgba(100,116,139,0.2)', dot: 'var(--pending)',  label: 'Saved' },
  Applied:           { bg: 'var(--primary-soft)',  color: 'var(--primary-dark)', border: 'rgba(11,132,198,0.2)',  dot: 'var(--primary)',  label: 'Applied' },
  Screening:         { bg: 'var(--primary-soft)',  color: 'var(--primary-dark)', border: 'rgba(11,132,198,0.2)',  dot: 'var(--primary)',  label: 'Screening' },
  Assessment:        { bg: 'var(--accent-soft)',   color: 'var(--accent-dark)',  border: 'rgba(245,158,11,0.2)',  dot: 'var(--accent)',   label: 'Assessment' },
  Interview:         { bg: 'var(--accent-soft)',   color: 'var(--accent-dark)',  border: 'rgba(245,158,11,0.2)',  dot: 'var(--accent)',   label: 'Interview' },
  'Final Interview': { bg: 'var(--accent-soft)',   color: 'var(--accent-dark)',  border: 'rgba(245,158,11,0.2)',  dot: 'var(--accent)',   label: 'Final Interview' },
  Offer:             { bg: 'var(--primary-soft)',  color: 'var(--primary-dark)', border: 'rgba(11,132,198,0.2)',  dot: 'var(--primary)',  label: 'Offer' },
  Accepted:          { bg: 'var(--success-soft)',  color: 'var(--success)',      border: 'rgba(22,163,74,0.2)',   dot: 'var(--success)',  label: 'Accepted' },
  Rejected:          { bg: 'var(--danger-soft)',   color: 'var(--danger)',       border: 'rgba(220,38,38,0.2)',   dot: 'var(--danger)',   label: 'Rejected' },
  Withdrawn:         { bg: 'var(--danger-soft)',   color: 'var(--danger)',       border: 'rgba(220,38,38,0.2)',   dot: 'var(--danger)',   label: 'Withdrawn' },
  'No Response':     { bg: 'var(--pending-soft)',  color: 'var(--pending)',      border: 'rgba(100,116,139,0.2)', dot: 'var(--pending)',  label: 'No Response' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = false,
}) => {
  const st = STATUS_MAP[status] || STATUS_MAP.Applied;

  const sizeStyles = {
    sm: { padding: '0.125rem 0.5rem', fontSize: '0.625rem', borderRadius: '0.375rem' },
    md: { padding: '0.25rem 0.625rem', fontSize: '0.6875rem', borderRadius: '0.5rem' },
    lg: { padding: '0.3125rem 0.875rem', fontSize: '0.75rem', borderRadius: '0.625rem' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        backgroundColor: st.bg,
        color: st.color,
        border: `1px solid ${st.border}`,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
        ...sizeStyles[size],
      }}
    >
      {showDot && (
        <span
          style={{
            width: '0.4375rem',
            height: '0.4375rem',
            borderRadius: '50%',
            backgroundColor: st.dot,
            flexShrink: 0,
          }}
        />
      )}
      {st.label}
    </span>
  );
};

interface SourceBadgeProps {
  source: string;
  size?: 'sm' | 'md';
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, size = 'sm' }) => (
  <span
    style={{
      display: 'inline-block',
      padding: size === 'sm' ? '0.125rem 0.5rem' : '0.25rem 0.625rem',
      fontSize: size === 'sm' ? '0.625rem' : '0.6875rem',
      fontWeight: 600,
      borderRadius: '0.375rem',
      backgroundColor: 'var(--surface-hover)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
    }}
  >
    {source}
  </span>
);
