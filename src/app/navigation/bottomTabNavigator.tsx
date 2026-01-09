import { CustomBottomTabBar } from '@components/navigation/CustomBottomTabBar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '@features/home/screens/HomeScreen';

export const HomeBottomTabs = createBottomTabNavigator({
  tabBar: (props) => <CustomBottomTabBar {...props} />,

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
  },
});
