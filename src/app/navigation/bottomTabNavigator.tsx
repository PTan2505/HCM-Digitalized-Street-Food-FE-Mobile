import { CustomBottomTabBar } from '@components/navigation/CustomBottomTabBar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

export const HomeBottomTabs = createBottomTabNavigator({
  tabBar: (props) => <CustomBottomTabBar {...props} />,

  initialRouteName: 'ForgetPassword',
  screenOptions: {
    headerShown: true,
    headerStyle: { backgroundColor: 'tomato' },
    tabBarActiveIndicatorColor: 'red',
  },
  screens: {
    // ForgetPassword: {
    //   screen: ForgetPasswordScreen,
    //   options: {
    //     title: 'Khám phá',
    //     tabBarIcon: ({ color, size }) => (
    //       <Image
    //         source={discovery}
    //         style={{
    //           width: size,
    //           height: size,
    //           tintColor: color,
    //         }}
    //         resizeMode="contain"
    //       />
    //     ),
    //   },
    // },
  },
});
