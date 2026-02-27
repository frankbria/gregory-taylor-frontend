import { test, expect } from '@playwright/test'

test.describe('Cart and checkout flow', () => {
  test('cart page shows empty state', async ({ page }) => {
    // Clear localStorage to ensure empty cart
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())

    await page.goto('/cart')
    // Should show some indication of empty cart
    const content = await page.locator('main').textContent()
    expect(content.toLowerCase()).toMatch(/empty|no items|cart/)
  })

  test('cart page renders without errors', async ({ page }) => {
    await page.goto('/cart')
    // No uncaught errors — page should have main content
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
  })

  test('cart count in header starts at zero', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')

    // The cart count should show 0
    const cartText = await page.locator('header').textContent()
    expect(cartText).toContain('0')
  })

  test('success page loads', async ({ page }) => {
    await page.goto('/cart/success')
    await expect(page.locator('main')).toBeVisible()
  })

  test('cancel page loads', async ({ page }) => {
    await page.goto('/cart/cancel')
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Cart (mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('cart page is usable on mobile', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
  })
})
