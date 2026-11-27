import { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { SERVER_ERR, register, stripRequired } from './helpers';
import { apiPre, autoPre, cartPost, logoutPost, runFlow, tcER } from './flow';

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
  let status = 0;
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở trang chủ và click link Blog trên menu', async () => {
        await page.goto('/');
        const link = page.locator('header a:visible').filter({ hasText: /^\s*Blog\s*$/ }).first();
        const [resp] = await Promise.all([
          page.waitForResponse((r) => /\/blog\/?$/.test(r.url()) && r.request().resourceType() === 'document'),
          link.click(),
        ]);
        status = resp.status();
      }],
    ],
    er: [
      [tcER(1, 2, 'expect(status).toBe(200)'), async () => { expect(status).toBe(200); }],
      [tcER(2, 2, 'expect(page).toHaveURL(/\\/blog\\/?$/)'), async () => { await expect(page).toHaveURL(/\/blog\/?$/); }],
    ],
  });
});

test('BLOG-TC002 Trang Blog hiển thị 4 bài viết', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: openBlog(page)", async () => { await openBlog(page); }],
    ],
    er: [
      [tcER(1, 1, "expect(articles(page)).toHaveCount(4)"), async () => { await expect(articles(page)).toHaveCount(4); }],
    ],
  });
});

test("BLOG-TC003 Mỗi bài có ảnh, tiêu đề, 'by actp'; bài bị cắt trích đoạn có link 'Read More »'", async ({ page }) => {
  const bad: string[] = [];
  let n: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: openBlog(page)", async () => { await openBlog(page); }],
      ["Lấy dữ liệu \"n\": await articles(page).count()", async () => { n = await articles(page).count(); }],
      ["Lặp: for (let i = 0; i < n; i++) ", async () => { for (let i = 0; i < n; i++) {
          const post = articles(page).nth(i);
          const title = (await titleLink(post).innerText()).trim();
          const label = title || `bài thứ ${i + 1}`;
          if (!title) bad.push(`${label}: thiếu tiêu đề`);
          if (!(await post.locator('img').count())) bad.push(`${label}: thiếu ảnh`);
          const text = await post.innerText();
          if (!/by\s+actp/i.test(text)) bad.push(`${label}: thiếu 'by actp'`);
          if (/…|\[\.\.\.\]/.test(text) && !(await post.getByRole('link', { name: /Read More/i }).count())) bad.push(`${label}: trích đoạn bị cắt nhưng thiếu 'Read More »'`);
        } }],
    ],
    er: [
      [tcER(1, 1, "expect(bad, bad.join('\\n')).toEqual([])"), async () => { expect(bad, bad.join('\n')).toEqual([]); }],
    ],
  });
});

test('BLOG-TC004 Click tiêu đề bài đầu tiên mở đúng bài, hiển thị tiêu đề và nội dung', async ({ page }) => {
  const first = articles(page).first();
  let title: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: openBlog(page)", async () => { await openBlog(page); }],
      ["Lấy dữ liệu \"title\": (await titleLink(first).innerText()).trim()", async () => { title = (await titleLink(first).innerText()).trim(); }],
      ["Click titleLink(first)", async () => { await titleLink(first).click(); }],
    ],
    er: [
      [tcER(1, 3, "expect(page).toHaveURL(/\\/2020\\/10\\/19\\//)"), async () => { await expect(page).toHaveURL(/\/2020\/10\/19\//); }],
      [tcER(2, 3, "expect(postTitle(page)).toHaveText(title)"), async () => { await expect(postTitle(page)).toHaveText(title); }],
      [tcER(3, 3, "expect((await postContent(page).innerText()).trim().length,…"), async () => { expect((await postContent(page).innerText()).trim().length, 'Nội dung bài viết quá ngắn').toBeGreaterThan(200); }],
    ],
  });
});

test("BLOG-TC005 Click 'Read More »' của bài Coastal Escapes mở đúng bài", async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: openBlog(page)", async () => { await openBlog(page); }],
      ["Click 'Coastal Escapes'", async () => { await articles(page).filter({ hasText: 'Coastal Escapes' }).first().getByRole('link', { name: /Read More/i }).click(); }],
    ],
    er: [
      [tcER(1, 1, "expect(postTitle(page)).toContainText('Coastal Escapes')"), async () => { await expect(postTitle(page)).toContainText('Coastal Escapes'); }],
    ],
  });
});

for (const p of BLOG_POSTS) {
  test(`BLOG-TC006 Click ảnh của bài "${p.title}" mở đúng bài`, async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: openBlog(page)", async () => { await openBlog(page); }],
      ["Click 'a:has(img)'", async () => { await articles(page).filter({ hasText: p.title }).first().locator('a:has(img)').first().click(); }],
    ],
    er: [
      [tcER(1, 2, "expect(page.url()).toContain(p.path)"), async () => { expect(page.url()).toContain(p.path); }],
      [tcER(2, 2, "expect(postTitle(page)).toHaveText(p.title)"), async () => { await expect(postTitle(page)).toHaveText(p.title); }],
    ],
  });
});
}

test("BLOG-TC007 Click tên tác giả 'actp' mở /author/actp/ và liệt kê đủ các bài viết", async ({ page }) => {
  let titles: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập https://actp1.csc.edu.vn/blog/", async () => { await openBlog(page); }],
      ["Click vào tên tác giả 'actp' ở một bài viết", async () => { await page.locator('article a[href*="/author/"]').first().click(); }],
      ["Chờ trang tải xong và kiểm tra URL chuyển tới /author/actp/", async () => { await expect(page).toHaveURL(/\/author\/actp\/?$/); }],
      ["Kiểm tra trang liệt kê các bài viết của tác giả", async () => { titles = (await articles(page).locator('h2 a').allInnerTexts()).map((t) => t.trim()); }],
    ],
    er: [
      [tcER(1, 1, "expect(titles.sort(), 'Danh sách bài viết của tác giả').toE…"), async () => { expect(titles.map((t: string) => t.toLowerCase()).sort(), 'Danh sách bài viết của tác giả').toEqual(BLOG_POSTS.map((p) => p.title.toLowerCase()).sort()); }],
    ],
  });
});

test('BLOG-TC008 Bài viết không tồn tại trả về trang 404', async ({ page }) => {
  let resp: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Lấy dữ liệu \"resp\": await page.goto('/2020/10/19/khong-ton-tai/')", async () => { resp = await page.goto('/2020/10/19/khong-ton-tai/'); }],
    ],
    er: [
      [tcER(1, 1, "expect(resp!.status()).toBe(404)"), async () => { expect(resp!.status()).toBe(404); }],
    ],
  });
});

test('BLOG-TC009 Không có lỗi chính tả đã biết ở trang Blog và các bài viết', async ({ page }) => {
  const found: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Lặp: for (const url of ['/blog/', ...BLOG_POSTS.map((p) => p.pat…", async () => { for (const url of ['/blog/', ...BLOG_POSTS.map((p) => p.path)]) {
          await page.goto(url);
          const html = (await page.content()).toLowerCase();
          for (const t of KNOWN_TYPOS) if (html.includes(t.toLowerCase())) found.push(`${url} chứa "${t}"`);
        } }],
    ],
    er: [
      [tcER(1, 1, "expect(found, found.join('\\n')).toEqual([])"), async () => { expect(found, found.join('\n')).toEqual([]); }],
    ],
  });
});

test('BLOG-TC010 Ảnh bài viết ở trang Blog có alt text', async ({ page }) => {
  let bad: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Mở https://actp1.csc.edu.vn/blog/", async () => { await page.goto('/blog/'); }],
      ["Kiểm tra thuộc tính alt của ảnh trong các bài viết", async () => { bad = await imagesWithoutAlt(page, 'article'); }],
    ],
    er: [
      [tcER(1, 1, "expect(bad, `${bad.length} ảnh thiếu alt:\\n${bad.join('\\n')…"), async () => { expect(bad, `${bad.length} ảnh thiếu alt:\n${bad.join('\n')}`).toEqual([]); }],
    ],
  });
});

test('BLOG-TC011 Click từng bài ở trang Blog đều mở được và đọc được nội dung', async ({ page }) => {
  const bad: string[] = [];
  let n: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: openBlog(page)", async () => { await openBlog(page); }],
      ["Lấy dữ liệu \"n\": await articles(page).count()", async () => { n = await articles(page).count(); }],
      ["Kiểm tra: expect(n, 'Trang Blog không có bài viết').toBeGreaterThan(0)", async () => { expect(n, 'Trang Blog không có bài viết').toBeGreaterThan(0); }],
      ["Lặp: for (let i = 0; i < n; i++) ", async () => { for (let i = 0; i < n; i++) {
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
        } }],
    ],
    er: [
      [tcER(1, 1, "expect(bad, bad.join('\\n')).toEqual([])"), async () => { expect(bad, bad.join('\n')).toEqual([]); }],
    ],
  });
});

test('BLOG-TC012 Gửi bình luận hợp lệ ở bài viết được ghi nhận', async ({ page }) => {
  const text = `Auto comment ${Date.now()}`;
  let body: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập BLOG_POSTS[1].path", async () => { await page.goto(BLOG_POSTS[1].path); }],
      ["Nhập text vào page", async () => { await page.fill('#comment', text); }],
      ["Nhập 'QA Tester' vào page", async () => { await page.fill('#author', 'QA Tester'); }],
      ["Nhập 'qa.comment@example.com' vào page", async () => { await page.fill('#email', 'qa.comment@example.com'); }],
      ["Click '#commentform [type=submit]'", async () => { await page.locator('#commentform [type=submit]').click(); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForLoadState('domcontentloaded'); }],
      ["Kiểm tra: expect(SERVER_ERR.test(await page.content()), 'Lỗi server k…", async () => { expect(SERVER_ERR.test(await page.content()), 'Lỗi server khi gửi bình luận').toBe(false); }],
      ["Lấy dữ liệu \"body\": await page.locator('body').innerText()", async () => { body = await page.locator('body').innerText(); }],
    ],
    er: [
      [tcER(1, 2, "expect(body, 'Hệ thống báo lỗi khi gửi bình luận').not.toMa…"), async () => { expect(body, 'Hệ thống báo lỗi khi gửi bình luận').not.toMatch(/Please fill the required fields|Duplicate comment|too quickly/i); }],
      [tcER(2, 2, "expect(body, 'Bình luận không được ghi nhận').toMatch(new R…"), async () => { expect(body, 'Bình luận không được ghi nhận').toMatch(new RegExp(`${text}|awaiting moderation`, 'i')); }],
    ],
  });
});

test('BLOG-TC013 Mọi bài viết đều có link "Read More"', async ({ page }) => {
  const posts = page.locator('article.post, article');
  let n: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập ${B}/blog/", async () => { await page.goto(`${B}/blog/`); }],
      ["Lấy dữ liệu \"n\": await posts.count()", async () => { n = await posts.count(); }],
    ],
    er: [
      [tcER(1, 2, "expect(n).toBeGreaterThan(0)"), async () => { expect(n).toBeGreaterThan(0); }],
      [tcER(2, 2, "for (let i = 0; i < n; i++) { await expect(posts.nth(i).get…"), async () => { for (let i = 0; i < n; i++) {
          await expect(posts.nth(i).getByRole('link', { name: /read more/i }), `bài #${i + 1}`).toHaveCount(1); // fail => BUG-041
        } }],
    ],
  });
});

test('BLOG-EXTRA Mỗi bài viết hiển thị ngày đăng', async ({ page }) => {
  const bad: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở /blog/ và kiểm tra ngày đăng của từng bài viết', async () => {
        await openBlog(page);
        const n = await articles(page).count();
        for (let i = 0; i < n; i++) {
          const post = articles(page).nth(i);
          const hasDate = (await post.locator('time, .posted-on, .meta.date, .entry-date').count()) > 0
            || /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b|\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/i.test(await post.innerText());
          if (!hasDate) bad.push((await titleLink(post).innerText()).trim());
        }
      }],
    ],
    er: [
      ['Mỗi bài viết đều hiển thị ngày đăng', async () => { expect(bad, `Bài không hiển thị ngày đăng: ${bad.join(' | ')}`).toEqual([]); }],
    ],
  });
});

for (const p of BLOG_POSTS) {
  test(`BLOG-EXTRA Trang bài viết "${p.title}" có cấu trúc đúng`, async ({ page }) => {
    let status = 0, naturalWidth = 0;
    await runFlow({
      pre: autoPre(page),
      main: [
        [`Mở bài viết ${p.path}`, async () => {
          const resp = await page.goto(p.path);
          status = resp!.status();
        }],
        ['Đọc thông tin ảnh bài viết', async () => {
          const img = page.locator('article img, #content img').first();
          await expect(img, 'Không thấy ảnh bài viết').toBeVisible();
          naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        }],
      ],
      er: [
        ['Trang bài viết trả HTTP 200', async () => { expect(status).toBe(200); }],
        ['Có đúng 1 thẻ h1 và title khớp tên bài', async () => {
          await expect(page.locator('h1')).toHaveCount(1);
          await expect(page).toHaveTitle(`${p.title} – ACTP Clothes Shop`);
        }],
        ['Ảnh bài viết tải thành công (naturalWidth > 0)', async () => { expect(naturalWidth, 'Ảnh bài viết không tải được').toBeGreaterThan(0); }],
        ['Hiển thị tác giả actp và khung bình luận', async () => {
          await expect(page.locator('a[href*="/author/actp"]').first()).toBeVisible();
          await expect(page.locator('#commentform')).toBeVisible();
        }],
      ],
    });
  });
}

test('BLOG-EXTRA Link ở ảnh, tiêu đề và Read More của mỗi bài cùng trỏ về một bài', async ({ page }) => {
  const bad: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở /blog/ và đối chiếu href của ảnh, tiêu đề và Read More', async () => {
        await openBlog(page);
        const n = await articles(page).count();
        for (let i = 0; i < n; i++) {
          const post = articles(page).nth(i);
          const hrefs = await post.locator('a:has(img), h2 a, a:has-text("Read More")').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
          if (new Set(hrefs).size > 1) bad.push(`${(await titleLink(post).innerText()).trim()}: ${hrefs.join(' | ')}`);
        }
      }],
    ],
    er: [
      ['Tất cả link trong cùng một bài trỏ về đúng một URL', async () => { expect(bad, bad.join('\n')).toEqual([]); }],
    ],
  });
});

test('BLOG-EXTRA Bình luận bỏ trống nội dung hoặc email sai định dạng bị từ chối', async ({ page }) => {
  const results: { label: string; body: string }[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Gửi form bình luận với nội dung trống và email sai định dạng', async () => {
        for (const o of [{ comment: '', email: 'qa.comment@example.com' }, { comment: 'Auto comment', email: 'abc' }]) {
          await page.goto(BLOG_POSTS[1].path);
          await page.fill('#comment', o.comment);
          await page.fill('#author', 'QA Tester');
          await page.fill('#email', o.email);
          await stripRequired(page);
          await page.evaluate(() => document.querySelectorAll('#commentform input[type=email]').forEach((e) => ((e as HTMLInputElement).type = 'text')));
          await page.locator('#commentform [type=submit]').click();
          await page.waitForLoadState('domcontentloaded');
          results.push({ label: `comment="${o.comment}", email="${o.email}"`, body: await page.locator('body').innerText() });
        }
      }],
    ],
    er: [
      ['Cả hai trường hợp đều bị từ chối với thông báo lỗi hợp lệ', async () => {
        for (const r of results) expect(r.body, r.label).toMatch(/fill the required fields|valid email|error/i);
      }],
    ],
  });
});

test('BLOG-EXTRA RSS feed /feed/ hoạt động và có đủ bài viết', async ({ request }) => {
  let status = 0, itemCount = 0;
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ['Gửi GET /feed/', async () => {
        const r = await request.get('/feed/');
        status = r.status();
        itemCount = ((await r.text()).match(/<item>/g) ?? []).length;
      }],
    ],
    er: [
      ['GET /feed/ trả HTTP 200', async () => { expect(status, 'GET /feed/').toBe(200); }],
      ['Số bài trong RSS feed khớp với BLOG_POSTS', async () => { expect(itemCount).toBe(BLOG_POSTS.length); }],
    ],
  });
});

test('BLOG-TC015 Link "Edit your profile" dẫn tới trang Account details', async ({ page }) => {
  const editLink = page.locator('#respond a[href*="edit-account"], #respond a[href*="profile"]').first();
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập BLOG_POSTS[1].path", async () => { await page.goto(BLOG_POSTS[1].path); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForLoadState('domcontentloaded'); }],
      ["Thực hiện: if (!(await editLink.count())) { test.skip(true, 'Không tìm…", async () => { if (!(await editLink.count())) {
          test.skip(true, 'Không tìm thấy link Edit your profile trong Leave a Reply');
          return;
        } }],
      ["Click editLink", async () => { await editLink.click(); }],
      ["Chờ trang/phần tử sẵn sàng", async () => { await page.waitForLoadState('domcontentloaded'); }],
    ],
    er: [
      [tcER(1, 1, "expect(page.url(), 'Link \"Edit your profile\" phải dẫn tới /…"), async () => { expect(page.url(), 'Link "Edit your profile" phải dẫn tới /my-account/edit-account/').toContain('/my-account/edit-account/'); }],
    ],
  });
});

// ---------------------------------------------------------------- Chuyển từ Manual sang Automated
const commentProfileLinks = (page: Page) => page.locator('.logged-in-as a');

test('BLOG-TC014 Link "Edit your profile" và "Log out?" ở khung bình luận có dấu hiệu nhận biết là link', async ({ page }) => {
  const links = commentProfileLinks(page);
  let linkCount = 0;
  const plain: string[] = [];
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở bài viết blog (đã đăng nhập bằng phiên lưu sẵn)', async () => {
        await page.goto(BLOG_POSTS[0].path);
      }],
      ['Kiểm tra style nhận biết link trong dòng "Logged in as ..."', async () => {
        linkCount = await links.count();
        for (const a of await links.all()) {
          const looksLikeLink = await a.evaluate((el) => {
            const s = getComputedStyle(el), p = getComputedStyle(el.parentElement!);
            return s.textDecorationLine.includes('underline') || s.color !== p.color || s.fontWeight !== p.fontWeight;
          });
          if (!looksLikeLink) plain.push(((await a.textContent()) ?? '').trim());
        }
      }],
    ],
    er: [
      [tcER(1, 2, 'Có dòng "Logged in as ..." với ít nhất 2 link'), async () => { expect(linkCount, 'Không thấy dòng "Logged in as ..."').toBeGreaterThanOrEqual(2); }],
      [tcER(2, 2, 'Các link đều có dấu hiệu nhận biết (gạch chân/màu/độ đậm)'), async () => { expect(plain, `Link trông như chữ thường: ${plain.join(', ')}`).toEqual([]); }],
    ],
  });
});
