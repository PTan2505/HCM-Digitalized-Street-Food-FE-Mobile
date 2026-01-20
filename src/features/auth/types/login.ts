import { User } from '@custom-types/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginWithGoogleRequest {
  idToken: string;
}

export interface LoginResponse {
  message?: string;
  token: string;
  user: User;
}
