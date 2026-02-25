export interface ForgetPasswordRequest {
  email: string;
}

export interface ForgetPasswordResponse {
  message: string;
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  redirectTo: string;
}

export interface ResendForgetPasswordOTPRequest {
  email: string;
}

export interface ResendForgetPasswordOTPResponse {
  message: string;
  email: string;
}
