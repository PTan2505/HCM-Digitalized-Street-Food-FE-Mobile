import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

export const useLocationPermission = (): {
  permissionStatus: 'granted' | 'denied' | 'loading';
  retryPermission: () => void;
} => {
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'denied' | 'loading'
  >('loading');

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async (): Promise<void> => {
    try {
      const { status: existingStatus } =
        await Location.getForegroundPermissionsAsync();

      if (existingStatus === 'granted') {
        setPermissionStatus('granted');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        setPermissionStatus('granted');
      } else {
        setPermissionStatus('denied');
        showPermissionDeniedAlert();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setPermissionStatus('denied');
    }
  };

  const showPermissionDeniedAlert = () => {
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
