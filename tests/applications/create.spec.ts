import { test, expect } from '@playwright/test';
import { createTestUser, generateTestApplicationData } from '../utils/test-helpers';

test.describe('J06 & J07: Create Job Application', () => {
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

  test('J06 Happy Path: Create new job application via Full Modal', async ({ page }) => {
    const appData = generateTestApplicationData();

    // Click "Add Application" button
    await page.getByRole('button', { name: /Add Application/i }).first().click();

    // Verify modal title
    await expect(page.getByText(/Add New Application/i)).toBeVisible();

    // Fill required & optional fields
    await page.getByPlaceholder('e.g. PT Tokopedia').fill(appData.companyName);
    await page.getByPlaceholder('e.g. Frontend Engineer').fill(appData.position);
    await page.getByPlaceholder('https://jobstreet.co.id/...').fill(appData.jobUrl);
    await page.getByPlaceholder('e.g. REQ-9902').fill(appData.jobReference);
    await page.getByPlaceholder('6000000').fill(appData.salaryMin.toString());
    await page.getByPlaceholder('9000000').fill(appData.salaryMax.toString());

    // Submit form
    await page.getByRole('button', { name: /Save Application/i }).click();

    // Verify application appears in dashboard/table
    await expect(page.getByText(appData.companyName)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(appData.position)).toBeVisible();
  });

  test('J07 Happy Path: Quick Apply application via "I Just Applied" button', async ({ page }) => {
    const ts = Date.now();
    const company = `Quick Company ${ts}`;
    const position = `DevOps ${ts}`;

    // Click "I Just Applied"
    await page.getByRole('button', { name: /I Just Applied/i }).first().click();

    // Modal opens
    await expect(page.getByText(/Log your fresh application/i)).toBeVisible();

    await page.getByPlaceholder('e.g. PT Example Indonesia').fill(company);
    await page.getByPlaceholder('e.g. Full Stack Developer').fill(position);

    await page.getByRole('button', { name: /Save Application/i }).click();

    // Verify success toast/message & record created
    await expect(page.getByText(/Application Logged!/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(company)).toBeVisible({ timeout: 10000 });
  });
});
