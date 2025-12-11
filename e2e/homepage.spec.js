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
    const nav = page.locator('nav');
    await expect(nav.locator('a')).toHaveCount(9);

    await expect(nav.getByRole('link', { name: 'Photos' })).toHaveAttribute('href', 'photos');
    await expect(nav.getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:jonathanthom@hey.com');
    await expect(nav.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/jonathanwthom');
    await expect(nav.getByRole('link', { name: 'PGP Key' })).toHaveAttribute('href', 'pgp/jonathanthom.asc');
  });

  test('photos link navigates to photos page', async ({ page }) => {
    await page.getByRole('link', { name: 'Photos' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*photos/);
    await expect(page.locator('h1')).toHaveText('Photos');
  });
});
