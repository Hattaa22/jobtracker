import React, { useState } from 'react';
import { useJobContext } from '../../context/JobContext';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import type { ContactMethod, FollowUpStatus } from '../../types';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: '0.75rem',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--surface)',
  color: 'var(--text-primary)',
  fontSize: '0.75rem',
  outline: 'none',
  boxSizing: 'border-box',
};

export const FollowUpList: React.FC = () => {
  const { followUps, applications, addFollowUp, updateFollowUpStatus, deleteFollowUp } =
    useJobContext();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(applications[0]?.id || '');
  const [followUpDate, setFollowUpDate] = useState(new Date().toISOString().split('T')[0]);
  const [contactMethod, setContactMethod] = useState<ContactMethod>('WhatsApp');
  const [contactPerson, setContactPerson] = useState('');
  const [message, setMessage] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;
    addFollowUp({
      applicationId: selectedAppId,
      followUpDate,
      contactMethod,
      contactPerson: contactPerson.trim() || undefined,
      message: message.trim() || undefined,
      status: 'Upcoming',
    });
    setShowAddForm(false);
    setMessage('');
  };

  const getStatusStyle = (status: FollowUpStatus): { bg: string; color: string; border: string; text: string } => {
    switch (status) {
      case 'Completed':
        return { bg: 'var(--success-soft)', color: 'var(--success)', border: 'color-mix(in srgb, var(--success) 25%, transparent)', text: '✓ Completed' };
      case 'Due Today':
        return { bg: 'var(--accent-soft)', color: 'var(--accent-dark)', border: 'color-mix(in srgb, var(--accent) 25%, transparent)', text: '! Due Today' };
      case 'Overdue':
        return { bg: 'var(--danger-soft)', color: 'var(--danger)', border: 'color-mix(in srgb, var(--danger) 25%, transparent)', text: '⚠ Overdue' };
      default:
        return { bg: 'var(--primary-soft)', color: 'var(--primary-dark)', border: 'color-mix(in srgb, var(--primary) 25%, transparent)', text: 'Upcoming' };
    }
  };

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
            Follow-Up Tracker ({followUps.length})
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            Never forget to check back on your applications
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
          style={{ fontSize: '0.75rem' }}
        >
          <Plus style={{ width: '1rem', height: '1rem' }} />
          Schedule Follow-Up
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="card"
          style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            New Follow-Up Task
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Select Application
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                style={inputStyle}
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.companyName} — {app.position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Follow-Up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Method
              </label>
              <select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value as ContactMethod)}
                style={inputStyle}
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Phone">Phone</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Contact Person (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Siti Rahma (HR)"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Draft Message / Note
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Halo Mbak Siti, menanyakan kelanjutan..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Schedule
            </button>
          </div>
        </form>
      )}

      {/* Follow-up List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {followUps.length > 0 ? (
          followUps.map((fol) => {
            const app = applications.find((a) => a.id === fol.applicationId);
            const statusStyle = getStatusStyle(fol.status);
            return (
              <div
                key={fol.id}
                className="card"
                style={{
                  padding: '1rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.625rem',
                        borderRadius: '999px',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {statusStyle.text}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {fol.followUpDate} via {fol.contactMethod}
                    </span>
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
                    Company: {app ? app.companyName : 'PT Example'}
                  </h4>
                  {fol.message && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--surface-hover)',
                        padding: '0.625rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border)',
                        margin: 0,
                        fontStyle: 'italic',
                      }}
                    >
                      "{fol.message}"
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {fol.status !== 'Completed' && (
                    <button
                      onClick={() => updateFollowUpStatus(fol.id, 'Completed')}
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '0.625rem',
                        backgroundColor: 'var(--primary-soft)',
                        color: 'var(--primary)',
                        border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Mark Completed
                    </button>
                  )}
                  <button
                    onClick={() => deleteFollowUp(fol.id)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.625rem',
                      backgroundColor: 'transparent',
                      color: 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--danger-soft)'; e.currentTarget.style.color = 'var(--danger)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <Trash2 style={{ width: '1rem', height: '1rem' }} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className="card"
            style={{
              padding: '3rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <MessageSquare style={{ width: '2.5rem', height: '2.5rem', color: 'var(--text-muted)' }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              No follow-ups recorded yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
