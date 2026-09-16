import { test, expect } from '@playwright/test';
import { createTestUser, generateTestApplicationData } from '../utils/test-helpers';

test.describe('J15: Security & Multi-Tenant User Data Isolation', () => {
  let userA: { email: string; password: string; name: string; token?: string };
  let userB: { email: string; password: string; name: string; token?: string };
  let appAData: ReturnType<typeof generateTestApplicationData>;
  let appAId: string;

  test.beforeAll(async ({ request }) => {
    // Register User A and User B
    userA = await createTestUser(request);
    userB = await createTestUser(request);
    appAData = generateTestApplicationData();

    // Create Application A under User A via API
    const res = await request.post('http://localhost:5000/api/applications', {
      headers: {
        Authorization: `Bearer ${userA.token}`,
        'Content-Type': 'application/json',
      },
      data: {
        companyName: appAData.companyName,
        position: appAData.position,
        source: appAData.source,
        status: 'Applied',
      },
    });

    expect(res.ok()).toBeTruthy();
    const createdApp = await res.json();
    appAId = createdApp.id;
  });

  test('UI Isolation: User B cannot see User A application in dashboard or table', async ({ page }) => {
    // Log in as User B
    await page.goto('/');
    await page.getByLabel(/Email Address/i).fill(userB.email);
    await page.getByLabel(/Password/i).fill(userB.password);
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page.getByText(/Application Command Center/i)).toBeVisible();

    // User A's application must NOT be visible on User B's dashboard
    await expect(page.getByText(appAData.companyName)).not.toBeVisible();

    // Check Applications list view for User B
    await page.getByRole('button', { name: /Applications/i }).first().click();
    await expect(page.getByText(appAData.companyName)).not.toBeVisible();
  });

  test('API Isolation: User B cannot access, update or delete User A application directly via API', async ({ request }) => {
    // Attempt GET User A application using User B's token
    const getRes = await request.get(`http://localhost:5000/api/applications`, {
      headers: {
        Authorization: `Bearer ${userB.token}`,
      },
    });
    expect(getRes.ok()).toBeTruthy();
    const userBApps = await getRes.json();
    const foundApp = userBApps.find((a: any) => a.id === appAId || a.companyName === appAData.companyName);
    expect(foundApp).toBeUndefined();

    // Attempt PUT User A application using User B's token
    const putRes = await request.put(`http://localhost:5000/api/applications/${appAId}`, {
      headers: {
        Authorization: `Bearer ${userB.token}`,
        'Content-Type': 'application/json',
      },
      data: {
        position: 'Hacked Position',
      },
    });
    expect(putRes.status()).toBe(404); // Returns 404/Unauthorized for scoped resource

    // Attempt DELETE User A application using User B's token
    const deleteRes = await request.delete(`http://localhost:5000/api/applications/${appAId}`, {
      headers: {
        Authorization: `Bearer ${userB.token}`,
      },
    });
    expect(deleteRes.status()).toBe(404); // Returns 404/Unauthorized for scoped resource
  });
});
