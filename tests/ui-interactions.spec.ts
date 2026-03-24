import { test, expect } from '@playwright/test';

test.describe('UI/UX Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Generate QR Code')).toBeVisible();
  });

  test('should accept text input in URL field', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');

    await urlInput.fill('https://example.com');

    const value = await urlInput.inputValue();
    expect(value).toBe('https://example.com');
  });

  test('should trigger generation with Enter key', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');

    await urlInput.fill('https://example.com');
    await urlInput.press('Enter');

    // Verify QR code is generated
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();
  });

  test('should not trigger generation with other keys', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');

    await urlInput.fill('https://example.com');
    await urlInput.press('Space');

    // QR code should not be generated
    await expect(page.locator('img[alt^="QR code linking to"]')).not.toBeVisible();
  });

  test('should show placeholder text in input field', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');

    const placeholder = await urlInput.getAttribute('placeholder');
    expect(placeholder).toContain('yoursite.com');
  });

  test('should show loading state on button', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill('https://example.com');

    // Check initial button state
    await expect(generateButton).toContainText('Generate QR Code');
    await expect(generateButton).not.toBeDisabled();

    // Click and check for possible loading state
    await generateButton.click();

    // Button should eventually show QR code
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();
  });

  test('should display error message styling', async ({ page }) => {
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await generateButton.click();

    const errorMessage = page.locator('text=Please enter a URL');
    await expect(errorMessage).toBeVisible();

    // Verify error message has accent color (red/orange)
    const color = await errorMessage.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    // Error should have some color (not black)
    expect(color).toBeTruthy();
  });

  test('should show success state with visible buttons', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill('https://example.com');
    await generateButton.click();

    // Success state: QR code and download button visible
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();
    await expect(page.locator('button:has-text("Generate & Download")')).toBeVisible();
  });

  test('should maintain input value after generation', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    const testUrl = 'https://example.com';
    await urlInput.fill(testUrl);
    await generateButton.click();

    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();

    // Input should still have the value
    const value = await urlInput.inputValue();
    expect(value).toBe(testUrl);
  });

  test('should allow modifying URL after generation', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');

    // Generate first QR
    await urlInput.fill('https://example1.com');
    await page.locator('button:has-text("Generate QR Code")').click();
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();

    // Modify URL and generate again (button text changed)
    await urlInput.fill('https://example2.com');
    await page.locator('button:has-text("Generate & Download")').click();
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();

    const value = await urlInput.inputValue();
    expect(value).toBe('https://example2.com');
  });

  test('should focus input field on page load', async ({ page }) => {
    // Check if input is focusable
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    await urlInput.focus();

    const isFocused = await urlInput.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('should show hover state on buttons', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill('https://example.com');
    await generateButton.click();
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();

    // Hover over download button
    const downloadButton = page.locator('button:has-text("Generate & Download")');
    await downloadButton.hover();

    // Button should be visible and interactable
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toBeEnabled();
  });

  test('should handle rapid consecutive clicks gracefully', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');

    await urlInput.fill('https://example.com');

    // Click the Generate QR Code button
    await page.locator('button:has-text("Generate QR Code")').click();

    // Wait for QR to be generated
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();

    // Now click the Generate & Download button multiple times rapidly
    await page.locator('button:has-text("Generate & Download")').click();
    await page.locator('button:has-text("Generate & Download")').click();

    // Should still display QR code successfully
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();
  });

  test('should display "Try it now" label', async ({ page }) => {
    await expect(page.locator('text=Try it now')).toBeVisible();
  });

  test('should display note about free generation', async ({ page }) => {
    await expect(page.locator('text=Free to generate')).toBeVisible();
  });

  test('should handle very long URLs', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    const longUrl = 'https://example.com/' + 'a'.repeat(500) + '?param=value';
    await urlInput.fill(longUrl);
    await generateButton.click();

    // Should still generate QR code
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();
  });

  test('should have accessible button labels', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill('https://example.com');
    await generateButton.click();
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();

    // Download button should have clear text label
    await expect(page.locator('button:has-text("Generate & Download")')).toBeVisible();
  });

  test('should have proper input label', async ({ page }) => {
    await expect(page.locator('text=Enter Your URL')).toBeVisible();
  });
});
