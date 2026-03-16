import { Ionicons } from '@expo/vector-icons';
import type { WorkSchedule } from '@features/home/types/branch';
import type { VendorTier } from '@features/home/types/stall';
import type { JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

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

// Mon–Sat then Sun
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const WEEKDAY_VI: Record<number, string> = {
  0: 'Chủ nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
};

const WEEKDAY_SHORT: Record<number, string> = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
};

const formatTime = (t: string) => t.slice(0, 5);

export interface RestaurantInfoData {
  name: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  isVegetarian?: boolean;
  cuisine: string;
  address: string;
  hours: string;
  isOpen: boolean;
  tier?: VendorTier;
  schedules?: WorkSchedule[];
}

interface RestaurantInfoProps {
  restaurant: RestaurantInfoData;
}

const RestaurantInfo = ({ restaurant }: RestaurantInfoProps): JSX.Element => {
  const { t } = useTranslation();
  const [scheduleExpanded, setScheduleExpanded] = useState(false);

  const todayWeekday = new Date().getDay();
  const { schedules } = restaurant;
  const todaySchedule = schedules?.find((s) => s.weekday === todayWeekday);
  const hoursLabel = todaySchedule
    ? `${WEEKDAY_SHORT[todayWeekday]}: ${formatTime(todaySchedule.openTime)} - ${formatTime(todaySchedule.closeTime)}`
    : restaurant.hours;

  return (
    <View className="p-4">
      <View className="mb-2 flex-row justify-between">
        <Text className="text-2xl font-bold text-black">{restaurant.name}</Text>
        <Ionicons name="share-social-outline" size={25} color="#00000" />
      </View>

      <View className="mb-2 flex-row items-center gap-2">
        <Text className="text-sm font-semibold text-[#06AA4C]">
          {restaurant.priceRange}
        </Text>
        <View className="flex-row items-center gap-0.5">
          <Ionicons name="star" size={16} color="#FACC15" />
          <Text className="text-sm font-semibold text-[#FACC15]">
            {restaurant.rating}
          </Text>
        </View>
        {restaurant.reviewCount > 0 && (
          <Text className="text-sm text-gray-600">
            {restaurant.reviewCount} {t('actions.reviews')}
          </Text>
        )}
      </View>

      <View className="mb-3 flex-row flex-wrap items-center gap-2">
        {restaurant.isVegetarian && (
          <View className="rounded-2xl bg-[#00B14F] px-2 py-1">
            <Text className="text-xs font-semibold text-white">
              {t('actions.vegetarian_food')}
            </Text>
          </View>
        )}
        <View className="rounded-2xl bg-[#F1FAEA] px-2 py-1">
          <Text className="text-xs text-gray-600">{restaurant.cuisine}</Text>
        </View>
        {restaurant.tier && (
          <View
            className="rounded-2xl px-2 py-1"
            style={{ backgroundColor: TIER_BG[restaurant.tier] }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: TIER_TEXT[restaurant.tier] }}
            >
              {TIER_LABEL[restaurant.tier]}
            </Text>
          </View>
        )}
      </View>

      <Text className="mb-4 text-sm leading-5 text-gray-600">
        {restaurant.address}
      </Text>

      {/* Hours row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="text-sm text-gray-600">{hoursLabel}</Text>
          {schedules && schedules.length > 0 && (
            <TouchableOpacity
              onPress={() => setScheduleExpanded((v) => !v)}
              className="flex-row items-center gap-0.5"
              hitSlop={8}
            >
              <Ionicons
                name={scheduleExpanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#6B7280"
              />
            </TouchableOpacity>
          )}
        </View>
        <Text
          className={`text-sm font-semibold ${
            restaurant.isOpen ? 'text-[#00B14F]' : 'text-red-500'
          }`}
        >
          {restaurant.isOpen ? t('actions.open') : t('actions.closed')}
        </Text>
      </View>

      {/* Expanded full schedule */}
      {scheduleExpanded && schedules && schedules.length > 0 && (
        <View className="mt-2 overflow-hidden rounded-xl bg-[#F9FAFB] px-3 py-2">
          {WEEKDAY_ORDER.map((day) => {
            const entry = schedules.find((s) => s.weekday === day);
            const isToday = day === todayWeekday;
            return (
              <View
                key={day}
                className={`flex-row justify-between py-1 ${isToday ? 'opacity-100' : 'opacity-70'}`}
              >
                <Text
                  className={`text-sm ${isToday ? 'font-semibold text-black' : 'text-gray-500'}`}
                >
                  {WEEKDAY_VI[day]}
                </Text>
                <Text
                  className={`text-sm ${isToday ? 'font-semibold text-black' : 'text-gray-500'}`}
                >
                  {entry
                    ? `${formatTime(entry.openTime)} - ${formatTime(entry.closeTime)}`
                    : t('actions.closed')}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default RestaurantInfo;
