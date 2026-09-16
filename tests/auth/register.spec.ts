import { test, expect } from '@playwright/test';

test.describe('J01: Register User (Email / Password)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const navigateSignUpBtn = page.getByRole('button', { name: /Sign Up/i });
    await expect(navigateSignUpBtn).toBeVisible({ timeout: 10000 });
    await navigateSignUpBtn.click();
    await expect(page.locator('form button[type="submit"]')).toBeVisible();
  });

  test('Happy Path: Should successfully register a new user', async ({ page }) => {
    const ts = Date.now();
    const name = `E2E Tester ${ts}`;
    const email = `e2e_register_${ts}@example.com`;
    const password = 'Password123!';

    await page.getByLabel(/Full Name/i).fill(name);
    await page.getByLabel(/Email Address/i).fill(email);
    await page.getByLabel(/^Password$/i).fill(password);
    await page.getByLabel(/Confirm Password/i).fill(password);

    await page.locator('form button[type="submit"]').click();

    // After registration, user is automatically logged in and sees main dashboard
    await expect(page.getByText(/Application Command Center/i)).toBeVisible({ timeout: 10000 });
  });

  test('Failure State: Validation error when submitting empty fields', async ({ page }) => {
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText(/Full Name is required/i)).toBeVisible();
    await expect(page.getByText(/Email is required/i)).toBeVisible();
    await expect(page.getByText(/Password is required/i)).toBeVisible();
  });

  test('Failure State: Validation error for invalid email format', async ({ page }) => {
    await page.getByLabel(/Full Name/i).fill('Test User');
    await page.getByLabel(/Email Address/i).fill('not-an-email');
    await page.getByLabel(/^Password$/i).fill('Password123!');
    await page.getByLabel(/Confirm Password/i).fill('Password123!');

    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText(/Please enter a valid email address/i)).toBeVisible();
  });

  test('Failure State: Validation error for password less than 6 characters', async ({ page }) => {
    await page.getByLabel(/Full Name/i).fill('Test User');
    await page.getByLabel(/Email Address/i).fill('valid@example.com');
    await page.getByLabel(/^Password$/i).fill('12345');
    await page.getByLabel(/Confirm Password/i).fill('12345');

    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText(/Password must be at least 6 characters/i)).toBeVisible();
  });

  test('Failure State: Password mismatch validation', async ({ page }) => {
    await page.getByLabel(/Full Name/i).fill('Test User');
    await page.getByLabel(/Email Address/i).fill('valid@example.com');
    await page.getByLabel(/^Password$/i).fill('Password123!');
    await page.getByLabel(/Confirm Password/i).fill('DifferentPass!');

    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText(/Passwords do not match/i)).toBeVisible();
  });
});
