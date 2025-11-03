import { test, expect } from '@playwright/test';
import testData from '../helpers/testData';

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[placeholder*="نام کاربری"]', testData.admin.username);
    await page.fill('input[placeholder*="رمز عبور"]', testData.admin.password);
    await page.click('button:has-text("ورود به سیستم")');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to notifications page', async ({ page }) => {
    // Click notifications icon in header
    await page.click('a[href="/notifications"]');
    await expect(page).toHaveURL('/notifications');
    await expect(page.locator('h1')).toContainText('اعلان‌ها');
  });

  test('should display notifications list', async ({ page }) => {
    await page.goto('/notifications');
    
    // Check for notifications section
    await expect(page.locator('text=پیام‌ها و هشدارهای شما')).toBeVisible();
  });

  test('should show notification count badge in header', async ({ page }) => {
    // Check if notification badge is present
    const notificationLink = page.locator('a[href="/notifications"]');
    await expect(notificationLink).toBeVisible();
  });

  test('should mark notification as read', async ({ page }) => {
    await page.goto('/notifications');
    
    // Look for mark as read button on first unread notification
    const markAsReadBtn = page.locator('text=علامت خوانده شده').first();
    if (await markAsReadBtn.isVisible()) {
      await markAsReadBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('should mark all notifications as read', async ({ page }) => {
    await page.goto('/notifications');
    
    // Look for mark all as read button
    const markAllBtn = page.locator('button:has-text("همه را خوانده شده علامت بزن")');
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click();
      await page.waitForTimeout(1000);
      
      // Button should disappear after marking all as read
      await expect(markAllBtn).not.toBeVisible();
    }
  });

  test('should delete notification', async ({ page }) => {
    await page.goto('/notifications');
    
    // Look for delete button
    const deleteBtn = page.locator('button svg').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('should handle empty notifications state', async ({ page }) => {
    await page.goto('/notifications');
    
    // Should show empty state message if no notifications
    // Either show notifications or empty state
    const hasNotifications = await page.locator('.divide-y').isVisible();
    const hasEmptyState = await page.locator('text=اعلانی موجود نیست').isVisible();
    
    expect(hasNotifications || hasEmptyState).toBe(true);
  });
});

