import LowcaLogo from '@assets/logos/lowcaLogo.png';
import congratulationBell from '@assets/sounds/congratulationBell.mp3';
import CongratulationSplash from '@assets/splash/congratulationSplash.json';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type {
  QuestBadgeDetail,
  QuestRewardType,
  QuestTaskRewardItem,
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
  rewards: QuestTaskRewardItem[];
  xpEarned?: number;
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

interface RewardRowProps {
  reward: QuestTaskRewardItem;
}

const RewardRow = ({ reward }: RewardRowProps): JSX.Element => {
  const { t } = useTranslation();
  const normalized = normalizeRewardType(reward.rewardType);
  const config = REWARD_CONFIG[normalized];

  const [badge, setBadge] = useState<QuestBadgeDetail | null>(null);
  const [voucher, setVoucher] = useState<QuestVoucherDetail | null>(null);

  useEffect(() => {
    setBadge(null);
    setVoucher(null);
    if (normalized === 'BADGE') {
      axiosApi.questApi
        .getBadgeById(reward.rewardValue)
        .then(setBadge)
        .catch(() => {});
    } else if (normalized === 'VOUCHER') {
      axiosApi.questApi
        .getVoucherById(reward.rewardValue)
        .then(setVoucher)
        .catch(() => {});
    }
  }, [normalized, reward.rewardValue]);

  if (normalized === 'POINTS') {
    return (
      <View
        className="mb-2 flex-row items-center rounded-2xl px-4 py-2.5"
        style={{ backgroundColor: config.bgColor }}
      >
        <Ionicons name={config.icon} size={20} color={config.iconColor} />
        <Text
          className="ml-2 text-base font-extrabold"
          style={{ color: config.iconColor }}
        >
          +{reward.rewardValue * reward.quantity} {t('quest.reward.points')}
        </Text>
      </View>
    );
  }

  if (normalized === 'BADGE') {
    return (
      <View
        className="mb-2 flex-row items-center rounded-2xl px-4 py-2.5"
        style={{ backgroundColor: config.bgColor }}
      >
        {badge?.iconUrl ? (
          <Image
            source={{ uri: badge.iconUrl }}
            className="h-8 w-8 rounded-full"
            resizeMode="contain"
          />
        ) : (
          <Ionicons name={config.icon} size={20} color={config.iconColor} />
        )}
        <Text
          className="ml-2 flex-1 text-base font-extrabold"
          style={{ color: config.iconColor }}
        >
          {badge?.badgeName ?? t('quest.reward.badge')}
        </Text>
      </View>
    );
  }

  // VOUCHER
  const isPercent = voucher?.type.toUpperCase().includes('PERCENT') ?? false;
  const discount = voucher
    ? isPercent
      ? `${t('quest.reward.voucherOff')} ${voucher.discountValue}%`
      : `${t('quest.reward.voucherOff')} ${voucher.discountValue.toLocaleString()}đ`
    : t('quest.reward.voucher');

  return (
    <View
      className="mb-2 flex-row items-center rounded-2xl px-4 py-2.5"
      style={{ backgroundColor: config.bgColor }}
    >
      <Ionicons name={config.icon} size={20} color={config.iconColor} />
      <View className="ml-2 flex-1">
        <Text
          className="text-base font-extrabold"
          style={{ color: config.iconColor }}
        >
          {voucher?.name ?? t('quest.reward.voucher')}
          {reward.quantity > 1 ? ` ×${reward.quantity}` : ''}
        </Text>
        {voucher && (
          <Text
            className="text-xs font-semibold"
            style={{ color: config.iconColor }}
          >
            {discount}
          </Text>
        )}
      </View>
    </View>
  );
};

export const QuestRewardModal = ({
  visible,
  rewards,
  xpEarned,
  onDismiss,
}: QuestRewardModalProps): JSX.Element => {
  const { t } = useTranslation();

  // Pick primary reward type for the icon cluster (first reward)
  const primaryType =
    rewards.length > 0 ? normalizeRewardType(rewards[0].rewardType) : 'POINTS';
  const primaryConfig = REWARD_CONFIG[primaryType];

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

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }}
        onPress={onDismiss}
      />

      <View
        className="absolute inset-0 items-center justify-center"
        pointerEvents="box-none"
      >
        <View
          style={{ width: 320 }}
          className="items-center overflow-hidden rounded-3xl bg-white pb-8"
        >
          <Pressable
            onPress={onDismiss}
            className="absolute right-3 top-3 z-10 rounded-full bg-gray-100 p-1.5 active:opacity-60"
            hitSlop={8}
          >
            <Ionicons name="close" size={18} color="#6B7280" />
          </Pressable>

          <View className="mt-4 h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-primary shadow-md">
            <Image
              source={LowcaLogo}
              className="h-12 w-12"
              resizeMode="contain"
            />
          </View>

          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <LottieView
              autoPlay
              loop={true}
              resizeMode="cover"
              source={CongratulationSplash}
              style={StyleSheet.absoluteFill}
            />
          </View>

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

          <View
            className="mt-6 h-28 w-28 items-center justify-center rounded-full"
            style={{ backgroundColor: primaryConfig.ringColor + '33' }}
          >
            <View
              className="h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: primaryConfig.bgColor }}
            >
              <Ionicons
                name={primaryConfig.icon}
                size={44}
                color={primaryConfig.iconColor}
              />
            </View>
          </View>

          {/* All rewards list */}
          <ScrollView
            className="mt-4 w-full px-5"
            style={{ maxHeight: 180 }}
            showsVerticalScrollIndicator={false}
          >
            {xpEarned && xpEarned > 0 && (
              <View className="mb-2 flex-row items-center rounded-2xl bg-blue-50 px-4 py-2.5">
                <Ionicons name="flash" size={20} color="#2563EB" />
                <Text className="ml-2 text-base font-extrabold text-blue-700">
                  +{xpEarned} XP
                </Text>
              </View>
            )}
            {rewards.map((r) => (
              <RewardRow key={r.questTaskRewardId} reward={r} />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
