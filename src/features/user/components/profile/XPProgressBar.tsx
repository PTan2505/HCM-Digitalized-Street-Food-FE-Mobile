import { Ionicons } from '@expo/vector-icons';
import React, { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';

// Tier thresholds — mirrors defaults in UserService.cs (GoldMinXP / DiamondMinXP settings)
const SILVER_MIN_XP = 0;
const GOLD_MIN_XP = 3000;
const DIAMOND_MIN_XP = 10000;

// TierId values from the backend
const TIER_SILVER = 2;
const TIER_GOLD = 3;
const TIER_DIAMOND = 4;

interface TierConfig {
  labelKey: string;
  color: string;
  nextThreshold: number | null;
  minXP: number;
}

const TIER_CONFIG: Record<number, TierConfig> = {
  [TIER_SILVER]: {
    labelKey: 'profile.tier_silver',
    color: '#A8A8A8',
    nextThreshold: GOLD_MIN_XP,
    minXP: SILVER_MIN_XP,
  },
  [TIER_GOLD]: {
    labelKey: 'profile.tier_gold',
    color: '#F5A623',
    nextThreshold: DIAMOND_MIN_XP,
    minXP: GOLD_MIN_XP,
  },
  [TIER_DIAMOND]: {
    labelKey: 'profile.tier_diamond',
    color: '#7B61FF',
    nextThreshold: null,
    minXP: DIAMOND_MIN_XP,
  },
};

interface Props {
  xp: number;
  tierId: number;
  onPress?: () => void;
}

export const XPProgressBar = ({ xp, tierId, onPress }: Props): JSX.Element => {
  const { t } = useTranslation();

  const tier = TIER_CONFIG[tierId] ?? TIER_CONFIG[TIER_SILVER];
  const nextTier = tierId < TIER_DIAMOND ? TIER_CONFIG[tierId + 1] : undefined;

  const isMaxTier = tier.nextThreshold === null;

  const progress = isMaxTier
    ? 1
    : Math.min((xp - tier.minXP) / (tier.nextThreshold! - tier.minXP), 1);

  const xpToNext = isMaxTier ? 0 : Math.max(tier.nextThreshold! - xp, 0);

  return (
    <Pressable
      className="mx-4 mt-3 rounded-2xl bg-gray-50 px-4 py-3"
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="mb-2 flex-row items-center justify-between">
        {/* Current tier badge */}
        <View
          className="rounded-full px-3 py-0.5"
          style={{ backgroundColor: tier.color + '22' }}
        >
          <Text className="text-sm font-bold" style={{ color: tier.color }}>
            {t(tier.labelKey)}
          </Text>
        </View>

        {/* XP label + optional chevron */}
        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-semibold text-gray-500">
            {isMaxTier
              ? t('profile.max_tier')
              : `${xp.toLocaleString()} / ${tier.nextThreshold!.toLocaleString()} XP`}
          </Text>
          {onPress && (
            <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
          )}
        </View>
      </View>

      <Progress.Bar
        progress={progress}
        width={null}
        height={8}
        color={tier.color}
        unfilledColor="#E5E7EB"
        borderWidth={0}
        borderRadius={4}
        animationType="timing"
        animated
      />

      {!isMaxTier && nextTier && (
        <View className="mt-1.5 flex-row items-center justify-between">
          <Text className="text-sm text-gray-400">
            {`${xpToNext.toLocaleString()} XP ${t('profile.xp_next_tier')}`}
          </Text>
          <Text
            className="text-sm font-semibold"
            style={{ color: nextTier.color }}
          >
            {t(nextTier.labelKey)}
          </Text>
        </View>
      )}
    </Pressable>
  );
};
