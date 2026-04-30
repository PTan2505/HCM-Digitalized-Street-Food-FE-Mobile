export type RecommendedBranch = {
  branchId: number;
  vendorId: number;
  vendorName: string;
  name: string;
  addressDetail: string;
  city: string;
  ward: string;
  avgRating: number;
  distanceKm: number;
  finalScore: number;
  dietaryPreferenceNames: string[];
  recommendedDishes: { dishId: number; name: string }[];
};

export type AiChatQuery = {
  keyword: string | null;
  lat: number | null;
  long: number | null;
  distanceKm: number | null;
  dietaryIds: number[];
  tasteIds: number[];
  minPrice: number | null;
  maxPrice: number | null;
  categoryIds: number[];
};

export type AiChatResponse = {
  intent: string;
  reply: string;
  query: AiChatQuery;
  matchedBranchCount: number;
  recommendedBranches: RecommendedBranch[];
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  recommendedBranches?: RecommendedBranch[];
};
