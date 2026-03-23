import { axiosApi } from '@lib/api/apiInstance';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import type { EventSubscription } from 'expo-notifications';
import * as Notifications from 'expo-notifications';
import { PermissionStatus } from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

/** Show notification banner even when the app is in the foreground. */
Notifications.setNotificationHandler({
  // eslint-disable-next-line @typescript-eslint/require-await
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  // Check / request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== PermissionStatus.GRANTED) {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== PermissionStatus.GRANTED) {
    console.warn('Push notification permission not granted');
    return null;
  }

  // Android: create a default channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#9FD356',
    });
  }

  // Get the Expo push token
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn('No projectId found — cannot get push token');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenData.data;
}

interface UseNotificationsReturn {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  lastResponse: Notifications.NotificationResponse | null;
}

/**
 * Hook that registers for push notifications and returns the Expo push token.
 *
 * - Requests permission on mount (only when user is authenticated).
 * - Sends the token to the backend so it can target this device.
 * - Returns the latest `Notification` (foreground) and `NotificationResponse` (tap).
 */
export const useNotifications = (
  isAuthenticated: boolean
): UseNotificationsReturn => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [lastResponse, setLastResponse] =
    useState<Notifications.NotificationResponse | null>(null);

  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Register and send token to backend
    void registerForPushNotificationsAsync().then(async (token) => {
      if (!token) return;
      console.log(token);

      setExpoPushToken(token);

      try {
        await axiosApi.notificationApi.registerPushToken({
          expoPushToken: token,
          platform: Platform.OS as 'ios' | 'android',
        });
      } catch {
        // Backend may not have the endpoint yet — token is still stored locally
        console.warn('Failed to register push token with backend');
      }
    });

    // Listener: notification received while app is in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((n) => {
        setNotification(n);
      });

    // Listener: user tapped a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        setLastResponse(response);
      });

    return (): void => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated]);

  return { expoPushToken, notification, lastResponse };
};
