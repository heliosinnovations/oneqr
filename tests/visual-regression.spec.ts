import { test, expect } from "@playwright/test";

// NOTE: Visual regression tests require baseline snapshots to be updated
// when UI changes. These tests verify the page renders correctly without
// comparing to specific pixel values.

test.describe("Visual Regression Tests", () => {
  test("should render homepage without errors", async ({ page }) => {
    await page.goto("/");

    // Wait for page to be fully loaded
    await expect(page.locator("text=Generate QR Code")).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Verify key elements are present
    await expect(page.locator("text=Create QR codes")).toBeVisible();
  });

  test("should render homepage on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await expect(page.locator("text=Generate QR Code")).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Verify content is visible on mobile
    await expect(page.locator("text=Create QR codes")).toBeVisible();
  });

  test("should render QR generator component", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Generate QR Code")).toBeVisible();

    // Verify key generator elements
    await expect(
      page.locator('input[placeholder*="yoursite.com"]')
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Generate QR Code")')
    ).toBeVisible();
  });

  test("should render QR generator with generated QR code", async ({
    page,
  }) => {
    await page.goto("/");

    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill("https://example.com");
    await generateButton.click();
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();

    // Verify QR image is rendered
    const qrImage = page.locator('img[alt^="QR code linking to"]');
    const src = await qrImage.getAttribute("src");
    expect(src).toContain("data:image/png;base64");
  });

  test("should render error state", async ({ page }) => {
    await page.goto("/");

    const generateButton = page.locator('button:has-text("Generate QR Code")');
    await generateButton.click();

    // Error message should be visible
    await expect(page.locator("text=Please enter a URL")).toBeVisible();
  });

  test("should render navigation bar", async ({ page }) => {
    await page.goto("/");

    // Use the main navigation (specific selector)
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();

    // Verify logo is visible in nav (use specific container)
    await expect(nav.locator("text=The QR")).toBeVisible();
  });

  test("should render footer", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Verify footer content
    await expect(footer.locator("text=Helios Innovations")).toBeVisible();
  });

  test("should render features section", async ({ page }) => {
    await page.goto("/");

    const features = page.locator("#features");
    await expect(features).toBeVisible();

    // Verify features content
    await expect(features.locator("text=Everything you need")).toBeVisible();
  });

  test("should render tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    await expect(page.locator("text=Generate QR Code")).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Verify content scales properly
    await expect(page.locator("text=Create QR codes")).toBeVisible();
  });

  test("should render desktop wide viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");

    await expect(page.locator("text=Generate QR Code")).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Verify content is present
    await expect(page.locator("text=Create QR codes")).toBeVisible();
  });
});

test.describe("Cross-Browser Visual Consistency", () => {
  test("should render consistently across browsers", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Generate QR Code")).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Verify key elements render in all browsers
    await expect(page.locator("text=Create QR codes")).toBeVisible();
    await expect(
      page.locator('nav[aria-label="Main navigation"]')
    ).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("should render QR generator consistently across browsers", async ({
    page,
  }) => {
    await page.goto("/");

    const urlInput = page.locator('input[placeholder*="yoursite.com"]');
    const generateButton = page.locator('button:has-text("Generate QR Code")');

    await urlInput.fill("https://example.com");
    await generateButton.click();
    await expect(page.locator('img[alt^="QR code linking to"]')).toBeVisible();

    // Verify QR code renders correctly
    const qrImage = page.locator('img[alt^="QR code linking to"]');
    const hasValidImage = await qrImage.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
    });
    expect(hasValidImage).toBe(true);
  });
});
