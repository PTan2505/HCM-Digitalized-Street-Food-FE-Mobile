import type { Taste } from '@features/customer/home/types/taste';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const useTastes = (): {
  tastes: Taste[];
  isLoading: boolean;
  isError: boolean;
} => {
  const {
    data: tastes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.tastes.all,
    queryFn: () => axiosApi.tasteApi.getTastes(),
    staleTime: 60 * 60 * 1000,
  });

  return { tastes, isLoading, isError };
};
