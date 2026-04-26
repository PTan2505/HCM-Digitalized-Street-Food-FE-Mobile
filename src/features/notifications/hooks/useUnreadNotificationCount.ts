import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const useUnreadNotificationCount = (): {
  unreadCount: number;
  refetch: () => void;
} => {
  const { data, refetch } = useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: async () => {
      const res = await axiosApi.notificationApi.getUnreadCount();
      return res.data.unreadCount;
    },
    staleTime: 0,
    initialData: 0,
  });

  return { unreadCount: data, refetch };
};
