import Header from '@components/Header';
import { useManagerBranchDetail } from '@manager/branch/hooks/useManagerBranch';
import { useNavigation } from '@react-navigation/native';
import React, { type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}): JSX.Element => (
  <View className="flex-row justify-between border-b border-gray-100 py-3">
    <Text className="text-sm text-gray-500">{label}</Text>
    <Text className="max-w-[60%] text-right text-sm font-medium text-gray-900">
      {value !== null && value !== undefined ? String(value) : '—'}
    </Text>
  </View>
);

export const ManagerBranchScreen = (): JSX.Element => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const {
    data: branch,
    isLoading,
    isError,
    refetch,
  } = useManagerBranchDetail();

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header
        title={t('manager_branch.title')}
        secondaryAction={
          branch
            ? {
                label: t('manager_branch.edit'),
                onPress: () => navigation.navigate('ManagerEditBranch'),
              }
            : undefined
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#006a2c" />
        </View>
      ) : isError || !branch ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-base text-gray-500">
            {t('manager_branch.error_load')}
          </Text>
          <TouchableOpacity
            className="rounded-full bg-primary px-6 py-2"
            onPress={() => void refetch()}
          >
            <Text className="font-semibold text-white">
              {t('manager_branch.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-4 rounded-2xl bg-gray-50 px-4">
            <InfoRow label={t('manager_branch.name')} value={branch.name} />
            <InfoRow
              label={t('manager_branch.phone')}
              value={branch.phoneNumber}
            />
            <InfoRow label={t('manager_branch.email')} value={branch.email} />
            <InfoRow
              label={t('manager_branch.address_detail')}
              value={branch.addressDetail}
            />
            <InfoRow label={t('manager_branch.ward')} value={branch.ward} />
            <InfoRow label={t('manager_branch.city')} value={branch.city} />
          </View>

          <View className="rounded-2xl bg-gray-50 px-4">
            <InfoRow
              label={t('manager_branch.avg_rating')}
              value={branch.avgRating?.toFixed(1)}
            />
            <InfoRow
              label={t('manager_branch.total_reviews')}
              value={branch.totalReviewCount ?? 0}
            />
            <View className="flex-row justify-between border-b border-gray-100 py-3">
              <Text className="text-sm text-gray-500">
                {t('manager_branch.verified')}
              </Text>
              <View
                className={`rounded-full px-3 py-0.5 ${branch.isVerified ? 'bg-green-100' : 'bg-gray-200'}`}
              >
                <Text
                  className={`text-xs font-semibold ${branch.isVerified ? 'text-green-700' : 'text-gray-500'}`}
                >
                  {branch.isVerified
                    ? t('manager_branch.verified')
                    : t('manager_branch.not_verified')}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between py-3">
              <Text className="text-sm text-gray-500">
                {t('manager_branch.active')}
              </Text>
              <View
                className={`rounded-full px-3 py-0.5 ${branch.isActive ? 'bg-green-100' : 'bg-red-100'}`}
              >
                <Text
                  className={`text-xs font-semibold ${branch.isActive ? 'text-green-700' : 'text-red-600'}`}
                >
                  {branch.isActive
                    ? t('manager_branch.active')
                    : t('manager_branch.inactive')}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
