import { HomeBottomTabs } from '@app/navigation/bottomTabNavigator';
import { CurrentPickDetailsScreen } from '@features/home/screens/CurrentPickDetailsScreen';
import { CurrentPicksScreen } from '@features/home/screens/CurrentPicksScreen';
import { RestaurantDetailsScreen } from '@features/home/screens/RestaurantDetailsScreen';
import { RestaurantSwipeScreen } from '@features/home/screens/RestaurantSwipeScreen';
import { SearchScreen } from '@features/home/screens/SearchScreen';
import { LocationPickerScreen } from '@features/maps/screens/LocationPickerScreen';
import { MapScreen } from '@features/maps/screens/MapScreen';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  createStaticNavigation,
  StaticParamList,
  Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { selectUserStatus } from '@slices/auth';
import { ActivityIndicator, View } from 'react-native';

import { AuthScreen } from '@features/auth/screens/AuthScreen';
// import ProfileScreen from '@features/user/screens/ProfileScreen';
import type { TabType } from '@features/home/components/restaurantDetails/TabsBar';
import type { ActiveBranch } from '@features/home/types/branch';
import { DietaryPreferencesScreen } from '@features/user/screens/DietaryPreferencesScreen';
import { EditUserInfoScreen } from '@features/user/screens/EditUserProfileScreen';
import { ProfileScreen } from '@features/user/screens/ProfileScreen';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Auth',
  screenOptions: { headerShown: false },
  screens: {
    Auth: {
      screen: AuthScreen,
    },
    Main: {
      screen: HomeBottomTabs,
    },
    Search: {
      screen: SearchScreen,
      params: {} as {
        autoFocus?: boolean;
        openFilter?: boolean;
      },
    },
    RestaurantSwipe: {
      screen: RestaurantSwipeScreen,
      params: {} as {
        branch: ActiveBranch;
        displayName: string;
      },
    },
    RestaurantDetails: {
      screen: RestaurantDetailsScreen,
      params: {} as {
        branch: ActiveBranch;
        displayName: string;
        tab?: TabType;
        onRatingUpdate?: (avgRating: number, totalReviewCount: number) => void;
      },
    },
    CurrentPicks: {
      screen: CurrentPicksScreen,
    },
    CurrentPickDetails: {
      screen: CurrentPickDetailsScreen,
    },
    SetupUserInfo: {
      screen: EditUserInfoScreen,
    },
    DietaryPreferences: {
      screen: DietaryPreferencesScreen,
    },
    Profile: {
      screen: ProfileScreen,
    },
    Map: {
      screen: MapScreen,
    },
    LocationPicker: {
      screen: LocationPickerScreen,
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

const StaticNavigation = createStaticNavigation(RootStack);

export function Navigation({ theme }: { theme: Theme }): React.JSX.Element {
  const userStatus = useAppSelector(selectUserStatus);

  // Show loading indicator only while initially checking authentication (idle state)
  // Don't show loading during pending state to avoid unmounting screens during API calls
  if (userStatus === 'idle') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <StaticNavigation theme={theme} />;
}
