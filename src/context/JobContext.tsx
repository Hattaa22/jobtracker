import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { defaultUser, sampleApplications, sampleCompanies, sampleEvents, sampleInterviews, sampleFollowUps } from '../services/storage';
import { apiService } from '../services/api';

interface JobContextType {
  user: UserProfile;
  applications: Application[];
  companies: Company[];
  events: ApplicationEvent[];
  interviews: InterviewSchedule[];
  followUps: FollowUp[];
  attachments: Attachment[];
  isPostgresConnected: boolean;
  
  // Actions
  refreshData: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  quickApply: (payload: QuickApplyPayload) => Promise<Application>;
  addApplication: (app: Partial<Application>) => Promise<Application>;
  updateApplication: (id: string, updates: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  updateApplicationStatus: (id: string, status: ApplicationStatus, notes?: string) => Promise<void>;
  
  addInterview: (interview: Omit<InterviewSchedule, 'id' | 'createdAt'>) => Promise<InterviewSchedule>;
  deleteInterview: (id: string) => Promise<void>;
  
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => Promise<FollowUp>;
  updateFollowUpStatus: (id: string, status: FollowUp['status']) => Promise<void>;
  deleteFollowUp: (id: string) => Promise<void>;

  resetToDemoData: () => Promise<void>;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [applications, setApplications] = useState<Application[]>(sampleApplications);
  const [companies, setCompanies] = useState<Company[]>(sampleCompanies);
  const [events, setEvents] = useState<ApplicationEvent[]>(sampleEvents);
  const [interviews, setInterviews] = useState<InterviewSchedule[]>(sampleInterviews);
  const [followUps, setFollowUps] = useState<FollowUp[]>(sampleFollowUps);
  const [attachments] = useState<Attachment[]>([]);
  const [isPostgresConnected, setIsPostgresConnected] = useState<boolean>(false);

  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('jobtrack_theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return (user.preferences?.theme as 'light' | 'dark' | 'system') || 'light';
  });

  const loadAllData = useCallback(async () => {
    const isHealthy = await apiService.checkHealth();
    setIsPostgresConnected(isHealthy);

    const [u, apps, comps, evs, ints, fols] = await Promise.all([
      apiService.getUser(),
      apiService.getApplications(),
      apiService.getCompanies(),
      apiService.getEvents(),
      apiService.getInterviews(),
      apiService.getFollowUps(),
    ]);

    setUser(u);
    setApplications(apps);
    setCompanies(comps);
    setEvents(evs);
    setInterviews(ints);
    setFollowUps(fols);
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

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
    apiService.updateUser({ preferences: updatedUser.preferences });
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    const updated = await apiService.updateUser(profile);
    setUser(updated);
  };

  const quickApply = async (payload: QuickApplyPayload): Promise<Application> => {
    const newApp = await apiService.quickApply(payload);
    await loadAllData();
    return newApp;
  };

  const addApplication = async (appData: Partial<Application>): Promise<Application> => {
    const newApp = await apiService.addApplication(appData);
    await loadAllData();
    return newApp;
  };

  const updateApplication = async (id: string, updates: Partial<Application>) => {
    await apiService.updateApplication(id, updates);
    await loadAllData();
  };

  const deleteApplication = async (id: string) => {
    await apiService.deleteApplication(id);
    await loadAllData();
  };

  const updateApplicationStatus = async (
    id: string,
    status: ApplicationStatus,
    notes?: string
  ) => {
    await apiService.updateApplicationStatus(id, status, notes);
    await loadAllData();
  };

  const addInterview = async (
    interviewData: Omit<InterviewSchedule, 'id' | 'createdAt'>
  ): Promise<InterviewSchedule> => {
    const newInt = await apiService.addInterview(interviewData);
    await loadAllData();
    return newInt;
  };

  const deleteInterview = async (id: string) => {
    await apiService.deleteInterview(id);
    await loadAllData();
  };

  const addFollowUp = async (
    followUpData: Omit<FollowUp, 'id' | 'createdAt'>
  ): Promise<FollowUp> => {
    const newFol = await apiService.addFollowUp(followUpData);
    await loadAllData();
    return newFol;
  };

  const updateFollowUpStatus = async (id: string, status: FollowUp['status']) => {
    await apiService.updateFollowUpStatus(id, status);
    await loadAllData();
  };

  const deleteFollowUp = async (id: string) => {
    await apiService.deleteFollowUp(id);
    await loadAllData();
  };

  const resetToDemoData = async () => {
    await apiService.resetDemoData();
    await loadAllData();
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
        isPostgresConnected,
        refreshData: loadAllData,
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
