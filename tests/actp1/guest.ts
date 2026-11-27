/**
 * TC phải chạy khi CHƯA đăng nhập (đăng ký / đăng nhập / quên mật khẩu / form khách ở blog, checkout...).
 * Các TC còn lại dùng lại phiên đăng nhập từ .auth/user.json (storageState).
 * Muốn đổi 1 TC sang guest hoặc ngược lại: thêm / xóa ID trong danh sách này.
 */
export const GUEST_TCS = new Set<string>([
  "ACC-TC003","ACC-TC006","ACC-TC007","ACC-TC008","ACC-TC009","ACC-TC010","ACC-TC011","ACC-TC012","ACC-TC013","ACC-TC014",
  "ACC-TC015","ACC-TC016","ACC-TC017","ACC-TC018","ACC-TC019","ACC-TC020","ACC-TC021","ACC-TC029","ACC-TC030","ACC-TC032",
  "ACC-TC033","ACC-TC035","ACC-TC036","ACC-TC037","ACC-TC038","ACC-TC039","ACC-TC040","ACC-TC042",
  "BLOG-TC012","CART-TC011","CHK-TC004","CHK-TC008","CHK-TC015","CHK-TC016","CHK-TC017",
  "NAV-TC014","NAV-TC022","PDP-TC019","PDP-TC020","PDP-TC021","PDP-TC022","PDP-TC023","PDP-TC024","PDP-TC029",
]);

export const isGuest = (title: string) => {
  const id = title.match(/^[A-Z]+-TC\d{3}/)?.[0];
  return !!id && GUEST_TCS.has(id);
};
