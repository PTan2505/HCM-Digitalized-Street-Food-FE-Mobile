import {
  ORDER_STATUS,
  type OrderStatus,
  type PickupCodeResponse,
} from '@features/customer/direct-ordering/api/cartApi';
import { axiosApi } from '@lib/api/apiInstance';
import { useEffect, useState } from 'react';

const SHOW_PICKUP_STATUSES: OrderStatus[] = [
  ORDER_STATUS.Paid,
  ORDER_STATUS.Complete,
];

export const usePickupCode = (
  orderId: number,
  orderStatus: OrderStatus | undefined
): { pickupCode: PickupCodeResponse | null } => {
  const [pickupCode, setPickupCode] = useState<PickupCodeResponse | null>(null);

  useEffect(() => {
    if (
      orderStatus === undefined ||
      !SHOW_PICKUP_STATUSES.includes(orderStatus)
    ) {
      return;
    }
    axiosApi.orderApi
      .getPickupCode(orderId)
      .then((res) => {
        if (res.data) {
          setPickupCode(res.data);
        }
      })
      .catch(() => {});
  }, [orderId, orderStatus]);

  return { pickupCode };
};
