import LowcaLogo from '@assets/logos/lowcaLogo.png';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import congratulationBell from '@assets/sounds/congratulationBell.mp3';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Modal, Pressable, Text, View } from 'react-native';

import type {
  QuestBadgeDetail,
  QuestRewardType,
  QuestVoucherDetail,
} from '@features/quests/types/quest';
import { axiosApi } from '@lib/api/apiInstance';

const NUMERIC_REWARD_MAP: Record<number, QuestRewardType> = {
  1: 'BADGE',
  2: 'POINTS',
  3: 'VOUCHER',
};

function normalizeRewardType(value: QuestRewardType | number): QuestRewardType {
  if (typeof value === 'number') return NUMERIC_REWARD_MAP[value] ?? 'POINTS';
  return value;
}

interface QuestRewardModalProps {
  visible: boolean;
  rewardType: QuestRewardType | number;
  rewardValue: number;
  onDismiss: () => void;
}

const REWARD_CONFIG: Record<
  QuestRewardType,
  {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconColor: string;
    bgColor: string;
    ringColor: string;
  }
> = {
  POINTS: {
    icon: 'star',
    iconColor: '#CA8A04',
    bgColor: '#FEF9C3',
    ringColor: '#FDE047',
  },
  BADGE: {
    icon: 'medal',
    iconColor: '#7C3AED',
    bgColor: '#F3E8FF',
    ringColor: '#C084FC',
  },
  VOUCHER: {
    icon: 'pricetag',
    iconColor: '#EA580C',
    bgColor: '#FFF7ED',
    ringColor: '#FB923C',
  },
};

const DOT_POSITIONS = [
  { top: '15%', left: '10%', size: 8 },
  { top: '10%', right: '15%', size: 6 },
  { top: '35%', left: '5%', size: 5 },
  { top: '30%', right: '8%', size: 7 },
  { bottom: '30%', left: '12%', size: 6 },
  { bottom: '25%', right: '10%', size: 5 },
] as const;

export const QuestRewardModal = ({
  visible,
  rewardType,
  rewardValue,
  onDismiss,
}: QuestRewardModalProps): JSX.Element => {
  const { t } = useTranslation();
  const normalized = normalizeRewardType(rewardType);
  const config = REWARD_CONFIG[normalized];

  const [badge, setBadge] = useState<QuestBadgeDetail | null>(null);
  const [voucher, setVoucher] = useState<QuestVoucherDetail | null>(null);

  useEffect(() => {
    if (!visible) return;

    let sound: Audio.Sound | null = null;
    Audio.Sound.createAsync(congratulationBell)
      .then(({ sound: s }) => {
        sound = s;
        return s.playAsync();
      })
      .catch(() => {});

    return (): void => {
      sound?.unloadAsync().catch(() => {});
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    setBadge(null);
    setVoucher(null);

    if (normalized === 'BADGE') {
      axiosApi.questApi
        .getBadgeById(rewardValue)
        .then(setBadge)
        .catch(() => {});
    } else if (normalized === 'VOUCHER') {
      axiosApi.questApi
        .getVoucherById(rewardValue)
        .then(setVoucher)
        .catch(() => {});
    }
  }, [visible, normalized, rewardValue]);

  const renderRewardDetail = (): JSX.Element => {
    if (normalized === 'POINTS') {
      return (
        <View
          className="mt-4 rounded-2xl px-5 py-2"
          style={{ backgroundColor: config.bgColor }}
        >
          <Text
            className="text-center text-lg font-extrabold"
            style={{ color: config.iconColor }}
          >
            +{rewardValue} {t('quest.reward.points')}
          </Text>
        </View>
      );
    }

    if (normalized === 'BADGE' && badge) {
      return (
        <View className="mt-4 items-center gap-y-1">
          {badge.iconUrl ? (
            <Image
              source={{ uri: badge.iconUrl }}
              className="h-16 w-16 rounded-full"
              resizeMode="contain"
            />
          ) : null}
          <View
            className="rounded-2xl px-5 py-2"
            style={{ backgroundColor: config.bgColor }}
          >
            <Text
              className="text-center text-lg font-extrabold"
              style={{ color: config.iconColor }}
            >
              {badge.badgeName}
            </Text>
          </View>
          {badge.description ? (
            <Text className="mt-1 text-center text-sm text-gray-500">
              {badge.description}
            </Text>
          ) : null}
        </View>
      );
    }

    if (normalized === 'VOUCHER' && voucher) {
      const isPercent = voucher.type.toUpperCase().includes('PERCENT');
      const discount = isPercent
        ? `${t('quest.reward.voucherOff')} ${voucher.discountValue}%`
        : `${t('quest.reward.voucherOff')} ${voucher.discountValue.toLocaleString()}đ`;

      return (
        <View
          className="mt-4 items-center rounded-2xl px-5 py-3"
          style={{ backgroundColor: config.bgColor }}
        >
          <Text
            className="text-center text-lg font-extrabold"
            style={{ color: config.iconColor }}
          >
            {voucher.name}
          </Text>
          <Text
            className="mt-0.5 text-center text-base font-semibold"
            style={{ color: config.iconColor }}
          >
            {discount}
          </Text>
          <Text
            className="mt-0.5 text-center text-xs opacity-70"
            style={{ color: config.iconColor }}
          >
            {t('quest.reward.voucherRemain', { count: voucher.remain })}
          </Text>
        </View>
      );
    }

    // Fallback while loading badge/voucher
    return (
      <View
        className="mt-4 rounded-2xl px-5 py-2"
        style={{ backgroundColor: config.bgColor }}
      >
        <Text
          className="text-center text-lg font-extrabold"
          style={{ color: config.iconColor }}
        >
          {t(`quest.reward.${normalized.toLowerCase() as 'badge' | 'voucher'}`)}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      {/* Backdrop */}
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }}
        onPress={onDismiss}
      />

      {/* Card centered, layered above backdrop */}
      <View
        className="absolute inset-0 items-center justify-center"
        pointerEvents="box-none"
      >
        <View
          style={{ width: 320 }}
          className="items-center overflow-hidden rounded-3xl bg-white pb-8"
        >
          {/* Close button */}
          <Pressable
            onPress={onDismiss}
            className="absolute right-3 top-3 z-10 rounded-full bg-gray-100 p-1.5 active:opacity-60"
            hitSlop={8}
          >
            <Ionicons name="close" size={18} color="#6B7280" />
          </Pressable>

          {/* Logo chip */}
          <View className="mt-4 h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-primary shadow-md">
            <Image
              source={LowcaLogo}
              className="h-12 w-12"
              resizeMode="contain"
            />
          </View>

          {/* Confetti dots */}
          {DOT_POSITIONS.map((pos, i) => {
            const { size, ...posStyle } = pos;
            return (
              <View
                key={i}
                style={[
                  {
                    position: 'absolute',
                    borderRadius: 9999,
                    backgroundColor: '#9FD356',
                    width: size,
                    height: size,
                  },
                  posStyle,
                ]}
              />
            );
          })}

          {/* Texts */}
          <View className="mt-4 items-center px-6">
            <Text className="text-sm font-semibold text-gray-400">
              {t('quest.rewardModal.congrats')}
            </Text>
            <Text className="mt-1 text-center text-2xl font-extrabold text-gray-900">
              {t('quest.rewardModal.title')}
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-gray-500">
              {t('quest.rewardModal.subtitle')}
            </Text>
          </View>

          {/* Reward icon cluster */}
          <View
            className="mt-6 h-28 w-28 items-center justify-center rounded-full"
            style={{ backgroundColor: config.ringColor + '33' }}
          >
            <View
              className="h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: config.bgColor }}
            >
              <Ionicons name={config.icon} size={44} color={config.iconColor} />
            </View>
          </View>

          {renderRewardDetail()}
        </View>
      </View>
    </Modal>
  );
};
