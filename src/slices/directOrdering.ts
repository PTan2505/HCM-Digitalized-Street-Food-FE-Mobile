import type { RootState } from '@app/store';
import type {
  CartResponse,
  CheckoutCartRequest,
  ConfirmPaymentRequest,
  OrderResponse,
  OrderStatus,
  PaginatedOrders,
} from '@features/direct-ordering/api/cartApi';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { createSlice } from '@reduxjs/toolkit';
import { t } from 'i18next';

export interface DirectOrderingState {
  cart: CartResponse | null;
  /** Formatted display name for the cart's branch (vendorName or vendorName - branchName) */
  cartDisplayName: string | null;
  cartLoading: boolean;
  cartError: string | null;
  /** All carts for the current user (one per branch) */
  carts: CartResponse[];
  /** Display names keyed by branchId — resolved via vendor/multi-branch logic */
  cartsDisplayNames: Record<number, string>;
  cartsLoading: boolean;
  activeOrder: OrderResponse | null;
  checkoutPaymentUrl: string | null;
  checkoutOrderCode: number | null;
  checkoutQrCode: string | null;
  orderLoading: boolean;
  orderError: string | null;
  orderHistory: PaginatedOrders | null;
  orderHistoryLoading: boolean;
  orderHistoryStatusFilter: OrderStatus | null;
  orderHistoryByStatus: Record<string, PaginatedOrders>;
}

const initialState: DirectOrderingState = {
  cart: null,
  cartDisplayName: null,
  cartLoading: false,
  cartError: null,
  carts: [],
  cartsDisplayNames: {},
  cartsLoading: false,
  activeOrder: null,
  checkoutPaymentUrl: null,
  checkoutOrderCode: null,
  checkoutQrCode: null,
  orderLoading: false,
  orderError: null,
  orderHistory: null,
  orderHistoryLoading: false,
  orderHistoryStatusFilter: null,
  orderHistoryByStatus: {},
};

const getOrderHistoryStatusKey = (status?: OrderStatus | null): string =>
  status == null ? 'all' : String(status);

export const fetchCartThunk = createAppAsyncThunk(
  'directOrdering/fetchCart',
  async (branchId: number, { rejectWithValue }) => {
    try {
      const res = await axiosApi.cartApi.getMyCartByBranch(branchId);
      const cart = res.data;

      // Resolve display name: fetch branch → vendor to build
      // "vendorName - chi nhánh branchName" (or just vendorName for single-branch)
      let displayName: string | null = null;
      try {
        const branch = await axiosApi.branchApi.getBranchById(branchId);
        const vendor = await axiosApi.vendorApi.getVendorById(branch.vendorId);
        const vendorBranches = await axiosApi.branchApi.getBranchesByVendor(
          branch.vendorId
        );
        if (vendorBranches.totalCount > 1) {
          displayName = `${vendor.name} - ${t('branch')} ${branch.name}`;
        } else {
          displayName = vendor.name;
        }
      } catch {
        displayName = cart.branchName ?? null;
      }

      return { cart, displayName };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchMyCartsThunk = createAppAsyncThunk(
  'directOrdering/fetchMyCarts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosApi.cartApi.getMyCarts();
      const carts = res.data;

      // Resolve display names for all carts in parallel
      const displayNames: Record<number, string> = {};
      await Promise.all(
        carts
          .filter(
            (c): c is CartResponse & { branchId: number } => c.branchId != null
          )
          .map(async (c) => {
            try {
              const branch = await axiosApi.branchApi.getBranchById(c.branchId);
              const vendor = await axiosApi.vendorApi.getVendorById(
                branch.vendorId
              );
              const vendorBranches =
                await axiosApi.branchApi.getBranchesByVendor(branch.vendorId);
              displayNames[c.branchId] =
                vendorBranches.totalCount > 1
                  ? `${vendor.name} - ${t('branch')} ${branch.name}`
                  : vendor.name;
            } catch {
              displayNames[c.branchId] = c.branchName ?? '';
            }
          })
      );

      return { carts, displayNames };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addCartItemThunk = createAppAsyncThunk(
  'directOrdering/addCartItem',
  async (
    {
      dishId,
      quantity,
      branchId,
      displayName,
    }: {
      dishId: number;
      quantity: number;
      branchId: number;
      displayName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosApi.cartApi.addItem({
        dishId,
        quantity,
        branchId,
      });
      return { cart: res.data, displayName };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateCartItemThunk = createAppAsyncThunk(
  'directOrdering/updateCartItem',
  async (
    {
      dishId,
      quantity,
      branchId,
    }: { dishId: number; quantity: number; branchId: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosApi.cartApi.updateItemQuantity(dishId, branchId, {
        quantity,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const removeCartItemThunk = createAppAsyncThunk(
  'directOrdering/removeCartItem',
  async (
    { dishId, branchId }: { dishId: number; branchId: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosApi.cartApi.removeItem(dishId, branchId);
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const clearCartThunk = createAppAsyncThunk(
  'directOrdering/clearCart',
  async (branchId: number, { rejectWithValue }) => {
    try {
      await axiosApi.cartApi.clearCart(branchId);
      return null;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const checkoutThunk = createAppAsyncThunk(
  'directOrdering/checkout',
  async (data: CheckoutCartRequest, { rejectWithValue }) => {
    try {
      const res = await axiosApi.cartApi.checkout(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const confirmPaymentThunk = createAppAsyncThunk(
  'directOrdering/confirmPayment',
  async (data: ConfirmPaymentRequest, { rejectWithValue }) => {
    try {
      const res = await axiosApi.paymentApi.confirmOrderPayment(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchOrderThunk = createAppAsyncThunk(
  'directOrdering/fetchOrder',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const res = await axiosApi.orderApi.getOrderById(orderId);
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchOrderHistoryThunk = createAppAsyncThunk(
  'directOrdering/fetchOrderHistory',
  async (
    params:
      | { pageNumber?: number; pageSize?: number; status?: OrderStatus | null }
      | undefined,
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosApi.orderApi.getMyOrders(
        params?.pageNumber,
        params?.pageSize,
        params?.status ?? undefined
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const cancelOrderThunk = createAppAsyncThunk(
  'directOrdering/cancelOrder',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const res = await axiosApi.orderApi.cancelOrder(orderId);
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const syncOrderToHistoryFromNotificationThunk = createAppAsyncThunk(
  'directOrdering/syncOrderToHistoryFromNotification',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const res = await axiosApi.orderApi.getOrderById(orderId);
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const upsertOrderInList = (
  source: OrderResponse[],
  order: OrderResponse
): OrderResponse[] => {
  const byId = new Map(source.map((item) => [item.orderId, item]));
  byId.set(order.orderId, order);

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

const directOrderingSlice = createSlice({
  name: 'directOrdering',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null;
      state.cartDisplayName = null;
    },
    clearActiveOrder: (state) => {
      state.activeOrder = null;
      state.checkoutPaymentUrl = null;
      state.checkoutOrderCode = null;
      state.checkoutQrCode = null;
    },
    clearOrderError: (state) => {
      state.orderError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Cart thunks
      .addCase(fetchCartThunk.pending, (state) => {
        state.cartLoading = true;
        state.cartError = null;
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.cartLoading = false;
        state.cart = action.payload.cart;
        if (action.payload.displayName) {
          state.cartDisplayName = action.payload.displayName;
        }
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.cartLoading = false;
        state.cartError =
          (action.payload as { message?: string })?.message ??
          'Failed to fetch cart';
      })

      .addCase(fetchMyCartsThunk.pending, (state) => {
        state.cartsLoading = true;
      })
      .addCase(fetchMyCartsThunk.fulfilled, (state, action) => {
        state.cartsLoading = false;
        state.carts = action.payload.carts;
        state.cartsDisplayNames = action.payload.displayNames;
      })
      .addCase(fetchMyCartsThunk.rejected, (state) => {
        state.cartsLoading = false;
      })

      .addCase(addCartItemThunk.pending, (state) => {
        state.cartLoading = true;
      })
      .addCase(addCartItemThunk.fulfilled, (state, action) => {
        state.cartLoading = false;
        state.cart = action.payload.cart;
        if (action.payload.displayName) {
          state.cartDisplayName = action.payload.displayName;
        }
      })
      .addCase(addCartItemThunk.rejected, (state, action) => {
        state.cartLoading = false;
        state.cartError =
          (action.payload as { message?: string })?.message ??
          'Failed to add item';
      })

      .addCase(updateCartItemThunk.pending, (state) => {
        state.cartLoading = true;
      })
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        state.cartLoading = false;
        state.cart = action.payload;
      })
      .addCase(updateCartItemThunk.rejected, (state, action) => {
        state.cartLoading = false;
        state.cartError =
          (action.payload as { message?: string })?.message ??
          'Failed to update item';
      })

      .addCase(removeCartItemThunk.pending, (state) => {
        state.cartLoading = true;
      })
      .addCase(removeCartItemThunk.fulfilled, (state, action) => {
        state.cartLoading = false;
        state.cart = action.payload;
      })
      .addCase(removeCartItemThunk.rejected, (state, action) => {
        state.cartLoading = false;
        state.cartError =
          (action.payload as { message?: string })?.message ??
          'Failed to remove item';
      })

      .addCase(clearCartThunk.fulfilled, (state) => {
        state.cart = null;
        state.cartDisplayName = null;
        state.cartLoading = false;
      })

      // Checkout
      .addCase(checkoutThunk.pending, (state) => {
        state.orderLoading = true;
        state.orderError = null;
      })
      .addCase(checkoutThunk.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.activeOrder = action.payload.order;
        state.checkoutPaymentUrl = action.payload.payment.paymentUrl ?? null;
        state.checkoutOrderCode = action.payload.payment.orderCode ?? null;
        state.checkoutQrCode = action.payload.payment.qrCode ?? null;
        // Cart is NOT cleared here — backend keeps it so user can re-checkout
        // if payment is abandoned. Cart is cleared only when PAID is confirmed.
      })
      .addCase(checkoutThunk.rejected, (state, action) => {
        state.orderLoading = false;
        state.orderError =
          (action.payload as { message?: string })?.message ??
          'Failed to checkout';
      })

      // Order
      .addCase(fetchOrderThunk.fulfilled, (state, action) => {
        state.activeOrder = action.payload;
      })

      // Order history
      .addCase(fetchOrderHistoryThunk.pending, (state) => {
        state.orderHistoryLoading = true;
      })
      .addCase(fetchOrderHistoryThunk.fulfilled, (state, action) => {
        const requestedPage = action.meta.arg?.pageNumber ?? 1;
        const requestedStatus = action.meta.arg?.status ?? null;
        const statusKey = getOrderHistoryStatusKey(requestedStatus);
        const cachedEntry = state.orderHistoryByStatus[statusKey];

        state.orderHistoryLoading = false;

        let mergedResult: PaginatedOrders;

        if (requestedPage > 1 && cachedEntry) {
          const existingById = new Map(
            cachedEntry.items.map((item) => [item.orderId, item])
          );

          action.payload.items.forEach((item) => {
            existingById.set(item.orderId, item);
          });

          mergedResult = {
            ...action.payload,
            items: Array.from(existingById.values()),
          };
        } else {
          mergedResult = action.payload;
        }

        state.orderHistory = mergedResult;
        state.orderHistoryByStatus[statusKey] = mergedResult;

        state.orderHistoryStatusFilter = requestedStatus;
      })
      .addCase(fetchOrderHistoryThunk.rejected, (state) => {
        state.orderHistoryLoading = false;
      })
      .addCase(
        syncOrderToHistoryFromNotificationThunk.fulfilled,
        (state, action) => {
          const order = action.payload;
          const currentStatusKey = getOrderHistoryStatusKey(
            state.orderHistoryStatusFilter
          );
          const targetStatusKey = getOrderHistoryStatusKey(order.status);

          Object.entries(state.orderHistoryByStatus).forEach(
            ([statusKey, paginated]) => {
              const filteredItems = paginated.items.filter(
                (item) => item.orderId !== order.orderId
              );

              const shouldInclude =
                statusKey === 'all' || statusKey === targetStatusKey;

              state.orderHistoryByStatus[statusKey] = {
                ...paginated,
                items: shouldInclude
                  ? upsertOrderInList(filteredItems, order)
                  : filteredItems,
              };
            }
          );

          state.activeOrder =
            state.activeOrder?.orderId === order.orderId
              ? order
              : state.activeOrder;

          state.orderHistory =
            state.orderHistoryByStatus[currentStatusKey] ?? null;
        }
      );
  },
});

export const { clearCart, clearActiveOrder, clearOrderError } =
  directOrderingSlice.actions;

export default directOrderingSlice.reducer;

// Selectors
export const selectCart = (state: RootState): CartResponse | null =>
  state.directOrdering.cart;
export const selectCartDisplayName = (state: RootState): string | null =>
  state.directOrdering.cartDisplayName;
export const selectCartLoading = (state: RootState): boolean =>
  state.directOrdering.cartLoading;
export const selectActiveOrder = (state: RootState): OrderResponse | null =>
  state.directOrdering.activeOrder;
export const selectCheckoutPaymentUrl = (state: RootState): string | null =>
  state.directOrdering.checkoutPaymentUrl;
export const selectCheckoutOrderCode = (state: RootState): number | null =>
  state.directOrdering.checkoutOrderCode;
export const selectCheckoutQrCode = (state: RootState): string | null =>
  state.directOrdering.checkoutQrCode;
export const selectOrderLoading = (state: RootState): boolean =>
  state.directOrdering.orderLoading;
export const selectOrderError = (state: RootState): string | null =>
  state.directOrdering.orderError;
export const selectOrderHistory = (state: RootState): PaginatedOrders | null =>
  state.directOrdering.orderHistory;
export const selectOrderHistoryLoading = (state: RootState): boolean =>
  state.directOrdering.orderHistoryLoading;

export const selectOrderHistoryByStatus = (
  state: RootState,
  status?: OrderStatus | null
): PaginatedOrders | null => {
  const statusKey = getOrderHistoryStatusKey(status);
  return state.directOrdering.orderHistoryByStatus[statusKey] ?? null;
};

export const selectCarts = (state: RootState): CartResponse[] =>
  state.directOrdering.carts;
export const selectCartsLoading = (state: RootState): boolean =>
  state.directOrdering.cartsLoading;
export const selectCartsDisplayNames = (
  state: RootState
): Record<number, string> => state.directOrdering.cartsDisplayNames;
/** True if the user has at least one cart that contains items */
export const selectTotalCartsWithItems = (state: RootState): number =>
  state.directOrdering.carts.filter((c) => c.items.length > 0).length;
/** Total item count across all carts */
export const selectTotalCartItemCount = (state: RootState): number =>
  state.directOrdering.carts.reduce(
    (sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
