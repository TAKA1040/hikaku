import { test, expect } from '@playwright/test'

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/dashboard')
  })

  test('product management section exists', async ({ page }) => {
    await expect(page.locator('text=商品管理')).toBeVisible()
    await expect(page.locator('button:has-text("商品を追加")')).toBeVisible()
  })

  test('add product form validation', async ({ page }) => {
    await page.click('button:has-text("商品を追加")')
    
    // Submit form without required fields
    await page.click('button:has-text("追加")')
    
    // Should show validation errors
    await expect(page.locator('text=店舗名を入力または選択してください')).toBeVisible()
  })

  test('add product form fields exist', async ({ page }) => {
    await page.click('button:has-text("商品を追加")')
    
    // Check form fields
    await expect(page.locator('input[placeholder*="イオン"]')).toBeVisible() // Store input
    await expect(page.locator('select')).toBeVisible() // Product type select
    await expect(page.locator('input[placeholder*="サランラップ"]')).toBeVisible() // Product name
    await expect(page.locator('input[placeholder="数量"]')).toBeVisible() // Quantity
    await expect(page.locator('input[placeholder="価格"]')).toBeVisible() // Price
  })

  test('quantity and price input validation', async ({ page }) => {
    await page.click('button:has-text("商品を追加")')
    
    // Fill with invalid values
    await page.fill('input[placeholder*="イオン"]', 'テスト店舗')
    await page.fill('input[placeholder="数量"]', '0')
    await page.fill('input[placeholder="価格"]', '0')
    
    await page.click('button:has-text("追加")')
    
    // Should show validation errors for zero values
    await expect(page.locator('text=数量は0より大きい値を入力してください')).toBeVisible()
  })

  test('unit price preview calculation', async ({ page }) => {
    await page.click('button:has-text("商品を追加")')
    
    // Fill valid values
    await page.fill('input[placeholder="数量"]', '10')
    await page.fill('input[placeholder="価格"]', '100')
    
    // Should show unit price preview
    await expect(page.locator('text=単価プレビュー')).toBeVisible()
    await expect(page.locator('text=10.00円')).toBeVisible()
  })

  test('product list display', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-list"], text=まだ商品が登録されていません', { timeout: 5000 })
    
    const productList = page.locator('[data-testid="product-list"]')
    const emptyState = page.locator('text=まだ商品が登録されていません')
    
    await expect(productList.or(emptyState)).toBeVisible()
  })
})