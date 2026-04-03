import type { Dish } from '@features/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const useBranchDishes = (
  branchId: number
): { dishes: Dish[]; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dishes.byBranch(branchId),
    queryFn: async () => {
      const res = await axiosApi.branchApi.getDishesByBranch(branchId, {
        pageNumber: 1,
        pageSize: 100,
      });
      return res.items ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return { dishes: data ?? [], isLoading };
};
