import type { RootState } from '@app/store';
import type {
  CartResponse,
  CheckoutCartRequest,
  OrderResponse,
  PaginatedOrders,
} from '@features/direct-ordering/api/cartApi';
import { createAppAsyncThunk } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { createSlice } from '@reduxjs/toolkit';

export interface DirectOrderingState {
  cart: CartResponse | null;
  cartLoading: boolean;
  cartError: string | null;
  activeOrder: OrderResponse | null;
  checkoutPaymentUrl: string | null;
  orderLoading: boolean;
  orderError: string | null;
  orderHistory: PaginatedOrders | null;
  orderHistoryLoading: boolean;
}

const initialState: DirectOrderingState = {
  cart: null,
  cartLoading: false,
  cartError: null,
  activeOrder: null,
  checkoutPaymentUrl: null,
  orderLoading: false,
  orderError: null,
  orderHistory: null,
  orderHistoryLoading: false,
};

export const fetchCartThunk = createAppAsyncThunk(
  'directOrdering/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosApi.cartApi.getMyCart();
      return res.data;
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
    }: { dishId: number; quantity: number; branchId: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosApi.cartApi.addItem({
        dishId,
        quantity,
        branchId,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateCartItemThunk = createAppAsyncThunk(
  'directOrdering/updateCartItem',
  async (
    { dishId, quantity }: { dishId: number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosApi.cartApi.updateItemQuantity(dishId, {
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
  async (dishId: number, { rejectWithValue }) => {
    try {
      const res = await axiosApi.cartApi.removeItem(dishId);
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const clearCartThunk = createAppAsyncThunk(
  'directOrdering/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await axiosApi.cartApi.clearCart();
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
    params: { pageNumber?: number; pageSize?: number } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosApi.orderApi.getMyOrders(
        params?.pageNumber,
        params?.pageSize
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const directOrderingSlice = createSlice({
  name: 'directOrdering',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null;
    },
    clearActiveOrder: (state) => {
      state.activeOrder = null;
      state.checkoutPaymentUrl = null;
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
        state.cart = action.payload;
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.cartLoading = false;
        state.cartError =
          (action.payload as { message?: string })?.message ??
          'Failed to fetch cart';
      })

      .addCase(addCartItemThunk.pending, (state) => {
        state.cartLoading = true;
      })
      .addCase(addCartItemThunk.fulfilled, (state, action) => {
        state.cartLoading = false;
        state.cart = action.payload;
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
        state.cart = null;
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
        state.orderHistoryLoading = false;
        state.orderHistory = action.payload;
      })
      .addCase(fetchOrderHistoryThunk.rejected, (state) => {
        state.orderHistoryLoading = false;
      });
  },
});

export const { clearCart, clearActiveOrder, clearOrderError } =
  directOrderingSlice.actions;

export default directOrderingSlice.reducer;

// Selectors
export const selectCart = (state: RootState): CartResponse | null =>
  state.directOrdering.cart;
export const selectCartLoading = (state: RootState): boolean =>
  state.directOrdering.cartLoading;
export const selectActiveOrder = (state: RootState): OrderResponse | null =>
  state.directOrdering.activeOrder;
export const selectCheckoutPaymentUrl = (state: RootState): string | null =>
  state.directOrdering.checkoutPaymentUrl;
export const selectOrderLoading = (state: RootState): boolean =>
  state.directOrdering.orderLoading;
export const selectOrderError = (state: RootState): string | null =>
  state.directOrdering.orderError;
export const selectOrderHistory = (state: RootState): PaginatedOrders | null =>
  state.directOrdering.orderHistory;
export const selectOrderHistoryLoading = (state: RootState): boolean =>
  state.directOrdering.orderHistoryLoading;
