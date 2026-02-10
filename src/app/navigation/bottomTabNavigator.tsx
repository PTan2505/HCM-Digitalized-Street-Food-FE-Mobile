import discoveryIcon from '@assets/icons/discovery.svg';
import profileIcon from '@assets/icons/profileIcon.svg';
import { CustomBottomTabBar } from '@components/navigation/CustomBottomTabBar';
import SvgIcon from '@components/SvgIcon';
import HomeScreen from '@features/home/screens/HomeScreen';
import ProfileScreen from '@features/user/screens/ProfileScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

export const HomeBottomTabs = createBottomTabNavigator({
  tabBar: (props) => <CustomBottomTabBar {...props} />,

  initialRouteName: 'Home',
  screenOptions: {
    headerShown: false,
    headerStyle: { backgroundColor: 'tomato' },
    tabBarActiveIndicatorColor: 'red',
  },
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: 'Khám phá',
        tabBarIcon: ({ color, size }) => (
          <SvgIcon
            icon={discoveryIcon}
            style={{
              width: size,
              height: size,
            }}
            color={color}
          />
        ),
      },
    },
    Profile: {
      screen: ProfileScreen,
      options: {
        title: 'Tài khoản',
        tabBarIcon: ({ color, size }) => (
          <SvgIcon
            icon={profileIcon}
            style={{
              width: size,
              height: size,
            }}
            color={color}
          />
        ),
      },
    },
  },
});
