import { Page, expect, test } from '@playwright/test';
import { Billing, SERVER_ERR, TEE, addToCart, choosePayment, collectDialogs, fillBilling, placeOrder, register, stripRequired } from './helpers';

async function checkout(page: Page, q = 1) {
  await addToCart(page, TEE, q);
  await page.goto('/checkout/');
  await expect(page.locator('#billing_first_name')).toBeVisible();
}

async function placeFail(page: Page, over: Partial<Billing>) {
  await checkout(page);
  await fillBilling(page, over);
  await choosePayment(page);
  await stripRequired(page);
  await page.locator('#place_order').click();
  await expect(page.locator('.woocommerce-error, .woocommerce-NoticeGroup-checkout').first()).toBeVisible({ timeout: 15_000 });
  return page.locator('.woocommerce-error').innerText();
}

const B = process.env.BASE_URL || 'https://actp1.csc.edu.vn';

async function addBySlug(page: Page, slug: string) {
  await page.goto(`${B}/shop/${slug}/`);
  await page.locator('button.single_add_to_cart_button').first().click();
  await page.waitForSelector('.woocommerce-message, .woocommerce-error', { timeout: 15000 });
}

async function fillBillingMinimal(page: Page) {
  const f = (s: string, v: string) => page.locator(s).fill(v);
  await f('#billing_first_name', 'Test'); await f('#billing_last_name', 'QA');
  await f('#billing_address_1', '1 Test Street'); await f('#billing_city', 'Hanoi');
  await f('#billing_postcode', '10000'); await f('#billing_phone', '0900000000');
  await f('#billing_email', 'qa.test@example.com');
}

test('CHK-TC004 Submit form trống', async ({ page }) => {
  await checkout(page);
  await stripRequired(page);
  await page.locator('#place_order').click();
  const err = page.locator('.woocommerce-error');
  await expect(err).toBeVisible({ timeout: 15_000 });
  const t = (await err.innerText()).toLowerCase();
  for (const f of ['First name', 'Last name', 'Street address', 'Town / City', 'Phone', 'Email address'])
    expect(t, `thiếu lỗi cho ${f}`).toContain(f.toLowerCase());
});

test('CHK-TC005 Email sai định dạng', async ({ page }) => { expect(await placeFail(page, { email: 'abc' })).toMatch(/email/i); });

test('CHK-TC006 Số điện thoại sai định dạng', async ({ page }) => { expect(await placeFail(page, { phone: 'abcdef' })).toMatch(/phone/i); });

test('CHK-TC007 Postcode sai định dạng theo quốc gia (US)', async ({ page }) => { expect(await placeFail(page, { postcode: 'abc' })).toMatch(/postcode|zip/i); });

test('CHK-TC008 Tên chứa mã XSS', async ({ page }) => {
  const msgs = collectDialogs(page);
  await checkout(page);
  await fillBilling(page, { first: "<script>alert('xss2')</script>" });
  await choosePayment(page);
  await page.locator('#place_order').click();
  await page.waitForTimeout(4000);
  expect(msgs.some((m) => m.includes('xss2')), JSON.stringify(msgs)).toBe(false);
  expect(SERVER_ERR.test(await page.content())).toBe(false);
});

test('CHK-TC011 Guest đặt hàng với thông tin hợp lệ', async ({ page }) => {
  await addToCart(page, TEE, 1);
  await placeOrder(page);
  await expect(page.locator('.woocommerce-order')).toContainText(/Order number|Thank you/i);
  await expect(page.locator('.woocommerce-order-overview__order strong')).toBeVisible();
});

test('CHK-TC012 Trang Order received hiển thị đúng thông tin', async ({ page }) => {
  await addToCart(page, TEE, 2);
  await placeOrder(page, { email: 'order.check@example.com' });
  const body = await page.locator('.woocommerce-order').innerText();
  expect(body).toContain('order.check@example.com');
  expect(body).toContain('30.00');
  expect(body).toContain('Bold Statement Graphic Tee');
});

test('CHK-TC014 Đặt hàng khi đã đăng nhập, đơn xuất hiện trong My account > Orders', async ({ page }) => {
  await register(page);
  await addToCart(page, TEE, 1);
  await placeOrder(page);
  await page.goto('/my-account/orders/');
  expect(await page.locator('table.woocommerce-orders-table tbody tr').count()).toBeGreaterThanOrEqual(1);
});

test('CHK-TC015 Order notes có giới hạn ký tự', async ({ page }) => {
  await addBySlug(page, 'bold-statement-graphic-tee');
  await page.goto(`${B}/checkout/`);
  await fillBillingMinimal(page);
  await page.locator('#order_comments').fill('x'.repeat(10000));
  const len = (await page.locator('#order_comments').inputValue()).length;
  expect(len).toBeLessThan(10000); // fail => BUG-045 (không giới hạn)
});

test('CHK-TC016 Company/Apartment hiển thị sau khi đặt hàng', async ({ page }) => {
  await addBySlug(page, 'bold-statement-graphic-tee');
  await page.goto(`${B}/checkout/`);
  await fillBillingMinimal(page);
  const company = 'C'.repeat(100), apt = 'A'.repeat(60);
  await page.locator('#billing_company').fill(company);
  await page.locator('#billing_address_2').fill(apt);
  await page.locator('#place_order').click();
  await page.waitForURL(/order-received/, { timeout: 30000 });
  const text = await page.locator('.woocommerce-order').innerText();
  expect(text).toContain(company); expect(text).toContain(apt); // fail => BUG-047
});

test('CHK-TC017 ZIP không thuộc bang đã chọn bị từ chối', async ({ page }) => {
  await addBySlug(page, 'bold-statement-graphic-tee');
  await page.goto(`${B}/checkout/`);
  await fillBillingMinimal(page);
  await page.locator('#ship-to-different-address-checkbox').check();
  await page.locator('#shipping_country').selectOption('US').catch(() => {});
  await page.locator('#shipping_state').selectOption('CA').catch(() => {});
  const f = (s: string, v: string) => page.locator(s).fill(v);
  await f('#shipping_first_name', 'Test'); await f('#shipping_last_name', 'QA');
  await f('#shipping_address_1', '1 Test Street'); await f('#shipping_city', 'Los Angeles');
  await f('#shipping_postcode', '10001'); // mã NY nhưng bang CA
  await page.locator('#place_order').click();
  await expect(page.locator('.woocommerce-error')).toBeVisible({ timeout: 15000 }); // fail => BUG-049
});
