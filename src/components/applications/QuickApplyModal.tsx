import React, { useState } from 'react';
import { useJobContext } from '../../context/JobContext';
import type { JobSource, ApplicationStatus } from '../../types';
import { Zap, Sparkles, CheckCircle2, X } from 'lucide-react';

interface QuickApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SOURCES: JobSource[] = [
  'JobStreet', 'LinkedIn', 'Glints', 'Kalibrr', 'Indeed',
  'Company Website', 'Referral', 'Campus Career', 'WhatsApp', 'Email', 'Other',
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.875rem',
  borderRadius: '0.75rem',
  border: '1px solid var(--border-strong)',
  backgroundColor: 'var(--surface)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const inputFocusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--primary)';
    e.target.style.boxShadow = 'var(--shadow-focus)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--border-strong)';
    e.target.style.boxShadow = 'none';
  },
};

export const QuickApplyModal: React.FC<QuickApplyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { quickApply } = useJobContext();
  const todayStr = new Date().toISOString().split('T')[0];
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [source, setSource] = useState<JobSource>('JobStreet');
  const [jobUrl, setJobUrl] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !position.trim()) return;
    quickApply({ companyName: companyName.trim(), position: position.trim(), source, jobUrl: jobUrl.trim() || undefined, applicationDate: todayStr, status });
    setIsSuccessToast(true);
    setTimeout(() => {
      setIsSuccessToast(false);
      setCompanyName('');
      setPosition('');
      setJobUrl('');
      onClose();
      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '28rem',
          backgroundColor: 'var(--surface)',
          borderRadius: '1.25rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
          zIndex: 10,
          overflow: 'hidden',
          animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Banner Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 50%, var(--primary) 100%)',
            padding: '1rem 1.5rem',
            color: '#fff',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap style={{ width: '1.25rem', height: '1.25rem', fill: '#fff' }} />
              <h3 style={{ fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>I Just Applied</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.6875rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.625rem', borderRadius: '999px', fontWeight: 500 }}>
                &lt; 30 Seconds Tracker
              </span>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '0.25rem', display: 'flex', borderRadius: '0.375rem' }}
              >
                <X style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', marginTop: '0.25rem' }}>
            Log your fresh application right after submitting!
          </p>
        </div>

        {isSuccessToast ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', animation: 'modalIn 0.2s ease' }}>
            <CheckCircle2 style={{ width: '4rem', height: '4rem', color: 'var(--success)', margin: '0 auto 0.75rem', animation: 'bounce 0.6s ease' }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.375rem' }}>
              Application Logged!
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Application added successfully. Keep up the momentum! 🔥
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Company Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PT Example Indonesia"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={inputStyle}
                {...inputFocusHandlers}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Position <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Full Stack Developer"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                style={inputStyle}
                {...inputFocusHandlers}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                  Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as JobSource)}
                  style={inputStyle}
                  {...inputFocusHandlers}
                >
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  style={inputStyle}
                  {...inputFocusHandlers}
                >
                  <option value="Applied">Applied (Default)</option>
                  <option value="Saved">Saved</option>
                  <option value="Screening">Screening</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Job URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                style={inputStyle}
                {...inputFocusHandlers}
              />
            </div>

            <div style={{ paddingTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Date: Today ({todayStr})
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{ flex: '0 0 33%', justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-accent"
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                }}
              >
                <Sparkles style={{ width: '1rem', height: '1rem' }} />
                Save Application
              </button>
            </div>
          </form>
        )}
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } } @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  );
};
