import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('renders staff login page with correct branding and fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Petals ERP/i);
    await expect(page.getByText('CHILD DEVELOPMENT CENTRE')).toBeVisible();
    await expect(page.getByText('Welcome back.')).toBeVisible();

    const emailInput = page.getByLabel(/Email address/i);
    const passwordInput = page.getByLabel(/Password/i);
    const submitBtn = page.getByRole('button', { name: /Sign in/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });

  test('navigates to 2FA page and OTP page via action links', async ({ page }) => {
    await page.goto('/login');
    const otpLink = page.getByRole('link', { name: /Parent\? Sign in with OTP/i });
    await expect(otpLink).toBeVisible();
    await otpLink.click();
    await expect(page).toHaveURL(/.*\/login\/otp/);
    await expect(page.getByText(/Parent Portal Sign In/i)).toBeVisible();

    await page.goto('/login/2fa');
    await expect(page.getByText(/Two-Factor Authentication/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Verify Code/i })).toBeVisible();
  });
});
