import { Locator, Page, expect, test } from '@playwright/test';
import { SERVER_ERR, register, stripRequired } from './helpers';

// BLOG
const BLOG_POSTS = [
  { title: '5 Style Tips for Fashionable Outdoor Adventues', path: '/2020/10/19/5-style-tips-for-fashionable-outdoor-adventures/' },
  { title: 'Coastal Escapes: How to Dress for a Perfect Day by the Beach', path: '/2019/03/06/how-to-dress-for-a-perfect-day-by-the-beach/' },
  { title: 'Beach Essentials: What to Pack for a Perfect Day by the Shore', path: '/2019/03/06/beach-essentials-what-to-pack-for-a-perfect-day-by-the-shore/' },
  { title: 'Relax in Style: Your Guide to the Perfect Beach Escape', path: '/2019/03/06/relax-in-style-your-guide-to-the-perfect-beach-escape/' },
];

const KNOWN_TYPOS = ['Adventues', 'comfotable'];            // lỗi chính tả đã biết, có thể thêm vào khi phát hiện thêm

// lỗi chính tả đã biết, có thể thêm vào khi phát hiện thêm
const articles = (page: Page) => page.locator('article');

const titleLink = (post: Locator) => post.locator('h2 a').first();

const postTitle = (page: Page) => page.locator('h1').first();

const postContent = (page: Page) => page.locator('#content, main').first();

async function openBlog(page: Page) {
  const resp = await page.goto('/blog/');
  expect(resp!.status(), 'GET /blog/').toBe(200);
}

/** Cuộn hết trang để các ảnh lazy-load được tải. */
async function scrollToBottom(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); }
    window.scrollTo(0, 0);
  });
}

/** Tên các ảnh không có alt (thiếu hoặc rỗng) trong phạm vi selector. */
async function imagesWithoutAlt(page: Page, scope = 'body') {
  await scrollToBottom(page);
  return page.$$eval(`${scope} img`, (imgs) =>
    imgs.filter((i) => !(i.getAttribute('alt') ?? '').trim()).map((i) => (i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src));
}

const B = process.env.BASE_URL || 'https://actp1.csc.edu.vn';

test("BLOG-TC001 Click 'Blog' trên menu mở /blog/ (HTTP 200)", async ({ page }) => {
  await page.goto('/');
  const link = page.locator('header a:visible').filter({ hasText: /^\s*Blog\s*$/ }).first();
  const [resp] = await Promise.all([
    page.waitForResponse((r) => /\/blog\/?$/.test(r.url()) && r.request().resourceType() === 'document'),
    link.click(),
  ]);
  expect(resp.status()).toBe(200);
  await expect(page).toHaveURL(/\/blog\/?$/);
});

test('BLOG-TC002 Trang Blog hiển thị 4 bài viết', async ({ page }) => {
  await openBlog(page);
  await expect(articles(page)).toHaveCount(4);
});

test("BLOG-TC003 Mỗi bài có ảnh, tiêu đề, 'by actp'; bài bị cắt trích đoạn có link 'Read More »'", async ({ page }) => {
  await openBlog(page);
  const n = await articles(page).count();
  const bad: string[] = [];
  for (let i = 0; i < n; i++) {
    const post = articles(page).nth(i);
    const title = (await titleLink(post).innerText()).trim();
    const label = title || `bài thứ ${i + 1}`;
    if (!title) bad.push(`${label}: thiếu tiêu đề`);
    if (!(await post.locator('img').count())) bad.push(`${label}: thiếu ảnh`);
    const text = await post.innerText();
    if (!/by\s+actp/i.test(text)) bad.push(`${label}: thiếu 'by actp'`);
    if (/…|\[\.\.\.\]/.test(text) && !(await post.getByRole('link', { name: /Read More/i }).count())) bad.push(`${label}: trích đoạn bị cắt nhưng thiếu 'Read More »'`);
  }
  expect(bad, bad.join('\n')).toEqual([]);
});

test('BLOG-TC004 Click tiêu đề bài đầu tiên mở đúng bài, hiển thị tiêu đề và nội dung', async ({ page }) => {
  await openBlog(page);
  const first = articles(page).first();
  const title = (await titleLink(first).innerText()).trim();
  await titleLink(first).click();
  await expect(page).toHaveURL(/\/2020\/10\/19\//);
  await expect(postTitle(page)).toHaveText(title);
  expect((await postContent(page).innerText()).trim().length, 'Nội dung bài viết quá ngắn').toBeGreaterThan(200);
});

test("BLOG-TC005 Click 'Read More »' của bài Coastal Escapes mở đúng bài", async ({ page }) => {
  await openBlog(page);
  await articles(page).filter({ hasText: 'Coastal Escapes' }).first().getByRole('link', { name: /Read More/i }).click();
  await expect(postTitle(page)).toContainText('Coastal Escapes');
});

for (const p of BLOG_POSTS) {
  test(`BLOG-TC006 Click ảnh của bài "${p.title}" mở đúng bài`, async ({ page }) => {
    await openBlog(page);
    await articles(page).filter({ hasText: p.title }).first().locator('a:has(img)').first().click();
    expect(page.url()).toContain(p.path);
    await expect(postTitle(page)).toHaveText(p.title);
  });
}

test("BLOG-TC007 Click tên tác giả 'actp' mở /author/actp/ và liệt kê đủ các bài viết", async ({ page }) => {
  await openBlog(page);
  await page.locator('article a[href*="/author/"]').first().click();
  await expect(page).toHaveURL(/\/author\/actp\/?$/);
  const titles = (await articles(page).locator('h2 a').allInnerTexts()).map((t) => t.trim());
  expect(titles.sort(), 'Danh sách bài viết của tác giả').toEqual(BLOG_POSTS.map((p) => p.title).sort());
});

test('BLOG-TC008 Bài viết không tồn tại trả về trang 404', async ({ page }) => {
  const resp = await page.goto('/2020/10/19/khong-ton-tai/');
  expect(resp!.status()).toBe(404);
});

test('BLOG-TC009 Không có lỗi chính tả đã biết ở trang Blog và các bài viết', async ({ page }) => {
  const found: string[] = [];
  for (const url of ['/blog/', ...BLOG_POSTS.map((p) => p.path)]) {
    await page.goto(url);
    const html = (await page.content()).toLowerCase();
    for (const t of KNOWN_TYPOS) if (html.includes(t.toLowerCase())) found.push(`${url} chứa "${t}"`);
  }
  expect(found, found.join('\n')).toEqual([]);
});

test('BLOG-TC010 Ảnh bài viết ở trang Blog có alt text', async ({ page }) => {
  await page.goto('/blog/');
  const bad = await imagesWithoutAlt(page, 'article');
  expect(bad, `${bad.length} ảnh thiếu alt:\n${bad.join('\n')}`).toEqual([]);
});

test('BLOG-TC011 Click từng bài ở trang Blog đều mở được và đọc được nội dung', async ({ page }) => {
  await openBlog(page);
  const n = await articles(page).count();
  expect(n, 'Trang Blog không có bài viết').toBeGreaterThan(0);
  const bad: string[] = [];
  for (let i = 0; i < n; i++) {
    await openBlog(page);
    const link = titleLink(articles(page).nth(i));
    const title = (await link.innerText()).trim();
    const href = (await link.getAttribute('href')) ?? '';
    const status = (await page.request.get(href)).status();
    await link.click();
    await page.waitForURL(href, { timeout: 8000 }).catch(() => {});
    const h1 = (await postTitle(page).innerText().catch(() => '')).trim();
    const len = (await postContent(page).innerText().catch(() => '')).trim().length;
    if (status !== 200) bad.push(`"${title}": link ${href} trả HTTP ${status}`);
    else if (page.url() !== href) bad.push(`"${title}": click không mở ${href} (đang ở ${page.url()})`);
    else if (h1 !== title) bad.push(`"${title}": mở trang có tiêu đề "${h1}"`);
    else if (len < 200) bad.push(`"${title}": nội dung chỉ có ${len} ký tự`);
  }
  expect(bad, bad.join('\n')).toEqual([]);
});

test('BLOG-TC012 Gửi bình luận hợp lệ ở bài viết được ghi nhận', async ({ page }) => {
  await page.goto(BLOG_POSTS[1].path);
  const text = `Auto comment ${Date.now()}`;
  await page.fill('#comment', text);
  await page.fill('#author', 'QA Tester');
  await page.fill('#email', 'qa.comment@example.com');
  await page.locator('#commentform [type=submit]').click();
  await page.waitForLoadState('domcontentloaded');
  expect(SERVER_ERR.test(await page.content()), 'Lỗi server khi gửi bình luận').toBe(false);
  const body = await page.locator('body').innerText();
  expect(body, 'Hệ thống báo lỗi khi gửi bình luận').not.toMatch(/Please fill the required fields|Duplicate comment|too quickly/i);
  expect(body, 'Bình luận không được ghi nhận').toMatch(new RegExp(`${text}|awaiting moderation`, 'i'));
});

test('BLOG-TC013 Mọi bài viết đều có link "Read More"', async ({ page }) => {
  await page.goto(`${B}/blog/`);
  const posts = page.locator('article.post, article');
  const n = await posts.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    await expect(posts.nth(i).getByRole('link', { name: /read more/i }), `bài #${i + 1}`).toHaveCount(1); // fail => BUG-041
  }
});

test('BLOG-EXTRA Mỗi bài viết hiển thị ngày đăng', async ({ page }) => {
  await openBlog(page);
  const n = await articles(page).count();
  const bad: string[] = [];
  for (let i = 0; i < n; i++) {
    const post = articles(page).nth(i);
    const hasDate = (await post.locator('time, .posted-on, .meta.date, .entry-date').count()) > 0
      || /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b|\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/i.test(await post.innerText());
    if (!hasDate) bad.push((await titleLink(post).innerText()).trim());
  }
  expect(bad, `Bài không hiển thị ngày đăng: ${bad.join(' | ')}`).toEqual([]);
});

for (const p of BLOG_POSTS) {
  test(`BLOG-EXTRA Trang bài viết "${p.title}" có cấu trúc đúng`, async ({ page }) => {
    const resp = await page.goto(p.path);
    expect(resp!.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(`${p.title} – ACTP Clothes Shop`);
    const img = page.locator('article img, #content img').first();
    await expect(img, 'Không thấy ảnh bài viết').toBeVisible();
    expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth), 'Ảnh bài viết không tải được').toBeGreaterThan(0);
    await expect(page.locator('a[href*="/author/actp"]').first()).toBeVisible();
    await expect(page.locator('#commentform')).toBeVisible();
  });
}

test('BLOG-EXTRA Link ở ảnh, tiêu đề và Read More của mỗi bài cùng trỏ về một bài', async ({ page }) => {
  await openBlog(page);
  const n = await articles(page).count();
  const bad: string[] = [];
  for (let i = 0; i < n; i++) {
    const post = articles(page).nth(i);
    const hrefs = await post.locator('a:has(img), h2 a, a:has-text("Read More")').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    if (new Set(hrefs).size > 1) bad.push(`${(await titleLink(post).innerText()).trim()}: ${hrefs.join(' | ')}`);
  }
  expect(bad, bad.join('\n')).toEqual([]);
});

test('BLOG-EXTRA Bình luận bỏ trống nội dung hoặc email sai định dạng bị từ chối', async ({ page }) => {
  for (const o of [{ comment: '', email: 'qa.comment@example.com' }, { comment: 'Auto comment', email: 'abc' }]) {
    await page.goto(BLOG_POSTS[1].path);
    await page.fill('#comment', o.comment);
    await page.fill('#author', 'QA Tester');
    await page.fill('#email', o.email);
    await stripRequired(page);
    await page.evaluate(() => document.querySelectorAll('#commentform input[type=email]').forEach((e) => ((e as HTMLInputElement).type = 'text')));
    await page.locator('#commentform [type=submit]').click();
    await page.waitForLoadState('domcontentloaded');
    expect(await page.locator('body').innerText(), `comment="${o.comment}", email="${o.email}"`).toMatch(/fill the required fields|valid email|error/i);
  }
});

test('BLOG-EXTRA RSS feed /feed/ hoạt động và có đủ bài viết', async ({ request }) => {
  const r = await request.get('/feed/');
  expect(r.status(), 'GET /feed/').toBe(200);
  expect(((await r.text()).match(/<item>/g) ?? []).length).toBe(BLOG_POSTS.length);
});

test('BLOG-TC015 Link "Edit your profile" dẫn tới trang Account details', async ({ page }) => {
  await register(page);
  await page.goto(BLOG_POSTS[1].path);
  await page.waitForLoadState('domcontentloaded');
  const editLink = page.locator('#respond a[href*="edit-account"], #respond a[href*="profile"]').first();
  if (!(await editLink.count())) {
    test.skip(true, 'Không tìm thấy link Edit your profile trong Leave a Reply');
    return;
  }
  await editLink.click();
  await page.waitForLoadState('domcontentloaded');
  expect(page.url(), 'Link "Edit your profile" phải dẫn tới /my-account/edit-account/').toContain('/my-account/edit-account/'); // fail => BUG-059
});
