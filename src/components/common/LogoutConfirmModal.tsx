import React from 'react';
import { LogOut } from 'lucide-react';
import { Modal } from './Modal';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Logout">
      <div style={{ padding: '0.5rem 0 1rem 0', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            marginBottom: '1rem',
          }}
        >
          <LogOut style={{ width: '1.75rem', height: '1.75rem' }} />
        </div>
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 0.5rem 0',
          }}
        >
          Are you sure you want to log out?
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          You will need to sign in again to access your job applications and tracker.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            marginTop: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '0.5rem',
              backgroundColor: '#EF4444',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
            }}
          >
            Yes, Log Out
          </button>
        </div>
      </div>
    </Modal>
  );
};
