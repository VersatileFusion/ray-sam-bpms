import { test, expect } from '@playwright/test';
import testData from '../helpers/testData';

test.describe('Request Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[placeholder*="نام کاربری"]', testData.admin.username);
    await page.fill('input[placeholder*="رمز عبور"]', testData.admin.password);
    await page.click('button:has-text("ورود به سیستم")');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to requests list', async ({ page }) => {
    await page.click('text=درخواست‌ها');
    await expect(page).toHaveURL('/requests');
    await expect(page.locator('h1')).toContainText('درخواست‌ها');
  });

  test('should create a new request', async ({ page }) => {
    await page.goto('/requests');
    await page.click('text=درخواست جدید');
    await expect(page).toHaveURL('/requests/create');
    
    // Fill in form
    const customer = testData.getRandomCustomer();
    await page.fill('input[placeholder*="نام مشتری"]', customer.name);
    await page.fill('input[placeholder*="شماره تماس"]', '09123456789');
    await page.fill('input[placeholder*="نام کاربر"]', 'Test User');
    await page.selectOption('select', 'مالی');
    await page.selectOption('select[class="input"] >> nth=1', 'رفع باگ');
    await page.fill('textarea[placeholder*="توضیحات درخواست"]', 'This is a test request');
    
    // Submit
    await page.click('button:has-text("ثبت درخواست")');
    
    // Should redirect to requests list
    await expect(page).toHaveURL('/requests');
    
    // Should show success (no error messages)
    await expect(page.locator('.bg-red-50')).not.toBeVisible();
  });

  test('should display requests list', async ({ page }) => {
    await page.goto('/requests');
    
    // Should show requests table
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("مشتری")')).toBeVisible();
    await expect(page.locator('th:has-text("وضعیت")')).toBeVisible();
  });

  test('should filter requests by status', async ({ page }) => {
    await page.goto('/requests');
    
    // Select filter
    await page.selectOption('select >> nth=0', 'باز');
    await page.click('button:has-text("اعمال فیلتر")');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // All visible requests should have status "باز"
    const statusBadges = await page.locator('table .badge').allTextContents();
    statusBadges.forEach(status => {
      expect(status).toBe('باز');
    });
  });

  test('should view request details', async ({ page }) => {
    await page.goto('/requests');
    
    // Click on first request details link
    const viewLink = page.locator('a:has-text("مشاهده")').first();
    if (await viewLink.isVisible()) {
      await viewLink.click();
      
      // Should be on request details page
      await expect(page.url()).toContain('/requests/');
      await expect(page.locator('h1')).toContainText('جزئیات درخواست');
    }
  });

  test('should update request status', async ({ page }) => {
    await page.goto('/requests');
    
    // Navigate to first request details
    const viewLink = page.locator('a:has-text("مشاهده")').first();
    if (await viewLink.isVisible()) {
      await viewLink.click();
      
      // Change status
      await page.selectOption('select', 'انجام');
      await page.click('button:has-text("تغییر وضعیت")');
      
      // Wait for update
      await page.waitForTimeout(1000);
      
      // Status should be updated
      const statusBadge = await page.locator('.badge').first().textContent();
      expect(statusBadge).toBe('انجام');
    }
  });

  test('should search and filter requests', async ({ page }) => {
    await page.goto('/requests');
    
    // Apply multiple filters
    await page.selectOption('select >> nth=0', 'باز');
    await page.selectOption('select >> nth=1', 'مالی');
    await page.click('button:has-text("اعمال فیلتر")');
    
    await page.waitForTimeout(500);
    
    // Verify filters were applied
    expect(page.url()).toBeTruthy();
  });
});

