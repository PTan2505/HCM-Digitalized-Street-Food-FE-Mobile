import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalOrders: number;
  dailyRevenues: DailyRevenue[];
}

export interface TopDish {
  dishId: number;
  dishName: string;
  totalQuantityOrdered: number;
}

export interface TopDishesData {
  topDishes: TopDish[];
}

export interface VoucherUsage {
  voucherType: string;
  voucherName: string;
  usageCount: number;
}

export interface VoucherStats {
  voucherUsages: VoucherUsage[];
}

export interface DateRangeParams {
  fromDate: string;
  toDate: string;
}

export class ManagerDashboardApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getRevenue(params: DateRangeParams): Promise<RevenueSummary> {
    const res = await this.apiClient.get<RevenueSummary>({
      url: apiUrl.dashboard.revenue,
      params,
    });
    return res.data;
  }

  async getTopDishes(params: DateRangeParams): Promise<TopDishesData> {
    const res = await this.apiClient.get<TopDishesData>({
      url: apiUrl.dashboard.dishes,
      params,
    });
    return res.data;
  }

  async getVoucherStats(params: DateRangeParams): Promise<VoucherStats> {
    const res = await this.apiClient.get<VoucherStats>({
      url: apiUrl.dashboard.vouchers,
      params,
    });
    return res.data;
  }
}
