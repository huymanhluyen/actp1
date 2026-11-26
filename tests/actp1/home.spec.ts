import { expect, test } from '@playwright/test';
import { BASE, Product, WIDGET_COUNTS, imagesWithoutAlt, noFollow, scrollToBottom } from './helpers';

test.use({ baseURL: BASE });

test('HOME-TC013 Widget Product categories hiển thị đúng số lượng từng danh mục', async ({ page }) => {
  await page.goto('/');
  const widget = (await page.locator('.widget_product_categories').allInnerTexts()).join('\n').replace(/\s+/g, ' ');
  for (const [label, count] of Object.entries(WIDGET_COUNTS))
    expect(widget, `${label} phải là (${count})`).toMatch(new RegExp(`${label}\\s*\\(${count}\\)`));
});

test('HOME-TC015 Không có ảnh hoặc link bị hỏng trên trang chủ', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  const broken = await page.evaluate(() =>
    Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0 && i.src).map((i) => i.src));
  expect(broken, `Ảnh lỗi: ${broken}`).toEqual([]);
  const hrefs: string[] = await page.evaluate(() =>
    Array.from(new Set(Array.from(document.querySelectorAll('a[href]')).map((a) => (a as HTMLAnchorElement).href))));
  const internal = hrefs.filter((h) => h.startsWith('https://actp1.csc.edu.vn') && !h.includes('#')).slice(0, 40);
  const bad: string[] = [];
  for (const h of internal) if ((await page.request.get(h)).status() >= 400) bad.push(h);
  expect(bad, `Link lỗi: ${bad}`).toEqual([]);
});

test('HOME-TC018 Truy cập bằng HTTP tự chuyển sang HTTPS', async ({ request }) => {
  const r = await request.get(BASE.replace('https://', 'http://') + '/', noFollow);
  expect([301, 302, 307, 308], `HTTP trả ${r.status()}`).toContain(r.status());
  expect(r.headers()['location'] ?? '').toMatch(/^https:\/\//);
});

test('HOME-TC019 Response trang chủ có header Strict-Transport-Security (HSTS)', async ({ request }) => {
  const h = (await request.get('/')).headers();
  expect(h['strict-transport-security'], 'Thiếu header Strict-Transport-Security').toBeTruthy();
});

test('HOME-TC020 Response trang chủ có header X-Content-Type-Options: nosniff', async ({ request }) => {
  const h = (await request.get('/')).headers();
  expect(h['x-content-type-options'], 'Thiếu header X-Content-Type-Options').toMatch(/nosniff/i);
});

test('HOME-TC021 Response trang chủ có X-Frame-Options hoặc CSP frame-ancestors', async ({ request }) => {
  const h = (await request.get('/')).headers();
  const ok = !!h['x-frame-options'] || /frame-ancestors/i.test(h['content-security-policy'] ?? '');
  expect(ok, 'Thiếu X-Frame-Options và CSP frame-ancestors').toBe(true);
});

// Bảng dữ liệu SHOP, bảo mật, accessibility, hiệu năng, SEO, responsive (HOME / NAV / SHOP / PDP)
test('HOME-TC022 /readme.html không truy cập được công khai', async ({ request }) => {
  const r = await request.get('/readme.html', noFollow);
  expect([403, 404], `/readme.html trả HTTP ${r.status()}`).toContain(r.status());
});

test('HOME-TC023 Trang chủ không có thẻ meta generator lộ phiên bản WordPress', async ({ request }) => {
  const html = await (await request.get('/')).text();
  const found = html.match(/<meta[^>]+name=["']generator["'][^>]*>/gi) ?? [];
  expect(found, `Tìm thấy ${found.length} thẻ meta generator: ${found.join(' | ')}`).toEqual([]);
});

test('HOME-TC024 /wp-content/uploads/ không bật liệt kê thư mục', async ({ request }) => {
  const r = await request.get('/wp-content/uploads/');
  expect(await r.text()).not.toMatch(/Index of/i);
});

test('HOME-TC025 Các file nhạy cảm không truy cập được', async ({ request }) => {
  const paths = ['/.env', '/.git/config', '/wp-config.php.bak', '/debug.log', '/wp-content/debug.log'];
  const bad: string[] = [];
  for (const p of paths) {
    const r = await request.get(p);
    if (![403, 404].includes(r.status())) bad.push(`${p} → HTTP ${r.status()}`);
  }
  expect(bad, bad.join('\n')).toEqual([]);
});

test('HOME-TC026 Tất cả ảnh trên trang chủ có alt text', async ({ page }) => {
  await page.goto('/');
  const bad = await imagesWithoutAlt(page);
  expect(bad, `${bad.length} ảnh thiếu alt:\n${bad.join('\n')}`).toEqual([]);
});

test('HOME-TC027 Mọi link/button hiển thị ở trang chủ đều có tên truy cập', async ({ page }) => {
  await page.goto('/');
  const unnamed = await page.$$eval('a, button', (els) =>
    els
      .filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; })
      .filter((e) => !(e.textContent ?? '').trim() && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby') && !e.getAttribute('title')
        && !e.querySelector('img[alt]:not([alt=""])') && !e.querySelector('svg title'))
      .map((e) => e.outerHTML.slice(0, 120)));
  expect(unnamed, `${unnamed.length} phần tử không có tên:\n${unnamed.join('\n')}`).toEqual([]);
});

test('HOME-TC028 Thẻ html có thuộc tính lang', async ({ page }) => {
  await page.goto('/');
  expect(((await page.locator('html').getAttribute('lang')) ?? '').trim(), 'Thẻ html thiếu lang').not.toBe('');
});

test('HOME-TC029 Nhấn Tab ở trang chủ đưa focus vào phần tử tương tác đầu tiên', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const tag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase() ?? '');
  expect(['a', 'button', 'input', 'select', 'textarea'], `Focus đang ở <${tag}>`).toContain(tag);
});

test('HOME-TC033 Sản phẩm chưa có đánh giá không hiển thị trong widget Top rated products', async ({ page }) => {
  await page.goto('/');
  const topRated = page.locator('.widget_top_rated_products, [class*="top_rated"]').first();
  if (!(await topRated.count())) {
    test.skip(true, 'Không tìm thấy widget Top rated products');
    return;
  }
  const names = await topRated.locator('a[href*="/shop/"]').allInnerTexts();
  // Kiểm tra từng sản phẩm trong widget có ít nhất 1 review
  const bad: string[] = [];
  for (const name of names) {
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const r = await page.request.get(`/wp-json/wc/v3/products?slug=${slug}`).catch(() => null);
    if (!r || r.status() !== 200) continue;
    const products = await r.json().catch(() => []);
    if (Array.isArray(products) && products[0]?.rating_count === 0) bad.push(name.trim());
  }
  expect(bad, `Sản phẩm chưa có review nhưng xuất hiện trong Top rated: ${bad.join(', ')}`).toEqual([]); // fail => BUG-039
});

test('HOME-TC034 Nút "SEE ALL PRODUCTS" và "VIEW COLLECTIONS" trỏ về URL khác nhau', async ({ page }) => {
  await page.goto('/');
  const seeAll = page.locator('a:visible').filter({ hasText: /SEE ALL PRODUCTS/i }).first();
  const viewCol = page.locator('a:visible').filter({ hasText: /VIEW COLLECTIONS/i }).first();
  if (!(await seeAll.count()) || !(await viewCol.count())) {
    test.skip(true, 'Không tìm thấy đủ 2 nút trên banner');
    return;
  }
  const hrefSee = await seeAll.getAttribute('href');
  const hrefCol = await viewCol.getAttribute('href');
  expect(hrefSee, 'Nút SEE ALL PRODUCTS phải có href').toBeTruthy();
  expect(hrefCol, 'Nút VIEW COLLECTIONS phải có href').toBeTruthy();
  expect(hrefSee, 'Hai nút không được trỏ cùng URL').not.toBe(hrefCol); // fail => BUG-040
});

test('HOME-TC030 Ảnh ở trang chủ không vượt quá 500KB', async ({ page }) => {
  const sizes: { url: string; kb: number }[] = [];
  const pending: Promise<void>[] = [];
  page.on('response', (resp) => {
    if (resp.request().resourceType() !== 'image') return;
    pending.push(resp.body().then((b) => { sizes.push({ url: resp.url(), kb: Math.round(b.length / 1024) }); }).catch(() => {}));
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  await scrollToBottom(page);
  await page.waitForLoadState('networkidle');
  await Promise.all(pending);
  const heavy = sizes.filter((s) => s.kb > 500).map((s) => `${s.kb}KB ${s.url}`);
  expect(heavy, heavy.join('\n')).toEqual([]);
});
