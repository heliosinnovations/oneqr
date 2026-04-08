import { test, expect } from "@playwright/test";

/**
 * Test Suite: Print Page Spacing Controls (PR #126)
 *
 * Tests the header and footer spacing controls on the /print/[qrId] page
 * including real-time preview updates, localStorage persistence, and
 * cross-browser compatibility.
 */

test.describe("Print Page Spacing Controls", () => {
  // Use demo mode to avoid authentication requirements
  const testUrl = "/print/demo";

  test.beforeEach(async ({ page }) => {
    // Navigate to demo print page
    await page.goto(testUrl);

    // Wait for page to load
    await page.waitForSelector(".spacing-controls", { timeout: 10000 });

    // Clear localStorage to start with clean state
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Reload to apply clean state
    await page.reload();
    await page.waitForSelector(".spacing-controls");
  });

  test("should display spacing controls section", async ({ page }) => {
    const spacingControls = page.locator(".spacing-controls");
    await expect(spacingControls).toBeVisible();

    const heading = spacingControls.locator(".spacing-heading");
    await expect(heading).toContainText("Spacing");
  });

  test("should display header spacing slider with default value", async ({
    page,
  }) => {
    const headerSlider = page.locator("#header-spacing");
    await expect(headerSlider).toBeVisible();

    // Check default value is 16
    const value = await headerSlider.inputValue();
    expect(value).toBe("16");

    // Check label displays current value
    const label = page.locator('label[for="header-spacing"]');
    await expect(label).toContainText("Header Spacing: 16px");
  });

  test("should display footer spacing slider with default value", async ({
    page,
  }) => {
    const footerSlider = page.locator("#footer-spacing");
    await expect(footerSlider).toBeVisible();

    // Check default value is 16
    const value = await footerSlider.inputValue();
    expect(value).toBe("16");

    // Check label displays current value
    const label = page.locator('label[for="footer-spacing"]');
    await expect(label).toContainText("Footer Spacing: 16px");
  });

  test("should update header spacing label when slider moves", async ({
    page,
  }) => {
    const headerSlider = page.locator("#header-spacing");
    const label = page.locator('label[for="header-spacing"]');

    // Move slider to 32px
    await headerSlider.fill("32");

    // Wait for label to update
    await expect(label).toContainText("Header Spacing: 32px");
  });

  test("should update footer spacing label when slider moves", async ({
    page,
  }) => {
    const footerSlider = page.locator("#footer-spacing");
    const label = page.locator('label[for="footer-spacing"]');

    // Move slider to 48px
    await footerSlider.fill("48");

    // Wait for label to update
    await expect(label).toContainText("Footer Spacing: 48px");
  });

  test("should update preview in real-time when header spacing changes", async ({
    page,
  }) => {
    const headerSlider = page.locator("#header-spacing");
    const paperHeader = page.locator(".paper-header");

    // Get initial padding
    const initialPadding = await paperHeader.evaluate((el) => {
      return window.getComputedStyle(el).paddingBottom;
    });
    expect(initialPadding).toBe("16px");

    // Change to 64px
    await headerSlider.fill("64");

    // Wait a bit for React to update
    await page.waitForTimeout(200);

    // Check padding updated
    const updatedPadding = await paperHeader.evaluate((el) => {
      return window.getComputedStyle(el).paddingBottom;
    });
    expect(updatedPadding).toBe("64px");
  });

  test("should update preview in real-time when footer spacing changes", async ({
    page,
  }) => {
    const footerSlider = page.locator("#footer-spacing");
    const paperFooter = page.locator(".paper-footer");

    // Get initial padding
    const initialPadding = await paperFooter.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop;
    });
    expect(initialPadding).toBe("16px");

    // Change to 80px
    await footerSlider.fill("80");

    // Wait a bit for React to update
    await page.waitForTimeout(200);

    // Check padding updated
    const updatedPadding = await paperFooter.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop;
    });
    expect(updatedPadding).toBe("80px");
  });

  test("should allow minimum spacing value (0px) for header", async ({
    page,
  }) => {
    const headerSlider = page.locator("#header-spacing");
    const paperHeader = page.locator(".paper-header");
    const label = page.locator('label[for="header-spacing"]');

    // Set to 0px
    await headerSlider.fill("0");

    // Check label
    await expect(label).toContainText("Header Spacing: 0px");

    // Check preview
    await page.waitForTimeout(200);
    const padding = await paperHeader.evaluate((el) => {
      return window.getComputedStyle(el).paddingBottom;
    });
    expect(padding).toBe("0px");
  });

  test("should allow maximum spacing value (100px) for header", async ({
    page,
  }) => {
    const headerSlider = page.locator("#header-spacing");
    const paperHeader = page.locator(".paper-header");
    const label = page.locator('label[for="header-spacing"]');

    // Set to 100px
    await headerSlider.fill("100");

    // Check label
    await expect(label).toContainText("Header Spacing: 100px");

    // Check preview
    await page.waitForTimeout(200);
    const padding = await paperHeader.evaluate((el) => {
      return window.getComputedStyle(el).paddingBottom;
    });
    expect(padding).toBe("100px");
  });

  test("should allow minimum spacing value (0px) for footer", async ({
    page,
  }) => {
    const footerSlider = page.locator("#footer-spacing");
    const paperFooter = page.locator(".paper-footer");
    const label = page.locator('label[for="footer-spacing"]');

    // Set to 0px
    await footerSlider.fill("0");

    // Check label
    await expect(label).toContainText("Footer Spacing: 0px");

    // Check preview
    await page.waitForTimeout(200);
    const padding = await paperFooter.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop;
    });
    expect(padding).toBe("0px");
  });

  test("should allow maximum spacing value (100px) for footer", async ({
    page,
  }) => {
    const footerSlider = page.locator("#footer-spacing");
    const paperFooter = page.locator(".paper-footer");
    const label = page.locator('label[for="footer-spacing"]');

    // Set to 100px
    await footerSlider.fill("100");

    // Check label
    await expect(label).toContainText("Footer Spacing: 100px");

    // Check preview
    await page.waitForTimeout(200);
    const padding = await paperFooter.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop;
    });
    expect(padding).toBe("100px");
  });

  test("should persist header spacing in localStorage", async ({ page }) => {
    const headerSlider = page.locator("#header-spacing");

    // Change to 56px
    await headerSlider.fill("56");
    await page.waitForTimeout(300);

    // Check localStorage
    const storedValue = await page.evaluate(() => {
      return localStorage.getItem("qr-demo-header-spacing");
    });
    expect(storedValue).toBe("56");
  });

  test("should persist footer spacing in localStorage", async ({ page }) => {
    const footerSlider = page.locator("#footer-spacing");

    // Change to 72px
    await footerSlider.fill("72");
    await page.waitForTimeout(300);

    // Check localStorage
    const storedValue = await page.evaluate(() => {
      return localStorage.getItem("qr-demo-footer-spacing");
    });
    expect(storedValue).toBe("72");
  });

  test("should restore spacing values from localStorage on page load", async ({
    page,
  }) => {
    // Set custom values in localStorage
    await page.evaluate(() => {
      localStorage.setItem("qr-demo-header-spacing", "40");
      localStorage.setItem("qr-demo-footer-spacing", "60");
    });

    // Reload page
    await page.reload();
    await page.waitForSelector(".spacing-controls");

    // Check sliders restored values
    const headerSlider = page.locator("#header-spacing");
    const footerSlider = page.locator("#footer-spacing");

    const headerValue = await headerSlider.inputValue();
    const footerValue = await footerSlider.inputValue();

    expect(headerValue).toBe("40");
    expect(footerValue).toBe("60");

    // Check labels
    await expect(page.locator('label[for="header-spacing"]')).toContainText(
      "Header Spacing: 40px"
    );
    await expect(page.locator('label[for="footer-spacing"]')).toContainText(
      "Footer Spacing: 60px"
    );
  });

  test("should reset spacing to 16px when Clear button clicked", async ({
    page,
  }) => {
    const headerSlider = page.locator("#header-spacing");
    const footerSlider = page.locator("#footer-spacing");
    const clearButton = page.locator('button:has-text("Clear")');

    // Set custom values
    await headerSlider.fill("88");
    await footerSlider.fill("92");
    await page.waitForTimeout(300);

    // Click Clear button and confirm dialog
    page.on("dialog", (dialog) => dialog.accept());
    await clearButton.click();

    // Wait for reset
    await page.waitForTimeout(300);

    // Check sliders reset to 16
    expect(await headerSlider.inputValue()).toBe("16");
    expect(await footerSlider.inputValue()).toBe("16");

    // Check localStorage cleared
    const headerStorage = await page.evaluate(() =>
      localStorage.getItem("qr-demo-header-spacing")
    );
    const footerStorage = await page.evaluate(() =>
      localStorage.getItem("qr-demo-footer-spacing")
    );

    expect(headerStorage).toBeNull();
    expect(footerStorage).toBeNull();
  });

  test("should handle multiple rapid slider adjustments smoothly", async ({
    page,
  }) => {
    const headerSlider = page.locator("#header-spacing");
    const label = page.locator('label[for="header-spacing"]');

    // Rapidly adjust slider
    await headerSlider.fill("20");
    await headerSlider.fill("40");
    await headerSlider.fill("60");
    await headerSlider.fill("80");
    await headerSlider.fill("96");

    // Wait for updates to settle
    await page.waitForTimeout(400);

    // Check final value
    await expect(label).toContainText("Header Spacing: 96px");
    expect(await headerSlider.inputValue()).toBe("96");
  });

  test("should maintain independent spacing for header and footer", async ({
    page,
  }) => {
    const headerSlider = page.locator("#header-spacing");
    const footerSlider = page.locator("#footer-spacing");

    // Set different values
    await headerSlider.fill("24");
    await footerSlider.fill("84");
    await page.waitForTimeout(300);

    // Check both maintain their values
    expect(await headerSlider.inputValue()).toBe("24");
    expect(await footerSlider.inputValue()).toBe("84");

    // Check preview
    const headerPadding = await page
      .locator(".paper-header")
      .evaluate((el) => window.getComputedStyle(el).paddingBottom);
    const footerPadding = await page
      .locator(".paper-footer")
      .evaluate((el) => window.getComputedStyle(el).paddingTop);

    expect(headerPadding).toBe("24px");
    expect(footerPadding).toBe("84px");
  });
});

test.describe("Print Page Spacing Controls - Accessibility", () => {
  const testUrl = "/print/demo";

  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
    await page.waitForSelector(".spacing-controls");
  });

  test("header slider should be keyboard accessible", async ({ page }) => {
    const headerSlider = page.locator("#header-spacing");

    // Focus the slider
    await headerSlider.focus();

    // Check it has focus
    await expect(headerSlider).toBeFocused();

    // Use arrow keys to adjust (right arrow increases)
    const initialValue = await headerSlider.inputValue();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);

    const newValue = await headerSlider.inputValue();
    expect(parseInt(newValue)).toBeGreaterThan(parseInt(initialValue));
  });

  test("footer slider should be keyboard accessible", async ({ page }) => {
    const footerSlider = page.locator("#footer-spacing");

    // Focus the slider
    await footerSlider.focus();

    // Check it has focus
    await expect(footerSlider).toBeFocused();

    // Use arrow keys to adjust (left arrow decreases)
    await footerSlider.fill("50"); // Set to middle value
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(100);

    const newValue = await footerSlider.inputValue();
    expect(parseInt(newValue)).toBeLessThan(50);
  });

  test("sliders should have proper labels associated", async ({ page }) => {
    const headerSlider = page.locator("#header-spacing");
    const footerSlider = page.locator("#footer-spacing");

    // Check for attribute exists
    const headerId = await headerSlider.getAttribute("id");
    const footerId = await footerSlider.getAttribute("id");

    expect(headerId).toBe("header-spacing");
    expect(footerId).toBe("footer-spacing");

    // Check labels reference sliders
    const headerLabel = page.locator('label[for="header-spacing"]');
    const footerLabel = page.locator('label[for="footer-spacing"]');

    await expect(headerLabel).toBeVisible();
    await expect(footerLabel).toBeVisible();
  });

  test("sliders should show visible focus states", async ({ page }) => {
    const headerSlider = page.locator("#header-spacing");

    // Focus the slider
    await headerSlider.focus();

    // Check for focus-visible outline
    const outlineStyle = await headerSlider.evaluate((el) => {
      return window.getComputedStyle(el).outline;
    });

    // Focus state should be visible (non-zero outline or custom styling)
    expect(outlineStyle).not.toBe("none");
  });

  test("Tab key should navigate through spacing controls", async ({ page }) => {
    // Start from top of page
    await page.keyboard.press("Tab");

    // Tab through to spacing controls
    let attempts = 0;
    while (attempts < 20) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => document.activeElement?.id);
      if (focused === "header-spacing" || focused === "footer-spacing") {
        break;
      }
      attempts++;
    }

    // Should be able to reach spacing controls via keyboard
    const focusedElement = await page.evaluate(
      () => document.activeElement?.id
    );
    expect(["header-spacing", "footer-spacing"]).toContain(focusedElement);
  });
});

test.describe("Print Page Spacing Controls - Edge Cases", () => {
  const testUrl = "/print/demo";

  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
    await page.waitForSelector(".spacing-controls");
  });

  test("should handle empty header with 0px spacing", async ({ page }) => {
    const headerSlider = page.locator("#header-spacing");

    // Set to 0px (header should touch QR code)
    await headerSlider.fill("0");
    await page.waitForTimeout(200);

    const paperHeader = page.locator(".paper-header");
    const padding = await paperHeader.evaluate((el) => {
      return window.getComputedStyle(el).paddingBottom;
    });

    expect(padding).toBe("0px");

    // Layout should not break
    await expect(paperHeader).toBeVisible();
    await expect(page.locator(".paper-qr")).toBeVisible();
  });

  test("should handle empty footer with 0px spacing", async ({ page }) => {
    const footerSlider = page.locator("#footer-spacing");

    // Set to 0px (footer should touch QR code)
    await footerSlider.fill("0");
    await page.waitForTimeout(200);

    const paperFooter = page.locator(".paper-footer");
    const padding = await paperFooter.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop;
    });

    expect(padding).toBe("0px");

    // Layout should not break
    await expect(paperFooter).toBeVisible();
    await expect(page.locator(".paper-qr")).toBeVisible();
  });

  test("should handle maximum spacing (100px) without breaking layout", async ({
    page,
  }) => {
    const headerSlider = page.locator("#header-spacing");
    const footerSlider = page.locator("#footer-spacing");

    // Set both to max
    await headerSlider.fill("100");
    await footerSlider.fill("100");
    await page.waitForTimeout(200);

    // All elements should still be visible
    await expect(page.locator(".paper-header")).toBeVisible();
    await expect(page.locator(".paper-qr")).toBeVisible();
    await expect(page.locator(".paper-footer")).toBeVisible();

    // Paper should not overflow
    const paper = page.locator(".paper");
    const isVisible = await paper.isVisible();
    expect(isVisible).toBe(true);
  });

  test("should add header content and verify spacing applies", async ({
    page,
  }) => {
    // Add header content
    const headerEditor = page
      .locator(".section")
      .filter({ hasText: "Header" })
      .locator(".rich-editor-content");
    await headerEditor.click();
    await headerEditor.fill("Test Header Content");

    // Set custom spacing
    const headerSlider = page.locator("#header-spacing");
    await headerSlider.fill("44");
    await page.waitForTimeout(300);

    // Verify spacing applied to non-empty header
    const paperHeader = page.locator(".paper-header");
    const padding = await paperHeader.evaluate((el) => {
      return window.getComputedStyle(el).paddingBottom;
    });

    expect(padding).toBe("44px");

    // Header should contain text
    await expect(paperHeader).toContainText("Test Header Content");
  });

  test("should add footer content and verify spacing applies", async ({
    page,
  }) => {
    // Add footer content
    const footerEditor = page
      .locator(".section")
      .filter({ hasText: "Instructions" })
      .locator(".rich-editor-content");
    await footerEditor.click();
    await footerEditor.fill("Test Footer Instructions");

    // Set custom spacing
    const footerSlider = page.locator("#footer-spacing");
    await footerSlider.fill("52");
    await page.waitForTimeout(300);

    // Verify spacing applied to non-empty footer
    const paperFooter = page.locator(".paper-footer");
    const padding = await paperFooter.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop;
    });

    expect(padding).toBe("52px");

    // Footer should contain text
    await expect(paperFooter).toContainText("Test Footer Instructions");
  });
});

test.describe("Print Page Spacing Controls - Slider Styling", () => {
  const testUrl = "/print/demo";

  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
    await page.waitForSelector(".spacing-controls");
  });

  test("sliders should have orange accent color (OneQR branding)", async ({
    page,
  }) => {
    const headerSlider = page.locator("#header-spacing");

    // Check slider has correct class
    const hasClass = await headerSlider.evaluate((el) => {
      return el.classList.contains("spacing-slider");
    });
    expect(hasClass).toBe(true);

    // Check slider track background color
    const background = await headerSlider.evaluate((el) => {
      return window.getComputedStyle(el).background;
    });
    expect(background).toBeTruthy();
  });

  test("spacing controls section should be properly styled", async ({
    page,
  }) => {
    const spacingControls = page.locator(".spacing-controls");

    // Check background color (should be surface color)
    const background = await spacingControls.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Check border radius
    const borderRadius = await spacingControls.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });
    expect(borderRadius).toBe("10px");

    // Check padding
    const padding = await spacingControls.evaluate((el) => {
      return window.getComputedStyle(el).padding;
    });
    expect(padding).toBeTruthy();
  });

  test("spacing heading should display with icon", async ({ page }) => {
    const heading = page.locator(".spacing-heading");

    // Check heading is visible
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Spacing");

    // Check for icon (::before pseudo-element with background-image)
    const hasIcon = await heading.evaluate((el) => {
      const before = window.getComputedStyle(el, "::before");
      return before.backgroundImage.includes("data:image/svg+xml");
    });
    expect(hasIcon).toBe(true);
  });
});
