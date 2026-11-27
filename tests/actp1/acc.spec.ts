/**
 * ACC – Đăng ký, đăng nhập, quên mật khẩu, quản lý tài khoản, bảo mật tài khoản
 * Mỗi test bắt đầu bằng TC ID trong Project Report (VD: ACC-TC007).
 * Chạy riêng module: npx playwright test tests/actp1/acc.spec.ts
 */
import { Page } from '@playwright/test';
import { ACCOUNT } from '../../account';
import { expect, test } from './fixtures';
import { SERVER_ERR, STRONG_PWD, collectDialogs, login, loginOnPage, logout, noFollow, register, registerOnPage, setCountryState, stripRequired, uniqueEmail } from './helpers';
import { apiLogout, apiPre, apiRegister, autoPre, cartPost, logoutPost, runFlow, tcER } from './flow';

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
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: register(page)", async () => { await register(page); }],
    ],
    er: [
      [tcER(1, 1, "expect(page.getByText('Thank you for logging into your acco…"), async () => { await expect(page.getByText('Thank you for logging into your account.')).toBeVisible(); }],
    ],
    post: logoutPost(page),
  });
});

test('ACC-TC007 Đăng ký bỏ trống email', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở /my-account/, bỏ trống email, nhập mật khẩu mạnh và bấm Register', async () => { await submitRegister(page, '', STRONG_PWD, false); }],
    ],
    er: [
      [tcER(1, 2, 'expect(errorBox(page)).toContainText(/Please provide a valid email address\\./i)'), async () => { await expect(errorBox(page)).toContainText(/Please provide a valid email address\./i); }],
      [tcER(2, 2, 'expect(accountMenu(page)).toBeHidden()'), async () => { await expect(accountMenu(page)).toBeHidden(); }],
    ],
  });
});

test('ACC-TC008 Đăng ký bỏ trống password', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở /my-account/, nhập email hợp lệ, bỏ trống mật khẩu và bấm Register', async () => { await submitRegister(page, uniqueEmail(), '', false); }],
    ],
    er: [
      [tcER(1, 2, 'expect(errorBox(page)).toContainText(/Please enter an account password\\./i)'), async () => { await expect(errorBox(page)).toContainText(/Please enter an account password\./i); }],
      [tcER(2, 2, 'expect(accountMenu(page)).toBeHidden()'), async () => { await expect(accountMenu(page)).toBeHidden(); }],
    ],
  });
});

for (const b of BAD_EMAILS) {
  test(`ACC-TC009 Đăng ký với email sai định dạng: ${b.label}`, async ({ page }) => {
  let blocked: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: submitRegister(page, b.email, STRONG_PWD, false)", async () => { await submitRegister(page, b.email, STRONG_PWD, false); }],
      ["Lấy dữ liệu \"blocked\": (await registerForm(page).locator('input:invalid'…", async () => { blocked = (await registerForm(page).locator('input:invalid').count()) + (await errorBox(page).count()); }],
    ],
    er: [
      [tcER(1, 2, "expect(blocked, 'Trình duyệt hoặc server phải chặn email sa…"), async () => { expect(blocked, 'Trình duyệt hoặc server phải chặn email sai định dạng').toBeGreaterThan(0); }],
      [tcER(2, 2, "expect(accountMenu(page)).toBeHidden()"), async () => { await expect(accountMenu(page)).toBeHidden(); }],
    ],
  });
});
}

test('ACC-TC010 Đăng ký với email đã tồn tại', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: const { email } = await register(page)", async () => { const { email } = await register(page);
      await logout(page);
      await registerOnPage(page, email, STRONG_PWD); }],
    ],
    er: [
      [tcER(1, 1, "expect(errorBox(page)).toContainText(/already registered/i)"), async () => { await expect(errorBox(page)).toContainText(/already registered/i); }],
    ],
  });
});

test('ACC-TC011 Đăng ký với mật khẩu yếu', async ({ page }) => {
  const form = registerForm(page);
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập /my-account/", async () => { await page.goto('/my-account/'); }],
      ["Nhập uniqueEmail() vào 'Email address'", async () => { await form.getByLabel('Email address').fill(uniqueEmail()); }],
      ["Nhập '123' vào '#reg_password'", async () => { await page.locator('#reg_password').fill('123'); }],
      ["Thực hiện: page.locator('#reg_password').press('Enter')", async () => { await page.locator('#reg_password').press('Enter'); }],
    ],
    er: [
      [tcER(1, 2, "expect(form.getByText(/stronger password/i)).toBeVisible()"), async () => { await expect(form.getByText(/stronger password/i)).toBeVisible(); }],
      [tcER(2, 2, "expect(registerButton(page)).toBeDisabled()"), async () => { await expect(registerButton(page)).toBeDisabled(); }],
    ],
  });
});

test('ACC-TC012 Đăng ký với email có khoảng trắng đầu/cuối', async ({ page }) => {
  const clean = uniqueEmail();
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: submitRegister(page, ` ${clean} `, STRONG_PWD, false)", async () => { await submitRegister(page, `  ${clean}  `, STRONG_PWD, false); }],
    ],
    er: [
      [tcER(1, 3, "expect(accountMenu(page).or(errorBox(page)).first()).toBeVi…"), async () => { await expect(accountMenu(page).or(errorBox(page)).first()).toBeVisible(); }],
      [tcER(2, 3, "expect(SERVER_ERR.test(await page.content())).toBe(false)"), async () => { expect(SERVER_ERR.test(await page.content())).toBe(false); }],
      [tcER(3, 3, "if (await accountMenu(page).isVisible()) { // đăng ký được …"), async () => { if (await accountMenu(page).isVisible()) {                               // đăng ký được → email lưu phải đã trim
          await page.goto('/my-account/edit-account/');
          await expect(page.locator('#account_email')).toHaveValue(clean);
        } }],
    ],
  });
});

test('ACC-TC013 Đăng ký với email chứa mã XSS', async ({ page }) => {
  const msgs = collectDialogs(page);
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập /my-account/", async () => { await page.goto('/my-account/'); }],
      ["Thực hiện: registerOnPage(page, \"'><script>alert('xss3')</script>@x.co…", async () => { await registerOnPage(page, "'><script>alert('xss3')</script>@x.com", STRONG_PWD); }],
    ],
    er: [
      [tcER(1, 3, "expect(registerForm(page).locator('input:invalid')).toHaveC…"), async () => { await expect(registerForm(page).locator('input:invalid')).toHaveCount(1); }],
      [tcER(2, 3, "expect(accountMenu(page)).toBeHidden()"), async () => { await expect(accountMenu(page)).toBeHidden(); }],
      [tcER(3, 3, "expect(msgs.some((m) => m.includes('xss3'))).toBe(false)"), async () => { expect(msgs.some((m) => m.includes('xss3'))).toBe(false); }],
    ],
  });
});

test('ACC-TC014 Đăng ký với email quá dài (>254 ký tự)', async ({ page }) => {
  let blocked: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Chuẩn bị chuỗi email 300 ký tự", async () => { await page.goto('/my-account/'); }],
      ["Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập", async () => { await registerOnPage(page, 'a'.repeat(300) + '@example.com', STRONG_PWD); }],
      ["Tại khối Register, dán chuỗi email vừa chuẩn bị vào ô 'Email address'", async () => { await page.waitForLoadState(); }],
      ["Nhập 'Password' hợp lệ", async () => { expect(SERVER_ERR.test(await page.content())).toBe(false); }],
      ["Click nút 'Register'", async () => { await expect(accountMenu(page)).toBeHidden(); }],
      ["Quan sát: hiển thị lỗi hợp lệ, trang không trả lỗi 500 hoặc trắng trang", async () => { blocked = (await errorBox(page).count()) + (await registerForm(page).locator('input:invalid').count()); }],
    ],
    er: [
      [tcER(1, 1, "expect(blocked).toBeGreaterThan(0)"), async () => { expect(blocked).toBeGreaterThan(0); }],
    ],
  });
});

test('ACC-TC015 Đăng nhập bằng email hợp lệ', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: const { email, pwd } = await register(page)", async () => { const { email, pwd } = await register(page);
      await logout(page);
      await loginOnPage(page, email, pwd); }],
    ],
    er: [
      [tcER(1, 2, "expect(accountMenu(page)).toBeVisible()"), async () => { await expect(accountMenu(page)).toBeVisible(); }],
      [tcER(2, 2, "expect(page.getByText('Thank you for logging into your acco…"), async () => { await expect(page.getByText('Thank you for logging into your account.')).toBeVisible(); }],
    ],
    post: logoutPost(page),
  });
});

test('ACC-TC016 Đăng nhập bằng username hợp lệ', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: const { email, pwd } = await register(page)", async () => { const { email, pwd } = await register(page);
      await logout(page);
      await loginOnPage(page, email.split('@')[0].toLowerCase(), pwd); }],
    ],
    er: [
      [tcER(1, 1, "expect(accountMenu(page)).toBeVisible()"), async () => { await expect(accountMenu(page)).toBeVisible(); }],
    ],
    post: logoutPost(page),
  });
});

test('ACC-TC017 Đăng nhập sai mật khẩu', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: const { email } = await register(page)", async () => { const { email } = await register(page);
      await logout(page);
      await loginOnPage(page, email, 'sai_password_123'); }],
    ],
    er: [
      [tcER(1, 2, "expect(errorBox(page)).toContainText(/incorrect/i)"), async () => { await expect(errorBox(page)).toContainText(/incorrect/i); }],
      [tcER(2, 2, "expect(accountMenu(page)).toBeHidden()"), async () => { await expect(accountMenu(page)).toBeHidden(); }],
    ],
  });
});

for (const u of UNKNOWN) {
  test(`ACC-TC018 Đăng nhập bằng ${u.title}`, async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: submitLogin(page, u.user, 'Abc@12345')", async () => { await submitLogin(page, u.user, 'Abc@12345'); }],
    ],
    er: [
      [tcER(1, 2, "expect(errorBox(page)).toContainText(/unknown|not registere…"), async () => { await expect(errorBox(page)).toContainText(/unknown|not registered|invalid|incorrect/i); }],
      [tcER(2, 2, "expect(accountMenu(page)).toBeHidden()"), async () => { await expect(accountMenu(page)).toBeHidden(); }],
    ],
  });
});
}

test('ACC-TC019 Đăng nhập bỏ trống username', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: submitLogin(page, '', 'Abc@12345')", async () => { await submitLogin(page, '', 'Abc@12345'); }],
    ],
    er: [
      [tcER(1, 2, "expect(errorBox(page)).toContainText(/username is required/…"), async () => { await expect(errorBox(page)).toContainText(/username is required/i); }],
      [tcER(2, 2, "expect(accountMenu(page)).toBeHidden()"), async () => { await expect(accountMenu(page)).toBeHidden(); }],
    ],
  });
});

for (const u of NO_PASSWORD) {
  test(`ACC-TC020 Đăng nhập bằng ${u.title} hợp lệ nhưng bỏ trống password`, async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Lấy dữ liệu \"a\": await register(page)", async () => { const a = await register(page);
      await logout(page);
      await page.locator('#neve_body').press('ControlOrMeta+Shift+R');
      await submitLogin(page, u.pick({ email: a.email, username: a.email.split('@')[0].toLowerCase() }), ''); }],
    ],
    er: [
      [tcER(1, 2, "expect(errorBox(page)).toContainText(/password field is emp…"), async () => { await expect(errorBox(page)).toContainText(/password field is empty/i); }],
      [tcER(2, 2, "expect(accountMenu(page)).toBeHidden()"), async () => { await expect(accountMenu(page)).toBeHidden(); }],
    ],
  });
});
}

test('ACC-TC021 Đăng nhập sai mật khẩu liên tiếp 10 lần', async ({ page }) => {
  const errors = page.locator('.woocommerce-error');
  let email = '', pwd = '', locked = false;
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Tạo tài khoản mới rồi đăng xuất', async () => {
        ({ email, pwd } = await register(page));
        await logout(page);
      }],
      ['Đăng nhập sai mật khẩu liên tiếp tối đa 10 lần', async () => {
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
      }],
      ['Nếu chưa bị khóa thì đăng nhập lại bằng mật khẩu đúng', async () => {
        if (!locked) await loginOnPage(page, email, pwd);
      }],
    ],
    er: [
      [tcER(1, 1, 'Không lộ mật khẩu/lỗi server; nếu chưa khóa vẫn đăng nhập được bằng mật khẩu đúng'), async () => {
        if (!locked) await expect(page.locator('.woocommerce-MyAccount-navigation')).toBeVisible();
        else expect(locked).toBe(true);
      }],
    ],
    post: logoutPost(page),
  });
});

test('ACC-TC024 Cập nhật địa chỉ billing', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập /my-account/edit-address/billing/", async () => { await page.goto('/my-account/edit-address/billing/'); }],
      ["Thực hiện: setCountryState(page)", async () => { await setCountryState(page); }],
      ["Nhập 'Test' vào page", async () => { await page.fill('#billing_first_name', 'Test'); }],
      ["Nhập 'Playwright' vào page", async () => { await page.fill('#billing_last_name', 'Playwright'); }],
      ["Nhập '123 Test Street' vào page", async () => { await page.fill('#billing_address_1', '123 Test Street'); }],
      ["Nhập 'New York' vào page", async () => { await page.fill('#billing_city', 'New York'); }],
      ["Nhập '10001' vào page", async () => { await page.fill('#billing_postcode', '10001'); }],
      ["Nhập '2125551234' vào page", async () => { await page.fill('#billing_phone', '2125551234'); }],
      ["Click page", async () => { await page.click("button[name='save_address']"); }],
    ],
    er: [
      [tcER(1, 1, "expect(page.locator('.woocommerce-message')).toContainText(…"), async () => { await expect(page.locator('.woocommerce-message')).toContainText('Address changed successfully'); }],
    ],
  });
});

test('ACC-TC025 Cập nhật Account details (tên hiển thị)', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập https://actp1.csc.edu.vn/my-account/ và click mục 'Account details'", async () => { await page.goto('/my-account/edit-account/'); }],
      ["Nhập 'First name' = 'Test', 'Last name' = 'User', 'Display name' = 'Test User'", async () => { await page.fill('#account_first_name', 'QA'); }],
      ["Để trống phần đổi mật khẩu, click nút 'Save changes'", async () => { await page.fill('#account_last_name', 'Tester'); }],
      ["Kiểm tra hiển thị 'Account details changed successfully.'", async () => { await page.fill('#account_display_name', 'QA Tester'); }],
      ["Reload trang, kiểm tra các giá trị vừa nhập vẫn được lưu", async () => { await page.click("button[name='save_account_details']"); }],
    ],
    er: [
      [tcER(1, 1, "expect(page.locator('.woocommerce-message')).toContainText(…"), async () => { await expect(page.locator('.woocommerce-message')).toContainText('Account details changed successfully'); }],
    ],
  });
});

test('ACC-TC026 Đổi mật khẩu với xác nhận mật khẩu không khớp', async ({ page }) => {
  let err: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Mở /my-account/edit-account/, điền tên và mật khẩu hiện tại", async () => {
        await page.goto('/my-account/edit-account/');
        await fillAccountNames(page);
        await page.fill('#password_current', ACCOUNT.pass);
      }],
      ["Nhập 'New!Pass-12345-Aa' vào page", async () => { await page.fill('#password_1', 'New!Pass-12345-Aa'); }],
      ["Nhập 'Different!Pass-1-Bb' vào page", async () => { await page.fill('#password_2', 'Different!Pass-1-Bb'); }],
      ["Click page", async () => { await page.click("button[name='save_account_details']"); }],
      ["Lấy dữ liệu \"err\": await errorBox(page).innerText()", async () => { err = await errorBox(page).innerText(); }],
    ],
    er: [
      [tcER(1, 2, "expect(err).toMatch(/passwords do not match/i)"), async () => { expect(err).toMatch(/passwords do not match/i); }],
      [tcER(2, 2, "expect(err, 'Chỉ được báo lỗi mật khẩu không khớp').not.toM…"), async () => { expect(err, 'Chỉ được báo lỗi mật khẩu không khớp').not.toMatch(/required field/i); }],
    ],
  });
});

test('ACC-TC027 Đổi mật khẩu với mật khẩu hiện tại sai', async ({ page }) => {
  let err: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập /my-account/edit-account/", async () => { await page.goto('/my-account/edit-account/'); }],
      ["Thực hiện: fillAccountNames(page)", async () => { await fillAccountNames(page); }],
      ["Nhập 'Wrong!Current-1' vào page", async () => { await page.fill('#password_current', 'Wrong!Current-1'); }],
      ["Nhập 'New!Pass-12345-Aa' vào page", async () => { await page.fill('#password_1', 'New!Pass-12345-Aa'); }],
      ["Nhập 'New!Pass-12345-Aa' vào page", async () => { await page.fill('#password_2', 'New!Pass-12345-Aa'); }],
      ["Click page", async () => { await page.click("button[name='save_account_details']"); }],
      ["Lấy dữ liệu \"err\": await errorBox(page).innerText()", async () => { err = await errorBox(page).innerText(); }],
    ],
    er: [
      [tcER(1, 2, "expect(err).toMatch(/current password is incorrect/i)"), async () => { expect(err).toMatch(/current password is incorrect/i); }],
      [tcER(2, 2, "expect(err, 'Chỉ được báo lỗi mật khẩu hiện tại sai').not.t…"), async () => { expect(err, 'Chỉ được báo lỗi mật khẩu hiện tại sai').not.toMatch(/required field/i); }],
    ],
  });
});

test('ACC-TC029 Nút Back sau khi logout không lộ dashboard', async ({ page }) => {
  const confirm = page.getByRole('link', { name: /confirm and log out/i });
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: register(page)", async () => { await register(page); }],
      ["Truy cập /my-account/edit-account/", async () => { await page.goto('/my-account/edit-account/'); }],
      ["Click '.woocommerce-MyAccount-navigation-link--customer-logout a'", async () => { await page.locator('.woocommerce-MyAccount-navigation-link--customer-logout a').click(); }],
      ["Click 'visible'", async () => { await confirm.waitFor({ state: 'visible', timeout: 2000 }).then(() => confirm.click()).catch(() => {}); }],
      ["Kiểm tra: expect(loginUsername(page)).toBeVisible()", async () => { await expect(loginUsername(page)).toBeVisible(); }],
      ["Thực hiện: page.goBack()", async () => { await page.goBack(); }],
      ["Tải lại trang (F5)", async () => { await page.reload(); }],
    ],
    er: [
      [tcER(1, 3, "expect(accountMenu(page)).toHaveCount(0)"), async () => { await expect(accountMenu(page)).toHaveCount(0); }],
      [tcER(2, 3, "expect(page.locator('#account_email')).toHaveCount(0)"), async () => { await expect(page.locator('#account_email')).toHaveCount(0); }],
      [tcER(3, 3, "expect(loginUsername(page)).toBeVisible()"), async () => { await expect(loginUsername(page)).toBeVisible(); }],
    ],
  });
});

test('ACC-TC030 Truy cập trang tài khoản khi chưa đăng nhập', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Truy cập /my-account/orders/", async () => { await page.goto('/my-account/orders/'); }],
    ],
    er: [
      [tcER(1, 2, "expect(loginUsername(page)).toBeVisible()"), async () => { await expect(loginUsername(page)).toBeVisible(); }],
      [tcER(2, 2, "expect(page.locator('.woocommerce-orders-table')).toHaveCou…"), async () => { await expect(page.locator('.woocommerce-orders-table')).toHaveCount(0); }],
    ],
  });
});

test('ACC-TC032 Reset mật khẩu để trống username/email', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: submitReset(page, '')", async () => { await submitReset(page, ''); }],
    ],
    er: [
      [tcER(1, 1, "expect(errorBox(page)).toContainText(/enter a username or e…"), async () => { await expect(errorBox(page)).toContainText(/enter a username or email address/i); }],
    ],
  });
});

for (const u of UNKNOWN_RESET) {
  test(`ACC-TC033 Reset mật khẩu với ${u.label} chưa đăng ký`, async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Thực hiện: submitReset(page, u.value)", async () => { await submitReset(page, u.value); }],
    ],
    er: [
      [tcER(1, 1, "expect(errorBox(page)).toContainText(/invalid username or e…"), async () => { await expect(errorBox(page)).toContainText(/invalid username or email|no user|not found|not registered/i); }],
    ],
  });
});
}

// Bảo mật và accessibility (ACC-TC035…039)
test('ACC-TC035 /xmlrpc.php bị chặn khi truy cập công khai', async ({ request }) => {
  let r: any;
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ["Lấy dữ liệu \"r\": await request.get('/xmlrpc.php', noFollow)", async () => { r = await request.get('/xmlrpc.php', noFollow); }],
    ],
    er: [
      [tcER(1, 1, "expect([403, 404], `/xmlrpc.php trả HTTP ${r.status()}`).to…"), async () => { expect([403, 404], `/xmlrpc.php trả HTTP ${r.status()}`).toContain(r.status()); }],
    ],
  });
});

test('ACC-TC036 REST API /wp-json/wp/v2/users không trả danh sách người dùng', async ({ request }) => {
  let r: any;
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ["Lấy dữ liệu \"r\": await request.get('/wp-json/wp/v2/users', noFollo…", async () => { r = await request.get('/wp-json/wp/v2/users', noFollow); }],
    ],
    er: [
      [tcER(1, 1, "if (r.status() === 200) { const body = await r.json().catch…"), async () => { if (r.status() === 200) {
          const body = await r.json().catch(() => null);
          expect(Array.isArray(body) && body.length > 0, 'REST API đang trả danh sách user khi chưa đăng nhập').toBe(false);
        } else {
          expect([401, 403, 404], `REST /users trả HTTP ${r.status()}`).toContain(r.status());
        } }],
    ],
  });
});

test('ACC-TC037 /?author=1 không chuyển hướng sang /author/<username>/', async ({ request }) => {
  let loc = '';
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ["Gửi GET /?author=1 (không theo redirect)", async () => {
        const r = await request.get('/?author=1', noFollow);
        loc = r.headers()['location'] ?? '';
      }],
    ],
    er: [
      [tcER(1, 1, 'expect(loc).not.toMatch(/\\/author\\/[^/?#]+/)'), async () => { expect(loc, `Location = ${loc}`).not.toMatch(/\/author\/[^/?#]+/); }],
    ],
  });
});

test('ACC-TC038 Trang đăng nhập không redirect sang domain ngoài qua redirect_to', async ({ request }) => {
  let loc = '';
  await runFlow({
    pre: apiPre(request, '/'),
    main: [
      ["Gửi GET /my-account/?redirect_to=//evil.com (không theo redirect)", async () => {
        const r = await request.get('/my-account/?redirect_to=//evil.com', noFollow);
        loc = r.headers()['location'] ?? '';
      }],
    ],
    er: [
      [tcER(1, 1, "expect(loc).not.toContain('evil.com')"), async () => { expect(loc, `Location = ${loc}`).not.toContain('evil.com'); }],
    ],
  });
});

test('ACC-TC039 Các ô nhập ở trang My account đều có label hoặc aria-label', async ({ page }) => {
  let missing: any;
  await runFlow({
    pre: autoPre(page),
    main: [
      ["Mở https://actp1.csc.edu.vn/my-account/", async () => { await page.goto('/my-account/'); }],
      ["Kiểm tra từng ô nhập đang hiển thị", async () => { missing = await page.$$eval('input:not([type=hidden]):not([type=submit]):not([type=button])', (els) =>
          els
            .filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; })
            .filter((e) => { const el = e as HTMLInputElement; return !((el.labels && el.labels.length) || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title')); })
            .map((e) => `${e.tagName.toLowerCase()}#${e.id || e.getAttribute('name')}`)); }],
    ],
    er: [
      [tcER(1, 1, "expect(missing, `Ô nhập không có nhãn: ${missing.join(', ')…"), async () => { expect(missing, `Ô nhập không có nhãn: ${missing.join(', ')}`).toEqual([]); }],
    ],
  });
});

test('ACC-TC040 Đổi mật khẩu trùng mật khẩu hiện tại phải bị từ chối', async ({ page }) => {
  const email = uniqueEmail('tc040'), pwd = STRONG_PWD;
  await runFlow({
    pre: [
      ['Tạo tài khoản mới bằng API (POST /my-account/) – ' + email, () => apiRegister(page.request, email, pwd)],
      ['Xác nhận phiên đã đăng nhập (GET /my-account/ có link Log out)', async () => {
        const html = await (await page.request.get('/my-account/')).text();
        expect(html, 'Chưa đăng nhập sau khi đăng ký bằng API').toContain('customer-logout');
      }],
    ],
    main: [
      ['Mở trang Account details (/my-account/edit-account/)', async () => { await page.goto('/my-account/edit-account/'); }],
      ['Nhập First name / Last name bắt buộc', () => fillAccountNames(page)],
      ['Nhập mật khẩu hiện tại vào ô Current password', () => page.fill('#password_current', pwd)],
      ['Nhập đúng mật khẩu đó vào New password và Confirm new password', async () => { await page.fill('#password_1', pwd); await page.fill('#password_2', pwd); }],
      ['Click "Save changes"', () => page.click("button[name='save_account_details']")],
    ],
    er: [
      ['Hệ thống hiển thị thông báo lỗi (khung .woocommerce-error)', () => expect(errorBox(page)).toBeVisible()],
      ['Không hiển thị thông báo "Account details changed successfully"', () => expect(page.locator('.woocommerce-message')).toHaveCount(0)],
    ],
    post: [
      ['Đăng xuất bằng API (customer-logout)', async () => { expect(await apiLogout(page.request), 'Không tìm thấy link Log out').toBe(true); }],
      ['Xóa cookie phiên của tài khoản test', async () => { await page.context().clearCookies(); }],
    ],
  });
});

// ---------------------------------------------------------------- Chuyển từ Manual sang Automated
test('ACC-TC003 Nhãn nút đăng nhập là "Log in" (không sai chính tả)', async ({ page }) => {
  let label = '';
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở /my-account/ và đọc nhãn nút đăng nhập', async () => {
        await page.goto('/my-account/');
        const btn = page.locator('form.woocommerce-form-login').getByRole('button').first();
        await expect(btn).toBeVisible();
        label = ((await btn.textContent()) ?? '').trim();      // textContent để không bị CSS text-transform làm đổi chữ hoa
      }],
    ],
    er: [
      [tcER(1, 1, "expect(label).toBe('Log in')"), async () => { expect(label, `Nhãn nút đăng nhập đang là "${label}"`).toBe('Log in'); }],
    ],
  });
});

test('ACC-TC041 Thông báo lưu Account details không lẫn mã HTML', async ({ page }) => {
  const msg = page.locator('.woocommerce-message').first();
  let text = '';
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở trang Account details (/my-account/edit-account/)', async () => { await page.goto('/my-account/edit-account/'); }],
      ['Điền tên hợp lệ và bấm Save changes', async () => {
        await fillAccountNames(page);
        await page.fill('#account_display_name', 'QA Tester');
        await page.click("button[name='save_account_details']");
        await expect(msg).toContainText('Account details changed successfully');
        text = (await msg.innerText()).trim();
      }],
    ],
    er: [
      [tcER(1, 1, 'Thông báo không chứa thẻ HTML (<>)'), async () => { expect(text, `Thông báo đang là: ${text}`).not.toMatch(/[<>]/); }],
    ],
  });
});

test('ACC-TC042 Thông báo gửi yêu cầu Lost password không lẫn mã HTML', async ({ page }) => {
  const msg = page.locator('.woocommerce-message').first();
  let text = '';
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Tạo tài khoản mới, đăng xuất rồi gửi yêu cầu Lost password', async () => {
        const { email } = await register(page);
        await logout(page);
        await submitReset(page, email);
        await expect(msg).toContainText(/Password reset email has been sent/i);
        text = (await msg.innerText()).trim();
      }],
    ],
    er: [
      [tcER(1, 1, 'Thông báo không chứa thẻ HTML (<>)'), async () => { expect(text, `Thông báo đang là: ${text}`).not.toMatch(/[<>]/); }],
    ],
  });
});

test('ACC-TC043 Lưu được tên và thông tin khác mà không cần đổi mật khẩu', async ({ page }) => {
  await runFlow({
    pre: autoPre(page),
    main: [
      ['Mở trang Account details (/my-account/edit-account/)', async () => { await page.goto('/my-account/edit-account/'); }],
      ['Điền tên/Display name, để trống 3 ô mật khẩu và bấm Save changes', async () => {
        await fillAccountNames(page);
        await page.fill('#account_display_name', 'QA Renamed');
        await page.click("button[name='save_account_details']");
      }],
    ],
    er: [
      [tcER(1, 2, 'expect(errorBox(page)).toHaveCount(0)'), async () => { await expect(errorBox(page), 'Hệ thống bắt buộc phải đổi mật khẩu').toHaveCount(0); }],
      [tcER(2, 2, "expect(page.locator('.woocommerce-message').first()).toContainText('Account details changed successfully')"), async () => { await expect(page.locator('.woocommerce-message').first()).toContainText('Account details changed successfully'); }],
    ],
  });
});
