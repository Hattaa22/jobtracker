import type {
  Application,
  Company,
  UserProfile,
  ApplicationEvent,
  InterviewSchedule,
  FollowUp,
} from '../types';

const STORAGE_KEYS = {
  USER: 'jobtrack_user',
  APPLICATIONS: 'jobtrack_applications',
  COMPANIES: 'jobtrack_companies',
  EVENTS: 'jobtrack_events',
  INTERVIEWS: 'jobtrack_interviews',
  FOLLOW_UPS: 'jobtrack_followups',
  ATTACHMENTS: 'jobtrack_attachments',
};

export const defaultUser: UserProfile = {
  id: 'user-1',
  name: 'Hatta',
  email: 'hatta@example.com',
  phone: '+62 812-3456-7890',
  location: 'Surabaya, Indonesia',
  portfolioUrl: 'https://hatta.dev',
  githubUrl: 'https://github.com/hatta',
  linkedinUrl: 'https://linkedin.com/in/hatta',
  preferences: {
    defaultStatus: 'Applied',
    defaultSource: 'JobStreet',
    currency: 'IDR',
    dateFormat: 'DD MMM YYYY',
    theme: 'light',
  },
};

export const sampleApplications: Application[] = [
  {
    id: 'app-1',
    userId: 'user-1',
    companyId: 'comp-1',
    companyName: 'PT ABC Indonesia',
    position: 'Full Stack Developer',
    jobType: 'Full Time',
    workArrangement: 'Hybrid',
    location: 'Surabaya',
    source: 'JobStreet',
    jobUrl: 'https://jobstreet.co.id/job/123456',
    jobReference: 'JS-8902',
    applicationDate: '2026-09-15',
    status: 'Interview',
    salaryMin: 6000000,
    salaryMax: 9000000,
    currency: 'IDR',
    recruiterName: 'Siti Rahma',
    recruiterEmail: 'hr@ptabc.co.id',
    recruiterPhone: '+62 811-9988-7766',
    notes: 'Menunggu jadwal interview user. Sangat berminat dengan posisi ini.',
    createdAt: '2026-09-15T08:00:00Z',
    updatedAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'app-2',
    userId: 'user-1',
    companyId: 'comp-2',
    companyName: 'PT XYZ Tech Solutions',
    position: 'IT Programmer',
    jobType: 'Full Time',
    workArrangement: 'Remote',
    location: 'Jakarta',
    source: 'LinkedIn',
    jobUrl: 'https://linkedin.com/jobs/view/987654321',
    applicationDate: '2026-09-14',
    status: 'Screening',
    salaryMin: 7000000,
    salaryMax: 10000000,
    currency: 'IDR',
    recruiterName: 'Budi Santoso',
    notes: 'Sudah di-contact HR via WhatsApp.',
    createdAt: '2026-09-14T09:30:00Z',
    updatedAt: '2026-09-14T09:30:00Z',
  },
  {
    id: 'app-3',
    userId: 'user-1',
    companyId: 'comp-3',
    companyName: 'PT DEF Creative Tech',
    position: 'Front-End Developer',
    jobType: 'Contract',
    workArrangement: 'On-site',
    location: 'Bandung',
    source: 'Glints',
    jobUrl: 'https://glints.com/id/opportunities/jobs/456789',
    applicationDate: '2026-09-12',
    status: 'Rejected',
    salaryMin: 5500000,
    salaryMax: 7500000,
    currency: 'IDR',
    notes: 'Kualifikasi pengalaman Vue3 belum mencukupi.',
    createdAt: '2026-09-12T14:15:00Z',
    updatedAt: '2026-09-14T11:00:00Z',
  },
  {
    id: 'app-4',
    userId: 'user-1',
    companyId: 'comp-4',
    companyName: 'Gojek (GoTo Group)',
    position: 'Software Engineer - Frontend',
    jobType: 'Full Time',
    workArrangement: 'Hybrid',
    location: 'Jakarta South',
    source: 'Company Website',
    jobUrl: 'https://careers.goto.com/jobs/se-fe-2026',
    applicationDate: '2026-09-10',
    status: 'Assessment',
    salaryMin: 12000000,
    salaryMax: 18000000,
    currency: 'IDR',
    recruiterName: 'Anita Wijaya',
    notes: 'HackerRank test link received. Deadline 18 September.',
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-11T09:00:00Z',
  },
  {
    id: 'app-5',
    userId: 'user-1',
    companyId: 'comp-5',
    companyName: 'Tokopedia',
    position: 'React Frontend Specialist',
    jobType: 'Full Time',
    workArrangement: 'Remote',
    location: 'Jakarta',
    source: 'LinkedIn',
    jobUrl: 'https://linkedin.com/jobs/view/112233',
    applicationDate: '2026-09-08',
    status: 'Offer',
    salaryMin: 14000000,
    salaryMax: 16000000,
    currency: 'IDR',
    notes: 'Offering letter dikirimkan via email. Perlu negosiasi fasilitas.',
    createdAt: '2026-09-08T11:00:00Z',
    updatedAt: '2026-09-15T07:30:00Z',
  }
];

export const sampleCompanies: Company[] = [
  { id: 'comp-1', userId: 'user-1', name: 'PT ABC Indonesia', location: 'Surabaya', website: 'https://ptabc.co.id', createdAt: '2026-09-15T08:00:00Z', updatedAt: '2026-09-15T08:00:00Z' },
  { id: 'comp-2', userId: 'user-1', name: 'PT XYZ Tech Solutions', location: 'Jakarta', website: 'https://xyztech.com', createdAt: '2026-09-14T09:30:00Z', updatedAt: '2026-09-14T09:30:00Z' },
  { id: 'comp-3', userId: 'user-1', name: 'PT DEF Creative Tech', location: 'Bandung', website: 'https://defcreative.io', createdAt: '2026-09-12T14:15:00Z', updatedAt: '2026-09-12T14:15:00Z' },
  { id: 'comp-4', userId: 'user-1', name: 'Gojek (GoTo Group)', location: 'Jakarta', website: 'https://goto.com', createdAt: '2026-09-10T10:00:00Z', updatedAt: '2026-09-10T10:00:00Z' },
  { id: 'comp-5', userId: 'user-1', name: 'Tokopedia', location: 'Jakarta', website: 'https://tokopedia.com', createdAt: '2026-09-08T11:00:00Z', updatedAt: '2026-09-08T11:00:00Z' },
];

export const sampleEvents: ApplicationEvent[] = [
  { id: 'ev-1', applicationId: 'app-1', status: 'Applied', eventDate: '2026-09-15', title: 'Application Submitted', description: 'Lamaran dikirim melalui JobStreet portal.', createdAt: '2026-09-15T08:00:00Z' },
  { id: 'ev-2', applicationId: 'app-1', status: 'Screening', eventDate: '2026-09-15', title: 'HR Contacted', description: 'HR WhatsApp mengenai konfirmasi ketersediaan gaji.', createdAt: '2026-09-15T09:00:00Z' },
  { id: 'ev-3', applicationId: 'app-1', status: 'Interview', eventDate: '2026-09-15', title: 'Interview Scheduled', description: 'Undangan Technical Interview dikirimkan.', createdAt: '2026-09-15T10:00:00Z' },
];

export const sampleInterviews: InterviewSchedule[] = [
  {
    id: 'int-1',
    applicationId: 'app-1',
    type: 'Technical Interview',
    date: '2026-09-25',
    time: '13:00',
    location: 'Google Meet',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    notes: 'Persiapkan live coding React + Node.js',
    createdAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'int-2',
    applicationId: 'app-4',
    type: 'Technical Test',
    date: '2026-09-18',
    time: '09:00',
    location: 'HackerRank Online',
    meetingUrl: 'https://hackerrank.com/test/goto-2026',
    notes: '2 Soal Data Structures & Algorithms',
    createdAt: '2026-09-11T09:00:00Z',
  }
];

export const sampleFollowUps: FollowUp[] = [
  {
    id: 'fol-1',
    applicationId: 'app-1',
    followUpDate: '2026-09-29',
    contactMethod: 'WhatsApp',
    contactPerson: 'Siti Rahma (HR)',
    message: 'Halo Mbak Siti, menanyakan kabar kelanjutan hasil technical interview PT ABC.',
    status: 'Upcoming',
    createdAt: '2026-09-15T10:30:00Z',
  },
  {
    id: 'fol-2',
    applicationId: 'app-2',
    followUpDate: '2026-09-16',
    contactMethod: 'WhatsApp',
    contactPerson: 'Budi Santoso',
    message: 'Follow-up status screening berkas CV.',
    status: 'Upcoming',
    createdAt: '2026-09-14T10:00:00Z',
  }
];

export const getStorageData = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultVal;
  }
};

export const setStorageData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
};

export const initializeDefaultStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    setStorageData(STORAGE_KEYS.APPLICATIONS, sampleApplications);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
    setStorageData(STORAGE_KEYS.COMPANIES, sampleCompanies);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    setStorageData(STORAGE_KEYS.USER, defaultUser);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    setStorageData(STORAGE_KEYS.EVENTS, sampleEvents);
  }
  if (!localStorage.getItem(STORAGE_KEYS.INTERVIEWS)) {
    setStorageData(STORAGE_KEYS.INTERVIEWS, sampleInterviews);
  }
  if (!localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS)) {
    setStorageData(STORAGE_KEYS.FOLLOW_UPS, sampleFollowUps);
  }
};
