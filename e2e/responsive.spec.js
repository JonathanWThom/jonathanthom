const { test, expect, devices } = require('@playwright/test');

test.describe('Responsive design', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test.describe(`${name} (${width}x${height})`, () => {
      test.use({ viewport: { width, height } });

      test('homepage renders correctly', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('nav')).toBeVisible();

        await expect(page).toHaveScreenshot(`homepage-${name}.png`, {
          fullPage: true,
          maxDiffPixels: 5000,
        });
      });

      test('photos page renders correctly', async ({ page }) => {
        await page.goto('/photos.html');

        await expect(page.locator('h1')).toBeVisible();
        const photos = page.locator('[data-photos-container] img');
        await expect(photos.first()).toBeVisible();

        await expect(page).toHaveScreenshot(`photos-${name}.png`, {
          fullPage: true,
          maxDiffPixels: 5000,
        });
      });

      test('lightbox works on viewport', async ({ page }) => {
        await page.goto('/photos.html');

        await page.locator('[data-photos-container] img').first().click();
        const lightbox = page.locator('[data-lightbox]');
        await expect(lightbox).toHaveClass(/lightbox-open/);

        await expect(page).toHaveScreenshot(`lightbox-${name}.png`, {
          fullPage: true,
          maxDiffPixels: 5000,
        });

        await page.keyboard.press('Escape');
        await expect(lightbox).not.toHaveClass(/lightbox-open/);
      });

      test('navigation links are visible and clickable', async ({ page }) => {
        await page.goto('/');

        const navLinks = page.locator('nav a');
        const count = await navLinks.count();

        for (let i = 0; i < count; i++) {
          const link = navLinks.nth(i);
          await expect(link).toBeVisible();
          await expect(link).toBeEnabled();
        }
      });
    });
  });

});

test.describe.configure({ mode: 'parallel' });

test('photos grid adapts to mobile @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/photos.html');

  const photosContainer = page.locator('[data-photos-container]');
  const containerBox = await photosContainer.boundingBox();

  const firstPhoto = page.locator('[data-photos-container] img').first();
  const photoBox = await firstPhoto.boundingBox();

  expect(photoBox.width).toBeLessThanOrEqual(containerBox.width);
});

test('lightbox is full screen on mobile @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/photos.html');

  await page.locator('[data-photos-container] img').first().click();

  const lightbox = page.locator('[data-lightbox]');
  const lightboxBox = await lightbox.boundingBox();

  expect(lightboxBox.width).toBeGreaterThanOrEqual(300);
  expect(lightboxBox.height).toBeGreaterThanOrEqual(700);
});

test('photos grid shows multiple columns @tablet', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 1366 });
  await page.goto('/photos.html');

  const photos = page.locator('[data-photos-container] img');
  const firstBox = await photos.first().boundingBox();
  const secondBox = await photos.nth(1).boundingBox();

  expect(firstBox.y).toBeLessThanOrEqual(secondBox.y + 50);
});
