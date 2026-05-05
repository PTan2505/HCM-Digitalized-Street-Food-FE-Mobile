import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

export interface UserCoords {
  latitude: number;
  longitude: number;
}

let sharedPermissionStatus: Location.PermissionStatus | null = null;
let sharedCoords: UserCoords | null = null;
let permissionRequestPromise: Promise<Location.PermissionStatus> | null = null;
let coordsRequestPromise: Promise<UserCoords | null> | null = null;
let hasAutoRequestedForegroundPermission = false;
let hasAttemptedCurrentPosition = false;

const requestForegroundPermissionOnce =
  async (): Promise<Location.PermissionStatus> => {
    permissionRequestPromise ??= Location.requestForegroundPermissionsAsync()
      .then(({ status }) => status)
      .then((status) => status)
      .finally(() => {
        permissionRequestPromise = null;
      });
    return permissionRequestPromise;
  };

const fetchCoordsOnce = async (): Promise<UserCoords | null> => {
  if (sharedCoords) {
    return sharedCoords;
  }
  coordsRequestPromise ??= (async (): Promise<UserCoords | null> => {
    const cached = await Location.getLastKnownPositionAsync();
    if (cached) {
      return {
        latitude: cached.coords.latitude,
        longitude: cached.coords.longitude,
      };
    }

    if (hasAttemptedCurrentPosition) {
      return null;
    }

    hasAttemptedCurrentPosition = true;
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    };
  })().finally(() => {
    coordsRequestPromise = null;
  });

  const resolved = await coordsRequestPromise;
  if (resolved) {
    sharedCoords = resolved;
  }
  return resolved;
};

let sharedCoordsSettled = false;

export const useLocationPermission = (): {
  permissionStatus: Location.PermissionStatus;
  retryPermission: () => void;
  coords: UserCoords | null;
  coordsSettled: boolean;
} => {
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus>(
      sharedPermissionStatus ?? Location.PermissionStatus.UNDETERMINED
    );
  const [coords, setCoords] = useState<UserCoords | null>(sharedCoords);
  const [coordsSettled, setCoordsSettled] = useState(sharedCoordsSettled);

  const fetchCoords = useCallback(async (): Promise<void> => {
    try {
      const resolvedCoords = await fetchCoordsOnce();
      if (resolvedCoords) {
        setCoords(resolvedCoords);
      }
    } catch {
      // coords stay null — callers handle gracefully
    } finally {
      sharedCoordsSettled = true;
      setCoordsSettled(true);
    }
  }, []);

  // Re-checks the OS permission status without showing the system dialog.
  // Used on mount (to read a previously granted/denied status) and when the
  // app returns to foreground after the user changes settings.
  const syncPermission = useCallback(async (): Promise<void> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      sharedPermissionStatus = status;
      setPermissionStatus(status);
      if (status === Location.PermissionStatus.DENIED) {
        sharedCoords = null;
        setCoords(null);
      }
    } catch {
      sharedPermissionStatus = Location.PermissionStatus.DENIED;
      setPermissionStatus(Location.PermissionStatus.DENIED);
    }
  }, []);

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

        let nextStatus = existingStatus;

        if (
          existingStatus === Location.PermissionStatus.UNDETERMINED &&
          !hasAutoRequestedForegroundPermission
        ) {
          hasAutoRequestedForegroundPermission = true;
          nextStatus = await requestForegroundPermissionOnce();
        }

        if (cancelled) return;

        sharedPermissionStatus = nextStatus;
        setPermissionStatus(nextStatus);
        if (nextStatus === Location.PermissionStatus.GRANTED) {
          await fetchCoords();
        } else if (nextStatus === Location.PermissionStatus.DENIED) {
          // If permission is denied from Settings while app is running,
          // clear stale coordinates so UI can reflect the denied state.
          sharedCoords = null;
          setCoords(null);
          sharedCoordsSettled = true;
          setCoordsSettled(true);
        }
      } catch {
        if (!cancelled) {
          sharedPermissionStatus = Location.PermissionStatus.DENIED;
          setPermissionStatus(Location.PermissionStatus.DENIED);
        }
      }
    };

    if (sharedPermissionStatus !== null) {
      setPermissionStatus(sharedPermissionStatus);
      if (sharedPermissionStatus === Location.PermissionStatus.GRANTED) {
        void fetchCoords();
      } else if (sharedPermissionStatus === Location.PermissionStatus.DENIED) {
        setCoords(null);
        sharedCoordsSettled = true;
        setCoordsSettled(true);
      }
    } else {
      void checkPermission();
    }

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
    coordsSettled,
  };
};
