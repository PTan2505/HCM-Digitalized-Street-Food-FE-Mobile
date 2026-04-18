import Constants from 'expo-constants';

type AppVariant = 'customer' | 'manager';

export const appVariant: AppVariant =
  (Constants.expoConfig?.extra as { appVariant?: AppVariant } | undefined)
    ?.appVariant ?? 'customer';

export const isManagerApp = appVariant === 'manager';
