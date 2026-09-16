import { test, expect } from '@playwright/test';
import { createTestUser, generateTestApplicationData } from '../utils/test-helpers';

test.describe('J11: Search, Filter & Toggle Views', () => {
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

  test('J11 Happy Path: Toggle Table and Kanban Views on Applications List', async ({ page }) => {
    // Navigate to Applications tab
    await page.getByRole('button', { name: /^Applications$/i }).first().click();

    await expect(page.getByText(/Job Applications Management/i)).toBeVisible();

    // Toggle to Kanban View
    await page.getByRole('button', { name: /Kanban/i }).click();
    await expect(page.getByText(/Applied/i).first()).toBeVisible();

    // Toggle back to Table View
    await page.getByRole('button', { name: /Table/i }).click();
    await expect(page.getByText(/Job Applications Management/i)).toBeVisible();
  });

  test('J11 Happy Path: Search application by company name', async ({ page }) => {
    const appData = generateTestApplicationData();

    // Create an application
    await page.getByRole('button', { name: /Add Application/i }).first().click();
    await page.getByPlaceholder('e.g. PT Tokopedia').fill(appData.companyName);
    await page.getByPlaceholder('e.g. Frontend Engineer').fill(appData.position);
    await page.getByRole('button', { name: /Save Application/i }).click();

    // Navigate to Applications List
    await page.getByRole('button', { name: /^Applications$/i }).first().click();

    // Search for company using exact placeholder
    const searchInput = page.getByPlaceholder(/Search company, position, notes/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill(appData.companyName);
    await expect(page.getByText(appData.companyName)).toBeVisible();

    // Search non-existent string
    await searchInput.fill('NonExistentCompany999');
    await expect(page.getByText(appData.companyName)).not.toBeVisible();
  });
});
