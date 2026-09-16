import { test, expect } from '@playwright/test';
import { createTestUser, generateTestApplicationData } from '../utils/test-helpers';

test.describe('J10: Delete Job Application', () => {
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

  test('J10 Happy Path: Delete an application via confirmation modal', async ({ page }) => {
    const appData = generateTestApplicationData();

    // 1. Create an application to delete
    await page.getByRole('button', { name: /Add Application/i }).first().click();
    await page.getByPlaceholder('e.g. PT Tokopedia').fill(appData.companyName);
    await page.getByPlaceholder('e.g. Frontend Engineer').fill(appData.position);
    await page.getByRole('button', { name: /Save Application/i }).click();

    await expect(page.getByText(appData.companyName)).toBeVisible();

    // 2. Open detail modal
    await page.getByText(appData.companyName).click();

    // 3. Click "Delete Application" button in modal
    await page.getByRole('button', { name: /Delete Application/i }).click();

    // 4. Confirm delete in confirmation modal
    await expect(page.getByText(/Are you sure you want to delete/i)).toBeVisible();
    await page.getByRole('button', { name: /^Delete$/i }).click();

    // 5. Verify application is removed
    await expect(page.getByText(appData.companyName)).not.toBeVisible({ timeout: 10000 });
  });
});
