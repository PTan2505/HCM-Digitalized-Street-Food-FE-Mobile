import { COLORS } from '@constants/colors';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type TabKey = string | number;

interface TabLayout {
  x: number;
  width: number;
}

interface AnimatedTabLabelProps {
  isActive: boolean;
  label: string;
  compact?: boolean;
  activeColor: string;
  inactiveColor: string;
}

export interface TabBarItem<T extends TabKey> {
  key: T;
  label: string;
  icon?: (params: { isActive: boolean; color: string }) => JSX.Element;
}

interface TabBarProps<T extends TabKey> {
  tabs: TabBarItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  tabCount?: (tab: T) => number;
  variant?: 'scroll' | 'equal';
  activeColor?: string;
  inactiveColor?: string;
  indicatorColor?: string;
}

const AnimatedTabLabel = ({
  isActive,
  label,
  compact = false,
  activeColor,
  inactiveColor,
}: AnimatedTabLabelProps): JSX.Element => {
  const activeProgress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    activeProgress.value = withTiming(isActive ? 1 : 0, { duration: 220 });
  }, [activeProgress, isActive]);

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      activeProgress.value,
      [0, 1],
      [inactiveColor, activeColor]
    ),
  }));

  return (
    <Animated.Text
      className={
        compact ? 'text-base font-semibold' : 'text-base font-semibold'
      }
      style={textStyle}
    >
      {label}
    </Animated.Text>
  );
};

const getTabLayoutKey = (tab: TabKey): string => String(tab);

export const TabBar = <T extends TabKey>({
  tabs,
  activeTab,
  onTabChange,
  tabCount,
  variant = 'scroll',
  activeColor = COLORS.primaryGradientFrom,
  inactiveColor = '#6B7280',
  indicatorColor = COLORS.primary,
}: TabBarProps<T>): JSX.Element => {
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const animateIndicator = useCallback(
    (tab: T) => {
      const layout = tabLayouts[getTabLayoutKey(tab)];
      if (!layout) {
        return;
      }

      indicatorX.value = withTiming(layout.x, { duration: 220 });
      indicatorWidth.value = withTiming(layout.width, { duration: 220 });
    },
    [indicatorWidth, indicatorX, tabLayouts]
  );

  useEffect(() => {
    animateIndicator(activeTab);
  }, [activeTab, animateIndicator]);

  const handleTabLayout = useCallback((tab: T, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;

    setTabLayouts((previous) => {
      const key = getTabLayoutKey(tab);
      const existing = previous[key];

      if (existing?.x === x && existing.width === width) {
        return previous;
      }

      return {
        ...previous,
        [key]: { x, width },
      };
    });
  }, []);

  const isEqualVariant = variant === 'equal';

  const tabContainer = (
    <View
      className={
        isEqualVariant ? 'relative flex-row' : 'relative flex-row gap-2'
      }
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = tabCount?.(tab.key) ?? 0;

        return (
          <TouchableOpacity
            key={String(tab.key)}
            onPress={() => onTabChange(tab.key)}
            onLayout={(event) => handleTabLayout(tab.key, event)}
            className={
              isEqualVariant
                ? 'flex-1 flex-row items-center justify-center gap-1 pb-3'
                : 'flex-row items-center gap-1 px-4 py-1'
            }
          >
            {tab.icon?.({
              isActive,
              color: isActive ? activeColor : inactiveColor,
            })}
            <AnimatedTabLabel
              isActive={isActive}
              label={tab.label}
              compact={isEqualVariant}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
            />
            {count > 0 && (
              <View
                className={`rounded-full px-1.5 py-0.5 ${
                  isEqualVariant
                    ? 'bg-gray-100'
                    : isActive
                      ? 'bg-gray-300'
                      : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    isEqualVariant
                      ? 'text-gray-500'
                      : isActive
                        ? 'text-white'
                        : 'text-gray-500'
                  }`}
                >
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            bottom: isEqualVariant ? 0 : -12,
            left: 0,
            height: 2,
            backgroundColor: indicatorColor,
          },
          indicatorStyle,
        ]}
      />
    </View>
  );

  if (isEqualVariant) {
    return (
      <View className="mb-2 border-b border-gray-200 bg-white px-4">
        {tabContainer}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
      className="mb-2 border-b border-gray-200 bg-white"
      style={{ flexGrow: 0, flexShrink: 0 }}
    >
      {tabContainer}
    </ScrollView>
  );
};

export default TabBar;
