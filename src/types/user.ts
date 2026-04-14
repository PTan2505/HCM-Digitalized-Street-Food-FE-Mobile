export interface User {
  id?: number;
  username: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl?: string;
  role: string;
  point?: number;
  xp?: number;
  tierId?: number;
  createdAt?: string;
  emailVerified?: boolean;
  phoneNumber?: string | null;
  userInfoSetup?: boolean;
  dietarySetup?: boolean;
  moneyBalance?: number;
}
