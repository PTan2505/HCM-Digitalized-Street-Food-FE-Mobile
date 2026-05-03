import type {
  RevenueSummary,
  TopDishesData,
  VoucherStats,
} from '@manager/dashboard/api/managerDashboardApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';

export type DashboardPreset = 7 | 14 | 30;

const pad = (n: number): string => String(n).padStart(2, '0');

const toDateStr = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const useDateRange = (
  days: DashboardPreset
): { fromDate: string; toDate: string } =>
  useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    return { fromDate: toDateStr(from), toDate: toDateStr(to) };
  }, [days]);

export const useRevenueSummary = (
  fromDate: string,
  toDate: string
): UseQueryResult<RevenueSummary> =>
  useQuery({
    queryKey: queryKeys.managerDashboard.revenue(fromDate, toDate),
    queryFn: () =>
      axiosApi.managerDashboardApi.getRevenue({ fromDate, toDate }),
  });

export const useTopDishes = (
  fromDate: string,
  toDate: string
): UseQueryResult<TopDishesData> =>
  useQuery({
    queryKey: queryKeys.managerDashboard.topDishes(fromDate, toDate),
    queryFn: () =>
      axiosApi.managerDashboardApi.getTopDishes({ fromDate, toDate }),
  });

export const useVoucherStats = (
  fromDate: string,
  toDate: string
): UseQueryResult<VoucherStats> =>
  useQuery({
    queryKey: queryKeys.managerDashboard.voucherStats(fromDate, toDate),
    queryFn: () =>
      axiosApi.managerDashboardApi.getVoucherStats({ fromDate, toDate }),
  });
