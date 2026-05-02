import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import type { PinStatus } from '@user/api/userPinApi';
import { useQuery } from '@tanstack/react-query';

interface UsePinStatusResult {
  hasPin: boolean;
  isLoading: boolean;
  isError: boolean;
}

export const usePinStatus = (): UsePinStatusResult => {
  const { data, isLoading, isError } = useQuery<PinStatus>({
    queryKey: queryKeys.userPin.status(),
    queryFn: () => axiosApi.userPinApi.getStatus(),
  });

  return {
    hasPin: data?.hasPin ?? false,
    isLoading,
    isError,
  };
};
