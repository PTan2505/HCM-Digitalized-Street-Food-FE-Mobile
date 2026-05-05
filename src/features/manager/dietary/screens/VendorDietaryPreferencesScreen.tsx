import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import {
  useAllDietaryPreferences,
  useMyVendorDietaryPreferences,
  useUpdateMyVendorDietaryPreferences,
} from '@manager/dietary/hooks/useVendorDietaryPreferences';
import { useVendorInfo } from '@manager/vendor-branches/hooks/useVendorBranches';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const VendorDietaryPreferencesScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();

  const { data: vendorInfo } = useVendorInfo();
  const vendorId = vendorInfo?.vendorId;

  const {
    data: allPreferences = [],
    isLoading: isLoadingAll,
    isError: isErrorAll,
    refetch: refetchAll,
  } = useAllDietaryPreferences();

  const {
    data: myPreferences = [],
    isLoading: isLoadingMine,
    isError: isErrorMine,
  } = useMyVendorDietaryPreferences(vendorId);

  const updateMutation = useUpdateMyVendorDietaryPreferences(vendorId);

  const activePreferences = useMemo(
    () => allPreferences.filter((pref) => pref.isActive !== false),
    [allPreferences]
  );

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    setSelectedIds(myPreferences.map((p) => p.dietaryPreferenceId));
  }, [myPreferences]);

  const initialIdSet = useMemo(
    () => new Set(myPreferences.map((p) => p.dietaryPreferenceId)),
    [myPreferences]
  );

  const isDirty = useMemo(() => {
    if (selectedIds.length !== initialIdSet.size) return true;
    return selectedIds.some((id) => !initialIdSet.has(id));
  }, [selectedIds, initialIdSet]);

  const toggle = (id: number): void => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = (): void => {
    if (!isDirty || updateMutation.isPending) return;
    updateMutation.mutate(selectedIds, {
      onSuccess: () => {
        Alert.alert(
          t('vendor_dietary.save_success_title'),
          t('vendor_dietary.save_success')
        );
      },
      onError: () => {
        Alert.alert(
          t('vendor_dietary.save_error_title'),
          t('vendor_dietary.save_error')
        );
      },
    });
  };

  const isLoading = isLoadingAll || isLoadingMine;
  const isError = isErrorAll || isErrorMine;

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={t('vendor_dietary.title')}
        onBackPress={() => navigation.goBack()}
      />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-base text-gray-500">
            {t('vendor_dietary.error_load')}
          </Text>
          <TouchableOpacity
            className="rounded-full bg-primary px-6 py-2"
            onPress={() => void refetchAll()}
          >
            <Text className="font-semibold text-white">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            <Text className="mb-1 text-sm text-gray-600">
              {t('vendor_dietary.description')}
            </Text>

            <View className="mb-4 mt-3 flex-row gap-2">
              <View className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1">
                <Text className="text-xs font-bold text-blue-700">
                  {t('vendor_dietary.total_available', {
                    count: activePreferences.length,
                  })}
                </Text>
              </View>
              <View className="rounded-full border border-green-200 bg-green-50 px-3 py-1">
                <Text className="text-xs font-bold text-green-700">
                  {t('vendor_dietary.applied_count', {
                    count: selectedIds.length,
                  })}
                </Text>
              </View>
            </View>

            {activePreferences.length === 0 ? (
              <Text className="mt-6 text-center text-sm text-gray-400">
                {t('vendor_dietary.empty')}
              </Text>
            ) : (
              <View className="gap-2">
                {activePreferences.map((pref) => {
                  const isSelected = selectedIds.includes(
                    pref.dietaryPreferenceId
                  );
                  return (
                    <TouchableOpacity
                      key={pref.dietaryPreferenceId}
                      onPress={() => toggle(pref.dietaryPreferenceId)}
                      className={`flex-row items-center rounded-2xl border bg-white p-4 ${
                        isSelected ? 'border-primary' : 'border-gray-100'
                      }`}
                      activeOpacity={0.7}
                    >
                      <View
                        className={`mr-3 h-5 w-5 items-center justify-center rounded border-2 ${
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected ? (
                          <Ionicons name="checkmark" size={14} color="white" />
                        ) : null}
                      </View>
                      <Ionicons
                        name="restaurant-outline"
                        size={18}
                        color={isSelected ? COLORS.primary : '#6b7280'}
                      />
                      <View className="ml-2 flex-1">
                        <Text
                          className={`text-sm font-bold ${
                            isSelected ? 'text-primary' : 'text-gray-900'
                          }`}
                        >
                          {pref.name}
                        </Text>
                        {pref.description ? (
                          <Text
                            className="mt-0.5 text-xs text-gray-500"
                            numberOfLines={2}
                          >
                            {pref.description}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        className={`rounded-full border px-2 py-0.5 ${
                          isSelected
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-100'
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            isSelected ? 'text-green-700' : 'text-gray-500'
                          }`}
                        >
                          {isSelected
                            ? t('vendor_dietary.applied')
                            : t('vendor_dietary.not_applied')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
            <TouchableOpacity
              className={`items-center rounded-full py-3 ${
                !isDirty || updateMutation.isPending
                  ? 'bg-gray-300'
                  : 'bg-primary'
              }`}
              disabled={!isDirty || updateMutation.isPending}
              onPress={handleSave}
            >
              <Text className="text-base font-bold text-white">
                {updateMutation.isPending
                  ? t('common.saving')
                  : t('vendor_dietary.save_button')}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};
