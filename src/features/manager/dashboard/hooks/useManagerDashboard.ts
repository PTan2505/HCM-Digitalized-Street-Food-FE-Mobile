import type {
  CampaignStats,
  RevenueSummary,
  TopDishesData,
  VoucherStats,
} from '@manager/dashboard/api/managerDashboardApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';

export type DashboardPreset = 7 | 30 | 90;

export const buildDateRange = (
  days: number
): { fromDate: string; toDate: string } => {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);
  return { fromDate: from.toISOString(), toDate: to.toISOString() };
};

export const useDateRange = (
  days: DashboardPreset
): { fromDate: string; toDate: string } =>
  useMemo(() => buildDateRange(days), [days]);

export const useRevenueSummary = (
  fromDate: string,
  toDate: string
): UseQueryResult<RevenueSummary> =>
  useQuery({
    queryKey: queryKeys.managerDashboard.revenue(fromDate, toDate),
    queryFn: () =>
      axiosApi.managerDashboardApi.getRevenue({ fromDate, toDate }),
  });

export const useTopDishes = (): UseQueryResult<TopDishesData> =>
  useQuery({
    queryKey: queryKeys.managerDashboard.topDishes(),
    queryFn: () => axiosApi.managerDashboardApi.getTopDishes(),
  });

export const useVoucherStats = (): UseQueryResult<VoucherStats> =>
  useQuery({
    queryKey: queryKeys.managerDashboard.voucherStats(),
    queryFn: () => axiosApi.managerDashboardApi.getVoucherStats(),
  });

export const useCampaignStats = (
  fromDate: string,
  toDate: string
): UseQueryResult<CampaignStats> =>
  useQuery({
    queryKey: queryKeys.managerDashboard.campaignStats(fromDate, toDate),
    queryFn: () =>
      axiosApi.managerDashboardApi.getCampaignStats({ fromDate, toDate }),
  });
