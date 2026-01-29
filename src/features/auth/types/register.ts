export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface VerifyRegistrationRequest {
  // username: string;
  email: string;
  // password: string;
  otp: string;
}

export interface VerifyRegistrationResponse {
  message: string;
  redirectTo: string;
}

export interface ResendRegistrationOTPRequest {
  email: string;
  username: string;
}

export interface ResendRegistrationOTPResponse {
  message: string;
  email: string;
}

export interface OTPScreenParams {
  username: string;
  email: string;
  password: string;
}
