import discovery from '@assets/icons/discovery.png';
import person from '@assets/icons/person.png';
import { CustomBottomTabBar } from '@components/navigation/CustomBottomTabBar';
import { ForgetPasswordScreen } from '@features/auth/screens/ForgetPasswordScreen';
import { OTPScreen } from '@features/auth/screens/OTPScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

export const HomeBottomTabs = createBottomTabNavigator({
  tabBar: (props) => <CustomBottomTabBar {...props} />,

  initialRouteName: 'ForgetPassword',
  screenOptions: {
    headerShown: true,
    headerStyle: { backgroundColor: 'tomato' },
    tabBarActiveIndicatorColor: 'red',
  },
  screens: {
    ForgetPassword: {
      screen: ForgetPasswordScreen,
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
