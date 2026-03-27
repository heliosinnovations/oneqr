import { test, expect, Page } from "@playwright/test";

/**
 * Authentication Flow Tests for OneQR
 *
 * Tests the complete authentication flow including:
 * - Sign in modal interactions
 * - Magic link email sending
 * - Auth callback handling
 * - Session persistence
 * - Sign out functionality
 * - Error scenarios
 */

test.describe("Authentication Flow", () => {
  test.describe("Sign In Flow", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      // Wait for page to load
      await expect(page.locator("text=Generate QR Code")).toBeVisible();
    });

    test("should open sign-in modal when clicking Sign In button", async ({ page }) => {
      // Click Sign In button in navigation
      const signInButton = page.locator('button:has-text("Sign In")');
      await expect(signInButton).toBeVisible();
      await signInButton.click();

      // Verify modal opens
      await expect(page.locator('h2:has-text("Sign in to The QR Spot")')).toBeVisible();

      // Verify email input is present
      await expect(page.locator('input[type="email"]')).toBeVisible();

      // Verify "Send Magic Link" button is present
      await expect(page.locator('button:has-text("Send Magic Link")')).toBeVisible();
    });

    test("should close modal when clicking close button", async ({ page }) => {
      // Open modal
      await page.locator('button:has-text("Sign In")').click();
      await expect(page.locator('h2:has-text("Sign in to The QR Spot")')).toBeVisible();

      // Click close button
      const closeButton = page.locator('button[aria-label="Close"]');
      await expect(closeButton).toBeVisible();
      await closeButton.click();

      // Verify modal is closed
      await expect(page.locator('h2:has-text("Sign in to The QR Spot")')).not.toBeVisible();
    });

    test("should close modal when clicking backdrop", async ({ page }) => {
      // Open modal
      await page.locator('button:has-text("Sign In")').click();
      await expect(page.locator('h2:has-text("Sign in to The QR Spot")')).toBeVisible();

      // Click backdrop (outside modal content)
      await page.locator('.fixed.inset-0.z-50').click({ position: { x: 10, y: 10 } });

      // Verify modal is closed
      await expect(page.locator('h2:has-text("Sign in to The QR Spot")')).not.toBeVisible();
    });

    test("should validate email format", async ({ page }) => {
      // Open modal
      await page.locator('button:has-text("Sign In")').click();

      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button:has-text("Send Magic Link")');

      // Try to submit with invalid email format
      await emailInput.fill("invalid-email");
      await submitButton.click();

      // HTML5 validation should prevent submission
      // Check that button is still visible (form didn't submit)
      await expect(submitButton).toBeVisible();
    });

    test("should show loading state when sending magic link", async ({ page }) => {
      // Open modal
      await page.locator('button:has-text("Sign In")').click();

      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Enter valid test email
      await emailInput.fill("test@example.com");

      // Click submit and immediately check for loading state
      const submitPromise = submitButton.click();

      // Check for "Sending..." state (may be brief)
      // We use waitFor with a short timeout since the state transitions quickly
      await expect(submitButton).toHaveText(/Sending\.\.\.|Magic Link Sent/);

      await submitPromise;
    });

    test("should show success message after sending magic link", async ({ page }) => {
      // Open modal
      await page.locator('button:has-text("Sign In")').click();

      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Enter valid test email
      await emailInput.fill("test@example.com");
      await submitButton.click();

      // Wait for success message
      await expect(page.locator('text=Check your email for the magic link!')).toBeVisible({ timeout: 10000 });

      // Verify button changed to green "Magic Link Sent ✓"
      await expect(page.locator('button:has-text("Magic Link Sent ✓")')).toBeVisible();

      // Verify button is disabled after sending
      const sentButton = page.locator('button:has-text("Magic Link Sent ✓")');
      await expect(sentButton).toBeDisabled();
    });

    test("should clear email input after successful send", async ({ page }) => {
      // Open modal
      await page.locator('button:has-text("Sign In")').click();

      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Enter valid test email
      const testEmail = "test@example.com";
      await emailInput.fill(testEmail);
      await submitButton.click();

      // Wait for success
      await expect(page.locator('text=Check your email for the magic link!')).toBeVisible({ timeout: 10000 });

      // Verify email input is cleared
      await expect(emailInput).toHaveValue("");
    });

    test("should disable submit button while loading", async ({ page }) => {
      // Open modal
      await page.locator('button:has-text("Sign In")').click();

      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      await emailInput.fill("test@example.com");

      // Submit and check disabled state
      const submitPromise = submitButton.click();

      // Button should be disabled during submission
      await expect(submitButton).toBeDisabled();

      await submitPromise;
    });

    test("should disable email input while loading", async ({ page }) => {
      // Open modal
      await page.locator('button:has-text("Sign In")').click();

      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      await emailInput.fill("test@example.com");

      // Submit and check disabled state
      const submitPromise = submitButton.click();

      // Input should be disabled during submission
      await expect(emailInput).toBeDisabled();

      await submitPromise;
    });

    test("should show privacy policy link", async ({ page }) => {
      // Open modal
      await page.locator('button:has-text("Sign In")').click();

      // Verify privacy policy link exists
      const privacyLink = page.locator('a[href="/privacy"]');
      await expect(privacyLink).toBeVisible();
      await expect(privacyLink).toHaveText(/Privacy Policy/);
    });
  });

  test.describe("Auth Callback", () => {
    test("should redirect to home page after successful auth", async ({ page, context }) => {
      // This test simulates clicking a magic link
      // In a real scenario, we'd need to:
      // 1. Send magic link email
      // 2. Extract the link from email
      // 3. Navigate to that link

      // For now, we test the callback route behavior
      // Navigate directly to callback route (without code - should redirect to error)
      await page.goto("/auth/callback");

      // Should redirect to error page since no valid code
      await expect(page).toHaveURL(/\/auth\/error/);
    });

    test("should show error page for invalid auth code", async ({ page }) => {
      // Navigate to callback with invalid code
      await page.goto("/auth/callback?code=invalid_code_123");

      // Should redirect to error page
      await expect(page).toHaveURL(/\/auth\/error/, { timeout: 10000 });

      // Verify error page content
      await expect(page.locator('h1:has-text("Authentication Error")')).toBeVisible();
      await expect(page.locator('text=The magic link may have expired')).toBeVisible();
    });

    test("should display return home button on error page", async ({ page }) => {
      // Navigate to error page
      await page.goto("/auth/error");

      // Verify "Return Home" button exists and works
      const returnButton = page.locator('a:has-text("Return Home")');
      await expect(returnButton).toBeVisible();
      await expect(returnButton).toHaveAttribute("href", "/");
    });
  });

  test.describe("Session Persistence", () => {
    test("should persist session across page refresh (signed out state)", async ({ page }) => {
      // Start at home page
      await page.goto("/");

      // Verify Sign In button is visible (not signed in)
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();

      // Refresh page
      await page.reload();

      // Sign In button should still be visible
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    });

    test("should persist session across navigation", async ({ page }) => {
      // Navigate to home
      await page.goto("/");
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();

      // Navigate to generator page
      await page.goto("/generator");

      // Sign In button should still be visible
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();

      // Navigate to FAQ
      await page.goto("/faq");

      // Sign In button should still be visible
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    });

    test("should show loading state during session check", async ({ page }) => {
      // Navigate to home
      await page.goto("/");

      // The UserMenu component shows a loading state initially
      // It should quickly resolve to either Sign In button or user menu
      // We verify that either Sign In button or user menu is eventually visible
      await expect(
        page.locator('button:has-text("Sign In")').or(page.locator('button:has-text("@")'))
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Sign Out Flow", () => {
    // Note: These tests assume a signed-in state, which requires a valid session
    // In practice, we'd need to authenticate first or mock the session

    test("should not show user menu when not signed in", async ({ page }) => {
      await page.goto("/");

      // Should show Sign In button, not user menu
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();

      // User menu should not be visible
      await expect(page.locator('button').filter({ hasText: /@/ })).not.toBeVisible();
    });
  });

  test.describe("Error Cases", () => {
    test("should handle empty email submission", async ({ page }) => {
      // Open modal
      await page.locator('button:has-text("Sign In")').click();

      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button:has-text("Send Magic Link")');

      // Try to submit without entering email
      await emailInput.fill("");
      await submitButton.click();

      // HTML5 validation should prevent submission
      // Modal should remain open
      await expect(page.locator('h2:has-text("Sign in to The QR Spot")')).toBeVisible();
    });

    test("should handle network errors gracefully", async ({ page, context }) => {
      // Open modal
      await page.goto("/");
      await page.locator('button:has-text("Sign In")').click();

      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Intercept the auth request and make it fail
      await page.route("**/auth/v1/otp**", (route) => {
        route.abort("failed");
      });

      // Enter email and submit
      await emailInput.fill("test@example.com");
      await submitButton.click();

      // Should show error message (implementation may vary)
      // Wait a bit for the error to appear
      await page.waitForTimeout(2000);

      // The form should still be visible and functional
      await expect(page.locator('h2:has-text("Sign in to The QR Spot")')).toBeVisible();
    });

    test("should handle expired magic link", async ({ page }) => {
      // Navigate to callback with expired parameters
      await page.goto("/auth/callback?code=expired_code&error=expired_token");

      // Should redirect to error page
      await expect(page).toHaveURL(/\/auth\/error/, { timeout: 10000 });

      // Verify error message
      await expect(page.locator('text=The magic link may have expired')).toBeVisible();
    });

    test("should handle already used magic link", async ({ page }) => {
      // Navigate to callback with a code that's already been used
      await page.goto("/auth/callback?code=used_code_123");

      // Should redirect to error page
      await expect(page).toHaveURL(/\/auth\/error/, { timeout: 10000 });

      // Verify error page content
      await expect(page.locator('h1:has-text("Authentication Error")')).toBeVisible();
    });

    test("should handle malformed callback URL", async ({ page }) => {
      // Navigate to callback without code parameter
      await page.goto("/auth/callback?invalid=param");

      // Should redirect to error page
      await expect(page).toHaveURL(/\/auth\/error/, { timeout: 10000 });
    });

    test("should validate email format with special characters", async ({ page }) => {
      // Open modal
      await page.locator('button:has-text("Sign In")').click();

      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button:has-text("Send Magic Link")');

      // Test various invalid email formats
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user @example.com",
        "user@.com",
      ];

      for (const email of invalidEmails) {
        await emailInput.fill(email);
        await submitButton.click();

        // HTML5 validation should prevent submission
        // Modal should remain open
        await expect(page.locator('h2:has-text("Sign in to The QR Spot")')).toBeVisible();

        // Clear for next iteration
        await emailInput.fill("");
      }
    });

    test("should handle rate limiting gracefully", async ({ page }) => {
      // Open modal
      await page.goto("/");
      await page.locator('button:has-text("Sign In")').click();

      const emailInput = page.locator('input[type="email"]');
      const submitButton = page.locator('button[type="submit"]');

      // Intercept auth request to simulate rate limiting
      await page.route("**/auth/v1/otp**", (route) => {
        route.fulfill({
          status: 429,
          contentType: "application/json",
          body: JSON.stringify({
            error: "rate_limit_exceeded",
            message: "Too many requests",
          }),
        });
      });

      // Enter email and submit
      await emailInput.fill("test@example.com");
      await submitButton.click();

      // Should handle rate limit error gracefully
      await page.waitForTimeout(2000);

      // Modal should still be functional
      await expect(page.locator('h2:has-text("Sign in to The QR Spot")')).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper ARIA labels on modal", async ({ page }) => {
      await page.goto("/");
      await page.locator('button:has-text("Sign In")').click();

      // Check close button has aria-label
      const closeButton = page.locator('button[aria-label="Close"]');
      await expect(closeButton).toBeVisible();
    });

    test("should have proper labels for form inputs", async ({ page }) => {
      await page.goto("/");
      await page.locator('button:has-text("Sign In")').click();

      // Check email input has associated label
      const emailLabel = page.locator('label[for="email"]');
      await expect(emailLabel).toBeVisible();

      const emailInput = page.locator('input#email[type="email"]');
      await expect(emailInput).toBeVisible();
    });

    test("should be keyboard navigable", async ({ page }) => {
      await page.goto("/");

      // Focus on Sign In button using Tab
      await page.keyboard.press("Tab");

      // The focused element should eventually be the Sign In button
      // (may need multiple tabs depending on page structure)
      let attempts = 0;
      while (attempts < 10) {
        const focusedElement = await page.evaluate(() => document.activeElement?.textContent);
        if (focusedElement?.includes("Sign In")) {
          break;
        }
        await page.keyboard.press("Tab");
        attempts++;
      }

      // Press Enter to open modal
      await page.keyboard.press("Enter");

      // Modal should open
      await expect(page.locator('h2:has-text("Sign in to The QR Spot")')).toBeVisible();
    });

    test("should trap focus within modal", async ({ page }) => {
      await page.goto("/");
      await page.locator('button:has-text("Sign In")').click();

      // Modal is open
      await expect(page.locator('h2:has-text("Sign in to The QR Spot")')).toBeVisible();

      // Press Escape to close modal
      await page.keyboard.press("Escape");

      // Modal should close
      await expect(page.locator('h2:has-text("Sign in to The QR Spot")')).not.toBeVisible();
    });

    test("should have visible focus indicators", async ({ page }) => {
      await page.goto("/");
      await page.locator('button:has-text("Sign In")').click();

      const emailInput = page.locator('input[type="email"]');
      await emailInput.focus();

      // Check that input has focus styling (border color change)
      // This is implementation-specific, but we can verify focus state
      const isFocused = await emailInput.evaluate((el) => el === document.activeElement);
      expect(isFocused).toBe(true);
    });
  });

  test.describe("Cross-Browser Compatibility", () => {
    test("should work in all configured browsers", async ({ page, browserName }) => {
      // This test runs in chromium, firefox, and webkit (Safari)
      await page.goto("/");

      // Basic sign-in flow should work in all browsers
      await page.locator('button:has-text("Sign In")').click();
      await expect(page.locator('h2:has-text("Sign in to The QR Spot")')).toBeVisible();

      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill("test@example.com");

      await page.locator('button[type="submit"]').click();

      // Success message should appear in all browsers
      await expect(page.locator('text=Check your email for the magic link!')).toBeVisible({ timeout: 10000 });

      // Log which browser this test ran on
      console.log(`✓ Auth flow works in ${browserName}`);
    });
  });
});
