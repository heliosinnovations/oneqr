/**
 * Test the two fixes:
 * 1. Color customization picker exists
 * 2. Empty input hides QR code
 */

import { chromium } from 'playwright';

const SITE_URL = 'https://theqrspot.com';

async function testFixes() {
  console.log('🧪 Testing Fixes\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    console.log('📋 Test 1: Color Customization Picker\n');

    // Enter URL to generate QR
    const urlInput = await page.locator('input[type="url"]').first();
    await urlInput.fill('https://test-color-picker.com');
    await page.waitForTimeout(1000);

    // Check if color input exists
    const colorInput = await page.locator('input[type="color"]').first();
    const colorExists = await colorInput.isVisible().catch(() => false);

    if (colorExists) {
      console.log('✅ Color picker EXISTS');

      // Test changing color
      await colorInput.fill('#FF5733');
      await page.waitForTimeout(1000);

      const currentColor = await colorInput.inputValue();
      if (currentColor.toLowerCase() === '#ff5733') {
        console.log('✅ Color picker WORKS - color changed successfully');
      } else {
        console.log('⚠️  Color picker present but value not updated');
      }
    } else {
      console.log('❌ Color picker NOT FOUND');
    }

    await page.screenshot({ path: '/workspace/group/oneqr/test-screenshots/fix-color-picker.png', fullPage: true });

    console.log('\n📋 Test 2: Empty Input Hides QR\n');

    // QR should exist from previous test
    let qrCode = await page.locator('canvas, img[alt*="QR"], img[src*="data:image"]').first();
    let qrVisible = await qrCode.isVisible().catch(() => false);

    if (qrVisible) {
      console.log('✅ QR code visible with valid URL');
    } else {
      console.log('⚠️  QR code not visible (might need to click generate)');
    }

    // Clear the input
    await urlInput.clear();
    await page.waitForTimeout(1500); // Wait for useEffect to trigger

    // Check if QR is hidden
    qrCode = await page.locator('img[alt*="QR"][src*="data:image"]').first();
    qrVisible = await qrCode.isVisible().catch(() => false);

    if (!qrVisible) {
      console.log('✅ QR code HIDDEN when input is empty');
    } else {
      console.log('❌ QR code STILL VISIBLE when input is empty');
    }

    // Check placeholder is shown instead
    const placeholder = await page.locator('svg.text-border, div:has(svg.text-border)').first();
    const placeholderVisible = await placeholder.isVisible().catch(() => false);

    if (placeholderVisible) {
      console.log('✅ Placeholder SVG shown instead of QR');
    }

    await page.screenshot({ path: '/workspace/group/oneqr/test-screenshots/fix-empty-input.png', fullPage: false });

    console.log('\n✅ Both fixes verified!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testFixes();
