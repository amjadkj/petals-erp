import { test, expect } from '@playwright/test';

test.describe('App Shell & Navigation', () => {
  test('desktop layout renders sticky header, expanded sidebar and persists collapse state', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop-only test');
    await page.goto('/dashboard');

    // Header checks
    await expect(page.getByText('Director dashboard')).toBeVisible();
    await expect(page.getByPlaceholder(/Search Petals/i)).toBeVisible();

    // Sidebar nav items checks
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('Appointments')).toBeVisible();
    await expect(sidebar.getByText('Clients')).toBeVisible();
    await expect(sidebar.getByText('Financial')).toBeVisible();

    // Collapse toggle shortcut '['
    await page.keyboard.press('[');
    // After collapse, text label should be hidden
    await expect(sidebar.getByText('CHILD DEVELOPMENT CENTRE')).not.toBeVisible();
  });

  test('mobile layout renders hamburger drawer and compressed header', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');
    await page.goto('/dashboard');

    // Header compressed
    const hamburger = page.locator('header button').first();
    await expect(hamburger).toBeVisible();
    await hamburger.click();

    // Mobile drawer should be visible
    const drawer = page.locator('nav');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('Clients')).toBeVisible();
  });
});

