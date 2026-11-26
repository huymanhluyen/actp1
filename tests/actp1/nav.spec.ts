import { expect, test } from '@playwright/test';
import { BASE, MAIN_PAGES, Product, TEE, addToCart, cartCount, logout } from './helpers';

test.use({ baseURL: BASE });

const VIEWPORTS = [
  { id: 'NAV-TC017', name: 'mobile 375px', width: 375, height: 812 },
  { id: 'NAV-TC018', name: 'tablet 768px', width: 768, height: 1024 },
  { id: 'NAV-TC019', name: 'desktop 1920px', width: 1920, height: 1080 },
];

test('NAV-TC013 Số lượng trên icon Cart cập nhật sau khi thêm sản phẩm', async ({ page }) => {
  await addToCart(page, TEE, 1);
  expect(await cartCount(page)).toBe(1);
});

test('NAV-TC015 Các trang chính có title khác nhau', async ({ page }) => {
  const titles: string[] = [];
  for (const p of MAIN_PAGES) { await page.goto(p.path); titles.push(`${p.name}: ${await page.title()}`); }
  const only = titles.map((t) => t.split(': ').slice(1).join(': '));
  const dup = only.filter((t, i) => only.indexOf(t) !== i);
  expect(dup, `Title bị trùng:\n${titles.join('\n')}`).toEqual([]);
});

test('NAV-TC016 Có robots.txt và sitemap', async ({ request }) => {
  const bad: string[] = [];
  for (const p of ['/robots.txt', '/wp-sitemap.xml']) {
    const r = await request.get(p);
    if (r.status() !== 200) bad.push(`${p} → HTTP ${r.status()}`);
  }
  expect(bad, bad.join('\n')).toEqual([]);
});

for (const v of VIEWPORTS) {
  test(`${v.id} 6 trang chính không bị tràn ngang ở màn hình ${v.name}`, async ({ page }) => {
    await page.setViewportSize({ width: v.width, height: v.height });
    const bad: string[] = [];
    for (const p of MAIN_PAGES) {
      await page.goto(p.path);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 1) bad.push(`${p.name}: tràn ngang ${over}px`);
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });
}

test('NAV-TC020 Mobile có nút menu và mở được menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const toggle = page.locator('button.navbar-toggle:visible, button[aria-label*="menu" i]:visible, .menu-mobile-toggle:visible').first();
  await expect(toggle, 'Không thấy nút menu (hamburger) ở mobile').toBeVisible();
  await toggle.click();
  await expect(page.getByRole('link', { name: 'Blog', exact: true }).first()).toBeVisible();
});

test('NAV-TC021 Home, Shop, Product Detail, Blog tải xong trong 3 giây', async ({ page }) => {
  const bad: string[] = [];
  for (const p of MAIN_PAGES.filter((x) => ['Home', 'Shop', 'Product Detail', 'Blog'].includes(x.name))) {
    await page.goto(p.path);
    await page.waitForFunction(() => (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).loadEventEnd > 0);
    const ms = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming; return Math.round(n.loadEventEnd - n.startTime); });
    if (ms > 3000) bad.push(`${p.name}: ${ms}ms`);
  }
  expect(bad, bad.join('\n')).toEqual([]);
});

test('NAV-TC022 Các link nội bộ ở trang chủ không bị hỏng', async ({ page, request }) => {
  await page.goto('/');
  const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => (a as HTMLAnchorElement).href));
  const origin = new URL(BASE).origin;
  const links = Array.from(new Set(hrefs.map((h) => h.split('#')[0]).filter((h) => h.startsWith(origin) && !/add-to-cart|logout|wp-admin/.test(h)))).slice(0, 60);
  expect(links.length, 'Không tìm thấy link nội bộ').toBeGreaterThan(0);
  const bad: string[] = [];
  for (const l of links) {
    const r = await request.get(l);
    if (r.status() >= 400) bad.push(`${l} → HTTP ${r.status()}`);
  }
  expect(bad, bad.join('\n')).toEqual([]);
});
