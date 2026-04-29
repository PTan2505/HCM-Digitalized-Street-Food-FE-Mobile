import DiamondIcon from '@assets/icons/diamond-icon.svg';
import GoldIcon from '@assets/icons/gold-icon.svg';
import SilverIcon from '@assets/icons/silver-icon.svg';
import WarningIcon from '@assets/icons/warning-icon.svg';
import SvgIcon from '@components/SvgIcon';
import type { VendorTier } from '@custom-types/vendor';
import type { FC, JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

const TIER_COLORS: Record<VendorTier, string> = {
  diamond: '#60A5FA',
  gold: '#F59E0B',
  silver: '#4b5563',
  warning: '#EF4444',
};

const TIER_ICONS: Record<VendorTier, FC<SvgProps>> = {
  diamond: DiamondIcon,
  gold: GoldIcon,
  silver: SilverIcon,
  warning: WarningIcon,
};

interface TierBadgeProps {
  tier?: VendorTier;
}

export const TierBadge = ({ tier }: TierBadgeProps): JSX.Element | null => {
  const { t } = useTranslation();
  if (!tier) return null;

  return (
    <View
      className="mb-0.5 flex-row items-center gap-1 self-start rounded-full px-1.5 py-0.5"
      style={{ backgroundColor: TIER_COLORS[tier] + '22' }}
    >
      <SvgIcon icon={TIER_ICONS[tier]} width={16} height={16} />
      <Text
        className="text-[10px] font-semibold"
        style={{ color: TIER_COLORS[tier] }}
      >
        {t('stall')} {t(`profile.tier_${tier}`)}
      </Text>
    </View>
  );
};
