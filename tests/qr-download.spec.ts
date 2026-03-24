import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';

test.describe('QR Code Download', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Generate a QR code first
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill('https://example.com');
    await generateButton.click();
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();
  });

  test('should download PNG file via Generate & Download button', async ({ page }) => {
    // Set up download promise
    const downloadPromise = page.waitForEvent('download');

    // Click the combined Generate & Download button
    await page.locator('button:has-text("Generate & Download")').click();

    // Wait for download
    const download = await downloadPromise;

    // Verify file name
    expect(download.suggestedFilename()).toBe('qr-code.png');

    // Save file to verify it's valid
    const path = await download.path();
    expect(path).not.toBeNull();

    // Verify file is not empty
    const buffer = readFileSync(path!);
    expect(buffer.length).toBeGreaterThan(0);

    // Verify it's a PNG file (PNG signature: 89 50 4E 47)
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
    expect(buffer[2]).toBe(0x4E);
    expect(buffer[3]).toBe(0x47);
  });

  test('should download PNG with correct MIME type', async ({ page }) => {
    // The QR image should be a base64 PNG
    const qrImage = page.locator('img[alt^="QR code linking to"]');
    const src = await qrImage.getAttribute('src');
    expect(src).toContain('data:image/png;base64');
  });

  test('should download non-empty PNG file', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Generate & Download")').click();
    const download = await downloadPromise;

    const path = await download.path();
    const buffer = readFileSync(path!);

    // Verify file size is reasonable (should be at least a few KB for a QR code)
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.length).toBeLessThan(1000000); // Less than 1MB
  });

  test('should download button not be visible before QR generation', async ({ page }) => {
    // Go to fresh page
    await page.goto('/');

    // Generate & Download button should not be visible before QR is generated
    // Only "Generate QR Code" button should be visible
    await expect(page.locator('button:has-text("Generate QR Code")')).toBeVisible();
    await expect(page.locator('button:has-text("Generate & Download")')).not.toBeVisible();
  });

  test('should download same QR code multiple times', async ({ page }) => {
    // Download first time
    let downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Generate & Download")').click();
    const download1 = await downloadPromise;
    const path1 = await download1.path();
    const content1 = readFileSync(path1!);

    // Download second time
    downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Generate & Download")').click();
    const download2 = await downloadPromise;
    const path2 = await download2.path();
    const content2 = readFileSync(path2!);

    // Both downloads should have identical content
    expect(content1.equals(content2)).toBe(true);
  });

  test('should download different QR codes for different URLs', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');

    // First QR code is already generated for example.com
    // Download it
    let downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Generate & Download")').click();
    const download1 = await downloadPromise;
    const path1 = await download1.path();
    const content1 = readFileSync(path1!);

    // Change URL and regenerate using Enter key
    await urlInput.fill('https://different-example.com');
    await urlInput.press('Enter');
    await page.waitForTimeout(500);
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();

    // Download the new QR code
    downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Generate & Download")').click();
    const download2 = await downloadPromise;
    const path2 = await download2.path();
    const content2 = readFileSync(path2!);

    // The QR codes should be different
    expect(content1.equals(content2)).toBe(false);
  });
});
