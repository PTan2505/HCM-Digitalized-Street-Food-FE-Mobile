import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

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

  // Re-checks the OS permission status without showing the system dialog.
  // Used on mount (to read a previously granted/denied status) and when the
  // app returns to foreground after the user changes settings.
  const syncPermission = useCallback(async (): Promise<void> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status === Location.PermissionStatus.GRANTED) {
        await fetchCoords();
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setPermissionStatus(Location.PermissionStatus.DENIED);
    }
  }, [fetchCoords]);

  // On mount: show the system dialog only when truly UNDETERMINED (first time).
  // For GRANTED/DENIED we just read the existing status — this prevents multiple
  // screens mounting this hook from each re-triggering the permission dialog.
  useEffect(() => {
    let cancelled = false;

    const checkPermission = async (): Promise<void> => {
      try {
        const { status: existingStatus } =
          await Location.getForegroundPermissionsAsync();

        if (cancelled) return;

        if (existingStatus === Location.PermissionStatus.UNDETERMINED) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (!cancelled) {
            setPermissionStatus(status);
            if (status === Location.PermissionStatus.GRANTED) {
              await fetchCoords();
            }
          }
        } else {
          setPermissionStatus(existingStatus);
          if (existingStatus === Location.PermissionStatus.GRANTED) {
            await fetchCoords();
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error requesting location permission:', error);
          setPermissionStatus(Location.PermissionStatus.DENIED);
        }
      }
    };

    void checkPermission();

    return (): void => {
      cancelled = true;
    };
  }, [fetchCoords]);

  // Re-check when the app returns to foreground — the user may have changed
  // the permission in the device Settings while the app was in background.
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState): void => {
        if (nextState === 'active') {
          void syncPermission();
        }
      }
    );
    return (): void => {
      subscription.remove();
    };
  }, [syncPermission]);

  // Opens the app's system settings page so the user can grant the permission.
  // When they return to the app the AppState listener above re-checks and
  // updates permissionStatus / coords automatically.
  const retryPermission = useCallback((): void => {
    void Linking.openSettings();
  }, []);

  return {
    permissionStatus,
    retryPermission,
    coords,
  };
};
