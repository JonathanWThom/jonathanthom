const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Jonathan Thom');
  });

  test('displays main heading and location', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Jonathan Thom');
    await expect(page.locator('h2')).toHaveText('Bellingham, WA');
  });

  test('has navigation links', async ({ page }) => {
    await expect(page.locator('nav a')).toHaveCount(10);

    const primary = page.locator('.nav-primary');
    await expect(primary.getByRole('link', { name: 'Now' })).toHaveAttribute('href', 'now');
    await expect(primary.getByRole('link', { name: 'Photos' })).toHaveAttribute('href', 'photos');

    const elsewhere = page.locator('.nav-elsewhere');
    await expect(elsewhere.getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:me@jonathanthom.com');
    await expect(elsewhere.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/jonathanwthom');
    await expect(elsewhere.getByRole('link', { name: 'PGP Key' })).toHaveAttribute('href', 'pgp/jonathanthom.asc');
  });

  test('photos link navigates to photos page', async ({ page }) => {
    await page.getByRole('link', { name: 'Photos' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*photos/);
    await expect(page.locator('h1')).toHaveText('Photos');
  });
});
