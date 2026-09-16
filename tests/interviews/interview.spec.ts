import { test, expect } from '@playwright/test';
import { createTestUser, generateTestApplicationData } from '../utils/test-helpers';

test.describe('J13: Schedule Interview & Follow-up Tracker', () => {
  let testUser: { email: string; password: string; name: string };

  test.beforeAll(async ({ request }) => {
    testUser = await createTestUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/Email Address/i).fill(testUser.email);
    await page.getByLabel(/Password/i).fill(testUser.password);
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page.getByText(/Application Command Center/i)).toBeVisible();
  });

  test('J13 Happy Path: Schedule an interview for an application', async ({ page }) => {
    const appData = generateTestApplicationData();

    // 1. Create an application
    await page.getByRole('button', { name: /Add Application/i }).first().click();
    await page.getByPlaceholder('e.g. PT Tokopedia').fill(appData.companyName);
    await page.getByPlaceholder('e.g. Frontend Engineer').fill(appData.position);
    await page.getByRole('button', { name: /Save Application/i }).click();

    await expect(page.getByText(appData.companyName)).toBeVisible();

    // 2. Navigate to Selection Calendar tab
    await page.getByRole('button', { name: /^Calendar$/i }).first().click();
    await expect(page.getByRole('heading', { name: /Selection Calendar/i })).toBeVisible();
  });
});
