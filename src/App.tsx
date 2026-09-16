import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider, useJobContext } from './context/JobContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { StatsCards } from './components/dashboard/StatsCards';
import { DashboardCharts } from './components/dashboard/Charts';
import { TodaysApplications } from './components/dashboard/TodaysApplications';
import { StreakWidget } from './components/dashboard/StreakWidget';
import { UpcomingEvents } from './components/dashboard/UpcomingEvents';

import { ApplicationTable } from './components/applications/ApplicationTable';
import { ApplicationKanban } from './components/applications/ApplicationKanban';
import { AddApplicationModal } from './components/applications/AddApplicationModal';
import { QuickApplyModal } from './components/applications/QuickApplyModal';
import { ApplicationDetailModal } from './components/applications/ApplicationDetailModal';
import { DeleteConfirmModal } from './components/common/DeleteConfirmModal';
import { ExportModal } from './components/common/ExportModal';

import { CalendarView } from './components/calendar/CalendarView';
import { CompanyList } from './components/companies/CompanyList';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { FollowUpList } from './components/followups/FollowUpList';
import { SettingsView } from './components/settings/SettingsView';

import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';

import type { Application } from './types';
import { Plus, LayoutList, Kanban, Zap, Eye, Loader2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { applications, refreshData } = useJobContext();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQuickApplyOpen, setIsQuickApplyOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);

  const { deleteApplication } = useJobContext();

  // Reload user data whenever authenticated user changes
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  // Dashboard top 3 recent applications
  const recentApplications = [...applications]
    .sort((a, b) => b.applicationDate.localeCompare(a.applicationDate))
    .slice(0, 3);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
      {/* Sidebar Desktop */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickApply={() => setIsQuickApplyOpen(true)}
        onOpenAddApplication={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: 'var(--background)' }}>
        <Header
          activeTab={activeTab}
          onOpenQuickApply={() => setIsQuickApplyOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onNavigateToSettings={() => setActiveTab('settings')}
        />

        <main style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '90rem', width: '100%', margin: '0 auto', flex: 1 }}>

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Quick Action Top Bar */}
              <div className="card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
                    Application Command Center
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Overview of your active job hunt pipeline and scheduled selection steps
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setIsQuickApplyOpen(true)} className="btn-accent">
                    <Zap style={{ width: '1rem', height: '1rem', fill: '#fff' }} /> I Just Applied
                  </button>
                  <button onClick={() => setIsAddModalOpen(true)} className="btn-brand">
                    <Plus style={{ width: '1rem', height: '1rem' }} /> Add Application
                  </button>
                </div>
              </div>

              {/* Statistics Cards */}
              <StatsCards />

              {/* Charts & Widgets Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="lg:grid-cols-3">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="lg:col-span-2">
                  <DashboardCharts />

                  {/* Recent Applications */}
                  <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        Current Applications
                      </h4>
                      <button
                        onClick={() => setActiveTab('applications')}
                        style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        View All ({applications.length})
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {recentApplications.map((app) => (
                        <div
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          style={{ padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', cursor: 'pointer', transition: 'background-color 0.15s, border-color 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--background)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem' }}>
                              {app.companyName.charAt(0)}
                            </div>
                            <div>
                              <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{app.companyName}</h5>
                              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0 }}>{app.position}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.375rem', backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.6875rem', border: '1px solid var(--border)' }}>
                              {app.status}
                            </span>
                            <Eye style={{ width: '1rem', height: '1rem', color: 'var(--text-muted)' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Widgets Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <TodaysApplications />
                  <StreakWidget />
                  <UpcomingEvents />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLICATIONS LIST */}
          {activeTab === 'applications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
                    Job Applications Management
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                    Search, filter, edit, or change recruitment stage for all your applications
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ backgroundColor: 'var(--background)', padding: '0.25rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <button
                      onClick={() => setViewMode('table')}
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        transition: 'all 0.15s',
                        backgroundColor: viewMode === 'table' ? 'var(--surface)' : 'transparent',
                        color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      <LayoutList style={{ width: '0.875rem', height: '0.875rem' }} /> Table
                    </button>
                    <button
                      onClick={() => setViewMode('kanban')}
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        transition: 'all 0.15s',
                        backgroundColor: viewMode === 'kanban' ? 'var(--surface)' : 'transparent',
                        color: viewMode === 'kanban' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: viewMode === 'kanban' ? 'var(--shadow-sm)' : 'none',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      <Kanban style={{ width: '0.875rem', height: '0.875rem' }} /> Kanban
                    </button>
                  </div>

                  <button onClick={() => setIsAddModalOpen(true)} className="btn-brand">
                    <Plus style={{ width: '1rem', height: '1rem' }} /> Add Application
                  </button>
                </div>
              </div>

              {viewMode === 'table' ? (
                <ApplicationTable
                  onSelectApplication={(app) => setSelectedApp(app)}
                  onDeleteApplication={(app) => setAppToDelete(app)}
                />
              ) : (
                <ApplicationKanban
                  onSelectApplication={(app) => setSelectedApp(app)}
                />
              )}
            </div>
          )}

          {/* TAB 3: CALENDAR */}
          {activeTab === 'calendar' && <CalendarView />}

          {/* TAB 4: FOLLOW-UPS */}
          {activeTab === 'followups' && <FollowUpList />}

          {/* TAB 5: COMPANIES */}
          {activeTab === 'companies' && <CompanyList />}

          {/* TAB 6: ANALYTICS */}
          {activeTab === 'analytics' && <AnalyticsView />}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <QuickApplyModal
        isOpen={isQuickApplyOpen}
        onClose={() => setIsQuickApplyOpen(false)}
      />

      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <ApplicationDetailModal
        application={selectedApp}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        onDelete={(app) => {
          setSelectedApp(null);
          setAppToDelete(app);
        }}
      />

      <DeleteConfirmModal
        application={appToDelete}
        isOpen={!!appToDelete}
        onClose={() => setAppToDelete(null)}
        onConfirm={() => {
          if (appToDelete) deleteApplication(appToDelete.id);
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password'>('login');

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--background)',
          color: 'var(--text-primary)',
          gap: '1rem',
        }}
      >
        <Loader2 style={{ width: '2.5rem', height: '2.5rem', color: '#0284C7', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Loading JobTracker...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--background)',
          color: 'var(--text-primary)',
        }}
      >
        {authView === 'register' ? (
          <RegisterForm
            onNavigateToLogin={() => setAuthView('login')}
            onRegisterSuccess={() => setAuthView('login')}
          />
        ) : authView === 'forgot-password' ? (
          <ForgotPasswordForm
            onNavigateToLogin={() => setAuthView('login')}
          />
        ) : (
          <LoginForm
            onNavigateToRegister={() => setAuthView('register')}
            onNavigateToForgotPassword={() => setAuthView('forgot-password')}
            onLoginSuccess={() => {}}
          />
        )}
      </div>
    );
  }

  return (
    <JobProvider>
      <MainContent />
    </JobProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
