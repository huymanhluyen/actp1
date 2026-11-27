/**
 * CART – Giỏ hàng, cập nhật số lượng, coupon
 * Mỗi test bắt đầu bằng TC ID trong Project Report (VD: CART-TC006).
 * Chạy riêng module: npx playwright test tests/actp1/cart.spec.ts
 */
import { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { HAT, SERVER_ERR, TEE, addToCart, money } from './helpers';
import { apiClearCart, apiHealthCheck, autoPre, cartPost, runFlow, tcER } from './flow';

const ROW = 'tr.cart_item';

const qty = (page: Page) => page.locator(`${ROW} input.qty`).first();

async function updateQty(page: Page, value: string) {
  await qty(page).fill(value);
  await page.locator("button[name='update_cart']").click();
  await page.waitForTimeout(2000);
}

const B = process.env.BASE_URL || 'https://actp1.csc.edu.vn';

const num = (t: string) => parseFloat((t || '').replace(/[^0-9.]/g, ''));

async function addBySlug(page: Page, slug: string) {
  await page.goto(`${B}/shop/${slug}/`);
  await page.locator('button.single_add_to_cart_button').first().click();
  await page.waitForSelector('.woocommerce-message, .woocommerce-error', { timeout: 15000 });
}

test('CART-TC006 Tổng tiền nhiều sản phẩm đúng', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addToCart(page, TEE, 1)", async () => { await addToCart(page, TEE, 1); }],
      ["Thực hiện: addToCart(page, HAT, 1)", async () => { await addToCart(page, HAT, 1); }],
      ["Truy cập /cart/", async () => { await page.goto('/cart/'); }],
    ],
    er: [
      [tcER(1, 1, "expect(money(await page.locator('.cart-subtotal .amount').f…"), async () => { expect(money(await page.locator('.cart-subtotal .amount').first().innerText())).toBe(60.0); }],
    ],
    post: cartPost(page),
  });
});

test('CART-TC009 Tăng số lượng 1 → 3 và cập nhật', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addToCart(page, TEE, 1)", async () => { await addToCart(page, TEE, 1); }],
      ["Truy cập /cart/", async () => { await page.goto('/cart/'); }],
      ["Thực hiện: updateQty(page, '3')", async () => { await updateQty(page, '3'); }],
    ],
    er: [
      [tcER(1, 2, "expect(page.locator(`${ROW} .product-subtotal`)).toContainT…"), async () => { await expect(page.locator(`${ROW} .product-subtotal`)).toContainText('45.00'); }],
      [tcER(2, 2, "expect(page.locator('.woocommerce-message').first()).toCont…"), async () => { await expect(page.locator('.woocommerce-message').first()).toContainText('Cart updated'); }],
    ],
    post: cartPost(page),
  });
});

test('CART-TC010 Giảm số lượng 3 → 1', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addToCart(page, TEE, 3)", async () => { await addToCart(page, TEE, 3); }],
      ["Truy cập /cart/", async () => { await page.goto('/cart/'); }],
      ["Thực hiện: updateQty(page, '1')", async () => { await updateQty(page, '1'); }],
    ],
    er: [
      [tcER(1, 1, "expect(page.locator(`${ROW} .product-subtotal`)).toContainT…"), async () => { await expect(page.locator(`${ROW} .product-subtotal`)).toContainText('15.00'); }],
    ],
    post: cartPost(page),
  });
});

test('CART-TC011 Quantity = 0 xóa sản phẩm khỏi giỏ', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addToCart(page, TEE, 1)", async () => { await addToCart(page, TEE, 1); }],
      ["Truy cập /cart/", async () => { await page.goto('/cart/'); }],
      ["Thực hiện: updateQty(page, '0')", async () => { await updateQty(page, '0'); }],
    ],
    er: [
      [tcER(1, 1, "expect(page.locator('.cart-empty')).toBeVisible()"), async () => { await expect(page.locator('.cart-empty')).toBeVisible(); }],
    ],
    post: cartPost(page),
  });
});

test('CART-TC012 Quantity âm không được chấp nhận', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addToCart(page, TEE, 1)", async () => { await addToCart(page, TEE, 1); }],
      ["Truy cập /cart/", async () => { await page.goto('/cart/'); }],
      ["Nhập '-2' vào qty(page)", async () => { await qty(page).fill('-2'); }],
      ["Click 'button[name='update_cart']'", async () => { await page.locator("button[name='update_cart']").click({ force: true }); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForTimeout(1500); }],
      ["Truy cập /cart/", async () => { await page.goto('/cart/'); }],
    ],
    er: [
      [tcER(1, 2, "expect(await qty(page).inputValue()).toBe('1')"), async () => { expect(await qty(page).inputValue()).toBe('1'); }],
      [tcER(2, 2, "expect(money(await page.locator(`${ROW} .product-subtotal`)…"), async () => { expect(money(await page.locator(`${ROW} .product-subtotal`).innerText())).toBe(15.0); }],
    ],
    post: cartPost(page),
  });
});

test('CART-TC013 Quantity rất lớn (99999)', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addToCart(page, TEE, 1)", async () => { await addToCart(page, TEE, 1); }],
      ["Truy cập /cart/", async () => { await page.goto('/cart/'); }],
      ["Thực hiện: updateQty(page, '99999')", async () => { await updateQty(page, '99999'); }],
    ],
    er: [
      [tcER(1, 2, "expect(SERVER_ERR.test(await page.content())).toBe(false)"), async () => { expect(SERVER_ERR.test(await page.content())).toBe(false); }],
      [tcER(2, 2, "if (await page.locator(ROW).count()) { const q = parseInt(a…"), async () => { if (await page.locator(ROW).count()) {
          const q = parseInt(await qty(page).inputValue(), 10);
          expect(Math.abs(money(await page.locator(`${ROW} .product-subtotal`).innerText()) - q * 15)).toBeLessThan(0.01);
        } }],
    ],
    post: cartPost(page),
  });
});

test('CART-TC017 Apply coupon không tồn tại', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addToCart(page, TEE, 1)", async () => { await addToCart(page, TEE, 1); }],
      ["Truy cập /cart/", async () => { await page.goto('/cart/'); }],
      ["Nhập 'INVALID123' vào page", async () => { await page.fill('#coupon_code', 'INVALID123'); }],
      ["Click 'button[name='apply_coupon']'", async () => { await page.locator("button[name='apply_coupon']").click(); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForTimeout(2000); }],
    ],
    er: [
      [tcER(1, 2, "expect(page.locator('.woocommerce-error')).toContainText(/d…"), async () => { await expect(page.locator('.woocommerce-error')).toContainText(/does not exist/i, { timeout: 15_000 }); }],
      [tcER(2, 2, "expect(money(await page.locator('.order-total .amount').fir…"), async () => { expect(money(await page.locator('.order-total .amount').first().innerText())).toBe(15.0); }],
    ],
    post: cartPost(page),
  });
});

test('CART-TC022 Subtotal mini cart đúng sau khi F5', async ({ page }) => {
  let sub: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addBySlug(page, 'bold-statement-graphic-tee')", async () => { await addBySlug(page, 'bold-statement-graphic-tee'); }],
      ["Thực hiện: addBySlug(page, 'floral-elegance-sun-hat')", async () => { await addBySlug(page, 'floral-elegance-sun-hat'); }],
      ["Truy cập ${B}/shop/", async () => { await page.goto(`${B}/shop/`); }],
      ["Tải lại trang (F5)", async () => { await page.reload(); }],
      ["Rê chuột vào '.cart-icon-wrapper, .nv-nav-cart, .cart-count'", async () => { await page.locator('.cart-icon-wrapper, .nv-nav-cart, .cart-count').first().hover(); }],
      ["Lấy dữ liệu \"sub\": await page.locator('.woocommerce-mini-cart__total…", async () => { sub = await page.locator('.woocommerce-mini-cart__total .amount').first().innerText(); }],
    ],
    er: [
      [tcER(1, 1, "expect(num(sub)).toBe(60)"), async () => { expect(num(sub)).toBe(60); }],
    ],
    post: cartPost(page),
  });
});

test('CART-TC023 Tổng giỏ hàng đúng khi số lượng cực lớn', async ({ page }) => {
  const qty = 99999999999999;
  let total: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addBySlug(page, 'bold-statement-graphic-tee')", async () => { await addBySlug(page, 'bold-statement-graphic-tee'); }],
      ["Truy cập ${B}/cart/", async () => { await page.goto(`${B}/cart/`); }],
      ["Nhập String(qty) vào 'input.qty'", async () => { await page.locator('input.qty').first().fill(String(qty)); }],
      ["Click 'button[name=\"update_cart\"]'", async () => { await page.locator('button[name="update_cart"]').click(); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForLoadState('load'); }],
      ["Lấy dữ liệu \"err\": await page.locator('.woocommerce-error').count()", async () => { const err = await page.locator('.woocommerce-error').count();
      if (err) return; }],
      ["Lấy dữ liệu \"total\": num(await page.locator('.cart_totals .order-total…", async () => { total = num(await page.locator('.cart_totals .order-total .amount').first().innerText()); }],
    ],
    er: [
      [tcER(1, 1, "expect(total).toBeGreaterThanOrEqual(qty * 15)"), async () => { expect(total).toBeGreaterThanOrEqual(qty * 15); }],
    ],
    post: cartPost(page),
  });
});

// ---------------------------------------------------------------- Chuyển từ Manual sang Automated
test('CART-TC024 Số lượng có dấu cách đầu/cuối vẫn thêm/cập nhật được', async ({ page }) => {
  await page.goto(`${B}/shop/${TEE}/`);
  test.skip((await page.locator('input.qty').first().getAttribute('type')) === 'number', 'Ô số lượng là type=number nên không nhập được dấu cách');
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thêm sản phẩm vào giỏ với số lượng có dấu cách (' 2', '2 ')", async () => {
        for (const v of [' 2', '2 ']) {
          await page.goto(`${B}/shop/${TEE}/`);
          await page.locator('input.qty').first().fill(v);
          await page.locator('button.single_add_to_cart_button').first().click();
          await expect(page.locator('.woocommerce-message'), `Thêm vào giỏ với số lượng "${v}" bị lỗi`).toBeVisible({ timeout: 15_000 });
        }
      }],
      ["Mở /cart/ và cập nhật số lượng có dấu cách (' 3', '3 ')", async () => {
        await page.goto('/cart/');
        for (const v of [' 3', '3 ']) {
          await updateQty(page, v);
          await expect(qty(page), `Cập nhật giỏ với số lượng "${v}" không thành công`).toHaveValue('3');
        }
      }],
    ],
    er: [
      [tcER(1, 1, "expect(qty(page)).toHaveValue('3')"), async () => { await expect(qty(page)).toHaveValue('3'); }],
    ],
    post: cartPost(page),
  });
});

test('CART-TC025 Thông báo sau khi xóa sản phẩm khỏi giỏ không lẫn mã HTML', async ({ page }) => {
  let text = '';
  await runFlow({
    pre: [
      ['Kiểm tra site truy cập được (GET /cart/)', () => apiHealthCheck(page.request, '/cart/')],
      ['Thêm 1 sản phẩm vào giỏ hàng', () => addToCart(page, TEE, 1)],
    ],
    main: [
      ['Mở trang giỏ hàng (/cart/)', async () => { await page.goto('/cart/'); }],
      ['Click nút xóa (×) ở sản phẩm đầu tiên', () => page.locator('tr.cart_item a.remove').first().click()],
      ['Đọc nội dung thông báo sau khi xóa', async () => { text = (await page.locator('.woocommerce-message').first().innerText()).trim(); }],
    ],
    er: [
      ['Thông báo có nội dung "removed" (đã xóa sản phẩm)', async () => { expect(text).toMatch(/removed/i); }],
      ['Thông báo không lẫn mã HTML (<br>, <li>, </div>)', async () => { expect(text, `Thông báo đang là: ${text}`).not.toMatch(/[<>]/); }],
    ],
    post: [
      ['Xóa sạch giỏ hàng bằng API (remove_item)', async () => { await apiClearCart(page.request); }],
    ],
  });
});
