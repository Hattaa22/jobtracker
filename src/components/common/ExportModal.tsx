import React from 'react';
import { useJobContext } from '../../context/JobContext';
import { Modal } from '../common/Modal';
import { FileSpreadsheet, FileText, Code } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { applications } = useJobContext();
  if (!isOpen) return null;

  const exportCSV = () => {
    const headers = ['Company','Position','Applied Date','Source','Status','Location','Recruiter','Notes'];
    const rows = applications.map((app) => [
      `"${app.companyName.replace(/"/g,'""')}"`,
      `"${app.position.replace(/"/g,'""')}"`,
      `"${app.applicationDate}"`,
      `"${app.source}"`,
      `"${app.status}"`,
      `"${app.location}"`,
      `"${(app.recruiterName||'').replace(/"/g,'""')}"`,
      `"${(app.notes||'').replace(/"/g,'""')}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `JobTrack_Export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const exportJSON = () => {
    const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(applications,null,2));
    const a = document.createElement('a');
    a.href = data;
    a.download = `JobTrack_Export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    onClose();
  };

  const formatButtons = [
    {
      icon: FileSpreadsheet,
      label: 'CSV Format (.csv)',
      sub: 'Compatible with Excel, Google Sheets & Numbers',
      accent: 'var(--success)',
      accentBg: 'var(--success-soft)',
      onClick: exportCSV,
    },
    {
      icon: Code,
      label: 'JSON Raw Format (.json)',
      sub: 'Full structured backup including IDs and timestamps',
      accent: 'var(--primary)',
      accentBg: 'var(--primary-soft)',
      onClick: exportJSON,
    },
    {
      icon: FileText,
      label: 'Printable Summary / PDF',
      sub: 'Opens browser print / PDF save view',
      accent: 'var(--accent)',
      accentBg: 'var(--accent-soft)',
      onClick: () => { window.print(); onClose(); },
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Applications Data"
      subtitle="Download your recorded job applications in your preferred format"
      maxWidth="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.25rem' }}>
        {formatButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.label}
              onClick={btn.onClick}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '1rem',
                border: '1px solid var(--border)',
                backgroundColor: 'transparent',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = btn.accent; e.currentTarget.style.backgroundColor = btn.accentBg; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  backgroundColor: btn.accentBg,
                  color: btn.accent,
                  transition: 'transform 0.15s',
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: '1.5rem', height: '1.5rem' }} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
                  {btn.label}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                  {btn.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
