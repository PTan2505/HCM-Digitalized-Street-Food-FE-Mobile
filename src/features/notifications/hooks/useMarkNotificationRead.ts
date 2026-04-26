import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useMarkNotificationRead = (): {
  markRead: (notificationId: number) => void;
  markAllRead: () => void;
} => {
  const queryClient = useQueryClient();

  const invalidate = (): void => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.notifications.all,
    });
  };

  const { mutate: markRead } = useMutation({
    mutationFn: (notificationId: number) =>
      axiosApi.notificationApi.markAsRead(notificationId),
    onSuccess: invalidate,
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => axiosApi.notificationApi.markAllAsRead(),
    onSuccess: invalidate,
  });

  return { markRead, markAllRead };
};
