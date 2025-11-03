import { test, expect } from '@playwright/test';
import testData from '../helpers/testData';

test.describe('Authentication Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[placeholder*="نام کاربری"]', testData.admin.username);
    await page.fill('input[placeholder*="رمز عبور"]', testData.admin.password);
    await page.click('button:has-text("ورود به سیستم")');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('داشبورد');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[placeholder*="نام کاربری"]', 'invaliduser');
    await page.fill('input[placeholder*="رمز عبور"]', 'wrongpassword');
    await page.click('button:has-text("ورود به سیستم")');
    
    // Should show error message
    await expect(page.locator('.bg-red-500')).toBeVisible();
    await expect(page.locator('text=نام کاربری یا رمز عبور اشتباه است')).toBeVisible();
  });

  test('should persist session after page reload', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="نام کاربری"]', testData.admin.username);
    await page.fill('input[placeholder*="رمز عبور"]', testData.admin.password);
    await page.click('button:has-text("ورود به سیستم")');
    
    await expect(page).toHaveURL('/');
    
    // Reload page
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('داشبورد');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[placeholder*="نام کاربری"]', testData.admin.username);
    await page.fill('input[placeholder*="رمز عبور"]', testData.admin.password);
    await page.click('button:has-text("ورود به سیستم")');
    
    await expect(page).toHaveURL('/');
    
    // Click on user menu and logout
    await page.click('button[class*="rounded-full"]');
    await page.click('text=خروج');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    
    // Try to access dashboard directly
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to dashboard if already logged in', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[placeholder*="نام کاربری"]', testData.admin.username);
    await page.fill('input[placeholder*="رمز عبور"]', testData.admin.password);
    await page.click('button:has-text("ورود به سیستم")');
    
    // Try to access login page again
    await page.goto('/login');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});

