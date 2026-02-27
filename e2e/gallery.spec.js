import { test, expect } from '@playwright/test'

test.describe('Photo browsing', () => {
  test('gallery page loads', async ({ page }) => {
    await page.goto('/gallery')
    await expect(page).toHaveURL('/gallery')
    await expect(page.locator('header')).toBeVisible()
  })

  test('gallery shows categories or empty state', async ({ page }) => {
    await page.goto('/gallery')
    // Either category links load from the backend, or empty state shows
    // Wait for content to settle
    await page.waitForLoadState('networkidle')

    const hasCategories = await page.locator('a[href^="/gallery/"]').count() > 0
    const hasContent = await page.locator('main').textContent()

    // Page should have rendered something meaningful
    expect(hasCategories || hasContent.length > 0).toBe(true)
  })

  test('clicking a category navigates to category page', async ({ page }) => {
    await page.goto('/gallery')
    await page.waitForLoadState('networkidle')

    const categoryLink = page.locator('a[href^="/gallery/"]').first()
    const hasCategories = await categoryLink.count() > 0

    if (hasCategories) {
      const href = await categoryLink.getAttribute('href')
      await categoryLink.click()
      await expect(page).toHaveURL(href)
    }
  })
})

test.describe('Photo browsing (mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('gallery page is usable on mobile', async ({ page }) => {
    await page.goto('/gallery')
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()

    // No horizontal scroll
    const body = page.locator('body')
    const scrollWidth = await body.evaluate((el) => el.scrollWidth)
    const clientWidth = await body.evaluate((el) => el.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // 1px tolerance
  })
})
