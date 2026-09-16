import { test, expect } from '@playwright/test';
import { createTestUser } from '../utils/test-helpers';

test.describe('J14: Update Profile Information in Settings', () => {
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

  test('J14 Happy Path: Update user location and phone number in Settings', async ({ page }) => {
    // Navigate to Settings
    await page.getByRole('button', { name: /^Settings$/i }).first().click();

    await expect(page.getByText(/Account Settings & Preferences/i)).toBeVisible();

    // In Settings profile form: index 0 = Name, 1 = Email, 2 = Phone, 3 = Location
    const profileInputs = page.locator('form input.input-field');
    const phoneInput = profileInputs.nth(2);
    const locationInput = profileInputs.nth(3);

    await phoneInput.fill('+62 812-9999-8888');
    await locationInput.fill('Bandung, Indonesia');

    // Save changes and wait for API response
    const savePromise = page.waitForResponse((res) => res.url().includes('/api/user') && res.request().method() === 'PUT');
    await page.getByRole('button', { name: /Save Changes/i }).or(page.getByRole('button', { name: /Save/i })).first().click();
    const response = await savePromise;

    expect(response.status()).toBe(200);
    const updatedData = await response.json();
    expect(updatedData.location).toBe('Bandung, Indonesia');
  });
});
