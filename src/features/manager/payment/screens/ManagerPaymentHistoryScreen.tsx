import { PaymentHistoryScreen } from '@features/user/screens/PaymentHistoryScreen';
import { useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';

export const ManagerPaymentHistoryScreen = (): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  return (
    <PaymentHistoryScreen
      onTransactionPress={(tx) => {
        if (tx.orderId === null) return;
        navigation.navigate('ManagerOrderDetail', { orderId: tx.orderId });
      }}
    />
  );
};
