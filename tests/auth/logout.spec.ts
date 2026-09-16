import { test, expect } from '@playwright/test';
import { createTestUser } from '../utils/test-helpers';

test.describe('J05: Logout & Token Invalidation', () => {
  let testUser: { email: string; password: string; name: string };

  test.beforeAll(async ({ request }) => {
    testUser = await createTestUser(request);
  });

  test('Should successfully log out and invalidate session', async ({ page }) => {
    // 1. Log in
    await page.goto('/');
    await page.getByLabel(/Email Address/i).fill(testUser.email);
    await page.getByLabel(/Password/i).fill(testUser.password);
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page.getByText(/Application Command Center/i)).toBeVisible();

    // 2. Click user profile dropdown in Header
    const dropdownToggle = page.locator('header').getByRole('button').filter({ hasText: testUser.name }).or(page.locator('header button').last());
    await dropdownToggle.click();

    // 3. Click "Log Out" option in dropdown
    await page.getByRole('button', { name: /Log Out/i }).click();

    // 4. Confirmation modal appears
    await expect(page.getByText(/Are you sure you want to log out\?/i)).toBeVisible();

    // 5. Click "Yes, Log Out"
    await page.getByRole('button', { name: /Yes, Log Out/i }).click();

    // 6. User redirected to login screen
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible({ timeout: 10000 });

    // 7. Verify token was cleared from localStorage
    const storedToken = await page.evaluate(() => localStorage.getItem('jobtrack_auth_token'));
    expect(storedToken).toBeNull();
  });
});
