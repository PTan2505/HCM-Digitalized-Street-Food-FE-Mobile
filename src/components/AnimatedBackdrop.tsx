import type { JSX } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface AnimatedBackdropProps {
  mounted: boolean;
  visible: boolean;
  onPress: () => void;
  progress: SharedValue<number>;
  dimOpacity?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export const AnimatedBackdrop = ({
  mounted,
  visible,
  onPress,
  progress,
  dimOpacity = 0.5,
  containerStyle,
}: AnimatedBackdropProps): JSX.Element | null => {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(0,0,0,0)', `rgba(0,0,0,${dimOpacity})`]
    ),
  }));

  if (!mounted) return null;

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, containerStyle, animatedStyle]}
      />
      {visible && (
        <Pressable
          style={[StyleSheet.absoluteFill, containerStyle]}
          onPress={onPress}
        />
      )}
    </>
  );
};
