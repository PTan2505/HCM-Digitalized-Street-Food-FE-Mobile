export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: number;
  createdAt: string;
  emailVerified: boolean;
  point: number;
}
