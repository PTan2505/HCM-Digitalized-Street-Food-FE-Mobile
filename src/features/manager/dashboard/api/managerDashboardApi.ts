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
  revenueGrowthRate: number | null;
  ordersGrowthRate: number | null;
  previousPeriod: string | null;
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

export interface CampaignBranchStat {
  branchId: number;
  branchName: string;
  orderCount: number;
  revenue: number;
}

export interface CampaignStat {
  campaignId: number;
  campaignName: string;
  orderCount: number;
  revenue: number;
  branches?: CampaignBranchStat[];
}

export interface CampaignStats {
  totalCampaigns: number;
  totalCampaignOrders: number;
  totalCampaignRevenue: number;
  campaigns: CampaignStat[];
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

  async getCampaignStats(params: DateRangeParams): Promise<CampaignStats> {
    const res = await this.apiClient.get<CampaignStats>({
      url: apiUrl.dashboard.campaigns,
      params,
    });
    return res.data;
  }
}
