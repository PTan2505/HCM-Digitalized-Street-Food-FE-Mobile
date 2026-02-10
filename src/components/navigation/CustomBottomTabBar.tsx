import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable, Text } from '@react-navigation/elements';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { JSX } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const CustomBottomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): JSX.Element => {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute w-full flex-row items-center justify-center"
      style={{ bottom: 8 + insets.bottom }}
    >
      <View className="flex-row items-center justify-between rounded-full bg-white p-[8px] shadow-[0_4px_2px_rgba(0,0,0,0.2)]">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const rawLabel = options.tabBarLabel ?? options.title ?? route.name;

          const renderLabel = (): React.ReactNode => {
            if (typeof rawLabel === 'string') {
              return (
                <Text
                  style={{
                    color: isFocused
                      ? colors.primary
                      : 'rgba(128, 128, 128, 1)',
                    // Typography Specs
                    fontWeight: '700',
                    fontSize: 14,
                    lineHeight: 21, // 14px * 1.5 (150%)
                    textAlign: 'center',
                    letterSpacing: 0,
                  }}
                >
                  {rawLabel}
                </Text>
              );
            }

            // If it's a function, call it with the props it expects
            return rawLabel({
              focused: isFocused,
              color: isFocused ? colors.primary : 'rgba(128, 128, 128, 1)',
              position: 'below-icon',
              children: route.name,
            });
          };

          const icon = options.tabBarIcon
            ? options.tabBarIcon({
                focused: isFocused,
                // If focused (Green BG), usually you want White text/icon.
                // If you want your Primary color, change '#FFFFFF' below.
                color: isFocused ? colors.primary : 'rgba(128, 128, 128, 1)',
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
            <PlatformPressable
              className="flex-row items-center justify-center gap-[4px] rounded-full px-[16px] py-[7px]"
              key={index}
              href={buildHref(route.name, route.params)}
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[isFocused && { backgroundColor: 'rgba(6, 170, 76, 1)' }]}
            >
              {icon}
              {renderLabel()}
            </PlatformPressable>
          );
        })}
      </View>
    </View>
  );
};
