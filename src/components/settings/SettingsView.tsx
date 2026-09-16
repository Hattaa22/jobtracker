import React, { useState } from 'react';
import { useJobContext } from '../../context/JobContext';
import { User, Sun, Moon, Monitor, RotateCcw, Save, ShieldCheck } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.875rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--border-strong)',
  backgroundColor: 'var(--surface)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

export const SettingsView: React.FC = () => {
  const { user, updateUserProfile, theme, setTheme, resetToDemoData } = useJobContext();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [location, setLocation] = useState(user.location || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user.portfolioUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setPortfolioUrl(user.portfolioUrl || '');
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email, phone, location, portfolioUrl });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun, iconColor: 'var(--accent)' },
    { value: 'dark' as const, label: 'Dark', icon: Moon, iconColor: 'var(--primary)' },
    { value: 'system' as const, label: 'System', icon: Monitor, iconColor: 'var(--text-muted)' },
  ];

  return (
    <div style={{ maxWidth: '56rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header banner */}
      <div
        className="card"
        style={{ padding: '1rem' }}
      >
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
          Account Settings &amp; Preferences
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Manage your personal profile, application defaults, and system theme
        </p>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="card"
        style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <h4
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: 0,
          }}
        >
          <User style={{ width: '1rem', height: '1rem', color: 'var(--primary)' }} />
          User Profile
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Full Name', value: name, setter: setName, type: 'text' },
            { label: 'Email Address', value: email, setter: setEmail, type: 'email' },
            { label: 'Phone Number', value: phone, setter: setPhone, type: 'text' },
            { label: 'Location', value: location, setter: setLocation, type: 'text' },
          ].map((field) => (
            <div key={field.label}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                {field.label}
              </label>
              <input
                type={field.type}
                className="input-field"
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--shadow-focus)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          ))}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Portfolio / Website Link
            </label>
            <input
              type="url"
              className="input-field"
              placeholder="https://yourportfolio.dev"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = 'var(--shadow-focus)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border)',
          }}
        >
          {savedSuccess && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <ShieldCheck style={{ width: '1rem', height: '1rem' }} />
              Profile updated successfully!
            </span>
          )}
          <button type="submit" className="btn-primary" style={{ marginLeft: 'auto' }}>
            <Save style={{ width: '1rem', height: '1rem' }} />
            Save Profile
          </button>
        </div>
      </form>

      {/* Appearance & Data Management */}
      <div
        className="card"
        style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Appearance &amp; Data Management
        </h4>

        {/* Theme Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            System Theme
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {themeOptions.map(({ value, label, icon: Icon, iconColor }) => {
              const isActive = theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  style={{
                    padding: '0.875rem 1.5rem',
                    borderRadius: '0.875rem',
                    border: isActive
                      ? '2px solid var(--primary)'
                      : '1px solid var(--border)',
                    backgroundColor: isActive ? 'var(--primary-soft)' : 'var(--surface-hover)',
                    color: isActive ? 'var(--primary-dark)' : 'var(--text-secondary)',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 700 : 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? 'var(--shadow)' : 'none',
                    transform: isActive ? 'translateY(-1px)' : 'none',
                    minWidth: '110px',
                    justifyContent: 'center',
                  }}
                >
                  <Icon style={{ width: '1rem', height: '1rem', color: iconColor }} />
                  {label}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Currently active: <strong style={{ color: 'var(--text-secondary)' }}>{theme}</strong> mode.
            {theme === 'system' && ' Following your operating system preference.'}
          </p>
        </div>

        {/* Reset Data */}
        <div
          style={{
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Reset Application Demo Data
            </h5>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Restore default sample job applications, companies &amp; calendar events.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset to demo sample applications?')) resetToDemoData();
            }}
            className="btn-secondary"
          >
            <RotateCcw style={{ width: '0.875rem', height: '0.875rem' }} />
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};
