import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable, Text } from '@react-navigation/elements';
import { useLinkBuilder } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { JSX, ReactNode, useCallback, useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabLayout {
  x: number;
  width: number;
}

interface CustomTabItemProps {
  buildHref: BottomTabBarProps['navigation']['emit'] extends never
    ? never
    : ReturnType<typeof useLinkBuilder>['buildHref'];
  icon: ReactNode;
  isFocused: boolean;
  label: string;
  onLayout: (event: LayoutChangeEvent) => void;
  onLongPress: () => void;
  onPress: () => void;
  options: BottomTabNavigationOptions;
  routeName: string;
  routeParams?: object;
  testID?: string;
}

const CustomTabItem = ({
  buildHref,
  icon,
  isFocused,
  label,
  onLayout,
  onLongPress,
  onPress,
  options,
  routeName,
  routeParams,
  testID,
}: CustomTabItemProps): JSX.Element => {
  return (
    <PlatformPressable
      className="z-10 rounded-full"
      href={buildHref(routeName, routeParams)}
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      onLayout={onLayout}
    >
      <View className="flex-row items-center justify-center gap-[4px] rounded-full px-[16px] py-[7px]">
        {icon}
        <Text
          style={{
            color: isFocused ? '#FFFFFF' : 'rgba(128, 128, 128, 1)',
            fontWeight: '700',
            fontSize: 14,
            lineHeight: 21,
            textAlign: 'center',
            letterSpacing: 0,
          }}
        >
          {label}
        </Text>
      </View>
    </PlatformPressable>
  );
};

export const CustomBottomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): JSX.Element => {
  const { buildHref } = useLinkBuilder();
  const insets = useSafeAreaInsets();
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});

  const activePillX = useSharedValue(0);
  const activePillWidth = useSharedValue(0);

  const activePillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activePillX.value }],
    width: activePillWidth.value,
  }));

  const handleTabLayout = useCallback(
    (routeKey: string, event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      setTabLayouts((prev) => {
        const existing = prev[routeKey];
        if (existing?.x === x && existing?.width === width) {
          return prev;
        }
        return { ...prev, [routeKey]: { x, width } };
      });
    },
    []
  );

  useEffect(() => {
    const activeRoute = state.routes[state.index];
    const layout = tabLayouts[activeRoute.key];
    if (!layout) return;

    activePillX.value = withSpring(layout.x, {
      damping: 21,
      stiffness: 300,
      mass: 0.8,
    });
    activePillWidth.value = withSpring(layout.width, {
      damping: 23,
      stiffness: 320,
      mass: 0.82,
    });
  }, [activePillWidth, activePillX, state.index, state.routes, tabLayouts]);

  return (
    <LinearGradient
      colors={[
        'rgba(255, 255, 255, 0)',
        'rgba(255, 255, 255, 0.6)',
        'rgba(255, 255, 255, 0.95)',
      ]}
      locations={[0, 0.4, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 32,
        paddingBottom: insets.bottom + 8,
      }}
    >
      <View className="relative flex-row items-center justify-between rounded-full bg-white p-[8px] shadow-[0_4px_2px_rgba(0,0,0,0.2)]">
        <Animated.View
          pointerEvents="none"
          className="absolute bottom-[8px] left-0 top-[8px] rounded-full bg-[#06AA4C]"
          style={activePillStyle}
        />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const rawLabel = options.tabBarLabel ?? options.title ?? route.name;
          const label =
            typeof rawLabel === 'string'
              ? rawLabel
              : (options.title ?? route.name);

          const icon = options.tabBarIcon
            ? options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? '#FFFFFF' : 'rgba(128, 128, 128, 1)',
                size: 24,
              })
            : null;

          const onPress = (): void => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = (): void => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <CustomTabItem
              key={index}
              buildHref={buildHref}
              isFocused={isFocused}
              label={label}
              icon={icon}
              onLayout={(event) => handleTabLayout(route.key, event)}
              routeName={route.name}
              routeParams={route.params as object | undefined}
              options={options}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </LinearGradient>
  );
};
