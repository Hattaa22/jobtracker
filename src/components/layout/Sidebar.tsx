import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Building2,
  PieChart,
  MessageSquare,
  Settings,
  Zap,
  Plus,
} from 'lucide-react';
import { useJobContext } from '../../context/JobContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickApply: () => void;
  onOpenAddApplication: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickApply,
  onOpenAddApplication,
}) => {
  const { user } = useJobContext();

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'followups', label: 'Follow-Ups', icon: MessageSquare },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--sidebar)',
        borderRight: '1px solid var(--border)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
      className="hidden md:flex"
    >
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '0.75rem',
              backgroundColor: '#0B84C6',
              color: '#fff',
              fontWeight: 900,
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            J
          </div>
          <div>
            <h1
              style={{
                fontWeight: 800,
                fontSize: '0.9375rem',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                lineHeight: 1,
                margin: 0,
              }}
            >
              JobTrack
            </h1>
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Command Center
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={onOpenQuickApply} className="btn-accent" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem 1rem' }}>
            <Zap style={{ width: '1rem', height: '1rem', fill: '#fff' }} />
            I Just Applied
          </button>
          <button
            onClick={onOpenAddApplication}
            className="btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              backgroundColor: 'var(--primary-soft)',
              color: 'var(--primary)',
              border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--primary) 15%, transparent)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--primary-soft)')}
          >
            <Plus style={{ width: '1rem', height: '1rem' }} />
            Add Application
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item${isActive ? ' active' : ''}`}
              >
                <Icon
                  style={{
                    width: '1rem',
                    height: '1rem',
                    color: isActive ? 'var(--nav-active-icon)' : 'var(--nav-icon)',
                    flexShrink: 0,
                  }}
                />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--background)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h4
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.name}
            </h4>
            <p
              style={{
                fontSize: '0.625rem',
                color: 'var(--text-muted)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
