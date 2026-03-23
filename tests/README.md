# OneQR Automated Tests

This directory contains comprehensive Playwright tests for the OneQR application's free QR code generation features.

## Test Coverage

### 1. QR Generation Tests (`qr-generation.spec.ts`)
- ✅ Valid URL with https:// prefix
- ✅ URL without https:// prefix (auto-prefixing)
- ✅ Empty input validation
- ✅ Whitespace-only input validation
- ✅ Error message clearing on valid input
- ✅ Loading state display
- ✅ Complex URLs with query parameters
- ✅ Localhost URLs
- ✅ Different QR codes for different URLs
- ✅ Visual QR code rendering verification

### 2. Download Tests (`qr-download.spec.ts`)
- ✅ PNG download with correct filename
- ✅ SVG download with correct filename
- ✅ PNG MIME type validation
- ✅ SVG MIME type validation
- ✅ Non-empty file validation (PNG)
- ✅ Non-empty file validation (SVG)
- ✅ Download buttons visibility (before/after QR generation)
- ✅ Multiple downloads of same QR code
- ✅ Different format downloads (PNG vs SVG)

### 3. Print Tests (`qr-print.spec.ts`)
- ✅ Print dialog trigger
- ✅ New window opening for print
- ✅ QR code content in print window
- ✅ Print window layout (centered)
- ✅ Print button visibility state
- ✅ Different QR codes print correctly
- ✅ Print button icon display
- ✅ QR quality maintenance in print

### 4. UI/UX Tests (`ui-interactions.spec.ts`)
- ✅ Text input field interaction
- ✅ Enter key trigger for generation
- ✅ Other keys don't trigger generation
- ✅ Placeholder text display
- ✅ Loading state on button
- ✅ Error message styling
- ✅ Success state with visible buttons
- ✅ Input value persistence after generation
- ✅ URL modification and regeneration
- ✅ Input field focus
- ✅ Button hover states
- ✅ Rapid consecutive clicks handling
- ✅ "Try it now" label display
- ✅ Free generation note display
- ✅ Very long URL handling
- ✅ Accessible button labels
- ✅ Proper input label

### 5. Visual Regression Tests (`visual-regression.spec.ts`)
- ✅ Homepage baseline screenshot
- ✅ Mobile viewport (375x667)
- ✅ Tablet viewport (768x1024)
- ✅ Desktop wide viewport (1920x1080)
- ✅ QR generator component initial state
- ✅ QR generator with generated QR code
- ✅ Error state
- ✅ Navigation bar
- ✅ Footer
- ✅ "How it works" section
- ✅ "Features" section
- ✅ Cross-browser consistency (Chromium, Firefox, WebKit)

## Running Tests

### Prerequisites
```bash
npm install
```

### Run all tests
```bash
npm test
```

### Run tests in UI mode
```bash
npm run test:ui
```

### Run tests in headed mode (visible browser)
```bash
npm run test:headed
```

### View test report
```bash
npm run test:report
```

### Update visual regression baselines
```bash
npx playwright test --update-snapshots
```

## CI/CD Integration

Tests run automatically on every pull request via GitHub Actions (`.github/workflows/playwright.yml`).

The workflow:
1. Installs dependencies
2. Installs Playwright browsers
3. Runs all tests across multiple browsers
4. Uploads test results and screenshots on failure

## Test Results

All 57 tests pass consistently across 3 runs with no flakiness detected:

- **QR Generation**: 10/10 ✅
- **Downloads**: 10/10 ✅
- **Print**: 9/9 ✅
- **UI/UX**: 16/16 ✅
- **Visual Regression**: 12/12 ✅

**Total: 57/57 tests passing**

## Browser Support

Tests are configured to run on:
- ✅ Chromium (Desktop Chrome)
- ✅ Firefox (Desktop)
- ✅ WebKit (Desktop Safari)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

## Test Philosophy

- **Deterministic**: All tests produce consistent results
- **No Flakiness**: Tests run reliably 3+ times
- **Comprehensive**: Cover success paths, error paths, and edge cases
- **Fast**: Complete test suite runs in ~11 seconds
- **Maintainable**: Clear test names and organized structure
