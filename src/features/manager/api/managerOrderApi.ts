import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export const MANAGER_ORDER_STATUS = {
  AwaitingVendorConfirmation: 1,
  Paid: 2,
  Complete: 4,
} as const;

export type ManagerOrderStatus =
  (typeof MANAGER_ORDER_STATUS)[keyof typeof MANAGER_ORDER_STATUS];

export interface ManagerOrderItem {
  dishId: number;
  dishName: string;
  quantity: number;
  price: number;
  dishImageUrl?: string | null;
}

export interface ManagerOrderSummary {
  orderId: number;
  userId?: number | null;
  displayName?: string | null;
  status: number;
  totalAmount: number;
  discountAmount?: number | null;
  finalAmount: number;
  isTakeAway: boolean;
  createdAt: string;
  items: ManagerOrderItem[];
}

export interface ManagerOrderDetail extends ManagerOrderSummary {
  table?: string | null;
  paymentMethod?: string | null;
  note?: string | null;
  updatedAt?: string | null;
}

export type ManagerOrderDetailNullable = ManagerOrderDetail | null;

export interface PaginatedManagerOrders {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  items: ManagerOrderSummary[];
}

export interface DecideOrderRequest {
  approve: boolean;
}

export interface CompleteOrderRequest {
  verificationCode: string;
}

export class ManagerOrderApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getManagerOrders(
    pageNumber = 1,
    pageSize = 10,
    status?: number
  ): Promise<PaginatedManagerOrders> {
    const res = await this.apiClient.get<PaginatedManagerOrders>({
      url: apiUrl.managerOrder.list,
      params: { pageNumber, pageSize, ...(status !== undefined && { status }) },
    });
    return res.data;
  }

  async getOrderDetail(orderId: number): Promise<ManagerOrderDetail> {
    const res = await this.apiClient.get<ManagerOrderDetail>({
      url: apiUrl.order.byId(orderId),
    });
    return res.data;
  }

  async decideOrder(orderId: number, data: DecideOrderRequest): Promise<void> {
    await this.apiClient.put<void, null>({
      url: apiUrl.managerOrder.decision(orderId),
      params: data,
    });
  }

  async completeOrder(
    orderId: number,
    data: CompleteOrderRequest
  ): Promise<void> {
    await this.apiClient.put<void, CompleteOrderRequest>({
      url: apiUrl.managerOrder.complete(orderId),
      data,
    });
  }
}
