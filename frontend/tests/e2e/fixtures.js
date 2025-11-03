import { test as base } from '@playwright/test';
import testData from '../helpers/testData';

// Extend base test with fixtures
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await page.goto('/login');
    await page.fill('input[placeholder*="نام کاربری"]', testData.admin.username);
    await page.fill('input[placeholder*="رمز عبور"]', testData.admin.password);
    await page.click('button:has-text("ورود به سیستم")');
    await page.waitForURL('/');
    
    await use(page);
  },
  
  adminPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="نام کاربری"]', testData.admin.username);
    await page.fill('input[placeholder*="رمز عبور"]', testData.admin.password);
    await page.click('button:has-text("ورود به سیستم")');
    await page.waitForURL('/');
    
    await use(page);
  },
  
  customerPage: async ({ page }, use) => {
    await page.goto('/login');
    const customer = testData.getCustomer(0);
    await page.fill('input[placeholder*="نام کاربری"]', customer.username);
    await page.fill('input[placeholder*="رمز عبور"]', customer.password);
    await page.click('button:has-text("ورود به سیستم")');
    await page.waitForURL('/');
    
    await use(page);
  }
});

export { expect } from '@playwright/test';

