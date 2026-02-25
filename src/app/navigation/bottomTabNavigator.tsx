import discoveryIcon from '@assets/icons/discovery.svg';
import profileIcon from '@assets/icons/profileIcon.svg';
import { CustomBottomTabBar } from '@components/navigation/CustomBottomTabBar';
import SvgIcon from '@components/SvgIcon';
import HomeScreen from '@features/home/screens/HomeScreen';
import ProfileScreen from '@features/user/screens/ProfileScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { JSX } from 'react';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();

export const HomeBottomTabs = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: 'tomato' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('bottom_tabs.discover'),
          tabBarIcon: ({ color, size }) => (
            <SvgIcon
              icon={discoveryIcon}
              style={{
                width: size,
                height: size,
              }}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('bottom_tabs.account'),
          tabBarIcon: ({ color, size }) => (
            <SvgIcon
              icon={profileIcon}
              style={{
                width: size,
                height: size,
              }}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
