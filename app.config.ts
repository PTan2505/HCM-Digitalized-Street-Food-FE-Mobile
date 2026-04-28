import type { ConfigContext, ExpoConfig } from 'expo/config';

const variant = process.env.APP_VARIANT ?? 'customer';
const isManager = variant === 'manager';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: isManager ? 'Lowca Manager' : 'Lowca',
  scheme: isManager ? 'lowca-manager' : 'lowca',
  slug: isManager
    ? 'hcm-digitalized-street-food-fe-mobile-manager'
    : 'hcm-digitalized-street-food-fe-mobile',
  version: '1.0.0',
  owner: 'street-food',
  orientation: 'portrait',
  icon: './assets/adaptive-icon.png',
  userInterfaceStyle: 'light',
  backgroundColor: '#ffffff',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: isManager
      ? 'com.hcmstreetfood.manager'
      : 'com.hcmstreetfood.mobile',
    icon: isManager
      ? './assets/ios-light-manager.png'
      : './assets/ios-light.png',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Allow Lowca to access your location to show nearby street food vendors.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Allow Lowca to access your location to show nearby street food vendors.',
      NSCameraUsageDescription: 'Allow Lowca to access your camera.',
      NSPhotoLibraryUsageDescription:
        'Allow Lowca to access your photo library.',
      ITSAppUsesNonExemptEncryption: false,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
      NSUserTrackingUsageDescription:
        'This identifier ensures a secure login experience.',
    },
  },
  android: {
    package: isManager
      ? 'com.hcmstreetfood.manager'
      : 'com.hcmstreetfood.mobile',
    googleServicesFile: isManager
      ? (process.env.GOOGLE_SERVICES_JSON_MANAGER ??
        './google-services-manager.json')
      : (process.env.GOOGLE_SERVICES_JSON ?? './google-services.json'),
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      monochromeImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'CAMERA',
      'READ_MEDIA_IMAGES',
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
    ],
    intentFilters: isManager
      ? []
      : [
          {
            action: 'VIEW',
            autoVerify: true,
            data: [
              {
                scheme: 'https',
                host: 'lowca-seven.vercel.app',
                pathPrefix: '/',
              },
            ],
            category: ['BROWSABLE', 'DEFAULT'],
          },
        ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  extra: {
    appVariant: variant,
    eas: {
      projectId: isManager
        ? 'a3799062-c31f-47b5-ad2b-a387d0179f1b'
        : 'fc2233e3-5c88-40b1-9ee2-e576aa043330',
    },
  },
  plugins: [
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: isManager
          ? 'com.googleusercontent.apps.1007238627252-udfele2m575qjei21vdpr0vanabkg677'
          : 'com.googleusercontent.apps.1007238627252-i94s152d100nfooh48athhbg3lp101s4',
      },
    ],
    [
      'react-native-fbsdk-next',
      {
        appID: '702936619420508',
        clientToken: 'b729db072cd18408c9596df88868a408',
        displayName: isManager ? 'Street Food HCM Manager' : 'Street Food HCM',
        scheme: 'fb702936619420508',
        advertiserIDCollectionEnabled: false,
        autoLogAppEventsEnabled: false,
        isAutoInitEnabled: true,
        iosUserTrackingPermission:
          'This identifier ensures a secure login experience.',
      },
    ],
    'expo-tracking-transparency',
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: true,
        },
        ios: {
          useFrameworks: 'static',
          deploymentTarget: '16.0',
        },
      },
    ],
    [
      'expo-localization',
      {
        supportedLocales: ['en', 'vi'],
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Lowca to access your location to show nearby street food vendors.',
        locationWhenInUsePermission:
          'Allow Lowca to access your location to show nearby street food vendors.',
        isAndroidBackgroundLocationEnabled: false,
      },
    ],
    'expo-font',
    'expo-system-ui',
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow Lowca to access your photo library.',
        cameraPermission: 'Allow Lowca to access your camera.',
      },
    ],
    isManager
      ? './plugins/withAndroidDebugKeystoreManager.cjs'
      : './plugins/withAndroidDebugKeystore.cjs',
    '@maplibre/maplibre-react-native',
    'expo-notifications',
    'expo-av',
  ],
});
