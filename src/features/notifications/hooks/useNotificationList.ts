import type {
  NotificationDto,
  NotificationListResponse,
} from '@features/notifications/types/notification';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 20;

export const useNotificationList = (): {
  notifications: NotificationDto[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  refetch: () => void;
} => {
  const {
    data,
    fetchNextPage,
    hasNextPage = false,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<NotificationListResponse>({
    queryKey: queryKeys.notifications.list(PAGE_SIZE),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosApi.notificationApi.getNotifications(
        pageParam as number,
        PAGE_SIZE
      );
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.totalCount / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    staleTime: 30 * 1000,
  });

  const notifications = data?.pages.flatMap((page) => page.items) ?? [];

  return { notifications, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch };
};
