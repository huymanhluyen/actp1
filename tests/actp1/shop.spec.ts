import { Page, expect, test } from '@playwright/test';
import { PRODUCTS, Product, SERVER_ERR, WIDGET_COUNTS, allShopCards, currentPrice, money, readCards } from './helpers';

async function sortBy(page: Page, value: string) {
  await page.goto('/shop/');
  await Promise.all([page.waitForNavigation(), page.selectOption('select.orderby', value)]);
}

async function prices(page: Page): Promise<number[]> {
  const c = page.locator('ul.products li.product');
  const out: number[] = [];
  for (let i = 0; i < (await c.count()); i++) out.push(await currentPrice(c.nth(i)));
  return out;
}

const near = (a: number, b: number) => Math.abs(a - b) < 0.01;

const SORTS = [
  { id: 'SHOP-TC011', value: 'popularity', label: 'Sort by popularity' },
  { id: 'SHOP-TC012', value: 'rating',     label: 'Sort by average rating' },
  { id: 'SHOP-TC013', value: 'date',       label: 'Sort by latest' },
];

const CATEGORIES = [
  { id: 'SHOP-TC015', path: '/category/clothing/dresses/', label: 'Dresses', count: 4 },
  { id: 'SHOP-TC016', path: '/category/clothing/tshirt/', label: 'Tshirt', count: 3 },
  { id: 'SHOP-TC017', path: '/category/blouse/', label: 'Blouse', count: 1, names: ['Classic Striped Knit Blouse'] },
  { id: 'SHOP-TC018', path: '/category/clothing/', label: 'Clothing', count: 7 },
  { id: 'SHOP-TC019', path: '/category/uncategorized/', label: 'Uncategorized', count: 1 },
];

// Striped Midi Dress = SHOP-TC023, Sunset Glow = SHOP-TC024; các sản phẩm còn lại chạy thêm để biết lỗi có lan rộng không (không gắn TC).
const idOf = (name: string) =>
  name === 'Sophisticated Striped Midi Dress' ? 'SHOP-TC023' : name === 'Sunset Glow Utility Dress' ? 'SHOP-TC024' : 'SHOP-EXTRA';

const B = process.env.BASE_URL || 'https://actp1.csc.edu.vn';

test('SHOP-TC004 3 sản phẩm sale có nhãn Sale! và giá gốc gạch ngang', async ({ page }) => {
  const cards = await allShopCards(page);
  expect(cards.filter((c) => c.onsale), 'Số sản phẩm có nhãn Sale!').toHaveLength(3);
  for (const p of PRODUCTS.filter((x) => x.regular)) {
    const c = cards.find((x) => x.name === p.name);
    expect(c, `Không thấy "${p.name}" trên /shop/`).toBeTruthy();
    expect(c!.onsale, `${p.name} thiếu nhãn Sale!`).toBe(true);
    expect(c!.regular, `${p.name} giá gốc`).toBe(p.regular);
    expect(c!.price, `${p.name} giá sale`).toBe(p.price);
  }
});

test('SHOP-TC009 Sắp xếp giá thấp → cao', async ({ page }) => {
  await sortBy(page, 'price');
  const p = await prices(page);
  expect(p).toEqual([...p].sort((a, b) => a - b));
});

test('SHOP-TC010 Sắp xếp giá cao → thấp', async ({ page }) => {
  await sortBy(page, 'price-desc');
  const p = await prices(page);
  expect(p).toEqual([...p].sort((a, b) => b - a));
  expect(p[0]).toBe(400.0);
});

for (const s of SORTS) {
  test(`${s.id} Chọn "${s.label}" → orderby=${s.value}, không lỗi`, async ({ page }) => {
    await page.goto('/shop/');
    await Promise.all([page.waitForNavigation(), page.selectOption('select.orderby', s.value)]);
    expect(page.url()).toContain(`orderby=${s.value}`);
    expect(SERVER_ERR.test(await page.content())).toBe(false);
    expect(await page.locator('ul.products li.product').count()).toBeGreaterThan(0);
  });
}

test('SHOP-TC014 orderby không hợp lệ (abc) vẫn hiển thị danh sách mặc định', async ({ page }) => {
  const resp = await page.goto('/shop/?orderby=abc');
  expect(resp!.status()).toBeLessThan(500);
  expect(SERVER_ERR.test(await page.content())).toBe(false);
  expect(await page.locator('ul.products li.product').count()).toBeGreaterThan(0);
});

for (const c of CATEGORIES) {
  test(`${c.id} Danh mục ${c.label} hiển thị ${c.count} sản phẩm`, async ({ page }) => {
    const resp = await page.goto(c.path);
    expect(resp!.status()).toBe(200);
    const cards = await readCards(page);
    expect(cards.map((x) => x.name), 'Danh sách sản phẩm trong danh mục').toHaveLength(c.count);
    if (c.names) expect(cards.map((x) => x.name)).toEqual(c.names);
    expect(c.count).toBe(WIDGET_COUNTS[c.label]);              // khớp số trong widget Product categories
  });
}

test('SHOP-TC022 Giá sản phẩm đúng và nhất quán khi tải lại trang Shop 10 lần', async ({ page }) => {
  const expected = new Map(PRODUCTS.map((p) => [p.name, p.price]));
  const errors: string[] = [];
  for (let i = 1; i <= 10; i++) {
    await (i === 1 ? page.goto('/shop/') : page.reload());
    for (const c of await readCards(page)) {
      const want = expected.get(c.name);
      const ok = want !== undefined ? near(c.price, want) : c.price > 0 && c.price < 5000;   // sản phẩm chưa có giá chuẩn: chỉ chặn giá bất thường
      if (!ok) errors.push(`Lần ${i}: ${c.name} = ${c.price}${want !== undefined ? ` (đúng: ${want})` : ''}`);
    }
  }
  expect(errors, errors.join('\n')).toEqual([]);
});

for (const p of PRODUCTS) {
  test(`${idOf(p.name)} Click "${p.name}" mở đúng trang chi tiết`, async ({ page }) => {
    const card = (await allShopCards(page)).find((c) => c.name === p.name);
    expect(card, `Không thấy "${p.name}" ở danh sách sản phẩm`).toBeTruthy();

    expect((await page.request.get(card!.href)).status(), `Link ${card!.href} phải trả về 200`).toBe(200);

    // quay về trang chứa sản phẩm rồi click thật như người dùng
    await page.goto('/shop/');
    let link = page.locator('ul.products li.product', { hasText: p.name }).locator('a[href]').first();
    if (!(await link.count())) {
      await page.goto('/shop/page/2/');
      link = page.locator('ul.products li.product', { hasText: p.name }).locator('a[href]').first();
    }
    await link.click();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1.product_title')).toHaveText(p.name);
    if (p.slug) expect(page.url()).toContain(`/shop/${p.slug}/`);
    // sản phẩm sale: <del> giá gốc đứng trước <ins> giá sale → phải lấy giá trong <ins>, không phải .first() của cả hai
    const sale = page.locator('p.price ins .woocommerce-Price-amount');
    const priceEl = (await sale.count()) ? sale.first() : page.locator('p.price .woocommerce-Price-amount').first();
    const price = money(await priceEl.innerText());
    expect(near(price, p.price), `Giá ở trang chi tiết = ${price}, đúng: ${p.price}`).toBe(true);
  });
}

test('SHOP-TC025 Breadcrumb trang Shop dùng dấu phân cách hợp lệ', async ({ page }) => {
  await page.goto('/shop/');
  const bc = page.locator('.woocommerce-breadcrumb, nav[aria-label*="breadcrumb" i]').first();
  await expect(bc, 'Không thấy breadcrumb').toBeVisible();
  const text = (await bc.innerText()).replace(/\s+/g, ' ');
  expect(text, `Breadcrumb hiện: "${text}"`).not.toContain('\\');
  expect(text).toMatch(/Home\s*[\/>»]\s*Shop/);
});

test("SHOP-TC026 Danh mục mặc định 'Uncategorized' không hiển thị cho khách", async ({ page }) => {
  await page.goto('/shop/');
  const text = await page.locator('body').innerText();
  expect(text, "Trang Shop đang hiển thị 'Uncategorized'").not.toMatch(/Uncategorized/i);
});

test('SHOP-TC027 Giá các sản phẩm trong danh mục T-Shirt hợp lý (không vượt $100)', async ({ page }) => {
  await page.goto('/category/clothing/tshirt/');
  const cards = await readCards(page);
  expect(cards.length, 'Danh mục T-Shirt không có sản phẩm').toBeGreaterThan(0);
  const high = cards.filter((c) => c.price > 100).map((c) => `${c.name}: $${c.price}`);
  expect(high, `Giá cao bất thường: ${high.join(', ')} (tất cả: ${cards.map((c) => '$' + c.price).join(', ')})`).toEqual([]);
});

test('SHOP-TC028 Nút ở danh sách Shop đủ lớn để chạm trên mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/shop/');
  const sizes = await page.$$eval('a.button, button', (els) =>
    els.map((e) => { const r = e.getBoundingClientRect(); return { text: (e.textContent ?? '').trim().slice(0, 30) || e.getAttribute('aria-label') || e.tagName, w: Math.round(r.width), h: Math.round(r.height) }; })
       .filter((s) => s.w > 0 && s.h > 0));
  expect(sizes.length, 'Không tìm thấy nút nào ở trang Shop').toBeGreaterThan(0);
  const small = sizes.filter((s) => s.h < 24).map((s) => `${s.text}: ${s.w}x${s.h}px`);
  expect(small, small.join('\n')).toEqual([]);
});

test('SHOP-TC030 Sắp xếp được giữ khi sang trang 2', async ({ page }) => {
  await page.goto(`${B}/shop/?orderby=price`);
  await page.locator('a.page-numbers', { hasText: /^2$/ }).first().click();
  await expect(page).toHaveURL(/orderby=price/);
  await expect(page.locator('select.orderby')).toHaveValue('price');
});

test('SHOP-TC031 Sắp xếp được giữ khi đổi danh mục', async ({ page }) => {
  await page.goto(`${B}/shop/`);
  await page.locator('select.orderby').selectOption('price');
  await page.waitForURL(/orderby=price/);
  await page.locator('.widget_product_categories a', { hasText: /^Dresses$/ }).first().click();
  await expect(page).toHaveURL(/orderby=price/);
  await expect(page.locator('select.orderby')).toHaveValue('price');
});
