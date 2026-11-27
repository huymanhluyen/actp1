# Playwright (Node/TypeScript) – ACTP Clothes Shop

Website: https://actp1.csc.edu.vn 

## Cài đặt (Node 18+)
    npm install
    npx playwright install chromium

## Chạy
    npx playwright test                              # toàn bộ
    npx playwright test tests/account.spec.ts        # đăng ký/đăng nhập trước
    npx playwright test -g "ACC-TC006"               # 1 TC
    npx playwright test --headed                     # xem trình duyệt chạy
    npx playwright show-report                       # xem báo cáo HTML (screenshot/trace khi fail)

## Cấu trúc test (theo module)
| File | Module | 
|---|---|
| `tests/actp1/acc.spec.ts` | ACC | 
| `tests/actp1/blog.spec.ts` | BLOG |
| `tests/actp1/cart.spec.ts` | CART |
| `tests/actp1/chk.spec.ts` | CHK |
| `tests/actp1/home.spec.ts` | HOME |
| `tests/actp1/nav.spec.ts` |NAV |
| `tests/actp1/pdp.spec.ts` | PDP (review) | 
| `tests/actp1/search.spec.ts` | SRCH | 
| `tests/actp1/shop.spec.ts` |SHOP |
| `tests/actp1/helpers.ts` | dùng chung | 

- Test theo bảng dữ liệu: mỗi dòng dữ liệu là 1 test, tiêu đề bắt đầu bằng TC ID. Đổi dữ liệu chuẩn (tên, giá, số lượng danh mục) ở `helpers.ts` là mọi test cùng đổi.
- Tên test không được chứa ký tự `@` vì Playwright coi là tag.
- Test tên `SHOP-EXTRA…` và `BLOG-EXTRA…` chưa có TC trong sheet, không ghi vào report; nếu fail thì xem xét bổ sung TC và bug.
- Nhiều test được viết để **fail khi còn bug**, fail là đúng.
- Các TC đơn giản/ít dữ liệu vẫn để **manual**.

## Lưu ý
- Build 1.0 chỉ test trên laptop (viewport 1366x768), không mobile, không SQL injection.
- Test tạo dữ liệu thật trên site demo (tài khoản, review, đơn hàng); site reset mỗi thứ 7 01:00.
- Test fail chưa chắc là bug: xem screenshot/trace trong `test-results/` hoặc `npx playwright show-report` rồi mới ghi vào Bug List.

## Chuẩn hóa đầu ra Terminal (PRE / MAIN / ER / POST)
Reporter `reporters/terminal-reporter.ts` (đã khai báo trong `playwright.config.ts`) in mỗi test case theo mẫu:
thông tin TC (trạng thái, thời gian, file:dòng) → **PRE_CONDITION (API)** → **MAIN TEST (E2E Playwright)** →
**EXPECTED RESULT (ER-1, ER-2…)** → **POST_CONDITION (API)** → tổng bước thành công / thời gian; lỗi hiện rõ bước thất bại.
Tắt màu: `NO_COLOR=1 npx playwright test`.

Viết test theo khung (`tests/actp1/flow.ts`):

```ts
test('XXX-TC001 Tên test', async ({ page }) => {
  await runFlow({
    pre:  [['Tạo tài khoản bằng API', () => apiRegister(page.request, email, pwd)]],
    main: [['Mở trang ...', async () => { await page.goto('/...'); }], ['Click ...', () => page.click('...')]],
    er:   [['ER-1 nội dung mong đợi', () => expect(page.locator('...')).toBeVisible()]],   // mỗi ER độc lập
    post: [['Đăng xuất bằng API', async () => { await apiLogout(page.request); }]],         // luôn chạy dù test fail
  });
});
```
Đã chuyển sang khung này: `ACC-TC040`, `CART-TC025`, `SRCH-TC014` (làm mẫu). Các test còn lại vẫn chạy bình thường,
reporter chỉ in dòng tóm tắt cho tới khi được chuyển sang `runFlow`.

## Đăng nhập một lần + refresh trước mỗi test
- `account.ts`: điền 1 tài khoản có sẵn (hoặc đặt ACTP_USER / ACTP_PASS). `global-setup.ts` đăng nhập 1 lần với tài khoản này, lưu cookie vào `.auth/user.json`; mọi lần chạy sau đều dùng đúng tài khoản đó, không tạo mới. Config để `workers: 1`.
- `tests/actp1/fixtures.ts`: mọi spec import `test, expect` từ đây. Mỗi test: dùng lại cookie đăng nhập, dọn giỏ hàng (API), mở `/` rồi `reload()` (F5) rồi mới chạy.
- TC phải chạy khi chưa đăng nhập (đăng ký/đăng nhập/quên mật khẩu/form khách...) nằm trong `GUEST_TCS` ở fixtures.ts — thêm/xóa ID tại đó để đổi.

## Nhãn PRE / MAIN / ER lấy từ Project Report
- `tests/actp1/tc-data.ts` (tự sinh từ sheet *Test Case List*: Pre-Condition / Steps / Expected Result). Reporter lấy ER-n và điều kiện tiên quyết từ đây.
- `autoPre(page)`: PRE kiểm tra đúng trạng thái đăng nhập (khách / tài khoản dùng chung). `cartPost(page)`: POST dọn giỏ hàng bằng API.
- `tests/actp1/guest.ts`: danh sách TC chạy ở trạng thái khách (`GUEST_TCS`).
