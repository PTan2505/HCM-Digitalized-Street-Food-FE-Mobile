export interface User {
  id?: number;
  username: string;
  email: string;
  role: string;
  point?: number;
  createdAt?: string;
  emailVerified?: boolean;
}
