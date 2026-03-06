import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

export interface UserCoords {
  latitude: number;
  longitude: number;
}

export const useLocationPermission = (): {
  permissionStatus: Location.PermissionStatus;
  retryPermission: () => void;
  coords: UserCoords | null;
} => {
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus>(Location.PermissionStatus.UNDETERMINED);
  const [coords, setCoords] = useState<UserCoords | null>(null);

  const fetchCoords = useCallback(async (): Promise<void> => {
    try {
      const cached = await Location.getLastKnownPositionAsync();
      if (cached) {
        setCoords({
          latitude: cached.coords.latitude,
          longitude: cached.coords.longitude,
        });
        return;
      }
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch {
      // coords stay null — callers handle gracefully
    }
  }, []);

  const requestLocationPermission = useCallback(async (): Promise<void> => {
    try {
      const { status: existingStatus } =
        await Location.getForegroundPermissionsAsync();

      if (existingStatus === Location.PermissionStatus.GRANTED) {
        setPermissionStatus(Location.PermissionStatus.GRANTED);
        await fetchCoords();
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === Location.PermissionStatus.GRANTED) {
        setPermissionStatus(Location.PermissionStatus.GRANTED);
        await fetchCoords();
      } else {
        setPermissionStatus(Location.PermissionStatus.DENIED);
        showPermissionDeniedAlert();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setPermissionStatus(Location.PermissionStatus.DENIED);
    }
  }, [fetchCoords]);

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
    coords,
  };
};
