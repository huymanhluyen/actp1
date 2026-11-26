import { Page, expect, test } from '@playwright/test';
import { Card, HAT, TEE, addToCart, allShopCards, collectDialogs, imagesWithoutAlt, money, stripRequired } from './helpers';

async function badQty(page: Page, value: string) {
  await page.goto(`/shop/${TEE}/`);
  await page.locator('input.qty').fill(value);
  await page.locator('button.single_add_to_cart_button').click();
  await page.waitForTimeout(1500);
  await page.goto('/cart/');
  await expect(page.locator('.cart-empty')).toBeVisible();
}

async function openReviews(page: Page) {
  await page.goto(`/shop/${TEE}/`);
  await page.locator("a[href='#tab-reviews']").click();
}

async function fillReview(page: Page, o: { rating?: number | null; comment?: string; name?: string; email?: string } = {}) {
  const { rating = 5, comment = 'Great tee', name = 'QA Tester', email = 'qa.review@example.com' } = o;
  if (rating) await page.locator(`p.stars a.star-${rating}`).click();
  await page.fill('#comment', comment);
  await page.fill('#author', name);
  await page.fill('#email', email);
}

test('PDP-TC011 Thêm cùng sản phẩm 2 lần thì cộng dồn số lượng', async ({ page }) => {
  await addToCart(page, TEE, 1);
  await addToCart(page, TEE, 1);
  await page.goto('/cart/');
  expect(await page.locator('tr.cart_item').count()).toBe(1);
  expect(await page.locator('tr.cart_item input.qty').inputValue()).toBe('2');
});

test('PDP-TC012 Thêm nhiều sản phẩm khác nhau', async ({ page }) => {
  await addToCart(page, TEE, 1);
  await addToCart(page, HAT, 1);
  await page.goto('/cart/');
  expect(await page.locator('tr.cart_item').count()).toBe(2);
});

test('PDP-TC013 Quantity = 0', async ({ page }) => { await badQty(page, '0'); });

test('PDP-TC014 Quantity âm (-1)', async ({ page }) => { await badQty(page, '-1'); });

test('PDP-TC015 Quantity thập phân (1.5)', async ({ page }) => { await badQty(page, '1.5'); });

test('PDP-TC016 Quantity là chữ (\'abc\')', async ({ page }) => {
  await page.goto(`/shop/${TEE}/`);
  const q = page.locator('input.qty');
  await q.fill('');
  await q.pressSequentially('abc');
  expect(await q.inputValue()).toBe('');
});

test('PDP-TC017 Quantity rất lớn (99999)', async ({ page }) => {
  await page.goto(`/shop/${TEE}/`);
  await page.locator('input.qty').fill('99999');
  await page.locator('button.single_add_to_cart_button').click();
  await page.waitForTimeout(2500);
  expect(/Internal Server Error|critical error on this website|Fatal error/i.test(await page.content())).toBe(false);
  await page.goto('/cart/');
  expect(/Internal Server Error|critical error on this website|Fatal error/i.test(await page.content())).toBe(false);
  if (await page.locator('tr.cart_item').count()) {
    const qty = parseInt(await page.locator('tr.cart_item input.qty').inputValue(), 10);
    const sub = money(await page.locator('tr.cart_item .product-subtotal').innerText());
    expect(Math.abs(sub - qty * 15)).toBeLessThan(0.01);
  }
});

test('PDP-TC019 Submit review không chọn rating', async ({ page }) => {
  await openReviews(page);
  const msgs = collectDialogs(page);
  await fillReview(page, { rating: null });
  await page.locator('#submit').click();
  await page.waitForTimeout(800);
  expect(msgs.some((m) => m.toLowerCase().includes('rating')), JSON.stringify(msgs)).toBe(true);
});

test('PDP-TC020 Submit review bỏ trống nội dung', async ({ page }) => {
  await openReviews(page);
  await fillReview(page, { comment: '' });
  await stripRequired(page);
  await page.locator('#submit').click();
  await page.waitForLoadState();
  expect(await page.content()).toMatch(/please type your comment|error/i);
});

test('PDP-TC021 Submit review bỏ trống Name/Email', async ({ page }) => {
  await openReviews(page);
  await fillReview(page, { name: '', email: '' });
  await stripRequired(page);
  await page.locator('#submit').click();
  await page.waitForLoadState();
  expect(await page.content()).toMatch(/fill required fields|name and email|error/i);
});

test('PDP-TC022 Submit review với email sai định dạng', async ({ page }) => {
  await openReviews(page);
  await fillReview(page, { email: 'abc' });
  await page.locator('#submit').click();
  await page.waitForLoadState();
  const invalid = await page.evaluate(() => {
    const e = document.querySelector('#email') as HTMLInputElement | null;
    return !!e && e.validity.typeMismatch;
  });
  expect(invalid || /valid email|error/i.test(await page.content())).toBe(true);
});

test('PDP-TC023 Submit review hợp lệ', async ({ page }) => {
  await openReviews(page);
  await fillReview(page, { comment: 'Playwright auto review – OK' });
  await page.locator('#submit').click();
  await page.waitForLoadState();
  expect(await page.content()).toMatch(/awaiting approval|Playwright auto review/i);
});

test('PDP-TC024 Review chứa mã XSS không bị thực thi', async ({ page }) => {
  const msgs = collectDialogs(page);
  await openReviews(page);
  await fillReview(page, { comment: "<script>alert('xss1')</script>" });
  await page.locator('#submit').click();
  await page.waitForLoadState();
  await page.waitForTimeout(1000);
  expect(msgs.some((m) => m.includes('xss1')), JSON.stringify(msgs)).toBe(false);
});

test('PDP-TC026 Ảnh sản phẩm hiển thị rõ nét, không bị mờ ở mọi sản phẩm', async ({ page }) => {
  const cards: Card[] = await allShopCards(page);
  const bad: string[] = [];
  for (const c of cards) {
    await page.goto(c.href);
    const img = page.locator('.woocommerce-product-gallery__image img').first();
    await expect(img, `${c.name}: không thấy ảnh sản phẩm`).toBeVisible();
    await img.evaluate((el: HTMLImageElement) => (el.complete ? undefined : new Promise((r) => el.addEventListener('load', r, { once: true }))));
    const info = await img.evaluate((el: HTMLImageElement) => {
      const blurred: string[] = [];
      for (let n: Element | null = el; n; n = n.parentElement) {
        const f = getComputedStyle(n).filter;
        if (f && f.includes('blur')) blurred.push(`${n.tagName.toLowerCase()}{filter:${f}}`);
      }
      return { natural: el.naturalWidth, shown: el.clientWidth, src: el.currentSrc, blurred };
    });
    if (info.blurred.length) bad.push(`${c.name}: CSS làm mờ ảnh → ${info.blurred.join(', ')}`);
    if (info.natural < info.shown) bad.push(`${c.name}: ảnh gốc ${info.natural}px bị phóng lên ${info.shown}px (${info.src})`);
  }
  expect(bad, bad.join('\n')).toEqual([]);
});

test('PDP-TC028 Ảnh ở trang chi tiết sản phẩm có alt text', async ({ page }) => {
  await page.goto('/shop/sunset-glow-utility-dress/');
  const bad = await imagesWithoutAlt(page, '.woocommerce-product-gallery');
  expect(bad, `${bad.length} ảnh thiếu alt:\n${bad.join('\n')}`).toEqual([]);
});

test('PDP-TC029 Bấm Submit review nhiều lần liên tiếp chỉ tạo 1 review', async ({ page }) => {
  await openReviews(page);
  const comment = `Auto spam ${Date.now()}`;
  await fillReview(page, { comment });
  await page.locator('#submit').click({ clickCount: 3, noWaitAfter: true });   // 3 lần bấm liên tiếp
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  await openReviews(page);                                                       // tải lại để đếm số review thật sự được lưu
  const count = await page.locator('.commentlist li', { hasText: comment }).count();
  expect(count, `Review bị tạo ${count} lần`).toBeLessThanOrEqual(1);
});

test("PDP-TC030 Tìm 'dress' bằng ô tìm kiếm ở trang Shop chỉ trả về sản phẩm có 'dress' trong tên", async ({ page }) => {
  await page.goto('/shop/');
  await page.locator('.menu-item-nav-search a:visible, a.nv-search:visible, header a[href="#"]:visible').first().click();
  const box = page.locator('input.search-field:visible, input[type=search]:visible').first();
  await box.fill('dress');
  await box.press('Enter');
  await page.waitForLoadState('domcontentloaded');
  const titles = await page.$$eval('ul.products .woocommerce-loop-product__title, article .entry-title, article h2', (els) => els.map((e) => (e.textContent ?? '').trim()).filter(Boolean));
  expect(titles.length, 'Không có kết quả tìm kiếm nào').toBeGreaterThan(0);
  const wrong = titles.filter((t) => !/dress/i.test(t));
  expect(wrong, `Kết quả không có 'dress' trong tên: ${wrong.join(' | ')} (tất cả: ${titles.join(' | ')})`).toEqual([]);
});
