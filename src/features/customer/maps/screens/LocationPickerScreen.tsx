import {
  LocationPickerMap,
  type PickedLocation,
} from '@features/customer/maps/components/LocationPickerMap';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { locationPickerBus } from '@features/shared/maps/utils/locationPickerBus';
import type { JSX } from 'react';
import React, { useCallback } from 'react';
import { Alert } from 'react-native';

type LocationPickerParams = {
  LocationPicker: {
    initialCoordinate?: [number, number];
    sessionId?: string;
  };
};

export const LocationPickerScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<LocationPickerParams, 'LocationPicker'>>();
  const initialCoordinate = route.params?.initialCoordinate;
  const sessionId = route.params?.sessionId;

  const handleConfirm = useCallback(
    (location: PickedLocation) => {
      if (sessionId) {
        locationPickerBus.emit(sessionId, location);
        navigation.goBack();
        return;
      }
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
    [navigation, sessionId]
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
