/**
 * Centralized query-key factory for TanStack React Query.
 *
 * HOW IT WORKS:
 * React Query identifies each cached entry by a unique key (an array).
 * When two components use the same key, they share the same cache entry —
 * meaning only ONE API call is made, and both components receive the data.
 *
 * Keys are hierarchical: ['branches', 'images', 42] is a child of ['branches'].
 * This lets you invalidate all branch-related caches at once with:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.branches.all })
 *
 * NAMING CONVENTION:
 *   queryKeys.<domain>.all        → base key for the domain (used for bulk invalidation)
 *   queryKeys.<domain>.list(...)  → filtered/paginated lists
 *   queryKeys.<domain>.detail(id) → single entity by ID
 */
export const queryKeys = {
  categories: {
    all: ['categories'] as const,
  },

  branches: {
    all: ['branches'] as const,
    list: (filters: {
      lat?: number;
      lng?: number;
      distance?: number;
      dietaryIds?: number[];
      tasteIds?: number[];
      minPrice?: number;
      maxPrice?: number;
      categoryIds?: number[];
      wards?: string[];
    }) => ['branches', 'list', filters] as const,
    detail: (branchId: number) => ['branches', 'detail', branchId] as const,
    images: (branchId: number) => ['branches', 'images', branchId] as const,
    similar: (branchId: number) => ['branches', 'similar', branchId] as const,
    allGhostPins: ['branches', 'allGhostPins'] as const,
  },

  workSchedule: {
    all: ['workSchedule'] as const,
    detail: (branchId: number) => ['workSchedule', branchId] as const,
  },

  dayOffs: {
    all: ['dayOffs'] as const,
    branch: (branchId: number) => ['dayOffs', 'branch', branchId] as const,
  },

  nearbyBranches: {
    all: ['nearbyBranches'] as const,
    list: (lat: number, lng: number, excludeBranchId: number) =>
      ['nearbyBranches', lat, lng, excludeBranchId] as const,
    thumbnail: (branchId: number) =>
      ['nearbyBranches', 'thumbnail', branchId] as const,
  },

  feedback: {
    all: ['feedback'] as const,
    branch: (branchId: number) => ['feedback', 'branch', branchId] as const,
    list: (branchId: number, sortBy: string) =>
      ['feedback', 'list', branchId, sortBy] as const,
    /** Global velocity key — also used as prefix for invalidating all velocity queries */
    velocity: () => ['feedback', 'velocity'] as const,
    /** Branch-specific velocity key (includes distance + canReviewWithoutOrder) */
    velocityBranch: (branchId: number, lat: number, lng: number) =>
      ['feedback', 'velocity', 'branch', branchId, lat, lng] as const,
  },

  orders: {
    all: ['orders'] as const,
    detail: (orderId: number) => ['orders', 'detail', orderId] as const,
    history: (status?: string | null) =>
      ['orders', 'history', status ?? 'all'] as const,
    completedByBranch: (branchId: number) =>
      ['orders', 'completed', 'branch', branchId] as const,
  },

  cart: {
    all: ['cart'] as const,
    byBranch: (branchId: number) => ['cart', 'branch', branchId] as const,
    my: ['cart', 'my'] as const,
  },

  dishes: {
    all: ['dishes'] as const,
    byBranch: (branchId: number) => ['dishes', 'branch', branchId] as const,
  },

  campaigns: {
    all: ['campaigns'] as const,
    system: ['campaigns', 'system'] as const,
    restaurant: (campaignId: number) =>
      ['campaigns', 'restaurant', campaignId] as const,
    nearby: (lat: number, lng: number) =>
      ['campaigns', 'nearby', { lat, lng }] as const,
    vendorBranches: (lat?: number | null, lng?: number | null) =>
      ['campaigns', 'vendorBranches', { lat, lng }] as const,
  },

  quests: {
    all: ['quests'] as const,
    public: (isCompleted?: boolean) =>
      ['quests', 'public', { isCompleted }] as const,
    detail: (questId: number) => ['quests', 'detail', questId] as const,
    my: (status?: string) => ['quests', 'my', status] as const,
    byCampaign: (campaignId: string) =>
      ['quests', 'campaign', campaignId] as const,
    myProgress: (campaignId: string) =>
      ['quests', 'myProgress', campaignId] as const,
  },

  managerOrders: {
    all: ['managerOrders'] as const,
    list: (status: number) => ['managerOrders', 'list', status] as const,
    count: (status: number) => ['managerOrders', 'count', status] as const,
    detail: (orderId: number) => ['managerOrders', 'detail', orderId] as const,
  },

  managerFeedback: {
    all: ['managerFeedback'] as const,
    list: (branchId: number) => ['managerFeedback', 'list', branchId] as const,
    detail: (feedbackId: number) =>
      ['managerFeedback', 'detail', feedbackId] as const,
  },

  managerSchedule: {
    all: ['managerSchedule'] as const,
    list: (branchId: number) => ['managerSchedule', 'list', branchId] as const,
  },

  managerBranch: {
    all: ['managerBranch'] as const,
    detail: (branchId: number) =>
      ['managerBranch', 'detail', branchId] as const,
  },

  managerDayOff: {
    all: ['managerDayOff'] as const,
    list: (branchId: number) => ['managerDayOff', 'list', branchId] as const,
  },

  managerDishes: {
    all: ['managerDishes'] as const,
    branchList: (branchId: number) =>
      ['managerDishes', 'branch', branchId] as const,
    vendorCatalog: (vendorId: number) =>
      ['managerDishes', 'vendor', vendorId] as const,
  },

  tastes: {
    all: ['tastes'] as const,
  },

  settings: {
    all: ['settings'] as const,
  },

  vendors: {
    all: ['vendors'] as const,
    list: (page: number, pageSize: number) =>
      ['vendors', 'list', page, pageSize] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    list: (pageSize: number) => ['notifications', 'list', pageSize] as const,
    unreadCount: ['notifications', 'unreadCount'] as const,
  },

  dietary: {
    all: ['dietary'] as const,
    preferences: ['dietary', 'preferences'] as const,
    userPreferences: ['dietary', 'userPreferences'] as const,
  },

  vouchers: {
    all: ['vouchers'] as const,
    myVouchers: ['vouchers', 'my'] as const,
    campaignVoucher: (campaignId: number) =>
      ['vouchers', 'campaign', campaignId] as const,
  },

  badges: {
    all: ['badges'] as const,
    user: ['badges', 'user'] as const,
  },

  paymentHistory: {
    all: ['paymentHistory'] as const,
  },

  tiers: {
    all: ['tiers'] as const,
  },
} as const;
