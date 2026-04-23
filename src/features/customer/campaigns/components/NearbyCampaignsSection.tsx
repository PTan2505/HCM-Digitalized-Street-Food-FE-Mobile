import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNearbyCampaigns } from '@features/customer/campaigns/hooks/useNearbyCampaigns';
import { useLocationPermission } from '@features/customer/maps/hooks/useLocationPermission';
import * as Location from 'expo-location';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

export const NearbyCampaignsSection = (): JSX.Element | null => {
  const { t } = useTranslation();
  const { permissionStatus, retryPermission, coords } = useLocationPermission();
  const { nearbyCampaigns } = useNearbyCampaigns(coords);

  if (permissionStatus !== Location.PermissionStatus.GRANTED) {
    return (
      <View className="mb-4 rounded-xl bg-blue-50 p-4">
        <Text className="mb-2 text-base font-semibold text-blue-700">
          {t('campaign.nearby_title')}
        </Text>
        <Text className="mb-3 text-sm text-blue-600">
          {t('campaign.enable_location')}
        </Text>
        <TouchableOpacity
          onPress={retryPermission}
          className="self-start rounded-full bg-blue-500 px-4 py-1.5"
        >
          <Text className="text-sm font-semibold text-white">
            {t('campaign.enable_location_btn')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (nearbyCampaigns.length === 0) {
    return (
      <View className="mb-4 rounded-xl bg-gray-50 p-4">
        <Text className="text-base text-gray-400">
          {t('campaign.no_nearby')}
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 text-base font-semibold text-gray-700">
        {t('campaign.nearby_title')}
      </Text>
      {nearbyCampaigns.map((c) => (
        <View
          key={c.campaignId}
          className="mb-2 flex-row items-center rounded-lg bg-gray-50 p-3"
        >
          <Ionicons name="location-outline" size={16} color={COLORS.primary} />
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-gray-800">
              {c.title}
            </Text>
            <Text className="text-sm text-gray-400">
              {c.vendorName} · {c.distanceKm.toFixed(1)} km
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};
