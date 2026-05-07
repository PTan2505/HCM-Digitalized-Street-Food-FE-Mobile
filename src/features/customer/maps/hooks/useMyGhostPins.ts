import type { MyGhostPinBranch } from '@features/customer/home/types/branch';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const PENDING_GHOST_PIN_LIMIT = 3;

interface UseMyGhostPinsResult {
  pins: MyGhostPinBranch[];
  pendingCount: number;
  isAtLimit: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export const useMyGhostPins = (): UseMyGhostPinsResult => {
  const { data, isLoading, isError, refetch } = useQuery<MyGhostPinBranch[]>({
    queryKey: queryKeys.branches.myGhostPins,
    queryFn: async (): Promise<MyGhostPinBranch[]> => {
      const result = await axiosApi.branchApi.getMyGhostPins();
      return result.items ?? [];
    },
  });

  const pins = data ?? [];
  const pendingCount = pins.filter(
    (pin) => pin.licenseStatus === 'Pending'
  ).length;

  return {
    pins,
    pendingCount,
    isAtLimit: pendingCount >= PENDING_GHOST_PIN_LIMIT,
    isLoading,
    isError,
    refetch,
  };
};
