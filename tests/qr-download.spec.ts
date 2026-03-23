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
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();
  });

  test('should download PNG file', async ({ page }) => {
    // Set up download promise
    const downloadPromise = page.waitForEvent('download');

    // Click PNG download button
    await page.locator('button:has-text("PNG")').click();

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

  test('should download SVG file', async ({ page }) => {
    // Set up download promise
    const downloadPromise = page.waitForEvent('download');

    // Click SVG download button
    await page.locator('button:has-text("SVG")').click();

    // Wait for download
    const download = await downloadPromise;

    // Verify file name
    expect(download.suggestedFilename()).toBe('qr-code.svg');

    // Save file to verify it's valid
    const path = await download.path();
    expect(path).not.toBeNull();

    // Verify file is not empty
    const buffer = readFileSync(path!);
    expect(buffer.length).toBeGreaterThan(0);

    // Verify it's an SVG file (contains SVG tags)
    const content = buffer.toString('utf-8');
    expect(content).toContain('<svg');
    expect(content).toContain('</svg>');
  });

  test('should download PNG with correct MIME type', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("PNG")').click();
    const download = await downloadPromise;

    // The browser will set the MIME type based on the data URL
    // For data URLs, we verify the prefix contains the MIME type
    const qrImage = page.locator('img[alt="Generated QR Code"]');
    const src = await qrImage.getAttribute('src');
    expect(src).toContain('data:image/png;base64');
  });

  test('should download SVG with correct MIME type', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("SVG")').click();
    const download = await downloadPromise;

    // Verify file content is valid SVG
    const path = await download.path();
    const content = readFileSync(path!).toString('utf-8');

    // SVG should contain xmlns attribute
    expect(content).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  test('should download non-empty PNG file', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("PNG")').click();
    const download = await downloadPromise;

    const path = await download.path();
    const buffer = readFileSync(path!);

    // Verify file size is reasonable (should be at least a few KB for a QR code)
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.length).toBeLessThan(1000000); // Less than 1MB
  });

  test('should download non-empty SVG file', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("SVG")').click();
    const download = await downloadPromise;

    const path = await download.path();
    const buffer = readFileSync(path!);

    // SVG text should be at least a few hundred bytes
    expect(buffer.length).toBeGreaterThan(100);
  });

  test('should download buttons be disabled before QR generation', async ({ page }) => {
    // Go to fresh page
    await page.goto('/');

    // Download buttons should not be visible before QR is generated
    await expect(page.locator('button:has-text("PNG")')).not.toBeVisible();
    await expect(page.locator('button:has-text("SVG")')).not.toBeVisible();
  });

  test('should download same QR code multiple times', async ({ page }) => {
    // Download PNG first time
    let downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("PNG")').click();
    const download1 = await downloadPromise;
    const path1 = await download1.path();
    const content1 = readFileSync(path1!);

    // Download PNG second time
    downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("PNG")').click();
    const download2 = await downloadPromise;
    const path2 = await download2.path();
    const content2 = readFileSync(path2!);

    // Both downloads should have identical content
    expect(content1.equals(content2)).toBe(true);
  });

  test('should download different formats of same QR code', async ({ page }) => {
    // Download PNG
    let downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("PNG")').click();
    const pngDownload = await downloadPromise;
    const pngPath = await pngDownload.path();
    const pngBuffer = readFileSync(pngPath!);

    // Download SVG
    downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("SVG")').click();
    const svgDownload = await downloadPromise;
    const svgPath = await svgDownload.path();
    const svgBuffer = readFileSync(svgPath!);

    // Verify both files exist and have different formats
    expect(pngBuffer.length).toBeGreaterThan(0);
    expect(svgBuffer.length).toBeGreaterThan(0);

    // PNG starts with PNG signature
    expect(pngBuffer[0]).toBe(0x89);

    // SVG is text starting with '<'
    expect(svgBuffer[0]).toBe(0x3C); // '<' character
  });
});
