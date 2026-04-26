import type { ActiveBranch } from '@features/customer/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

export interface BranchFilters {
  lat?: number;
  lng?: number;
  distance?: number;
  dietaryIds?: number[];
  tasteIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  categoryIds?: number[];
  wards?: string[];
}

interface BranchPage {
  items: ActiveBranch[];
  multiBranchVendorIds: number[];
  branchImageMap: Record<number, string[]>;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
}

const PAGE_SIZE = 10;

async function fetchBranchPage(
  filters: BranchFilters,
  page: number
): Promise<BranchPage> {
  const paginatedBranches = await axiosApi.branchApi.getActiveBranches(
    page,
    PAGE_SIZE,
    {
      Lat: filters.lat,
      Long: filters.lng,
      Distance: filters.distance,
      DietaryIds: filters.dietaryIds?.length ? filters.dietaryIds : undefined,
      TasteIds: filters.tasteIds?.length ? filters.tasteIds : undefined,
      MinPrice: filters.minPrice,
      MaxPrice: filters.maxPrice,
      CategoryIds: filters.categoryIds,
      Wards: filters.wards?.length ? filters.wards : undefined,
    }
  );

  const uniqueVendorIds = [
    ...new Set(
      paginatedBranches.items
        .map((b) => b.vendorId)
        .filter((id): id is number => id != null)
    ),
  ];

  const [vendorChecks, imageResults] = await Promise.all([
    Promise.all(
      uniqueVendorIds.map((vendorId) =>
        axiosApi.branchApi
          .getBranchesByVendor(vendorId, 1, 2)
          .then((res) => ({ vendorId, totalCount: res.totalCount }))
          .catch(() => ({ vendorId, totalCount: 1 }))
      )
    ),
    Promise.all(
      paginatedBranches.items.map((branch) =>
        axiosApi.branchApi
          .getBranchImages(branch.branchId, 1, 1)
          .then((res) => ({
            branchId: branch.branchId,
            imageUrl: res.items[0]?.imageUrl ?? null,
          }))
          .catch(() => ({ branchId: branch.branchId, imageUrl: null }))
      )
    ),
  ]);

  const multiBranchVendorIds = vendorChecks
    .filter((v) => v.totalCount > 1)
    .map((v) => v.vendorId);

  const branchImageMap: Record<number, string[]> = Object.fromEntries(
    imageResults
      .filter(
        (r): r is { branchId: number; imageUrl: string } => r.imageUrl !== null
      )
      .map((r) => [r.branchId, [r.imageUrl]])
  );

  return {
    items: paginatedBranches.items,
    multiBranchVendorIds,
    branchImageMap,
    currentPage: paginatedBranches.currentPage,
    totalPages: paginatedBranches.totalPages,
    totalCount: paginatedBranches.totalCount,
    hasNext: paginatedBranches.hasNext,
  };
}

export const useActiveBranchesQuery = (
  filters: BranchFilters,
  enabled = true
): {
  branches: ActiveBranch[];
  multiBranchVendorIds: number[];
  branchImageMap: Record<number, string[]>;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  hasNext: boolean;
  loadingMore: boolean;
  currentPage: number;
  fetchNextPage: () => void;
  refetch: () => Promise<unknown>;
  updateBranchRating: (
    branchId: number,
    avgRating: number,
    totalReviewCount: number
  ) => void;
} => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.branches.list(filters);

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    status: queryStatus,
    refetch,
  } = useInfiniteQuery<BranchPage>({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      fetchBranchPage(filters, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.currentPage + 1 : undefined,
    staleTime: 2 * 60 * 1000,
    enabled,
  });

  const branches = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

  const multiBranchVendorIds = useMemo(() => {
    const ids = new Set<number>();
    data?.pages.forEach((p) =>
      p.multiBranchVendorIds.forEach((id) => ids.add(id))
    );
    return [...ids];
  }, [data]);

  const branchImageMap = useMemo(() => {
    const map: Record<number, string[]> = {};
    data?.pages.forEach((p) => Object.assign(map, p.branchImageMap));
    return map;
  }, [data]);

  const currentPage = data?.pages[data.pages.length - 1]?.currentPage ?? 0;
  const hasNext = data?.pages[data.pages.length - 1]?.hasNext ?? false;

  const status: 'idle' | 'pending' | 'succeeded' | 'failed' =
    queryStatus === 'pending' && !data
      ? 'pending'
      : queryStatus === 'error'
        ? 'failed'
        : queryStatus === 'success'
          ? 'succeeded'
          : 'idle';

  const updateBranchRating = (
    branchId: number,
    avgRating: number,
    totalReviewCount: number
  ): void => {
    queryClient.setQueryData<{ pages: BranchPage[]; pageParams: unknown[] }>(
      queryKey,
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((b) =>
              b.branchId === branchId
                ? { ...b, avgRating, totalReviewCount }
                : b
            ),
          })),
        };
      }
    );
  };

  return {
    branches,
    multiBranchVendorIds,
    branchImageMap,
    status,
    hasNext,
    loadingMore: isFetchingNextPage,
    currentPage,
    fetchNextPage,
    refetch,
    updateBranchRating,
  };
};
