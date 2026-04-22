import type { ActiveBranch } from '@features/customer/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

/**
 * Fetches nearby branches within 2 km, excluding the current branch.
 *
 * HOW `select` WORKS:
 * The `select` option transforms the raw API response before it reaches the
 * component. Here we filter out the current branch. The raw data is still
 * cached as-is — only the component sees the filtered version. This means
 * if the same API data is reused elsewhere, it doesn't lose entries.
 *
 * Cache key includes lat, lng, and excludeBranchId — so different locations
 * or different "current branches" each get their own cache entry.
 */
export const useNearbyBranches = (
  lat: number,
  lng: number,
  excludeBranchId: number
): {
  branches: ActiveBranch[];
  isLoading: boolean;
  branchImageMap: Record<number, string>;
} => {
  const { data: branches = [], isLoading } = useQuery({
    queryKey: queryKeys.nearbyBranches.list(lat, lng, excludeBranchId),
    queryFn: () =>
      axiosApi.stallSearchApi.searchStalls({
        Lat: lat,
        Long: lng,
        Distance: 2,
      }),
    enabled: !!lat && !!lng,
    staleTime: 2 * 60 * 1000, // Nearby stalls unlikely to change within 2 min
    select: (items) => items.filter((b) => b.branchId !== excludeBranchId),
  });

  const imageQueries = useQueries({
    queries: branches.map((b) => ({
      queryKey: queryKeys.nearbyBranches.thumbnail(b.branchId),
      queryFn: async (): Promise<string | null> => {
        const res = await axiosApi.branchApi.getBranchImages(b.branchId, 1, 1);
        return res.items[0]?.imageUrl ?? null;
      },
      staleTime: 5 * 60 * 1000,
    })),
  });

  const branchImageMap = useMemo(() => {
    const map: Record<number, string> = {};
    branches.forEach((b, i) => {
      const url = imageQueries[i]?.data;
      if (url) map[b.branchId] = url;
    });
    return map;
  }, [branches, imageQueries]);

  return { branches, isLoading, branchImageMap };
};
