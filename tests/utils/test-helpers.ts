import { request, APIRequestContext } from '@playwright/test';

export interface TestUser {
  name: string;
  email: string;
  password: string;
  token?: string;
  id?: string;
}

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

/**
 * Creates a unique deterministic test user via API.
 */
export async function createTestUser(requestContext?: APIRequestContext): Promise<TestUser> {
  const timestamp = Date.now() + Math.floor(Math.random() * 1000);
  const user: TestUser = {
    name: `Test User ${timestamp}`,
    email: `e2e_user_${timestamp}@example.com`,
    password: 'Password123!',
  };

  const req = requestContext || (await request.newContext());
  const res = await req.post(`${API_BASE}/auth/register`, {
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  });

  if (!res.ok()) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Failed to create test user: ${res.status()} ${JSON.stringify(body)}`);
  }

  const data = await res.json();
  user.token = data.token;
  user.id = data.user.id;
  return user;
}

/**
 * Helper to generate unique test application data.
 */
export function generateTestApplicationData() {
  const ts = Date.now();
  return {
    companyName: `Playwright Corp ${ts}`,
    position: `QA Engineer ${ts}`,
    source: 'JobStreet',
    jobUrl: `https://example.com/job/${ts}`,
    jobReference: `REF-${ts}`,
    salaryMin: 12000000,
    salaryMax: 18000000,
    notes: `E2E Automated test notes ${ts}`,
    recruiterName: `Recruiter ${ts}`,
    recruiterEmail: `recruiter_${ts}@example.com`,
  };
}
