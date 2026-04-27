import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { hideXPToast, selectXPToast } from '@slices/xpToast';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Must match the thresholds in auth.ts
const GOLD_MIN_XP = 3000;
const DIAMOND_MIN_XP = 10000;

interface TierInfo {
  name: string;
  color: string;
  progressRatio: number; // 0–1 within the current tier's range
  currentXP: number;
  maxXP: number;
}

function getTierInfo(xp: number): TierInfo {
  if (xp >= DIAMOND_MIN_XP) {
    return {
      name: 'Diamond',
      color: '#6366F1',
      progressRatio: 1,
      currentXP: xp,
      maxXP: DIAMOND_MIN_XP,
    };
  }
  if (xp >= GOLD_MIN_XP) {
    const range = DIAMOND_MIN_XP - GOLD_MIN_XP;
    return {
      name: 'Gold',
      color: '#CA8A04',
      progressRatio: (xp - GOLD_MIN_XP) / range,
      currentXP: xp - GOLD_MIN_XP,
      maxXP: range,
    };
  }
  return {
    name: 'Silver',
    color: '#64748B',
    progressRatio: xp / GOLD_MIN_XP,
    currentXP: xp,
    maxXP: GOLD_MIN_XP,
  };
}

const SLIDE_DURATION = 220;
const VISIBLE_DURATION = 3200;
const BAR_ANIMATION_DURATION = 900;
const TIER_UP_HOLD_DURATION = 650;

export const XPProgressToast = (): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { visible, xpEarned, previousXP, newXP } =
    useAppSelector(selectXPToast);

  const translateY = useSharedValue(-120);
  const barProgress = useSharedValue(0);
  const [rendered, setRendered] = useState(false);
  const [tierUpMessage, setTierUpMessage] = useState<string | null>(null);

  const dismiss = (): void => {
    dispatch(hideXPToast());
  };

  useEffect(() => {
    if (!visible) {
      setTierUpMessage(null);
      translateY.value = withTiming(-120, { duration: SLIDE_DURATION });
      const hideTimer = setTimeout(() => setRendered(false), SLIDE_DURATION);
      return (): void => clearTimeout(hideTimer);
    }

    setRendered(true);
    setTierUpMessage(null);
    const fromTier = getTierInfo(previousXP);
    const toTier = getTierInfo(newXP);
    const crossedTier = fromTier.name !== toTier.name;

    // Start bar at old position
    barProgress.value = fromTier.progressRatio;

    // Slide down first, then run XP animation on JS timers to keep flow explicit.
    translateY.value = withTiming(insets.top + 12, {
      duration: SLIDE_DURATION,
    });

    const timers: Array<ReturnType<typeof setTimeout>> = [];

    if (crossedTier) {
      const fillDuration = Math.max(
        250,
        Math.round(BAR_ANIMATION_DURATION * (1 - fromTier.progressRatio))
      );
      const nextTierDuration = Math.max(
        350,
        Math.round(
          BAR_ANIMATION_DURATION * Math.max(toTier.progressRatio, 0.35)
        )
      );

      timers.push(
        setTimeout(() => {
          barProgress.value = withTiming(1, { duration: fillDuration });
        }, SLIDE_DURATION)
      );

      timers.push(
        setTimeout(() => {
          setTierUpMessage(`Tier up: ${toTier.name}`);
        }, SLIDE_DURATION + fillDuration)
      );

      timers.push(
        setTimeout(
          () => {
            setTierUpMessage(null);
            barProgress.value = 0;
            barProgress.value = withTiming(toTier.progressRatio, {
              duration: nextTierDuration,
            });
          },
          SLIDE_DURATION + fillDuration + TIER_UP_HOLD_DURATION
        )
      );

      timers.push(
        setTimeout(
          dismiss,
          SLIDE_DURATION +
            fillDuration +
            TIER_UP_HOLD_DURATION +
            nextTierDuration +
            VISIBLE_DURATION
        )
      );
    } else {
      timers.push(
        setTimeout(() => {
          barProgress.value = withTiming(toTier.progressRatio, {
            duration: BAR_ANIMATION_DURATION,
          });
        }, SLIDE_DURATION)
      );
      timers.push(setTimeout(dismiss, SLIDE_DURATION + VISIBLE_DURATION));
    }

    return (): void => {
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${barProgress.value * 100}%`,
  }));

  if (!rendered) return null;

  const tier = getTierInfo(newXP);

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      pointerEvents="none"
    >
      <View style={styles.card}>
        {/* XP earned label */}
        <View style={styles.row}>
          <View style={styles.xpBadge}>
            <Ionicons name="flash" size={14} color="#fff" />
            <Text style={styles.xpText}>+{xpEarned} XP</Text>
          </View>
          <Text style={[styles.tierLabel, { color: tier.color }]}>
            {tier.name}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.barTrack}>
          <Animated.View
            style={[styles.barFill, barStyle, { backgroundColor: tier.color }]}
          />
        </View>

        {/* XP count */}
        <Text style={styles.xpCount}>
          {tier.currentXP.toLocaleString()} / {tier.maxXP.toLocaleString()} XP
        </Text>
        {tierUpMessage ? (
          <Text style={[styles.tierUpText, { color: tier.color }]}>
            {tierUpMessage}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  xpText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  tierLabel: {
    fontWeight: '700',
    fontSize: 13,
  },
  barTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpCount: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'right',
  },
  tierUpText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
