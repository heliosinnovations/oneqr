# OneQR Test Suite

Comprehensive end-to-end tests for The QR Spot using Playwright.

## Test Coverage

### Authentication Flow (`auth-flow.spec.ts`)
Complete authentication testing including:

#### Sign In Flow (12 tests)
- ✅ Modal opening and closing (button, X, backdrop)
- ✅ Email input validation (format, empty, special characters)
- ✅ Magic link sending states (loading, success, disabled)
- ✅ Email clearing after success
- ✅ Privacy policy link
- ✅ Form disabling during submission

#### Auth Callback (3 tests)
- ✅ Successful authentication redirect
- ✅ Invalid/expired magic link handling
- ✅ Error page display with return home button

#### Session Persistence (3 tests)
- ✅ Session state across page refresh
- ✅ Session state across navigation
- ✅ Loading state during session check

#### Sign Out Flow (1 test)
- ✅ Unauthenticated state verification

#### Error Cases (8 tests)
- ✅ Empty email submission
- ✅ Network error handling
- ✅ Expired magic link
- ✅ Already used magic link
- ✅ Malformed callback URL
- ✅ Invalid email formats
- ✅ Rate limiting

#### Accessibility (5 tests)
- ✅ ARIA labels on modal and buttons
- ✅ Form input labels
- ✅ Keyboard navigation
- ✅ Focus trap and Escape key
- ✅ Visible focus indicators

#### Cross-Browser (1 test)
- ✅ Chrome, Firefox, Safari (webkit) compatibility

**Total: 33 comprehensive authentication tests**

## Running Tests

### Prerequisites
```bash
npm install
npx playwright install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npx playwright test tests/auth-flow.spec.ts
```

### Run Against Production
```bash
TEST_URL=https://theqrspot.com npm test
```

## Known Limitations

### Email Testing
Real magic link emails require live email service integration.
Current tests verify UI flow and callback behavior.
