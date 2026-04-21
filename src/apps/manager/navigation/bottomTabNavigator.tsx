import { COLORS } from '@constants/colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { ManagerOrdersScreen } from '@features/manager/orders/screens/ManagerOrdersScreen';
import { ManagerAccountScreen } from '@manager/account/ManagerAccountScreen';
import { ManagerBranchScreen } from '@manager/branch/ManagerBranchScreen';
import { ManagerDayOffScreen } from '@manager/day-off/ManagerDayOffScreen';
import { ManagerFeedbackScreen } from '@manager/feedback/ManagerFeedbackScreen';
import { ManagerMenuScreen } from '@manager/menu/ManagerMenuScreen';
import { ManagerScheduleScreen } from '@manager/schedule/ManagerScheduleScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { JSX } from 'react';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();

export const ManagerMainTabs = (): JSX.Element => {
  const { t } = useTranslation();

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
      <Tab.Screen
        name="ManagerMenu"
        component={ManagerMenuScreen}
        options={{
          title: t('manager_tabs.menu'),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="utensils" size={size} color={color} />
          ),
        }}
      />
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
      <Tab.Screen
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
      />
      <Tab.Screen
        name="ManagerAccount"
        component={ManagerAccountScreen}
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
