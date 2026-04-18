import { AuthScreen } from '@features/auth/screens/AuthScreen';
import { NotificationScreen } from '@features/notifications/screens/NotificationScreen';
import { useAppSelector } from '@hooks/reduxHooks';
import { createStaticNavigation, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { selectUser } from '@slices/auth';
import { navigationRef } from '@utils/navigationRef';

const ManagerRootStack = createNativeStackNavigator({
  initialRouteName: 'Auth',
  screenOptions: { headerShown: false },
  screens: {
    Auth: {
      screen: AuthScreen,
    },
    Notifications: {
      screen: NotificationScreen,
      linking: 'notifications',
    },
    // TODO: add manager screens here
  },
});

// Manager routes are merged into the shared global RootParamList via
// the customer stackNavigator's declaration. Do NOT add a second global
// declaration here — it would conflict with the customer's augmentation
// since both files share the same TypeScript compilation.

const StaticNavigation = createStaticNavigation(ManagerRootStack);

export function ManagerNavigation({
  theme,
}: {
  theme: Theme;
}): React.JSX.Element {
  const user = useAppSelector(selectUser);

  return (
    <StaticNavigation
      ref={navigationRef}
      theme={theme}
      initialState={{
        index: 0,
        routes: [{ name: user !== null ? 'Notifications' : 'Auth' }],
      }}
      linking={{
        prefixes: ['lowca-manager://'],
      }}
    />
  );
}
