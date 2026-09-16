export type ApplicationStatus =
  | 'Saved'
  | 'Applied'
  | 'Screening'
  | 'Assessment'
  | 'Interview'
  | 'Final Interview'
  | 'Offer'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn'
  | 'No Response';

export type JobType = 'Full Time' | 'Part Time' | 'Contract' | 'Internship' | 'Freelance';
export type WorkArrangement = 'On-site' | 'Hybrid' | 'Remote';

export type JobSource =
  | 'JobStreet'
  | 'LinkedIn'
  | 'Glints'
  | 'Kalibrr'
  | 'Indeed'
  | 'Company Website'
  | 'Referral'
  | 'Campus Career'
  | 'WhatsApp'
  | 'Email'
  | 'Other';

export type AssessmentType =
  | 'HR Interview'
  | 'User Interview'
  | 'Technical Interview'
  | 'Psychotest'
  | 'Technical Test'
  | 'Excel Test'
  | 'Presentation'
  | 'Other';

export type ContactMethod = 'WhatsApp' | 'Email' | 'LinkedIn' | 'Phone' | 'Other';
export type FollowUpStatus = 'Upcoming' | 'Due Today' | 'Overdue' | 'Completed';
export type AttachmentType = 'CV' | 'Cover Letter' | 'Portfolio' | 'Certificate' | 'Test Result' | 'Other';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  preferences: {
    defaultStatus: ApplicationStatus;
    defaultSource: JobSource;
    currency: string;
    dateFormat: string;
    theme: 'light' | 'dark' | 'system';
  };
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  website?: string;
  location?: string;
  industry?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  eventDate: string; // YYYY-MM-DD
  title: string;
  description?: string;
  createdAt: string;
}

export interface InterviewSchedule {
  id: string;
  applicationId: string;
  type: AssessmentType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location?: string;
  meetingUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  applicationId: string;
  followUpDate: string; // YYYY-MM-DD
  contactMethod: ContactMethod;
  contactPerson?: string;
  message?: string;
  status: FollowUpStatus;
  createdAt: string;
}

export interface Attachment {
  id: string;
  applicationId: string;
  fileName: string;
  fileType: AttachmentType;
  fileUrl?: string;
  uploadDate: string;
}

export interface Application {
  id: string;
  userId: string;
  companyId: string;
  companyName: string; // Denormalized for fast display
  position: string;
  jobType: JobType;
  workArrangement: WorkArrangement;
  location: string;
  source: JobSource;
  jobUrl?: string;
  jobReference?: string;
  applicationDate: string; // YYYY-MM-DD
  status: ApplicationStatus;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Optional populated nested arrays for quick view
  events?: ApplicationEvent[];
  interviews?: InterviewSchedule[];
  followUps?: FollowUp[];
  attachments?: Attachment[];
}

export interface QuickApplyPayload {
  companyName: string;
  position: string;
  source: JobSource;
  jobUrl?: string;
  applicationDate?: string;
  status?: ApplicationStatus;
}
