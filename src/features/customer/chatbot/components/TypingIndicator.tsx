import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

const DOT_SIZE = 8;
const DOTS = [0, 1, 2];

const AnimatedDot = ({ delay }: { delay: number }): React.JSX.Element => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return (): void => animation.stop();
  }, [delay, opacity]);

  return (
    <Animated.View
      style={{
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: '#9FD356',
        opacity,
        marginHorizontal: 3,
      }}
    />
  );
};

export const TypingIndicator = (): React.JSX.Element => {
  return (
    <View className="flex-row justify-start">
      <View className="flex-row items-center rounded-2xl rounded-tl-none border border-gray-200 bg-gray-50 px-4 py-3">
        {DOTS.map((i) => (
          <AnimatedDot key={i} delay={i * 200} />
        ))}
      </View>
    </View>
  );
};
