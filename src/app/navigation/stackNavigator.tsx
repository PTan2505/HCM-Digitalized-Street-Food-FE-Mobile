import { HomeBottomTabs } from '@app/navigation/bottomTabNavigator';
import type { TabType } from '@features/home/components/TabsBar';
import CurrentPickDetailsScreen from '@features/home/screens/CurrentPickDetailsScreen';
import CurrentPicksScreen from '@features/home/screens/CurrentPicksScreen';
import RestaurantDetailsScreen from '@features/home/screens/RestaurantDetailsScreen';
import RestaurantSwipeScreen from '@features/home/screens/RestaurantSwipeScreen';
import SearchScreen from '@features/home/screens/SearchScreen';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthScreen } from '@features/auth/screens/AuthScreen';
import ProfileScreen from '@features/user/screens/ProfileScreen';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Main',
  screenOptions: { headerShown: false },
  screens: {
    Auth: {
      screen: AuthScreen,
    },

    Main: {
      screen: HomeBottomTabs,
    },
    Search: {
      screen: SearchScreen,
    },
    RestaurantSwipe: {
      screen: RestaurantSwipeScreen,
    },
    RestaurantDetails: {
      screen: RestaurantDetailsScreen,
      initialParams: {} as { tab?: TabType },
    },
    CurrentPicks: {
      screen: CurrentPicksScreen,
    },
    CurrentPickDetails: {
      screen: CurrentPickDetailsScreen,
    },
    Profile: {
      screen: ProfileScreen,
    },
    // OTP: {
    //   screen: OTPScreen,
    //   options: { headerShown: false },
    // },
    // ForgetPassword: {
    //   screen: ForgetPasswordScreen,
    //   options: { headerShown: false },
    // },
    // ResetPassword: {
    //   screen: ResetPasswordScreen,
    //   options: { headerShown: false },
    // },
  },
});

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {
      RestaurantDetails: { tab?: TabType };
    }
  }
}

export const Navigation = createStaticNavigation(RootStack);
