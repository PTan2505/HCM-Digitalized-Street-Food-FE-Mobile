import { CustomBottomTabBar } from '@components/navigation/CustomBottomTabBar';
import HomeScreen from '@features/home/screens/HomeScreen';
import ProfileScreen from '@features/user/screens/ProfileScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import discovery from '@assets/icons/discovery.png';
import person from '@assets/icons/person.png';

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
    Profile: {
      screen: ProfileScreen,
      options: {
        title: 'Tài khoản',
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
