import discovery from '@assets/icons/discovery.png';
import person from '@assets/icons/person.png';
import { CustomBottomTabBar } from '@components/navigation/CustomBottomTabBar';
import { LoginScreen } from '@features/auth/screens/LoginScreen';
import { OTPScreen } from '@features/auth/screens/OTPScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStaticNavigation,
  DefaultTheme,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';

const HomeBottomTabs = createBottomTabNavigator({
  tabBar: (props) => <CustomBottomTabBar {...props} />,

  initialRouteName: 'LoginScreen',
  screenOptions: {
    headerShown: true,
    headerStyle: { backgroundColor: 'tomato' },
    tabBarActiveIndicatorColor: 'red',
  },
  screens: {
    LoginScreen: {
      screen: LoginScreen,
      options: {
        title: 'Khám phá',
        tabBarIcon: ({ color, size }) => (
          <Image
            source={discovery}
            style={{
              width: size,
              height: size,
              tintColor: color,
            }}
            resizeMode="contain"
          />
        ),
      },
    },
    OTP: {
      screen: OTPScreen,
      options: {
        title: 'Cá nhân',
        tabBarIcon: ({ color, size }) => (
          <Image
            source={person}
            style={{
              width: size,
              height: size,
              tintColor: color,
            }}
            resizeMode="contain"
          />
        ),
      },
    },
  },
});

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Main',
  screens: {
    Main: {
      screen: HomeBottomTabs,
      options: {
        headerShown: false,
      },
    },
    LoginScreen: {
      screen: LoginScreen,
      options: {
        headerShown: false,
      },
    },
  },
});

export const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    fonts: ['Nunito'],
    primary: 'rgba(255, 255, 255, 1)',
  },
};

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
export const Navigation = createStaticNavigation(RootStack);
