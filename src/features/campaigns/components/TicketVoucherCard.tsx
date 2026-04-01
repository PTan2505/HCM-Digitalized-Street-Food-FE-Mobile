import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import type { ComponentProps, JSX } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

cssInterop(LinearGradient, {
  className: 'style',
});

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface TicketVoucherCardProps {
  disabled?: boolean;
  discountText: string;
  title: string;
  subtitle?: string | null;
  expiresText: string;
  secondaryMetaText: string;
  secondaryMetaIcon?: IoniconName;
  tertiaryMetaText?: string;
  tertiaryMetaIcon?: IoniconName;
  footerText: string;
  actionLabel?: string;
  onActionPress?: () => void;
  isActionLoading?: boolean;
  actionDisabled?: boolean;
}

export const TicketVoucherCard = ({
  disabled = false,
  discountText,
  title,
  subtitle,
  expiresText,
  secondaryMetaText,
  secondaryMetaIcon = 'layers-outline',
  tertiaryMetaText,
  tertiaryMetaIcon = 'receipt-outline',
  footerText,
  actionLabel,
  onActionPress,
  isActionLoading = false,
  actionDisabled = false,
}: TicketVoucherCardProps): JSX.Element => {
  const shouldShowAction = Boolean(actionLabel && onActionPress);

  return (
    <View className="mb-3 overflow-hidden rounded-3xl opacity-100 shadow-sm">
      <LinearGradient
        colors={disabled ? ['#dedede', '#dedede'] : ['#89D151', '#FFFFFF']}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.9 }}
        className="flex-row"
      >
        <View
          className={`relative w-[100px] items-center justify-center ${disabled ? 'bg-[#dedede]' : 'bg-[rgba(137,209,81,0.8)]'} px-1 py-2`}
        >
          <View className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-white/90" />
          <View className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-white/90" />
          <View className="absolute bottom-2 right-0 top-2 border-r border-dashed border-white/60" />
          <Text
            className="text-[11px] font-extrabold tracking-[1.5px] text-black/95"
            numberOfLines={2}
            style={{
              width: 84,
              textAlign: 'center',
              //   transform: [{ rotate: '-90deg' }],
            }}
          >
            LOWCA VOUCHER
          </Text>
        </View>

        <View className="flex-1 px-3 pb-3 pt-2">
          <Text
            className={`mt-0.5 text-3xl font-extrabold leading-[34px] ${
              disabled ? 'text-[#474747]' : 'text-black'
            }`}
          >
            {discountText}
          </Text>

          <Text
            className={`mt-0.5 text-xs font-bold ${
              disabled ? 'text-[#474747]' : 'text-black'
            }`}
            numberOfLines={1}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              className={`mt-0.5 text-[10px] ${
                disabled ? 'text-[#474747]' : 'text-black/95'
              }`}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}

          <View className="mt-2 flex-row flex-wrap gap-1.5">
            <View
              className={`flex-row items-center rounded-full px-2 py-0.5 ${
                disabled ? 'bg-gray-300' : 'bg-gray-400/50'
              }`}
            >
              <Ionicons name="time-outline" size={10} color="#FFFFFF" />
              <Text className="ml-1 text-[10px] font-semibold text-white">
                {expiresText}
              </Text>
            </View>

            <View
              className={`flex-row items-center rounded-full px-2 py-0.5 ${
                disabled ? 'bg-gray-300' : 'bg-gray-400/50'
              }`}
            >
              <Ionicons name={secondaryMetaIcon} size={10} color="#FFFFFF" />
              <Text className="ml-1 text-[10px] font-semibold text-white">
                {secondaryMetaText}
              </Text>
            </View>

            {tertiaryMetaText ? (
              <View
                className={`flex-row items-center rounded-full px-2 py-0.5 ${
                  disabled ? 'bg-gray-300' : 'bg-gray-400/50'
                }`}
              >
                <Ionicons name={tertiaryMetaIcon} size={10} color="#FFFFFF" />
                <Text className="ml-1 text-[10px] font-semibold text-white">
                  {tertiaryMetaText}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="mt-2 flex-row items-center justify-between">
            <View className="flex-row items-center rounded-full bg-yellow-400 px-2.5 py-1">
              <Ionicons name="star" size={11} color="#FFFFFF" />
              <Text className="ml-1 text-[10px] font-bold text-white">
                {footerText}
              </Text>
            </View>

            {shouldShowAction ? (
              <TouchableOpacity
                onPress={onActionPress}
                disabled={actionDisabled}
                className={`h-10 min-w-[88px] items-center justify-center rounded-full px-3 py-1.5 ${
                  actionDisabled ? 'bg-white/60' : 'bg-[#EE6612]'
                }`}
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color="#7c3aed" />
                ) : (
                  <Text
                    className={`text-[10px] font-extrabold ${
                      actionDisabled ? 'text-gray-500' : 'text-white'
                    }`}
                  >
                    {actionLabel}
                  </Text>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};
