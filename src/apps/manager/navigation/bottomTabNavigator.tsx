import { COLORS } from '@constants/colors';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { ManagerOrdersScreen } from '@features/manager/orders/screens/ManagerOrdersScreen';
import { NotificationScreen } from '@features/notifications/screens/NotificationScreen';
import { ProfileScreen } from '@features/user/screens/ProfileScreen';
import { useAppSelector } from '@hooks/reduxHooks';
import { ManagerBranchScreen } from '@manager/branch/ManagerBranchScreen';
import { ManagerFeedbackScreen } from '@manager/feedback/screens/ManagerFeedbackScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { selectUnreadCount } from '@slices/notifications';
import React, { JSX } from 'react';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();

export const ManagerMainTabs = (): JSX.Element => {
  const { t } = useTranslation();
  const unreadCount = useAppSelector(selectUnreadCount);

  return (
    <Tab.Navigator
      initialRouteName="ManagerOrders"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Nunito-Medium',
        },
      }}
    >
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
        name="ManagerBranch"
        component={ManagerBranchScreen}
        options={{
          title: t('manager_tabs.branch'),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="store" size={size} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="ManagerMenu"
        component={ManagerMenuScreen}
        options={{
          title: t('manager_tabs.menu'),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="utensils" size={size} color={color} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="ManagerFeedback"
        component={ManagerFeedbackScreen}
        options={{
          title: t('manager_tabs.feedback'),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="comments" size={size} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="ManagerSchedule"
        component={ManagerScheduleScreen}
        options={{
          title: t('manager_tabs.schedule'),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="calendar-days" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManagerDayOff"
        component={ManagerDayOffScreen}
        options={{
          title: t('manager_tabs.day_off'),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="calendar-xmark" size={size} color={color} />
          ),
        }}
      /> */}
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
