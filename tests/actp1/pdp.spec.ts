import { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { Card, HAT, TEE, addToCart, allShopCards, collectDialogs, imagesWithoutAlt, money, stripRequired } from './helpers';
import { autoPre, cartPost, runFlow, tcER } from './flow';

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
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addToCart(page, TEE, 1)", async () => { await addToCart(page, TEE, 1); }],
      ["Thực hiện: addToCart(page, TEE, 1)", async () => { await addToCart(page, TEE, 1); }],
      ["Truy cập /cart/", async () => { await page.goto('/cart/'); }],
    ],
    er: [
      [tcER(1, 2, "expect(await page.locator('tr.cart_item').count()).toBe(1)"), async () => { expect(await page.locator('tr.cart_item').count()).toBe(1); }],
      [tcER(2, 2, "expect(await page.locator('tr.cart_item input.qty').inputVa…"), async () => { expect(await page.locator('tr.cart_item input.qty').inputValue()).toBe('2'); }],
    ],
    post: cartPost(page),
  });
});

test('PDP-TC012 Thêm nhiều sản phẩm khác nhau', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addToCart(page, TEE, 1)", async () => { await addToCart(page, TEE, 1); }],
      ["Thực hiện: addToCart(page, HAT, 1)", async () => { await addToCart(page, HAT, 1); }],
      ["Truy cập /cart/", async () => { await page.goto('/cart/'); }],
    ],
    er: [
      [tcER(1, 1, "expect(await page.locator('tr.cart_item').count()).toBe(2)"), async () => { expect(await page.locator('tr.cart_item').count()).toBe(2); }],
    ],
    post: cartPost(page),
  });
});

test('PDP-TC013 Quantity = 0', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: badQty(page, '0')", async () => { await badQty(page, '0'); }],
    ],
    er: [
      [tcER(1, 1, '') + '  (được kiểm tra ngay trong bước MAIN)', async () => {}],
    ],
    post: cartPost(page),
  });
});

test('PDP-TC014 Quantity âm (-1)', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: badQty(page, '-1')", async () => { await badQty(page, '-1'); }],
    ],
    er: [
      [tcER(1, 1, '') + '  (được kiểm tra ngay trong bước MAIN)', async () => {}],
    ],
    post: cartPost(page),
  });
});

test('PDP-TC015 Quantity thập phân (1.5)', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: badQty(page, '1.5')", async () => { await badQty(page, '1.5'); }],
    ],
    er: [
      [tcER(1, 1, '') + '  (được kiểm tra ngay trong bước MAIN)', async () => {}],
    ],
    post: cartPost(page),
  });
});

test('PDP-TC016 Quantity là chữ (\'abc\')', async ({ page }) => {
  const q = page.locator('input.qty');
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập /shop/${TEE}/", async () => { await page.goto(`/shop/${TEE}/`); }],
      ["Nhập '' vào q", async () => { await q.fill(''); }],
      ["Nhập 'abc' vào q", async () => { await q.pressSequentially('abc'); }],
    ],
    er: [
      [tcER(1, 1, "expect(await q.inputValue()).toBe('')"), async () => { expect(await q.inputValue()).toBe(''); }],
    ],
  });
});

test('PDP-TC017 Quantity rất lớn (99999)', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Đảm bảo giỏ hàng rỗng", async () => { await page.goto(`/shop/${TEE}/`); }],
      ["Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/", async () => { await page.locator('input.qty').fill('99999'); }],
      ["Nhập quantity = 99999", async () => { await page.locator('button.single_add_to_cart_button').click(); }],
      ["Click nút 'Add to cart'", async () => { await page.waitForTimeout(2500); }],
      ["Quan sát thông báo và kiểm tra không có lỗi 500", async () => { expect(/Internal Server Error|critical error on this website|Fatal error/i.test(await page.content())).toBe(false); }],
      ["Nếu thêm được, truy cập https://actp1.csc.edu.vn/cart/ và kiểm tra tổng tiền = 99999 x đơn giá", async () => { await page.goto('/cart/'); }],
    ],
    er: [
      [tcER(1, 2, "expect(/Internal Server Error|critical error on this websit…"), async () => { expect(/Internal Server Error|critical error on this website|Fatal error/i.test(await page.content())).toBe(false); }],
      [tcER(2, 2, "if (await page.locator('tr.cart_item').count()) { const qty…"), async () => { if (await page.locator('tr.cart_item').count()) {
          const qty = parseInt(await page.locator('tr.cart_item input.qty').inputValue(), 10);
          const sub = money(await page.locator('tr.cart_item .product-subtotal').innerText());
          expect(Math.abs(sub - qty * 15)).toBeLessThan(0.01);
        } }],
    ],
    post: cartPost(page),
  });
});

test('PDP-TC019 Submit review không chọn rating', async ({ page }) => {
  const msgs = collectDialogs(page);
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: openReviews(page)", async () => { await openReviews(page); }],
      ["Thực hiện: fillReview(page, { rating: null })", async () => { await fillReview(page, { rating: null }); }],
      ["Click '#submit'", async () => { await page.locator('#submit').click(); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForTimeout(800); }],
    ],
    er: [
      [tcER(1, 1, "expect(msgs.some((m) => m.toLowerCase().includes('rating'))…"), async () => { expect(msgs.some((m) => m.toLowerCase().includes('rating')), JSON.stringify(msgs)).toBe(true); }],
    ],
  });
});

test('PDP-TC020 Submit review bỏ trống nội dung', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: openReviews(page)", async () => { await openReviews(page); }],
      ["Thực hiện: fillReview(page, { comment: '' })", async () => { await fillReview(page, { comment: '' }); }],
      ["Thực hiện: stripRequired(page)", async () => { await stripRequired(page); }],
      ["Click '#submit'", async () => { await page.locator('#submit').click(); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForLoadState(); }],
    ],
    er: [
      [tcER(1, 1, "expect(await page.content()).toMatch(/please type your comm…"), async () => { expect(await page.content()).toMatch(/please type your comment|error/i); }],
    ],
  });
});

test('PDP-TC021 Submit review bỏ trống Name/Email', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: openReviews(page)", async () => { await openReviews(page); }],
      ["Thực hiện: fillReview(page, { name: '', email: '' })", async () => { await fillReview(page, { name: '', email: '' }); }],
      ["Thực hiện: stripRequired(page)", async () => { await stripRequired(page); }],
      ["Click '#submit'", async () => { await page.locator('#submit').click(); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForLoadState(); }],
    ],
    er: [
      [tcER(1, 1, "expect(await page.content()).toMatch(/fill required fields|…"), async () => { expect(await page.content()).toMatch(/fill required fields|name and email|error/i); }],
    ],
  });
});

test('PDP-TC022 Submit review với email sai định dạng', async ({ page }) => {
  let invalid: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: openReviews(page)", async () => { await openReviews(page); }],
      ["Thực hiện: fillReview(page, { email: 'abc' })", async () => { await fillReview(page, { email: 'abc' }); }],
      ["Click '#submit'", async () => { await page.locator('#submit').click(); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForLoadState(); }],
      ["Lấy dữ liệu \"invalid\": await page.evaluate(() => { const e = document.qu…", async () => { invalid = await page.evaluate(() => {
          const e = document.querySelector('#email') as HTMLInputElement | null;
          return !!e && e.validity.typeMismatch;
        }); }],
    ],
    er: [
      [tcER(1, 1, "expect(invalid || /valid email|error/i.test(await page.cont…"), async () => { expect(invalid || /valid email|error/i.test(await page.content())).toBe(true); }],
    ],
  });
});

test('PDP-TC023 Submit review hợp lệ', async ({ page }) => {
  const comment = `Playwright auto review ${Date.now()}`;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: openReviews(page)", async () => { await openReviews(page); }],
      ["Thực hiện: fillReview(page, { comment })", async () => { await fillReview(page, { comment }); }],
      ["Click '#submit'", async () => { await page.locator('#submit').click(); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForLoadState(); }],
    ],
    er: [
      [tcER(1, 1, "expect(await page.content()).toMatch(/awaiting approval|Playwright auto review/i)"), async () => { expect(await page.content()).toMatch(new RegExp(`awaiting approval|${comment}`, 'i')); }],
    ],
  });
});

test('PDP-TC024 Review chứa mã XSS không bị thực thi', async ({ page }) => {
  const msgs = collectDialogs(page);
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: openReviews(page)", async () => { await openReviews(page); }],
      ["Thực hiện: fillReview(page, { comment: \"<script>alert('xss1')</script>…", async () => { await fillReview(page, { comment: "<script>alert('xss1')</script>" }); }],
      ["Click '#submit'", async () => { await page.locator('#submit').click(); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForLoadState(); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForTimeout(1000); }],
    ],
    er: [
      [tcER(1, 1, "expect(msgs.some((m) => m.includes('xss1')), JSON.stringify…"), async () => { expect(msgs.some((m) => m.includes('xss1')), JSON.stringify(msgs)).toBe(false); }],
    ],
  });
});

test('PDP-TC026 Ảnh sản phẩm hiển thị rõ nét, không bị mờ ở mọi sản phẩm', async ({ page }) => {
  const bad: string[] = [];
  let cards: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: const cards: Card[] = await allShopCards(page)", async () => { cards = await allShopCards(page); }],
    ],
    er: [
      [tcER(1, 2, "for (const c of cards) { await page.goto(c.href); const img…"), async () => { for (const c of cards) {
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
        } }],
      [tcER(2, 2, "expect(bad, bad.join('\\n')).toEqual([])"), async () => { expect(bad, bad.join('\n')).toEqual([]); }],
    ],
  });
});

test('PDP-TC028 Ảnh ở trang chi tiết sản phẩm có alt text', async ({ page }) => {
  let bad: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Mở https://actp1.csc.edu.vn/shop/sunset-glow-utility-dress/", async () => { await page.goto('/shop/sunset-glow-utility-dress/'); }],
      ["Kiểm tra thuộc tính alt của ảnh trong gallery", async () => { bad = await imagesWithoutAlt(page, '.woocommerce-product-gallery'); }],
    ],
    er: [
      [tcER(1, 1, "expect(bad, `${bad.length} ảnh thiếu alt:\\n${bad.join('\\n')…"), async () => { expect(bad, `${bad.length} ảnh thiếu alt:\n${bad.join('\n')}`).toEqual([]); }],
    ],
  });
});

test('PDP-TC029 Bấm Submit review nhiều lần liên tiếp chỉ tạo 1 review', async ({ page }) => {
  const comment = `Auto spam ${Date.now()}`;
  let count: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: openReviews(page)", async () => { await openReviews(page); }],
      ["Thực hiện: fillReview(page, { comment })", async () => { await fillReview(page, { comment }); }],
      ["Click '#submit'", async () => { await page.locator('#submit').click({ clickCount: 3, noWaitAfter: true }); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForLoadState('domcontentloaded'); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForTimeout(2000); }],
      ["Thực hiện: openReviews(page)", async () => { await openReviews(page); }],
      ["Lấy dữ liệu \"count\": await page.locator('.commentlist li', { hasText: …", async () => { count = await page.locator('.commentlist li', { hasText: comment }).count(); }],
    ],
    er: [
      [tcER(1, 1, "expect(count, `Review bị tạo ${count} lần`).toBeLessThanOrE…"), async () => { expect(count, `Review bị tạo ${count} lần`).toBeLessThanOrEqual(1); }],
    ],
  });
});

test("PDP-TC030 Tìm 'dress' bằng ô tìm kiếm ở trang Shop chỉ trả về sản phẩm có 'dress' trong tên", async ({ page }) => {
  let titles: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở /shop/, mở ô tìm kiếm và tìm từ khóa "dress"', async () => {
        await page.goto('/shop/');
        await page.locator('.menu-item-nav-search a:visible, a.nv-search:visible, header a[href="#"]:visible').first().click();
        const box = page.locator('input.search-field:visible, input[type=search]:visible').first();
        await box.fill('dress');
        await box.press('Enter');
        await page.waitForLoadState('domcontentloaded');
        titles = await page.$$eval('ul.products .woocommerce-loop-product__title, article .entry-title, article h2', (els) => els.map((e) => (e.textContent ?? '').trim()).filter(Boolean));
      }],
    ],
    er: [
      [tcER(1, 2, 'Có kết quả tìm kiếm'), async () => { expect(titles.length, 'Không có kết quả tìm kiếm nào').toBeGreaterThan(0); }],
      [tcER(2, 2, "Mọi kết quả đều chứa 'dress' trong tên"), async () => {
        const wrong = titles.filter((t) => !/dress/i.test(t));
        expect(wrong, `Kết quả không có 'dress' trong tên: ${wrong.join(' | ')} (tất cả: ${titles.join(' | ')})`).toEqual([]);
      }],
    ],
  });
});

// ---------------------------------------------------------------- Chuyển từ Manual sang Automated
test('PDP-TC027 Mọi sản phẩm ở trang Shop đều mở được trang chi tiết đúng sản phẩm', async ({ page }) => {
  let cards: Card[] = [];
  const bad: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Đọc danh sách sản phẩm ở trang Shop', async () => {
        cards = await allShopCards(page);
        expect(cards.length, 'Không đọc được sản phẩm nào ở /shop/').toBeGreaterThan(0);
      }],
      ['Mở từng trang chi tiết sản phẩm và đối chiếu HTTP status & tên H1', async () => {
        for (const c of cards) {
          const resp = await page.goto(c.href);                  // dùng đúng link mà khách bấm vào ở danh sách
          if (!resp || resp.status() >= 400) { bad.push(`${c.name}: HTTP ${resp?.status()} (${c.href})`); continue; }
          const h1 = ((await page.locator('h1').first().innerText()) ?? '').trim();
          if (h1.toLowerCase() !== c.name.toLowerCase()) bad.push(`${c.name}: mở ra trang "${h1}" (${c.href})`);
        }
      }],
    ],
    er: [
      [tcER(1, 1, 'Tất cả sản phẩm mở đúng trang chi tiết'), async () => { expect(bad, bad.join('\n')).toEqual([]); }],
    ],
  });
});
