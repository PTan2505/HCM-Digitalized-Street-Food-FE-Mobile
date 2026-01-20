import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeBottomTabs } from '@app/navigation/bottomTabNavigator';
import { AuthScreen } from '@features/auth/screens/AuthScreen';
import { ForgetPasswordScreen } from '@features/auth/screens/ForgetPasswordScreen';
import { OTPScreen } from '@features/auth/screens/OTPScreen';
import { ResetPasswordScreen } from '@features/auth/screens/ResetPasswordScreen';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Auth',
  screens: {
    Auth: {
      screen: AuthScreen,
      options: { headerShown: false },
    },
    OTP: {
      screen: OTPScreen,
      options: { headerShown: false },
    },
    ForgetPassword: {
      screen: ForgetPasswordScreen,
      options: { headerShown: false },
    },
    ResetPassword: {
      screen: ResetPasswordScreen,
      options: { headerShown: false },
    },
    Main: {
      screen: HomeBottomTabs,
      options: {
        headerShown: false,
      },
    },
  },
});

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}

export const Navigation = createStaticNavigation(RootStack);
