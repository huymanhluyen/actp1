import { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { Billing, SERVER_ERR, TEE, addToCart, choosePayment, collectDialogs, fillBilling, placeOrder, register, stripRequired } from './helpers';
import { autoPre, cartPost, runFlow, tcER } from './flow';

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
  const err = page.locator('.woocommerce-error');
  let t: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thêm 1 sản phẩm vào giỏ", async () => { await checkout(page); }],
      ["Truy cập https://actp1.csc.edu.vn/checkout/", async () => { await stripRequired(page); }],
      ["Không nhập bất kỳ thông tin nào ở phần Billing details", async () => { await page.locator('#place_order').click(); }],
      ["Click nút 'Place order'", async () => { await expect(err).toBeVisible({ timeout: 15_000 }); }],
      ["Kiểm tra báo lỗi các trường bắt buộc (First name, Last name, Address, City, Phone, Email...)", async () => { t = (await err.innerText()).toLowerCase(); }],
    ],
    er: [
      [tcER(1, 1, "for (const f of ['First name', 'Last name', 'Street address…"), async () => { for (const f of ['First name', 'Last name', 'Street address', 'Town / City', 'Phone', 'Email address'])
          expect(t, `thiếu lỗi cho ${f}`).toContain(f.toLowerCase()); }],
    ],
    post: cartPost(page),
  });
});

test('CHK-TC005 Email sai định dạng', async ({ page }) => {
  let errMsg = '';
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Đặt hàng với email sai định dạng ('abc')", async () => { errMsg = await placeFail(page, { email: 'abc' }); }],
    ],
    er: [
      [tcER(1, 1, "expect(errMsg).toMatch(/email/i)"), async () => { expect(errMsg).toMatch(/email/i); }],
    ],
    post: cartPost(page),
  });
});

test('CHK-TC006 Số điện thoại sai định dạng', async ({ page }) => {
  let errMsg = '';
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Đặt hàng với số điện thoại sai định dạng ('abcdef')", async () => { errMsg = await placeFail(page, { phone: 'abcdef' }); }],
    ],
    er: [
      [tcER(1, 1, "expect(errMsg).toMatch(/phone/i)"), async () => { expect(errMsg).toMatch(/phone/i); }],
    ],
    post: cartPost(page),
  });
});

test('CHK-TC007 Postcode sai định dạng theo quốc gia (US)', async ({ page }) => {
  let errMsg = '';
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Đặt hàng với postcode sai định dạng ('abc')", async () => { errMsg = await placeFail(page, { postcode: 'abc' }); }],
    ],
    er: [
      [tcER(1, 1, "expect(errMsg).toMatch(/postcode|zip/i)"), async () => { expect(errMsg).toMatch(/postcode|zip/i); }],
    ],
    post: cartPost(page),
  });
});

test('CHK-TC008 Tên chứa mã XSS', async ({ page }) => {
  const msgs = collectDialogs(page);
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: checkout(page)", async () => { await checkout(page); }],
      ["Thực hiện: fillBilling(page, { first: \"<script>alert('xss2')</script>\"…", async () => { await fillBilling(page, { first: "<script>alert('xss2')</script>" }); }],
      ["Thực hiện: choosePayment(page)", async () => { await choosePayment(page); }],
      ["Click '#place_order'", async () => { await page.locator('#place_order').click(); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForTimeout(4000); }],
    ],
    er: [
      [tcER(1, 2, "expect(msgs.some((m) => m.includes('xss2')), JSON.stringify…"), async () => { expect(msgs.some((m) => m.includes('xss2')), JSON.stringify(msgs)).toBe(false); }],
      [tcER(2, 2, "expect(SERVER_ERR.test(await page.content())).toBe(false)"), async () => { expect(SERVER_ERR.test(await page.content())).toBe(false); }],
    ],
    post: cartPost(page),
  });
});

test('CHK-TC011 Guest đặt hàng với thông tin hợp lệ', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addToCart(page, TEE, 1)", async () => { await addToCart(page, TEE, 1); }],
      ["Thực hiện: placeOrder(page)", async () => { await placeOrder(page); }],
    ],
    er: [
      [tcER(1, 2, "expect(page.locator('.woocommerce-order')).toContainText(/O…"), async () => { await expect(page.locator('.woocommerce-order')).toContainText(/Order number|Thank you/i); }],
      [tcER(2, 2, "expect(page.locator('.woocommerce-order-overview__order str…"), async () => { await expect(page.locator('.woocommerce-order-overview__order strong')).toBeVisible(); }],
    ],
    post: cartPost(page),
  });
});

test('CHK-TC012 Trang Order received hiển thị đúng thông tin', async ({ page }) => {
  let body: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Đặt hàng thành công để tới trang 'Order received'", async () => { await addToCart(page, TEE, 2); }],
      ["Kiểm tra hiển thị Order number, Date, Email, Total, Payment method", async () => { await placeOrder(page, { email: 'order.check@example.com' }); }],
      ["Kiểm tra chi tiết sản phẩm (tên, số lượng, giá) khớp với đơn vừa đặt", async () => { body = await page.locator('.woocommerce-order').innerText(); }],
    ],
    er: [
      [tcER(1, 3, "expect(body).toContain('order.check@example.com')"), async () => { expect(body).toContain('order.check@example.com'); }],
      [tcER(2, 3, "expect(body).toContain('30.00')"), async () => { expect(body).toContain('30.00'); }],
      [tcER(3, 3, "expect(body).toContain('Bold Statement Graphic Tee')"), async () => { expect(body).toContain('Bold Statement Graphic Tee'); }],
    ],
    post: cartPost(page),
  });
});

test('CHK-TC014 Đặt hàng khi đã đăng nhập, đơn xuất hiện trong My account > Orders', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addToCart(page, TEE, 1)", async () => { await addToCart(page, TEE, 1); }],
      ["Thực hiện: placeOrder(page)", async () => { await placeOrder(page); }],
      ["Truy cập /my-account/orders/", async () => { await page.goto('/my-account/orders/'); }],
    ],
    er: [
      [tcER(1, 1, "expect(await page.locator('table.woocommerce-orders-table t…"), async () => { expect(await page.locator('table.woocommerce-orders-table tbody tr').count()).toBeGreaterThanOrEqual(1); }],
    ],
    post: cartPost(page),
  });
});

test('CHK-TC015 Order notes có giới hạn ký tự', async ({ page }) => {
  let len: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addBySlug(page, 'bold-statement-graphic-tee')", async () => { await addBySlug(page, 'bold-statement-graphic-tee'); }],
      ["Truy cập ${B}/checkout/", async () => { await page.goto(`${B}/checkout/`); }],
      ["Thực hiện: fillBillingMinimal(page)", async () => { await fillBillingMinimal(page); }],
      ["Nhập 'x'.repeat(10000) vào '#order_comments'", async () => { await page.locator('#order_comments').fill('x'.repeat(10000)); }],
      ["Lấy dữ liệu \"len\": (await page.locator('#order_comments').inputValue…", async () => { len = (await page.locator('#order_comments').inputValue()).length; }],
    ],
    er: [
      [tcER(1, 1, "expect(len).toBeLessThan(10000)"), async () => { expect(len).toBeLessThan(10000); }],
    ],
    post: cartPost(page),
  });
});

test('CHK-TC016 Company/Apartment hiển thị sau khi đặt hàng', async ({ page }) => {
  const company = 'C'.repeat(100), apt = 'A'.repeat(60);
  let text: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addBySlug(page, 'bold-statement-graphic-tee')", async () => { await addBySlug(page, 'bold-statement-graphic-tee'); }],
      ["Truy cập ${B}/checkout/", async () => { await page.goto(`${B}/checkout/`); }],
      ["Thực hiện: fillBillingMinimal(page)", async () => { await fillBillingMinimal(page); }],
      ["Nhập company vào '#billing_company'", async () => { await page.locator('#billing_company').fill(company); }],
      ["Nhập apt vào '#billing_address_2'", async () => { await page.locator('#billing_address_2').fill(apt); }],
      ["Click '#place_order'", async () => { await page.locator('#place_order').click(); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForURL(/order-received/, { timeout: 30000 }); }],
      ["Lấy dữ liệu \"text\": await page.locator('.woocommerce-order').innerTex…", async () => { text = await page.locator('.woocommerce-order').innerText(); }],
    ],
    er: [
      [tcER(1, 2, "expect(text).toContain(company)"), async () => { expect(text).toContain(company); }],
      [tcER(2, 2, "expect(text).toContain(apt)"), async () => { expect(text).toContain(apt); }],
    ],
    post: cartPost(page),
  });
});

test('CHK-TC017 ZIP không thuộc bang đã chọn bị từ chối', async ({ page }) => {
  const f = (s: string, v: string) => page.locator(s).fill(v);
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: addBySlug(page, 'bold-statement-graphic-tee')", async () => { await addBySlug(page, 'bold-statement-graphic-tee'); }],
      ["Truy cập ${B}/checkout/", async () => { await page.goto(`${B}/checkout/`); }],
      ["Thực hiện: fillBillingMinimal(page)", async () => { await fillBillingMinimal(page); }],
      ["Tick '#ship-to-different-address-checkbox'", async () => { await page.locator('#ship-to-different-address-checkbox').check(); }],
      ["Chọn 'US').catch(() => {} ở '#shipping_country'", async () => { await page.locator('#shipping_country').selectOption('US').catch(() => {}); }],
      ["Chọn 'CA').catch(() => {} ở '#shipping_state'", async () => { await page.locator('#shipping_state').selectOption('CA').catch(() => {}); }],
      ["Thực hiện: f('#shipping_first_name', 'Test')", async () => { await f('#shipping_first_name', 'Test'); }],
      ["Thực hiện: f('#shipping_last_name', 'QA')", async () => { await f('#shipping_last_name', 'QA'); }],
      ["Thực hiện: f('#shipping_address_1', '1 Test Street')", async () => { await f('#shipping_address_1', '1 Test Street'); }],
      ["Thực hiện: f('#shipping_city', 'Los Angeles')", async () => { await f('#shipping_city', 'Los Angeles'); }],
      ["Thực hiện: f('#shipping_postcode', '10001')", async () => { await f('#shipping_postcode', '10001'); }],
      ["Click '#place_order'", async () => { await page.locator('#place_order').click(); }],
    ],
    er: [
      [tcER(1, 1, "expect(page.locator('.woocommerce-error')).toBeVisible({ ti…"), async () => { await expect(page.locator('.woocommerce-error')).toBeVisible({ timeout: 15000 }); }],
    ],
    post: cartPost(page),
  });
});
