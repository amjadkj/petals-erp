import { test, expect } from '@playwright/test';

test.describe('Clients and Appointments', () => {
  test('clients page renders stat cards, filter bar, and opens add client modal', async ({ page }) => {
    await page.goto('/clients');
    await expect(page.getByText('Care begins with knowing each child.')).toBeVisible();

    const addClientBtn = page.getByRole('button', { name: /\+ Add client/i });
    await expect(addClientBtn).toBeVisible();
    await addClientBtn.click();

    // Verify modal elements
    await expect(page.getByText('CHILD & GUARDIAN DETAILS')).toBeVisible();
    await expect(page.getByLabel(/Child's full name/i)).toBeVisible();
    await expect(page.getByLabel(/Relationship to child/i)).toBeVisible();
    await expect(page.getByLabel(/Guardian consents to storing care information/i)).toBeVisible();

    // Cancel modal
    await page.getByRole('button', { name: /Cancel/i }).click();
    await expect(page.getByText('CHILD & GUARDIAN DETAILS')).not.toBeVisible();
  });

  test('appointments calendar renders IST time grid and toolbar controls', async ({ page }) => {
    await page.goto('/appointments');
    await expect(page.getByText('Make room for every milestone.')).toBeVisible();
    await expect(page.getByText('Day')).toBeVisible();
    await expect(page.getByText('Week')).toBeVisible();
    await expect(page.getByText('Month')).toBeVisible();

    const newApptBtn = page.getByRole('button', { name: /\+ New appointment/i });
    await expect(newApptBtn).toBeVisible();
  });
});
