import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type JSX,
} from 'react';
import {
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PAD = 2;

interface TimeScrollPickerProps {
  values: number[];
  value: number;
  onChange: (value: number) => void;
}

export const TimeScrollPicker = ({
  values,
  value,
  onChange,
}: TimeScrollPickerProps): JSX.Element => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Pad with nulls so first/last real items can be centered
  const padded = useMemo<(number | null)[]>(
    () => [...Array(PAD).fill(null), ...values, ...Array(PAD).fill(null)],
    [values]
  );

  const scrollToValue = useCallback(
    (v: number, animated = false) => {
      const idx = values.indexOf(v);
      if (idx >= 0) {
        scrollViewRef.current?.scrollTo({
          y: idx * ITEM_HEIGHT,
          animated,
        });
      }
    },
    [values]
  );

  useEffect(() => {
    const timer = setTimeout(() => scrollToValue(value), 80);
    return (): void => clearTimeout(timer);
    // Only run on mount — scroll position managed internally after that
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = e.nativeEvent.contentOffset.y;
      const idx = Math.round(offset / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(idx, values.length - 1));
      onChange(values[clamped]);
    },
    [values, onChange]
  );

  return (
    <View style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS, width: 64 }}>
      {/* Selection highlight band */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: ITEM_HEIGHT * PAD,
          left: 4,
          right: 4,
          height: ITEM_HEIGHT,
          backgroundColor: '#e8f5e9',
          borderRadius: 8,
        }}
      />
      <ScrollView
        ref={scrollViewRef}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {padded.map((item, index) => (
          <View
            key={String(index)}
            style={{
              height: ITEM_HEIGHT,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item !== null && (
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '600',
                  color: '#043620',
                  fontFamily: 'Nunito-SemiBold',
                }}
              >
                {String(item).padStart(2, '0')}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
