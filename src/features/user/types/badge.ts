export interface UserBadge {
  badgeId: number;
  badgeName: string;
  iconUrl: string;
  description: string;
  isEarned: boolean;
  earnedAt: string | null;
  isSelected: boolean;
}
