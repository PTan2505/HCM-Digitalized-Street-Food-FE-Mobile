import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

/**
 * Fetches all images for a branch (used in image carousels on detail/swipe screens).
 *
 * HOW THIS REPLACES THE REDUX THUNK:
 * Previously, RestaurantDetailsScreen and RestaurantSwipeScreen dispatched
 * `fetchBranchAllImages(branchId)` in useEffect, which stored URLs in
 * `state.branches.branchImageMap[branchId]`.
 *
 * Now: the data lives in React Query's cache under key ['branches', 'images', branchId].
 * Benefits:
 * - If user opens branch #42, goes back, then opens #42 again → no API call,
 *   images appear instantly from cache.
 * - If user opens branch #42 on both swipe and detail screens → only 1 API call
 *   (deduplication by shared cache key).
 *
 * staleTime is 5 min because branch images rarely change within a session.
 */
export const useBranchImages = (
  branchId: number
): { imageUrls: string[]; isLoading: boolean } => {
  const { data: imageUrls = [], isLoading } = useQuery({
    queryKey: queryKeys.branches.images(branchId),
    queryFn: async () => {
      const res = await axiosApi.branchApi.getBranchImages(branchId, 1, 100);
      return res.items?.map((img) => img.imageUrl) ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return { imageUrls, isLoading };
};
