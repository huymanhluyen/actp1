import { Page, Locator, expect } from '@playwright/test';

export const TEE = 'bold-statement-graphic-tee';   
export const HAT = 'floral-elegance-sun-hat';      
export const STRONG_PWD = 'Tc!9xQ#vLp2026-Zz';
export const SERVER_ERR = /Internal Server Error|critical error on this website|Fatal error/i;

export function money(text: string): number {
  const m = text.replace(/,/g, '').match(/(\d[\d,]*\.?\d*)/);
  return parseFloat(m![1]);
}

/** Giá hiện tại của 1 phần tử chứa .price (ưu tiên <ins> nếu đang sale). */
export async function currentPrice(el: Locator): Promise<number> {
  const ins = el.locator('.price ins .woocommerce-Price-amount');
  if (await ins.count()) return money(await ins.first().innerText());
  return money(await el.locator('.price .woocommerce-Price-amount').first().innerText());
}

export async function cartCount(page: Page): Promise<number> {
  const txt = await page.locator("a[href*='/cart']").filter({ hasText: /\d/ }).first().innerText();
  return parseInt(txt.match(/(\d+)/)![1], 10);
}

export async function addToCart(page: Page, slug: string = TEE, qty = 1) {
  await page.goto(`/shop/${slug}/`);
  await page.locator('input.qty').fill(String(qty));
  await page.locator('button.single_add_to_cart_button').click();
  await expect(page.locator('.woocommerce-message').first()).toBeVisible();
}

/** Gỡ thuộc tính required để kiểm tra validation phía server. */
export async function stripRequired(page: Page) {
  await page.evaluate(() => document.querySelectorAll('[required]').forEach((e) => e.removeAttribute('required')));
}

export function uniqueEmail(prefix = 'qa'): string {
  return `${prefix}${Date.now()}${Math.random().toString(16).slice(2, 7)}@example.com`;
}

const registerForm = (page: Page) => page.locator('form.woocommerce-form-register');
const loginForm = (page: Page) => page.locator('form.woocommerce-form-login');

export async function registerOnPage(page: Page, email: string, pwd: string) {
  const form = registerForm(page);
  await form.getByLabel('Email address').fill(email);
  await form.getByLabel('Password').pressSequentially(pwd); 
  const btn = form.getByRole('button', { name: 'Register' });
  await expect(btn).toBeEnabled();
  await btn.click();
}

/** Tạo tài khoản mới từ đầu: mở trang, đăng ký, chờ vào được dashboard. */
export async function register(page: Page, email: string = uniqueEmail(), pwd: string = STRONG_PWD) {
  await page.goto('/my-account/');
  await registerOnPage(page, email, pwd);
  await expect(page.locator('.woocommerce-MyAccount-navigation')).toBeVisible();
  return { email, pwd };
}

/** Đăng nhập (đang đứng ở trang /my-account/). Nút có thể ghi "Log in" hoặc "Logg in". */
export async function loginOnPage(page: Page, user: string, pwd: string) {
  const form = loginForm(page);
  await form.getByLabel('Username or email address').fill(user);
  await form.getByLabel('Password').fill(pwd);
  await form.getByRole('button', { name: /logg? in/i }).click();
}

export async function login(page: Page, user: string, pwd: string) {
  await page.goto('/my-account/');
  await loginOnPage(page, user, pwd);
}

/** Đăng xuất bằng cách xóa cookie đăng nhập rồi mở lại trang tài khoản. */
export async function logout(page: Page) {
  await page.context().clearCookies();
  await page.goto('/my-account/');
}

export async function setCountryState(page: Page, prefix = 'billing', country = 'US', state = 'NY') {
  await page.evaluate(
    ([p, c]) => {
      const $ = (window as any).jQuery;
      $('#' + p + '_country').val(c).trigger('change');
    },
    [prefix, country],
  );
  await page.waitForTimeout(800);
  await page.evaluate(
    ([p, s]) => {
      const $ = (window as any).jQuery;
      const e = $('#' + p + '_state');
      if (e.length) e.val(s).trigger('change');
    },
    [prefix, state],
  );
}

export interface Billing { first: string; last: string; addr: string; city: string; postcode: string; phone: string; email: string }

export async function fillBilling(page: Page, over: Partial<Billing> = {}) {
  const d: Billing = {
    first: 'Test', last: 'Playwright', addr: '123 Test Street', city: 'New York',
    postcode: '10001', phone: '2125551234', email: uniqueEmail('chk'), ...over,
  };
  await setCountryState(page);
  await page.fill('#billing_first_name', d.first);
  await page.fill('#billing_last_name', d.last);
  await page.fill('#billing_address_1', d.addr);
  await page.fill('#billing_city', d.city);
  await page.fill('#billing_postcode', d.postcode);
  await page.fill('#billing_phone', d.phone);
  if (await page.locator('#billing_email').isEditable()) await page.fill('#billing_email', d.email);
  return d;
}

export async function choosePayment(page: Page) {
  const radios = page.locator("input[name='payment_method']");
  if (await radios.count()) {
    const first = radios.first();
    if (!(await first.isChecked())) await first.check({ force: true });
  }
}

export async function placeOrder(page: Page, over: Partial<Billing> = {}) {
  await page.goto('/checkout/');
  await expect(page.locator('#billing_first_name')).toBeVisible();
  await fillBilling(page, over);
  await choosePayment(page);
  await page.locator('#place_order').click();
  await expect(page).toHaveURL(/order-received/, { timeout: 60_000 });
}

export async function productTitles(page: Page): Promise<string[]> {
  const t = await page.locator('ul.products li.product .woocommerce-loop-product__title').allInnerTexts();
  return t.map((x) => x.trim());
}

/** Gom các hộp thoại alert() để kiểm tra XSS. */
export function collectDialogs(page: Page): string[] {
  const msgs: string[] = [];
  page.on('dialog', (d) => { msgs.push(d.message()); d.dismiss().catch(() => {}); });
  return msgs;
}

// ============================== Dữ liệu chuẩn của site (sản phẩm, danh mục, trang chính)
export const BASE = 'https://actp1.csc.edu.vn';

/** Dữ liệu chuẩn của sản phẩm (lấy từ Project Report). `regular` chỉ có khi sản phẩm đang sale. */
export interface Product { name: string; price: number; regular?: number; slug?: string }

export const PRODUCTS: Product[] = [
  { name: 'Bold Statement Graphic Tee',          price: 15,  regular: 18, slug: 'bold-statement-graphic-tee' },
  { name: 'Floral Elegance Sun Hat',             price: 45,  slug: 'floral-elegance-sun-hat' },
  { name: 'Golden Glow Ribbed Knit Dress',       price: 12,  regular: 15 },
  { name: 'Midnight Bloom Crochet Dress',        price: 35 },
  { name: 'Radiant One-Shoulder T-Shirt',        price: 335 },
  { name: 'Sophisticated Ribbed Turtleneck Tee', price: 12,  regular: 15 },
  { name: 'Sophisticated Striped Midi Dress',    price: 400, slug: 'sophisticated-striped-midi-dress' },
  { name: 'Sunset Glow Utility Dress',           price: 135, slug: 'sunset-glow-utility-dress' },
];

/** Số lượng sản phẩm theo danh mục (widget Product categories + trang danh mục). */
export const WIDGET_COUNTS: Record<string, number> = { Blouse: 1, Clothing: 7, Dresses: 4, Tshirt: 3, Uncategorized: 1 };

export interface Card { name: string; href: string; price: number; regular: number | null; onsale: boolean }

/** Đọc toàn bộ thẻ sản phẩm (tên, link, giá hiện tại, giá gốc, nhãn Sale!) trên trang đang mở. */
export async function readCards(page: Page): Promise<Card[]> {
  return page.$$eval('ul.products li.product', (lis) =>
    lis.map((li) => {
      const num = (s?: string | null) => (s ? parseFloat(s.replace(/[^0-9.]/g, '')) : NaN);
      const ins = li.querySelector('.price ins .woocommerce-Price-amount')?.textContent;
      const del = li.querySelector('.price del .woocommerce-Price-amount')?.textContent;
      const any = li.querySelector('.price .woocommerce-Price-amount')?.textContent;
      return {
        name: (li.querySelector('.woocommerce-loop-product__title')?.textContent ?? '').trim(),
        href: (li.querySelector('a[href]') as HTMLAnchorElement | null)?.href ?? '',
        price: num(ins ?? any),
        regular: del ? num(del) : null,
        onsale: !!li.querySelector('.onsale'),
      };
    }),
  );
}

/** Gom sản phẩm của tất cả các trang /shop/ (trang 1, 2, ...). */
export async function allShopCards(page: Page): Promise<Card[]> {
  const out: Card[] = [];
  for (let n = 1; n <= 5; n++) {
    const resp = await page.goto(n === 1 ? '/shop/' : `/shop/page/${n}/`);
    if (!resp || resp.status() >= 400) break;
    const cards = await readCards(page);
    if (!cards.length) break;
    out.push(...cards);
  }
  return out;
}

/** 6 trang chính dùng cho các kiểm tra responsive, title, thời gian tải... */
export const MAIN_PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop/' },
  { name: 'Product Detail', path: '/shop/bold-statement-graphic-tee/' },
  { name: 'Cart', path: '/cart/' },
  { name: 'My account', path: '/my-account/' },
  { name: 'Blog', path: '/blog/' },
];

// ------------------------------ Dùng chung cho các test security / quality
export const noFollow = { maxRedirects: 0 };      // không đi theo redirect để đọc mã và header Location

/** Cuộn hết trang để các ảnh lazy-load được tải. */
export async function scrollToBottom(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); }
    window.scrollTo(0, 0);
  });
}

/** URL của các ảnh không có alt (thiếu hoặc rỗng) trong phạm vi selector. */
export async function imagesWithoutAlt(page: Page, scope = 'body') {
  await scrollToBottom(page);
  return page.$$eval(`${scope} img`, (imgs) =>
    imgs.filter((i) => !(i.getAttribute('alt') ?? '').trim()).map((i) => (i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src));
}
