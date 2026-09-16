import { test, expect } from '@playwright/test';
import { createTestUser, generateTestApplicationData } from '../utils/test-helpers';

test.describe('J08 & J09: Edit Application & Status Change', () => {
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

  test('J08 Happy Path: Change Application Status (Applied -> Interview)', async ({ page }) => {
    const appData = generateTestApplicationData();

    // 1. Create initial application
    await page.getByRole('button', { name: /Add Application/i }).first().click();
    await page.getByPlaceholder('e.g. PT Tokopedia').fill(appData.companyName);
    await page.getByPlaceholder('e.g. Frontend Engineer').fill(appData.position);
    await page.getByRole('button', { name: /Save Application/i }).click();

    // 2. Open detail modal by clicking the company item
    await page.getByText(appData.companyName).click();

    // 3. Click "Update Status" button inside modal
    await page.getByRole('button', { name: /Update Status/i }).click();

    // 4. Select new status "Interview"
    const statusSelect = page.locator('form select').first();
    await statusSelect.selectOption('Interview');

    // 5. Submit status update
    await page.getByRole('button', { name: /Save New Status/i }).click();

    // 6. Verify status updated badge is visible
    await expect(page.getByText('Interview', { exact: true })).toBeVisible({ timeout: 10000 });
  });
});
