import type { ManagerBranch } from '@manager/branch/branch.types';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  branches: ManagerBranch[];
  selectedBranchId: number | undefined;
  onSelect: (branchId: number | undefined) => void;
}

export const BranchFilterPicker = ({
  branches,
  selectedBranchId,
  onSelect,
}: Props): React.JSX.Element => {
  const { t } = useTranslation();
  return (
    <View className="border-b border-gray-100 bg-white py-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        <TouchableOpacity
          onPress={() => onSelect(undefined)}
          className={`rounded-full px-3 py-1.5 ${selectedBranchId === undefined ? 'bg-primary' : 'bg-gray-100'}`}
        >
          <Text
            className={`text-xs font-semibold ${selectedBranchId === undefined ? 'text-white' : 'text-gray-600'}`}
          >
            {t('manager_orders.all_branches')}
          </Text>
        </TouchableOpacity>
        {branches.map((b) => (
          <TouchableOpacity
            key={b.branchId}
            onPress={() => onSelect(b.branchId)}
            className={`rounded-full px-3 py-1.5 ${selectedBranchId === b.branchId ? 'bg-primary' : 'bg-gray-100'}`}
          >
            <Text
              className={`text-xs font-semibold ${selectedBranchId === b.branchId ? 'text-white' : 'text-gray-600'}`}
              numberOfLines={1}
            >
              {b.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
