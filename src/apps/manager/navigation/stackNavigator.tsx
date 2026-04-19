import { ManagerHomeScreen } from '@manager/screens/ManagerHomeScreen';
import { AuthScreen } from '@features/auth/screens/AuthScreen';
import { useManagerSelector } from '@manager-app/managerHooks';
import { createStaticNavigation, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from '@utils/navigationRef';
import React from 'react';

const ManagerRootStack = createNativeStackNavigator({
  initialRouteName: 'Auth',
  screenOptions: { headerShown: false },
  screens: {
    Auth: {
      screen: AuthScreen,
    },
    ManagerHome: {
      screen: ManagerHomeScreen,
    },
  },
});

const StaticNavigation = createStaticNavigation(ManagerRootStack);

export function ManagerNavigation({
  theme,
}: {
  theme: Theme;
}): React.JSX.Element {
  const user = useManagerSelector((state) => state.user.value);

  return (
    <StaticNavigation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={navigationRef as any}
      theme={theme}
      initialState={{
        index: 0,
        routes: [{ name: user !== null ? 'ManagerHome' : 'Auth' }],
      }}
      linking={{
        prefixes: ['lowca-manager://'],
      }}
    />
  );
}
