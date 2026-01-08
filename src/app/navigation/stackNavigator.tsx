import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeBottomTabs } from '@app/navigation/bottomTabNavigator';
import { LoginScreen } from '@features/auth/screens/LoginScreen';
import { OTPScreen } from '@features/auth/screens/OTPScreen';
import { RegisterScreen } from '@features/auth/screens/RegisterScreen';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Register',
  screens: {
    Register: {
      screen: RegisterScreen,
      options: { headerShown: false },
    },
    OTP: {
      screen: OTPScreen,
      options: { headerShown: false },
    },
    Login: {
      screen: LoginScreen,
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
