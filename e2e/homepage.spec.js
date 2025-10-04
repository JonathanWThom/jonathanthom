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
    await expect(nav.locator('a')).toHaveCount(8);

    await expect(nav.getByRole('link', { name: 'Photos' })).toHaveAttribute('href', 'photos.html');
    await expect(nav.getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:jonathanthom@hey.com');
    await expect(nav.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/jonathanwthom');
    await expect(nav.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/jonathan-thom/');
    await expect(nav.getByRole('link', { name: 'Bluesky' })).toHaveAttribute('href', 'https://bsky.app/profile/jonathanthom.com');
    await expect(nav.getByRole('link', { name: 'Goodreads' })).toHaveAttribute('href', 'https://www.goodreads.com/user/show/161318121-jonathan-thom');
    await expect(nav.getByRole('link', { name: 'Duolingo' })).toHaveAttribute('href', 'https://www.duolingo.com/profile/JonathanThom');
    await expect(nav.getByRole('link', { name: 'Strava' })).toHaveAttribute('href', 'https://www.strava.com/athletes/jonathanthom');
  });

  test('photos link navigates to photos page', async ({ page }) => {
    await page.getByRole('link', { name: 'Photos' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*photos/);
    await expect(page.locator('h1')).toHaveText('Photos');
  });

  test('matches visual snapshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('is accessible', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav a')).toHaveCount(8);
  });
});
