import { test, expect } from '@playwright/test';

test.describe('QR Code Print', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Generate a QR code first
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill('https://example.com');
    await generateButton.click();
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();
  });

  test('should trigger print dialog when clicking Print button', async ({ page, context }) => {
    // Listen for new popup window
    const popupPromise = context.waitForEvent('page');

    // Click print button
    await page.locator('button:has-text("Print")').click();

    // Wait for popup window
    const popup = await popupPromise;

    // Wait for popup to load
    await popup.waitForLoadState('load');

    // Verify popup contains QR code image
    const qrImage = popup.locator('img[alt="QR Code"]');
    await expect(qrImage).toBeVisible();

    // Verify image has valid src
    const src = await qrImage.getAttribute('src');
    expect(src).toContain('data:image/png;base64');

    // Verify the popup has print-friendly structure
    const title = await popup.title();
    expect(title).toBe('Print QR Code');

    // Close popup
    await popup.close();
  });

  test('should open new window for printing', async ({ page, context }) => {
    const initialPageCount = context.pages().length;

    const popupPromise = context.waitForEvent('page');
    await page.locator('button:has-text("Print")').click();

    const popup = await popupPromise;

    // Verify new window was opened
    expect(context.pages().length).toBe(initialPageCount + 1);

    await popup.close();
  });

  test('should contain QR code in print window', async ({ page, context }) => {
    const popupPromise = context.waitForEvent('page');
    await page.locator('button:has-text("Print")').click();
    const popup = await popupPromise;

    await popup.waitForLoadState('load');

    // Verify QR image exists
    const images = await popup.locator('img').count();
    expect(images).toBeGreaterThanOrEqual(1);

    // Get the QR code from main page
    const mainPageQrSrc = await page.locator('img[alt="Generated QR Code"]').getAttribute('src');

    // Get the image from print window
    const printQrSrc = await popup.locator('img').first().getAttribute('src');

    // They should have the same QR code
    expect(printQrSrc).toBe(mainPageQrSrc);

    await popup.close();
  });

  test('should have centered layout in print window', async ({ page, context }) => {
    const popupPromise = context.waitForEvent('page');
    await page.locator('button:has-text("Print")').click();
    const popup = await popupPromise;

    await popup.waitForLoadState('load');

    // Check body has flex centering
    const bodyStyle = await popup.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        display: styles.display,
        justifyContent: styles.justifyContent,
        alignItems: styles.alignItems,
      };
    });

    expect(bodyStyle.display).toBe('flex');
    expect(bodyStyle.justifyContent).toBe('center');
    expect(bodyStyle.alignItems).toBe('center');

    await popup.close();
  });

  test('should not print if QR code not generated', async ({ page }) => {
    // Go to fresh page
    await page.goto('/');

    // Print button should not be visible
    await expect(page.locator('button:has-text("Print")')).not.toBeVisible();
  });

  test('should print different QR codes correctly', async ({ page, context }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    // Generate first QR code and print
    await urlInput.fill('https://example1.com');
    await generateButton.click();
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();

    const popupPromise1 = context.waitForEvent('page');
    await page.locator('button:has-text("Print")').click();
    const popup1 = await popupPromise1;
    await popup1.waitForLoadState('load');

    const firstQrSrc = await popup1.locator('img').first().getAttribute('src');
    await popup1.close();

    // Generate second QR code and print
    await urlInput.fill('https://example2.com');
    await generateButton.click();
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();

    const popupPromise2 = context.waitForEvent('page');
    await page.locator('button:has-text("Print")').click();
    const popup2 = await popupPromise2;
    await popup2.waitForLoadState('load');

    const secondQrSrc = await popup2.locator('img').first().getAttribute('src');
    await popup2.close();

    // Verify different QR codes were printed
    expect(firstQrSrc).not.toBe(secondQrSrc);
  });

  test('should have print button with icon', async ({ page }) => {
    const printButton = page.locator('button:has-text("Print")');

    await expect(printButton).toBeVisible();

    // Verify button has SVG icon
    const svg = printButton.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('should maintain QR quality in print window', async ({ page, context }) => {
    const popupPromise = context.waitForEvent('page');
    await page.locator('button:has-text("Print")').click();
    const popup = await popupPromise;

    await popup.waitForLoadState('load');

    // Verify image loaded successfully
    const imageLoaded = await popup.locator('img').first().evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
    });
    expect(imageLoaded).toBe(true);

    await popup.close();
  });
});
