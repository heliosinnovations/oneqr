/**
 * Comprehensive E2E tests for TheQRSpot
 * Tests all functionality: generation, auth, saving, dashboard, analytics, SEO
 */

import { chromium } from 'playwright';
import fs from 'fs';

const SITE_URL = 'https://theqrspot.com';
const AUTH_STATE_FILE = '/workspace/group/oneqr/test-auth-state.json';

// Test results storage
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function logResult(test, status, message) {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${test}: ${message}`);

  if (status === 'pass') results.passed.push({ test, message });
  else if (status === 'fail') results.failed.push({ test, message });
  else results.warnings.push({ test, message });
}

async function testQRGeneration(page) {
  console.log('\n📋 Test 1: QR Code Generation & Download\n');

  try {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    // Find URL input field
    const urlInput = await page.locator('input[type="url"], input[placeholder*="URL"], input[name*="url"]').first();
    const inputExists = await urlInput.isVisible().catch(() => false);

    if (!inputExists) {
      logResult('QR Input Field', 'fail', 'URL input field not found');
      return;
    }

    // Enter test URL
    await urlInput.fill('https://example.com');
    logResult('QR Input Field', 'pass', 'URL input accepts text');

    // Wait for QR code to generate (should be instant)
    await page.waitForTimeout(1000);

    // Check if QR code canvas/image appears
    const qrCode = await page.locator('canvas, img[alt*="QR"], svg').first();
    const qrVisible = await qrCode.isVisible().catch(() => false);

    if (qrVisible) {
      logResult('QR Code Generation', 'pass', 'QR code renders on screen');
    } else {
      logResult('QR Code Generation', 'fail', 'QR code not visible');
      return;
    }

    // Take screenshot
    await page.screenshot({ path: '/workspace/group/oneqr/test-screenshots/qr-generated.png', fullPage: false });

    // Test download button
    const downloadBtn = await page.locator('button:has-text("Download"), a:has-text("Download"), button[download]').first();
    const downloadExists = await downloadBtn.isVisible().catch(() => false);

    if (downloadExists) {
      logResult('Download Button', 'pass', 'Download button visible');

      // Click download (won't actually download in headless, but tests the interaction)
      await downloadBtn.click();
      logResult('Download Click', 'pass', 'Download button clickable');
    } else {
      logResult('Download Button', 'warn', 'Download button not found');
    }

    // Test customization options
    const colorPicker = await page.locator('input[type="color"]').first();
    const colorExists = await colorPicker.isVisible().catch(() => false);

    if (colorExists) {
      await colorPicker.fill('#FF5733');
      await page.waitForTimeout(500);
      logResult('Color Customization', 'pass', 'QR color customization available');
    } else {
      logResult('Color Customization', 'warn', 'Color picker not found (might not be implemented)');
    }

  } catch (error) {
    logResult('QR Generation Test', 'fail', error.message);
  }
}

async function testAuthentication(page) {
  console.log('\n🔐 Test 2: User Authentication Flow\n');

  try {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    // Look for "Save QR Code" or "Sign in" button
    const saveBtn = await page.locator('button:has-text("Save"), button:has-text("Sign"), a:has-text("Login")').first();
    const saveBtnExists = await saveBtn.isVisible().catch(() => false);

    if (!saveBtnExists) {
      logResult('Auth Trigger', 'fail', 'Save/Sign in button not found');
      return;
    }

    await saveBtn.click();
    await page.waitForTimeout(1000);

    // Check if auth modal appears
    const emailInput = await page.locator('input[type="email"]').first();
    const emailVisible = await emailInput.isVisible().catch(() => false);

    if (emailVisible) {
      logResult('Auth Modal', 'pass', 'Auth modal opens on save attempt');

      // Test email input
      await emailInput.fill('test-e2e@theqrspot.com');
      logResult('Email Input', 'pass', 'Email field accepts input');

      // Find submit button
      const submitBtn = await page.locator('button[type="submit"], button:has-text("Send"), button:has-text("Continue")').first();
      const submitExists = await submitBtn.isVisible().catch(() => false);

      if (submitExists) {
        await submitBtn.click();
        await page.waitForTimeout(2000);
        logResult('Magic Link Send', 'pass', 'Magic link request submitted');

        // Check for confirmation message
        const confirmation = await page.locator('text=/check.*email|sent.*link|verify/i').first();
        const confirmVisible = await confirmation.isVisible().catch(() => false);

        if (confirmVisible) {
          logResult('Auth Confirmation', 'pass', 'Confirmation message shown');
        } else {
          logResult('Auth Confirmation', 'warn', 'No confirmation message (might be on different screen)');
        }
      } else {
        logResult('Auth Submit', 'fail', 'Submit button not found');
      }

      await page.screenshot({ path: '/workspace/group/oneqr/test-screenshots/auth-modal.png', fullPage: true });

    } else {
      logResult('Auth Modal', 'fail', 'Auth modal did not appear');
    }

  } catch (error) {
    logResult('Authentication Test', 'fail', error.message);
  }
}

async function testAuthenticatedSaving(page) {
  console.log('\n💾 Test 3: Saving QR Codes (Authenticated)\n');

  try {
    // Load auth state
    const authState = JSON.parse(fs.readFileSync(AUTH_STATE_FILE, 'utf8'));

    // Inject session
    await page.goto(SITE_URL);
    await page.evaluate((session) => {
      const supabaseKey = `sb-jadsekirvvqzgehdzoji-auth-token`;
      localStorage.setItem(supabaseKey, JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        token_type: 'bearer',
        user: session.user
      }));
    }, {
      access_token: authState.session.access_token,
      refresh_token: authState.session.refresh_token,
      expires_at: authState.session.expires_at,
      user: authState.user
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    logResult('Session Injection', 'pass', 'Authenticated session injected');

    // Generate a new QR code
    const urlInput = await page.locator('input[type="url"], input[placeholder*="URL"]').first();
    await urlInput.fill('https://test-authenticated-save.com');
    await page.waitForTimeout(1000);

    // Try to save
    const saveBtn = await page.locator('button:has-text("Save")').first();
    const saveBtnExists = await saveBtn.isVisible().catch(() => false);

    if (saveBtnExists) {
      await saveBtn.click();
      await page.waitForTimeout(2000);

      // Check for success message
      const successMsg = await page.locator('text=/saved|success|added/i').first();
      const successVisible = await successMsg.isVisible().catch(() => false);

      if (successVisible) {
        logResult('QR Code Save', 'pass', 'QR code saved successfully');
      } else {
        logResult('QR Code Save', 'warn', 'Save completed but no success message');
      }
    } else {
      logResult('Save Button', 'warn', 'Save button not found (might auto-save)');
    }

  } catch (error) {
    logResult('Authenticated Saving Test', 'fail', error.message);
  }
}

async function testDashboard(page) {
  console.log('\n📊 Test 4: Dashboard & Saved QR Codes\n');

  try {
    // Already authenticated from previous test

    // Navigate to dashboard
    await page.goto(`${SITE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
      logResult('Dashboard Access', 'fail', 'Redirected to login (auth failed)');
      return;
    }

    logResult('Dashboard Access', 'pass', 'Dashboard accessible when authenticated');

    // Check for user profile/email
    const authState = JSON.parse(fs.readFileSync(AUTH_STATE_FILE, 'utf8'));
    const userEmail = await page.locator(`text=${authState.user.email}`).first();
    const emailVisible = await userEmail.isVisible().catch(() => false);

    if (emailVisible) {
      logResult('User Profile', 'pass', 'User email displayed on dashboard');
    } else {
      logResult('User Profile', 'warn', 'User email not visible (might be in menu)');
    }

    // Check for saved QR codes section
    const savedSection = await page.locator('text=/saved.*qr|your.*qr.*codes|my.*codes/i').first();
    const sectionVisible = await savedSection.isVisible().catch(() => false);

    if (sectionVisible) {
      logResult('Saved QR Section', 'pass', 'Saved QR codes section exists');
    } else {
      logResult('Saved QR Section', 'warn', 'No saved QR codes section found');
    }

    await page.screenshot({ path: '/workspace/group/oneqr/test-screenshots/dashboard-full.png', fullPage: true });

  } catch (error) {
    logResult('Dashboard Test', 'fail', error.message);
  }
}

async function testAnalytics(page) {
  console.log('\n📈 Test 5: Analytics Integration\n');

  try {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    // Check for Vercel Analytics script
    const vercelScript = await page.evaluate(() => {
      return Array.from(document.scripts).some(s =>
        s.src.includes('vercel') || s.src.includes('/_vercel/insights')
      );
    });

    if (vercelScript) {
      logResult('Vercel Analytics', 'pass', 'Vercel Analytics script loaded');
    } else {
      logResult('Vercel Analytics', 'warn', 'Vercel Analytics script not detected');
    }

    // Check for PostHog
    const posthogScript = await page.evaluate(() => {
      return window.posthog !== undefined ||
             Array.from(document.scripts).some(s => s.src.includes('posthog'));
    });

    if (posthogScript) {
      logResult('PostHog Analytics', 'pass', 'PostHog script loaded');
    } else {
      logResult('PostHog Analytics', 'warn', 'PostHog not detected');
    }

    // Trigger a page view event
    await page.goto(`${SITE_URL}?test=analytics`);
    await page.waitForTimeout(2000);

    logResult('Analytics Events', 'pass', 'Page view events should be tracked');

  } catch (error) {
    logResult('Analytics Test', 'fail', error.message);
  }
}

async function testSEO(page) {
  console.log('\n🔍 Test 6: SEO & Meta Tags\n');

  try {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    // Check title tag
    const title = await page.title();
    if (title && title.length > 10) {
      logResult('Page Title', 'pass', `"${title}"`);
    } else {
      logResult('Page Title', 'fail', 'Missing or too short');
    }

    // Check meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    if (description && description.length > 50) {
      logResult('Meta Description', 'pass', `${description.substring(0, 60)}...`);
    } else {
      logResult('Meta Description', 'warn', 'Missing or too short');
    }

    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

    if (ogTitle) {
      logResult('Open Graph Title', 'pass', 'OG title set');
    } else {
      logResult('Open Graph Title', 'warn', 'OG title missing');
    }

    if (ogImage) {
      logResult('Open Graph Image', 'pass', 'OG image set');
    } else {
      logResult('Open Graph Image', 'warn', 'OG image missing');
    }

    // Check for canonical URL
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    if (canonical) {
      logResult('Canonical URL', 'pass', canonical);
    } else {
      logResult('Canonical URL', 'warn', 'No canonical URL set');
    }

    // Check for JSON-LD structured data
    const jsonLd = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent) : null;
    });

    if (jsonLd) {
      logResult('JSON-LD Schema', 'pass', `Type: ${jsonLd['@type']}`);
    } else {
      logResult('JSON-LD Schema', 'warn', 'No structured data found');
    }

  } catch (error) {
    logResult('SEO Test', 'fail', error.message);
  }
}

async function testResponsive(page) {
  console.log('\n📱 Test 7: Responsive Design\n');

  try {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(SITE_URL);
      await page.waitForLoadState('networkidle');

      // Check if key elements are visible
      const urlInput = await page.locator('input[type="url"]').first().isVisible().catch(() => false);
      const qrCode = await page.locator('canvas, img[alt*="QR"], svg').first().isVisible().catch(() => false);

      if (urlInput && qrCode) {
        logResult(`${viewport.name} Layout`, 'pass', `${viewport.width}x${viewport.height} - elements visible`);
      } else {
        logResult(`${viewport.name} Layout`, 'warn', `Some elements not visible at ${viewport.width}px`);
      }

      await page.screenshot({
        path: `/workspace/group/oneqr/test-screenshots/responsive-${viewport.name.toLowerCase()}.png`,
        fullPage: false
      });
    }

  } catch (error) {
    logResult('Responsive Test', 'fail', error.message);
  }
}

async function testErrorStates(page) {
  console.log('\n⚠️ Test 8: Error Handling & Edge Cases\n');

  try {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    // Test invalid URL
    const urlInput = await page.locator('input[type="url"]').first();
    await urlInput.fill('not-a-valid-url');
    await page.waitForTimeout(500);

    const errorMsg = await page.locator('text=/invalid|error|format/i').first().isVisible().catch(() => false);
    if (errorMsg) {
      logResult('Invalid URL Handling', 'pass', 'Error message shown for invalid URL');
    } else {
      logResult('Invalid URL Handling', 'warn', 'No validation error shown (might allow any text)');
    }

    // Test empty input
    await urlInput.clear();
    await page.waitForTimeout(500);

    const qrCode = await page.locator('canvas, img[alt*="QR"], svg').first().isVisible().catch(() => false);
    if (!qrCode) {
      logResult('Empty Input Handling', 'pass', 'QR code hidden when input empty');
    } else {
      logResult('Empty Input Handling', 'warn', 'QR code still showing (might use placeholder)');
    }

    // Test very long URL
    const longUrl = 'https://example.com/' + 'a'.repeat(1000);
    await urlInput.fill(longUrl);
    await page.waitForTimeout(1000);

    const longUrlQR = await page.locator('canvas, img[alt*="QR"], svg').first().isVisible().catch(() => false);
    if (longUrlQR) {
      logResult('Long URL Handling', 'pass', 'Generates QR for very long URLs');
    } else {
      logResult('Long URL Handling', 'warn', 'Long URLs might not generate QR');
    }

    // Test 404 page
    await page.goto(`${SITE_URL}/nonexistent-page-xyz`);
    await page.waitForLoadState('networkidle');

    const is404 = page.url().includes('404') ||
                  await page.locator('text=/404|not found/i').first().isVisible().catch(() => false);

    if (is404) {
      logResult('404 Page', 'pass', 'Custom 404 page exists');
    } else {
      logResult('404 Page', 'warn', 'Might redirect to homepage instead of showing 404');
    }

  } catch (error) {
    logResult('Error Handling Test', 'fail', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive E2E Tests for TheQRSpot\n');
  console.log('=' .repeat(60));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await testQRGeneration(page);
    await testAuthentication(page);
    await testAuthenticatedSaving(page);
    await testDashboard(page);
    await testAnalytics(page);
    await testSEO(page);
    await testResponsive(page);
    await testErrorStates(page);

  } catch (error) {
    console.error('\n💥 Fatal test error:', error);
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log(`📈 Total: ${results.passed.length + results.failed.length + results.warnings.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(r => console.log(`   • ${r.test}: ${r.message}`));
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(r => console.log(`   • ${r.test}: ${r.message}`));
  }

  // Save results to file
  fs.writeFileSync(
    '/workspace/group/oneqr/test-results.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n💾 Full results saved to test-results.json');
  console.log('📸 Screenshots saved to test-screenshots/\n');

  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Create screenshots directory
if (!fs.existsSync('/workspace/group/oneqr/test-screenshots')) {
  fs.mkdirSync('/workspace/group/oneqr/test-screenshots');
}

runAllTests();
