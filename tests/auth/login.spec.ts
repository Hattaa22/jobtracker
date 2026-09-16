import { test, expect } from '@playwright/test';
import { createTestUser } from '../utils/test-helpers';

test.describe('J02: Login User (Email / Password)', () => {
  let testUser: { email: string; password: string; name: string };

  test.beforeAll(async ({ request }) => {
    testUser = await createTestUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Happy Path: Successfully log in with valid credentials', async ({ page }) => {
    await page.getByLabel(/Email Address/i).fill(testUser.email);
    await page.getByLabel(/Password/i).fill(testUser.password);

    await page.getByRole('button', { name: /Sign In/i }).click();

    // Verify main app dashboard appears
    await expect(page.getByText(/Application Command Center/i)).toBeVisible({ timeout: 10000 });
  });

  test('Failure State: Display error for invalid password', async ({ page }) => {
    await page.getByLabel(/Email Address/i).fill(testUser.email);
    await page.getByLabel(/Password/i).fill('WrongPassword123!');

    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });

  test('Failure State: Validation error when fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page.getByText(/Email is required/i)).toBeVisible();
    await expect(page.getByText(/Password is required/i)).toBeVisible();
  });

  test('Failure State: Display error for non-existent email', async ({ page }) => {
    await page.getByLabel(/Email Address/i).fill('nonexistent_user_99999@example.com');
    await page.getByLabel(/Password/i).fill('Password123!');

    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });
});
