import React from 'react';
import { Download, Sun, Moon, Monitor, Zap } from 'lucide-react';
import { useJobContext } from '../../context/JobContext';

interface HeaderProps {
  onOpenQuickApply: () => void;
  onOpenExport: () => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickApply,
  onOpenExport,
  activeTab,
}) => {
  const { user, theme, setTheme } = useJobContext();

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

  return (
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
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
          {getGreeting()}, {user.name} 👋 Track your job search progress.
        </p>
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
      </div>
    </header>
  );
};
