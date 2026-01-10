// export const API_ERROR_MESSAGES: Record<string, string> = {
//   ERR_001_VALIDATE_ERROR: '',
//   ERR_002_PERMISSION_DENIED: 'Bạn không có quyền truy cập vào tài nguyên này!',
//   ERR_003_AUTHENTICATION_FAILED: 'Số điện thoại hoặc mật khẩu không đúng!',
//   ERR_004_NOT_AUTHENTICATED: 'Bạn phải đăng nhập để truy cập tài nguyên này!',
//   ERR_404_NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu!',
//   ERR_500_INTERNAL_SERVER_ERROR:
//     'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau!',
// };

export const VALIDATE_ERROR_MESSAGES: Record<string, string> = {
  REQUIRED: 'Trường này là bắt buộc!',
  EMPTY_PHONE_NUMBER: 'Vui lòng nhập số điện thoại!',
  EMPTY_EMAIL: 'Vui lòng nhập email!',
  INVALID_EMAIL: 'Email không hợp lệ!',
  EMPTY_USERNAME: 'Vui lòng nhập tên đăng nhập!',
  MIN_USERNAME_LENGTH: 'Tên đăng nhập phải có ít nhất 5 ký tự!',
  MAX_USERNAME_LENGTH: 'Tên đăng nhập không được vượt quá 100 ký tự!',
  EMPTY_PASSWORD: 'Vui lòng nhập mật khẩu!',
  EMPTY_CONFIRM_PASSWORD: 'Vui lòng nhập xác nhận mật khẩu!',
  PASSWORD_MIN_LENGTH: 'Mật khẩu phải có ít nhất 8 ký tự!',
  EMPTY_OTP: 'Vui lòng nhập mã OTP!',
  INVALID_OTP: 'Mã OTP không hợp lệ!',
  EMPTY_NEW_PASSWORD: 'Vui lòng nhập mật khẩu mới!',
  NEW_PASSWORD_MIN_LENGTH: 'Mật khẩu mới phải có ít nhất 6 ký tự!',
  INVALID_PHONE_NUMBER: 'Số điện thoại không hợp lệ!',
  PASSWORD_MISMATCH: 'Mật khẩu không khớp!',
  EMPTY_NAME: 'Vui lòng nhập tên!',
  EMPTY_LAST_NAME: 'Vui lòng nhập họ!',
  INVALID_NAME: 'Tên không hợp lệ!',
  INVALID_LAST_NAME: 'Họ không hợp lệ!',
};
