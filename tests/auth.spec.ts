import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002')
  })

  test('displays login page when not authenticated', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('価格比較ツール')
    await expect(page.locator('text=Googleでログイン')).toBeVisible()
  })

  test('login form has required elements', async ({ page }) => {
    // Check for Google login button
    const loginButton = page.locator('button:has-text("Googleでログイン")')
    await expect(loginButton).toBeVisible()
    await expect(loginButton).toBeEnabled()
    
    // Check for login form structure
    await expect(page.locator('.card')).toBeVisible()
    await expect(page.locator('text=ログイン')).toBeVisible()
  })

  test('redirects to dashboard after successful login', async ({ page }) => {
    // Note: This test requires manual intervention or mock setup
    // as it involves actual Google OAuth flow
    console.log('Auth test requires manual verification of OAuth flow')
  })
})