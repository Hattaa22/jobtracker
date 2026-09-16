import type {
  Application,
  Company,
  UserProfile,
  ApplicationEvent,
  InterviewSchedule,
  FollowUp,
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
} from './storage';

import { getStoredToken } from './authService';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export const apiService = {
  // Check backend health
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  // User Profile
  async getUser(): Promise<UserProfile> {
    try {
      return await fetchJSON<UserProfile>(`${API_BASE}/user`);
    } catch (err) {
      console.warn('API unavailable, falling back to LocalStorage for user:', err);
      return getStorageData('jobtrack_user', defaultUser);
    }
  },

  async updateUser(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const updated = await fetchJSON<UserProfile>(`${API_BASE}/user`, {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      setStorageData('jobtrack_user', updated);
      return updated;
    } catch (err) {
      console.warn('API unavailable, saving user to LocalStorage:', err);
      const cur = getStorageData('jobtrack_user', defaultUser);
      const updated = { ...cur, ...profile };
      setStorageData('jobtrack_user', updated);
      return updated;
    }
  },

  // Companies
  async getCompanies(): Promise<Company[]> {
    try {
      return await fetchJSON<Company[]>(`${API_BASE}/companies`);
    } catch (err) {
      console.warn('API unavailable, falling back to LocalStorage for companies:', err);
      return getStorageData('jobtrack_companies', sampleCompanies);
    }
  },

  // Applications
  async getApplications(): Promise<Application[]> {
    try {
      return await fetchJSON<Application[]>(`${API_BASE}/applications`);
    } catch (err) {
      console.warn('API unavailable, falling back to LocalStorage for applications:', err);
      return getStorageData('jobtrack_applications', sampleApplications);
    }
  },

  async addApplication(appData: Partial<Application>): Promise<Application> {
    try {
      const newApp = await fetchJSON<Application>(`${API_BASE}/applications`, {
        method: 'POST',
        body: JSON.stringify(appData),
      });
      return newApp;
    } catch (err) {
      console.warn('API unavailable, saving application to LocalStorage:', err);
      const apps = getStorageData('jobtrack_applications', sampleApplications);
      const newApp: Application = {
        id: `app-${Date.now()}`,
        userId: 'user-1',
        companyId: `comp-${Date.now()}`,
        companyName: appData.companyName || 'Unknown',
        position: appData.position || 'Untitled',
        jobType: appData.jobType || 'Full Time',
        workArrangement: appData.workArrangement || 'On-site',
        location: appData.location || 'Indonesia',
        source: appData.source || 'JobStreet',
        applicationDate: appData.applicationDate || new Date().toISOString().split('T')[0],
        status: appData.status || 'Applied',
        currency: appData.currency || 'IDR',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setStorageData('jobtrack_applications', [newApp, ...apps]);
      return newApp;
    }
  },

  async quickApply(payload: QuickApplyPayload): Promise<Application> {
    try {
      return await fetchJSON<Application>(`${API_BASE}/applications/quick-apply`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('API unavailable, saving quickApply to LocalStorage:', err);
      const apps = getStorageData('jobtrack_applications', sampleApplications);
      const today = payload.applicationDate || new Date().toISOString().split('T')[0];
      const newApp: Application = {
        id: `app-${Date.now()}`,
        userId: 'user-1',
        companyId: `comp-${Date.now()}`,
        companyName: payload.companyName,
        position: payload.position,
        jobType: 'Full Time',
        workArrangement: 'On-site',
        location: 'Indonesia',
        source: payload.source || 'JobStreet',
        jobUrl: payload.jobUrl,
        applicationDate: today,
        status: payload.status || 'Applied',
        currency: 'IDR',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setStorageData('jobtrack_applications', [newApp, ...apps]);
      return newApp;
    }
  },

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application | void> {
    try {
      return await fetchJSON<Application>(`${API_BASE}/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.warn('API unavailable, updating application in LocalStorage:', err);
      const apps = getStorageData('jobtrack_applications', sampleApplications);
      const updated = apps.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a);
      setStorageData('jobtrack_applications', updated);
    }
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus, notes?: string): Promise<void> {
    try {
      await fetchJSON(`${API_BASE}/applications/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      });
    } catch (err) {
      console.warn('API unavailable, updating status in LocalStorage:', err);
      const apps = getStorageData('jobtrack_applications', sampleApplications);
      const updated = apps.map(a => a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a);
      setStorageData('jobtrack_applications', updated);
    }
  },

  async deleteApplication(id: string): Promise<void> {
    try {
      await fetchJSON(`${API_BASE}/applications/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API unavailable, deleting application from LocalStorage:', err);
      const apps = getStorageData('jobtrack_applications', sampleApplications);
      setStorageData('jobtrack_applications', apps.filter(a => a.id !== id));
    }
  },

  // Events
  async getEvents(): Promise<ApplicationEvent[]> {
    try {
      return await fetchJSON<ApplicationEvent[]>(`${API_BASE}/events`);
    } catch (err) {
      console.warn('API unavailable, falling back to LocalStorage for events:', err);
      return getStorageData('jobtrack_events', sampleEvents);
    }
  },

  // Interviews
  async getInterviews(): Promise<InterviewSchedule[]> {
    try {
      return await fetchJSON<InterviewSchedule[]>(`${API_BASE}/interviews`);
    } catch (err) {
      console.warn('API unavailable, falling back to LocalStorage for interviews:', err);
      return getStorageData('jobtrack_interviews', sampleInterviews);
    }
  },

  async addInterview(interviewData: Omit<InterviewSchedule, 'id' | 'createdAt'>): Promise<InterviewSchedule> {
    try {
      return await fetchJSON<InterviewSchedule>(`${API_BASE}/interviews`, {
        method: 'POST',
        body: JSON.stringify(interviewData),
      });
    } catch (err) {
      console.warn('API unavailable, saving interview to LocalStorage:', err);
      const interviews = getStorageData('jobtrack_interviews', sampleInterviews);
      const newInt: InterviewSchedule = {
        ...interviewData,
        id: `int-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setStorageData('jobtrack_interviews', [newInt, ...interviews]);
      return newInt;
    }
  },

  async deleteInterview(id: string): Promise<void> {
    try {
      await fetchJSON(`${API_BASE}/interviews/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API unavailable, deleting interview from LocalStorage:', err);
      const interviews = getStorageData('jobtrack_interviews', sampleInterviews);
      setStorageData('jobtrack_interviews', interviews.filter(i => i.id !== id));
    }
  },

  // FollowUps
  async getFollowUps(): Promise<FollowUp[]> {
    try {
      return await fetchJSON<FollowUp[]>(`${API_BASE}/followups`);
    } catch (err) {
      console.warn('API unavailable, falling back to LocalStorage for followups:', err);
      return getStorageData('jobtrack_followups', sampleFollowUps);
    }
  },

  async addFollowUp(followUpData: Omit<FollowUp, 'id' | 'createdAt'>): Promise<FollowUp> {
    try {
      return await fetchJSON<FollowUp>(`${API_BASE}/followups`, {
        method: 'POST',
        body: JSON.stringify(followUpData),
      });
    } catch (err) {
      console.warn('API unavailable, saving followUp to LocalStorage:', err);
      const followUps = getStorageData('jobtrack_followups', sampleFollowUps);
      const newFol: FollowUp = {
        ...followUpData,
        id: `fol-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setStorageData('jobtrack_followups', [newFol, ...followUps]);
      return newFol;
    }
  },

  async updateFollowUpStatus(id: string, status: FollowUp['status']): Promise<void> {
    try {
      await fetchJSON(`${API_BASE}/followups/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.warn('API unavailable, updating followUp in LocalStorage:', err);
      const followUps = getStorageData('jobtrack_followups', sampleFollowUps);
      setStorageData('jobtrack_followups', followUps.map(f => f.id === id ? { ...f, status } : f));
    }
  },

  async deleteFollowUp(id: string): Promise<void> {
    try {
      await fetchJSON(`${API_BASE}/followups/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API unavailable, deleting followUp from LocalStorage:', err);
      const followUps = getStorageData('jobtrack_followups', sampleFollowUps);
      setStorageData('jobtrack_followups', followUps.filter(f => f.id !== id));
    }
  },

  async resetDemoData(): Promise<void> {
    try {
      await fetchJSON(`${API_BASE}/reset-demo`, { method: 'POST' });
    } catch (err) {
      console.warn('API unavailable, resetting LocalStorage demo data:', err);
    }
  }
};
