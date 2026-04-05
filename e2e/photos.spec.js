const { test, expect } = require('@playwright/test');

test.describe('Photos page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/photos');
    await page.waitForLoadState('networkidle');
    const lightbox = page.locator('[data-lightbox]');
    const isOpen = await lightbox.evaluate(el => el.classList.contains('lightbox-open'));
    if (isOpen) {
      await page.keyboard.press('Escape');
    }
    await expect(lightbox).not.toHaveClass(/lightbox-open/);
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Jonathan Thom - Photos');
  });

  test('displays page heading and home link', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Photos');
    await expect(page.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  });

  test('displays photo gallery', async ({ page }) => {
    const photos = page.locator('[data-photos-container] img');
    const count = await photos.count();
    expect(count).toBeGreaterThan(0);

    const firstPhoto = photos.first();
    await expect(firstPhoto).toBeVisible();
    await expect(firstPhoto).toHaveAttribute('alt');
    await expect(firstPhoto).toHaveAttribute('tabindex', '0');
  });

  test('every photo has a data-slug attribute', async ({ page }) => {
    const pictures = page.locator('[data-photos-container] picture[data-slug]');
    const count = await pictures.count();
    expect(count).toBeGreaterThan(0);

    const photos = page.locator('[data-photos-container] img');
    const imgCount = await photos.count();
    expect(count).toBe(imgCount);
  });

  test('lightbox opens on photo click', async ({ page }) => {
    const lightbox = page.locator('[data-lightbox]');
    await expect(lightbox).not.toHaveClass(/lightbox-open/);

    await page.locator('[data-photos-container] img').first().click();

    await expect(lightbox).toHaveClass(/lightbox-open/);
    await expect(lightbox).toBeVisible();
    const lightboxImg = page.locator('[data-lightbox-img]');
    await expect(lightboxImg).toHaveAttribute('src', /\/photos\//);
  });

  test('lightbox opens with keyboard navigation', async ({ page }) => {
    const firstPhoto = page.locator('[data-photos-container] img').first();
    await firstPhoto.focus();
    await firstPhoto.press('Enter');

    const lightbox = page.locator('[data-lightbox]');
    await expect(lightbox).toHaveClass(/lightbox-open/);
  });

  test('lightbox closes on close button click', async ({ page }) => {
    await page.locator('[data-photos-container] img').first().click();
    const lightbox = page.locator('[data-lightbox]');
    await expect(lightbox).toHaveClass(/lightbox-open/);

    await page.locator('[data-lightbox-close]').click();
    await expect(lightbox).not.toHaveClass(/lightbox-open/);
  });

  test('lightbox closes on Escape key', async ({ page }) => {
    await page.locator('[data-photos-container] img').first().click();
    const lightbox = page.locator('[data-lightbox]');
    await expect(lightbox).toHaveClass(/lightbox-open/);

    await page.keyboard.press('Escape');
    await expect(lightbox).not.toHaveClass(/lightbox-open/);
  });

  test('lightbox closes when clicking outside', async ({ page }) => {
    await page.locator('[data-photos-container] img').first().click();
    const lightbox = page.locator('[data-lightbox]');
    await expect(lightbox).toHaveClass(/lightbox-open/);

    await lightbox.click({ position: { x: 10, y: 10 } });
    await expect(lightbox).not.toHaveClass(/lightbox-open/);
  });

  test('lightbox navigates to next image with ArrowRight', async ({ page }) => {
    await page.locator('[data-photos-container] img').first().click();

    const lightboxImg = page.locator('[data-lightbox-img]');
    const firstSrc = await lightboxImg.getAttribute('src');

    await page.keyboard.press('ArrowRight');

    const secondSrc = await lightboxImg.getAttribute('src');
    expect(firstSrc).not.toBe(secondSrc);
  });

  test('lightbox navigates to previous image with ArrowLeft', async ({ page }) => {
    await page.locator('[data-photos-container] img').nth(1).click();

    const lightboxImg = page.locator('[data-lightbox-img]');
    const secondSrc = await lightboxImg.getAttribute('src');

    await page.keyboard.press('ArrowLeft');

    const firstSrc = await lightboxImg.getAttribute('src');
    expect(firstSrc).not.toBe(secondSrc);
  });

  test('lightbox cycles from last to first image', async ({ page }) => {
    const photos = page.locator('[data-photos-container] img');
    const firstPhoto = photos.first();
    const firstPhotoSrc = await firstPhoto.getAttribute('src');
    const firstBaseName = firstPhotoSrc.split('/').pop().replace(/\.[^.]+$/, '');

    const lastPhoto = photos.last();
    await lastPhoto.click();

    await page.keyboard.press('ArrowRight');

    const lightboxImg = page.locator('[data-lightbox-img]');
    const src = await lightboxImg.getAttribute('src');
    expect(src).toContain(firstBaseName);
  });

  test('lightbox has focusable elements', async ({ page }) => {
    await page.locator('[data-photos-container] img').first().click();

    const closeBtn = page.locator('[data-lightbox-close]');
    const lightboxImg = page.locator('[data-lightbox-img]');

    await expect(closeBtn).toBeVisible();
    await expect(lightboxImg).toBeVisible();
    await expect(closeBtn).toHaveAttribute('tabindex', '0');
  });
});

test.describe('Photo deep linking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/photos');
    await page.waitForLoadState('networkidle');
    const lightbox = page.locator('[data-lightbox]');
    const isOpen = await lightbox.evaluate(el => el.classList.contains('lightbox-open'));
    if (isOpen) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
    }
    await expect(lightbox).not.toHaveClass(/lightbox-open/);
  });

  test('URL updates when lightbox opens', async ({ page }) => {
    const firstPicture = page.locator('[data-photos-container] picture[data-slug]').first();
    const slug = await firstPicture.getAttribute('data-slug');

    await firstPicture.locator('img').click();

    await expect(page).toHaveURL(new RegExp(`/photos/${slug}/`));
  });

  test('URL resets when lightbox closes', async ({ page }) => {
    await page.locator('[data-photos-container] img').first().click();
    await page.keyboard.press('Escape');

    await expect(page).toHaveURL(/\/photos\/$/);
  });

  test('URL updates when navigating between photos', async ({ page }) => {
    const pictures = page.locator('[data-photos-container] picture[data-slug]');
    const firstSlug = await pictures.first().getAttribute('data-slug');
    const secondSlug = await pictures.nth(1).getAttribute('data-slug');

    await pictures.first().locator('img').click();
    await expect(page).toHaveURL(new RegExp(`/photos/${firstSlug}/`));

    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(new RegExp(`/photos/${secondSlug}/`));
  });

  test('direct URL with query param opens lightbox for correct photo', async ({ page }) => {
    await page.goto('/photos/?photo=coleman-glacier-mount-baker-heliotrope-ridge');
    await page.waitForLoadState('networkidle');

    const lightbox = page.locator('[data-lightbox]');
    await expect(lightbox).toHaveClass(/lightbox-open/);

    const lightboxImg = page.locator('[data-lightbox-img]');
    const alt = await lightboxImg.getAttribute('alt');
    expect(alt).toContain('Coleman Glacier');
  });

  test('back button closes lightbox', async ({ page }) => {
    await page.locator('[data-photos-container] img').first().click();
    const lightbox = page.locator('[data-lightbox]');
    await expect(lightbox).toHaveClass(/lightbox-open/);

    await page.goBack();
    await expect(lightbox).not.toHaveClass(/lightbox-open/);
  });
});
