import type { Category } from '@features/home/types/category';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

/**
 * Fetches food categories with aggressive caching.
 *
 * WHY 10-MINUTE staleTime:
 * Categories (e.g., "Bánh mì", "Phở", "Cơm") almost never change.
 * A 10-minute stale time means:
 * - First load: API call → spinner → data
 * - Next 10 minutes: instant data, no spinner, no API call at all
 * - After 10 min: still shows cached data instantly, but refetches
 *   in the background to check for changes
 *
 * REPLACING REDUX:
 * Previously, this data lived in the `categories` Redux slice.
 * The slice had: fetchCategories thunk → pending/fulfilled/rejected handlers.
 * HomeScreen dispatched fetchCategories() in useEffect on every mount.
 *
 * Now: useCategories() handles everything — fetching, caching, loading state.
 * No Redux slice needed. The data lives in React Query's cache instead of
 * the Redux store.
 */
export const useCategories = (): {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
} => {
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => axiosApi.categoryApi.getCategories(),
    staleTime: 10 * 60 * 1000, // Categories rarely change — 10 min cache
  });

  return { categories, isLoading, isError };
};
