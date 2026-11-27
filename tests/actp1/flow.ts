/**
 * Khung viết test case chuẩn hóa: PRE_CONDITION (API) → MAIN TEST (E2E) → EXPECTED RESULT → POST_CONDITION (API).
 * Mỗi bước là 1 test.step có tiêu đề dạng  "<SECTION>|<thứ tự>/<tổng>|<tên bước>"  để reporter
 * (reporters/terminal-reporter.ts) gom lại và in ra Terminal.
 *
 * Quy tắc chạy:
 *  - PRE lỗi    → bỏ qua MAIN và ER (SKIPPED), vẫn chạy POST để dọn dẹp.
 *  - MAIN lỗi   → dừng MAIN, bỏ qua ER (SKIPPED), vẫn chạy POST.
 *  - ER         → mỗi ER độc lập, ER này FAIL không chặn ER khác.
 *  - POST       → luôn chạy, mỗi bước độc lập (1 bước dọn dẹp lỗi không chặn bước sau).
 */
import { APIRequestContext, Page, expect, test } from '@playwright/test';
import { TC_DATA } from './tc-data';
import { isGuest } from './guest';

export type Step = [name: string, fn: () => Promise<void>];
export interface Flow { pre?: Step[]; main: Step[]; er: Step[]; post?: Step[] }
export type Section = 'PRE' | 'MAIN' | 'ER' | 'POST';

export const SKIP_MARK = '[SKIPPED]';
const title = (sec: Section, i: number, n: number, name: string, skipped = false) =>
  `${sec}|${i}/${n}|${name}${skipped ? ' ' + SKIP_MARK : ''}`;

export async function runFlow(flow: Flow): Promise<void> {
  const errors: { sec: Section; step: string; err: unknown }[] = [];
  const skip = async (sec: Section, steps: Step[], from: number) => {
    for (let i = from; i < steps.length; i++) await test.step(title(sec, i + 1, steps.length, steps[i][0], true), async () => {});
  };
  const seq = async (sec: Section, steps: Step[]): Promise<boolean> => {
    for (let i = 0; i < steps.length; i++) {
      try { await test.step(title(sec, i + 1, steps.length, steps[i][0]), steps[i][1]); }
      catch (err) { errors.push({ sec, step: steps[i][0], err }); await skip(sec, steps, i + 1); return false; }
    }
    return true;
  };
  const pre = flow.pre ?? [], post = flow.post ?? [];
  const preOk = await seq('PRE', pre);
  const mainOk = preOk ? await seq('MAIN', flow.main) : (await skip('MAIN', flow.main, 0), false);
  if (mainOk) {
    for (let i = 0; i < flow.er.length; i++) {
      try { await test.step(title('ER', i + 1, flow.er.length, flow.er[i][0]), flow.er[i][1]); }
      catch (err) { errors.push({ sec: 'ER', step: flow.er[i][0], err }); }
    }
  } else await skip('ER', flow.er, 0);
  for (let i = 0; i < post.length; i++) {                 // POST luôn chạy, mỗi bước độc lập
    try { await test.step(title('POST', i + 1, post.length, post[i][0]), post[i][1]); }
    catch (err) { errors.push({ sec: 'POST', step: post[i][0], err }); }
  }
  if (errors.length) {
    const first = errors.find((e) => e.sec !== 'POST') ?? errors[0];
    throw first.err instanceof Error ? first.err : new Error(String(first.err));
  }
}

// ======================================================= API dùng cho PRE / POST (không đi qua giao diện)
const unescapeHtml = (s: string) => s.replace(/&#0?38;|&amp;/g, '&').replace(/&#0?39;|&#x27;/g, "'");

/** Tạo tài khoản mới bằng request trực tiếp tới form đăng ký WooCommerce (không dùng UI). Cookie đăng nhập nằm trong `request`. */
export async function apiRegister(request: APIRequestContext, email: string, pwd: string): Promise<void> {
  const html = await (await request.get('/my-account/')).text();
  const nonce = html.match(/name="woocommerce-register-nonce"[^>]*value="([^"]+)"/)?.[1]
    ?? html.match(/value="([^"]+)"[^>]*name="woocommerce-register-nonce"/)?.[1];
  if (!nonce) throw new Error('API đăng ký: không tìm thấy woocommerce-register-nonce trong /my-account/');
  const res = await request.post('/my-account/', { form: { email, password: pwd, 'woocommerce-register-nonce': nonce, _wp_http_referer: '/my-account/', register: 'Register' } });
  const body = await res.text();
  if (!res.ok() || !/customer-logout|MyAccount-navigation/.test(body)) throw new Error(`API đăng ký không thành công (HTTP ${res.status()})`);
}

/** Xóa toàn bộ sản phẩm trong giỏ hàng bằng các link remove_item. Trả về số sản phẩm đã xóa. */
export async function apiClearCart(request: APIRequestContext): Promise<number> {
  const html = await (await request.get('/cart/')).text();
  const links = Array.from(html.matchAll(/href="([^"]*remove_item=[^"]*)"/g)).map((m) => unescapeHtml(m[1]));
  for (const l of Array.from(new Set(links))) await request.get(l);
  return new Set(links).size;
}

/** Đăng xuất bằng link customer-logout (có nonce). Trả về true nếu đang đăng nhập và đã đăng xuất. */
export async function apiLogout(request: APIRequestContext): Promise<boolean> {
  const html = await (await request.get('/my-account/')).text();
  const href = html.match(/href="([^"]*customer-logout[^"]*)"/)?.[1];
  if (!href) return false;
  await request.get(unescapeHtml(href));
  return true;
}

/** Kiểm tra site truy cập được (dùng làm điều kiện tiên quyết cho test không cần dữ liệu). */
export async function apiHealthCheck(request: APIRequestContext, path = '/'): Promise<void> {
  const res = await request.get(path);
  if (res.status() >= 400) throw new Error(`GET ${path} → HTTP ${res.status()}`);
}

// ======================================================= Nhãn tự động lấy từ Project Report (tc-data.ts)
const oneLine = (s: string, n = 110) => { const t = s.replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
const curId = () => test.info().title.match(/^[A-Z]+-(?:TC\d{3}|EXTRA)/)?.[0] ?? '';

/** Nhãn ER-i/k: lấy từ cột Expected Result trong Excel (khớp số dòng thì dùng đúng dòng đó). */
export function tcER(i: number, k: number, code: string): string {
  const er = TC_DATA[curId()]?.er ?? [];
  if (!er.length) return oneLine(code);
  if (er.length === k) return oneLine(er[i - 1]);
  if (k === 1) return oneLine(er.join('; '));
  return oneLine(`${er[0]} — ${code}`);
}

/** PRE_CONDITION chuẩn: kiểm tra đúng trạng thái đăng nhập mà TC cần (khách / tài khoản dùng chung), kèm Pre-Condition ghi trong Excel. */
export function autoPre(page: Page): Step[] {
  const guest = isGuest(test.info().title);
  const pre = TC_DATA[curId()]?.pre;
  const name = (guest ? 'Chưa đăng nhập (khách, cookie rỗng)' : 'Đã đăng nhập bằng tài khoản dùng chung (cookie từ global-setup)') + (pre ? ' · ĐK: ' + oneLine(pre, 70) : '');
  return [[name, async () => {
    const logged = (await page.context().cookies()).some((c) => /wordpress_logged_in/.test(c.name));
    expect(logged, guest ? 'TC này phải chạy khi chưa đăng nhập nhưng đang có cookie đăng nhập' : 'Chưa có phiên đăng nhập — kiểm tra account.ts / global-setup').toBe(!guest);
  }]];
}

/** PRE_CONDITION cho test chỉ dùng APIRequestContext (không có page). */
export function apiPre(request: APIRequestContext, path = '/'): Step[] {
  return [[`Kiểm tra site truy cập được (GET ${path})`, () => apiHealthCheck(request, path)]];
}

/** POST_CONDITION chuẩn cho TC có đụng tới giỏ hàng: dọn sạch giỏ bằng API. */
export function cartPost(page: Page): Step[] {
  return [['Dọn giỏ hàng (API: gỡ từng sản phẩm trong /cart/)', async () => { await apiClearCart(page.request); }]];
}

/** POST_CONDITION chuẩn cho TC có đăng ký / đăng nhập tài khoản test: đăng xuất và xóa cookie phiên. */
export function logoutPost(page: Page): Step[] {
  return [
    ['Đăng xuất bằng API (customer-logout)', async () => { await apiLogout(page.request).catch(() => {}); }],
    ['Xóa cookie phiên của tài khoản test', async () => { await page.context().clearCookies(); }],
  ];
}
