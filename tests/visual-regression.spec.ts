import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('should match homepage baseline screenshot', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully loaded
    await expect(page.locator('text=Generate QR Code')).toBeVisible();
    await page.waitForLoadState('networkidle');

    // Take screenshot and compare
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match homepage on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('text=Generate QR Code')).toBeVisible();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match QR generator component baseline', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Generate QR Code')).toBeVisible();

    // Locate QR generator component - use the actual container div
    const qrGenerator = page.locator('div.relative.bg-surface').first();

    await expect(qrGenerator).toHaveScreenshot('qr-generator-initial.png', {
      animations: 'disabled',
    });
  });

  test('should match QR generator with generated QR code', async ({ page }) => {
    await page.goto('/');

    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill('https://example.com');
    await generateButton.click();
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();

    // Wait for any animations to complete
    await page.waitForTimeout(500);

    const qrGenerator = page.locator('div.relative.bg-surface').first();

    await expect(qrGenerator).toHaveScreenshot('qr-generator-with-qr.png', {
      animations: 'disabled',
    });
  });

  test('should match error state', async ({ page }) => {
    await page.goto('/');

    const generateButton = page.locator('button:has-text("Generate QR Code")');
    await generateButton.click();

    await expect(page.locator('text=Please enter a URL')).toBeVisible();

    const qrGenerator = page.locator('div.relative.bg-surface').first();

    await expect(qrGenerator).toHaveScreenshot('qr-generator-error.png', {
      animations: 'disabled',
    });
  });

  test('should match navigation bar', async ({ page }) => {
    await page.goto('/');

    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    await expect(nav).toHaveScreenshot('navigation.png', {
      animations: 'disabled',
    });
  });

  test('should match footer', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    await expect(footer).toHaveScreenshot('footer.png', {
      animations: 'disabled',
    });
  });

  test('should match "How it works" section', async ({ page }) => {
    await page.goto('/');

    const howItWorks = page.locator('#how-it-works');
    await expect(howItWorks).toBeVisible();

    await expect(howItWorks).toHaveScreenshot('how-it-works.png', {
      animations: 'disabled',
    });
  });

  test('should match "Features" section', async ({ page }) => {
    await page.goto('/');

    const features = page.locator('#features');
    await expect(features).toBeVisible();

    await expect(features).toHaveScreenshot('features.png', {
      animations: 'disabled',
    });
  });

  test('should match tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('text=Generate QR Code')).toBeVisible();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match desktop wide viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(page.locator('text=Generate QR Code')).toBeVisible();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-desktop-wide.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Cross-Browser Visual Consistency', () => {
  test('should render consistently across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    await expect(page.locator('text=Generate QR Code')).toBeVisible();
    await page.waitForLoadState('networkidle');

    // Screenshot will be different per browser, but test verifies all browsers can render
    await expect(page).toHaveScreenshot(`homepage-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02, // Allow 2% difference between browsers
    });
  });

  test('should render QR generator consistently across browsers', async ({ page, browserName }) => {
    await page.goto('/');

    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill('https://example.com');
    await generateButton.click();
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();

    await page.waitForTimeout(500);

    const qrGenerator = page.locator('div.relative.bg-surface').first();

    await expect(qrGenerator).toHaveScreenshot(`qr-generator-${browserName}.png`, {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
