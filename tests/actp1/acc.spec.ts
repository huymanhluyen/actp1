/**
 * ACC – Đăng ký, đăng nhập, quên mật khẩu, quản lý tài khoản, bảo mật tài khoản
 * Mỗi test bắt đầu bằng TC ID trong Project Report (VD: ACC-TC007).
 * Chạy riêng module: npx playwright test tests/actp1/acc.spec.ts
 */
import { Page, expect, test } from '@playwright/test';
import { SERVER_ERR, STRONG_PWD, collectDialogs, login, loginOnPage, logout, noFollow, register, registerOnPage, setCountryState, stripRequired, uniqueEmail } from './helpers';

const registerForm = (page: Page) => page.locator('form.woocommerce-form-register');

const registerButton = (page: Page) => registerForm(page).getByRole('button', { name: 'Register' });

const errorBox = (page: Page) => page.locator('.woocommerce-error');

const accountMenu = (page: Page) => page.locator('.woocommerce-MyAccount-navigation');

const loginUsername = (page: Page) => page.locator('form.woocommerce-form-login').getByLabel('Username or email address');

/** Tài khoản mới đăng ký chưa có tên → phải điền First/Last name, nếu không form báo thêm lỗi "required field" làm lẫn kết quả. */
async function fillAccountNames(page: Page) {
  await page.fill('#account_first_name', 'QA');
  await page.fill('#account_last_name', 'Tester');
}

// Bổ sung: đăng ký / đăng nhập / quên mật khẩu theo bảng dữ liệu
const LOCKED = /locked|too many|try again later|blocked/i;

async function submitRegister(page: Page, email: string, pwd: string, serverSide: boolean) {
  await page.goto('/my-account/');
  const form = registerForm(page);
  if (email) await form.getByLabel('Email address').fill(email);
  if (pwd) await form.locator('#reg_password').pressSequentially(pwd);   // gõ từng phím để thanh đo độ mạnh mật khẩu chạy
  if (serverSide) await stripRequired(page);                              // gỡ required để kiểm tra validation phía server
  const btn = form.getByRole('button', { name: 'Register' });
  await expect(btn).toBeEnabled();
  await btn.click();
}

const REGISTER_SERVER = [
  { id: 'ACC-TC007', title: 'bỏ trống email', email: () => '', pwd: STRONG_PWD, error: /valid email address/i },
  { id: 'ACC-TC008', title: 'bỏ trống password', email: () => uniqueEmail(), pwd: '', error: /enter an account password/i },
];

const BAD_EMAILS = [
  { email: 'abc@', label: 'thiếu tên miền' },
  { email: 'abc', label: 'thiếu dấu at và tên miền' },
  { email: '@example.com', label: 'thiếu phần tên trước dấu at' },
  { email: 'abc@@example.com', label: 'có 2 dấu at liên tiếp' },
  { email: 'a b@example.com', label: 'có khoảng trắng ở giữa' },
  { email: 'abc@example..com', label: 'tên miền có 2 dấu chấm liên tiếp' },
];

async function submitLogin(page: Page, user: string, pwd: string) {
  await page.goto('/my-account/');
  const form = page.locator('form.woocommerce-form-login');
  if (user) await form.getByLabel('Username or email address').fill(user);
  if (pwd) await form.getByLabel('Password').fill(pwd);
  await stripRequired(page);
  await form.getByRole('button', { name: /logg? in/i }).click();
}

const UNKNOWN = [
  { title: 'email chưa đăng ký', user: 'notexist_999@example.com' },
  { title: 'username chưa đăng ký', user: 'khongtontai_user' },
];

const NO_PASSWORD = [
  { title: 'email', pick: (a: { email: string; username: string }) => a.email },
  { title: 'username', pick: (a: { email: string; username: string }) => a.username },
];

async function submitReset(page: Page, value: string) {
  await page.goto('/my-account/lost-password/');
  if (value) await page.locator('#user_login').fill(value);
  await stripRequired(page);
  await page.getByRole('button', { name: 'Reset password' }).click();
}

const UNKNOWN_RESET = [
  { label: 'email', value: 'notexist_999@example.com' },
  { label: 'username', value: 'khongtontai_user' },
];

test('ACC-TC006 Đăng ký với email và mật khẩu hợp lệ', async ({ page }) => {
  await register(page);
  await expect(page.getByText('Thank you for logging into your account.')).toBeVisible();
});

for (const r of REGISTER_SERVER) {
  test(`${r.id} Đăng ký ${r.title}`, async ({ page }) => {
    await submitRegister(page, r.email(), r.pwd, true);
    await expect(errorBox(page)).toContainText(r.error);
    await expect(accountMenu(page)).toBeHidden();
  });
}

for (const b of BAD_EMAILS) {
  test(`ACC-TC009 Đăng ký với email sai định dạng: ${b.label}`, async ({ page }) => {   // không để ký tự @ trong tên test (Playwright coi là tag)
    await submitRegister(page, b.email, STRONG_PWD, false);
    const blocked = (await registerForm(page).locator('input:invalid').count()) + (await errorBox(page).count());
    expect(blocked, 'Trình duyệt hoặc server phải chặn email sai định dạng').toBeGreaterThan(0);
    await expect(accountMenu(page)).toBeHidden();
  });
}

test('ACC-TC010 Đăng ký với email đã tồn tại', async ({ page }) => {
  const { email } = await register(page);
  await logout(page);                                   // xóa cookie rồi mở lại /my-account/
  await registerOnPage(page, email, STRONG_PWD);
  await expect(errorBox(page)).toContainText(/already registered/i);
});

test('ACC-TC011 Đăng ký với mật khẩu yếu', async ({ page }) => {
  await page.goto('/my-account/');
  const form = registerForm(page);
  await form.getByLabel('Email address').fill(uniqueEmail());
  await page.locator('#reg_password').fill('123');
  await page.locator('#reg_password').press('Enter');

  await expect(form.getByText(/stronger password/i)).toBeVisible();
  await expect(registerButton(page)).toBeDisabled();
});

test('ACC-TC012 Đăng ký với email có khoảng trắng đầu/cuối', async ({ page }) => {
  const clean = uniqueEmail();
  await submitRegister(page, `  ${clean}  `, STRONG_PWD, false);
  await expect(accountMenu(page).or(errorBox(page)).first()).toBeVisible();
  expect(SERVER_ERR.test(await page.content())).toBe(false);
  if (await accountMenu(page).isVisible()) {                               // đăng ký được → email lưu phải đã trim
    await page.goto('/my-account/edit-account/');
    await expect(page.locator('#account_email')).toHaveValue(clean);
  }
});

test('ACC-TC013 Đăng ký với email chứa mã XSS', async ({ page }) => {
  const msgs = collectDialogs(page);
  await page.goto('/my-account/');
  await registerOnPage(page, "'><script>alert('xss3')</script>@x.com", STRONG_PWD);

  await expect(registerForm(page).locator('input:invalid')).toHaveCount(1);   // trình duyệt chặn email sai định dạng
  await expect(accountMenu(page)).toBeHidden();
  expect(msgs.some((m) => m.includes('xss3'))).toBe(false);
});

test('ACC-TC014 Đăng ký với email quá dài (>254 ký tự)', async ({ page }) => {
  await page.goto('/my-account/');
  await registerOnPage(page, 'a'.repeat(300) + '@example.com', STRONG_PWD);
  await page.waitForLoadState();

  expect(SERVER_ERR.test(await page.content())).toBe(false);
  await expect(accountMenu(page)).toBeHidden();
  const blocked = (await errorBox(page).count()) + (await registerForm(page).locator('input:invalid').count());
  expect(blocked).toBeGreaterThan(0);       // hoặc trình duyệt chặn, hoặc server báo lỗi
});

test('ACC-TC015 Đăng nhập bằng email hợp lệ', async ({ page }) => {
  const { email, pwd } = await register(page);
  await logout(page);
  await loginOnPage(page, email, pwd);
  await expect(accountMenu(page)).toBeVisible();
  await expect(page.getByText('Thank you for logging into your account.')).toBeVisible();
});

test('ACC-TC016 Đăng nhập bằng username hợp lệ', async ({ page }) => {
  const { email, pwd } = await register(page);
  await logout(page);
  await loginOnPage(page, email.split('@')[0].toLowerCase(), pwd);   // đăng nhập bằng username
  await expect(accountMenu(page)).toBeVisible();
});

test('ACC-TC017 Đăng nhập sai mật khẩu', async ({ page }) => {
  const { email } = await register(page);
  await logout(page);
  await loginOnPage(page, email, 'sai_password_123');
  await expect(errorBox(page)).toContainText(/incorrect/i);
  await expect(accountMenu(page)).toBeHidden();
});

for (const u of UNKNOWN) {
  test(`ACC-TC018 Đăng nhập bằng ${u.title}`, async ({ page }) => {
    await submitLogin(page, u.user, 'Abc@12345');
    await expect(errorBox(page)).toContainText(/unknown|not registered|invalid|incorrect/i);
    await expect(accountMenu(page)).toBeHidden();
  });
}

test('ACC-TC019 Đăng nhập bỏ trống username', async ({ page }) => {
  await submitLogin(page, '', 'Abc@12345');
  await expect(errorBox(page)).toContainText(/username is required/i);
  await expect(accountMenu(page)).toBeHidden();
});

for (const u of NO_PASSWORD) {
  test(`ACC-TC020 Đăng nhập bằng ${u.title} hợp lệ nhưng bỏ trống password`, async ({ page }) => {
    const a = await register(page);                                         // tạo tài khoản mới ngay trong test
    await logout(page);
    await page.locator('#neve_body').press('ControlOrMeta+Shift+R');
    await submitLogin(page, u.pick({ email: a.email, username: a.email.split('@')[0].toLowerCase() }), '');
    await expect(errorBox(page)).toContainText(/password field is empty/i);
    await expect(accountMenu(page)).toBeHidden();
  });
}

test('ACC-TC021 Đăng nhập sai mật khẩu liên tiếp 10 lần', async ({ page }) => {
  const { email, pwd } = await register(page);
  await logout(page);

  const errors = page.locator('.woocommerce-error');
  let locked = false;
  for (let i = 1; i <= 10 && !locked; i++) {
    await loginOnPage(page, email, `Sai!Mat-khau-${i}`);
    await expect(errors, `Lần ${i}: phải có thông báo lỗi`).toBeVisible();
    const text = await errors.innerText();
    expect(SERVER_ERR.test(await page.content()), `Lần ${i}: lỗi server`).toBe(false);
    expect(text, `Lần ${i}: thông báo không được lộ mật khẩu thật`).not.toContain(pwd);
    await expect(page.locator('.woocommerce-MyAccount-navigation')).toBeHidden();
    locked = LOCKED.test(text);
  }
  test.info().annotations.push({ type: 'brute-force', description: locked ? 'Có cơ chế khóa/giới hạn' : 'Không có cơ chế khóa/giới hạn' });

  if (!locked) {                       // không bị khóa thì đăng nhập đúng vẫn phải vào được
    await loginOnPage(page, email, pwd);
    await expect(page.locator('.woocommerce-MyAccount-navigation')).toBeVisible();
  }
});

test('ACC-TC024 Cập nhật địa chỉ billing', async ({ page }) => {
  await register(page);
  await page.goto('/my-account/edit-address/billing/');
  await setCountryState(page);
  await page.fill('#billing_first_name', 'Test');
  await page.fill('#billing_last_name', 'Playwright');
  await page.fill('#billing_address_1', '123 Test Street');
  await page.fill('#billing_city', 'New York');
  await page.fill('#billing_postcode', '10001');
  await page.fill('#billing_phone', '2125551234');
  await page.click("button[name='save_address']");
  await expect(page.locator('.woocommerce-message')).toContainText('Address changed successfully');
});

test('ACC-TC025 Cập nhật Account details (tên hiển thị)', async ({ page }) => {
  await register(page);
  await page.goto('/my-account/edit-account/');
  await page.fill('#account_first_name', 'QA');
  await page.fill('#account_last_name', 'Tester');
  await page.fill('#account_display_name', 'QA Tester');
  await page.click("button[name='save_account_details']");
  await expect(page.locator('.woocommerce-message')).toContainText('Account details changed successfully');
});

test('ACC-TC026 Đổi mật khẩu với xác nhận mật khẩu không khớp', async ({ page }) => {
  const { pwd } = await register(page);
  await page.goto('/my-account/edit-account/');
  await fillAccountNames(page);
  await page.fill('#password_current', pwd);
  await page.fill('#password_1', 'New!Pass-12345-Aa');
  await page.fill('#password_2', 'Different!Pass-1-Bb');
  await page.click("button[name='save_account_details']");
  const err = await errorBox(page).innerText();
  expect(err).toMatch(/passwords do not match/i);
  expect(err, 'Chỉ được báo lỗi mật khẩu không khớp').not.toMatch(/required field/i);
});

test('ACC-TC027 Đổi mật khẩu với mật khẩu hiện tại sai', async ({ page }) => {
  await register(page);
  await page.goto('/my-account/edit-account/');
  await fillAccountNames(page);
  await page.fill('#password_current', 'Wrong!Current-1');
  await page.fill('#password_1', 'New!Pass-12345-Aa');
  await page.fill('#password_2', 'New!Pass-12345-Aa');
  await page.click("button[name='save_account_details']");
  const err = await errorBox(page).innerText();
  expect(err).toMatch(/current password is incorrect/i);
  expect(err, 'Chỉ được báo lỗi mật khẩu hiện tại sai').not.toMatch(/required field/i);
});

test('ACC-TC029 Nút Back sau khi logout không lộ dashboard', async ({ page }) => {
  await register(page);
  await page.goto('/my-account/edit-account/');            // đứng ở trang riêng (khác URL sau khi logout) để Back có chỗ quay lại
  await page.locator('.woocommerce-MyAccount-navigation-link--customer-logout a').click();
  const confirm = page.getByRole('link', { name: /confirm and log out/i });
  await confirm.waitFor({ state: 'visible', timeout: 2000 }).then(() => confirm.click()).catch(() => {});   // có trang xác nhận thì bấm
  await expect(loginUsername(page)).toBeVisible();

  await page.goBack();
  await page.reload();
  await expect(accountMenu(page)).toHaveCount(0);
  await expect(page.locator('#account_email')).toHaveCount(0);   // không lộ dữ liệu tài khoản
  await expect(loginUsername(page)).toBeVisible();
});

test('ACC-TC030 Truy cập trang tài khoản khi chưa đăng nhập', async ({ page }) => {
  await page.goto('/my-account/orders/');
  await expect(loginUsername(page)).toBeVisible();
  await expect(page.locator('.woocommerce-orders-table')).toHaveCount(0);
});

test('ACC-TC032 Reset mật khẩu để trống username/email', async ({ page }) => {
  await submitReset(page, '');
  await expect(errorBox(page)).toContainText(/enter a username or email address/i);
});

for (const u of UNKNOWN_RESET) {
  test(`ACC-TC033 Reset mật khẩu với ${u.label} chưa đăng ký`, async ({ page }) => {
    await submitReset(page, u.value);
    await expect(errorBox(page)).toContainText(/invalid username or email|no user|not found|not registered/i);
  });
}

// Bảo mật và accessibility (ACC-TC035…039)
test('ACC-TC035 /xmlrpc.php bị chặn khi truy cập công khai', async ({ request }) => {
  const r = await request.get('/xmlrpc.php', noFollow);
  expect([403, 404], `/xmlrpc.php trả HTTP ${r.status()}`).toContain(r.status());
});

test('ACC-TC036 REST API /wp-json/wp/v2/users không trả danh sách người dùng', async ({ request }) => {
  const r = await request.get('/wp-json/wp/v2/users', noFollow);
  if (r.status() === 200) {
    const body = await r.json().catch(() => null);
    expect(Array.isArray(body) && body.length > 0, 'REST API đang trả danh sách user khi chưa đăng nhập').toBe(false);
  } else {
    expect([401, 403, 404], `REST /users trả HTTP ${r.status()}`).toContain(r.status());
  }
});

test('ACC-TC037 /?author=1 không chuyển hướng sang /author/<username>/', async ({ request }) => {
  const r = await request.get('/?author=1', noFollow);
  const loc = r.headers()['location'] ?? '';
  expect(loc, `Location = ${loc}`).not.toMatch(/\/author\/[^/?#]+/);
});

test('ACC-TC038 Trang đăng nhập không redirect sang domain ngoài qua redirect_to', async ({ request }) => {
  const r = await request.get('/my-account/?redirect_to=//evil.com', noFollow);
  const loc = r.headers()['location'] ?? '';
  expect(loc, `Location = ${loc}`).not.toContain('evil.com');
});

test('ACC-TC039 Các ô nhập ở trang My account đều có label hoặc aria-label', async ({ page }) => {
  await page.goto('/my-account/');
  const missing = await page.$$eval('input:not([type=hidden]):not([type=submit]):not([type=button])', (els) =>
    els
      .filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; })
      .filter((e) => { const el = e as HTMLInputElement; return !((el.labels && el.labels.length) || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title')); })
      .map((e) => `${e.tagName.toLowerCase()}#${e.id || e.getAttribute('name')}`));
  expect(missing, `Ô nhập không có nhãn: ${missing.join(', ')}`).toEqual([]);
});

test('ACC-TC040 Đổi mật khẩu trùng mật khẩu hiện tại phải bị từ chối', async ({ page }) => {
  const { pwd } = await register(page);   // tự tạo tài khoản mới, không cần ACTP_USER / ACTP_PASS
  await page.goto('/my-account/edit-account/');
  await fillAccountNames(page);
  await page.fill('#password_current', pwd);
  await page.fill('#password_1', pwd);
  await page.fill('#password_2', pwd);
  await page.click("button[name='save_account_details']");
  await expect(errorBox(page)).toBeVisible();
});