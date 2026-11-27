import { expect, test } from './fixtures';
import { BASE, Product, WIDGET_COUNTS, imagesWithoutAlt, noFollow, readCards, scrollToBottom } from './helpers';
import { apiPre, autoPre, cartPost, runFlow, tcER } from './flow';

test.use({ baseURL: BASE });

test('HOME-TC013 Widget Product categories hiển thị đúng số lượng từng danh mục', async ({ page }) => {
  let widget: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập /", async () => { await page.goto('/'); }],
      ["Lấy dữ liệu \"widget\": (await page.locator('.widget_product_categories')…", async () => { widget = (await page.locator('.widget_product_categories').allInnerTexts()).join('\n').replace(/\s+/g, ' '); }],
    ],
    er: [
      [tcER(1, 1, "for (const [label, count] of Object.entries(WIDGET_COUNTS))…"), async () => { for (const [label, count] of Object.entries(WIDGET_COUNTS))
          expect(widget, `${label} phải là (${count})`).toMatch(new RegExp(`${label}\\s*\\(${count}\\)`)); }],
    ],
  });
});

test('HOME-TC015 Không có ảnh hoặc link bị hỏng trên trang chủ', async ({ page }) => {
  const bad: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập https://actp1.csc.edu.vn/", async () => { await page.goto('/'); }],
      ["Cuộn toàn bộ trang từ đầu đến cuối, quan sát các ảnh có hiển thị đầy đủ không", async () => { await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); }],
      ["Mở DevTools, tab Network, lọc 'Img', kiểm tra không có ảnh trả lỗi 4xx/5xx", async () => { await page.waitForTimeout(1500); }],
      ["Click lần lượt các link nội bộ trên trang (menu, nút, sản phẩm, footer)", async () => { const broken = await page.evaluate(() =>
          Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0 && i.src).map((i) => i.src));
      expect(broken, `Ảnh lỗi: ${broken}`).toEqual([]); }],
      ["Kiểm tra không có link nào trả về 404 hoặc 500", async () => { const hrefs: string[] = await page.evaluate(() =>
          Array.from(new Set(Array.from(document.querySelectorAll('a[href]')).map((a) => (a as HTMLAnchorElement).href))));
      const internal = hrefs.filter((h) => h.startsWith('https://actp1.csc.edu.vn') && !h.includes('#')).slice(0, 40);
      for (const h of internal) if ((await page.request.get(h)).status() >= 400) bad.push(h); }],
    ],
    er: [
      [tcER(1, 1, "expect(bad, `Link lỗi: ${bad}`).toEqual([])"), async () => { expect(bad, `Link lỗi: ${bad}`).toEqual([]); }],
    ],
  });
});

test('HOME-TC018 Truy cập bằng HTTP tự chuyển sang HTTPS', async ({ request }) => {
  let r: any;
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ["Lấy dữ liệu \"r\": await request.get(BASE.replace('https://', 'http:…", async () => { r = await request.get(BASE.replace('https://', 'http://') + '/', noFollow); }],
    ],
    er: [
      [tcER(1, 2, "expect([301, 302, 307, 308], `HTTP trả ${r.status()}`).toCo…"), async () => { expect([301, 302, 307, 308], `HTTP trả ${r.status()}`).toContain(r.status()); }],
      [tcER(2, 2, "expect(r.headers()['location'] ?? '').toMatch(/^https:\\/\\//)"), async () => { expect(r.headers()['location'] ?? '').toMatch(/^https:\/\//); }],
    ],
  });
});

test('HOME-TC019 Response trang chủ có header Strict-Transport-Security (HSTS)', async ({ request }) => {
  let h: any;
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ["Lấy dữ liệu \"h\": (await request.get('/')).headers()", async () => { h = (await request.get('/')).headers(); }],
    ],
    er: [
      [tcER(1, 1, "expect(h['strict-transport-security'], 'Thiếu header Strict…"), async () => { expect(h['strict-transport-security'], 'Thiếu header Strict-Transport-Security').toBeTruthy(); }],
    ],
  });
});

test('HOME-TC020 Response trang chủ có header X-Content-Type-Options: nosniff', async ({ request }) => {
  let h: any;
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ["Lấy dữ liệu \"h\": (await request.get('/')).headers()", async () => { h = (await request.get('/')).headers(); }],
    ],
    er: [
      [tcER(1, 1, "expect(h['x-content-type-options'], 'Thiếu header X-Content…"), async () => { expect(h['x-content-type-options'], 'Thiếu header X-Content-Type-Options').toMatch(/nosniff/i); }],
    ],
  });
});

test('HOME-TC021 Response trang chủ có X-Frame-Options hoặc CSP frame-ancestors', async ({ request }) => {
  let ok = false;
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ['Kiểm tra header X-Frame-Options hoặc CSP của trang chủ', async () => {
        const h = (await request.get('/')).headers();
        ok = !!h['x-frame-options'] || /frame-ancestors/i.test(h['content-security-policy'] ?? '');
      }],
    ],
    er: [
      [tcER(1, 1, 'expect(ok).toBe(true)'), async () => { expect(ok, 'Thiếu X-Frame-Options và CSP frame-ancestors').toBe(true); }],
    ],
  });
});

// Bảng dữ liệu SHOP, bảo mật, accessibility, hiệu năng, SEO, responsive (HOME / NAV / SHOP / PDP)
test('HOME-TC022 /readme.html không truy cập được công khai', async ({ request }) => {
  let r: any;
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ["Lấy dữ liệu \"r\": await request.get('/readme.html', noFollow)", async () => { r = await request.get('/readme.html', noFollow); }],
    ],
    er: [
      [tcER(1, 1, "expect([403, 404], `/readme.html trả HTTP ${r.status()}`).t…"), async () => { expect([403, 404], `/readme.html trả HTTP ${r.status()}`).toContain(r.status()); }],
    ],
  });
});

test('HOME-TC023 Trang chủ không có thẻ meta generator lộ phiên bản WordPress', async ({ request }) => {
  let found: string[] = [];
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ['Đọc HTML trang chủ và tìm thẻ meta generator', async () => {
        const html = await (await request.get('/')).text();
        found = html.match(/<meta[^>]+name=["']generator["'][^>]*>/gi) ?? [];
      }],
    ],
    er: [
      [tcER(1, 1, 'expect(found).toEqual([])'), async () => { expect(found, `Tìm thấy ${found.length} thẻ meta generator: ${found.join(' | ')}`).toEqual([]); }],
    ],
  });
});

test('HOME-TC024 /wp-content/uploads/ không bật liệt kê thư mục', async ({ request }) => {
  let r: any;
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ["Lấy dữ liệu \"r\": await request.get('/wp-content/uploads/')", async () => { r = await request.get('/wp-content/uploads/'); }],
    ],
    er: [
      [tcER(1, 1, "expect(await r.text()).not.toMatch(/Index of/i)"), async () => { expect(await r.text()).not.toMatch(/Index of/i); }],
    ],
  });
});

test('HOME-TC025 Các file nhạy cảm không truy cập được', async ({ request }) => {
  const paths = ['/.env', '/.git/config', '/wp-config.php.bak', '/debug.log', '/wp-content/debug.log'];
  const bad: string[] = [];
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ["Lặp: for (const p of paths) ", async () => { for (const p of paths) {
          const r = await request.get(p);
          if (![403, 404].includes(r.status())) bad.push(`${p} → HTTP ${r.status()}`);
        } }],
    ],
    er: [
      [tcER(1, 1, "expect(bad, bad.join('\\n')).toEqual([])"), async () => { expect(bad, bad.join('\n')).toEqual([]); }],
    ],
  });
});

test('HOME-TC026 Tất cả ảnh trên trang chủ có alt text', async ({ page }) => {
  let bad: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Mở https://actp1.csc.edu.vn/", async () => { await page.goto('/'); }],
      ["Kiểm tra thuộc tính alt của mọi thẻ img", async () => { bad = await imagesWithoutAlt(page); }],
    ],
    er: [
      [tcER(1, 1, "expect(bad, `${bad.length} ảnh thiếu alt:\\n${bad.join('\\n')…"), async () => { expect(bad, `${bad.length} ảnh thiếu alt:\n${bad.join('\n')}`).toEqual([]); }],
    ],
  });
});

test('HOME-TC027 Mọi link/button hiển thị ở trang chủ đều có tên truy cập', async ({ page }) => {
  let unnamed: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Mở https://actp1.csc.edu.vn/", async () => { await page.goto('/'); }],
      ["Kiểm tra các thẻ a/button đang hiển thị có text, aria-label hoặc title", async () => { unnamed = await page.$$eval('a, button', (els) =>
          els
            .filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; })
            .filter((e) => !(e.textContent ?? '').trim() && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby') && !e.getAttribute('title')
              && !e.querySelector('img[alt]:not([alt=""])') && !e.querySelector('svg title'))
            .map((e) => e.outerHTML.slice(0, 120))); }],
    ],
    er: [
      [tcER(1, 1, "expect(unnamed, `${unnamed.length} phần tử không có tên:\\n$…"), async () => { expect(unnamed, `${unnamed.length} phần tử không có tên:\n${unnamed.join('\n')}`).toEqual([]); }],
    ],
  });
});

test('HOME-TC028 Thẻ html có thuộc tính lang', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập /", async () => { await page.goto('/'); }],
    ],
    er: [
      [tcER(1, 1, "expect(((await page.locator('html').getAttribute('lang')) ?…"), async () => { expect(((await page.locator('html').getAttribute('lang')) ?? '').trim(), 'Thẻ html thiếu lang').not.toBe(''); }],
    ],
  });
});

test('HOME-TC029 Nhấn Tab ở trang chủ đưa focus vào phần tử tương tác đầu tiên', async ({ page }) => {
  let tag: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Mở https://actp1.csc.edu.vn/", async () => { await page.goto('/'); }],
      ["Nhấn phím Tab 1 lần", async () => { await page.keyboard.press('Tab'); }],
      ["Xem phần tử đang focus", async () => { tag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase() ?? ''); }],
    ],
    er: [
      [tcER(1, 1, "expect(['a', 'button', 'input', 'select', 'textarea'], `Foc…"), async () => { expect(['a', 'button', 'input', 'select', 'textarea'], `Focus đang ở <${tag}>`).toContain(tag); }],
    ],
  });
});

test('HOME-TC033 Sản phẩm chưa có đánh giá không hiển thị trong widget Top rated products', async ({ page }) => {
  const topRated = page.locator('.widget_top_rated_products, [class*="top_rated"]').first();
  const bad: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập /", async () => { await page.goto('/'); }],
      ["Thực hiện: if (!(await topRated.count())) { test.skip(true, 'Không tìm…", async () => { if (!(await topRated.count())) {
          test.skip(true, 'Không tìm thấy widget Top rated products');
          return;
        } }],
      ["Lấy dữ liệu \"names\": await topRated.locator('a[href*=\"/shop/\"]').allIn…", async () => {
        const links = topRated.locator('a[href*="/shop/"]');
        const count = await links.count();
        for (let i = 0; i < count; i++) {
          const name = (await links.nth(i).innerText()).trim();
          const href = await links.nth(i).getAttribute('href');
          if (!href) continue;
          const r = await page.request.get(href).catch(() => null);
          if (!r || r.status() !== 200) continue;
          const html = await r.text();
          if (/Reviews\s*\(0\)|There are no reviews yet/i.test(html)) bad.push(name);
        }
      }],
    ],
    er: [
      [tcER(1, 1, "expect(bad, `Sản phẩm chưa có review nhưng xuất hiện trong …"), async () => { expect(bad, `Sản phẩm chưa có review nhưng xuất hiện trong Top rated: ${bad.join(', ')}`).toEqual([]); }],
    ],
  });
});

test('HOME-TC034 Nút "SEE ALL PRODUCTS" và "VIEW COLLECTIONS" trỏ về URL khác nhau', async ({ page }) => {
  const seeAll = page.locator('a:visible').filter({ hasText: /SEE ALL PRODUCTS/i }).first();
  const viewCol = page.locator('a:visible').filter({ hasText: /VIEW COLLECTIONS/i }).first();
  let hrefSee: any;
  let hrefCol: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập /", async () => { await page.goto('/'); }],
      ["Thực hiện: if (!(await seeAll.count()) || !(await viewCol.count())) { …", async () => { if (!(await seeAll.count()) || !(await viewCol.count())) {
          test.skip(true, 'Không tìm thấy đủ 2 nút trên banner');
          return;
        } }],
      ["Lấy dữ liệu \"hrefSee\": await seeAll.getAttribute('href')", async () => { hrefSee = await seeAll.getAttribute('href'); }],
      ["Lấy dữ liệu \"hrefCol\": await viewCol.getAttribute('href')", async () => { hrefCol = await viewCol.getAttribute('href'); }],
    ],
    er: [
      [tcER(1, 3, "expect(hrefSee, 'Nút SEE ALL PRODUCTS phải có href').toBeTr…"), async () => { expect(hrefSee, 'Nút SEE ALL PRODUCTS phải có href').toBeTruthy(); }],
      [tcER(2, 3, "expect(hrefCol, 'Nút VIEW COLLECTIONS phải có href').toBeTr…"), async () => { expect(hrefCol, 'Nút VIEW COLLECTIONS phải có href').toBeTruthy(); }],
      [tcER(3, 3, "expect(hrefSee, 'Hai nút không được trỏ cùng URL').not.toBe…"), async () => { expect(hrefSee, 'Hai nút không được trỏ cùng URL').not.toBe(hrefCol); }],
    ],
  });
});

test('HOME-TC030 Ảnh ở trang chủ không vượt quá 500KB', async ({ page }) => {
  const sizes: { url: string; kb: number }[] = [];
  const pending: Promise<void>[] = [];
  let heavy: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: page.on('response', (resp) => { if (resp.request().resource…", async () => { page.on('response', (resp) => {
          if (resp.request().resourceType() !== 'image') return;
          pending.push(resp.body().then((b) => { sizes.push({ url: resp.url(), kb: Math.round(b.length / 1024) }); }).catch(() => {}));
        }); }],
      ["Truy cập /", async () => { await page.goto('/', { waitUntil: 'networkidle' }); }],
      ["Thực hiện: scrollToBottom(page)", async () => { await scrollToBottom(page); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForLoadState('networkidle'); }],
      ["Thực hiện: Promise.all(pending)", async () => { await Promise.all(pending); }],
      ["Lấy dữ liệu \"heavy\": sizes.filter((s) => s.kb > 500).map((s) => `${s.k…", async () => { heavy = sizes.filter((s) => s.kb > 500).map((s) => `${s.kb}KB ${s.url}`); }],
    ],
    er: [
      [tcER(1, 1, "expect(heavy, heavy.join('\\n')).toEqual([])"), async () => { expect(heavy, heavy.join('\n')).toEqual([]); }],
    ],
  });
});

// ---------------------------------------------------------------- Chuyển từ Manual sang Automated
test('HOME-TC016 Mobile 375x812: menu dạng hamburger và không có thanh cuộn ngang', async ({ page }) => {
  const toggle = page.locator('button.navbar-toggle:visible, button[aria-label*="menu" i]:visible, .menu-mobile-toggle:visible').first();
  let over = 0;
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Đổi viewport 375x812 và mở trang chủ', async () => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/');
      }],
      ['Đo độ tràn ngang của trang', async () => {
        over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      }],
    ],
    er: [
      [tcER(1, 2, 'Nút hamburger hiển thị ở mobile'), async () => { await expect(toggle, 'Không thấy nút hamburger ở mobile').toBeVisible(); }],
      [tcER(2, 2, 'Không có thanh cuộn ngang'), async () => { expect(over, `Trang tràn ngang ${over}px`).toBeLessThanOrEqual(1); }],
    ],
  });
});

test('HOME-TC017 Tên thương hiệu thống nhất ở title, header, footer và blog', async ({ page }) => {
  const brand = 'ACTP Clothes Shop';
  const foreign = /\bMy Shop\b/i;                     // tên thương hiệu khác đang bị lẫn trong site
  const found: string[] = [];
  let title = '';
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở trang chủ và kiểm tra title, header, footer', async () => {
        await page.goto('/');
        title = await page.title();
        if (foreign.test(title)) found.push(`title: ${title}`);
        const header = await page.locator('header').first().evaluate((h) =>
          (h as HTMLElement).innerText + ' ' + Array.from(h.querySelectorAll('img')).map((i) => i.alt).join(' '));
        if (foreign.test(header)) found.push('header');
        const footer = await page.locator('footer, .widget-area, aside').allInnerTexts();
        if (foreign.test(footer.join('\n'))) found.push('footer / widget (About My Shop)');
      }],
      ['Mở /blog/ và kiểm tra tên thương hiệu', async () => {
        await page.goto('/blog/');
        if (foreign.test(await page.locator('body').innerText())) found.push('blog');
      }],
    ],
    er: [
      [tcER(1, 2, 'Title chứa tên thương hiệu'), async () => { expect(title, 'Title phải chứa tên thương hiệu').toContain(brand); }],
      [tcER(2, 2, 'Không lẫn tên "My Shop" ở bất kỳ khu vực nào'), async () => { expect(found, `Tên thương hiệu không thống nhất, "My Shop" xuất hiện ở: ${found.join(', ')}`).toEqual([]); }],
    ],
  });
});

test('HOME-TC031 Mức giảm giá ở banner khớp với mức giảm thực tế', async ({ page }) => {
  let banner = 0, discounts: number[] = [];
  let m: RegExpMatchArray | null = null;
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở trang chủ và đọc mức giảm giá trên banner + sản phẩm', async () => {
        await page.goto('/');
        const body = await page.locator('body').innerText();
        m = body.match(/UP TO\s*(\d+)\s*%/i);
        if (m) banner = parseInt(m[1], 10);
        const cards = await readCards(page);
        discounts = cards.filter((c) => c.regular && c.regular > c.price).map((c) => Math.round(((c.regular! - c.price) / c.regular!) * 100));
      }],
    ],
    er: [
      [tcER(1, 3, 'Banner có mức giảm giá'), async () => { expect(m, 'Không tìm thấy mức giảm giá ở banner').not.toBeNull(); }],
      [tcER(2, 3, 'Có sản phẩm đang giảm giá'), async () => { expect(discounts.length, 'Không có sản phẩm nào đang giảm giá').toBeGreaterThan(0); }],
      [tcER(3, 3, 'Mức giảm tối đa khớp với banner'), async () => {
        const max = Math.max(...discounts);
        expect(Math.abs(max - banner), `Banner ghi ${banner}% nhưng mức giảm lớn nhất thực tế là ${max}%`).toBeLessThanOrEqual(5);
      }],
    ],
  });
});

test('HOME-TC035 Cách viết tên danh mục và tên sản phẩm áo thun thống nhất', async ({ page }) => {
  let category = '', bad: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở trang chủ, đọc tên danh mục áo thun và các sản phẩm áo thun', async () => {
        await page.goto('/');
        category = ((await page.locator('a[href*="/category/clothing/tshirt"]').first().textContent()) ?? '').trim();
        const names = (await readCards(page)).map((c) => c.name).filter((n) => /t[-\s]?shirt/i.test(n));
        bad = names.filter((n) => !n.toLowerCase().includes(category.toLowerCase()));
      }],
    ],
    er: [
      [tcER(1, 2, 'Tìm thấy danh mục áo thun'), async () => { expect(category, 'Không tìm thấy danh mục áo thun').not.toBe(''); }],
      [tcER(2, 2, 'Tên danh mục và tên sản phẩm viết thống nhất'), async () => { expect(bad, `Danh mục viết "${category}" nhưng sản phẩm viết khác: ${bad.join(' | ')}`).toEqual([]); }],
    ],
  });
});
