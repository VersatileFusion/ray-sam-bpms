import { test, expect } from '@playwright/test';
import testData from '../helpers/testData';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[placeholder*="نام کاربری"]', testData.admin.username);
    await page.fill('input[placeholder*="رمز عبور"]', testData.admin.password);
    await page.click('button:has-text("ورود به سیستم")');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to user management', async ({ page }) => {
    await page.click('text=مدیریت کاربران');
    await expect(page).toHaveURL('/admin/users');
    await expect(page.locator('h1')).toContainText('مدیریت کاربران');
  });

  test('should display users list', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Should show users table
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("نام")')).toBeVisible();
    await expect(page.locator('th:has-text("نقش")')).toBeVisible();
  });

  test('should create new user', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Click create button
    await page.click('text=کاربر جدید');
    
    // Fill form
    await page.fill('input[type="text"]', 'Test User');
    await page.fill('input[type="text"] >> nth=1', 'testuser123');
    await page.fill('input[type="password"]', 'password123');
    await page.selectOption('select', 'user');
    
    // Submit
    await page.click('button:has-text("ایجاد کاربر")');
    
    // Wait for modal to close
    await page.waitForTimeout(1000);
    
    // Verify no error messages
    await expect(page.locator('.bg-red-50')).not.toBeVisible();
  });

  test('should display user roles correctly', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Should have user rows
    const userRows = await page.locator('tbody tr').count();
    expect(userRows).toBeGreaterThan(0);
  });

  test('should prevent non-admin access', async ({ page }) => {
    // First logout
    await page.click('button[class*="rounded-full"]');
    await page.click('text=خروج');
    
    // Try to access user management as regular user
    const regularUser = testData.getUser(0);
    await page.goto('/login');
    await page.fill('input[placeholder*="نام کاربری"]', regularUser.username);
    await page.fill('input[placeholder*="رمز عبور"]', regularUser.password);
    await page.click('button:has-text("ورود به سیستم")');
    
    // Try to navigate to admin/users
    await page.goto('/admin/users');
    
    // Should redirect to dashboard or show no access
    expect(page.url().includes('/admin/users')).toBe(false);
  });

  test('should display user table columns', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Check table headers
    await expect(page.locator('th:has-text("نام")')).toBeVisible();
    await expect(page.locator('th:has-text("نام کاربری")')).toBeVisible();
    await expect(page.locator('th:has-text("نقش")')).toBeVisible();
    await expect(page.locator('th:has-text("وضعیت")')).toBeVisible();
    await expect(page.locator('th:has-text("آخرین ورود")')).toBeVisible();
    await expect(page.locator('th:has-text("عملیات")')).toBeVisible();
  });
});

