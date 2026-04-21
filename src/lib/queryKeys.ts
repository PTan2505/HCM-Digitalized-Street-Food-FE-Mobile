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
    images: (branchId: number) => ['branches', 'images', branchId] as const,
    similar: (branchId: number) => ['branches', 'similar', branchId] as const,
  },

  workSchedule: {
    all: ['workSchedule'] as const,
    detail: (branchId: number) => ['workSchedule', branchId] as const,
  },

  nearbyBranches: {
    all: ['nearbyBranches'] as const,
    list: (lat: number, lng: number, excludeBranchId: number) =>
      ['nearbyBranches', lat, lng, excludeBranchId] as const,
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
    completedByBranch: (branchId: number) =>
      ['orders', 'completed', 'branch', branchId] as const,
  },

  cart: {
    all: ['cart'] as const,
  },

  dishes: {
    all: ['dishes'] as const,
    byBranch: (branchId: number) => ['dishes', 'branch', branchId] as const,
  },

  campaigns: {
    all: ['campaigns'] as const,
    system: ['campaigns', 'system'] as const,
    restaurant: (lat?: number, lng?: number) =>
      ['campaigns', 'restaurant', { lat, lng }] as const,
    nearby: (lat: number, lng: number) =>
      ['campaigns', 'nearby', { lat, lng }] as const,
    vendorBranches: (lat?: number | null, lng?: number | null) =>
      ['campaigns', 'vendorBranches', { lat, lng }] as const,
  },

  quests: {
    all: ['quests'] as const,
    public: ['quests', 'public'] as const,
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
} as const;
