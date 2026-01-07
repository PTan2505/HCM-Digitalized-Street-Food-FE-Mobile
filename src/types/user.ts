export interface User {
  userId: string;
  id?: number;
  username: string;
  email: string;
  role: string;
  point?: number;
  createdAt?: string;
  emailVerified?: boolean;
}
