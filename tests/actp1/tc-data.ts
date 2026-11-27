/** TỰ SINH từ sheet 'Test Case List' của Project Report (Pre-Condition / Steps / Expected Result). Dùng để hiển thị trên Terminal. */
export interface TcData { summary: string; pre: string; steps: string[]; er: string[] }
export const TC_DATA: Record<string, TcData> = {
"ACC-TC001": {
"summary": "Kiểm tra hiển thị form Login và Register khi truy cập trang My account trong trạng thái chưa đăng nhập.",
"pre": "Chưa đăng nhập",
"steps": [
"Đảm bảo trình duyệt chưa đăng nhập",
"Truy cập https://actp1.csc.edu.vn/my-account/ và chờ trang tải xong",
"Kiểm tra khối Login: có ô 'Username or email address', ô 'Password', checkbox 'Remember me', nút 'Log in'",
"Kiểm tra khối Register: có ô 'Email address', ô 'Password', nút 'Register'"
],
"er": [
"Có form Login (username/email, password, Remember me) và form Register (email, password)"
]
},
"ACC-TC002": {
"summary": "Kiểm tra link 'Lost your password?' trỏ tới /my-account/lost-password/ khi xem form Login ở trạng thái chưa đăng nhập.",
"pre": "Chưa đăng nhập",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Tại khối Login, tìm link 'Lost your password?' bên dưới nút 'Log in'",
"Di chuột vào link và xem URL đích ở thanh trạng thái của trình duyệt",
"Click vào link, kiểm tra URL chuyển tới /my-account/lost-password/"
],
"er": [
"Có link tới /my-account/lost-password/"
]
},
"ACC-TC003": {
"summary": "Kiểm tra nhãn nút đăng nhập hiển thị đúng là 'Log in' và không sai chính tả khi truy cập trang My account.",
"pre": "Chưa đăng nhập",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Xác định nút submit của khối Login",
"Đọc kỹ từng ký tự trên nhãn của nút",
"Đối chiếu với nhãn chuẩn 'Log in' (không phải 'Login', 'Log-in' hay sai chính tả khác)"
],
"er": [
"Nhãn là 'Log in' (không có lỗi chính tả)"
]
},
"ACC-TC004": {
"summary": "Kiểm tra ký tự mật khẩu được che (type=password) khi nhập vào ô Password của form Login và Register.",
"pre": "Chưa đăng nhập",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Click vào ô 'Password' của khối Login, nhập 'Abc@12345'",
"Quan sát ký tự hiển thị trong ô",
"Click vào ô 'Password' của khối Register, nhập 'Abc@12345'",
"Quan sát ký tự hiển thị trong ô",
"Nhấn F12, Inspect ô Password của cả hai form, kiểm tra thuộc tính type=\"password\""
],
"er": [
"Ký tự hiển thị dạng ẩn (type=password)"
]
},
"ACC-TC005": {
"summary": "Kiểm tra checkbox 'Remember me' mặc định ở trạng thái chưa chọn khi mở form Login lần đầu.",
"pre": "Chưa đăng nhập",
"steps": [
"Xóa cookie hoặc mở cửa sổ ẩn danh để đảm bảo chưa đăng nhập",
"Truy cập https://actp1.csc.edu.vn/my-account/",
"Xác định checkbox 'Remember me' trong khối Login",
"Kiểm tra checkbox ở trạng thái chưa được tick"
],
"er": [
"Checkbox 'Remember me' ở trạng thái chưa chọn"
]
},
"ACC-TC006": {
"summary": "Kiểm tra đăng ký thành công, tự đăng nhập và hiển thị dashboard khi nhập email chưa tồn tại và mật khẩu mạnh.",
"pre": "Email chưa tồn tại",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Tại khối Register, nhập 'Email address' chưa từng đăng ký",
"Nhập 'Password' mạnh (ví dụ: Tc@Strong#2026)",
"Click nút 'Register'",
"Chờ trang tải lại, quan sát thông báo và màn hình hiển thị",
"Kiểm tra đã ở trạng thái đăng nhập với dashboard và menu tài khoản của My account"
],
"er": [
"Đăng ký thành công, tự đăng nhập, hiển thị dashboard My account"
]
},
"ACC-TC007": {
"summary": "Kiểm tra báo lỗi 'Please provide a valid email address.' khi đăng ký và bỏ trống email.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Tại khối Register, để trống ô 'Email address'",
"Nhập 'Password' hợp lệ (ví dụ: Tc@Strong#2026)",
"Click nút 'Register'",
"Quan sát thông báo lỗi hiển thị phía trên form",
"Kiểm tra không có tài khoản nào được tạo"
],
"er": [
"Báo lỗi 'Please provide a valid email address.'"
]
},
"ACC-TC008": {
"summary": "Kiểm tra báo lỗi 'Please enter an account password.' khi đăng ký với email hợp lệ nhưng bỏ trống password.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Tại khối Register, nhập 'Email address' hợp lệ chưa đăng ký (ví dụ: newuser_002@test.com)",
"Để trống ô 'Password'",
"Click nút 'Register'",
"Quan sát thông báo lỗi hiển thị phía trên form",
"Kiểm tra không có tài khoản nào được tạo"
],
"er": [
"Báo lỗi 'Please enter an account password.'"
]
},
"ACC-TC009": {
"summary": "Kiểm tra báo lỗi email không hợp lệ khi đăng ký với email sai định dạng 'abc@'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Tại khối Register, nhập 'Email address' = 'abc@'",
"Nhập 'Password' hợp lệ (ví dụ: Tc@Strong#2026)",
"Click nút 'Register'",
"Quan sát thông báo lỗi (của trình duyệt hoặc của hệ thống)",
"Kiểm tra không có tài khoản nào được tạo"
],
"er": [
"Báo lỗi email không hợp lệ"
]
},
"ACC-TC010": {
"summary": "Kiểm tra báo lỗi 'An account is already registered with your email address.' khi đăng ký bằng email đã tồn tại.",
"pre": "Email đã đăng ký",
"steps": [
"Chuẩn bị 1 email đã đăng ký tài khoản trên hệ thống",
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Tại khối Register, nhập email đã đăng ký ở bước 1",
"Nhập 'Password' hợp lệ (ví dụ: Tc@Strong#2026)",
"Click nút 'Register'",
"Quan sát thông báo lỗi và kiểm tra không tạo thêm tài khoản trùng"
],
"er": [
"Báo lỗi 'An account is already registered with your email address.'"
]
},
"ACC-TC011": {
"summary": "Kiểm tra hệ thống cảnh báo hoặc từ chối khi đăng ký với mật khẩu yếu '123'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Tại khối Register, nhập 'Email address' chưa đăng ký (ví dụ: newuser_003@test.com)",
"Nhập 'Password' = '123'",
"Quan sát chỉ báo độ mạnh mật khẩu (nếu có) dưới ô Password",
"Click nút 'Register'",
"Kiểm tra hệ thống cảnh báo hoặc từ chối, không tạo tài khoản với mật khẩu yếu"
],
"er": [
"Hệ thống cảnh báo/từ chối mật khẩu yếu"
]
},
"ACC-TC012": {
"summary": "Kiểm tra hệ thống tự trim khoảng trắng hoặc báo lỗi hợp lệ khi đăng ký với email có khoảng trắng ở đầu/cuối.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Tại khối Register, nhập 'Email address' = ' new@test.com ' (có 1 khoảng trắng ở đầu và cuối)",
"Nhập 'Password' hợp lệ (ví dụ: Tc@Strong#2026)",
"Click nút 'Register'",
"Quan sát kết quả: đăng ký thành công với email đã được trim hoặc báo lỗi hợp lệ",
"Nếu đăng ký thành công, vào Account details kiểm tra email lưu không còn khoảng trắng"
],
"er": [
"Hệ thống trim khoảng trắng hoặc báo lỗi hợp lệ"
]
},
"ACC-TC013": {
"summary": "Kiểm tra báo lỗi email không hợp lệ và script không được thực thi khi đăng ký với email chứa mã XSS.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Tại khối Register, nhập 'Email address' = '\"><script>alert(1)</script>'",
"Nhập 'Password' hợp lệ (ví dụ: Tc@Strong#2026)",
"Click nút 'Register'",
"Quan sát: không xuất hiện hộp thoại alert",
"Kiểm tra hệ thống báo lỗi email không hợp lệ và nội dung nhập được escape khi hiển thị lại"
],
"er": [
"Báo lỗi email không hợp lệ, script không chạy"
]
},
"ACC-TC014": {
"summary": "Kiểm tra báo lỗi hợp lệ và không phát sinh lỗi 500 khi đăng ký với email dài 300 ký tự.",
"pre": "",
"steps": [
"Chuẩn bị chuỗi email 300 ký tự",
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Tại khối Register, dán chuỗi email vừa chuẩn bị vào ô 'Email address'",
"Nhập 'Password' hợp lệ",
"Click nút 'Register'",
"Quan sát: hiển thị lỗi hợp lệ, trang không trả lỗi 500 hoặc trắng trang"
],
"er": [
"Báo lỗi hợp lệ, không lỗi 500"
]
},
"ACC-TC015": {
"summary": "Kiểm tra đăng nhập thành công và hiển thị dashboard khi dùng email và mật khẩu đúng của tài khoản đã có.",
"pre": "Có tài khoản",
"steps": [
"Chuẩn bị tài khoản đã đăng ký và đang ở trạng thái chưa đăng nhập",
"Truy cập https://actp1.csc.edu.vn/my-account/",
"Tại khối Login, nhập email của tài khoản vào ô 'Username or email address'",
"Nhập đúng mật khẩu vào ô 'Password'",
"Click nút 'Log in'",
"Kiểm tra đăng nhập thành công và hiển thị dashboard My account"
],
"er": [
"Đăng nhập thành công, hiển thị dashboard"
]
},
"ACC-TC016": {
"summary": "Kiểm tra đăng nhập thành công khi dùng username và mật khẩu đúng của tài khoản đã có.",
"pre": "Có tài khoản",
"steps": [
"Chuẩn bị tài khoản đã đăng ký và biết username, đang ở trạng thái chưa đăng nhập",
"Truy cập https://actp1.csc.edu.vn/my-account/",
"Tại khối Login, nhập username vào ô 'Username or email address'",
"Nhập đúng mật khẩu vào ô 'Password'",
"Click nút 'Log in'",
"Kiểm tra đăng nhập thành công và hiển thị dashboard My account"
],
"er": [
"Đăng nhập thành công"
]
},
"ACC-TC017": {
"summary": "Kiểm tra báo lỗi mật khẩu không đúng và không đăng nhập khi nhập email đúng nhưng mật khẩu sai.",
"pre": "Có tài khoản",
"steps": [
"Chuẩn bị tài khoản đã đăng ký, đang ở trạng thái chưa đăng nhập",
"Truy cập https://actp1.csc.edu.vn/my-account/",
"Nhập email đúng vào ô 'Username or email address'",
"Nhập mật khẩu sai (ví dụ: Wrong@12345) vào ô 'Password'",
"Click nút 'Log in'",
"Quan sát thông báo lỗi và kiểm tra vẫn ở form Login, chưa đăng nhập"
],
"er": [
"Báo lỗi mật khẩu không đúng, không đăng nhập"
]
},
"ACC-TC018": {
"summary": "Kiểm tra báo lỗi tài khoản không tồn tại khi đăng nhập bằng email chưa đăng ký.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Nhập email chưa từng đăng ký (ví dụ: notexist_999@test.com) vào ô 'Username or email address'",
"Nhập 'Password' bất kỳ (ví dụ: Abc@12345)",
"Click nút 'Log in'",
"Quan sát thông báo lỗi và kiểm tra vẫn ở form Login, chưa đăng nhập"
],
"er": [
"Báo lỗi tài khoản không tồn tại"
]
},
"ACC-TC019": {
"summary": "Kiểm tra báo lỗi 'Username is required.' khi đăng nhập và bỏ trống username.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Để trống ô 'Username or email address'",
"Nhập 'Password' bất kỳ (ví dụ: Abc@12345)",
"Click nút 'Log in'",
"Quan sát thông báo lỗi hiển thị phía trên form",
"Kiểm tra vẫn ở form Login, chưa đăng nhập"
],
"er": [
"Báo lỗi 'Username is required.'"
]
},
"ACC-TC020": {
"summary": "Kiểm tra báo lỗi 'The password field is empty.' khi đăng nhập với username hợp lệ nhưng bỏ trống password.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Nhập username hoặc email hợp lệ vào ô 'Username or email address'",
"Để trống ô 'Password'",
"Click nút 'Log in'",
"Quan sát thông báo lỗi hiển thị phía trên form",
"Kiểm tra vẫn ở form Login, chưa đăng nhập"
],
"er": [
"Báo lỗi 'The password field is empty.'"
]
},
"ACC-TC021": {
"summary": "Kiểm tra hệ thống không lộ thông tin tài khoản và có cơ chế hạn chế brute-force (nếu có) khi đăng nhập sai mật khẩu liên tiếp 10 lần.",
"pre": "Có tài khoản",
"steps": [
"Chuẩn bị tài khoản đã đăng ký, đang ở trạng thái chưa đăng nhập",
"Truy cập https://actp1.csc.edu.vn/my-account/",
"Nhập email đúng và mật khẩu sai (ví dụ: Wrong@12345), click 'Log in'",
"Lặp lại bước 3 đủ 10 lần liên tiếp, ghi lại thông báo hiển thị sau mỗi lần",
"Kiểm tra thông báo lỗi không tiết lộ thông tin nhạy cảm của tài khoản (mật khẩu, trạng thái tài khoản...)",
"Kiểm tra hệ thống có khóa tạm hoặc giới hạn số lần thử hay không (nếu có cơ chế này)"
],
"er": [
"Hệ thống không lộ thông tin tài khoản; có cơ chế hạn chế brute-force (nếu có)"
]
},
"ACC-TC022": {
"summary": "Kiểm tra menu tài khoản hiển thị đủ Dashboard, Orders, Downloads, Addresses, Account details, Log out khi đã đăng nhập.",
"pre": "Đã đăng nhập",
"steps": [
"Đăng nhập bằng tài khoản hợp lệ",
"Truy cập https://actp1.csc.edu.vn/my-account/",
"Quan sát menu điều hướng của trang tài khoản",
"Kiểm tra có đủ 6 mục: Dashboard, Orders, Downloads, Addresses, Account details, Log out"
],
"er": [
"Có Dashboard, Orders, Downloads, Addresses, Account details, Log out"
]
},
"ACC-TC023": {
"summary": "Kiểm tra hiển thị thông báo chưa có đơn hàng khi vào mục Orders bằng tài khoản mới chưa đặt hàng.",
"pre": "Tài khoản mới, chưa có đơn",
"steps": [
"Đăng nhập bằng tài khoản mới chưa từng đặt hàng",
"Truy cập https://actp1.csc.edu.vn/my-account/ và click mục 'Orders'",
"Chờ trang tải xong",
"Kiểm tra hiển thị thông báo chưa có đơn hàng và không có bảng danh sách đơn"
],
"er": [
"Hiển thị thông báo chưa có đơn hàng"
]
},
"ACC-TC024": {
"summary": "Kiểm tra hiển thị 'Address changed successfully.' khi cập nhật địa chỉ billing với thông tin hợp lệ.",
"pre": "Đã đăng nhập",
"steps": [
"Đăng nhập bằng tài khoản hợp lệ",
"Truy cập https://actp1.csc.edu.vn/my-account/ và click mục 'Addresses'",
"Click 'Edit' ở khối 'Billing address'",
"Nhập đầy đủ thông tin hợp lệ: First name, Last name, Country, Street address, Town/City, Postcode, Phone",
"Click nút 'Save address'",
"Kiểm tra hiển thị 'Address changed successfully.' và địa chỉ billing hiển thị đúng dữ liệu vừa nhập"
],
"er": [
"Hiển thị 'Address changed successfully.'"
]
},
"ACC-TC025": {
"summary": "Kiểm tra hiển thị 'Account details changed successfully.' khi cập nhật First name, Last name, Display name hợp lệ.",
"pre": "Đã đăng nhập",
"steps": [
"Đăng nhập bằng tài khoản hợp lệ",
"Truy cập https://actp1.csc.edu.vn/my-account/ và click mục 'Account details'",
"Nhập 'First name' = 'Test', 'Last name' = 'User', 'Display name' = 'Test User'",
"Để trống phần đổi mật khẩu, click nút 'Save changes'",
"Kiểm tra hiển thị 'Account details changed successfully.'",
"Reload trang, kiểm tra các giá trị vừa nhập vẫn được lưu"
],
"er": [
"Hiển thị 'Account details changed successfully.'"
]
},
"ACC-TC026": {
"summary": "Kiểm tra báo lỗi mật khẩu không khớp khi đổi mật khẩu với mật khẩu mới và mật khẩu xác nhận khác nhau.",
"pre": "Đã đăng nhập",
"steps": [
"Đăng nhập bằng tài khoản hợp lệ",
"Truy cập https://actp1.csc.edu.vn/my-account/ và click mục 'Account details'",
"Nhập đúng mật khẩu hiện tại vào 'Current password'",
"Nhập 'New password' = 'Tc@Strong#2026', 'Confirm new password' = 'Tc@Different#2026'",
"Click nút 'Save changes'",
"Kiểm tra hiển thị lỗi mật khẩu không khớp và mật khẩu không bị đổi"
],
"er": [
"Báo lỗi mật khẩu không khớp"
]
},
"ACC-TC027": {
"summary": "Kiểm tra báo lỗi mật khẩu hiện tại không đúng khi đổi mật khẩu với Current password sai.",
"pre": "Đã đăng nhập",
"steps": [
"Đăng nhập bằng tài khoản hợp lệ",
"Truy cập https://actp1.csc.edu.vn/my-account/ và click mục 'Account details'",
"Nhập mật khẩu sai (ví dụ: Wrong@12345) vào 'Current password'",
"Nhập 'New password' và 'Confirm new password' giống nhau và hợp lệ (ví dụ: Tc@Strong#2026)",
"Click nút 'Save changes'",
"Kiểm tra hiển thị lỗi mật khẩu hiện tại không đúng và mật khẩu không bị đổi"
],
"er": [
"Báo lỗi mật khẩu hiện tại không đúng"
]
},
"ACC-TC028": {
"summary": "Kiểm tra phiên đăng nhập kết thúc và hiển thị form Login khi click Log out.",
"pre": "Đã đăng nhập",
"steps": [
"Đăng nhập bằng tài khoản hợp lệ",
"Truy cập https://actp1.csc.edu.vn/my-account/",
"Click mục 'Log out' trong menu tài khoản",
"Chờ trang tải lại",
"Kiểm tra hiển thị form Login/Register và menu tài khoản không còn hiển thị"
],
"er": [
"Phiên kết thúc, hiển thị form Login"
]
},
"ACC-TC029": {
"summary": "Kiểm tra không hiển thị dữ liệu tài khoản và yêu cầu đăng nhập lại khi click nút Back của trình duyệt sau khi logout.",
"pre": "Vừa logout",
"steps": [
"Đăng nhập bằng tài khoản hợp lệ và mở trang https://actp1.csc.edu.vn/my-account/",
"Click 'Log out' để đăng xuất",
"Click nút Back của trình duyệt",
"Reload trang (F5)",
"Kiểm tra không hiển thị dữ liệu tài khoản, hệ thống yêu cầu đăng nhập lại"
],
"er": [
"Không hiển thị dữ liệu tài khoản, yêu cầu đăng nhập lại"
]
},
"ACC-TC030": {
"summary": "Kiểm tra hiển thị form đăng nhập và không lộ dữ liệu đơn hàng khi truy cập trực tiếp /my-account/orders/ lúc chưa đăng nhập.",
"pre": "Chưa đăng nhập",
"steps": [
"Đảm bảo trình duyệt chưa đăng nhập (cửa sổ ẩn danh hoặc xóa cookie)",
"Truy cập trực tiếp https://actp1.csc.edu.vn/my-account/orders/",
"Chờ trang tải xong",
"Kiểm tra hiển thị form đăng nhập và không có dữ liệu đơn hàng nào được hiển thị"
],
"er": [
"Hiển thị form đăng nhập, không lộ dữ liệu đơn hàng"
]
},
"ACC-TC031": {
"summary": "Kiểm tra hiển thị form nhập username/email và nút Reset password khi click link 'Lost your password?'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/ khi chưa đăng nhập",
"Click link 'Lost your password?' ở khối Login",
"Chờ trang tải xong",
"Kiểm tra URL là /my-account/lost-password/",
"Kiểm tra có ô nhập 'Username or email' và nút 'Reset password'"
],
"er": [
"Hiển thị form nhập username/email và nút Reset password"
]
},
"ACC-TC032": {
"summary": "Kiểm tra báo lỗi 'Enter a username or email address.' khi reset mật khẩu và để trống ô username/email.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/lost-password/",
"Để trống ô 'Username or email'",
"Click nút 'Reset password'",
"Quan sát thông báo lỗi hiển thị trên form"
],
"er": [
"Báo lỗi 'Enter a username or email address.'"
]
},
"ACC-TC033": {
"summary": "Kiểm tra báo lỗi không tìm thấy tài khoản khi reset mật khẩu bằng email chưa đăng ký.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/lost-password/",
"Nhập email chưa đăng ký (ví dụ: notexist_999@test.com) vào ô 'Username or email'",
"Click nút 'Reset password'",
"Quan sát thông báo lỗi và kiểm tra không có email nào được gửi"
],
"er": [
"Báo lỗi không tìm thấy tài khoản"
]
},
"ACC-TC034": {
"summary": "Kiểm tra hiển thị thông báo đã gửi email và link trong email hoạt động khi reset mật khẩu bằng email đã đăng ký.",
"pre": "Có tài khoản, mail server hoạt động",
"steps": [
"Chuẩn bị tài khoản đã đăng ký với email truy cập được hộp thư",
"Truy cập https://actp1.csc.edu.vn/my-account/lost-password/",
"Nhập email đã đăng ký vào ô 'Username or email'",
"Click nút 'Reset password'",
"Kiểm tra hiển thị thông báo đã gửi email đặt lại mật khẩu",
"Mở hộp thư, kiểm tra đã nhận email đặt lại mật khẩu",
"Click link trong email và kiểm tra mở được trang đặt mật khẩu mới"
],
"er": [
"Hiển thị thông báo đã gửi email đặt lại mật khẩu; email nhận được có link reset hoạt động"
]
},
"ACC-TC035": {
"summary": "Kiểm tra /xmlrpc.php bị chặn khi truy cập công khai",
"pre": "Chưa đăng nhập",
"steps": [
"Gửi GET tới https://actp1.csc.edu.vn/xmlrpc.php",
"Xem mã trạng thái"
],
"er": [
"HTTP 403/404 (bị chặn)"
]
},
"ACC-TC036": {
"summary": "Kiểm tra REST API /wp-json/wp/v2/users không trả danh sách người dùng khi chưa đăng nhập",
"pre": "Chưa đăng nhập",
"steps": [
"Gửi GET tới https://actp1.csc.edu.vn/wp-json/wp/v2/users",
"Xem nội dung phản hồi"
],
"er": [
"HTTP 401/403/404, không trả danh sách user"
]
},
"ACC-TC037": {
"summary": "Kiểm tra /?author=1 không chuyển hướng sang trang /author/<username>/",
"pre": "Chưa đăng nhập",
"steps": [
"Gửi GET tới https://actp1.csc.edu.vn/?author=1 (không theo redirect)",
"Xem header Location"
],
"er": [
"Không redirect tới /author/<username>/"
]
},
"ACC-TC038": {
"summary": "Kiểm tra trang đăng nhập không redirect sang domain ngoài qua tham số redirect_to",
"pre": "Chưa đăng nhập",
"steps": [
"Gửi GET tới https://actp1.csc.edu.vn/my-account/?redirect_to=//evil.com (không theo redirect)",
"Xem header Location"
],
"er": [
"Không redirect tới evil.com"
]
},
"ACC-TC039": {
"summary": "Kiểm tra các ô nhập ở trang My account đều có label hoặc aria-label",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/my-account/",
"Kiểm tra từng ô nhập đang hiển thị"
],
"er": [
"Mọi ô nhập đều có nhãn"
]
},
"ACC-TC040": {
"summary": "Kiểm tra hệ thống từ chối đổi mật khẩu khi mật khẩu mới trùng với mật khẩu hiện tại.",
"pre": "Có tài khoản",
"steps": [
"Đăng nhập bằng tài khoản hợp lệ",
"Truy cập https://actp1.csc.edu.vn/my-account/edit-account/",
"Nhập mật khẩu hiện tại vào ô 'Current password'",
"Nhập đúng mật khẩu đó vào ô 'New password' và 'Confirm new password'",
"Click nút 'Save changes'",
"Quan sát thông báo hiển thị"
],
"er": [
"Hệ thống báo lỗi và không cho đổi mật khẩu mới trùng với mật khẩu hiện tại"
]
},
"ACC-TC041": {
"summary": "Kiểm tra thông báo thành công sau khi lưu Account details hiển thị đúng, không lẫn mã HTML.",
"pre": "Có tài khoản hợp lệ",
"steps": [
"Đăng nhập tài khoản hợp lệ",
"Truy cập https://actp1.csc.edu.vn/my-account/edit-account/",
"Thay đổi Display name rồi bấm “Save changes”",
"Quan sát nội dung thông báo"
],
"er": [
"Thông báo chỉ hiển thị “Account details changed successfully.” không có thẻ HTML thừa"
]
},
"ACC-TC042": {
"summary": "Kiểm tra thông báo thành công sau khi gửi yêu cầu Lost password hiển thị đúng, không lẫn mã HTML.",
"pre": "Có tài khoản hợp lệ",
"steps": [
"Truy cập https://actp1.csc.edu.vn/my-account/lost-password/",
"Nhập username hoặc email của tài khoản hợp lệ",
"Bấm “Reset password”",
"Quan sát nội dung thông báo"
],
"er": [
"Thông báo chỉ hiển thị “Password reset email has been sent.” không có thẻ HTML thừa"
]
},
"ACC-TC043": {
"summary": "Kiểm tra lưu được thay đổi tên và thông tin khác ở Account details mà không cần đổi mật khẩu.",
"pre": "Có tài khoản hợp lệ",
"steps": [
"Đăng nhập tài khoản hợp lệ tại https://actp1.csc.edu.vn/my-account/",
"Truy cập https://actp1.csc.edu.vn/my-account/edit-account/",
"Đổi First name, Last name hoặc Display name, để trống các ô đổi mật khẩu (New/Confirm password)",
"Click nút \"Save changes\"",
"Quan sát thông báo và dữ liệu đã lưu"
],
"er": [
"Lưu thành công thông tin mới, mật khẩu giữ nguyên (các ô mật khẩu để trống là hợp lệ)"
]
},
"HOME-TC001": {
"summary": "Kiểm tra trang chủ tải thành công (HTTP 200), title 'ACTP Clothes Shop' và không lỗi hiển thị khi truy cập URL gốc.",
"pre": "",
"steps": [
"Mở trình duyệt, truy cập https://actp1.csc.edu.vn/",
"Chờ trang tải xong hoàn toàn",
"Kiểm tra mã phản hồi HTTP 200 (tab Network của DevTools)",
"Kiểm tra title của tab trình duyệt là 'ACTP Clothes Shop'",
"Quan sát trang, kiểm tra không có lỗi hiển thị hoặc lỗi trong tab Console"
],
"er": [
"HTTP 200, title 'ACTP Clothes Shop', không có lỗi hiển thị"
]
},
"HOME-TC002": {
"summary": "Kiểm tra hiển thị thông báo 'THIS IS A DEMO STORE...' và lịch reset dữ liệu thứ 7 lúc 01:00 AM khi truy cập trang chủ.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Quan sát phần đầu trang (trên header)",
"Kiểm tra hiển thị dòng 'THIS IS A DEMO STORE FOR TRAINING PURPOSES – NO ORDERS SHALL BE FULFILLED.'",
"Kiểm tra hiển thị thông báo dữ liệu được reset hàng tuần vào thứ 7 lúc 01:00 AM"
],
"er": [
"Hiển thị 'THIS IS A DEMO STORE FOR TRAINING PURPOSES – NO ORDERS SHALL BE FULFILLED.' và thông báo reset hàng tuần thứ 7 lúc 01:00 AM"
]
},
"HOME-TC003": {
"summary": "Kiểm tra header hiển thị logo/tên site, menu Home/Shop/Blog/My account, icon search và Cart 0 khi truy cập trang chủ.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Quan sát header ở đầu trang",
"Kiểm tra có logo hoặc tên site",
"Kiểm tra menu có đủ: Home, Shop, Blog, My account",
"Kiểm tra có icon tìm kiếm và icon giỏ hàng hiển thị 'Cart 0'"
],
"er": [
"Có logo/tên site, menu Home/Shop/Blog/My account, icon search và Cart 0"
]
},
"HOME-TC004": {
"summary": "Kiểm tra hero banner hiển thị tiêu đề 'HUGE SALE UP TO 80% OFF' và mô tả 'DIAL UP THE GLAMOUR IN AN ELEGANT COCKTAIL DRESS' khi truy cập trang chủ.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Quan sát hero banner ở đầu nội dung trang",
"Kiểm tra tiêu đề 'HUGE SALE UP TO 80% OFF'",
"Kiểm tra mô tả 'DIAL UP THE GLAMOUR IN AN ELEGANT COCKTAIL DRESS'"
],
"er": [
"Hiển thị tiêu đề 'HUGE SALE UP TO 80% OFF' và mô tả 'DIAL UP THE GLAMOUR IN AN ELEGANT COCKTAIL DRESS'"
]
},
"HOME-TC005": {
"summary": "Kiểm tra chuyển tới trang /shop/ khi click nút 'SEE ALL PRODUCTS' ở hero banner.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Tại hero banner, tìm nút 'SEE ALL PRODUCTS'",
"Click nút 'SEE ALL PRODUCTS'",
"Chờ trang tải xong và kiểm tra URL chuyển tới /shop/"
],
"er": [
"Chuyển tới /shop/"
]
},
"HOME-TC006": {
"summary": "Kiểm tra chuyển tới trang /shop/ khi click nút 'VIEW COLLECTIONS' ở hero banner.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Tại hero banner, tìm nút 'VIEW COLLECTIONS'",
"Click nút 'VIEW COLLECTIONS'",
"Chờ trang tải xong và kiểm tra URL chuyển tới /shop/"
],
"er": [
"Chuyển tới /shop/"
]
},
"HOME-TC007": {
"summary": "Kiểm tra mục LATEST PRODUCTS hiển thị 8 sản phẩm, mỗi sản phẩm có ảnh, tên và giá khi truy cập trang chủ.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Cuộn xuống mục 'LATEST PRODUCTS'",
"Đếm số sản phẩm hiển thị trong mục",
"Kiểm tra từng sản phẩm có ảnh, tên và giá"
],
"er": [
"Hiển thị 8 sản phẩm, mỗi sản phẩm có ảnh, tên, giá"
]
},
"HOME-TC008": {
"summary": "Kiểm tra sản phẩm 'Bold Statement Graphic Tee' hiển thị giá gốc $18.00 gạch ngang và giá sale $15.00 trong mục LATEST PRODUCTS.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Cuộn xuống mục 'LATEST PRODUCTS'",
"Tìm sản phẩm 'Bold Statement Graphic Tee'",
"Kiểm tra giá gốc $18.00 hiển thị dạng gạch ngang",
"Kiểm tra giá sale $15.00 hiển thị bên cạnh"
],
"er": [
"Giá gốc $18.00 gạch ngang, giá sale $15.00"
]
},
"HOME-TC009": {
"summary": "Kiểm tra mở đúng trang /shop/floral-elegance-sun-hat/ với tên và giá $45.00 khi click sản phẩm 'Floral Elegance Sun Hat' ở mục LATEST PRODUCTS.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Cuộn xuống mục 'LATEST PRODUCTS'",
"Click vào sản phẩm 'Floral Elegance Sun Hat'",
"Chờ trang tải xong, kiểm tra URL là /shop/floral-elegance-sun-hat/",
"Kiểm tra tên sản phẩm và giá $45.00 hiển thị đúng"
],
"er": [
"Mở /shop/floral-elegance-sun-hat/ đúng tên và giá $45.00"
]
},
"HOME-TC010": {
"summary": "Kiểm tra chuyển tới trang /shop khi click nút 'SEE ALL PRODUCTS' dưới mục LATEST PRODUCTS.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Cuộn xuống cuối mục 'LATEST PRODUCTS'",
"Click nút 'SEE ALL PRODUCTS'",
"Chờ trang tải xong và kiểm tra URL chuyển tới /shop"
],
"er": [
"Chuyển tới /shop"
]
},
"HOME-TC011": {
"summary": "Kiểm tra mục 'BE INSPIRED. GET AHEAD OF TRENDS.' hiển thị đúng 4 sản phẩm dresses khi truy cập trang chủ.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Cuộn xuống mục 'BE INSPIRED. GET AHEAD OF TRENDS.'",
"Đếm số sản phẩm hiển thị",
"Kiểm tra đủ 4 sản phẩm: Golden Glow Ribbed Knit Dress, Midnight Bloom Crochet Dress, Sophisticated Striped Midi Dress, Sunset Glow Utility Dress"
],
"er": [
"Hiển thị 4 sản phẩm: Golden Glow Ribbed Knit Dress, Midnight Bloom Crochet Dress, Sophisticated Striped Midi Dress, Sunset Glow Utility Dress"
]
},
"HOME-TC012": {
"summary": "Kiểm tra footer hiển thị 'About My Shop', Phone +1 234 567 89 10 và Email info@myshop.com khi truy cập trang chủ.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Cuộn xuống cuối trang tới footer",
"Kiểm tra có mục 'About My Shop'",
"Kiểm tra Phone là +1 234 567 89 10",
"Kiểm tra Email là info@myshop.com"
],
"er": [
"Hiển thị 'About My Shop', Phone +1 234 567 89 10, Email info@myshop.com"
]
},
"HOME-TC013": {
"summary": "Kiểm tra widget Product categories hiển thị đúng số lượng Blouse (1), Clothing (7), Dresses (4), Tshirt (3), Uncategorized (1) khi truy cập trang chủ.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Cuộn tới widget 'Product categories'",
"Đọc tên và số lượng của từng danh mục",
"Đối chiếu: Blouse (1), Clothing (7), Dresses (4), Tshirt (3), Uncategorized (1)"
],
"er": [
"Blouse (1), Clothing (7), Dresses (4), Tshirt (3), Uncategorized (1)"
]
},
"HOME-TC014": {
"summary": "Kiểm tra mở đúng trang chi tiết khi click từng sản phẩm trong widget Top rated products.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Cuộn tới widget 'Top rated products' và ghi lại danh sách sản phẩm",
"Click sản phẩm đầu tiên, kiểm tra mở đúng trang chi tiết (tên khớp với widget)",
"Quay lại trang chủ bằng nút Back",
"Lặp lại bước 3 và 4 cho từng sản phẩm còn lại trong widget"
],
"er": [
"Mở đúng trang chi tiết sản phẩm"
]
},
"HOME-TC015": {
"summary": "Kiểm tra tất cả ảnh load được và link nội bộ không trả 404/500 khi truy cập trang chủ.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Cuộn toàn bộ trang từ đầu đến cuối, quan sát các ảnh có hiển thị đầy đủ không",
"Mở DevTools, tab Network, lọc 'Img', kiểm tra không có ảnh trả lỗi 4xx/5xx",
"Click lần lượt các link nội bộ trên trang (menu, nút, sản phẩm, footer)",
"Kiểm tra không có link nào trả về 404 hoặc 500"
],
"er": [
"Tất cả ảnh load được, link nội bộ không trả 404/500"
]
},
"HOME-TC016": {
"summary": "Kiểm tra không vỡ layout, menu dạng hamburger và không có thanh cuộn ngang khi xem trang chủ ở viewport mobile 375x812.",
"pre": "",
"steps": [
"Mở DevTools (F12), bật chế độ Device Toolbar",
"Đặt kích thước viewport 375x812",
"Truy cập https://actp1.csc.edu.vn/",
"Cuộn toàn bộ trang, kiểm tra bố cục các khối không bị vỡ hoặc tràn",
"Kiểm tra menu chuyển thành icon hamburger",
"Kiểm tra không xuất hiện thanh cuộn ngang"
],
"er": [
"Không vỡ layout, menu chuyển thành dạng hamburger, không có thanh cuộn ngang"
]
},
"HOME-TC017": {
"summary": "Kiểm tra tên thương hiệu thống nhất giữa title, header, footer và blog khi truy cập trang chủ.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Ghi lại tên site ở title của tab trình duyệt và ở header",
"Cuộn xuống footer, ghi lại tên thương hiệu ở mục 'About ...' và đoạn giới thiệu",
"Truy cập https://actp1.csc.edu.vn/blog/ và ghi lại tên thương hiệu xuất hiện trong nội dung các bài viết",
"So sánh tên thương hiệu ở tất cả các vị trí trên"
],
"er": [
"Tên thương hiệu thống nhất ở title, header, footer và blog"
]
},
"HOME-TC018": {
"summary": "Kiểm tra truy cập bằng HTTP tự chuyển sang HTTPS",
"pre": "",
"steps": [
"Gửi GET tới http://actp1.csc.edu.vn/ (không theo redirect)",
"Xem mã trạng thái và header Location"
],
"er": [
"Redirect 301/302 sang https://"
]
},
"HOME-TC019": {
"summary": "Kiểm tra response trang chủ có header Strict-Transport-Security (HSTS)",
"pre": "",
"steps": [
"Gửi GET tới https://actp1.csc.edu.vn/",
"Xem response header"
],
"er": [
"Có header Strict-Transport-Security"
]
},
"HOME-TC020": {
"summary": "Kiểm tra response trang chủ có header X-Content-Type-Options",
"pre": "",
"steps": [
"Gửi GET tới https://actp1.csc.edu.vn/",
"Xem response header"
],
"er": [
"Có header X-Content-Type-Options: nosniff"
]
},
"HOME-TC021": {
"summary": "Kiểm tra response trang chủ có X-Frame-Options hoặc Content-Security-Policy chống clickjacking",
"pre": "",
"steps": [
"Gửi GET tới https://actp1.csc.edu.vn/",
"Xem response header"
],
"er": [
"Có X-Frame-Options hoặc CSP frame-ancestors"
]
},
"HOME-TC022": {
"summary": "Kiểm tra /readme.html không truy cập được công khai",
"pre": "Chưa đăng nhập",
"steps": [
"Gửi GET tới https://actp1.csc.edu.vn/readme.html",
"Xem mã trạng thái"
],
"er": [
"HTTP 403/404"
]
},
"HOME-TC023": {
"summary": "Kiểm tra trang chủ không có thẻ meta generator lộ phiên bản WordPress",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/",
"Xem source, tìm thẻ meta name=\"generator\""
],
"er": [
"Không có thẻ meta generator"
]
},
"HOME-TC024": {
"summary": "Kiểm tra /wp-content/uploads/ không bật liệt kê thư mục",
"pre": "",
"steps": [
"Gửi GET tới https://actp1.csc.edu.vn/wp-content/uploads/",
"Xem nội dung phản hồi"
],
"er": [
"Không hiển thị 'Index of'"
]
},
"HOME-TC025": {
"summary": "Kiểm tra các file nhạy cảm (.env, .git/config, wp-config.php.bak, debug.log) không truy cập được",
"pre": "",
"steps": [
"Gửi GET tới từng đường dẫn: /.env, /.git/config, /wp-config.php.bak, /debug.log, /wp-content/debug.log",
"Xem mã trạng thái"
],
"er": [
"Tất cả trả 403/404"
]
},
"HOME-TC026": {
"summary": "Kiểm tra tất cả ảnh trên trang chủ có alt text",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/",
"Kiểm tra thuộc tính alt của mọi thẻ img"
],
"er": [
"Mọi ảnh đều có alt"
]
},
"HOME-TC027": {
"summary": "Kiểm tra mọi link/button hiển thị ở trang chủ đều có tên truy cập (text hoặc aria-label)",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/",
"Kiểm tra các thẻ a/button đang hiển thị có text, aria-label hoặc title"
],
"er": [
"Không có link/button không tên"
]
},
"HOME-TC028": {
"summary": "Kiểm tra thẻ html có thuộc tính lang",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/",
"Kiểm tra thuộc tính lang của thẻ html"
],
"er": [
"Có thuộc tính lang"
]
},
"HOME-TC029": {
"summary": "Kiểm tra nhấn Tab ở trang chủ đưa focus vào phần tử tương tác đầu tiên",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/",
"Nhấn phím Tab 1 lần",
"Xem phần tử đang focus"
],
"er": [
"Focus vào link/button/input"
]
},
"HOME-TC030": {
"summary": "Kiểm tra ảnh ở trang chủ không vượt quá 500KB",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/",
"Ghi lại kích thước các ảnh tải về"
],
"er": [
"Mỗi ảnh <= 500KB"
]
},
"HOME-TC031": {
"summary": "Kiểm tra mức giảm giá ghi ở banner khớp với mức giảm thực tế của các sản phẩm\n",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Đọc nội dung banner 'HUGE SALE UP TO 80% OFF'",
"So sánh với giá gốc và giá sale của các sản phẩm đang giảm giá (Bold Statement Graphic Tee, Golden Glow Ribbed Knit Dress, Sophisticated Ribbed Turtleneck Tee)"
],
"er": [
"Mức giảm giá tối đa của sản phẩm khớp với mức ghi ở banner (hoặc banner ghi đúng mức giảm thực tế)"
]
},
"HOME-TC032": {
"summary": "Kiểm tra mô tả ở các mục BEAUTIFUL PRODUCTS, FAST DELIVERY, 100% SATISFACTION đúng với nội dung tiêu đề\n",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Cuộn tới phần 'WE ARE ELEGANT'",
"Đọc mô tả dưới từng tiêu đề BEAUTIFUL PRODUCTS, FAST DELIVERY, 100% SATISFACTION"
],
"er": [
"Mô tả liên quan tới tiêu đề (chất lượng sản phẩm, giao hàng nhanh, sự hài lòng của khách hàng)"
]
},
"HOME-TC033": {
"summary": "Kiểm tra các sản phẩm trong mục top rated",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/",
"Cuộn xuống dưới footer tại mục top rated products",
"Chọn sản phẩm \"Sunset Glow Utility Dress\"",
"Cuộn xuống phần đánh giá"
],
"er": [
"Sản phẩm có nhiều đánh giá tốt"
]
},
"HOME-TC034": {
"summary": "Kiểm tra hai nút trên banner dẫn tới trang đúng với nhãn của nút\n",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Click nút 'SEE ALL PRODUCTS' và ghi lại URL",
"Quay lại, click nút 'VIEW COLLECTIONS' và ghi lại URL"
],
"er": [
"VIEW COLLECTIONS' dẫn tới trang bộ sưu tập/danh mục, khác với 'SEE ALL PRODUCTS' (dẫn tới /shop/)"
]
},
"HOME-TC035": {
"summary": "Kiểm tra cách viết tên danh mục và tên sản phẩm áo thun thống nhất.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Rê chuột vào menu Shop, đọc tên danh mục con của Clothing",
"Cuộn xuống phần Latest Products, đọc tên sản phẩm áo thun"
],
"er": [
"Cách viết thống nhất (cùng \"T-Shirt\" hoặc cùng \"Tshirt\")"
]
},
"HOME-TC036": {
"summary": "Kiểm tra trang vẫn chuyển được sang trang kế tiếp khi bấm liên tục vào nút.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Bấm liên tục, thật nhanh nhiều lần (khoảng 10 lần) vào nút \"SEE ALL PRODUCTS\"",
"Quan sát trang"
],
"er": [
"Trang chỉ xử lý một lần bấm và chuyển sang trang /shop/ bình thường"
]
},
"NAV-TC001": {
"summary": "Kiểm tra chuyển tới trang chủ khi click 'Home' trên menu từ trang Shop.",
"pre": "Đang ở trang Shop",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Click mục 'Home' trên menu",
"Chờ trang tải xong và kiểm tra URL là trang chủ (https://actp1.csc.edu.vn/)"
],
"er": [
"Chuyển tới trang chủ"
]
},
"NAV-TC002": {
"summary": "Kiểm tra chuyển tới /shop/ khi click 'Shop' trên menu từ trang chủ.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Click mục 'Shop' trên menu",
"Chờ trang tải xong và kiểm tra URL chuyển tới /shop/"
],
"er": [
"Chuyển tới /shop/"
]
},
"NAV-TC003": {
"summary": "Kiểm tra chuyển tới /blog/ khi click 'Blog' trên menu từ trang chủ.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Click mục 'Blog' trên menu",
"Chờ trang tải xong và kiểm tra URL chuyển tới /blog/"
],
"er": [
"Chuyển tới /blog/"
]
},
"NAV-TC004": {
"summary": "Kiểm tra chuyển tới /my-account/ và hiển thị form Login, Register khi click 'My account' trên menu lúc chưa đăng nhập.",
"pre": "Chưa đăng nhập",
"steps": [
"Đảm bảo trình duyệt chưa đăng nhập",
"Truy cập https://actp1.csc.edu.vn/",
"Click mục 'My account' trên menu",
"Kiểm tra URL chuyển tới /my-account/",
"Kiểm tra hiển thị cả form Login và form Register"
],
"er": [
"Chuyển tới /my-account/, hiển thị form Login và Register"
]
},
"NAV-TC005": {
"summary": "Kiểm tra chuyển tới trang chủ khi click logo/tên site trên header từ trang Blog.",
"pre": "Đang ở trang Blog",
"steps": [
"Truy cập https://actp1.csc.edu.vn/blog/",
"Click vào logo hoặc tên site trên header",
"Chờ trang tải xong và kiểm tra URL là trang chủ (https://actp1.csc.edu.vn/)"
],
"er": [
"Chuyển tới trang chủ"
]
},
"NAV-TC006": {
"summary": "Kiểm tra hiển thị submenu 'Clothing' khi hover vào 'Shop' trên menu.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Di chuột vào mục 'Shop' trên menu",
"Quan sát submenu xổ xuống",
"Kiểm tra có mục 'Clothing'"
],
"er": [
"Hiển thị submenu 'Clothing'"
]
},
"NAV-TC007": {
"summary": "Kiểm tra hiển thị 3 mục Dresses, Tshirt, Blouse khi hover vào 'Clothing' trong submenu Shop.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Di chuột vào mục 'Shop' trên menu",
"Di chuột tiếp vào mục 'Clothing' trong submenu",
"Kiểm tra hiển thị đủ 3 mục: Dresses, Tshirt, Blouse"
],
"er": [
"Hiển thị 3 mục Dresses, Tshirt, Blouse"
]
},
"NAV-TC008": {
"summary": "Kiểm tra chuyển tới /category/clothing/dresses/ khi click 'Dresses' trong submenu Shop > Clothing.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Hover 'Shop', rồi hover 'Clothing'",
"Click mục 'Dresses'",
"Chờ trang tải xong và kiểm tra URL chuyển tới /category/clothing/dresses/"
],
"er": [
"Chuyển tới /category/clothing/dresses/"
]
},
"NAV-TC009": {
"summary": "Kiểm tra chuyển tới /category/clothing/tshirt/ khi click 'Tshirt' trong submenu Shop > Clothing.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Hover 'Shop', rồi hover 'Clothing'",
"Click mục 'Tshirt'",
"Chờ trang tải xong và kiểm tra URL chuyển tới /category/clothing/tshirt/"
],
"er": [
"Chuyển tới /category/clothing/tshirt/"
]
},
"NAV-TC010": {
"summary": "Kiểm tra chuyển tới /category/blouse/ khi click 'Blouse' trong submenu Shop > Clothing.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Hover 'Shop', rồi hover 'Clothing'",
"Click mục 'Blouse'",
"Chờ trang tải xong và kiểm tra URL chuyển tới /category/blouse/"
],
"er": [
"Chuyển tới /category/blouse/"
]
},
"NAV-TC011": {
"summary": "Kiểm tra icon giỏ hàng hiển thị 'Cart 0' khi giỏ hàng rỗng.",
"pre": "Giỏ hàng rỗng",
"steps": [
"Đảm bảo giỏ hàng rỗng (xóa cookie hoặc dùng cửa sổ ẩn danh)",
"Truy cập https://actp1.csc.edu.vn/",
"Quan sát icon giỏ hàng trên header",
"Kiểm tra hiển thị 'Cart 0'"
],
"er": [
"Hiển thị 'Cart 0'"
]
},
"NAV-TC012": {
"summary": "Kiểm tra chuyển tới trang giỏ hàng /cart/ khi click icon Cart trên header.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Click icon 'Cart' trên header",
"Chờ trang tải xong và kiểm tra URL chuyển tới /cart/"
],
"er": [
"Chuyển tới /cart/"
]
},
"NAV-TC013": {
"summary": "Kiểm tra icon Cart cập nhật thành 1 khi thêm sản phẩm 'Bold Statement Graphic Tee' vào giỏ hàng rỗng.",
"pre": "Giỏ hàng rỗng",
"steps": [
"Đảm bảo giỏ hàng rỗng, icon Cart đang hiển thị 0",
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Để quantity mặc định là 1, click nút 'Add to cart'",
"Chờ hệ thống xử lý xong",
"Quan sát icon Cart trên header và kiểm tra hiển thị 1"
],
"er": [
"Icon Cart hiển thị 1"
]
},
"NAV-TC014": {
"summary": "Kiểm tra menu hamburger mở/đóng được, hiển thị đủ các mục và các link hoạt động ở viewport mobile 375x812.",
"pre": "Viewport 375x812",
"steps": [
"Mở DevTools (F12), bật Device Toolbar, đặt viewport 375x812",
"Truy cập https://actp1.csc.edu.vn/",
"Click icon hamburger, kiểm tra menu mở ra đầy đủ các mục",
"Click một mục trong menu, kiểm tra link chuyển đúng trang",
"Quay lại, mở menu lần nữa rồi click icon đóng",
"Kiểm tra menu đóng lại"
],
"er": [
"Menu mở ra đầy đủ mục, đóng lại được, các link hoạt động"
]
},
"NAV-TC015": {
"summary": "Kiểm tra các trang chính có title khác nhau",
"pre": "",
"steps": [
"Mở lần lượt Home, Shop, Product Detail, Cart, My account, Blog",
"Ghi lại title"
],
"er": [
"Mỗi trang có title riêng"
]
},
"NAV-TC016": {
"summary": "Kiểm tra có robots.txt và sitemap",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/robots.txt",
"Truy cập https://actp1.csc.edu.vn/wp-sitemap.xml"
],
"er": [
"Cả hai trả HTTP 200"
]
},
"NAV-TC017": {
"summary": "Kiểm tra 6 trang chính không bị tràn ngang ở màn hình mobile 375px",
"pre": "",
"steps": [
"Mở Home, Shop, Product Detail, Cart, My account, Blog ở viewport 375x812",
"So sánh scrollWidth với innerWidth"
],
"er": [
"Không có thanh cuộn ngang"
]
},
"NAV-TC018": {
"summary": "Kiểm tra 6 trang chính không bị tràn ngang ở màn hình tablet 768px",
"pre": "",
"steps": [
"Mở 6 trang chính ở viewport 768x1024",
"So sánh scrollWidth với innerWidth"
],
"er": [
"Không có thanh cuộn ngang"
]
},
"NAV-TC019": {
"summary": "Kiểm tra 6 trang chính không bị tràn ngang ở màn hình desktop 1920px",
"pre": "",
"steps": [
"Mở 6 trang chính ở viewport 1920x1080",
"So sánh scrollWidth với innerWidth"
],
"er": [
"Không có thanh cuộn ngang"
]
},
"NAV-TC020": {
"summary": "Kiểm tra mobile có nút menu và mở được menu",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/ ở viewport 375x812",
"Click nút menu"
],
"er": [
"Menu mở ra, thấy các mục (Blog...)"
]
},
"NAV-TC021": {
"summary": "Kiểm tra Home, Shop, Product Detail, Blog tải xong trong 3 giây",
"pre": "",
"steps": [
"Mở từng trang",
"Đo thời gian loadEventEnd"
],
"er": [
"<= 3000ms mỗi trang"
]
},
"NAV-TC022": {
"summary": "Kiểm tra các link nội bộ ở trang chủ không bị hỏng",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/",
"Gửi request tới từng link nội bộ (tối đa 60)"
],
"er": [
"Không link nào trả 4xx/5xx"
]
},
"SHOP-TC001": {
"summary": "Kiểm tra hiển thị 'Showing 1–8 of 9 results' khi truy cập trang Shop.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Tìm dòng thông tin số kết quả phía trên danh sách sản phẩm",
"Kiểm tra hiển thị 'Showing 1–8 of 9 results'"
],
"er": [
"Hiển thị 'Showing 1–8 of 9 results'"
]
},
"SHOP-TC002": {
"summary": "Kiểm tra trang Shop hiển thị 8 sản phẩm ở trang 1.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Đếm số sản phẩm hiển thị trong danh sách",
"Kiểm tra có đúng 8 sản phẩm"
],
"er": [
"Có 8 sản phẩm"
]
},
"SHOP-TC003": {
"summary": "Kiểm tra mỗi sản phẩm trên trang Shop hiển thị đủ ảnh, tên và giá.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Lần lượt quan sát từng sản phẩm trong danh sách",
"Kiểm tra mỗi sản phẩm có ảnh hiển thị được, tên sản phẩm và giá"
],
"er": [
"Mỗi sản phẩm hiển thị ảnh, tên và giá"
]
},
"SHOP-TC004": {
"summary": "Kiểm tra 3 sản phẩm đang sale có nhãn 'Sale!' và giá gốc gạch ngang ($18→$15, $15→$12, $15→$12) trên trang Shop.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Tìm 3 sản phẩm: Bold Statement Graphic Tee, Golden Glow Ribbed Knit Dress, Sophisticated Ribbed Turtleneck Tee",
"Kiểm tra từng sản phẩm có nhãn 'Sale!'",
"Kiểm tra giá gốc hiển thị gạch ngang và giá sale: Bold Statement Graphic Tee $18→$15, hai sản phẩm còn lại $15→$12"
],
"er": [
"3 sản phẩm có nhãn Sale!; giá: $18→$15, $15→$12, $15→$12"
]
},
"SHOP-TC005": {
"summary": "Kiểm tra chuyển tới /shop/page/2/ và hiển thị sản phẩm 'Sunset Glow Utility Dress' khi click số trang '2'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Cuộn xuống phần phân trang cuối danh sách",
"Click số '2'",
"Kiểm tra URL chuyển tới /shop/page/2/",
"Kiểm tra trang chỉ hiển thị 1 sản phẩm là 'Sunset Glow Utility Dress'"
],
"er": [
"Chuyển tới /shop/page/2/, hiển thị 'Sunset Glow Utility Dress'"
]
},
"SHOP-TC006": {
"summary": "Kiểm tra chuyển tới /shop/page/2/ khi click nút mũi tên '→' ở phân trang.",
"pre": "Đang ở trang 1",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Cuộn xuống phần phân trang cuối danh sách",
"Click nút mũi tên '→'",
"Kiểm tra URL chuyển tới /shop/page/2/"
],
"er": [
"Chuyển tới /shop/page/2/"
]
},
"SHOP-TC007": {
"summary": "Kiểm tra hiển thị trang 404 hoặc không có sản phẩm, không lỗi 500 khi truy cập /shop/page/99/.",
"pre": "",
"steps": [
"Truy cập trực tiếp https://actp1.csc.edu.vn/shop/page/99/",
"Chờ trang tải xong",
"Kiểm tra hiển thị trang 404 hoặc thông báo không có sản phẩm",
"Kiểm tra không có lỗi 500 hoặc trắng trang"
],
"er": [
"Hiển thị trang 404 / không có sản phẩm, không lỗi 500"
]
},
"SHOP-TC008": {
"summary": "Kiểm tra dropdown sắp xếp có đủ 6 tùy chọn khi mở trên trang Shop.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Click dropdown sắp xếp phía trên danh sách sản phẩm",
"Đếm và đọc các tùy chọn",
"Kiểm tra có đủ 6 tùy chọn: Default sorting, Sort by popularity, Sort by average rating, Sort by latest, Sort by price: low to high, Sort by price: high to low"
],
"er": [
"Có: Default sorting, popularity, average rating, latest, price low to high, price high to low"
]
},
"SHOP-TC009": {
"summary": "Kiểm tra giá sản phẩm hiển thị tăng dần khi chọn 'Sort by price: low to high'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Mở dropdown sắp xếp và chọn 'Sort by price: low to high'",
"Chờ trang tải lại",
"Đọc giá của các sản phẩm theo thứ tự từ trên xuống",
"Kiểm tra giá tăng dần (lưu ý dùng giá sale với sản phẩm đang giảm giá)"
],
"er": [
"Giá hiển thị tăng dần"
]
},
"SHOP-TC010": {
"summary": "Kiểm tra giá giảm dần và sản phẩm đầu tiên có giá $400.00 khi chọn 'Sort by price: high to low'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Mở dropdown sắp xếp và chọn 'Sort by price: high to low'",
"Chờ trang tải lại",
"Đọc giá của các sản phẩm theo thứ tự từ trên xuống",
"Kiểm tra giá giảm dần và sản phẩm đầu tiên có giá $400.00"
],
"er": [
"Giá hiển thị giảm dần, sản phẩm đầu là $400.00"
]
},
"SHOP-TC011": {
"summary": "Kiểm tra trang tải lại với orderby=popularity và không lỗi khi chọn 'Sort by popularity'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Mở dropdown sắp xếp và chọn 'Sort by popularity'",
"Chờ trang tải lại",
"Kiểm tra URL có tham số orderby=popularity",
"Kiểm tra danh sách hiển thị bình thường, không có lỗi"
],
"er": [
"Trang tải lại với orderby=popularity, không lỗi"
]
},
"SHOP-TC012": {
"summary": "Kiểm tra trang tải lại với orderby=rating và không lỗi khi chọn 'Sort by average rating'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Mở dropdown sắp xếp và chọn 'Sort by average rating'",
"Chờ trang tải lại",
"Kiểm tra URL có tham số orderby=rating",
"Kiểm tra danh sách hiển thị bình thường, không có lỗi"
],
"er": [
"Trang tải lại với orderby=rating, không lỗi"
]
},
"SHOP-TC013": {
"summary": "Kiểm tra trang tải lại với orderby=date và không lỗi khi chọn 'Sort by latest'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Mở dropdown sắp xếp và chọn 'Sort by latest'",
"Chờ trang tải lại",
"Kiểm tra URL có tham số orderby=date",
"Kiểm tra danh sách hiển thị bình thường, không có lỗi"
],
"er": [
"Trang tải lại với orderby=date, không lỗi"
]
},
"SHOP-TC014": {
"summary": "Kiểm tra hiển thị danh sách mặc định và không lỗi 500 khi truy cập /shop/?orderby=abc.",
"pre": "",
"steps": [
"Truy cập trực tiếp https://actp1.csc.edu.vn/shop/?orderby=abc",
"Chờ trang tải xong",
"Kiểm tra trang vẫn hiển thị danh sách sản phẩm theo sắp xếp mặc định",
"Kiểm tra không có lỗi 500 hoặc trắng trang"
],
"er": [
"Trang vẫn hiển thị danh sách mặc định, không lỗi 500"
]
},
"SHOP-TC015": {
"summary": "Kiểm tra trang danh mục Dresses hiển thị 4 sản phẩm khi truy cập /category/clothing/dresses/.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/category/clothing/dresses/",
"Đếm số sản phẩm hiển thị",
"Kiểm tra có đúng 4 sản phẩm"
],
"er": [
"Hiển thị 4 sản phẩm"
]
},
"SHOP-TC016": {
"summary": "Kiểm tra trang danh mục Tshirt hiển thị 3 sản phẩm khi truy cập /category/clothing/tshirt/.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/category/clothing/tshirt/",
"Đếm số sản phẩm hiển thị",
"Kiểm tra có đúng 3 sản phẩm"
],
"er": [
"Hiển thị 3 sản phẩm"
]
},
"SHOP-TC017": {
"summary": "Kiểm tra trang danh mục Blouse hiển thị 1 sản phẩm 'Classic Striped Knit Blouse' khi truy cập /category/blouse/.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/category/blouse/",
"Đếm số sản phẩm hiển thị",
"Kiểm tra có đúng 1 sản phẩm và tên là 'Classic Striped Knit Blouse'"
],
"er": [
"Hiển thị 1 sản phẩm: Classic Striped Knit Blouse"
]
},
"SHOP-TC018": {
"summary": "Kiểm tra trang danh mục Clothing hiển thị 7 sản phẩm, khớp số trong widget khi truy cập /category/clothing/.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/category/clothing/",
"Đếm số sản phẩm hiển thị",
"Kiểm tra có đúng 7 sản phẩm",
"Đối chiếu với số (7) của 'Clothing' trong widget Product categories"
],
"er": [
"Hiển thị 7 sản phẩm (khớp số trong widget)"
]
},
"SHOP-TC019": {
"summary": "Kiểm tra trang danh mục Uncategorized hiển thị 1 sản phẩm khi truy cập /category/uncategorized/.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/category/uncategorized/",
"Đếm số sản phẩm hiển thị",
"Kiểm tra có đúng 1 sản phẩm"
],
"er": [
"Hiển thị 1 sản phẩm"
]
},
"SHOP-TC020": {
"summary": "Kiểm tra chuyển tới trang danh mục Dresses và hiển thị đúng sản phẩm khi click 'Dresses' ở widget Product categories.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Cuộn tới widget 'Product categories' (sidebar hoặc footer)",
"Click danh mục 'Dresses'",
"Chờ trang tải xong và kiểm tra URL chuyển tới /category/clothing/dresses/",
"Kiểm tra danh sách hiển thị các sản phẩm thuộc Dresses"
],
"er": [
"Chuyển tới category Dresses"
]
},
"SHOP-TC021": {
"summary": "Kiểm tra hiển thị trang 404 khi truy cập danh mục không tồn tại /category/khong-ton-tai/.",
"pre": "",
"steps": [
"Truy cập trực tiếp https://actp1.csc.edu.vn/category/khong-ton-tai/",
"Chờ trang tải xong",
"Kiểm tra hiển thị trang 404"
],
"er": [
"Hiển thị trang 404"
]
},
"SHOP-TC022": {
"summary": "Kiểm tra giá sản phẩm hiển thị đúng và nhất quán khi tải lại trang Shop nhiều lần.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Ghi lại giá của 8 sản phẩm ở trang 1 (đối chiếu với giá ở trang chi tiết sản phẩm)",
"Tải lại trang (F5) liên tiếp khoảng 10 lần",
"Sau mỗi lần tải, đối chiếu giá từng sản phẩm với giá đã ghi ở bước 2",
"Kiểm tra giá không bị đổi sang giá bất thường (VD: $11000246.00)"
],
"er": [
"Giá các sản phẩm hiển thị đúng và nhất quán sau mỗi lần tải lại (VD: Floral Elegance Sun Hat $45.00, Sophisticated Striped Midi Dress $400.00, Sunset Glow Utility Dress $135.00)"
]
},
"SHOP-TC023": {
"summary": "Kiểm tra mở đúng trang chi tiết 'Sophisticated Striped Midi Dress' khi click sản phẩm này ở trang Shop.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Tìm sản phẩm 'Sophisticated Striped Midi Dress'",
"Click vào tên (hoặc ảnh) của sản phẩm",
"Chờ trang tải xong",
"Kiểm tra URL, tên sản phẩm và giá hiển thị trên trang chi tiết"
],
"er": [
"Mở đúng trang /shop/sophisticated-striped-midi-dress/ với tên 'Sophisticated Striped Midi Dress' và giá $400.00"
]
},
"SHOP-TC024": {
"summary": "Kiểm tra mở được trang chi tiết 'Sunset Glow Utility Dress' khi click sản phẩm này ở trang Shop.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Tìm sản phẩm 'Sunset Glow Utility Dress'",
"Click vào tên (hoặc ảnh) của sản phẩm",
"Chờ trang tải xong",
"Kiểm tra URL, tên sản phẩm và giá hiển thị trên trang chi tiết"
],
"er": [
"Mở đúng trang /shop/sunset-glow-utility-dress/ với tên 'Sunset Glow Utility Dress' và giá $135.00"
]
},
"SHOP-TC025": {
"summary": "Kiểm tra breadcrumb trang Shop dùng dấu phân cách hợp lệ",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/shop/",
"Quan sát breadcrumb"
],
"er": [
"Phân cách là '/' hoặc '>' (VD: Home / Shop)"
]
},
"SHOP-TC026": {
"summary": "Kiểm tra danh mục mặc định 'Uncategorized' không hiển thị cho khách",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/shop/",
"Quan sát danh sách danh mục"
],
"er": [
"Không có 'Uncategorized'"
]
},
"SHOP-TC027": {
"summary": "Kiểm tra giá các sản phẩm trong danh mục T-Shirt hợp lý",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/category/clothing/tshirt/",
"Xem giá từng sản phẩm"
],
"er": [
"Giá cùng nhóm không chênh lệch bất thường (<= $100)"
]
},
"SHOP-TC028": {
"summary": "Kiểm tra nút ở danh sách Shop đủ lớn để chạm trên mobile",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/shop/ ở viewport 375x812",
"Đo chiều cao các nút"
],
"er": [
"Chiều cao nút >= 24px"
]
},
"SHOP-TC029": {
"summary": "Kiểm tra danh mục Clothing hiển thị cả sản phẩm thuộc danh mục con Blouse",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Click danh mục Clothing (hoặc mở https://actp1.csc.edu.vn/category/clothing/)",
"Quan sát danh sách sản phẩm và số lượng trên danh mục"
],
"er": [
"Danh mục Clothing hiển thị cả sản phẩm của Blouse (Classic Striped Knit Blouse)"
]
},
"SHOP-TC030": {
"summary": "Kiểm tra bộ sắp xếp được giữ nguyên khi chuyển sang trang sản phẩm tiếp theo.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Chọn 'Sort by price: low to high' ở ô sắp xếp",
"Chờ trang tải xong",
"Cuộn xuống phần phân trang và click số 2",
"Quan sát ô sắp xếp, URL và thứ tự giá ở trang 2"
],
"er": [
"Trang 2 vẫn áp dụng 'Sort by price: low to high' (ô sắp xếp giữ giá trị đã chọn, URL có orderby=price)"
]
},
"SHOP-TC031": {
"summary": "Kiểm tra bộ sắp xếp được giữ nguyên khi chọn danh mục sản phẩm khác.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Chọn 'Sort by price: low to high' ở ô sắp xếp",
"Ở widget 'Product categories', click danh mục 'Dresses'",
"Quan sát ô sắp xếp và URL ở trang danh mục"
],
"er": [
"Trang danh mục vẫn áp dụng 'Sort by price: low to high' (ô sắp xếp giữ giá trị đã chọn, URL có orderby=price)"
]
},
"PDP-TC001": {
"summary": "Kiểm tra trang chi tiết 'Bold Statement Graphic Tee' hiển thị tên, giá, ảnh, nút Add to cart và Categories: Clothing, Tshirt.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Kiểm tra hiển thị tên sản phẩm và giá",
"Kiểm tra hiển thị ảnh sản phẩm và nút 'Add to cart'",
"Kiểm tra dòng Categories hiển thị 'Clothing, Tshirt'"
],
"er": [
"Hiển thị tên, giá, ảnh, nút Add to cart, Categories: Clothing, Tshirt"
]
},
"PDP-TC002": {
"summary": "Kiểm tra gallery ảnh của 'Bold Statement Graphic Tee' hiển thị đủ 4 ảnh.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Quan sát gallery ảnh của sản phẩm",
"Đếm số ảnh (ảnh chính và ảnh thumbnail)",
"Click lần lượt từng thumbnail, kiểm tra ảnh chính đổi tương ứng và có đủ 4 ảnh"
],
"er": [
"Có 4 ảnh sản phẩm"
]
},
"PDP-TC003": {
"summary": "Kiểm tra sản phẩm 'Bold Statement Graphic Tee' hiển thị nhãn Sale!, giá gốc $18.00 gạch ngang và giá hiện tại $15.00.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Kiểm tra có nhãn 'Sale!' trên ảnh sản phẩm",
"Kiểm tra giá gốc $18.00 hiển thị dạng gạch ngang",
"Kiểm tra giá hiện tại $15.00"
],
"er": [
"Nhãn Sale!, giá gốc $18.00 gạch ngang, giá hiện tại $15.00"
]
},
"PDP-TC004": {
"summary": "Kiểm tra breadcrumb hiển thị đúng Home \\ Shop \\ Clothing \\ Tshirt \\ Bold Statement Graphic Tee và các link hoạt động.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Quan sát breadcrumb phía trên tên sản phẩm",
"Kiểm tra breadcrumb: Home \\ Shop \\ Clothing \\ Tshirt \\ Bold Statement Graphic Tee",
"Click lần lượt từng link (Home, Shop, Clothing, Tshirt), kiểm tra chuyển đúng trang",
"Dùng nút Back để quay lại trang chi tiết sau mỗi lần click"
],
"er": [
"Home \\ Shop \\ Clothing \\ Tshirt \\ Bold Statement Graphic Tee, các link hoạt động"
]
},
"PDP-TC005": {
"summary": "Kiểm tra chuyển tới /category/clothing/tshirt/ khi click link 'Tshirt' ở dòng Categories.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Tìm dòng 'Categories' bên dưới nút Add to cart",
"Click link 'Tshirt'",
"Chờ trang tải xong và kiểm tra URL chuyển tới /category/clothing/tshirt/"
],
"er": [
"Chuyển tới /category/clothing/tshirt/"
]
},
"PDP-TC006": {
"summary": "Kiểm tra tab 'Description' hiển thị Material, Fit, Color, Care Instructions, Style Tip khi click vào tab.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Cuộn xuống khu vực tab thông tin sản phẩm",
"Click tab 'Description'",
"Kiểm tra nội dung hiển thị đủ các mục: Material, Fit, Color, Care Instructions, Style Tip"
],
"er": [
"Hiển thị Material, Fit, Color, Care Instructions, Style Tip"
]
},
"PDP-TC007": {
"summary": "Kiểm tra tab 'Reviews (0)' hiển thị 'There are no reviews yet.' và form review khi sản phẩm chưa có review.",
"pre": "Sản phẩm chưa có review",
"steps": [
"Truy cập trang chi tiết của sản phẩm chưa có review (ví dụ: https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/)",
"Cuộn xuống khu vực tab thông tin sản phẩm",
"Click tab 'Reviews (0)'",
"Kiểm tra hiển thị 'There are no reviews yet.'",
"Kiểm tra hiển thị form viết review bên dưới"
],
"er": [
"Hiển thị 'There are no reviews yet.' và form review"
]
},
"PDP-TC008": {
"summary": "Kiểm tra hiển thị trang 404 khi truy cập sản phẩm không tồn tại /shop/khong-ton-tai/.",
"pre": "",
"steps": [
"Truy cập trực tiếp https://actp1.csc.edu.vn/shop/khong-ton-tai/",
"Chờ trang tải xong",
"Kiểm tra hiển thị trang 404"
],
"er": [
"Hiển thị trang 404"
]
},
"PDP-TC009": {
"summary": "Kiểm tra hiển thị thông báo đã thêm vào giỏ và icon Cart = 1 khi Add to cart với số lượng mặc định (1).",
"pre": "Giỏ hàng rỗng",
"steps": [
"Đảm bảo giỏ hàng rỗng",
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Giữ nguyên ô quantity mặc định là 1",
"Click nút 'Add to cart'",
"Kiểm tra hiển thị thông báo đã thêm sản phẩm vào giỏ",
"Kiểm tra icon Cart trên header hiển thị 1"
],
"er": [
"Hiển thị thông báo đã thêm vào giỏ, icon Cart = 1"
]
},
"PDP-TC010": {
"summary": "Kiểm tra giỏ hàng có 3 sản phẩm và Cart = 3 khi Add to cart với số lượng 3.",
"pre": "Giỏ hàng rỗng",
"steps": [
"Đảm bảo giỏ hàng rỗng",
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Nhập quantity = 3",
"Click nút 'Add to cart'",
"Kiểm tra icon Cart hiển thị 3",
"Truy cập https://actp1.csc.edu.vn/cart/, kiểm tra quantity của sản phẩm là 3"
],
"er": [
"Giỏ hàng có 3 sản phẩm, Cart = 3"
]
},
"PDP-TC011": {
"summary": "Kiểm tra giỏ hàng chỉ có 1 dòng với quantity = 2 khi Add to cart cùng một sản phẩm 2 lần.",
"pre": "Giỏ hàng rỗng",
"steps": [
"Đảm bảo giỏ hàng rỗng",
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Để quantity = 1, click 'Add to cart'",
"Click 'Add to cart' lần nữa với quantity = 1",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Kiểm tra giỏ hàng chỉ có 1 dòng sản phẩm với quantity = 2"
],
"er": [
"Giỏ hàng có 1 dòng với quantity = 2"
]
},
"PDP-TC012": {
"summary": "Kiểm tra giỏ hàng có 2 dòng sản phẩm khi Add to cart 2 sản phẩm khác nhau.",
"pre": "Giỏ hàng rỗng",
"steps": [
"Đảm bảo giỏ hàng rỗng",
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/ và click 'Add to cart'",
"Truy cập https://actp1.csc.edu.vn/shop/floral-elegance-sun-hat/ và click 'Add to cart'",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Kiểm tra giỏ hàng có 2 dòng: Bold Statement Graphic Tee và Floral Elegance Sun Hat"
],
"er": [
"Giỏ hàng có 2 dòng sản phẩm"
]
},
"PDP-TC013": {
"summary": "Kiểm tra không thêm vào giỏ hoặc báo lỗi, giỏ hàng vẫn rỗng khi Add to cart với quantity = 0.",
"pre": "Giỏ hàng rỗng",
"steps": [
"Đảm bảo giỏ hàng rỗng",
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Nhập quantity = 0",
"Click nút 'Add to cart'",
"Quan sát thông báo (nếu có)",
"Kiểm tra icon Cart vẫn là 0 và https://actp1.csc.edu.vn/cart/ vẫn rỗng"
],
"er": [
"Không thêm vào giỏ hoặc báo lỗi, giỏ hàng vẫn rỗng"
]
},
"PDP-TC014": {
"summary": "Kiểm tra không thêm vào giỏ, giỏ hàng vẫn rỗng khi Add to cart với quantity âm (-1).",
"pre": "Giỏ hàng rỗng",
"steps": [
"Đảm bảo giỏ hàng rỗng",
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Nhập quantity = -1",
"Click nút 'Add to cart'",
"Quan sát thông báo (nếu có)",
"Kiểm tra icon Cart vẫn là 0 và https://actp1.csc.edu.vn/cart/ vẫn rỗng"
],
"er": [
"Không thêm vào giỏ, giỏ hàng vẫn rỗng"
]
},
"PDP-TC015": {
"summary": "Kiểm tra không thêm vào giỏ hoặc báo giá trị không hợp lệ khi Add to cart với quantity thập phân (1.5).",
"pre": "Giỏ hàng rỗng",
"steps": [
"Đảm bảo giỏ hàng rỗng",
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Nhập quantity = 1.5",
"Click nút 'Add to cart'",
"Quan sát thông báo (nếu có) của trình duyệt hoặc hệ thống",
"Kiểm tra sản phẩm không được thêm vào giỏ với số lượng thập phân"
],
"er": [
"Không thêm vào giỏ hoặc báo giá trị không hợp lệ"
]
},
"PDP-TC016": {
"summary": "Kiểm tra ô quantity không nhận ký tự chữ khi nhập 'abc'.",
"pre": "Giỏ hàng rỗng",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Click vào ô quantity, xóa giá trị hiện tại",
"Gõ lần lượt các ký tự 'abc' bằng bàn phím",
"Quan sát nội dung trong ô",
"Kiểm tra ô không nhận ký tự chữ (vẫn rỗng hoặc giữ giá trị số)"
],
"er": [
"Ô number không nhận ký tự chữ"
]
},
"PDP-TC017": {
"summary": "Kiểm tra hệ thống xử lý hoặc báo lỗi hợp lệ, không lỗi 500 và tổng tiền đúng khi Add to cart với quantity 99999.",
"pre": "Giỏ hàng rỗng",
"steps": [
"Đảm bảo giỏ hàng rỗng",
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Nhập quantity = 99999",
"Click nút 'Add to cart'",
"Quan sát thông báo và kiểm tra không có lỗi 500",
"Nếu thêm được, truy cập https://actp1.csc.edu.vn/cart/ và kiểm tra tổng tiền = 99999 x đơn giá"
],
"er": [
"Hệ thống xử lý được hoặc báo lỗi hợp lệ, không lỗi 500, tổng tiền hiển thị đúng"
]
},
"PDP-TC018": {
"summary": "Kiểm tra form review hiển thị đủ Your rating (5 mức), Your review, Name, Email, checkbox 'Save my name...' và nút Submit khi mở tab Reviews.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Click tab 'Reviews (0)'",
"Kiểm tra 'Your rating' có 5 mức sao",
"Kiểm tra có ô 'Your review', 'Name', 'Email'",
"Kiểm tra có checkbox 'Save my name, email, and website in this browser...' và nút 'Submit'"
],
"er": [
"Có Your rating (5 mức), Your review, Name, Email, checkbox 'Save my name...', nút Submit"
]
},
"PDP-TC019": {
"summary": "Kiểm tra hiển thị cảnh báo 'Please select a rating' và không gửi review khi submit review mà không chọn rating.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/ và mở tab 'Reviews (0)'",
"Không chọn số sao ở 'Your rating'",
"Nhập 'Your review' = 'Sản phẩm tốt', 'Name' = 'Tester', 'Email' = 'tester@test.com'",
"Click nút 'Submit'",
"Kiểm tra hiển thị cảnh báo 'Please select a rating' và review không được gửi"
],
"er": [
"Hiển thị cảnh báo 'Please select a rating', không gửi review"
]
},
"PDP-TC020": {
"summary": "Kiểm tra báo lỗi bắt buộc nhập review khi submit review với nội dung để trống.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/ và mở tab 'Reviews (0)'",
"Chọn 5 sao ở 'Your rating'",
"Để trống ô 'Your review'",
"Nhập 'Name' = 'Tester', 'Email' = 'tester@test.com'",
"Click nút 'Submit'",
"Kiểm tra hiển thị lỗi bắt buộc nhập review và review không được gửi"
],
"er": [
"Báo lỗi bắt buộc nhập review"
]
},
"PDP-TC021": {
"summary": "Kiểm tra báo lỗi bắt buộc nhập Name/Email khi submit review mà bỏ trống Name và Email.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/ và mở tab 'Reviews (0)'",
"Chọn 5 sao ở 'Your rating'",
"Nhập 'Your review' = 'Sản phẩm tốt'",
"Để trống 'Name' và 'Email'",
"Click nút 'Submit'",
"Kiểm tra hiển thị lỗi bắt buộc nhập Name/Email và review không được gửi"
],
"er": [
"Báo lỗi bắt buộc nhập Name/Email"
]
},
"PDP-TC022": {
"summary": "Kiểm tra báo lỗi email không hợp lệ khi submit review với email 'abc'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/ và mở tab 'Reviews (0)'",
"Chọn 5 sao ở 'Your rating'",
"Nhập 'Your review' = 'Sản phẩm tốt', 'Name' = 'Tester'",
"Nhập 'Email' = 'abc'",
"Click nút 'Submit'",
"Kiểm tra hiển thị lỗi email không hợp lệ và review không được gửi"
],
"er": [
"Báo lỗi email không hợp lệ"
]
},
"PDP-TC023": {
"summary": "Kiểm tra review được gửi thành công (chờ duyệt hoặc hiển thị ngay) khi submit review hợp lệ với rating 5 sao.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/ và mở tab 'Reviews (0)'",
"Chọn 5 sao ở 'Your rating'",
"Nhập 'Your review' = 'Sản phẩm chất lượng tốt', 'Name' = 'Tester', 'Email' = 'tester@test.com'",
"Click nút 'Submit'",
"Kiểm tra review được gửi thành công, hiển thị trạng thái chờ duyệt hoặc hiển thị ngay trong danh sách review"
],
"er": [
"Review được gửi, hiển thị trạng thái chờ duyệt hoặc hiển thị review"
]
},
"PDP-TC024": {
"summary": "Kiểm tra script không chạy và nội dung được escape khi submit review chứa '<script>alert(1)</script>'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/ và mở tab 'Reviews (0)'",
"Chọn 5 sao ở 'Your rating'",
"Nhập 'Your review' = '<script>alert(1)</script>', 'Name' = 'Tester', 'Email' = 'tester@test.com'",
"Click nút 'Submit'",
"Quan sát: không xuất hiện hộp thoại alert",
"Kiểm tra nội dung (nếu được hiển thị) được escape thành văn bản thường"
],
"er": [
"Script không chạy, nội dung được escape"
]
},
"PDP-TC025": {
"summary": "Kiểm tra mục Related products hiển thị sản phẩm cùng category và click mở đúng trang chi tiết.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/bold-statement-graphic-tee/",
"Cuộn xuống mục 'Related products'",
"Kiểm tra các sản phẩm hiển thị thuộc cùng category với sản phẩm hiện tại",
"Click vào một sản phẩm liên quan",
"Kiểm tra mở đúng trang chi tiết của sản phẩm đó (tên và giá khớp)"
],
"er": [
"Hiển thị sản phẩm liên quan (cùng category), click mở đúng trang chi tiết"
]
},
"PDP-TC026": {
"summary": "Kiểm tra ảnh sản phẩm hiển thị rõ nét, không bị mờ khi mở trang chi tiết sản phẩm.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Click vào một sản phẩm bất kỳ (VD: Bold Statement Graphic Tee)",
"Chờ trang chi tiết tải xong hoàn toàn",
"Quan sát ảnh chính và các ảnh thumbnail của sản phẩm",
"Click phóng to ảnh (nếu có) và kiểm tra độ nét",
"Lặp lại với 2 sản phẩm khác"
],
"er": [
"Ảnh sản phẩm hiển thị rõ nét, không bị mờ hoặc vỡ hạt"
]
},
"PDP-TC027": {
"summary": "Kiểm tra các sản phẩm có thể vào được trang chi tiết sản phẩm.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Click vào sản phẩm bất kỳ",
"Chờ trang chi tiết xuất hiện."
],
"er": [
"Có thể truy cập mọi trang chi tiết"
]
},
"PDP-TC028": {
"summary": "Kiểm tra ảnh ở trang chi tiết sản phẩm có alt text",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/shop/sunset-glow-utility-dress/",
"Kiểm tra thuộc tính alt của ảnh trong gallery"
],
"er": [
"Mọi ảnh đều có alt"
]
},
"PDP-TC029": {
"summary": "Kiểm tra submit review nhiều lần bằng Playwright",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Click vào một sản phẩm bất kỳ (VD: Bold Statement Graphic Tee)",
"Review và bấm submit liên tục"
],
"er": [
"Chỉ review 1 lần duy nhất"
]
},
"PDP-TC030": {
"summary": "Kiểm tra chức năng tìm kiếm ở trong shop",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Click vào ô tìm kiếm",
"Tìm kiếm 1 item bất kỳ (VD: dress)",
"Bấm enter"
],
"er": [
"Kết quả tìm kiếm trả về những vật phẩm nào có 'dress' trong tên"
]
},
"PDP-TC031": {
"summary": "Kiểm tra các sản phẩm để đúng ảnh ",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Click vào sản phẩm bất kỳ"
],
"er": [
"Các sản phẩm để đúng hình của sản phẩm"
]
},
"PDP-TC032": {
"summary": "Kiểm tra thông báo khi thêm vào giỏ hàng",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Click vào sản phẩm bất kỳ",
"Click vào add to cart"
],
"er": [
"Thông báo \"has been added to your cart\""
]
},
"PDP-TC033": {
"summary": "Kiểm tra request thêm vào giỏ hàng bằng F5",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Click vào sản phẩm bất kỳ",
"Click vào add to cart",
"Load lại trang"
],
"er": [
"Chỉ load lại trang và không có gì xảy ra"
]
},
"CART-TC001": {
"summary": "Kiểm tra hiển thị 'Your cart is currently empty.' khi mở trang giỏ hàng lúc giỏ hàng rỗng.",
"pre": "Giỏ hàng rỗng",
"steps": [
"Đảm bảo giỏ hàng rỗng",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Kiểm tra hiển thị thông báo 'Your cart is currently empty.'"
],
"er": [
"Hiển thị 'Your cart is currently empty.'"
]
},
"CART-TC002": {
"summary": "Kiểm tra chuyển tới /shop/ khi click nút 'Return to shop' ở giỏ hàng rỗng.",
"pre": "Giỏ hàng rỗng",
"steps": [
"Đảm bảo giỏ hàng rỗng",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Click nút 'Return to shop'",
"Chờ trang tải xong và kiểm tra URL chuyển tới /shop/"
],
"er": [
"Chuyển tới /shop/"
]
},
"CART-TC003": {
"summary": "Kiểm tra giỏ hàng hiển thị ảnh, tên, đơn giá $15.00, quantity 1 và subtotal $15.00 khi đã thêm 'Bold Statement Graphic Tee' (1).",
"pre": "Đã add 'Bold Statement Graphic Tee' (1)",
"steps": [
"Đảm bảo giỏ hàng chỉ có 'Bold Statement Graphic Tee' với quantity = 1",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Kiểm tra dòng sản phẩm có ảnh và tên 'Bold Statement Graphic Tee'",
"Kiểm tra đơn giá $15.00, quantity 1, subtotal $15.00"
],
"er": [
"Hiển thị ảnh, tên, đơn giá $15.00, quantity 1, subtotal $15.00"
]
},
"CART-TC004": {
"summary": "Kiểm tra đơn giá trong giỏ là giá sale $15.00, không dùng giá gốc khi thêm sản phẩm đang sale.",
"pre": "Đã add sản phẩm sale",
"steps": [
"Thêm 'Bold Statement Graphic Tee' (giá gốc $18.00, giá sale $15.00) vào giỏ",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Đọc đơn giá của sản phẩm trong giỏ",
"Kiểm tra đơn giá là $15.00 (giá sale), không phải $18.00"
],
"er": [
"Đơn giá = giá sale ($15.00), không dùng giá gốc"
]
},
"CART-TC005": {
"summary": "Kiểm tra Subtotal và Total đều là $15.00 trong Cart totals khi giỏ có 'Bold Statement Graphic Tee' (1) và chưa có phí khác.",
"pre": "Đã add 'Bold Statement Graphic Tee' (1)",
"steps": [
"Đảm bảo giỏ hàng chỉ có 'Bold Statement Graphic Tee' với quantity = 1",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Cuộn tới khối 'Cart totals'",
"Kiểm tra Subtotal = $15.00 và Total = $15.00"
],
"er": [
"Subtotal = Total = $15.00 (khi chưa có phí khác)"
]
},
"CART-TC006": {
"summary": "Kiểm tra Subtotal = $60.00 khi giỏ có Bold Statement Graphic Tee (1) và Floral Elegance Sun Hat (1).",
"pre": "Đã add Bold Tee (1) và Floral Elegance Sun Hat (1)",
"steps": [
"Thêm 'Bold Statement Graphic Tee' (1) vào giỏ",
"Thêm 'Floral Elegance Sun Hat' (1) vào giỏ",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Kiểm tra giỏ có 2 dòng sản phẩm",
"Kiểm tra Subtotal = $60.00 ($15.00 + $45.00)"
],
"er": [
"Subtotal = $60.00"
]
},
"CART-TC007": {
"summary": "Kiểm tra chuyển tới trang chi tiết đúng sản phẩm khi click tên sản phẩm trong giỏ.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm bất kỳ vào giỏ (ví dụ: Bold Statement Graphic Tee)",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Click vào tên sản phẩm trong giỏ",
"Kiểm tra chuyển tới trang chi tiết đúng sản phẩm vừa click"
],
"er": [
"Chuyển tới trang chi tiết sản phẩm"
]
},
"CART-TC008": {
"summary": "Kiểm tra nút 'Update cart' bị vô hiệu (disabled) khi chưa chỉnh sửa gì trong giỏ.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Không thay đổi bất kỳ giá trị nào",
"Kiểm tra nút 'Update cart' ở trạng thái disabled"
],
"er": [
"Nút 'Update cart' disabled"
]
},
"CART-TC009": {
"summary": "Kiểm tra hiển thị 'Cart updated.' và Subtotal = $45.00 khi cập nhật số lượng từ 1 lên 3.",
"pre": "Đã add Bold Tee (1)",
"steps": [
"Đảm bảo giỏ hàng có 'Bold Statement Graphic Tee' với quantity = 1",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Nhập quantity = 3",
"Click nút 'Update cart'",
"Kiểm tra hiển thị thông báo 'Cart updated.'",
"Kiểm tra Subtotal = $45.00"
],
"er": [
"Subtotal = $45.00, hiển thị thông báo 'Cart updated.'"
]
},
"CART-TC010": {
"summary": "Kiểm tra Subtotal = $15.00 khi giảm số lượng từ 3 xuống 1.",
"pre": "Đã add Bold Tee (3)",
"steps": [
"Đảm bảo giỏ hàng có 'Bold Statement Graphic Tee' với quantity = 3",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Nhập quantity = 1",
"Click nút 'Update cart'",
"Kiểm tra Subtotal = $15.00 và quantity hiển thị 1"
],
"er": [
"Subtotal = $15.00"
]
},
"CART-TC011": {
"summary": "Kiểm tra sản phẩm bị xóa và giỏ hàng rỗng khi cập nhật quantity = 0.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Nhập quantity = 0",
"Click nút 'Update cart'",
"Kiểm tra sản phẩm bị xóa khỏi giỏ và hiển thị giỏ hàng rỗng"
],
"er": [
"Sản phẩm bị xóa, giỏ hàng rỗng"
]
},
"CART-TC012": {
"summary": "Kiểm tra giá trị không hợp lệ bị từ chối và giỏ hàng không đổi khi cập nhật quantity âm (-2).",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ (quantity = 1)",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Nhập quantity = -2",
"Click nút 'Update cart'",
"Kiểm tra giá trị không hợp lệ bị từ chối, quantity và tổng tiền không thay đổi"
],
"er": [
"Không cập nhật, giá trị không hợp lệ bị từ chối"
]
},
"CART-TC013": {
"summary": "Kiểm tra hệ thống xử lý hoặc báo lỗi hợp lệ, tổng tiền đúng, không lỗi 500 khi cập nhật quantity 99999.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Nhập quantity = 99999",
"Click nút 'Update cart'",
"Kiểm tra không có lỗi 500",
"Kiểm tra hệ thống xử lý hoặc báo lỗi hợp lệ, và tổng tiền (nếu cập nhật) = 99999 x đơn giá"
],
"er": [
"Hệ thống xử lý/báo lỗi hợp lệ, tổng tiền đúng, không lỗi 500"
]
},
"CART-TC014": {
"summary": "Kiểm tra sản phẩm bị xóa và hiển thị thông báo 'removed' kèm link Undo khi click nút xóa (×).",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Click nút xóa (×) ở dòng sản phẩm",
"Kiểm tra sản phẩm bị xóa khỏi giỏ",
"Kiểm tra hiển thị thông báo 'removed' kèm link 'Undo'"
],
"er": [
"Sản phẩm bị xóa, hiển thị thông báo 'removed' và link Undo"
]
},
"CART-TC015": {
"summary": "Kiểm tra sản phẩm được khôi phục vào giỏ khi click 'Undo' sau khi xóa sản phẩm.",
"pre": "Vừa xóa 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ, truy cập https://actp1.csc.edu.vn/cart/",
"Click nút xóa (×) để xóa sản phẩm",
"Click link 'Undo' trong thông báo",
"Kiểm tra sản phẩm xuất hiện lại trong giỏ với quantity và giá như trước khi xóa"
],
"er": [
"Sản phẩm được khôi phục vào giỏ"
]
},
"CART-TC016": {
"summary": "Kiểm tra hiển thị 'Please enter a coupon code.' khi click 'Apply coupon' với ô coupon để trống.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Để trống ô 'Coupon code'",
"Click nút 'Apply coupon'",
"Kiểm tra hiển thị thông báo 'Please enter a coupon code.'"
],
"er": [
"Hiển thị 'Please enter a coupon code.'"
]
},
"CART-TC017": {
"summary": "Kiểm tra hiển thị lỗi coupon không tồn tại và tổng tiền không đổi khi áp dụng coupon 'INVALID123'.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ, ghi lại tổng tiền hiện tại",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Nhập 'INVALID123' vào ô 'Coupon code'",
"Click nút 'Apply coupon'",
"Kiểm tra hiển thị lỗi coupon không tồn tại",
"Kiểm tra tổng tiền không thay đổi so với trước"
],
"er": [
"Hiển thị lỗi coupon không tồn tại, tổng tiền không đổi"
]
},
"CART-TC018": {
"summary": "Kiểm tra áp dụng thành công và tổng tiền giảm đúng khi áp dụng coupon hợp lệ.",
"pre": "Đã add 1 sản phẩm; có mã coupon hợp lệ (cần PO cung cấp)",
"steps": [
"Chuẩn bị mã coupon hợp lệ (do PO cung cấp)",
"Thêm 1 sản phẩm vào giỏ, ghi lại tổng tiền trước khi áp dụng",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Nhập mã coupon hợp lệ vào ô 'Coupon code'",
"Click nút 'Apply coupon'",
"Kiểm tra hiển thị thông báo áp dụng thành công",
"Kiểm tra tổng tiền giảm đúng theo quy tắc của coupon"
],
"er": [
"Áp dụng thành công, tổng tiền giảm đúng"
]
},
"CART-TC019": {
"summary": "Kiểm tra sản phẩm và số lượng vẫn còn trong giỏ khi reload trang giỏ hàng.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ với quantity = 2",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Reload trang (F5)",
"Kiểm tra sản phẩm và quantity = 2 vẫn còn trong giỏ"
],
"er": [
"Sản phẩm và số lượng vẫn còn"
]
},
"CART-TC020": {
"summary": "Kiểm tra chuyển tới /checkout/ khi click nút 'Proceed to checkout'.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Cuộn tới khối 'Cart totals'",
"Click nút 'Proceed to checkout'",
"Chờ trang tải xong và kiểm tra URL chuyển tới /checkout/"
],
"er": [
"Chuyển tới /checkout/"
]
},
"CART-TC021": {
"summary": "Kiểm tra sản phẩm đã thêm khi còn là guest vẫn còn trong giỏ sau khi đăng nhập.",
"pre": "Guest đã add 1 sản phẩm; có tài khoản",
"steps": [
"Khi chưa đăng nhập (guest), thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/my-account/",
"Đăng nhập bằng tài khoản hợp lệ",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Kiểm tra sản phẩm đã thêm khi còn là guest vẫn còn trong giỏ"
],
"er": [
"Sản phẩm vẫn còn trong giỏ"
]
},
"CART-TC022": {
"summary": "Kiểm tra Subtotal ở mini cart (rê chuột vào icon giỏ hàng) đúng tổng giá trị sau khi tải lại trang.",
"pre": "Giỏ hàng rỗng",
"steps": [
"Thêm 'Bold Statement Graphic Tee' ($15.00) và 'Floral Elegance Sun Hat' ($45.00) vào giỏ hàng",
"Truy cập https://actp1.csc.edu.vn/shop/ rồi tải lại trang (F5)",
"Rê chuột vào icon Cart trên header",
"Đọc giá trị Subtotal trong mini cart"
],
"er": [
"Subtotal ở mini cart là $60.00, đúng tổng giá trị các sản phẩm trong giỏ hàng"
]
},
"CART-TC023": {
"summary": "Kiểm tra tổng giá trị giỏ hàng tính đúng khi số lượng sản phẩm rất lớn.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 'Bold Statement Graphic Tee' ($15.00) vào giỏ hàng",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Nhập số lượng 99999999999999 vào ô quantity",
"Click nút 'Update cart'",
"Quan sát tổng giá trị (Subtotal/Total) của giỏ hàng"
],
"er": [
"Tổng giá trị bằng số lượng x $15.00 (không bị giới hạn ở mức 1.000.000.000.000.000) hoặc hệ thống báo lỗi giới hạn số lượng"
]
},
"CART-TC024": {
"summary": "Kiểm tra thêm/cập nhật số lượng khi ô số lượng có dấu cách ở đầu hoặc cuối.",
"pre": "Giỏ hàng có 1 sản phẩm",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/, chọn một sản phẩm",
"Nhập số lượng “ 2” (dấu cách đầu), bấm “Add to cart”, quan sát giỏ hàng",
"Lặp lại với số lượng “2 “ (dấu cách cuối)",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Nhập số lượng “ 2” rồi “2 “ vào ô số lượng của sản phẩm, bấm “Update cart” sau mỗi lần",
"Quan sát số lượng trong giỏ hàng"
],
"er": [
"Dấu cách thừa được bỏ qua, sản phẩm được thêm/cập nhật đúng số lượng 2 (hoặc có thông báo lỗi rõ ràng)"
]
},
"CART-TC025": {
"summary": "Kiểm tra thông báo sau khi xóa sản phẩm khỏi giỏ hàng hiển thị đúng, không lẫn mã HTML.",
"pre": "Giỏ hàng có 1 sản phẩm",
"steps": [
"Truy cập https://actp1.csc.edu.vn/cart/",
"Bấm nút xóa (x) ở sản phẩm trong giỏ hàng",
"Quan sát nội dung thông báo"
],
"er": [
"Thông báo chỉ hiển thị ““<tên sản phẩm>” removed. Undo?” không có thẻ HTML thừa"
]
},
"CHK-TC001": {
"summary": "Kiểm tra hiển thị thông báo giỏ hàng rỗng và không cho đặt hàng khi truy cập /checkout/ lúc giỏ hàng rỗng.",
"pre": "Giỏ hàng rỗng",
"steps": [
"Đảm bảo giỏ hàng rỗng",
"Truy cập trực tiếp https://actp1.csc.edu.vn/checkout/",
"Kiểm tra hiển thị thông báo giỏ hàng rỗng hoặc chuyển hướng về giỏ hàng",
"Kiểm tra không có form đặt hàng hoặc nút 'Place order'"
],
"er": [
"Hiển thị thông báo giỏ hàng rỗng / không cho đặt hàng"
]
},
"CHK-TC002": {
"summary": "Kiểm tra trang checkout hiển thị Billing details, Your order, phương thức thanh toán và nút Place order khi giỏ hàng có sản phẩm.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/checkout/",
"Kiểm tra có khối 'Billing details'",
"Kiểm tra có khối 'Your order'",
"Kiểm tra có phương thức thanh toán và nút 'Place order'"
],
"er": [
"Hiển thị Billing details, Your order, phương thức thanh toán, nút Place order"
]
},
"CHK-TC003": {
"summary": "Kiểm tra link 'Returning customer? Click here to login' hiển thị và mở form login khi click, lúc chưa đăng nhập.",
"pre": "Đã add 1 sản phẩm, chưa đăng nhập",
"steps": [
"Thêm 1 sản phẩm vào giỏ khi chưa đăng nhập",
"Truy cập https://actp1.csc.edu.vn/checkout/",
"Kiểm tra hiển thị link 'Returning customer? Click here to login'",
"Click vào link",
"Kiểm tra form đăng nhập được mở ra"
],
"er": [
"Hiển thị link đăng nhập, click mở form login"
]
},
"CHK-TC004": {
"summary": "Kiểm tra báo lỗi các trường bắt buộc khi click 'Place order' mà không nhập thông tin nào.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/checkout/",
"Không nhập bất kỳ thông tin nào ở phần Billing details",
"Click nút 'Place order'",
"Kiểm tra báo lỗi các trường bắt buộc (First name, Last name, Address, City, Phone, Email...)"
],
"er": [
"Báo lỗi các trường bắt buộc (First name, Last name, Address, City, Phone, Email...)"
]
},
"CHK-TC005": {
"summary": "Kiểm tra báo lỗi email không hợp lệ khi click 'Place order' với email 'abc'.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/checkout/",
"Nhập đầy đủ và hợp lệ các trường bắt buộc khác trong Billing details",
"Nhập 'Email address' = 'abc'",
"Click nút 'Place order'",
"Kiểm tra báo lỗi email không hợp lệ"
],
"er": [
"Báo lỗi email không hợp lệ"
]
},
"CHK-TC006": {
"summary": "Kiểm tra báo lỗi số điện thoại không hợp lệ khi click 'Place order' với số điện thoại 'abcdef'.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/checkout/",
"Nhập đầy đủ và hợp lệ các trường bắt buộc khác trong Billing details",
"Nhập 'Phone' = 'abcdef'",
"Click nút 'Place order'",
"Kiểm tra báo lỗi số điện thoại không hợp lệ"
],
"er": [
"Báo lỗi số điện thoại không hợp lệ"
]
},
"CHK-TC007": {
"summary": "Kiểm tra báo lỗi postcode không hợp lệ khi click 'Place order' với Country = United States và postcode 'abc'.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/checkout/",
"Chọn 'Country / Region' = 'United States (US)'",
"Nhập đầy đủ và hợp lệ các trường bắt buộc khác trong Billing details",
"Nhập 'ZIP Code / Postcode' = 'abc'",
"Click nút 'Place order'",
"Kiểm tra báo lỗi postcode không hợp lệ"
],
"er": [
"Báo lỗi postcode không hợp lệ"
]
},
"CHK-TC008": {
"summary": "Kiểm tra script không thực thi, dữ liệu được escape hoặc bị từ chối khi click 'Place order' với First name chứa mã XSS.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/checkout/",
"Nhập 'First name' = '<script>alert(1)</script>'",
"Nhập đầy đủ và hợp lệ các trường bắt buộc khác trong Billing details",
"Click nút 'Place order'",
"Quan sát: không xuất hiện hộp thoại alert",
"Kiểm tra dữ liệu được escape hoặc bị từ chối"
],
"er": [
"Script không thực thi; dữ liệu được escape/từ chối"
]
},
"CHK-TC009": {
"summary": "Kiểm tra khối Your order hiển thị 'Bold Statement Graphic Tee × 2' và Subtotal/Total = $30.00.",
"pre": "Đã add Bold Tee (2)",
"steps": [
"Thêm 'Bold Statement Graphic Tee' với quantity = 2 vào giỏ",
"Truy cập https://actp1.csc.edu.vn/checkout/",
"Cuộn tới khối 'Your order'",
"Kiểm tra sản phẩm hiển thị 'Bold Statement Graphic Tee × 2'",
"Kiểm tra Subtotal và Total = $30.00"
],
"er": [
"Hiển thị Bold Statement Graphic Tee × 2, Subtotal/Total = $30.00"
]
},
"CHK-TC010": {
"summary": "Kiểm tra có ít nhất 1 phương thức thanh toán và chọn được khi xem khối Payment ở trang checkout.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/checkout/",
"Cuộn tới khối thanh toán (Payment)",
"Kiểm tra có ít nhất 1 phương thức thanh toán",
"Click chọn một phương thức và kiểm tra được chọn thành công"
],
"er": [
"Có ít nhất 1 phương thức thanh toán, chọn được"
]
},
"CHK-TC011": {
"summary": "Kiểm tra chuyển tới trang 'Order received' và hiển thị order number khi guest đặt hàng với thông tin billing hợp lệ.",
"pre": "Đã add 1 sản phẩm, chưa đăng nhập",
"steps": [
"Thêm 1 sản phẩm vào giỏ khi chưa đăng nhập",
"Truy cập https://actp1.csc.edu.vn/checkout/",
"Nhập đầy đủ thông tin Billing details hợp lệ (First name, Last name, Country, Address, City, Postcode, Phone, Email)",
"Chọn một phương thức thanh toán",
"Click nút 'Place order'",
"Kiểm tra chuyển tới trang 'Order received' và hiển thị order number"
],
"er": [
"Chuyển tới trang 'Order received', hiển thị order number"
]
},
"CHK-TC012": {
"summary": "Kiểm tra trang Order received hiển thị đủ Order number, Date, Email, Total, Payment method và chi tiết sản phẩm khớp đơn hàng.",
"pre": "Vừa đặt hàng thành công",
"steps": [
"Đặt hàng thành công để tới trang 'Order received'",
"Kiểm tra hiển thị Order number, Date, Email, Total, Payment method",
"Kiểm tra chi tiết sản phẩm (tên, số lượng, giá) khớp với đơn vừa đặt"
],
"er": [
"Hiển thị Order number, Date, Email, Total, Payment method, chi tiết sản phẩm khớp đơn hàng"
]
},
"CHK-TC013": {
"summary": "Kiểm tra giỏ hàng rỗng và Cart = 0 sau khi đặt hàng thành công.",
"pre": "Vừa đặt hàng thành công",
"steps": [
"Đặt hàng thành công",
"Truy cập https://actp1.csc.edu.vn/cart/",
"Kiểm tra giỏ hàng rỗng",
"Kiểm tra icon Cart trên header hiển thị 0"
],
"er": [
"Giỏ hàng rỗng, Cart = 0"
]
},
"CHK-TC014": {
"summary": "Kiểm tra đơn hàng mới hiển thị trong My account > Orders khi đặt hàng lúc đã đăng nhập.",
"pre": "Đã đăng nhập, đã add 1 sản phẩm",
"steps": [
"Đăng nhập bằng tài khoản hợp lệ",
"Thêm 1 sản phẩm vào giỏ",
"Truy cập https://actp1.csc.edu.vn/checkout/, nhập thông tin billing hợp lệ, chọn phương thức thanh toán",
"Click nút 'Place order' và ghi lại order number",
"Truy cập https://actp1.csc.edu.vn/my-account/ và click mục 'Orders'",
"Kiểm tra đơn hàng mới (đúng order number) hiển thị trong danh sách"
],
"er": [
"Đơn hàng mới hiển thị trong danh sách"
]
},
"CHK-TC015": {
"summary": "Kiểm tra ô ghi chú đơn hàng (Order notes) có giới hạn số ký tự ở trang checkout.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Truy cập https://actp1.csc.edu.vn/checkout/",
"Nhập đầy đủ và hợp lệ các trường bắt buộc trong Billing details",
"Nhập chuỗi rất dài (VD: 10000 ký tự) vào ô \"Order notes\"",
"Quan sát giới hạn nhập và kết quả khi click Place order"
],
"er": [
"Ô \"Order notes\" có giới hạn số ký tự (không cho nhập quá giới hạn) và đặt hàng không bị lỗi"
]
},
"CHK-TC016": {
"summary": "Kiểm tra Company name và Apartment được lưu và hiển thị đầy đủ ở chi tiết đơn hàng sau khi đặt hàng.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Truy cập https://actp1.csc.edu.vn/checkout/",
"Nhập đầy đủ và hợp lệ các trường bắt buộc trong Billing details",
"Nhập chuỗi dài (VD: 100 ký tự) vào 'Company name' và chuỗi dài (VD: 60 ký tự) vào 'Apartment, suite, unit'",
"Click nút 'Place order'",
"Ở trang Order received (và My account > Orders > View), xem phần địa chỉ billing"
],
"er": [
"Company name và Apartment hiển thị đầy đủ, đúng nội dung đã nhập trong chi tiết đơn hàng"
]
},
"CHK-TC017": {
"summary": "Kiểm tra hệ thống từ chối mã ZIP của địa chỉ giao hàng không thuộc bang đã chọn.",
"pre": "Đã add 1 sản phẩm",
"steps": [
"Truy cập https://actp1.csc.edu.vn/checkout/ và nhập đầy đủ, hợp lệ Billing details",
"Tick 'Ship to a different address?'",
"Chọn Country = United States (US), State = California",
"Nhập mã ZIP của vùng khác (VD: 10001, mã của New York) và điền các trường bắt buộc còn lại ở Shipping address",
"Click nút 'Place order'",
"Quan sát thông báo hiển thị"
],
"er": [
"Hệ thống báo mã ZIP không hợp lệ với bang đã chọn và không cho đặt hàng"
]
},
"BLOG-TC001": {
"summary": "Kiểm tra mở /blog/ thành công (HTTP 200) khi click 'Blog' trên menu từ trang chủ.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Click mục 'Blog' trên menu",
"Chờ trang tải xong",
"Kiểm tra URL là /blog/ và mã phản hồi HTTP 200 (tab Network của DevTools)"
],
"er": [
"Mở /blog/, HTTP 200"
]
},
"BLOG-TC002": {
"summary": "Kiểm tra trang Blog hiển thị 4 bài viết.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/blog/",
"Cuộn qua toàn bộ danh sách bài viết",
"Đếm số bài viết hiển thị",
"Kiểm tra có đúng 4 bài viết"
],
"er": [
"Có 4 bài viết"
]
},
"BLOG-TC003": {
"summary": "Kiểm tra mỗi bài viết hiển thị ảnh, tiêu đề, 'by actp' và link 'Read More »' với bài có trích đoạn.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/blog/",
"Lần lượt quan sát từng bài viết",
"Kiểm tra mỗi bài có ảnh, tiêu đề và 'by actp'",
"Với bài có trích đoạn, kiểm tra có link 'Read More »'"
],
"er": [
"Mỗi bài có ảnh, tiêu đề, 'by actp'; bài có trích đoạn và link 'Read More »'"
]
},
"BLOG-TC004": {
"summary": "Kiểm tra mở đúng bài viết, hiển thị tiêu đề và nội dung khi click tiêu đề bài viết.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/blog/",
"Ghi lại tiêu đề bài viết đầu tiên",
"Click vào tiêu đề của bài đầu tiên",
"Kiểm tra URL có dạng /2020/10/19/... và mở đúng bài viết",
"Kiểm tra hiển thị tiêu đề khớp và nội dung bài viết"
],
"er": [
"Mở đúng bài viết (/2020/10/19/...), hiển thị tiêu đề và nội dung"
]
},
"BLOG-TC005": {
"summary": "Kiểm tra mở đúng bài viết 'Coastal Escapes...' khi click link 'Read More »'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/blog/",
"Tìm bài viết 'Coastal Escapes...'",
"Click link 'Read More »' của bài này",
"Kiểm tra mở đúng bài viết 'Coastal Escapes...'"
],
"er": [
"Mở đúng bài viết"
]
},
"BLOG-TC006": {
"summary": "Kiểm tra mở đúng bài viết tương ứng khi click ảnh bài viết.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/blog/",
"Chọn một bài viết bất kỳ và ghi lại tiêu đề",
"Click vào ảnh của bài viết đó",
"Kiểm tra mở đúng bài viết có tiêu đề đã ghi"
],
"er": [
"Mở đúng bài viết"
]
},
"BLOG-TC007": {
"summary": "Kiểm tra chuyển tới /author/actp/ và liệt kê bài viết khi click tên tác giả 'actp'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/blog/",
"Click vào tên tác giả 'actp' ở một bài viết",
"Chờ trang tải xong và kiểm tra URL chuyển tới /author/actp/",
"Kiểm tra trang liệt kê các bài viết của tác giả"
],
"er": [
"Chuyển tới /author/actp/ và liệt kê bài viết"
]
},
"BLOG-TC008": {
"summary": "Kiểm tra hiển thị trang 404 khi truy cập bài viết không tồn tại /2020/10/19/khong-ton-tai/.",
"pre": "",
"steps": [
"Truy cập trực tiếp https://actp1.csc.edu.vn/2020/10/19/khong-ton-tai/",
"Chờ trang tải xong",
"Kiểm tra hiển thị trang 404"
],
"er": [
"Hiển thị trang 404"
]
},
"BLOG-TC009": {
"summary": "Kiểm tra không có lỗi chính tả ở tiêu đề và nội dung các bài viết trên Blog.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/blog/",
"Đọc kỹ tiêu đề và đoạn trích của 4 bài viết trên trang danh sách",
"Mở từng bài viết và đọc toàn bộ nội dung",
"Ghi lại các lỗi chính tả (nếu có) và kiểm tra không có lỗi nào"
],
"er": [
"Không có lỗi chính tả"
]
},
"BLOG-TC010": {
"summary": "Kiểm tra ảnh bài viết ở trang Blog có alt text",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/blog/",
"Kiểm tra thuộc tính alt của ảnh trong các bài viết"
],
"er": [
"Mọi ảnh đều có alt"
]
},
"BLOG-TC011": {
"summary": "Kiểm web chuyển hướng sang bài viết khi click vào bài viết trên trang chủ blog",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/blog/",
"Click vào 1 bài viết bất kỳ"
],
"er": [
"Mọi bài viết đều có thể truy cập và đọc chi tiết"
]
},
"BLOG-TC012": {
"summary": "Kiểm tra chức năng comment của blog ",
"pre": "",
"steps": [
"Mở https://actp1.csc.edu.vn/blog/",
"Click vào 1 bài viết bất kỳ",
"Kéo xuống dưới cùng trang bài viết",
"Nhập thông tin và comment vào bài viết"
],
"er": [
"Cho phép để lại ý kiến, đánh giá"
]
},
"BLOG-TC013": {
"summary": "Kiểm tra mọi bài viết ở trang Blog đều có link 'Read More '.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/blog/",
"Quan sát từng bài viết trong danh sách",
"Kiểm tra mỗi bài có link 'Read More '"
],
"er": [
"Cả 4 bài viết đều có link 'Read More'"
]
},
"BLOG-TC014": {
"summary": "Kiểm tra các link \"Edit your profile\" và \"Log out?\" ở khung bình luận có dấu hiệu nhận biết là link.",
"pre": "Đã đăng nhập",
"steps": [
"Truy cập một bài viết ở https://actp1.csc.edu.vn/blog/",
"Cuộn xuống phần \"Leave a Reply\"",
"Quan sát dòng \"Logged in as ... Edit your profile. Log out?\" và rê chuột vào từng link"
],
"er": [
"Các link có dấu hiệu nhận biết (đổi màu, gạch chân hoặc hiệu ứng khi rê chuột)"
]
},
"BLOG-TC015": {
"summary": "Kiểm tra link \"Edit your profile\" ở khung bình luận mở đúng trang Account details.",
"pre": "Đã đăng nhập",
"steps": [
"Truy cập một bài viết ở https://actp1.csc.edu.vn/blog/",
"Cuộn xuống phần \"Leave a Reply\"",
"Click link \"Edit your profile\"",
"Quan sát trang được mở"
],
"er": [
"Chuyển tới trang Account details (https://actp1.csc.edu.vn/my-account/edit-account/)"
]
},
"SRCH-TC001": {
"summary": "Kiểm tra hiển thị ô nhập 'Search for...' khi click icon tìm kiếm.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/",
"Click icon tìm kiếm trên header",
"Kiểm tra hiển thị ô nhập có placeholder 'Search for...'"
],
"er": [
"Hiển thị ô nhập 'Search for...'"
]
},
"SRCH-TC002": {
"summary": "Kiểm tra ô tìm kiếm đóng lại khi click nút 'Close'.",
"pre": "Ô tìm kiếm đang mở",
"steps": [
"Truy cập https://actp1.csc.edu.vn/ và click icon tìm kiếm để mở ô tìm kiếm",
"Click nút 'Close'",
"Kiểm tra ô tìm kiếm đóng lại"
],
"er": [
"Ô tìm kiếm đóng lại"
]
},
"SRCH-TC003": {
"summary": "Kiểm tra hiển thị 4 sản phẩm có 'Dress' trong tên khi tìm từ khóa 'dress'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/ và click icon tìm kiếm",
"Nhập 'dress' vào ô tìm kiếm",
"Nhấn Enter",
"Chờ trang kết quả tải xong",
"Kiểm tra hiển thị 4 sản phẩm có 'Dress' trong tên"
],
"er": [
"Hiển thị các sản phẩm có 'Dress' trong tên (4 sản phẩm)"
]
},
"SRCH-TC004": {
"summary": "Kiểm tra kết quả giống tìm 'dress' (không phân biệt hoa thường) khi tìm từ khóa 'DRESS'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/ và click icon tìm kiếm",
"Nhập 'DRESS' vào ô tìm kiếm",
"Nhấn Enter",
"So sánh kết quả với kết quả khi tìm 'dress' (SRCH-TC003) và kiểm tra giống nhau"
],
"er": [
"Kết quả giống tìm 'dress'"
]
},
"SRCH-TC005": {
"summary": "Kiểm tra hiển thị các sản phẩm có 'Tee' trong tên khi tìm từ khóa một phần 'Tee'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/ và click icon tìm kiếm",
"Nhập 'Tee' vào ô tìm kiếm",
"Nhấn Enter",
"Kiểm tra tất cả sản phẩm hiển thị đều có 'Tee' trong tên"
],
"er": [
"Hiển thị các sản phẩm có 'Tee' trong tên"
]
},
"SRCH-TC006": {
"summary": "Kiểm tra hiển thị thông báo không tìm thấy kết quả khi tìm từ khóa không tồn tại 'zzzxxyy'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/ và click icon tìm kiếm",
"Nhập 'zzzxxyy' vào ô tìm kiếm",
"Nhấn Enter",
"Kiểm tra hiển thị thông báo không tìm thấy kết quả và không có sản phẩm nào"
],
"er": [
"Hiển thị thông báo không tìm thấy kết quả"
]
},
"SRCH-TC007": {
"summary": "Kiểm tra không lỗi, hiển thị trang kết quả rỗng hoặc ở lại trang khi submit tìm kiếm với từ khóa để trống.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/ và click icon tìm kiếm",
"Để trống ô tìm kiếm",
"Nhấn Enter",
"Kiểm tra không có lỗi; hệ thống hiển thị trang kết quả rỗng hoặc ở lại trang hiện tại"
],
"er": [
"Không lỗi; hiển thị trang kết quả rỗng hoặc ở lại trang"
]
},
"SRCH-TC008": {
"summary": "Kiểm tra kết quả giống tìm 'dress' khi từ khóa có khoảng trắng ở đầu/cuối.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/ và click icon tìm kiếm",
"Nhập '  dress  ' (2 khoảng trắng ở đầu và cuối) vào ô tìm kiếm",
"Nhấn Enter",
"So sánh kết quả với kết quả khi tìm 'dress' (SRCH-TC003) và kiểm tra giống nhau"
],
"er": [
"Kết quả giống tìm 'dress'"
]
},
"SRCH-TC009": {
"summary": "Kiểm tra script không chạy và từ khóa được escape trên trang kết quả khi tìm '<script>alert(1)</script>'.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/ và click icon tìm kiếm",
"Nhập '<script>alert(1)</script>' vào ô tìm kiếm",
"Nhấn Enter",
"Quan sát: không xuất hiện hộp thoại alert",
"Kiểm tra từ khóa hiển thị trên trang kết quả được escape thành văn bản thường"
],
"er": [
"Script không chạy; từ khóa được escape trong trang kết quả"
]
},
"SRCH-TC010": {
"summary": "Kiểm tra không lỗi 500 và hiển thị không có kết quả khi tìm chuỗi 1000 ký tự.",
"pre": "",
"steps": [
"Chuẩn bị chuỗi 1000 ký tự (ví dụ: 'a' lặp 1000 lần)",
"Truy cập https://actp1.csc.edu.vn/ và click icon tìm kiếm",
"Dán chuỗi vào ô tìm kiếm",
"Nhấn Enter",
"Kiểm tra không có lỗi 500 và hiển thị không có kết quả"
],
"er": [
"Không lỗi 500, hiển thị không có kết quả"
]
},
"SRCH-TC011": {
"summary": "Kiểm tra sau khi nhập ký tự đặc biệt, thanh tìm kiếm có bị ảnh hưởng gì không",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/ và click icon tìm kiếm",
"Nhập 1 ký tự đặc biệt bất kỳ (VD: /, -,...)",
"Nhấn Enter"
],
"er": [
"Không lỗi thanh tìm kiếm, vẫn cho tìm kiếm"
]
},
"SRCH-TC012": {
"summary": "Kiểm tra tìm kiếm ra đúng kết quả mong đợi",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/ và click icon tìm kiếm",
"Tìm kiếm 1 vật phẩm bất kỳ (VD: dress)",
"Nhấn enter"
],
"er": [
"Kết quả tìm kiếm cho ra những vật phẩm nào có \"dress\" trong tên"
]
},
"SRCH-TC013": {
"summary": "Kiểm tra bấm vào tên người tạo ở kết quả tìm kiếm sản phẩm.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Nhập từ khóa của một sản phẩm có sẵn (VD: \"Dress\") vào ô tìm kiếm và tìm",
"Ở kết quả tìm được, click vào tên người tạo"
],
"er": [
"Hiển thị nội dung phù hợp với ngữ cảnh sản phẩm (hoặc không có link nếu không cần thiết)"
]
},
"SRCH-TC014": {
"summary": "Kiểm tra tìm kiếm khi để trống ô tìm kiếm.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Để trống ô tìm kiếm",
"Click nút tìm kiếm (hoặc nhấn Enter)"
],
"er": [
"Không tìm kiếm khi ô trống (hoặc có thông báo yêu cầu nhập từ khóa), không hiển thị \"Search results for “”\""
]
},
"SRCH-TC015": {
"summary": "Kiểm tra từ khóa tìm kiếm có khoảng trắng ở đầu và cuối được cắt bỏ.",
"pre": "",
"steps": [
"Truy cập https://actp1.csc.edu.vn/shop/",
"Nhập \"dress\" và tìm kiếm, ghi lại kết quả",
"Nhập \" dress \" (có dấu cách đầu và cuối) và tìm kiếm, so sánh kết quả"
],
"er": [
"Hệ thống bỏ khoảng trắng thừa, kết quả giống khi tìm \"dress\""
]
}
};
