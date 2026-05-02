import type { ActiveBranch } from '@features/customer/home/types/branch';
import type { RecommendedBranch } from '@features/customer/chatbot/types/chatbot';

export const mapRecommendedBranchToActiveBranch = (
  branch: RecommendedBranch
): ActiveBranch => ({
  branchId: branch.branchId,
  vendorId: branch.vendorId,
  vendorName: branch.vendorName,
  name: branch.name,
  addressDetail: branch.addressDetail,
  city: branch.city,
  ward: branch.ward,
  avgRating: branch.avgRating,
  distanceKm: branch.distanceKm,
  finalScore: branch.finalScore,
  dietaryPreferenceNames: branch.dietaryPreferenceNames,
  dishes: branch.recommendedDishes.map((d) => ({
    dishId: d.dishId,
    name: d.name,
    price: 0,
    isSoldOut: false,
    tasteNames: [],
  })),
  // Fields not present in AI response — filled with safe defaults
  managerId: 0,
  phoneNumber: '',
  email: '',
  lat: 0,
  long: 0,
  createdAt: '',
  updatedAt: null,
  totalReviewCount: 0,
  totalRatingSum: 0,
  isVerified: false,
  isActive: true,
  isSubscribed: false,
  tierId: 0,
  tierName: '',
});
