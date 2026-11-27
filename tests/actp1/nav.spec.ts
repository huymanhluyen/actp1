import { expect, test } from './fixtures';
import { BASE, MAIN_PAGES, Product, TEE, addToCart, cartCount, logout } from './helpers';
import { apiPre, autoPre, cartPost, runFlow, tcER } from './flow';

test.use({ baseURL: BASE });

const VIEWPORTS = [
  { id: 'NAV-TC017', name: 'mobile 375px', width: 375, height: 812 },
  { id: 'NAV-TC018', name: 'tablet 768px', width: 768, height: 1024 },
  { id: 'NAV-TC019', name: 'desktop 1920px', width: 1920, height: 1080 },
];

test('NAV-TC013 Số lượng trên icon Cart cập nhật sau khi thêm sản phẩm', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addToCart(page, TEE, 1)", async () => { await addToCart(page, TEE, 1); }],
    ],
    er: [
      [tcER(1, 1, "expect(await cartCount(page)).toBe(1)"), async () => { expect(await cartCount(page)).toBe(1); }],
    ],
    post: cartPost(page),
  });
});

test('NAV-TC015 Các trang chính có title khác nhau', async ({ page }) => {
  const titles: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở từng trang chính và ghi nhận title', async () => {
        for (const p of MAIN_PAGES) { await page.goto(p.path); titles.push(`${p.name}: ${await page.title()}`); }
      }],
    ],
    er: [
      [tcER(1, 1, 'Không có title bị trùng giữa các trang chính'), async () => {
        const only = titles.map((t) => t.split(': ').slice(1).join(': '));
        const dup = only.filter((t, i) => only.indexOf(t) !== i);
        expect(dup, `Title bị trùng:\n${titles.join('\n')}`).toEqual([]);
      }],
    ],
  });
});

test('NAV-TC016 Có robots.txt và sitemap', async ({ request }) => {
  const bad: string[] = [];
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ["Lặp: for (const p of ['/robots.txt', '/wp-sitemap.xml']) ", async () => { for (const p of ['/robots.txt', '/wp-sitemap.xml']) {
          const r = await request.get(p);
          if (r.status() !== 200) bad.push(`${p} → HTTP ${r.status()}`);
        } }],
    ],
    er: [
      [tcER(1, 1, "expect(bad, bad.join('\\n')).toEqual([])"), async () => { expect(bad, bad.join('\n')).toEqual([]); }],
    ],
  });
});

for (const v of VIEWPORTS) {
  test(`${v.id} 6 trang chính không bị tràn ngang ở màn hình ${v.name}`, async ({ page }) => {
    const bad: string[] = [];
    await runFlow({
      pre: autoPre(page),
      main: [
        [`Đặt viewport ${v.width}x${v.height} và kiểm tra 6 trang chính`, async () => {
          await page.setViewportSize({ width: v.width, height: v.height });
          for (const p of MAIN_PAGES) {
            await page.goto(p.path);
            const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            if (over > 1) bad.push(`${p.name}: tràn ngang ${over}px`);
          }
        }],
      ],
      er: [
        [tcER(1, 1, 'expect(bad).toEqual([])'), async () => { expect(bad, bad.join('\n')).toEqual([]); }],
      ],
    });
  });
}

test('NAV-TC020 Mobile có nút menu và mở được menu', async ({ page }) => {
  const toggle = page.locator('button.navbar-toggle:visible, button[aria-label*="menu" i]:visible, .menu-mobile-toggle:visible').first();
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Đổi kích thước màn hình { width: 375, height: 812 })", async () => { await page.setViewportSize({ width: 375, height: 812 }); }],
      ["Truy cập /", async () => { await page.goto('/'); }],
      ["Kiểm tra: expect(toggle, 'Không thấy nút menu (hamburger) ở mobile').…", async () => { await expect(toggle, 'Không thấy nút menu (hamburger) ở mobile').toBeVisible(); }],
      ["Click toggle", async () => { await toggle.click(); }],
    ],
    er: [
      [tcER(1, 1, "expect(page.getByRole('link', { name: 'Blog', exact: true }…"), async () => { await expect(page.getByRole('link', { name: 'Blog', exact: true }).first()).toBeVisible(); }],
    ],
  });
});

test('NAV-TC021 Home, Shop, Product Detail, Blog tải xong trong 3 giây', async ({ page }) => {
  const bad: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Lặp: for (const p of MAIN_PAGES.filter((x) => ['Home', 'Shop', '…", async () => { for (const p of MAIN_PAGES.filter((x) => ['Home', 'Shop', 'Product Detail', 'Blog'].includes(x.name))) {
          await page.goto(p.path);
          await page.waitForFunction(() => (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).loadEventEnd > 0);
          const ms = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming; return Math.round(n.loadEventEnd - n.startTime); });
          if (ms > 3000) bad.push(`${p.name}: ${ms}ms`);
        } }],
    ],
    er: [
      [tcER(1, 1, "expect(bad, bad.join('\\n')).toEqual([])"), async () => { expect(bad, bad.join('\n')).toEqual([]); }],
    ],
  });
});

test('NAV-TC022 Các link nội bộ ở trang chủ không bị hỏng', async ({ page, request }) => {
  const origin = new URL(BASE).origin;
  const bad: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Mở https://actp1.csc.edu.vn/", async () => { await page.goto('/'); }],
      ["Gửi request tới từng link nội bộ (tối đa 60)", async () => { const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => (a as HTMLAnchorElement).href));
      const links = Array.from(new Set(hrefs.map((h) => h.split('#')[0]).filter((h) => h.startsWith(origin) && !/add-to-cart|logout|wp-admin/.test(h)))).slice(0, 60);
      expect(links.length, 'Không tìm thấy link nội bộ').toBeGreaterThan(0);
      for (const l of links) {
          const r = await request.get(l);
          if (r.status() >= 400) bad.push(`${l} → HTTP ${r.status()}`);
        } }],
    ],
    er: [
      [tcER(1, 1, "expect(bad, bad.join('\\n')).toEqual([])"), async () => { expect(bad, bad.join('\n')).toEqual([]); }],
    ],
    post: cartPost(page),
  });
});

// ---------------------------------------------------------------- Chuyển từ Manual sang Automated
test('NAV-TC014 Mobile 375x812: menu hamburger mở/đóng được, đủ mục và link hoạt động', async ({ page }) => {
  const toggle = page.locator('button.navbar-toggle:visible, button[aria-label*="menu" i]:visible, .menu-mobile-toggle:visible').first();
  const link = (name: string) => page.getByRole('link', { name, exact: true }).locator('visible=true').first();
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Đặt viewport 375x812 và mở trang chủ', async () => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/');
      }],
      ['Mở menu hamburger và kiểm tra các mục chính', async () => {
        await expect(toggle, 'Không thấy nút hamburger').toBeVisible();
        await toggle.click();
        for (const name of ['Home', 'Shop', 'Blog', 'My account']) await expect(link(name), `Thiếu mục "${name}"`).toBeVisible();
      }],
      ['Click link Blog rồi quay lại trang trước', async () => {
        await link('Blog').click();
        await expect(page).toHaveURL(/\/blog\/?$/);
        await page.goBack();
      }],
      ['Mở lại menu rồi bấm đóng menu', async () => {
        await toggle.click();
        await expect(link('Blog')).toBeVisible();
        await page.getByRole('button', { name: /navigation menu/i }).last().click(); // đóng menu trong drawer
      }],
    ],
    er: [
      [tcER(1, 1, 'Menu đóng lại sau khi bấm toggle'), async () => {
        await expect(page.getByRole('navigation', { name: 'Primary Menu' }), 'Menu không đóng lại').toBeHidden();
        await expect(toggle).not.toHaveAttribute('aria-expanded', 'true');
      }],
    ],
  });
});
