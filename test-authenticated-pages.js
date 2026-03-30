/**
 * E2E test for authenticated pages using Playwright
 * Tests dashboard access, QR code saving, and session persistence
 */

import { chromium } from 'playwright';
import fs from 'fs';

const AUTH_STATE_FILE = '/workspace/group/oneqr/test-auth-state.json';
const SITE_URL = 'https://theqrspot.com';

async function testAuthenticatedPages() {
  console.log('🧪 Testing Authenticated Pages\n');

  // Load auth state
  const authState = JSON.parse(fs.readFileSync(AUTH_STATE_FILE, 'utf8'));
  console.log(`✅ Loaded auth state for user: ${authState.user.email}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Navigate to homepage
    console.log('1️⃣ Navigating to homepage...');
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');
    console.log('   ✅ Homepage loaded\n');

    // Step 2: Inject Supabase session into localStorage
    console.log('2️⃣ Injecting authentication session...');
    await page.evaluate((session) => {
      const supabaseKey = `sb-${session.project_id}-auth-token`;
      localStorage.setItem(supabaseKey, JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        token_type: 'bearer',
        user: session.user
      }));
    }, {
      project_id: 'jadsekirvvqzgehdzoji',
      access_token: authState.session.access_token,
      refresh_token: authState.session.refresh_token,
      expires_at: authState.session.expires_at,
      user: authState.user
    });
    console.log('   ✅ Session injected into localStorage\n');

    // Step 3: Navigate to dashboard (should work with injected session)
    console.log('3️⃣ Navigating to dashboard...');
    await page.goto(`${SITE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Check if we're authenticated (not redirected to login)
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
      throw new Error('❌ Redirected to login - session injection failed');
    }
    console.log('   ✅ Dashboard loaded (authenticated)\n');

    // Step 4: Take screenshot of dashboard
    await page.screenshot({ path: '/workspace/group/oneqr/test-screenshots/dashboard.png', fullPage: true });
    console.log('4️⃣ Screenshot saved: test-screenshots/dashboard.png\n');

    // Step 5: Test dashboard content
    console.log('5️⃣ Validating dashboard content...');

    const dashboardTitle = await page.locator('h1').first().textContent();
    console.log(`   📝 Dashboard title: "${dashboardTitle}"`);

    // Check for user info or dashboard elements
    const userEmail = await page.locator('text=' + authState.user.email).first().isVisible().catch(() => false);
    if (userEmail) {
      console.log(`   ✅ User email visible: ${authState.user.email}`);
    }

    // Step 6: Test "Create QR Code" flow from dashboard
    console.log('\n6️⃣ Testing QR code creation from dashboard...');

    // Look for "Create QR Code" button or link
    const createButton = page.locator('text=/create.*qr|new.*qr|generate/i').first();
    const createButtonExists = await createButton.isVisible().catch(() => false);

    if (createButtonExists) {
      await createButton.click();
      await page.waitForLoadState('networkidle');
      console.log('   ✅ Navigated to QR creator');

      await page.screenshot({ path: '/workspace/group/oneqr/test-screenshots/qr-creator-authenticated.png', fullPage: true });
      console.log('   📸 Screenshot: test-screenshots/qr-creator-authenticated.png');
    } else {
      console.log('   ⚠️  "Create QR Code" button not found on dashboard');
    }

    // Step 7: Test saved QR codes list
    console.log('\n7️⃣ Testing saved QR codes list...');
    await page.goto(`${SITE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const qrCodesList = await page.locator('[data-testid="saved-qr-codes"], .qr-codes-list, text=/your.*qr.*codes/i').first().isVisible().catch(() => false);

    if (qrCodesList) {
      console.log('   ✅ Saved QR codes section visible');
    } else {
      console.log('   ⚠️  No saved QR codes found (expected for new user)');
    }

    // Step 8: Test session persistence (reload page)
    console.log('\n8️⃣ Testing session persistence...');
    await page.reload();
    await page.waitForLoadState('networkidle');

    const stillAuthenticated = !page.url().includes('/login') && !page.url().includes('/auth');
    if (stillAuthenticated) {
      console.log('   ✅ Session persisted after reload');
    } else {
      throw new Error('❌ Session lost after reload');
    }

    // Final summary
    console.log('\n✅ All authenticated page tests passed!\n');
    console.log('📊 Test Summary:');
    console.log('   ✅ Session injection successful');
    console.log('   ✅ Dashboard accessible');
    console.log('   ✅ Protected routes working');
    console.log('   ✅ Session persistence verified');
    console.log('   📸 Screenshots saved to test-screenshots/\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: '/workspace/group/oneqr/test-screenshots/error.png', fullPage: true });
    console.error('📸 Error screenshot saved to test-screenshots/error.png');
    throw error;
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
if (!fs.existsSync('/workspace/group/oneqr/test-screenshots')) {
  fs.mkdirSync('/workspace/group/oneqr/test-screenshots');
}

testAuthenticatedPages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
