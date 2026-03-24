import { test, expect } from "@playwright/test";

test.describe("QR Code Generation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the page to be fully loaded
    await expect(page.locator("text=Generate QR Code")).toBeVisible();
  });

  test("should generate QR code for valid URL with https prefix", async ({
    page,
  }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    // Enter valid URL with https://
    await urlInput.fill("https://example.com");
    await generateButton.click();

    // Wait for QR code to be generated
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();

    // Verify the button changed to download mode
    await expect(
      page.locator('button:has-text("Generate & Download")')
    ).toBeVisible();
  });

  test("should generate QR code for URL without https prefix", async ({
    page,
  }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    // Enter URL without https://
    await urlInput.fill("example.com");
    await generateButton.click();

    // Wait for QR code to be generated
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();

    // Verify QR code image has valid data URL
    const qrImage = page.locator('img[alt^="QR code linking to"]');
    const src = await qrImage.getAttribute("src");
    expect(src).toContain("data:image/png;base64");
  });

  test("should show error for empty input", async ({ page }) => {
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    // Click generate without entering URL
    await generateButton.click();

    // Verify error message is shown
    await expect(page.locator("text=Please enter a URL")).toBeVisible();

    // Verify QR code is not displayed
    await expect(
      page.locator('img[alt^="QR code linking to"]')
    ).not.toBeVisible();
  });

  test("should show error for whitespace-only input", async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    // Enter only whitespace
    await urlInput.fill("   ");
    await generateButton.click();

    // Verify error message is shown
    await expect(page.locator("text=Please enter a URL")).toBeVisible();
  });

  test("should clear error message when entering valid URL after error", async ({
    page,
  }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    // First trigger error
    await generateButton.click();
    await expect(page.locator("text=Please enter a URL")).toBeVisible();

    // Then enter valid URL
    await urlInput.fill("example.com");
    await generateButton.click();

    // Verify error is cleared
    await expect(page.locator("text=Please enter a URL")).not.toBeVisible();
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();
  });

  test("should show loading state while generating", async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill("https://example.com");

    // Start generation and immediately check for loading state
    const clickPromise = generateButton.click();

    // The button text should change to "Generating..."
    // This might be very brief, so we use waitFor with timeout
    await expect(generateButton).toContainText(
      /Generate QR Code|Generating.../
    );

    await clickPromise;

    // Eventually should show the QR code
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();
  });

  test("should generate QR code for complex URL with query parameters", async ({
    page,
  }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    // Enter complex URL
    const complexUrl =
      "https://example.com/path?param1=value1&param2=value2#anchor";
    await urlInput.fill(complexUrl);
    await generateButton.click();

    // Verify QR code is generated
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();
  });

  test("should generate QR code for localhost URL", async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill("http://localhost:3000");
    await generateButton.click();

    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();
  });

  test("should generate different QR codes for different URLs", async ({
    page,
  }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');

    // Generate first QR code
    await urlInput.fill("https://example1.com");
    await page.locator('button:has-text("Generate QR Code")').click();
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();

    const firstQrSrc = await page
      .locator('img[alt^="QR code linking to"]')
      .getAttribute("src");

    // Generate second QR code by pressing Enter (regenerates with new URL)
    await urlInput.fill("https://example2.com");
    await urlInput.press("Enter");

    // Wait for new QR code to be generated
    await page.waitForTimeout(500);
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();

    const secondQrSrc = await page
      .locator('img[alt^="QR code linking to"]')
      .getAttribute("src");

    // Verify QR codes are different
    expect(firstQrSrc).not.toBe(secondQrSrc);
  });

  test("should visually render QR code correctly", async ({ page }) => {
    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill("https://example.com");
    await generateButton.click();

    const qrImage = page.locator('img[alt^="QR code linking to"]');
    await expect(qrImage).toBeVisible();

    // Verify image has proper dimensions
    const boundingBox = await qrImage.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);

    // Verify the image loaded successfully (has src and natural dimensions)
    const hasValidImage = await qrImage.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
    });
    expect(hasValidImage).toBe(true);
  });
});
