import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ManagerBranch } from '@manager/branch/branch.types';
import React, { type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  branches: ManagerBranch[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  emptyText?: string;
}

export const BranchSelector = ({
  branches,
  selectedIds,
  onChange,
  emptyText,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  const toggleAll = (): void => {
    if (selectedIds.length === branches.length) onChange([]);
    else onChange(branches.map((b) => b.branchId));
  };

  const toggle = (id: number): void => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((b) => b !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (branches.length === 0) {
    return (
      <View className="rounded-xl bg-gray-50 p-3">
        <Text className="text-sm text-gray-400">
          {emptyText ?? t('manager_campaigns.no_joinable_branches')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-[#616161]">
          {t('manager_campaigns.select_branches')}
        </Text>
        <TouchableOpacity onPress={toggleAll}>
          <Text className="text-xs font-semibold text-primary">
            {selectedIds.length === branches.length
              ? t('manager_campaigns.deselect_all')
              : t('manager_campaigns.select_all')}
          </Text>
        </TouchableOpacity>
      </View>
      <View className="gap-2">
        {branches.map((branch) => {
          const isSelected = selectedIds.includes(branch.branchId);
          return (
            <TouchableOpacity
              key={branch.branchId}
              onPress={() => toggle(branch.branchId)}
              className={`flex-row items-center justify-between rounded-xl border p-3 ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <Text
                className={`flex-1 pr-2 text-sm font-medium ${
                  isSelected ? 'text-primary' : 'text-gray-800'
                }`}
                numberOfLines={1}
              >
                {branch.name}
              </Text>
              <View
                className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}
              >
                {isSelected ? (
                  <MaterialCommunityIcons
                    name="check"
                    size={14}
                    color="#fff"
                  />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
