import { COLORS } from '@constants/colors';
import { ROLES } from '@constants/roles';
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ManagerDashboardScreen } from '@features/manager/dashboard/ManagerDashboardScreen';
import { ManagerOrdersScreen } from '@features/manager/orders/screens/ManagerOrdersScreen';
import { useUnreadNotificationCount } from '@features/notifications/hooks/useUnreadNotificationCount';
import { NotificationScreen } from '@features/notifications/screens/NotificationScreen';
import { ProfileScreen } from '@features/user/screens/ProfileScreen';
import { useManagerSelector } from '@manager-app/managerHooks';
import { ManagerBranchHomeScreen } from '@manager/branch/screens/ManagerBranchHomeScreen';
import { VendorCampaignScreen } from '@manager/campaigns/screens/VendorCampaignScreen';
import { VendorBranchListScreen } from '@manager/vendor-branches/screens/VendorBranchListScreen';
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const useTabBarScreenOptions = (): BottomTabNavigationOptions => {
  const insets = useSafeAreaInsets();
  return {
    headerShown: false,
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: '#9CA3AF',
    tabBarStyle: {
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
      paddingBottom: insets.bottom + 4,
      paddingTop: 4,
      height: 60 + insets.bottom,
    },
    tabBarLabelStyle: {
      fontSize: 10,
      fontFamily: 'Nunito-Medium',
    },
  };
};

const VendorTabs = (): JSX.Element => {
  const { t } = useTranslation();
  const { unreadCount } = useUnreadNotificationCount();
  const tabBarScreenOptions = useTabBarScreenOptions();

  return (
    <Tab.Navigator
      initialRouteName="VendorDashboard"
      screenOptions={tabBarScreenOptions}
    >
      <Tab.Screen
        name="VendorDashboard"
        component={ManagerDashboardScreen}
        options={{
          title: t('manager_tabs.dashboard'),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="VendorBranches"
        component={VendorBranchListScreen}
        options={{
          title: t('manager_tabs.branch'),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="store" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="VendorOrders"
        component={ManagerOrdersScreen}
        options={{
          title: t('manager_tabs.orders'),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="VendorCampaigns"
        component={VendorCampaignScreen}
        options={{
          title: t('manager_tabs.campaigns'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="campaign" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="VendorNotifications"
        component={NotificationScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          title: t('manager_tabs.notifications'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="VendorAccount"
        component={ProfileScreen}
        options={{
          title: t('manager_tabs.account'),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="circle-user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const ManagerTabs = (): JSX.Element => {
  const { t } = useTranslation();
  const { unreadCount } = useUnreadNotificationCount();
  const tabBarScreenOptions = useTabBarScreenOptions();

  return (
    <Tab.Navigator
      initialRouteName="ManagerBranch"
      screenOptions={tabBarScreenOptions}
    >
      <Tab.Screen
        name="ManagerBranch"
        component={ManagerBranchHomeScreen}
        options={{
          title: t('manager_tabs.branch'),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="store" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManagerOrders"
        component={ManagerOrdersScreen}
        options={{
          title: t('manager_tabs.orders'),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          title: t('manager_tabs.notifications'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManagerAccount"
        component={ProfileScreen}
        options={{
          title: t('manager_tabs.account'),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="circle-user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const ManagerMainTabs = (): JSX.Element => {
  const userRole = useManagerSelector((state) => state.user.value?.role);
  return userRole === ROLES.VENDOR ? <VendorTabs /> : <ManagerTabs />;
};
