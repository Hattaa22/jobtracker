import React, { useState } from 'react';
import { Briefcase, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordFormProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onNavigateToLogin,
}) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const res = await forgotPassword(email.trim());
      setSuccessMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3.25rem',
            height: '3.25rem',
            borderRadius: '0.875rem',
            backgroundColor: '#0284C7',
            color: '#ffffff',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
          }}
        >
          <Briefcase style={{ width: '1.75rem', height: '1.75rem' }} />
        </div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            margin: 0,
          }}
        >
          Reset Your Password
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginTop: '0.5rem',
            margin: '0.5rem 0 0 0',
          }}
        >
          Enter your registered email address and we'll send you a password reset link.
        </p>
      </div>

      {/* Success Alert */}
      {successMessage ? (
        <div
          style={{
            padding: '1.25rem 1rem',
            borderRadius: '0.625rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <CheckCircle2
            style={{ width: '2rem', height: '2rem', color: '#10B981', margin: '0 auto 0.75rem auto' }}
          />
          <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
            {successMessage}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                fontSize: '0.875rem',
              }}
            >
              <AlertCircle style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.375rem',
              }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: '#0284C7',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)',
              transition: 'all 0.2s ease',
            }}
          >
            {isLoading ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      {/* Back to Login */}
      <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
        <button
          type="button"
          onClick={onNavigateToLogin}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            padding: 0,
            color: '#0284C7',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  );
};
