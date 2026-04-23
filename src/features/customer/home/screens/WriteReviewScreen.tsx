import { ReviewFormModal } from '@features/customer/home/components/ReviewFormModal';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { View } from 'react-native';

type WriteReviewScreenProps = StaticScreenProps<{
  orderId: number;
  branchId: number;
}>;

export const WriteReviewScreen = ({
  route,
}: WriteReviewScreenProps): JSX.Element => {
  const { orderId, branchId } = route.params;
  const navigation = useNavigation();

  const handleClose = (): void => {
    navigation.goBack();
  };

  const handleSuccess = (): void => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <ReviewFormModal
        visible
        branchId={branchId}
        orderId={orderId}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </View>
  );
};
