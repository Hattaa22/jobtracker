import { test, expect } from '@playwright/test';
import { createTestUser } from '../utils/test-helpers';

test.describe('J04: Session Persistence & Protected Routes', () => {
  let testUser: { email: string; password: string; name: string };

  test.beforeAll(async ({ request }) => {
    testUser = await createTestUser(request);
  });

  test('J04: Should preserve session and stay logged in after page reload', async ({ page }) => {
    // Log in
    await page.goto('/');
    await page.getByLabel(/Email Address/i).fill(testUser.email);
    await page.getByLabel(/Password/i).fill(testUser.password);
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page.getByText(/Application Command Center/i)).toBeVisible();

    // Reload page
    await page.reload();

    // Verify user is still logged in without seeing login screen
    await expect(page.getByText(/Application Command Center/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Sign In/i })).not.toBeVisible();
  });

  test('Protected Route: Unauthenticated user is redirected to Login view', async ({ page }) => {
    // Clear any existing localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Verify user sees LoginForm and cannot access main dashboard
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    await expect(page.getByText(/Application Command Center/i)).not.toBeVisible();
  });
});
