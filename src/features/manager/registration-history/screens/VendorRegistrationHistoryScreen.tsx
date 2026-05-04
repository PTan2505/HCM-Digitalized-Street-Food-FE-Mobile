import Header from '@components/Header';
import { useVendorInfo } from '@manager/vendor-branches/hooks/useVendorBranches';
import type { ManagerBranch } from '@manager/branch/branch.types';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LicenseTone = 'success' | 'error' | 'warning' | 'default';

const licenseBadgeClasses: Record<LicenseTone, string> = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  default: 'border-slate-200 bg-slate-50',
};

const licenseTextClasses: Record<LicenseTone, string> = {
  success: 'text-green-700',
  error: 'text-red-700',
  warning: 'text-amber-700',
  default: 'text-slate-700',
};

const getLicenseDescriptor = (
  status: string | null,
  t: (key: string) => string
): { label: string; tone: LicenseTone } => {
  if (status === 'Accept')
    return { label: t('registration_history.license_accept'), tone: 'success' };
  if (status === 'Reject')
    return { label: t('registration_history.license_reject'), tone: 'error' };
  if (status === 'Pending' || status === null)
    return {
      label: t('registration_history.license_pending'),
      tone: 'warning',
    };
  return {
    label: t('registration_history.license_not_submitted'),
    tone: 'default',
  };
};

const RegistrationRow = ({
  branch,
  onPress,
}: {
  branch: ManagerBranch;
  onPress: () => void;
}): React.JSX.Element => {
  const { t } = useTranslation();
  const license = getLicenseDescriptor(branch.licenseStatus, t);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3 rounded-2xl bg-white p-4 shadow-sm"
      activeOpacity={0.7}
    >
      <View className="mb-2 flex-row items-start justify-between">
        <Text
          className="flex-1 pr-2 text-base font-bold text-gray-900"
          numberOfLines={1}
        >
          {branch.name}
        </Text>
        <View
          className={`rounded-full border px-2.5 py-0.5 ${licenseBadgeClasses[license.tone]}`}
        >
          <Text
            className={`text-xs font-bold ${licenseTextClasses[license.tone]}`}
          >
            {license.label}
          </Text>
        </View>
      </View>

      <Text className="mb-2 text-xs text-gray-500" numberOfLines={2}>
        {[branch.addressDetail, branch.ward].filter(Boolean).join(', ')}
      </Text>

      <View className="flex-row gap-2">
        <View
          className={`rounded-full border px-2 py-0.5 ${
            branch.isVerified
              ? 'border-green-200 bg-green-50'
              : 'border-slate-200 bg-slate-50'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              branch.isVerified ? 'text-green-700' : 'text-slate-600'
            }`}
          >
            {branch.isVerified
              ? t('registration_history.verified')
              : t('registration_history.unverified')}
          </Text>
        </View>
        <View
          className={`rounded-full border px-2 py-0.5 ${
            branch.isActive
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              branch.isActive ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {branch.isActive
              ? t('registration_history.active')
              : t('registration_history.inactive')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const VendorRegistrationHistoryScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const { data: vendorInfo, isLoading, isError, refetch } = useVendorInfo();

  const branches = vendorInfo?.branches ?? [];

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={t('registration_history.title')}
        onBackPress={() => navigation.goBack()}
      />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9FD356" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-base text-gray-500">
            {t('registration_history.error_load')}
          </Text>
          <TouchableOpacity
            className="rounded-full bg-primary px-6 py-2"
            onPress={() => void refetch()}
          >
            <Text className="font-semibold text-white">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : branches.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text className="text-center text-base text-gray-500">
            {t('registration_history.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={branches}
          keyExtractor={(item) => String(item.branchId)}
          renderItem={({ item }) => (
            <RegistrationRow
              branch={item}
              onPress={() =>
                navigation.navigate('VendorBranchDetail', {
                  branchId: item.branchId,
                })
              }
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onRefresh={() => void refetch()}
          refreshing={false}
        />
      )}
    </SafeAreaView>
  );
};
