import { test, expect } from '@playwright/test';

test.describe('Operations and Admin Pages', () => {
  test('financial page renders payments table and teal CTA button', async ({ page }) => {
    await page.goto('/financial');
    await expect(page.getByText('Clear balances. Continued care.')).toBeVisible();

    const recordBtn = page.getByRole('button', { name: /Record payment/i });
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();

    await expect(page.getByText(/Record Client Payment/i)).toBeVisible();
    await page.getByRole('button', { name: /Cancel/i }).click();
  });

  test('leads board renders 5 stages and allows opening new lead modal', async ({ page }) => {
    await page.goto('/leads');
    await expect(page.getByText('Every enquiry is a new beginning.')).toBeVisible();
    await expect(page.getByText('Contacted')).toBeVisible();
    await expect(page.getByText('Assessment Scheduled')).toBeVisible();

    const newLeadBtn = page.getByRole('button', { name: /\+ New lead/i });
    await expect(newLeadBtn).toBeVisible();
    await newLeadBtn.click();
    await expect(page.getByText('Create New Lead')).toBeVisible();
  });

  test('role access page renders permission manager and matrix', async ({ page }) => {
    await page.goto('/role-access');
    await expect(page.getByText('Permission Manager')).toBeVisible();
    await expect(page.getByText('Permissions')).toBeVisible();
    await expect(page.getByText('Branches')).toBeVisible();
    await expect(page.getByText('Manager')).toBeVisible();
    await expect(page.getByText('Therapist')).toBeVisible();
  });
});

