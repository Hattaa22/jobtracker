import React, { useState } from 'react';
import { useJobContext } from '../../context/JobContext';
import type { Application, ApplicationStatus, JobSource, WorkArrangement } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Search, ExternalLink, Eye, Trash2,
  ChevronLeft, ChevronRight, ArrowUpDown, Briefcase,
} from 'lucide-react';

interface ApplicationTableProps {
  onSelectApplication: (app: Application) => void;
  onDeleteApplication: (app: Application) => void;
}

const SOURCES: JobSource[] = [
  'JobStreet', 'LinkedIn', 'Glints', 'Kalibrr', 'Indeed',
  'Company Website', 'Referral', 'Campus Career', 'WhatsApp', 'Email', 'Other',
];
const STATUSES: ApplicationStatus[] = [
  'Saved', 'Applied', 'Screening', 'Assessment', 'Interview', 'Final Interview',
  'Offer', 'Accepted', 'Rejected', 'Withdrawn', 'No Response',
];
const WORK_TYPES: WorkArrangement[] = ['On-site', 'Hybrid', 'Remote'];

const selectStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: '0.75rem',
  border: '1px solid var(--border-strong)',
  backgroundColor: 'var(--surface)',
  color: 'var(--text-primary)',
  fontSize: '0.75rem',
  fontWeight: 500,
  outline: 'none',
  cursor: 'pointer',
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

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  onSelectApplication,
  onDeleteApplication,
}) => {
  const { applications } = useJobContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedWorkType, setSelectedWorkType] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'applicationDate' | 'companyName' | 'position'>('applicationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredApps = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    return (
      (app.companyName.toLowerCase().includes(q) ||
        app.position.toLowerCase().includes(q) ||
        (app.recruiterName && app.recruiterName.toLowerCase().includes(q)) ||
        (app.notes && app.notes.toLowerCase().includes(q))) &&
      (selectedStatus === 'ALL' || app.status === selectedStatus) &&
      (selectedSource === 'ALL' || app.source === selectedSource) &&
      (selectedWorkType === 'ALL' || app.workArrangement === selectedWorkType)
    );
  });

  const sortedApps = [...filteredApps].sort((a, b) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const totalPages = Math.ceil(sortedApps.length / pageSize) || 1;
  const paginatedApps = sortedApps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: 'applicationDate' | 'companyName' | 'position') => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Filters */}
      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search company, position, notes..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              {...inputFocusHandlers}
            />
          </div>

          {/* Dropdowns */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              style={selectStyle}
              {...inputFocusHandlers}
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={selectedSource}
              onChange={(e) => { setSelectedSource(e.target.value); setCurrentPage(1); }}
              style={selectStyle}
              {...inputFocusHandlers}
            >
              <option value="ALL">All Sources</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={selectedWorkType}
              onChange={(e) => { setSelectedWorkType(e.target.value); setCurrentPage(1); }}
              style={selectStyle}
              {...inputFocusHandlers}
            >
              <option value="ALL">All Work Types</option>
              {WORK_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="card"
        style={{ overflow: 'hidden', padding: 0, backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {paginatedApps.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
              <thead
                style={{
                  backgroundColor: 'var(--background)',
                  borderBottom: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                }}
              >
                <tr>
                  {[['companyName', 'Company'], ['position', 'Position'], ['applicationDate', 'Applied Date']].map(([field, label]) => (
                    <th
                      key={field}
                      onClick={() => toggleSort(field as 'applicationDate' | 'companyName' | 'position')}
                      style={{ padding: '0.875rem 1rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {label} <ArrowUpDown style={{ width: '0.75rem', height: '0.75rem' }} />
                      </div>
                    </th>
                  ))}
                  <th style={{ padding: '0.875rem 1rem' }}>Source</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Location</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApps.map((app) => (
                  <tr
                    key={app.id}
                    style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'transparent', transition: 'background-color 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '1.75rem',
                            height: '1.75rem',
                            borderRadius: '0.5rem',
                            backgroundColor: 'var(--primary-soft)',
                            color: 'var(--primary)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            flexShrink: 0,
                          }}
                        >
                          {app.companyName.charAt(0)}
                        </div>
                        {app.companyName}
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {app.position}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {app.applicationDate}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.375rem',
                          backgroundColor: 'var(--surface-hover)',
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                          fontSize: '0.6875rem',
                        }}
                      >
                        {app.source}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>
                      {app.location} ({app.workArrangement})
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="View Job Link"
                            style={{
                              padding: '0.375rem',
                              borderRadius: '0.5rem',
                              color: 'var(--text-muted)',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary-soft)'; e.currentTarget.style.color = 'var(--primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                          >
                            <ExternalLink style={{ width: '0.875rem', height: '0.875rem' }} />
                          </a>
                        )}
                        <button
                          onClick={() => onSelectApplication(app)}
                          title="View Details"
                          style={{ padding: '0.375rem', borderRadius: '0.5rem', color: 'var(--text-muted)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary-soft)'; e.currentTarget.style.color = 'var(--primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                          <Eye style={{ width: '0.875rem', height: '0.875rem' }} />
                        </button>
                        <button
                          onClick={() => onDeleteApplication(app)}
                          title="Delete"
                          style={{ padding: '0.375rem', borderRadius: '0.5rem', color: 'var(--text-muted)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--danger-soft)'; e.currentTarget.style.color = 'var(--danger)'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                          <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Briefcase style={{ width: '3rem', height: '3rem', color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              No applications found
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem', maxWidth: '24rem', margin: '0.375rem auto 0' }}>
              Try adjusting your search or filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedApps.length)} of {sortedApps.length} applications
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                style={{
                  padding: '0.25rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.4 : 1,
                  display: 'flex',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (currentPage !== 1) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
              </button>
              <span style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                style={{
                  padding: '0.25rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  display: 'flex',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (currentPage !== totalPages) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ChevronRight style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
