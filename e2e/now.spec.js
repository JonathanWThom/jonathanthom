const { test, expect } = require('@playwright/test');

test.describe('Now page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/now');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Jonathan Thom - Now');
  });

  test('displays page heading and home link', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Now');
    await expect(page.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  });

  test('displays at least one changelog entry', async ({ page }) => {
    const articles = page.locator('[data-changelog] article');
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);

    const firstEntry = articles.first();
    await expect(firstEntry.locator('time')).toBeVisible();
    await expect(firstEntry.locator('p')).toBeVisible();
  });

  test('entries have valid date format', async ({ page }) => {
    const times = page.locator('[data-changelog] time');
    const count = await times.count();

    for (let i = 0; i < count; i++) {
      const datetime = await times.nth(i).getAttribute('datetime');
      expect(datetime).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
