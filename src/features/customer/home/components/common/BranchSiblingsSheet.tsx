import { AnimatedBackdrop } from '@components/AnimatedBackdrop';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ActiveBranch } from '@features/customer/home/types/branch';
import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

interface BranchSiblingsSheetProps {
  visible: boolean;
  vendorName: string;
  siblings: ActiveBranch[];
  imageMap: Record<number, string>;
  onClose: () => void;
  onSelectBranch: (branch: ActiveBranch) => void;
}

const SiblingRow = ({
  branch,
  imageMap,
  onPress,
}: {
  branch: ActiveBranch;
  imageMap: Record<number, string>;
  onPress: () => void;
}): JSX.Element => {
  const distanceLabel =
    branch.distanceKm != null
      ? branch.distanceKm < 1
        ? `${Math.round(branch.distanceKm * 1000)} m`
        : `${branch.distanceKm.toFixed(1)} km`
      : null;

  void imageMap; // prefetched in useStallSearch; currently unused in row UI

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-gray-100 px-5 py-4"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-lime-50">
        <Ionicons name="restaurant-outline" size={18} color="#4D7C0F" />
      </View>

      <View className="flex-1">
        <Text
          className="text-[13px] font-semibold text-gray-900"
          numberOfLines={1}
        >
          {branch.name}
        </Text>
        <Text className="mt-0.5 text-[11px] text-gray-500" numberOfLines={1}>
          {branch.addressDetail}
        </Text>
        <View className="mt-1 flex-row items-center gap-2">
          <MaterialCommunityIcons
            name="star"
            size={11}
            color="rgba(250,204,21,1)"
          />
          <Text className="text-[11px] font-semibold text-[rgba(250,204,21,1)]">
            {branch.avgRating.toFixed(1)}
          </Text>
          <Text className="text-[11px] text-gray-400">
            ({branch.totalReviewCount})
          </Text>
          {distanceLabel && (
            <>
              <Text className="text-gray-300">·</Text>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={11}
                color="#9CA3AF"
              />
              <Text className="text-[11px] text-gray-400">{distanceLabel}</Text>
            </>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
};

export const BranchSiblingsSheet = ({
  visible,
  vendorName,
  siblings,
  imageMap,
  onClose,
  onSelectBranch,
}: BranchSiblingsSheetProps): JSX.Element => {
  const { t } = useTranslation();
  const backdropProgress = useSharedValue(0);
  const backdropVisible = useRef(false);

  useEffect(() => {
    if (visible) {
      backdropVisible.current = true;
      backdropProgress.value = withTiming(1, { duration: 250 });
    } else {
      backdropProgress.value = withTiming(0, { duration: 200 });
    }
  }, [visible, backdropProgress]);

  return (
    <>
      <AnimatedBackdrop
        mounted={backdropVisible.current || visible}
        visible={visible}
        onPress={onClose}
        progress={backdropProgress}
      />
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white"
          style={{ maxHeight: '75%' }}
        >
          {/* Header */}
          <View className="items-center border-b border-gray-200 px-6 py-4">
            <Text className="text-[15px] font-semibold text-gray-900">
              {t('search.siblings.title')}
            </Text>
            <Text
              className="mt-0.5 text-[12px] text-gray-500"
              numberOfLines={1}
            >
              {vendorName}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-5 top-4"
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Sibling list */}
          {siblings.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-[13px] text-gray-400">
                {t('search.siblings.empty')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={siblings}
              keyExtractor={(b) => String(b.branchId)}
              renderItem={({ item }) => (
                <SiblingRow
                  branch={item}
                  imageMap={imageMap}
                  onPress={() => {
                    onClose();
                    onSelectBranch(item);
                  }}
                />
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </>
  );
};
