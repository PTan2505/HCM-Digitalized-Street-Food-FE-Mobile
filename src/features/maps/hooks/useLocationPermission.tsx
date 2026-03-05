import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

export const useLocationPermission = (): {
  permissionStatus: Location.PermissionStatus;
  retryPermission: () => void;
} => {
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus>(Location.PermissionStatus.UNDETERMINED);

  const requestLocationPermission = useCallback(async (): Promise<void> => {
    try {
      const { status: existingStatus } =
        await Location.getForegroundPermissionsAsync();

      if (existingStatus === Location.PermissionStatus.GRANTED) {
        setPermissionStatus(Location.PermissionStatus.GRANTED);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === Location.PermissionStatus.GRANTED) {
        setPermissionStatus(Location.PermissionStatus.GRANTED);
      } else {
        setPermissionStatus(Location.PermissionStatus.DENIED);
        showPermissionDeniedAlert();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setPermissionStatus(Location.PermissionStatus.DENIED);
    }
  }, []);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  const showPermissionDeniedAlert = (): void => {
    Alert.alert(
      'Quyền truy cập vị trí',
      'Ứng dụng cần quyền truy cập vị trí để hiển thị các quán ăn gần bạn. Vui lòng cấp quyền trong cài đặt.',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Mở cài đặt',
          onPress: (): void => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  };

  const retryPermission = (): void => {
    requestLocationPermission();
  };

  return {
    permissionStatus,
    retryPermission,
  };
};
