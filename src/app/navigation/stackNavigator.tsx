import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeBottomTabs } from '@app/navigation/bottomTabNavigator';
import RestaurantDetailsScreen from '@features/home/screens/RestaurantDetailsScreen';
import CurrentPicksScreen from '@features/home/screens/CurrentPicksScreen';
import CurrentPickDetailsScreen from '@features/home/screens/CurrentPickDetailsScreen';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'CurrentPickDetails',
  screens: {
    Main: {
      screen: HomeBottomTabs,
      options: {
        headerShown: false,
      },
    },
    RestaurantDetails: {
      screen: RestaurantDetailsScreen,
      options: {
        headerShown: false,
      },
    },
    CurrentPicks: {
      screen: CurrentPicksScreen,
      options: {
        headerShown: false,
      },
    },
    CurrentPickDetails: {
      screen: CurrentPickDetailsScreen,
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
    interface RootParamList extends RootStackParamList { }
  }
}

export const Navigation = createStaticNavigation(RootStack);
