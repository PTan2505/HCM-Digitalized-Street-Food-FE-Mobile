import type { ApiResponse } from '@custom-types/apiResponse';
import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

// ── Cart types ──

export interface CartItemResponse {
  dishId: number;
  dishName: string;
  dishImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartResponse {
  cartId: number;
  userId: number;
  branchId?: number | null;
  branchName?: string | null;
  totalAmount: number;
  items: CartItemResponse[];
}

export interface AddCartItemRequest {
  dishId: number;
  quantity: number;
  branchId: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ── Checkout types ──

export interface CheckoutCartRequest {
  table?: string | null;
  paymentMethod?: string | null;
  discountAmount?: number | null;
  isTakeAway: boolean;
}

export interface PaymentLinkResult {
  success: boolean;
  message?: string | null;
  paymentUrl?: string | null;
  orderCode?: number | null;
  paymentLinkId?: string | null;
  requiresConfirmation: boolean;
}

export interface CheckoutCartResponse {
  order: OrderResponse;
  payment: PaymentLinkResult;
}

// ── Order types ──

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export interface OrderDishResponse {
  dishId: number;
  dishName: string;
  quantity: number;
}

export interface OrderResponse {
  orderId: number;
  userId: number;
  branchId: number;
  branchName: string;
  status: OrderStatus;
  table?: string | null;
  paymentMethod?: string | null;
  totalAmount: number;
  discountAmount?: number | null;
  finalAmount: number;
  isTakeAway: boolean;
  lockedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderDishResponse[];
}

export interface PaginatedOrders {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  items: OrderResponse[];
}

// ── API class ──

export class CartApi {
  private apiClient: ApiClient;

  constructor(client: ApiClient) {
    this.apiClient = client;
  }

  getMyCart(): Promise<ApiResponse<CartResponse>> {
    return this.apiClient.get<CartResponse>({ url: apiUrl.cart.my });
  }

  addItem(data: AddCartItemRequest): Promise<ApiResponse<CartResponse>> {
    return this.apiClient.post<CartResponse, AddCartItemRequest>({
      url: apiUrl.cart.items,
      data,
    });
  }

  updateItemQuantity(
    dishId: number,
    data: UpdateCartItemRequest
  ): Promise<ApiResponse<CartResponse>> {
    return this.apiClient.put<CartResponse, UpdateCartItemRequest>({
      url: apiUrl.cart.itemByDish(dishId),
      data,
    });
  }

  removeItem(dishId: number): Promise<ApiResponse<CartResponse>> {
    return this.apiClient.delete<CartResponse>({
      url: apiUrl.cart.itemByDish(dishId),
    });
  }

  clearCart(): Promise<ApiResponse<CartResponse>> {
    return this.apiClient.delete<CartResponse>({ url: apiUrl.cart.clear });
  }

  checkout(
    data: CheckoutCartRequest
  ): Promise<ApiResponse<CheckoutCartResponse>> {
    return this.apiClient.post<CheckoutCartResponse, CheckoutCartRequest>({
      url: apiUrl.cart.checkout,
      data,
    });
  }
}

export class OrderApi {
  private apiClient: ApiClient;

  constructor(client: ApiClient) {
    this.apiClient = client;
  }

  getOrderById(id: number): Promise<ApiResponse<OrderResponse>> {
    return this.apiClient.get<OrderResponse>({ url: apiUrl.order.byId(id) });
  }

  getMyOrders(
    pageNumber = 1,
    pageSize = 10
  ): Promise<ApiResponse<PaginatedOrders>> {
    return this.apiClient.get<PaginatedOrders>({
      url: apiUrl.order.myOrders,
      params: { pageNumber, pageSize },
    });
  }

  getPickupCode(id: number): Promise<ApiResponse<string>> {
    return this.apiClient.get<string>({ url: apiUrl.order.pickupCode(id) });
  }
}
