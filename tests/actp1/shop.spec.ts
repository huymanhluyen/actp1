import { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { Card, PRODUCTS, Product, SERVER_ERR, WIDGET_COUNTS, allShopCards, currentPrice, money, productTitles, readCards } from './helpers';
import { autoPre, cartPost, runFlow, tcER } from './flow';

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
  let cards: Card[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Đọc danh sách tất cả sản phẩm trên /shop/', async () => { cards = await allShopCards(page); }],
    ],
    er: [
      [tcER(1, 2, 'Có đúng 3 sản phẩm có nhãn Sale!'), async () => { expect(cards.filter((c) => c.onsale), 'Số sản phẩm có nhãn Sale!').toHaveLength(3); }],
      [tcER(2, 2, 'Giá gốc và giá sale của 3 sản phẩm khớp dữ liệu chuẩn'), async () => {
        for (const p of PRODUCTS.filter((x) => x.regular)) {
          const c = cards.find((x) => x.name === p.name);
          expect(c, `Không thấy "${p.name}" trên /shop/`).toBeTruthy();
          expect(c!.onsale, `${p.name} thiếu nhãn Sale!`).toBe(true);
          expect(c!.regular, `${p.name} giá gốc`).toBe(p.regular);
          expect(c!.price, `${p.name} giá sale`).toBe(p.price);
        }
      }],
    ],
  });
});

test('SHOP-TC009 Sắp xếp giá thấp → cao', async ({ page }) => {
  let p: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: sortBy(page, 'price')", async () => { await sortBy(page, 'price'); }],
      ["Lấy dữ liệu \"p\": await prices(page)", async () => { p = await prices(page); }],
    ],
    er: [
      [tcER(1, 1, "expect(p).toEqual([...p].sort((a, b) => a - b))"), async () => { expect(p).toEqual([...p].sort((a, b) => a - b)); }],
    ],
  });
});

test('SHOP-TC010 Sắp xếp giá cao → thấp', async ({ page }) => {
  let p: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: sortBy(page, 'price-desc')", async () => { await sortBy(page, 'price-desc'); }],
      ["Lấy dữ liệu \"p\": await prices(page)", async () => { p = await prices(page); }],
    ],
    er: [
      [tcER(1, 2, "expect(p).toEqual([...p].sort((a, b) => b - a))"), async () => { expect(p).toEqual([...p].sort((a, b) => b - a)); }],
      [tcER(2, 2, "expect(p[0]).toBe(400.0)"), async () => { expect(p[0]).toBe(400.0); }],
    ],
  });
});

for (const s of SORTS) {
  test(`${s.id} Chọn "${s.label}" → orderby=${s.value}, không lỗi`, async ({ page }) => {
    let count = 0;
    await runFlow({
      pre: autoPre(page),
      main: [
        [`Mở /shop/ và chọn sắp xếp "${s.label}"`, async () => {
          await page.goto('/shop/');
          await Promise.all([page.waitForNavigation(), page.selectOption('select.orderby', s.value)]);
          count = await page.locator('ul.products li.product').count();
        }],
      ],
      er: [
        [tcER(1, 3, `URL chứa orderby=${s.value}`), async () => { expect(page.url()).toContain(`orderby=${s.value}`); }],
        [tcER(2, 3, 'Trang không có lỗi server'), async () => { expect(SERVER_ERR.test(await page.content())).toBe(false); }],
        [tcER(3, 3, 'Danh sách sản phẩm hiển thị > 0'), async () => { expect(count).toBeGreaterThan(0); }],
      ],
    });
  });
}

test('SHOP-TC014 orderby không hợp lệ (abc) vẫn hiển thị danh sách mặc định', async ({ page }) => {
  let resp: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Lấy dữ liệu \"resp\": await page.goto('/shop/?orderby=abc')", async () => { resp = await page.goto('/shop/?orderby=abc'); }],
    ],
    er: [
      [tcER(1, 3, "expect(resp!.status()).toBeLessThan(500)"), async () => { expect(resp!.status()).toBeLessThan(500); }],
      [tcER(2, 3, "expect(SERVER_ERR.test(await page.content())).toBe(false)"), async () => { expect(SERVER_ERR.test(await page.content())).toBe(false); }],
      [tcER(3, 3, "expect(await page.locator('ul.products li.product').count()…"), async () => { expect(await page.locator('ul.products li.product').count()).toBeGreaterThan(0); }],
    ],
  });
});

for (const c of CATEGORIES) {
  test(`${c.id} Danh mục ${c.label} hiển thị ${c.count} sản phẩm`, async ({ page }) => {
    let status = 0, names: string[] = [];
    await runFlow({
      pre: autoPre(page),
      main: [
        [`Mở danh mục ${c.label} (${c.path})`, async () => {
          const resp = await page.goto(c.path);
          status = resp!.status();
          names = (await readCards(page)).map((x) => x.name);
        }],
      ],
      er: [
        [tcER(1, 2, 'Trang danh mục trả HTTP 200'), async () => { expect(status).toBe(200); }],
        [tcER(2, 2, `Hiển thị đúng ${c.count} sản phẩm`), async () => {
          expect(names, 'Danh sách sản phẩm trong danh mục').toHaveLength(c.count);
          if (c.names) expect(names).toEqual(c.names);
          expect(c.count).toBe(WIDGET_COUNTS[c.label]);              // khớp số trong widget Product categories
        }],
      ],
    });
  });
}

test('SHOP-TC022 Giá sản phẩm đúng và nhất quán khi tải lại trang Shop 10 lần', async ({ page }) => {
  const expected = new Map(PRODUCTS.map((p) => [p.name, p.price]));
  const errors: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Lặp: for (let i = 1; i <= 10; i++) ", async () => { for (let i = 1; i <= 10; i++) {
          await (i === 1 ? page.goto('/shop/') : page.reload());
          for (const c of await readCards(page)) {
            const want = expected.get(c.name);
            const ok = want !== undefined ? near(c.price, want) : c.price > 0 && c.price < 5000;   // sản phẩm chưa có giá chuẩn: chỉ chặn giá bất thường
            if (!ok) errors.push(`Lần ${i}: ${c.name} = ${c.price}${want !== undefined ? ` (đúng: ${want})` : ''}`);
          }
        } }],
    ],
    er: [
      [tcER(1, 1, "expect(errors, errors.join('\\n')).toEqual([])"), async () => { expect(errors, errors.join('\n')).toEqual([]); }],
    ],
  });
});

for (const p of PRODUCTS) {
  test(`${idOf(p.name)} Click "${p.name}" mở đúng trang chi tiết`, async ({ page }) => {
    let card: Card | undefined;
    let linkStatus = 0, price = 0;
    await runFlow({
      pre: autoPre(page),
      main: [
        [`Tìm "${p.name}" trong danh sách /shop/ và kiểm tra link`, async () => {
          card = (await allShopCards(page)).find((c) => c.name === p.name);
          expect(card, `Không thấy "${p.name}" ở danh sách sản phẩm`).toBeTruthy();
          linkStatus = (await page.request.get(card!.href)).status();
        }],
        [`Click "${p.name}" từ danh sách Shop để mở trang chi tiết`, async () => {
          await page.goto('/shop/');
          let link = page.locator('ul.products li.product', { hasText: p.name }).locator('a[href]').first();
          if (!(await link.count())) {
            await page.goto('/shop/page/2/');
            link = page.locator('ul.products li.product', { hasText: p.name }).locator('a[href]').first();
          }
          await link.click();
          await page.waitForLoadState('domcontentloaded');
          // sản phẩm sale: <del> giá gốc đứng trước <ins> giá sale → phải lấy giá trong <ins>, không phải .first() của cả hai
          const sale = page.locator('p.price ins .woocommerce-Price-amount');
          const priceEl = (await sale.count()) ? sale.first() : page.locator('p.price .woocommerce-Price-amount').first();
          price = money(await priceEl.innerText());
        }],
      ],
      er: [
        [tcER(1, 3, 'Link sản phẩm trả HTTP 200'), async () => { expect(linkStatus, `Link ${card!.href} phải trả về 200`).toBe(200); }],
        [tcER(2, 3, `Mở đúng trang và tiêu đề "${p.name}"`), async () => {
          await expect(page.locator('h1.product_title')).toHaveText(p.name);
          if (p.slug) expect(page.url()).toContain(`/shop/${p.slug}/`);
        }],
        [tcER(3, 3, `Giá ở trang chi tiết là ${p.price}`), async () => { expect(near(price, p.price), `Giá ở trang chi tiết = ${price}, đúng: ${p.price}`).toBe(true); }],
      ],
    });
  });
}

test('SHOP-TC025 Breadcrumb trang Shop dùng dấu phân cách hợp lệ', async ({ page }) => {
  const bc = page.locator('.woocommerce-breadcrumb, nav[aria-label*="breadcrumb" i]').first();
  let text: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập /shop/", async () => { await page.goto('/shop/'); }],
      ["Kiểm tra: expect(bc, 'Không thấy breadcrumb').toBeVisible()", async () => { await expect(bc, 'Không thấy breadcrumb').toBeVisible(); }],
      ["Lấy dữ liệu \"text\": (await bc.innerText()).replace(/\\s+/g, ' ')", async () => { text = (await bc.innerText()).replace(/\s+/g, ' '); }],
    ],
    er: [
      [tcER(1, 2, "expect(text, `Breadcrumb hiện: \"${text}\"`).not.toContain('\\…"), async () => { expect(text, `Breadcrumb hiện: "${text}"`).not.toContain('\\'); }],
      [tcER(2, 2, "expect(text).toMatch(/Home\\s*[\\/>»]\\s*Shop/)"), async () => { expect(text).toMatch(/Home\s*[\/>»]\s*Shop/); }],
    ],
  });
});

test("SHOP-TC026 Danh mục mặc định 'Uncategorized' không hiển thị cho khách", async ({ page }) => {
  let text: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Mở https://actp1.csc.edu.vn/shop/", async () => { await page.goto('/shop/'); }],
      ["Quan sát danh sách danh mục", async () => { text = await page.locator('body').innerText(); }],
    ],
    er: [
      [tcER(1, 1, "expect(text, \"Trang Shop đang hiển thị 'Uncategorized'\").no…"), async () => { expect(text, "Trang Shop đang hiển thị 'Uncategorized'").not.toMatch(/Uncategorized/i); }],
    ],
  });
});

test('SHOP-TC027 Giá các sản phẩm trong danh mục T-Shirt hợp lý (không vượt $100)', async ({ page }) => {
  let cards: Card[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở /category/clothing/tshirt/ và đọc danh sách sản phẩm', async () => {
        await page.goto('/category/clothing/tshirt/');
        cards = await readCards(page);
      }],
    ],
    er: [
      [tcER(1, 2, 'Danh mục T-Shirt có sản phẩm'), async () => { expect(cards.length, 'Danh mục T-Shirt không có sản phẩm').toBeGreaterThan(0); }],
      [tcER(2, 2, 'Giá các sản phẩm <= $100'), async () => {
        const high = cards.filter((c) => c.price > 100).map((c) => `${c.name}: $${c.price}`);
        expect(high, `Giá cao bất thường: ${high.join(', ')} (tất cả: ${cards.map((c) => '$' + c.price).join(', ')})`).toEqual([]);
      }],
    ],
  });
});

test('SHOP-TC028 Nút ở danh sách Shop đủ lớn để chạm trên mobile', async ({ page }) => {
  let sizes: { text: string; w: number; h: number }[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Đặt viewport 375x812, mở /shop/ và đo kích thước các nút', async () => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/shop/');
        sizes = await page.$$eval('a.button, button', (els) =>
          els.map((e) => { const r = e.getBoundingClientRect(); return { text: (e.textContent ?? '').trim().slice(0, 30) || e.getAttribute('aria-label') || e.tagName, w: Math.round(r.width), h: Math.round(r.height) }; })
             .filter((s) => s.w > 0 && s.h > 0));
      }],
    ],
    er: [
      [tcER(1, 2, 'Tìm thấy các nút ở trang Shop'), async () => { expect(sizes.length, 'Không tìm thấy nút nào ở trang Shop').toBeGreaterThan(0); }],
      [tcER(2, 2, 'Chiều cao mỗi nút >= 24px'), async () => {
        const small = sizes.filter((s) => s.h < 24).map((s) => `${s.text}: ${s.w}x${s.h}px`);
        expect(small, small.join('\n')).toEqual([]);
      }],
    ],
  });
});

test('SHOP-TC030 Sắp xếp được giữ khi sang trang 2', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập ${B}/shop/?orderby=price", async () => { await page.goto(`${B}/shop/?orderby=price`); }],
      ["Click 'a.page-numbers'", async () => { await page.locator('a.page-numbers', { hasText: /^2$/ }).first().click(); }],
    ],
    er: [
      [tcER(1, 2, "expect(page).toHaveURL(/orderby=price/)"), async () => { await expect(page).toHaveURL(/orderby=price/); }],
      [tcER(2, 2, "expect(page.locator('select.orderby')).toHaveValue('price')"), async () => { await expect(page.locator('select.orderby')).toHaveValue('price'); }],
    ],
  });
});

test('SHOP-TC031 Sắp xếp được giữ khi đổi danh mục', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập https://actp1.csc.edu.vn/shop/", async () => { await page.goto(`${B}/shop/`); }],
      ["Chọn 'Sort by price: low to high' ở ô sắp xếp", async () => { await page.locator('select.orderby').selectOption('price'); }],
      ["Ở widget 'Product categories', click danh mục 'Dresses'", async () => { await page.waitForURL(/orderby=price/); }],
      ["Quan sát ô sắp xếp và URL ở trang danh mục", async () => { await page.locator('.widget_product_categories a', { hasText: /^Dresses$/ }).first().click(); }],
    ],
    er: [
      [tcER(1, 2, "expect(page).toHaveURL(/orderby=price/)"), async () => { await expect(page).toHaveURL(/orderby=price/); }],
      [tcER(2, 2, "expect(page.locator('select.orderby')).toHaveValue('price')"), async () => { await expect(page.locator('select.orderby')).toHaveValue('price'); }],
    ],
  });
});

// ---------------------------------------------------------------- Chuyển từ Manual sang Automated
test('SHOP-TC029 Danh mục Clothing hiển thị cả sản phẩm thuộc danh mục con Blouse', async ({ page }) => {
  let titles: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở /category/clothing/ và đọc danh sách tên sản phẩm', async () => {
        await page.goto('/category/clothing/');
        titles = await productTitles(page);
      }],
    ],
    er: [
      [tcER(1, 1, "Danh mục Clothing hiển thị 'Classic Striped Knit Blouse'"), async () => { expect(titles, `Clothing đang hiển thị: ${titles.join(' | ')}`).toContain('Classic Striped Knit Blouse'); }],
    ],
  });
});
