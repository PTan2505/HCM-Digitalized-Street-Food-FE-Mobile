import { CustomBottomTabBar } from '@components/navigation/CustomBottomTabBar';
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
        title: 'Home',
      },
    },
    Profile: {
      screen: ProfileScreen,
      options: {
        title: 'Profile',
      },
    },
  },
});
