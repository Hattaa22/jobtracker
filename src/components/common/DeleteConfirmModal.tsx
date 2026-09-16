import React from 'react';
import type { Application } from '../../types';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  application,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!application || !isOpen) return null;

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
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
          border: '1px solid var(--border)',
          zIndex: 10,
          padding: '1.5rem',
          textAlign: 'center',
          animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            backgroundColor: 'var(--danger-soft)',
            color: 'var(--danger)',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(220,38,38,0.2)',
          }}
        >
          <AlertTriangle style={{ width: '1.5rem', height: '1.5rem' }} />
        </div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
          Delete Application?
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          Are you sure you want to delete <br />
          <strong style={{ color: 'var(--text-primary)' }}>
            "{application.position} — {application.companyName}"
          </strong>?
        </p>
        <p style={{ fontSize: '0.6875rem', color: 'var(--danger)', fontWeight: 500, marginTop: '0.375rem' }}>
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            style={{
              flex: 1,
              padding: '0.625rem 1rem',
              borderRadius: '0.75rem',
              backgroundColor: 'var(--danger)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              transition: 'opacity 0.15s',
            }}
          >
            <Trash2 style={{ width: '1rem', height: '1rem' }} />
            Delete
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
};
