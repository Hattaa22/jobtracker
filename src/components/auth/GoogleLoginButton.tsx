import React, { useState } from 'react';

interface GoogleLoginButtonProps {
  onSuccess: (credential?: string, profile?: any) => Promise<void>;
  onError?: (message: string) => void;
  isLoading?: boolean;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  isLoading = false,
}) => {
  const [connecting, setConnecting] = useState(false);

  const handleGoogleClick = async () => {
    if (connecting || isLoading) return;
    setConnecting(true);

    try {
      // Check if Google Identity Services (gsi/client) is loaded
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        // Initialize with credential callback so onSuccess is called with the real token
        (window as any).google.accounts.id.initialize({
          client_id: '', // Loaded from meta tag by GSI script if set
          callback: async (response: any) => {
            if (response?.credential) {
              await onSuccess(response.credential);
            }
          },
        });
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // FIX FINDING #14: Show a clear error instead of silently sending undefined credential
            const msg = 'Google sign-in was blocked or dismissed. Please try again, or check if your browser blocks pop-ups.';
            if (onError) onError(msg);
          }
        });
      } else {
        // FIX FINDING #14: Google OAuth not loaded — show a clear user-facing error
        const msg = 'Google sign-in is not available. Please ensure you are connected to the internet, or use email/password login.';
        if (onError) onError(msg);
      }
    } catch (err) {
      console.error('Google OAuth error:', err);
      if (onError) onError('Google sign-in encountered an error. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const loadingState = connecting || isLoading;

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={loadingState}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--surface)',
        color: 'var(--text-primary)',
        fontWeight: 600,
        fontSize: '0.875rem',
        cursor: loadingState ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: loadingState ? 0.7 : 1,
      }}
      className="btn-secondary hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <svg style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{loadingState ? 'Connecting to Google...' : 'Continue with Google'}</span>
    </button>
  );
};
