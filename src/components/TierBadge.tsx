import type { VendorTier } from '@custom-types/vendor';
import type { JSX } from 'react';
import { Text, View } from 'react-native';

const TIER_LABEL: Record<VendorTier, string> = {
  diamond: '💎 Diamond',
  gold: '🥇 Gold',
  silver: '🥈 Silver',
  warning: '⚠️ Warning',
};

const TIER_BG: Record<VendorTier, string> = {
  diamond: '#DBEAFE',
  gold: '#FEF3C7',
  silver: '#F3F4F6',
  warning: '#FEE2E2',
};

const TIER_TEXT: Record<VendorTier, string> = {
  diamond: '#1D4ED8',
  gold: '#92400E',
  silver: '#374151',
  warning: '#991B1B',
};

interface TierBadgeProps {
  tier?: VendorTier;
  paused?: boolean;
}

export const TierBadge = ({
  tier,
  paused,
}: TierBadgeProps): JSX.Element | null => {
  if (paused) {
    return (
      <View className="rounded-2xl bg-[#F3F4F6] px-2 py-1">
        <Text className="text-sm font-semibold text-[#6B7280]">
          ⏸ Tier paused
        </Text>
      </View>
    );
  }

  if (!tier) return null;

  return (
    <View
      className="rounded-2xl px-2 py-1"
      style={{ backgroundColor: TIER_BG[tier] }}
    >
      <Text
        className="text-sm font-semibold"
        style={{ color: TIER_TEXT[tier] }}
      >
        {TIER_LABEL[tier]}
      </Text>
    </View>
  );
};
