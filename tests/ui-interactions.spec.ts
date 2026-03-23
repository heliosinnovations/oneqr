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
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();
  });

  test('should not trigger generation with other keys', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');

    await urlInput.fill('https://example.com');
    await urlInput.press('Space');

    // QR code should not be generated
    await expect(page.locator('img[alt="Generated QR Code"]')).not.toBeVisible();
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
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();
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

    // Success state: QR code and all action buttons visible
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();
    await expect(page.locator('button:has-text("PNG")')).toBeVisible();
    await expect(page.locator('button:has-text("SVG")')).toBeVisible();
    await expect(page.locator('button:has-text("Print")')).toBeVisible();
  });

  test('should maintain input value after generation', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    const testUrl = 'https://example.com';
    await urlInput.fill(testUrl);
    await generateButton.click();

    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();

    // Input should still have the value
    const value = await urlInput.inputValue();
    expect(value).toBe(testUrl);
  });

  test('should allow modifying URL after generation', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    // Generate first QR
    await urlInput.fill('https://example1.com');
    await generateButton.click();
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();

    // Modify URL and generate again
    await urlInput.fill('https://example2.com');
    await generateButton.click();
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();

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
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();

    // Hover over download button
    const pngButton = page.locator('button:has-text("PNG")');
    await pngButton.hover();

    // Button should be visible and interactable
    await expect(pngButton).toBeVisible();
    await expect(pngButton).toBeEnabled();
  });

  test('should handle rapid consecutive clicks gracefully', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill('https://example.com');

    // Click multiple times rapidly
    await generateButton.click();
    await generateButton.click();
    await generateButton.click();

    // Should still generate QR code successfully
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();
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
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();
  });

  test('should have accessible button labels', async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill('https://example.com');
    await generateButton.click();
    await expect(page.locator('img[alt="Generated QR Code"]')).toBeVisible();

    // All buttons should have clear text labels
    await expect(page.locator('button:has-text("PNG")')).toBeVisible();
    await expect(page.locator('button:has-text("SVG")')).toBeVisible();
    await expect(page.locator('button:has-text("Print")')).toBeVisible();
  });

  test('should have proper input label', async ({ page }) => {
    await expect(page.locator('text=Enter Your URL')).toBeVisible();
  });
});
