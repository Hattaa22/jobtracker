import React, { useState } from 'react';
import { useJobContext } from '../../context/JobContext';
import type { Application, ApplicationStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Building2, MapPin, Calendar, ExternalLink, UserCheck,
  FileText, Clock, Plus, Trash2, Edit,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (app: Application) => void;
  onDelete?: (app: Application) => void;
}

const ALL_STATUSES: ApplicationStatus[] = [
  'Saved', 'Applied', 'Screening', 'Assessment', 'Interview', 'Final Interview',
  'Offer', 'Accepted', 'Rejected', 'Withdrawn', 'No Response',
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.375rem 0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--border-strong)',
  backgroundColor: 'var(--surface)',
  color: 'var(--text-primary)',
  fontSize: '0.75rem',
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

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application, isOpen, onClose, onEdit, onDelete,
}) => {
  const { events, interviews, followUps, updateApplicationStatus, addInterview } = useJobContext();

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('Applied');
  const [statusNote, setStatusNote] = useState('');
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [interviewType, setInterviewType] = useState('Technical Interview');
  const [interviewDate, setInterviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [interviewTime, setInterviewTime] = useState('13:00');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  if (!application || !isOpen) return null;

  const appEvents = events.filter((e) => e.applicationId === application.id);
  const appInterviews = interviews.filter((i) => i.applicationId === application.id);
  const appFollowUps = followUps.filter((f) => f.applicationId === application.id);

  const handleStatusChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateApplicationStatus(application.id, selectedStatus, statusNote);
    setIsUpdatingStatus(false);
    setStatusNote('');
  };

  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    addInterview({
      applicationId: application.id,
      type: interviewType as any,
      date: interviewDate,
      time: interviewTime,
      meetingUrl: meetingUrl.trim() || undefined,
      notes: interviewNotes.trim() || undefined,
    });
    setShowAddInterview(false);
    setMeetingUrl('');
    setInterviewNotes('');
  };

  const formatCurrency = (val?: number) => {
    if (!val) return null;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={application.companyName} subtitle={application.position} maxWidth="4xl">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Top Card */}
        <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.875rem', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)', flexShrink: 0 }}>
              {application.companyName.charAt(0)}
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>{application.position}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Building2 style={{ width: '0.875rem', height: '0.875rem' }} />{application.companyName}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin style={{ width: '0.875rem', height: '0.875rem' }} />{application.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar style={{ width: '0.875rem', height: '0.875rem' }} />Applied: {application.applicationDate}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StatusBadge status={application.status} size="lg" />
            <button
              onClick={() => { setSelectedStatus(application.status); setIsUpdatingStatus(!isUpdatingStatus); }}
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '0.75rem', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              Update Status
            </button>
          </div>
        </div>

        {/* Status Update Form */}
        {isUpdatingStatus && (
          <form onSubmit={handleStatusChangeSubmit} style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'var(--primary-soft)', border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', margin: 0 }}>Change Application Stage</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>New Status</label>
                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as ApplicationStatus)} style={inputStyle} {...inputFocusHandlers}>
                  {ALL_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Timeline Event Note</label>
                <input type="text" placeholder="e.g. HR responded via WhatsApp..." value={statusNote} onChange={e => setStatusNote(e.target.value)} style={inputStyle} {...inputFocusHandlers} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" onClick={() => setIsUpdatingStatus(false)} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.875rem' }}>Save New Status</button>
            </div>
          </form>
        )}

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Quick specs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
              {[
                { label: 'Work Arrangement', value: `${application.workArrangement} • ${application.jobType}` },
                { label: 'Job Source', value: application.source },
                { label: 'Expected Salary', value: application.salaryMin || application.salaryMax ? `${formatCurrency(application.salaryMin)} - ${formatCurrency(application.salaryMax)}` : 'Not specified', accent: true },
              ].map(spec => (
                <div key={spec.label}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.125rem' }}>{spec.label}</span>
                  <span style={{ fontWeight: 600, color: spec.accent ? 'var(--success)' : 'var(--text-primary)' }}>{spec.value}</span>
                </div>
              ))}
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.125rem' }}>Job Link</span>
                {application.jobUrl ? (
                  <a href={application.jobUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', fontSize: '0.75rem' }}>
                    View Job Listing <ExternalLink style={{ width: '0.75rem', height: '0.75rem' }} />
                  </a>
                ) : <span style={{ color: 'var(--text-muted)' }}>No URL added</span>}
              </div>
            </div>

            {/* Notes */}
            {application.notes && (
              <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-dark)', margin: '0 0 0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FileText style={{ width: '0.875rem', height: '0.875rem' }} /> Notes
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: 1.6, margin: 0 }}>"{application.notes}"</p>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Clock style={{ width: '1rem', height: '1rem', color: 'var(--primary)' }} /> Recruitment Timeline
              </h4>
              <div style={{ paddingLeft: '0.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0.875rem', top: '0.5rem', bottom: '0.5rem', width: '2px', backgroundColor: 'var(--border)' }} />
                {appEvents.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {appEvents.map(evt => (
                      <div key={evt.id} style={{ paddingLeft: '1.75rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '0.375rem', top: '0.25rem', width: '0.875rem', height: '0.875rem', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid var(--background)', boxShadow: '0 0 0 1px var(--primary)' }} />
                        <div style={{ fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{evt.eventDate}</span>
                          <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0.125rem 0' }}>{evt.title}</h5>
                          {evt.description && <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{evt.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '1rem', fontStyle: 'italic' }}>No events logged yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Recruiter Info */}
            <div style={{ padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem', margin: 0 }}>
                <UserCheck style={{ width: '1rem', height: '1rem', color: 'var(--primary)' }} /> Recruiter Info
              </h4>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Name:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{application.recruiterName || 'Not provided'}</span>
              </div>
              {application.recruiterEmail && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Email:</span>
                  <a href={`mailto:${application.recruiterEmail}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{application.recruiterEmail}</a>
                </div>
              )}
              {application.recruiterPhone && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Phone:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{application.recruiterPhone}</span>
                </div>
              )}
            </div>

            {/* Interviews */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
                  Interviews &amp; Tests ({appInterviews.length})
                </h4>
                <button onClick={() => setShowAddInterview(!showAddInterview)} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Plus style={{ width: '0.875rem', height: '0.875rem' }} /> Add Schedule
                </button>
              </div>

              {showAddInterview && (
                <form onSubmit={handleCreateInterview} style={{ padding: '0.75rem', marginBottom: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'var(--primary-soft)', border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Type</label>
                    <select value={interviewType} onChange={e => setInterviewType(e.target.value)} style={inputStyle} {...inputFocusHandlers}>
                      {['HR Interview','Technical Interview','User Interview','Psychotest','Technical Test','Excel Test','Presentation'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Date</label>
                      <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} style={inputStyle} {...inputFocusHandlers} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Time</label>
                      <input type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} style={inputStyle} {...inputFocusHandlers} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Meeting Link</label>
                    <input type="text" placeholder="Google Meet / Zoom URL..." value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} style={inputStyle} {...inputFocusHandlers} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                    <button type="button" onClick={() => setShowAddInterview(false)} className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Save</button>
                  </div>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {appInterviews.length > 0 ? appInterviews.map(item => (
                  <div key={item.id} style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'var(--primary-soft)', border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{item.type}</span>
                      <span style={{ fontWeight: 500, color: 'var(--primary)', fontSize: '0.6875rem' }}>{item.date} • {item.time}</span>
                    </div>
                    {item.meetingUrl && (
                      <a href={item.meetingUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', fontSize: '0.6875rem' }}>
                        Join Meeting <ExternalLink style={{ width: '0.75rem', height: '0.75rem' }} />
                      </a>
                    )}
                  </div>
                )) : <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No interview scheduled yet.</p>}
              </div>
            </div>

            {/* Follow-ups */}
            <div>
              <h4 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Follow-ups ({appFollowUps.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {appFollowUps.length > 0 ? appFollowUps.map(fol => (
                  <div key={fol.id} style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>{fol.contactMethod} ({fol.followUpDate})</span>
                      <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '999px', fontWeight: 600, backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent-dark)' }}>{fol.status}</span>
                    </div>
                    {fol.message && <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.6875rem' }}>"{fol.message}"</p>}
                  </div>
                )) : <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No follow-ups recorded.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {onDelete && (
            <button
              onClick={() => onDelete(application)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '0.75rem',
                color: 'var(--danger)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--danger-soft)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Trash2 style={{ width: '1rem', height: '1rem' }} /> Delete Application
            </button>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            {onEdit && (
              <button onClick={() => onEdit(application)} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
                <Edit style={{ width: '1rem', height: '1rem' }} /> Edit Details
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '0.75rem',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--background)',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
