import { AuthScreen } from '@features/auth/screens/AuthScreen';
import { ManagerFeedbackDetailScreen } from '@features/manager/feedback/screens/ManagerFeedbackDetailScreen';
import { ManagerFeedbackScreen } from '@features/manager/feedback/screens/ManagerFeedbackScreen';
import { ManagerMenuScreen } from '@features/manager/menu/ManagerMenuScreen';
import { ManagerOrderDetailScreen } from '@features/manager/orders/screens/ManagerOrderDetailScreen';
import { ManagerScheduleScreen } from '@features/manager/schedule/ManagerScheduleScreen';
import { ManagerDayOffScreen } from '@manager/day-off/ManagerDayOffScreen';
import { VendorCampaignDetailScreen } from '@manager/campaigns/screens/VendorCampaignDetailScreen';
import { VendorCreateCampaignScreen } from '@manager/campaigns/screens/VendorCreateCampaignScreen';
import { VendorEditCampaignScreen } from '@manager/campaigns/screens/VendorEditCampaignScreen';
import { VendorSystemCampaignDetailScreen } from '@manager/campaigns/screens/VendorSystemCampaignDetailScreen';
import { EditBranchScreen } from '@manager/branch/screens/EditBranchScreen';
import { AddDayOffScreen } from '@manager/day-off/screens/AddDayOffScreen';
import { VendorBranchDetailScreen } from '@manager/vendor-branches/screens/VendorBranchDetailScreen';
import { VendorEditBranchScreen } from '@manager/vendor-branches/screens/VendorEditBranchScreen';
import { useManagerSelector } from '@manager-app/managerHooks';
import { ManagerMainTabs } from '@manager-app/navigation/bottomTabNavigator';
import { createStaticNavigation, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from '@utils/navigationRef';
import React from 'react';

const ManagerRootStack = createNativeStackNavigator({
  initialRouteName: 'Auth',
  screenOptions: { headerShown: false },
  screens: {
    Auth: {
      screen: AuthScreen,
    },
    ManagerHome: {
      screen: ManagerMainTabs,
    },
    ManagerOrderDetail: {
      screen: ManagerOrderDetailScreen,
    },
    ManagerFeedbackDetail: {
      screen: ManagerFeedbackDetailScreen,
    },
    ManagerEditBranch: {
      screen: EditBranchScreen,
    },
    ManagerAddDayOff: {
      screen: AddDayOffScreen,
    },
    // Branch management screens (used by both roles via stack push)
    ManagerSchedule: {
      screen: ManagerScheduleScreen,
    },
    ManagerDayOff: {
      screen: ManagerDayOffScreen,
    },
    ManagerMenu: {
      screen: ManagerMenuScreen,
    },
    ManagerFeedback: {
      screen: ManagerFeedbackScreen,
    },
    // Vendor-only routes
    VendorBranchDetail: {
      screen: VendorBranchDetailScreen,
    },
    VendorEditBranch: {
      screen: VendorEditBranchScreen,
    },
    VendorCampaignDetail: {
      screen: VendorCampaignDetailScreen,
    },
    VendorCreateCampaign: {
      screen: VendorCreateCampaignScreen,
    },
    VendorEditCampaign: {
      screen: VendorEditCampaignScreen,
    },
    VendorSystemCampaignDetail: {
      screen: VendorSystemCampaignDetailScreen,
    },
  },
});

const StaticNavigation = createStaticNavigation(ManagerRootStack);

export function ManagerNavigation({
  theme,
}: {
  theme: Theme;
}): React.JSX.Element {
  const user = useManagerSelector((state) => state.user.value);

  return (
    <StaticNavigation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={navigationRef as any}
      theme={theme}
      initialState={{
        index: 0,
        routes: [{ name: user !== null ? 'ManagerHome' : 'Auth' }],
      }}
      linking={{
        prefixes: ['lowca-manager://'],
      }}
    />
  );
}
