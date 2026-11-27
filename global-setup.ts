import { chromium, FullConfig, request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { ACCOUNT } from './account';
import { login } from './tests/actp1/helpers';

export const AUTH_FILE = path.join(__dirname, '.auth', 'user.json');

/** Kiểm tra file storageState hiện có còn hợp lệ trên server hay đã hết hạn. */
export async function isAuthValid(baseURL: string): Promise<boolean> {
  if (!fs.existsSync(AUTH_FILE)) return false;
  try {
    const state = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const now = Date.now();
    const hasCookie = (state.cookies ?? []).some(
      (c: { name: string; expires?: number }) =>
        /wordpress_logged_in/.test(c.name) && (!c.expires || c.expires < 0 || c.expires * 1000 > now),
    );
    if (!hasCookie) return false;
    const ctx = await request.newContext({ baseURL, storageState: AUTH_FILE });
    try {
      const res = await ctx.get('/my-account/');
      const html = await res.text();
      return res.ok() && /href="[^"]*customer-logout/i.test(html);
    } finally {
      await ctx.dispose();
    }
  } catch {
    return false;
  }
}

/** Đảm bảo phiên đăng nhập trong .auth/user.json còn hợp lệ; chỉ đăng nhập lại khi chưa có hoặc đã hết hạn. */
export async function ensureAuth(baseURL: string, force = false): Promise<void> {
  if (!force && (await isAuthValid(baseURL))) {
    console.log(`[global-setup] Dùng lại phiên đăng nhập hợp lệ từ .auth/user.json (${ACCOUNT.user})`);
    return;
  }
  if (!ACCOUNT.user || ACCOUNT.user.includes('dien-')) {
    throw new Error('Chưa điền tài khoản: sửa account.ts hoặc đặt biến môi trường ACTP_USER / ACTP_PASS');
  }
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });
  await login(page, ACCOUNT.user, ACCOUNT.pass);
  const ok = await page.locator('.woocommerce-MyAccount-navigation').waitFor({ timeout: 20_000 }).then(() => true, () => false);
  if (!ok) {
    await browser.close();
    throw new Error(`Đăng nhập thất bại với ${ACCOUNT.user} — kiểm tra lại account.ts (web có thể đã reset thứ Bảy 01:00 nên cần đăng ký lại)`);
  }
  await page.context().storageState({ path: AUTH_FILE });
  await browser.close();
  console.log(`[global-setup] Đã đăng nhập lại và lưu phiên mới cho ${ACCOUNT.user}`);
}

/**
 * Khởi tạo phiên kiểm thử: chỉ đăng nhập 1 lần khi chưa có hoặc phiên hết hạn/không hợp lệ.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL ?? 'https://actp1.csc.edu.vn';
  await ensureAuth(baseURL);
}
