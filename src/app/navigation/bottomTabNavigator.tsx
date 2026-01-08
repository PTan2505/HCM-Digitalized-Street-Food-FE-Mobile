import { CustomBottomTabBar } from '@components/navigation/CustomBottomTabBar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

export const HomeBottomTabs = createBottomTabNavigator({
  tabBar: (props) => <CustomBottomTabBar {...props} />,

  screenOptions: {
    headerShown: true,
  },
  screens: {},
});
