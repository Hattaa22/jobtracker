import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Application,
  Company,
  UserProfile,
  ApplicationEvent,
  InterviewSchedule,
  FollowUp,
  Attachment,
  QuickApplyPayload,
  ApplicationStatus,
} from '../types';
import {
  getStorageData,
  setStorageData,
  defaultUser,
  sampleApplications,
  sampleCompanies,
  sampleEvents,
  sampleInterviews,
  sampleFollowUps,
  initializeDefaultStorage,
} from '../services/storage';

interface JobContextType {
  user: UserProfile;
  applications: Application[];
  companies: Company[];
  events: ApplicationEvent[];
  interviews: InterviewSchedule[];
  followUps: FollowUp[];
  attachments: Attachment[];
  
  // Actions
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  quickApply: (payload: QuickApplyPayload) => Application;
  addApplication: (app: Partial<Application>) => Application;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus, notes?: string) => void;
  
  addInterview: (interview: Omit<InterviewSchedule, 'id' | 'createdAt'>) => InterviewSchedule;
  deleteInterview: (id: string) => void;
  
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => FollowUp;
  updateFollowUpStatus: (id: string, status: FollowUp['status']) => void;
  deleteFollowUp: (id: string) => void;

  resetToDemoData: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    initializeDefaultStorage();
  }, []);

  const [user, setUser] = useState<UserProfile>(() => getStorageData('jobtrack_user', defaultUser));
  const [applications, setApplications] = useState<Application[]>(() =>
    getStorageData('jobtrack_applications', sampleApplications)
  );
  const [companies, setCompanies] = useState<Company[]>(() =>
    getStorageData('jobtrack_companies', sampleCompanies)
  );
  const [events, setEvents] = useState<ApplicationEvent[]>(() =>
    getStorageData('jobtrack_events', sampleEvents)
  );
  const [interviews, setInterviews] = useState<InterviewSchedule[]>(() =>
    getStorageData('jobtrack_interviews', sampleInterviews)
  );
  const [followUps, setFollowUps] = useState<FollowUp[]>(() =>
    getStorageData('jobtrack_followups', sampleFollowUps)
  );
  const [attachments, setAttachments] = useState<Attachment[]>(() =>
    getStorageData('jobtrack_attachments', [])
  );
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('jobtrack_theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return (user.preferences?.theme as 'light' | 'dark' | 'system') || 'light';
  });

  // Sync theme with DOM document element
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (theme === 'dark' || (theme === 'system' && mediaQuery.matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('jobtrack_theme', newTheme);
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, theme: newTheme },
    };
    setUser(updatedUser);
    setStorageData('jobtrack_user', updatedUser);
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    const updated = { ...user, ...profile };
    setUser(updated);
    setStorageData('jobtrack_user', updated);
  };

  const findOrCreateCompany = (companyName: string): Company => {
    const trimmed = companyName.trim();
    const existing = companies.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return existing;

    const newCompany: Company = {
      id: `comp-${Date.now()}`,
      userId: user.id,
      name: trimmed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedCompanies = [newCompany, ...companies];
    setCompanies(updatedCompanies);
    setStorageData('jobtrack_companies', updatedCompanies);
    return newCompany;
  };

  const quickApply = (payload: QuickApplyPayload): Application => {
    const today = payload.applicationDate || new Date().toISOString().split('T')[0];
    const company = findOrCreateCompany(payload.companyName);

    const newApp: Application = {
      id: `app-${Date.now()}`,
      userId: user.id,
      companyId: company.id,
      companyName: company.name,
      position: payload.position,
      jobType: 'Full Time',
      workArrangement: 'On-site',
      location: company.location || 'Indonesia',
      source: payload.source || 'JobStreet',
      jobUrl: payload.jobUrl,
      applicationDate: today,
      status: payload.status || 'Applied',
      currency: user.preferences.currency || 'IDR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const initialEvent: ApplicationEvent = {
      id: `ev-${Date.now()}`,
      applicationId: newApp.id,
      status: newApp.status,
      eventDate: today,
      title: 'Application Submitted',
      description: `Applied via ${newApp.source}`,
      createdAt: new Date().toISOString(),
    };

    const updatedApps = [newApp, ...applications];
    const updatedEvents = [initialEvent, ...events];

    setApplications(updatedApps);
    setEvents(updatedEvents);
    setStorageData('jobtrack_applications', updatedApps);
    setStorageData('jobtrack_events', updatedEvents);

    return newApp;
  };

  const addApplication = (appData: Partial<Application>): Application => {
    const today = appData.applicationDate || new Date().toISOString().split('T')[0];
    const company = findOrCreateCompany(appData.companyName || 'Unknown Company');

    const newApp: Application = {
      id: `app-${Date.now()}`,
      userId: user.id,
      companyId: company.id,
      companyName: company.name,
      position: appData.position || 'Untitled Position',
      jobType: appData.jobType || 'Full Time',
      workArrangement: appData.workArrangement || 'On-site',
      location: appData.location || 'Indonesia',
      source: appData.source || 'JobStreet',
      jobUrl: appData.jobUrl,
      jobReference: appData.jobReference,
      applicationDate: today,
      status: appData.status || 'Applied',
      salaryMin: appData.salaryMin,
      salaryMax: appData.salaryMax,
      currency: appData.currency || user.preferences.currency || 'IDR',
      recruiterName: appData.recruiterName,
      recruiterEmail: appData.recruiterEmail,
      recruiterPhone: appData.recruiterPhone,
      notes: appData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const initialEvent: ApplicationEvent = {
      id: `ev-${Date.now()}`,
      applicationId: newApp.id,
      status: newApp.status,
      eventDate: today,
      title: 'Application Created',
      description: `Initial status: ${newApp.status}`,
      createdAt: new Date().toISOString(),
    };

    const updatedApps = [newApp, ...applications];
    const updatedEvents = [initialEvent, ...events];

    setApplications(updatedApps);
    setEvents(updatedEvents);
    setStorageData('jobtrack_applications', updatedApps);
    setStorageData('jobtrack_events', updatedEvents);

    return newApp;
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    const appToUpdate = applications.find((a) => a.id === id);
    if (!appToUpdate) return;

    const updatedApps = applications.map((app) => {
      if (app.id === id) {
        return {
          ...app,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return app;
    });

    setApplications(updatedApps);
    setStorageData('jobtrack_applications', updatedApps);
  };

  const deleteApplication = (id: string) => {
    const updatedApps = applications.filter((app) => app.id !== id);
    const updatedEvents = events.filter((e) => e.applicationId !== id);
    const updatedInterviews = interviews.filter((i) => i.applicationId !== id);
    const updatedFollowUps = followUps.filter((f) => f.applicationId !== id);
    const updatedAttachments = attachments.filter((a) => a.applicationId !== id);

    setApplications(updatedApps);
    setEvents(updatedEvents);
    setInterviews(updatedInterviews);
    setFollowUps(updatedFollowUps);
    setAttachments(updatedAttachments);

    setStorageData('jobtrack_applications', updatedApps);
    setStorageData('jobtrack_events', updatedEvents);
    setStorageData('jobtrack_interviews', updatedInterviews);
    setStorageData('jobtrack_followups', updatedFollowUps);
    setStorageData('jobtrack_attachments', updatedAttachments);
  };

  const updateApplicationStatus = (
    id: string,
    status: ApplicationStatus,
    notes?: string
  ) => {
    const app = applications.find((a) => a.id === id);
    if (!app || app.status === status) return;

    const today = new Date().toISOString().split('T')[0];

    const updatedApps = applications.map((a) =>
      a.id === id
        ? {
            ...a,
            status,
            notes: notes ? `${a.notes ? a.notes + '\n' : ''}${notes}` : a.notes,
            updatedAt: new Date().toISOString(),
          }
        : a
    );

    const newEvent: ApplicationEvent = {
      id: `ev-${Date.now()}`,
      applicationId: id,
      status,
      eventDate: today,
      title: `Status changed to ${status}`,
      description: notes || `Updated recruitment stage to ${status}`,
      createdAt: new Date().toISOString(),
    };

    const updatedEvents = [newEvent, ...events];

    setApplications(updatedApps);
    setEvents(updatedEvents);
    setStorageData('jobtrack_applications', updatedApps);
    setStorageData('jobtrack_events', updatedEvents);
  };

  const addInterview = (
    interviewData: Omit<InterviewSchedule, 'id' | 'createdAt'>
  ): InterviewSchedule => {
    const newInterview: InterviewSchedule = {
      ...interviewData,
      id: `int-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newInterview, ...interviews];
    setInterviews(updated);
    setStorageData('jobtrack_interviews', updated);

    // Automatically change application status if it's currently Applied or Screening
    const app = applications.find((a) => a.id === interviewData.applicationId);
    if (app && ['Applied', 'Screening', 'Saved'].includes(app.status)) {
      updateApplicationStatus(
        app.id,
        'Interview',
        `Scheduled ${interviewData.type} on ${interviewData.date}`
      );
    }

    return newInterview;
  };

  const deleteInterview = (id: string) => {
    const updated = interviews.filter((i) => i.id !== id);
    setInterviews(updated);
    setStorageData('jobtrack_interviews', updated);
  };

  const addFollowUp = (
    followUpData: Omit<FollowUp, 'id' | 'createdAt'>
  ): FollowUp => {
    const newFollowUp: FollowUp = {
      ...followUpData,
      id: `fol-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newFollowUp, ...followUps];
    setFollowUps(updated);
    setStorageData('jobtrack_followups', updated);
    return newFollowUp;
  };

  const updateFollowUpStatus = (id: string, status: FollowUp['status']) => {
    const updated = followUps.map((f) => (f.id === id ? { ...f, status } : f));
    setFollowUps(updated);
    setStorageData('jobtrack_followups', updated);
  };

  const deleteFollowUp = (id: string) => {
    const updated = followUps.filter((f) => f.id !== id);
    setFollowUps(updated);
    setStorageData('jobtrack_followups', updated);
  };

  const resetToDemoData = () => {
    setStorageData('jobtrack_applications', sampleApplications);
    setStorageData('jobtrack_companies', sampleCompanies);
    setStorageData('jobtrack_events', sampleEvents);
    setStorageData('jobtrack_interviews', sampleInterviews);
    setStorageData('jobtrack_followups', sampleFollowUps);
    setStorageData('jobtrack_attachments', []);
    setStorageData('jobtrack_user', defaultUser);

    setApplications(sampleApplications);
    setCompanies(sampleCompanies);
    setEvents(sampleEvents);
    setInterviews(sampleInterviews);
    setFollowUps(sampleFollowUps);
    setAttachments([]);
    setUser(defaultUser);
  };

  return (
    <JobContext.Provider
      value={{
        user,
        applications,
        companies,
        events,
        interviews,
        followUps,
        attachments,
        updateUserProfile,
        quickApply,
        addApplication,
        updateApplication,
        deleteApplication,
        updateApplicationStatus,
        addInterview,
        deleteInterview,
        addFollowUp,
        updateFollowUpStatus,
        deleteFollowUp,
        resetToDemoData,
        theme,
        setTheme,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
};
