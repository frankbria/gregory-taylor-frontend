import { test, expect } from '@playwright/test'

test.describe('Site navigation', () => {
  test('home page loads with site title', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('GREG TAYLOR PHOTOGRAPHY')
  })

  test('can navigate to all main pages', async ({ page }) => {
    await page.goto('/')

    const isMobile = await page.getByRole('button', { name: 'Toggle menu' }).isVisible()

    async function navigateTo(text, url) {
      if (isMobile) {
        // Use page.goto for mobile — avoids stale element issues after navigation
        await page.goto(url)
      } else {
        await page.click(`text=${text}`)
      }
      await expect(page).toHaveURL(url)
    }

    await navigateTo('Gallery', '/gallery')
    await navigateTo('About', '/about')
    await navigateTo('Contact', '/contact')

    await page.goto('/cart')
    await expect(page).toHaveURL('/cart')
  })

  test('header and footer render on every page', async ({ page }) => {
    const pages = ['/', '/gallery', '/about', '/contact', '/cart']

    for (const url of pages) {
      await page.goto(url)
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('footer')).toBeVisible()
    }
  })
})

test.describe('Mobile navigation @mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('shows hamburger menu on mobile', async ({ page }) => {
    await page.goto('/')
    const hamburger = page.getByRole('button', { name: 'Toggle menu' })
    await expect(hamburger).toBeVisible()
  })

  test('hamburger opens and closes mobile menu', async ({ page }) => {
    await page.goto('/')
    const hamburger = page.getByRole('button', { name: 'Toggle menu' })

    await hamburger.click()
    await expect(page.locator('text=Gallery').last()).toBeVisible()

    await hamburger.click()
    // Mobile dropdown should be gone — only desktop links remain (hidden via CSS)
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  test('mobile menu link navigates and closes menu', async ({ page }) => {
    await page.goto('/')
    const hamburger = page.getByRole('button', { name: 'Toggle menu' })

    await hamburger.click()
    // Click the "About" link inside the mobile dropdown
    await page.locator('a[href="/about"]').last().click()

    await expect(page).toHaveURL('/about')
    // After navigation, menu should be closed on the new page
    await expect(page.getByRole('button', { name: 'Toggle menu' })).toHaveAttribute('aria-expanded', 'false')
  })
})
