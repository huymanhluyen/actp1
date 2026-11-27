import { test as base, expect } from '@playwright/test';
import * as fs from 'fs';
import { AUTH_FILE, ensureAuth } from '../../global-setup';
import { apiClearCart } from './flow';
import { isGuest } from './guest';

const CART_FILES = /(cart|chk|pdp|nav)\.spec\.ts$/;
const test_step = (name: string, fn: () => Promise<void>) => base.step(name, fn);

export const test = base.extend({
  // Dùng lại storageState đã lưu (khách thì cookie rỗng)
  storageState: async ({}, use, testInfo) => {
    await use(isGuest(testInfo.title) ? { cookies: [], origins: [] } : AUTH_FILE);
  },
  // Trước MỖI test: kiểm tra phiên (chỉ đăng nhập lại nếu hết hạn/mất hiệu lực), mở trang chủ + refresh (F5), dọn giỏ nếu cần
  page: async ({ page, baseURL }, use, testInfo) => {
    const guest = isGuest(testInfo.title);
    await test_step('Refresh trang (F5) trước khi test', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      if (!guest) {
        const hasWelcome = await page.locator('header a[href*="/my-account/"]').filter({ hasText: /Welcome/i }).count();
        if (!hasWelcome) {
          const html = await (await page.request.get('/my-account/')).text();
          if (!/href="[^"]*customer-logout/i.test(html)) {
            await ensureAuth(baseURL ?? 'https://actp1.csc.edu.vn', true);
            const state = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
            await page.context().clearCookies();
            await page.context().addCookies(state.cookies ?? []);
          }
        }
      }
      await page.reload({ waitUntil: 'domcontentloaded' });
    });
    if (!guest && CART_FILES.test(testInfo.file)) await apiClearCart(page.request).catch(() => {});
    await use(page);
  },
});
export { expect };
