# Testing & Quality Issues - Frontend

> **Priority: P1-P2 - Establish quality gates**
>
> These issues improve test coverage, code quality, and development workflow.

---

## Issue: Fix test dependencies and verify tests run

**Labels:** `testing`, `critical`, `infrastructure`
**Priority:** P0
**Estimated Effort:** 1 hour

### Summary

Tests cannot run due to missing or outdated dependencies. Running `npm test` fails with "Cannot find module 'next/jest'".

### Current Error

```
Error: Cannot find module 'next/jest'
```

### Proposed Solution

```bash
# Install/update dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# Verify Next.js is installed
npm install next@latest

# Run tests
npm test
```

If issue persists, update jest.config.js:

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'app/**/*.{js,jsx}',
    'components/**/*.{js,jsx}',
    'lib/**/*.{js,jsx}',
    '!**/*.test.{js,jsx}',
    '!**/node_modules/**',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Acceptance Criteria

- [ ] `npm test` runs without errors
- [ ] All existing tests pass
- [ ] Coverage report generates successfully
- [ ] Tests run in CI/CD pipeline

### Testing

1. Run `npm test` → Tests execute
2. Run `npm run test:coverage` → Coverage report generated
3. Verify coverage thresholds enforced

---

## Issue: Add component tests for Header, Footer, PhotoSlider

**Labels:** `testing`, `components`
**Priority:** P1
**Estimated Effort:** 4 hours

### Summary

Reusable components have no tests. Need unit tests for Header, Footer, PhotoSlider, CloudinaryImage, and other shared components.

### Proposed Tests

**Header component tests:**

```javascript
// components/__tests__/Header.test.js
import { render, screen } from '@testing-library/react'
import Header from '../Header'
import { CartProvider } from '@/lib/CartContext'

jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>
})

describe('Header', () => {
  it('renders navigation links', () => {
    render(
      <CartProvider>
        <Header />
      </CartProvider>
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('displays cart count badge', () => {
    // Mock cart with items
    // Verify badge shows correct count
  })

  it('shows mobile menu on small screens', () => {
    // Test responsive behavior
  })
})
```

**PhotoSlider tests:**

```javascript
// components/__tests__/PhotoSlider.test.js
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PhotoSlider from '../PhotoSlider'

global.fetch = jest.fn()

describe('PhotoSlider', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('fetches and displays featured photos', async () => {
    const mockPhotos = [
      { _id: '1', imageUrl: 'photo1.jpg', title: 'Photo 1', featured: true },
      { _id: '2', imageUrl: 'photo2.jpg', title: 'Photo 2', featured: true },
    ]

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPhotos,
    })

    render(<PhotoSlider />)

    await waitFor(() => {
      expect(screen.getByAltText('Photo 1')).toBeInTheDocument()
    })
  })

  it('auto-rotates slides every 5 seconds', async () => {
    jest.useFakeTimers()
    // Test auto-rotation logic
    jest.useRealTimers()
  })

  it('navigates to next/previous slide on button click', async () => {
    const user = userEvent.setup()
    // Test navigation buttons
  })

  it('handles API errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'))
    render(<PhotoSlider />)
    await waitFor(() => {
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })
})
```

### Acceptance Criteria

- [ ] Header tests cover navigation, cart badge, mobile menu
- [ ] Footer tests cover social links, bio
- [ ] PhotoSlider tests cover fetching, auto-rotation, navigation
- [ ] CloudinaryImage tests cover loading, error handling
- [ ] All component tests achieve >80% coverage

---

## Issue: Add integration tests for checkout flow

**Labels:** `testing`, `integration`, `critical`
**Priority:** P1
**Estimated Effort:** 5 hours

### Summary

The critical checkout flow (add to cart → checkout → Stripe redirect) has no end-to-end tests. Need integration tests to ensure this workflow doesn't break.

### Proposed Tests

```javascript
// __tests__/integration/checkout-flow.test.js
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartPage from '@/app/cart/page'
import { CartProvider } from '@/lib/CartContext'

global.fetch = jest.fn()

describe('Checkout Flow Integration', () => {
  beforeEach(() => {
    fetch.mockClear()
    localStorage.clear()
  })

  it('completes full checkout flow', async () => {
    const user = userEvent.setup()

    // Mock cart with items
    const mockCart = [
      {
        productId: '123',
        title: 'Test Photo',
        imageUrl: 'photo.jpg',
        size: 'Large',
        frame: 'Black',
        format: 'Canvas',
        unitPrice: 50000, // $500
        quantity: 1,
      },
    ]

    localStorage.setItem('cart', JSON.stringify(mockCart))
    localStorage.setItem('userId', 'test-user-123')

    // Mock successful checkout API
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessionId: 'test-session-id' }),
    })

    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    )

    // Verify cart items displayed
    expect(screen.getByText('Test Photo')).toBeInTheDocument()
    expect(screen.getByText(/\$500/)).toBeInTheDocument()

    // Click checkout
    const checkoutButton = screen.getByText('Proceed to Checkout')
    await user.click(checkoutButton)

    // Verify API called with correct data
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/checkout'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test-user-123'),
        })
      )
    })

    // Verify Stripe redirect triggered
    // (Mock window.location or stripe.redirectToCheckout)
  })

  it('handles checkout failure gracefully', async () => {
    // Test error scenarios
  })

  it('recalculates prices when cart updated', async () => {
    // Test price updates
  })
})
```

### Acceptance Criteria

- [ ] Test covers full checkout flow (cart → API → Stripe)
- [ ] Test verifies correct data sent to backend
- [ ] Test handles error scenarios (API failure, Stripe failure)
- [ ] Test validates price calculations
- [ ] Test checks cart state updates

---

## Issue: Set up Playwright for E2E tests

**Labels:** `testing`, `e2e`, `infrastructure`
**Priority:** P2
**Estimated Effort:** 6 hours

### Summary

No end-to-end tests exist despite Playwright being mentioned in CLAUDE.md. Need to set up Playwright and create critical user journey tests.

### Proposed Setup

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Create Playwright config:**

```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './__e2e__',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Create E2E tests:**

```javascript
// __e2e__/checkout.spec.js
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('user can browse, add to cart, and checkout', async ({ page }) => {
    // Navigate to gallery
    await page.goto('/')
    await page.click('text=Gallery')

    // Click on a photo
    await page.click('img[alt*="photo"]').first()

    // Select options
    await page.selectOption('select[name="size"]', 'Large')
    await page.selectOption('select[name="frame"]', 'Black')
    await page.selectOption('select[name="format"]', 'Canvas')

    // Add to cart
    await page.click('button:has-text("Add to Cart")')

    // Verify cart badge updated
    await expect(page.locator('[aria-label="Cart items"]')).toContainText('1')

    // Go to cart
    await page.click('a[href="/cart"]')

    // Verify item in cart
    await expect(page.locator('text=Large')).toBeVisible()

    // Proceed to checkout
    await page.click('button:has-text("Proceed to Checkout")')

    // Should redirect to Stripe (or mock Stripe page)
    // Verify URL contains stripe.com or checkout session
  })

  test('contact form submission', async ({ page }) => {
    await page.goto('/contact')

    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('textarea[name="message"]', 'Test message')
    await page.fill('input[name="photographyAnswer"]', 'aperture')

    // Fill reCAPTCHA (or mock in test environment)

    await page.click('button[type="submit"]')

    // Verify success message
    await expect(page.locator('text=Message sent successfully')).toBeVisible()
  })
})
```

### Acceptance Criteria

- [ ] Playwright installed and configured
- [ ] E2E tests for checkout flow
- [ ] E2E tests for contact form
- [ ] E2E tests for photo browsing
- [ ] Tests run on desktop and mobile viewports
- [ ] CI integration configured

---

## Issue: Add code quality tools (ESLint, Prettier)

**Labels:** `quality`, `tooling`
**Priority:** P2
**Estimated Effort:** 2 hours

### Summary

Code formatting is inconsistent. Need ESLint and Prettier configured with appropriate rules for Next.js/React.

### Proposed Setup

```bash
npm install --save-dev eslint-config-prettier prettier
```

**`.eslintrc.json`:**
```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error"
  }
}
```

**`.prettierrc`:**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Add scripts:**
```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{js,jsx,json,md}\""
  }
}
```

### Acceptance Criteria

- [ ] ESLint configured with Next.js rules
- [ ] Prettier configured for consistent formatting
- [ ] Pre-commit hook runs linting (optional)
- [ ] All files formatted consistently
- [ ] No console.logs in production code (except error/warn)

---

## Summary Table

| Issue | Priority | Estimated Effort |
|-------|----------|------------------|
| Fix test dependencies | P0 | 1 hour |
| Component tests | P1 | 4 hours |
| Integration tests | P1 | 5 hours |
| Playwright E2E setup | P2 | 6 hours |
| Code quality tools | P2 | 2 hours |

**Total estimated effort:** ~18 hours (2-3 days)
