import React, { useState } from 'react';
import { Eye, EyeOff, Briefcase, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLoginButton } from './GoogleLoginButton';

interface RegisterFormProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const { register, googleLogin } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      onRegisterSuccess();
    } catch (err: any) {
      setErrors({ form: err.message || 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async (credential?: string, profile?: any) => {
    setIsLoading(true);
    setErrors({});
    try {
      await googleLogin(credential, profile);
      onRegisterSuccess();
    } catch (err: any) {
      setErrors({ form: err.message || 'Google authentication failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
            fontSize: '1.625rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            margin: 0,
          }}
        >
          Create an Account
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginTop: '0.5rem',
            margin: '0.5rem 0 0 0',
          }}
        >
          Start tracking your job search and interview progress today.
        </p>
      </div>

      {/* Main Error Alert */}
      {errors.form && (
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
            marginBottom: '1.25rem',
          }}
        >
          <AlertCircle style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.375rem',
            }}
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            autoComplete="name"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: '0.5rem',
              border: `1px solid ${errors.name ? '#EF4444' : 'var(--border)'}`,
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.name && (
            <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
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
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: '0.5rem',
              border: `1px solid ${errors.email ? '#EF4444' : 'var(--border)'}`,
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.email && (
            <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.375rem',
            }}
          >
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.625rem 2.5rem 0.625rem 0.875rem',
                borderRadius: '0.5rem',
                border: `1px solid ${errors.password ? '#EF4444' : 'var(--border)'}`,
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showPassword ? <EyeOff style={{ width: '1rem', height: '1rem' }} /> : <Eye style={{ width: '1rem', height: '1rem' }} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.375rem',
            }}
          >
            Confirm Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.625rem 2.5rem 0.625rem 0.875rem',
                borderRadius: '0.5rem',
                border: `1px solid ${errors.confirmPassword ? '#EF4444' : 'var(--border)'}`,
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              title={showConfirmPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showConfirmPassword ? <EyeOff style={{ width: '1rem', height: '1rem' }} /> : <Eye style={{ width: '1rem', height: '1rem' }} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit Button */}
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
            marginTop: '0.5rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)',
            transition: 'all 0.2s ease',
          }}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '1.25rem 0',
        }}
      >
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
          OR
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
      </div>

      {/* Google OAuth Button */}
      <GoogleLoginButton onSuccess={handleGoogleAuth} isLoading={isLoading} />

      {/* Footer link to Login */}
      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onNavigateToLogin}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: '#0284C7',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Sign In
        </button>
      </p>
    </div>
  );
};
