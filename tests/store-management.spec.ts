import { test, expect } from '@playwright/test'

test.describe('Store Management', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests would need authentication setup
    // For now, focusing on UI component testing
    await page.goto('http://localhost:3002/dashboard')
  })

  test('store management section exists', async ({ page }) => {
    await expect(page.locator('text=店舗管理')).toBeVisible()
    await expect(page.locator('button:has-text("店舗を追加")')).toBeVisible()
  })

  test('add store form validation', async ({ page }) => {
    // Open add store form
    await page.click('button:has-text("店舗を追加")')
    
    // Submit empty form should show validation error
    await page.click('button:has-text("追加")')
    
    // Check for error message (using toast notification)
    await expect(page.locator('text=店舗名を入力してください')).toBeVisible()
  })

  test('add store form functionality', async ({ page }) => {
    await page.click('button:has-text("店舗を追加")')
    
    // Fill form
    await page.fill('input[placeholder*="イオン"]', 'テスト店舗')
    await page.fill('input[placeholder*="東京都"]', 'テスト住所')
    await page.fill('textarea[placeholder*="特徴"]', 'テストメモ')
    
    // Submit form
    await page.click('button:has-text("追加")')
    
    // Form should be hidden after submission (assuming success)
    await expect(page.locator('form')).not.toBeVisible()
  })

  test('store list display', async ({ page }) => {
    // Wait for stores to load
    await page.waitForSelector('[data-testid="store-list"], text=まだ店舗が登録されていません', { timeout: 5000 })
    
    // Check if either store list or empty state is shown
    const storeList = page.locator('[data-testid="store-list"]')
    const emptyState = page.locator('text=まだ店舗が登録されていません')
    
    await expect(storeList.or(emptyState)).toBeVisible()
  })
})