import React, { useState, useRef, useEffect } from 'react';
import { Download, Sun, Moon, Monitor, Zap, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useJobContext } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import { LogoutConfirmModal } from '../common/LogoutConfirmModal';

interface HeaderProps {
  onOpenQuickApply: () => void;
  onOpenExport: () => void;
  activeTab: string;
  onNavigateToSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickApply,
  onOpenExport,
  activeTab,
  onNavigateToSettings,
}) => {
  const { theme, setTheme, isPostgresConnected } = useJobContext();
  const { user: authUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = authUser?.name || 'User';
  const displayEmail = authUser?.email || 'user@example.com';
  const displayAvatar = authUser?.avatarUrl;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const titleMap: Record<string, string> = {
    dashboard: 'Dashboard',
    applications: 'Applications List',
    calendar: 'Selection Calendar',
    followups: 'Follow-Up Tracker',
    companies: 'Companies Directory',
    analytics: 'Analytics & Funnel',
    settings: 'Settings',
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const themeIcon = theme === 'dark' ? (
    <><Moon style={{ width: '1rem', height: '1rem', color: '#38BDF8' }} /><span style={{ display: 'none' }} className="sm:inline-block">Dark</span></>
  ) : theme === 'system' ? (
    <><Monitor style={{ width: '1rem', height: '1rem', color: 'var(--text-muted)' }} /><span style={{ display: 'none' }} className="sm:inline-block">System</span></>
  ) : (
    <><Sun style={{ width: '1rem', height: '1rem', color: '#F59E0B' }} /><span style={{ display: 'none' }} className="sm:inline-block">Light</span></>
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backgroundColor: 'var(--header)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {titleMap[activeTab] || 'Dashboard'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem', margin: 0 }}>
              {getGreeting()}, {displayName} 👋 Track your job search progress.
            </p>
            <span
              title={isPostgresConnected ? 'Terhubung ke PostgreSQL Database' : 'Database Offline / LocalStorage Mode'}
              style={{
                fontSize: '0.7rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: isPostgresConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isPostgresConnected ? '#10B981' : '#F59E0B',
                border: `1px solid ${isPostgresConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isPostgresConnected ? '#10B981' : '#F59E0B',
                }}
              />
              {isPostgresConnected ? 'PostgreSQL' : 'Offline / LocalStorage'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Export button */}
          <button
            onClick={onOpenExport}
            className="btn-secondary"
            style={{ fontSize: '0.75rem' }}
          >
            <Download style={{ width: '0.875rem', height: '0.875rem' }} />
            <span className="hidden sm:inline">Export Data</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={cycleTheme}
            title={`Theme: ${theme}. Click to cycle.`}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.75rem' }}
          >
            {themeIcon}
          </button>

          {/* Mobile Quick Apply */}
          <button
            onClick={onOpenQuickApply}
            className="btn-accent md:hidden"
            style={{ padding: '0.5rem' }}
            title="Quick Apply"
          >
            <Zap style={{ width: '1rem', height: '1rem', fill: '#fff' }} />
          </button>

          {/* User Profile Dropdown Menu */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.625rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card-bg)',
                cursor: 'pointer',
              }}
            >
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    backgroundColor: '#0284C7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  {getInitials(displayName)}
                </div>
              )}
              <span className="hidden md:inline" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {displayName}
              </span>
              <ChevronDown style={{ width: '0.875rem', height: '0.875rem', color: 'var(--text-muted)' }} />
            </button>

            {/* Dropdown Menu Popup */}
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '240px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                  zIndex: 50,
                  overflow: 'hidden',
                }}
              >
                {/* User Header */}
                <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    {displayAvatar ? (
                      <img src={displayAvatar} alt={displayName} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%' }} />
                    ) : (
                      <div
                        style={{
                          width: '2.25rem',
                          height: '2.25rem',
                          borderRadius: '50%',
                          backgroundColor: '#0284C7',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                        }}
                      >
                        {getInitials(displayName)}
                      </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {displayName}
                      </p>
                      <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {displayEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '0.375rem' }}>
                  {onNavigateToSettings && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onNavigateToSettings();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        padding: '0.625rem 0.75rem',
                        fontSize: '0.8125rem',
                        color: 'var(--text-primary)',
                        borderRadius: '0.375rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      className="hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Settings style={{ width: '1rem', height: '1rem', color: 'var(--text-muted)' }} />
                      <span>Settings & Profile</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.625rem 0.75rem',
                      fontSize: '0.8125rem',
                      color: '#EF4444',
                      borderRadius: '0.375rem',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                    className="hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <LogOut style={{ width: '1rem', height: '1rem' }} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => logout()}
      />
    </>
  );
};
