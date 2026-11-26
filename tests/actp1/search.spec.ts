import { Page, expect, test } from '@playwright/test';
import { SERVER_ERR, collectDialogs, productTitles } from './helpers';

const search = (page: Page, term: string) =>
  page.goto(`/?s=${encodeURIComponent(term)}&post_type=product`);

const open = (page: import('@playwright/test').Page, term: string) =>
  page.goto(`/?s=${encodeURIComponent(term)}&post_type=product`);

test('SRCH-TC003 Tìm "dress" hiển thị 4 sản phẩm có Dress trong tên', async ({ page }) => {
  await open(page, 'dress');
  const titles = await productTitles(page);
  expect(titles).toHaveLength(4);
  for (const t of titles) expect(t.toLowerCase(), t).toContain('dress');
});

test('SRCH-TC004 Tìm không phân biệt hoa thường (\'DRESS\')', async ({ page }) => {
  await search(page, 'dress');
  const a = (await productTitles(page)).sort();
  await search(page, 'DRESS');
  expect((await productTitles(page)).sort()).toEqual(a);
});

test('SRCH-TC005 Tìm một phần từ khóa "Tee" chỉ ra các sản phẩm có Tee trong tên', async ({ page }) => {
  await open(page, 'Tee');
  const titles = await productTitles(page);
  expect(titles.length).toBeGreaterThanOrEqual(2);          // Bold Statement Graphic Tee, Sophisticated Ribbed Turtleneck Tee
  for (const t of titles) expect(t.toLowerCase(), t).toContain('tee');
});

test('SRCH-TC006 Tìm từ khóa không tồn tại "zzzxxyy" báo không có kết quả', async ({ page }) => {
  await open(page, 'zzzxxyy');
  expect(await productTitles(page)).toEqual([]);
  await expect(page.locator('body')).toContainText(/no products|nothing found|no results|not found/i);
});

test('SRCH-TC007 Tìm với từ khóa để trống không gây lỗi', async ({ page }) => {
  const resp = await open(page, '');
  expect(resp!.status()).toBeLessThan(500);
  expect(SERVER_ERR.test(await page.content())).toBe(false);
});

test('SRCH-TC008 Tìm với khoảng trắng đầu/cuối', async ({ page }) => {
  await search(page, 'dress');
  const a = (await productTitles(page)).sort();
  await search(page, '  dress  ');
  expect((await productTitles(page)).sort()).toEqual(a);
});

test('SRCH-TC009 Tìm với mã XSS', async ({ page }) => {
  const msgs = collectDialogs(page);
  await search(page, "<script>alert('xss4')</script>");
  await page.waitForTimeout(1000);
  expect(msgs.some((m) => m.includes('xss4'))).toBe(false);
});

test('SRCH-TC010 Tìm với chuỗi rất dài (1000 ký tự)', async ({ page }) => {
  const resp = await search(page, 'a'.repeat(1000));
  expect(resp!.status()).toBeLessThan(500);
  expect(SERVER_ERR.test(await page.content())).toBe(false);
});
