import type { UserBadge } from '@features/user/types/badge';
import { axiosApi } from '@lib/api/apiInstance';
import { queryClient } from '@lib/queryClient';
import { queryKeys } from '@lib/queryKeys';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useBadges = (): {
  badges: UserBadge[];
  selectedBadge: UserBadge | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  selectBadge: (badgeId: number) => Promise<void>;
  clearSelectedBadge: () => Promise<void>;
  isSelecting: boolean;
} => {
  const {
    data: badges = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.badges.user,
    queryFn: () => axiosApi.badgeApi.getUserBadges(),
  });

  const selectedBadge = badges.find((b) => b.isSelected);

  const { mutateAsync: selectBadgeMutation, isPending: isSelecting } =
    useMutation({
      mutationFn: (badgeId: number) => axiosApi.badgeApi.selectBadge(badgeId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.badges.user });
      },
    });

  const { mutateAsync: clearSelectedBadgeMutation } = useMutation({
    mutationFn: () => axiosApi.badgeApi.clearSelectedBadge(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.badges.user });
    },
  });

  return {
    badges,
    selectedBadge,
    isLoading,
    isError,
    refetch,
    selectBadge: selectBadgeMutation,
    clearSelectedBadge: clearSelectedBadgeMutation,
    isSelecting,
  };
};
