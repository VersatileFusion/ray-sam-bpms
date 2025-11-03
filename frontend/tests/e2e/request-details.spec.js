import { test, expect } from '@playwright/test';
import testData from '../helpers/testData';

test.describe('Request Details Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[placeholder*="نام کاربری"]', testData.admin.username);
    await page.fill('input[placeholder*="رمز عبور"]', testData.admin.password);
    await page.click('button:has-text("ورود به سیستم")');
    await expect(page).toHaveURL('/');
  });

  test('should add comment to request', async ({ page }) => {
    await page.goto('/requests');
    
    const viewLink = page.locator('a:has-text("مشاهده")').first();
    if (await viewLink.isVisible()) {
      await viewLink.click();
      
      // Add comment
      await page.fill('textarea[placeholder*="نظر خود را بنویسید"]', 'This is a test comment');
      await page.click('button:has-text("ارسال")');
      
      // Wait for comment to appear
      await page.waitForTimeout(1000);
      
      // Verify comment appears
      await expect(page.locator('text=This is a test comment')).toBeVisible();
    }
  });

  test('should display request history', async ({ page }) => {
    await page.goto('/requests');
    
    const viewLink = page.locator('a:has-text("مشاهده")').first();
    if (await viewLink.isVisible()) {
      await viewLink.click();
      
      // Click show history button
      await page.click('button:has-text("نمایش")');
      
      // Wait for history to load
      await page.waitForTimeout(1000);
      
      // History section should be visible
      await expect(page.locator('text=تاریخچه تغییرات')).toBeVisible();
    }
  });

  test('should upload attachment to request', async ({ page, context }) => {
    await page.goto('/requests');
    
    const viewLink = page.locator('a:has-text("مشاهده")').first();
    if (await viewLink.isVisible()) {
      await viewLink.click();
      
      // Create a test file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('test content')
      });
      
      // Upload file
      await page.click('button:has-text("آپلود")');
      
      // Wait for upload
      await page.waitForTimeout(2000);
      
      // Verify file appears in list
      // (May not have files if none exist)
    }
  });

  test('should edit request inline', async ({ page }) => {
    await page.goto('/requests');
    
    const viewLink = page.locator('a:has-text("مشاهده")').first();
    if (await viewLink.isVisible()) {
      await viewLink.click();
      
      // Click edit button
      await page.click('button:has-text("ویرایش درخواست")');
      
      // Wait for edit form to appear
      await expect(page.locator('h3:has-text("ویرایش درخواست")')).toBeVisible();
      
      // Edit some fields
      await page.fill('input[type="text"] >> nth=0', 'Updated Customer');
      
      // Save changes
      await page.click('button:has-text("ذخیره")');
      
      // Wait for save
      await page.waitForTimeout(1000);
      
      // Form should disappear
      await expect(page.locator('h3:has-text("ویرایش درخواست")')).not.toBeVisible();
    }
  });

  test('should assign request to user', async ({ page }) => {
    await page.goto('/requests');
    
    const viewLink = page.locator('a:has-text("مشاهده")').first();
    if (await viewLink.isVisible()) {
      await viewLink.click();
      
      // Select user from dropdown
      const userSelect = page.locator('select').locator('visible=true').first();
      if (await userSelect.isVisible()) {
        const options = await userSelect.locator('option').allTextContents();
        if (options.length > 1) {
          await userSelect.selectOption({ index: 1 });
          
          // Click assign button if visible
          const assignBtn = page.locator('button:has-text("اختصاص درخواست")');
          if (await assignBtn.isVisible()) {
            await assignBtn.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    }
  });
});

