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
