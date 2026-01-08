import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';

import { RegisterScreen } from '@features/auth/screens/RegisterScreen';
import { OTPScreen } from '@features/auth/screens/OTPScreen';
import { LoginScreen } from '@features/auth/screens/LoginScreen';

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
