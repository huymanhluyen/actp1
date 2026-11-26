/**
 * CART – Giỏ hàng, cập nhật số lượng, coupon
 * Mỗi test bắt đầu bằng TC ID trong Project Report (VD: CART-TC006).
 * Chạy riêng module: npx playwright test tests/actp1/cart.spec.ts
 */
import { Page, expect, test } from '@playwright/test';
import { HAT, SERVER_ERR, TEE, addToCart, money } from './helpers';

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
  await addToCart(page, TEE, 1);
  await addToCart(page, HAT, 1);
  await page.goto('/cart/');
  expect(money(await page.locator('.cart-subtotal .amount').first().innerText())).toBe(60.0);
});

test('CART-TC009 Tăng số lượng 1 → 3 và cập nhật', async ({ page }) => {
  await addToCart(page, TEE, 1);
  await page.goto('/cart/');
  await updateQty(page, '3');
  await expect(page.locator(`${ROW} .product-subtotal`)).toContainText('45.00');
  await expect(page.locator('.woocommerce-message').first()).toContainText('Cart updated');
});

test('CART-TC010 Giảm số lượng 3 → 1', async ({ page }) => {
  await addToCart(page, TEE, 3);
  await page.goto('/cart/');
  await updateQty(page, '1');
  await expect(page.locator(`${ROW} .product-subtotal`)).toContainText('15.00');
});

test('CART-TC011 Quantity = 0 xóa sản phẩm khỏi giỏ', async ({ page }) => {
  await addToCart(page, TEE, 1);
  await page.goto('/cart/');
  await updateQty(page, '0');
  await expect(page.locator('.cart-empty')).toBeVisible();
});

test('CART-TC012 Quantity âm không được chấp nhận', async ({ page }) => {
  await addToCart(page, TEE, 1);
  await page.goto('/cart/');
  await qty(page).fill('-2');
  await page.locator("button[name='update_cart']").click({ force: true });
  await page.waitForTimeout(1500);
  await page.goto('/cart/');
  expect(await qty(page).inputValue()).toBe('1');
  expect(money(await page.locator(`${ROW} .product-subtotal`).innerText())).toBe(15.0);
});

test('CART-TC013 Quantity rất lớn (99999)', async ({ page }) => {
  await addToCart(page, TEE, 1);
  await page.goto('/cart/');
  await updateQty(page, '99999');
  expect(SERVER_ERR.test(await page.content())).toBe(false);
  if (await page.locator(ROW).count()) {
    const q = parseInt(await qty(page).inputValue(), 10);
    expect(Math.abs(money(await page.locator(`${ROW} .product-subtotal`).innerText()) - q * 15)).toBeLessThan(0.01);
  }
});

test('CART-TC017 Apply coupon không tồn tại', async ({ page }) => {
  await addToCart(page, TEE, 1);
  await page.goto('/cart/');
  await page.fill('#coupon_code', 'INVALID123');
  await page.locator("button[name='apply_coupon']").click();
  await page.waitForTimeout(2000);
  await expect(page.locator('.woocommerce-error')).toContainText(/does not exist/i);
  expect(money(await page.locator('.order-total .amount').first().innerText())).toBe(15.0);
});

test('CART-TC022 Subtotal mini cart đúng sau khi F5', async ({ page }) => {
  await addBySlug(page, 'bold-statement-graphic-tee');
  await addBySlug(page, 'floral-elegance-sun-hat');
  await page.goto(`${B}/shop/`); await page.reload();
  await page.locator('.cart-icon-wrapper, .nv-nav-cart, .cart-count').first().hover();
  const sub = await page.locator('.woocommerce-mini-cart__total .amount').first().innerText();
  expect(num(sub)).toBe(60);
});

test('CART-TC023 Tổng giỏ hàng đúng khi số lượng cực lớn', async ({ page }) => {
  await addBySlug(page, 'bold-statement-graphic-tee');
  await page.goto(`${B}/cart/`);
  const qty = 99999999999999;
  await page.locator('input.qty').first().fill(String(qty));
  await page.locator('button[name="update_cart"]').click();
  await page.waitForLoadState('load');
  const err = await page.locator('.woocommerce-error').count();
  if (err) return; // báo lỗi giới hạn số lượng cũng chấp nhận
  const total = num(await page.locator('.cart_totals .order-total .amount').first().innerText());
  expect(total).toBeGreaterThanOrEqual(qty * 15); // fail => BUG-046 (bị chặn ở mức 1e15)
});
