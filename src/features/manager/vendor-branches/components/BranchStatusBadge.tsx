import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  isActive: boolean;
  isVerified: boolean;
}

export const BranchStatusBadge = ({
  isActive,
  isVerified,
}: Props): React.JSX.Element => {
  const { t } = useTranslation();
  return (
    <View className="flex-row gap-1.5">
      <View
        className={`rounded-full px-2.5 py-0.5 ${isActive ? 'bg-green-100' : 'bg-red-100'}`}
      >
        <Text
          className={`text-xs font-semibold ${isActive ? 'text-green-700' : 'text-red-600'}`}
        >
          {isActive
            ? t('vendor_branches.active')
            : t('vendor_branches.inactive')}
        </Text>
      </View>
      <View
        className={`rounded-full px-2.5 py-0.5 ${isVerified ? 'bg-blue-100' : 'bg-gray-100'}`}
      >
        <Text
          className={`text-xs font-semibold ${isVerified ? 'text-blue-700' : 'text-gray-500'}`}
        >
          {isVerified
            ? t('vendor_branches.verified')
            : t('vendor_branches.not_verified')}
        </Text>
      </View>
    </View>
  );
};
