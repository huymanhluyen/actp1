/**
 * Tài khoản dùng chung cho TẤT CẢ các phiên test (đăng ký sẵn 1 lần trên web).
 * Điền vào đây, hoặc đặt biến môi trường ACTP_USER / ACTP_PASS (biến môi trường được ưu tiên).
 */
export const ACCOUNT = {
  user: process.env.ACTP_USER ?? 'nguyenvantest@gmail.com',
  pass: process.env.ACTP_PASS ?? 'HuyManh@123',
};
