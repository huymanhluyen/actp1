import { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { SERVER_ERR, collectDialogs, productTitles } from './helpers';
import { apiHealthCheck, autoPre, cartPost, runFlow, tcER } from './flow';

const search = (page: Page, term: string) =>
  page.goto(`/?s=${encodeURIComponent(term)}&post_type=product`);

const open = (page: import('@playwright/test').Page, term: string) =>
  page.goto(`/?s=${encodeURIComponent(term)}&post_type=product`);

test('SRCH-TC003 Tìm "dress" hiển thị 4 sản phẩm có Dress trong tên', async ({ page }) => {
  let titles: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: open(page, 'dress')", async () => { await open(page, 'dress'); }],
      ["Lấy dữ liệu \"titles\": await productTitles(page)", async () => { titles = await productTitles(page); }],
    ],
    er: [
      [tcER(1, 2, "expect(titles).toHaveLength(4)"), async () => { expect(titles).toHaveLength(4); }],
      [tcER(2, 2, "for (const t of titles) expect(t.toLowerCase(), t).toContai…"), async () => { for (const t of titles) expect(t.toLowerCase(), t).toContain('dress'); }],
    ],
  });
});

test('SRCH-TC004 Tìm không phân biệt hoa thường (\'DRESS\')', async ({ page }) => {
  let a: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: search(page, 'dress')", async () => { await search(page, 'dress'); }],
      ["Lấy dữ liệu \"a\": (await productTitles(page)).sort()", async () => { a = (await productTitles(page)).sort(); }],
      ["Thực hiện: search(page, 'DRESS')", async () => { await search(page, 'DRESS'); }],
    ],
    er: [
      [tcER(1, 1, "expect((await productTitles(page)).sort()).toEqual(a)"), async () => { expect((await productTitles(page)).sort()).toEqual(a); }],
    ],
  });
});

test('SRCH-TC005 Tìm một phần từ khóa "Tee" chỉ ra các sản phẩm có Tee trong tên', async ({ page }) => {
  let titles: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: open(page, 'Tee')", async () => { await open(page, 'Tee'); }],
      ["Lấy dữ liệu \"titles\": await productTitles(page)", async () => { titles = await productTitles(page); }],
    ],
    er: [
      [tcER(1, 2, "expect(titles.length).toBeGreaterThanOrEqual(2)"), async () => { expect(titles.length).toBeGreaterThanOrEqual(2); }],
      [tcER(2, 2, "for (const t of titles) expect(t.toLowerCase(), t).toContai…"), async () => { for (const t of titles) expect(t.toLowerCase(), t).toContain('tee'); }],
    ],
  });
});

test('SRCH-TC006 Tìm từ khóa không tồn tại "zzzxxyy" báo không có kết quả', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: open(page, 'zzzxxyy')", async () => { await open(page, 'zzzxxyy'); }],
    ],
    er: [
      [tcER(1, 2, "expect(await productTitles(page)).toEqual([])"), async () => { expect(await productTitles(page)).toEqual([]); }],
      [tcER(2, 2, "expect(page.locator('body')).toContainText(/no products|not…"), async () => { await expect(page.locator('body')).toContainText(/no products|nothing found|no results|not found/i); }],
    ],
  });
});

test('SRCH-TC007 Tìm với từ khóa để trống không gây lỗi', async ({ page }) => {
  let resp: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Lấy dữ liệu \"resp\": await open(page, '')", async () => { resp = await open(page, ''); }],
    ],
    er: [
      [tcER(1, 2, "expect(resp!.status()).toBeLessThan(500)"), async () => { expect(resp!.status()).toBeLessThan(500); }],
      [tcER(2, 2, "expect(SERVER_ERR.test(await page.content())).toBe(false)"), async () => { expect(SERVER_ERR.test(await page.content())).toBe(false); }],
    ],
  });
});

test('SRCH-TC008 Tìm với khoảng trắng đầu/cuối', async ({ page }) => {
  let a: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: search(page, 'dress')", async () => { await search(page, 'dress'); }],
      ["Lấy dữ liệu \"a\": (await productTitles(page)).sort()", async () => { a = (await productTitles(page)).sort(); }],
      ["Thực hiện: search(page, ' dress ')", async () => { await search(page, '  dress  '); }],
    ],
    er: [
      [tcER(1, 1, "expect((await productTitles(page)).sort()).toEqual(a)"), async () => { expect((await productTitles(page)).sort()).toEqual(a); }],
    ],
  });
});

test('SRCH-TC009 Tìm với mã XSS', async ({ page }) => {
  const msgs = collectDialogs(page);
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: search(page, \"<script>alert('xss4')</script>\")", async () => { await search(page, "<script>alert('xss4')</script>"); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForTimeout(1000); }],
    ],
    er: [
      [tcER(1, 1, "expect(msgs.some((m) => m.includes('xss4'))).toBe(false)"), async () => { expect(msgs.some((m) => m.includes('xss4'))).toBe(false); }],
    ],
  });
});

test('SRCH-TC010 Tìm với chuỗi rất dài (1000 ký tự)', async ({ page }) => {
  let resp: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Lấy dữ liệu \"resp\": await search(page, 'a'.repeat(1000))", async () => { resp = await search(page, 'a'.repeat(1000)); }],
    ],
    er: [
      [tcER(1, 2, "expect(resp!.status()).toBeLessThan(500)"), async () => { expect(resp!.status()).toBeLessThan(500); }],
      [tcER(2, 2, "expect(SERVER_ERR.test(await page.content())).toBe(false)"), async () => { expect(SERVER_ERR.test(await page.content())).toBe(false); }],
    ],
  });
});

// ---------------------------------------------------------------- Chuyển từ Manual sang Automated
/** Tìm bằng ô tìm kiếm trên giao diện (mở ô, nhập, nhấn Enter) giống thao tác của người dùng. */

async function searchViaBox(page: Page, term: string) {
  await page.goto('/shop/');
  const box = page.locator('input[name="s"]').locator('visible=true').first();
  if (!(await box.count())) await page.locator('.menu-item-nav-search a, a.nv-nav-search, .nv-nav-search, button[aria-label*="earch" i]').locator('visible=true').first().click();
  const input = page.locator('input[name="s"]').locator('visible=true').first();
  await input.fill(term);
  await input.press('Enter');
  await page.waitForLoadState('domcontentloaded');
}

test('SRCH-TC014 Tìm khi để trống ô tìm kiếm không hiển thị tiêu đề "Search results for “”"', async ({ page }) => {
  let body = '';
  await runFlow({
    pre: [['Kiểm tra site truy cập được (GET /)', () => apiHealthCheck(page.request, '/')]],
    main: [
      ['Gửi tìm kiếm với từ khóa rỗng (/?s=&post_type=product)', async () => { await open(page, ''); }],
      ['Đọc nội dung trang kết quả', async () => { body = await page.locator('body').innerText(); }],
    ],
    er: [
      ['Trang không lỗi 5xx', async () => { expect(SERVER_ERR.test(body)).toBe(false); }],
      ['Không hiển thị tiêu đề "Search results for “”" với từ khóa rỗng', async () => { expect(body).not.toMatch(/Search results for\s*[“”"]{2}/i); }],
    ],
    post: [],
  });
});

test('SRCH-TC015 Từ khóa có dấu cách đầu/cuối cho kết quả giống từ khóa không có dấu cách', async ({ page }) => {
  let a: string[] = [], b: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Tìm với từ khóa "dress" qua ô tìm kiếm', async () => {
        await searchViaBox(page, 'dress');
        a = (await productTitles(page)).sort();
      }],
      ['Tìm với từ khóa "  dress  " qua ô tìm kiếm', async () => {
        await searchViaBox(page, '  dress  ');
        b = (await productTitles(page)).sort();
      }],
    ],
    er: [
      [tcER(1, 2, 'Tìm "dress" có kết quả'), async () => { expect(a.length, 'Tìm "dress" không có kết quả').toBeGreaterThan(0); }],
      [tcER(2, 2, 'Kết quả tìm "  dress  " giống "dress"'), async () => { expect(b, 'Kết quả khác khi có dấu cách thừa').toEqual(a); }],
    ],
  });
});
