import {
  LocationPickerMap,
  type PickedLocation,
} from '@features/customer/maps/components/LocationPickerMap';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { JSX } from 'react';
import React, { useCallback } from 'react';
import { Alert } from 'react-native';

type LocationPickerParams = {
  LocationPicker: {
    initialCoordinate?: [number, number];
  };
};

export const LocationPickerScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<LocationPickerParams, 'LocationPicker'>>();
  const initialCoordinate = route.params?.initialCoordinate;

  const handleConfirm = useCallback(
    (location: PickedLocation) => {
      // For now, show the result. In production, pass back via navigation params.
      Alert.alert(
        'Vị trí đã chọn',
        `Địa chỉ: ${location.address}\n\nTọa độ: ${location.coordinate[1].toFixed(6)}, ${location.coordinate[0].toFixed(6)}`,
        [
          {
            text: 'OK',
            onPress: (): void => navigation.goBack(),
          },
        ]
      );
    },
    [navigation]
  );

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <LocationPickerMap
      initialCoordinate={initialCoordinate}
      onConfirm={handleConfirm}
      onBack={handleBack}
    />
  );
};
