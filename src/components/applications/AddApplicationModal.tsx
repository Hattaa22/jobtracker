import React, { useState } from 'react';
import { useJobContext } from '../../context/JobContext';
import { Modal } from '../common/Modal';
import type { JobType, WorkArrangement, JobSource, ApplicationStatus } from '../../types';
import { PlusCircle, Building2, Briefcase, UserCheck } from 'lucide-react';

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JOB_TYPES: JobType[] = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'];
const WORK_ARRANGEMENTS: WorkArrangement[] = ['On-site', 'Hybrid', 'Remote'];
const SOURCES: JobSource[] = [
  'JobStreet', 'LinkedIn', 'Glints', 'Kalibrr', 'Indeed',
  'Company Website', 'Referral', 'Campus Career', 'WhatsApp', 'Email', 'Other',
];
const STATUSES: ApplicationStatus[] = [
  'Saved', 'Applied', 'Screening', 'Assessment', 'Interview', 'Final Interview',
  'Offer', 'Accepted', 'Rejected', 'Withdrawn', 'No Response',
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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '0.375rem',
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--primary)',
  marginBottom: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
};

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--primary)';
    e.target.style.boxShadow = 'var(--shadow-focus)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--border-strong)';
    e.target.style.boxShadow = 'none';
  },
};

export const AddApplicationModal: React.FC<AddApplicationModalProps> = ({ isOpen, onClose }) => {
  const { addApplication } = useJobContext();
  const todayStr = new Date().toISOString().split('T')[0];

  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [jobType, setJobType] = useState<JobType>('Full Time');
  const [workArrangement, setWorkArrangement] = useState<WorkArrangement>('Hybrid');
  const [location, setLocation] = useState('Surabaya');
  const [applicationDate, setApplicationDate] = useState(todayStr);
  const [source, setSource] = useState<JobSource>('JobStreet');
  const [jobUrl, setJobUrl] = useState('');
  const [jobReference, setJobReference] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setCompanyName(''); setPosition(''); setJobType('Full Time');
    setWorkArrangement('Hybrid'); setLocation('Surabaya'); setApplicationDate(todayStr);
    setSource('JobStreet'); setJobUrl(''); setJobReference(''); setStatus('Applied');
    setSalaryMin(''); setSalaryMax(''); setRecruiterName(''); setRecruiterEmail(''); setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !position.trim()) return;
    addApplication({
      companyName: companyName.trim(), position: position.trim(), jobType, workArrangement,
      location: location.trim() || 'Indonesia', applicationDate, source,
      jobUrl: jobUrl.trim() || undefined, jobReference: jobReference.trim() || undefined,
      status, salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      recruiterName: recruiterName.trim() || undefined,
      recruiterEmail: recruiterEmail.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose(); resetForm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Application" subtitle="Fill in the details to track your job process" maxWidth="2xl">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Section 1: Basic Info */}
        <div>
          <p style={sectionHeaderStyle}>
            <Building2 style={{ width: '1rem', height: '1rem' }} /> Basic Information
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Company Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="text" required placeholder="e.g. PT Tokopedia" value={companyName} onChange={e => setCompanyName(e.target.value)} style={inputStyle} {...focusHandlers} />
            </div>
            <div>
              <label style={labelStyle}>Job Position <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="text" required placeholder="e.g. Frontend Engineer" value={position} onChange={e => setPosition(e.target.value)} style={inputStyle} {...focusHandlers} />
            </div>
            <div>
              <label style={labelStyle}>Job Type</label>
              <select value={jobType} onChange={e => setJobType(e.target.value as JobType)} style={inputStyle} {...focusHandlers}>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Work Arrangement</label>
              <select value={workArrangement} onChange={e => setWorkArrangement(e.target.value as WorkArrangement)} style={inputStyle} {...focusHandlers}>
                {WORK_ARRANGEMENTS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Location</label>
              <input type="text" placeholder="e.g. Jakarta / Remote" value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} {...focusHandlers} />
            </div>
          </div>
        </div>

        {/* Section 2: Application Info */}
        <div>
          <p style={sectionHeaderStyle}>
            <Briefcase style={{ width: '1rem', height: '1rem' }} /> Application Information
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Application Date</label>
              <input type="date" value={applicationDate} onChange={e => setApplicationDate(e.target.value)} style={inputStyle} {...focusHandlers} />
            </div>
            <div>
              <label style={labelStyle}>Application Source</label>
              <select value={source} onChange={e => setSource(e.target.value as JobSource)} style={inputStyle} {...focusHandlers}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Job URL</label>
              <input type="url" placeholder="https://jobstreet.co.id/..." value={jobUrl} onChange={e => setJobUrl(e.target.value)} style={inputStyle} {...focusHandlers} />
            </div>
            <div>
              <label style={labelStyle}>Job ID / Reference No.</label>
              <input type="text" placeholder="e.g. REQ-9902" value={jobReference} onChange={e => setJobReference(e.target.value)} style={inputStyle} {...focusHandlers} />
            </div>
          </div>
        </div>

        {/* Section 3: Recruitment */}
        <div>
          <p style={sectionHeaderStyle}>
            <UserCheck style={{ width: '1rem', height: '1rem' }} /> Recruitment &amp; Compensation
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Current Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as ApplicationStatus)} style={{ ...inputStyle, fontWeight: 600 }} {...focusHandlers}>
                {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={labelStyle}>Salary Min (IDR)</label>
                <input type="number" placeholder="6000000" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} style={{ ...inputStyle, fontSize: '0.75rem' }} {...focusHandlers} />
              </div>
              <div>
                <label style={labelStyle}>Salary Max (IDR)</label>
                <input type="number" placeholder="9000000" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} style={{ ...inputStyle, fontSize: '0.75rem' }} {...focusHandlers} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>HR / Recruiter Name</label>
              <input type="text" placeholder="e.g. Siti Rahma" value={recruiterName} onChange={e => setRecruiterName(e.target.value)} style={inputStyle} {...focusHandlers} />
            </div>
            <div>
              <label style={labelStyle}>Recruiter Contact</label>
              <input type="text" placeholder="email@company.com or +62..." value={recruiterEmail} onChange={e => setRecruiterEmail(e.target.value)} style={inputStyle} {...focusHandlers} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Notes</label>
              <textarea
                rows={2}
                placeholder="Any special notes or requirements..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
                {...focusHandlers}
              />
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" style={{ padding: '0.625rem 1.5rem' }}>
            <PlusCircle style={{ width: '1rem', height: '1rem' }} />
            Save Application
          </button>
        </div>
      </form>
    </Modal>
  );
};
